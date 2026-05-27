# Gameplay Recording & MP4 Export

## Overview
The preview tools let users record a playable running in the recorder popup and export a trimmed clip as MP4. Recording always produces a WebM (or MP4 on Safari) blob through `MediaRecorder`; the export/trim step then re-encodes that blob to a final MP4 (H.264 + AAC).

The export step has **two interchangeable backends** behind a single public method:

1. **WebCodecs (primary)** — via the `mediabunny` library. Hardware-accelerated, fast, and loaded as a small lazy chunk (~163 KB gzip).
2. **FFmpeg.wasm (fallback)** — the original software encoder. Reliable everywhere but slow and requires a one-time ~31 MB core download.

`PreviewService.trimRecordedVideo()` picks the fast path when the browser can natively encode H.264 + AAC, and transparently falls back to FFmpeg otherwise (e.g. Firefox) or if the WebCodecs path throws.

## Recording Pipeline

Implemented in `recorder-popup.ts` + `PreviewService.startPreviewRecording()`.

1. The recorder opens in a dedicated popup window (`/recorder-popup`) that hosts the playable in an `<iframe>`.
2. `getDisplayMedia()` captures the current tab. When `CropTarget` is available (Chromium), capture is cropped to the `.iframe-container` element; otherwise the frame is cropped manually on a canvas.
3. Frames are redrawn onto an off-screen `<canvas>` at the selected quality/output size and frame rate; `canvas.captureStream()` is mixed with the display audio track.
4. A `MediaRecorder` encodes the mixed stream to WebM (preferred) using a bitrate derived from resolution × frame rate.
5. On stop, the resulting blob is posted to the opener window as a `RECORDING_COMPLETE` message and surfaced in `preview-video-modal.ts`.

`startPreviewRecording()` returns a `PreviewRecordingController` with `{ startedAt, result, stop(), cancel() }`.

## Export / Trim Pipeline

Implemented in `preview-video-modal.ts` + `PreviewService.trimRecordedVideo()`.

1. The modal shows the recorded clip with start/end trim sliders.
2. On open, `prepareMp4Exporter()` warms up the encoder. If the fast path is available it resolves instantly (no download); otherwise it preloads the FFmpeg core.
3. On export, `trimRecordedVideo(blob, startSec, endSec, callbacks)` dispatches to the appropriate backend and returns a `PreviewRecordingResult` (`{ blob, mimeType, fileExtension, durationMs, width, height, startedAt }`).

### Feature detection — `isFastMp4ExportAvailable()`
Cached for the session. Returns `true` only when **all** of the following hold:
- `VideoEncoder` and `AudioEncoder` exist on `globalThis` (WebCodecs present)
- `mediabunny.canEncodeVideo('avc')` resolves `true`
- `mediabunny.canEncodeAudio('aac')` resolves `true`

Requiring both `avc` and `aac` keeps the output predictable (always includes audio when present). Browsers with H.264 but no native AAC encoder therefore use FFmpeg.

### WebCodecs path — `trimRecordedVideoWithWebCodecs()`
Uses the `mediabunny` `Conversion` API (dynamically imported):

```typescript
const input = new Input({ source: new BlobSource(sourceBlob), formats: ALL_FORMATS });
const output = new Output({
  format: new Mp4OutputFormat({ fastStart: 'in-memory' }), // moov atom up front, web-playable
  target: new BufferTarget(),
});
const conversion = await Conversion.init({
  input,
  output,
  video: { codec: 'avc', bitrate: QUALITY_HIGH },
  audio: { codec: 'aac', bitrate: 128_000 },
  trim: { start: safeStart, end: safeEnd },
});
if (!conversion.isValid) throw new Error(/* discardedTracks reasons */);
conversion.onProgress = (p) => callbacks.onProgress?.(p);
await conversion.execute();
const outputBlob = new Blob([output.target.buffer], { type: 'video/mp4' });
```

`mediabunny` handles demuxing the WebM, decoding/re-encoding video and audio via WebCodecs, trimming, and MP4 muxing internally — which is why this replaced an earlier hand-rolled WebCodecs attempt that struggled with audio and timestamps.

### FFmpeg fallback — `trimRecordedVideoWithFfmpeg()`
The original pipeline, unchanged. Loads `@ffmpeg/*` (core/wasm/worker as blob URLs), writes the source into the in-memory FS, and runs `libx264 -crf 18 -preset fast` + `aac` with `-movflags +faststart`, applying `-ss`/`-t` for the trim range.

## Flow Diagram

```
Recorder popup (iframe)
        ↓  getDisplayMedia + canvas crop + audio
MediaRecorder → WebM blob
        ↓  postMessage RECORDING_COMPLETE
preview-video-modal (trim sliders)
        ↓  trimRecordedVideo(blob, start, end)
isFastMp4ExportAvailable()?
   ├─ yes → mediabunny Conversion (WebCodecs)  ──┐
   │           └─ on error ─────────────────────┤
   └─ no  ───────────────────────────────────── ┤
                                                 ↓
                                   FFmpeg.wasm (libx264 + aac)
                                                 ↓
                                       MP4 blob → download
```

## Key Files & Methods
- `src/pages/preview/recorder-popup.ts` — recorder UI and capture surface
- `src/pages/preview/preview-video-modal.ts` — trim UI, warmup, export trigger
- `src/services/PreviewService.ts`:
  - `startPreviewRecording(cropElement, options)` — capture → WebM
  - `trimRecordedVideo(blob, startSec, endSec, callbacks)` — dispatcher
  - `isFastMp4ExportAvailable()` — cached WebCodecs capability check
  - `trimRecordedVideoWithWebCodecs(...)` — mediabunny path
  - `trimRecordedVideoWithFfmpeg(...)` — FFmpeg fallback
  - `prepareMp4Exporter(callbacks)` — warmup (skips FFmpeg download on fast path)

## Bundle Impact
- `mediabunny` is **dynamically imported**, so it ships as a separate lazy chunk (~639 KB raw / ~163 KB gzip) loaded only when the export modal opens or export runs — never in the entry bundle.
- The FFmpeg core (~31 MB wasm) is only fetched when the fallback is actually used.

## Testing

1. **Chromium (Chrome/Edge)** — record a playable, trim, Export MP4. Expect: no 31 MB download, fast export, console shows `WebCodecs MP4 export support: avc=true, aac=true -> true`. Verify audio is present and the trim range is accurate.
2. **Firefox** — same flow should silently use FFmpeg (`avc=false`/`aac=false` in console) and produce the same result as before.
3. **Fallback on error** — force `trimRecordedVideoWithWebCodecs` to throw; confirm the status shows "Switching to the compatibility encoder..." and FFmpeg completes the export.

## Notes
- Fast path is gated on native AAC encoding. To enable WebCodecs export on browsers that support `avc` but not `aac` (some Safari/Firefox builds), register the `@mediabunny/aac-encoder` polyfill when `canEncodeAudio('aac')` is `false` instead of falling back to FFmpeg.
- `MediaRecorder` cursor capture (`cursor: 'never'`) is only honored for tab capture in Chromium — see capture diagnostics logged in `startPreviewRecording`.
