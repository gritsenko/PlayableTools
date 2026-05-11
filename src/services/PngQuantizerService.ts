import { injectable } from "fw";
import UPNG from "upng-js";

export interface QuantizeResult {
  blob: Blob;
  width: number;
  height: number;
}

@injectable()
export class PngQuantizerService {
  async quantize(file: Blob, maxColors = 256): Promise<QuantizeResult> {
    const bitmap = await createImageBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;

    const canvas = typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
    const ctx = (canvas as any).getContext("2d") as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;
    if (!ctx) throw new Error("Could not obtain a 2D canvas context");

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();

    const imageData = ctx.getImageData(0, 0, width, height);
    const encoded = UPNG.encode(
      [imageData.data.buffer as ArrayBuffer],
      width,
      height,
      maxColors,
    );

    return {
      blob: new Blob([encoded], { type: "image/png" }),
      width,
      height,
    };
  }
}
