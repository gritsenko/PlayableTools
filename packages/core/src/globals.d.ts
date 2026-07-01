// Minimal ambient declarations for the universal text codecs (present in both
// browsers and Node) so the core can convert between strings and bytes without
// pulling in the DOM or @types/node libs.
declare class TextEncoder {
  encode(input?: string): Uint8Array;
}
declare class TextDecoder {
  constructor(label?: string);
  decode(input?: Uint8Array): string;
}
