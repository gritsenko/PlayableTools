import { injectable } from "fw";
import pako from "pako";
// @ts-ignore
import pakoMin from "../assets/pako_inflate.min.js?raw";

export type ImbaPackerEncoding = "base64" | "base122";

const BASE122_ILLEGAL_CHARACTERS = [0, 10, 13, 34, 38, 92];
const BASE122_SHORTENED_INDEX = 0b111;

@injectable()
export class ImbaPackerService {
  // Add your service methods here
  constructor() {}

  /**
   * Compresses the file with pako, encodes it for inline transport, and generates HTML with loader logic.
   * @param file HTML file to pack
   * @returns Promise<{fileName: string, html: string}>
   */
  async pack(file: File, encoding: ImbaPackerEncoding = "base64"): Promise<{fileName: string, html: string}> {
    const originalName = file.name.replace(/\.html?$/i, "");
    const fileContent = await file.text();
    const compressed = pako.deflate(fileContent);
    const isBase122 = encoding === "base122";
    const payload = isBase122
      ? this._arrayBufferToBase122(compressed)
      : this._arrayBufferToBase64(compressed);
    const decodeFunction = isBase122
      ? this._getBase122DecodeFunctionSource()
      : this._getBase64DecodeFunctionSource();
    const payloadSource = isBase122
      ? '<div id="imba-packed-payload" hidden data-payload="' + this._escapeForHtmlAttribute(payload) + '"></div>'
      : '<script>const payload = ' + this._escapeForInlineScript(payload) + ';<\/script>';
    const payloadLoader = isBase122
      ? '  const payload = document.getElementById(\'imba-packed-payload\').getAttribute(\'data-payload\') || \'\';\n'
      : '  const payload = window.payload;\n';

    const loaderHtml =
      '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8"><title>' +
      originalName +
      ' (Packed)</title></head><body>' +
      payloadSource +
      '<script>' + pakoMin + '</script>' +
      '<script>' +
      decodeFunction + '\n' +
      '(function() {\n' +
      payloadLoader +
      '  const compressed = decodePayload(payload);\n' +
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

  private _arrayBufferToBase122(buffer: Uint8Array): string {
    const characters: string[] = [];
    let currentIndex = 0;
    let currentBit = 0;

    const get7Bits = (): number | false => {
      if (currentIndex >= buffer.length) {
        return false;
      }

      const firstByte = buffer[currentIndex];
      let sevenBits = ((0b11111110 >>> currentBit) & firstByte) << currentBit;
      sevenBits >>= 1;

      currentBit += 7;
      if (currentBit < 8) {
        return sevenBits;
      }

      currentBit -= 8;
      currentIndex++;

      if (currentIndex >= buffer.length) {
        return sevenBits;
      }

      const secondByte = buffer[currentIndex];
      const nextBits = secondByte >> (8 - currentBit);
      return sevenBits | nextBits;
    };

    for (let bits = get7Bits(); bits !== false; bits = get7Bits()) {
      const illegalIndex = BASE122_ILLEGAL_CHARACTERS.indexOf(bits);
      if (illegalIndex === -1) {
        characters.push(String.fromCharCode(bits));
        continue;
      }

      let nextBits = get7Bits();
      let firstByte = 0b11000010;
      let secondByte = 0b10000000;

      if (nextBits === false) {
        firstByte |= BASE122_SHORTENED_INDEX << 2;
        nextBits = bits;
      } else {
        firstByte |= illegalIndex << 2;
      }

      firstByte |= (nextBits & 0b01000000) > 0 ? 1 : 0;
      secondByte |= nextBits & 0b00111111;

      const codePoint = ((firstByte & 0b00011111) << 6) | (secondByte & 0b00111111);
      characters.push(String.fromCharCode(codePoint));
    }

    return characters.join("");
  }

  private _escapeForInlineScript(value: string): string {
    return JSON.stringify(value).replace(/</g, "\\u003C");
  }

  private _escapeForHtmlAttribute(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private _getBase64DecodeFunctionSource(): string {
    return [
      'function decodePayload(base64) {',
      '  const binary = atob(base64);',
      '  const bytes = new Uint8Array(binary.length);',
      '  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);',
      '  return bytes;',
      '}'
    ].join('\n');
  }

  private _getBase122DecodeFunctionSource(): string {
    return [
      'function decodePayload(base122) {',
      '  const illegal = [0,10,13,34,38,92];',
      '  const decoded = new Uint8Array(Math.ceil(base122.length * 1.75));',
      '  let offset = 0;',
      '  let currentByte = 0;',
      '  let bitOffset = 0;',
      '  function push7(bits) {',
      '    bits <<= 1;',
      '    currentByte |= bits >>> bitOffset;',
      '    bitOffset += 7;',
      '    if (bitOffset >= 8) {',
      '      decoded[offset++] = currentByte;',
      '      bitOffset -= 8;',
      '      currentByte = (bits << (7 - bitOffset)) & 255;',
      '    }',
      '  }',
      '  for (let i = 0; i < base122.length; i++) {',
      '    const codePoint = base122.charCodeAt(i);',
      '    if (codePoint > 127) {',
      '      const illegalIndex = (codePoint >>> 8) & 0b111;',
      '      if (illegalIndex !== 0b111) push7(illegal[illegalIndex]);',
      '      push7(codePoint & 127);',
      '    } else {',
      '      push7(codePoint);',
      '    }',
      '  }',
      '  return decoded.subarray(0, offset);',
      '}'
    ].join('\n');
  }
}
