// Utility for generating a still-frame thumbnail from a recorded video blob.
// Used by the preview recordings list to show a visual preview of each clip.

export interface VideoThumbnailResult {
  /** JPEG data URL of the captured frame, or null when capture failed. */
  dataUrl: string | null;
  /** Intrinsic video width in pixels (0 when unknown). */
  width: number;
  /** Intrinsic video height in pixels (0 when unknown). */
  height: number;
}

/**
 * Decodes a video blob in an offscreen <video> element, seeks slightly past the
 * start (to skip a black first frame) and draws that frame to a canvas.
 *
 * Works for WebM clips produced by MediaRecorder, which often report an
 * Infinite duration until fully buffered — seeking to a small fixed offset is
 * resilient to that.
 *
 * @param blob Recorded video blob (webm/mp4).
 * @param maxWidth Max thumbnail width; the frame is downscaled to fit.
 * @param seekTime Offset in seconds to capture (clamped to half the duration).
 */
export function generateVideoThumbnail(
  blob: Blob,
  maxWidth = 320,
  seekTime = 0.1,
): Promise<VideoThumbnailResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.src = url;

    let settled = false;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      try {
        video.load();
      } catch {
        /* ignore */
      }
    };

    const finish = (dataUrl: string | null) => {
      if (settled) return;
      settled = true;
      const result: VideoThumbnailResult = {
        dataUrl,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      };
      cleanup();
      resolve(result);
    };

    const captureFrame = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        finish(null);
        return;
      }
      try {
        const scale = Math.min(1, maxWidth / w);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        finish(null);
      }
    };

    video.addEventListener("error", () => finish(null));

    video.addEventListener(
      "loadeddata",
      () => {
        const duration = video.duration;
        const target = Number.isFinite(duration) && duration > 0
          ? Math.min(seekTime, duration / 2)
          : seekTime;
        try {
          video.currentTime = target;
        } catch {
          // Seeking unsupported — capture whatever first frame we have.
          captureFrame();
        }
      },
      { once: true },
    );

    video.addEventListener("seeked", () => captureFrame(), { once: true });

    // Safety net: if metadata/seek never resolves, try a best-effort capture.
    setTimeout(() => {
      if (!settled) captureFrame();
    }, 5000);
  });
}
