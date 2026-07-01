import { injectable } from "fw";
import { packImba } from "@gritsenko/cta-core";
import type { ImbaEncoding } from "@gritsenko/cta-core";

export type ImbaPackerEncoding = ImbaEncoding;

/**
 * Browser adapter over the core imba packer. Reads the uploaded File to text and
 * delegates the compression + loader generation to @gritsenko/cta-core.
 */
@injectable()
export class ImbaPackerService {
  async pack(
    file: File,
    encoding: ImbaPackerEncoding = "base64"
  ): Promise<{ fileName: string; html: string }> {
    const fileContent = await file.text();
    return packImba(fileContent, file.name, encoding);
  }
}
