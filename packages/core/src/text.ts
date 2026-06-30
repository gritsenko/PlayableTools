// Universal string/byte helpers — no host globals beyond the WHATWG TextEncoder
// (present in both browsers and Node). base64 is implemented by hand so the core
// does not depend on the browser-only `btoa`.

export function utf8Encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function utf8ByteLength(text: string): number {
  return utf8Encode(text).length;
}

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Standard base64 (RFC 4648) of a byte array — byte-identical to btoa(binary). */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    out += B64_CHARS[b0 >> 2];
    out += B64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += i + 1 < len ? B64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    out += i + 2 < len ? B64_CHARS[b2 & 0x3f] : "=";
  }
  return out;
}
