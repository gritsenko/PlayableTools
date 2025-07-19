import { injectable } from "fw";
import pako from "pako";
// @ts-ignore
import pakoMin from "../assets/pako_inflate.min.js?raw";

@injectable()
export class ImbaPackerService {
  // Add your service methods here
  constructor() {}

  /**
   * Compresses the file with pako, encodes as base64, and generates HTML with loader logic.
   * @param file HTML file to pack
   * @returns Promise<{fileName: string, html: string}>
   */
  async pack(file: File): Promise<{fileName: string, html: string}> {
    const originalName = file.name.replace(/\.html?$/i, "");
    const fileContent = await file.text();
    // Compress with pako (deflate)
    const compressed = pako.deflate(fileContent);
    // Convert to base64
    const base64 = this._arrayBufferToBase64(compressed);
    // Generate loader HTML
    const loaderHtml =
      '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8"><title>' +
      originalName +
      ' (Packed)</title></head><body>' +
      '<script>' + pakoMin + '</script>' +
      '<script>' +
      '// Loader logic\n' +
      'const b64 = "' + base64 + '";\n' +
      'function b64ToUint8Array(b64) {\n' +
      '  const bin = atob(b64);\n' +
      '  const arr = new Uint8Array(bin.length);\n' +
      '  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);\n' +
      '  return arr;\n' +
      '}\n' +
      '(function() {\n' +
      '  const compressed = b64ToUint8Array(b64);\n' +
      '  const html = window.pako.inflate(compressed, { to: \'string\' });\n' +
      '  document.open();\n' +
      '  document.write(html);\n' +
      '  document.close();\n' +
      '})();\n' +
      '<\/script></body></html>';
    return {
      fileName: `${originalName}-packed.html`,
      html: loaderHtml
    };
  }

  private _arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
