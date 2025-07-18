export interface Base64FileModel {
  file: File;
  name: string;
  mimeType: string;
  dataUrl: string;
  originalSize: number; // in bytes
  base64Size: number; // in bytes
}

import { injectable, ServiceLifetime } from "fw";

@injectable(ServiceLifetime.Singleton)
export class Base64ConverterService {
  async convertFilesToBase64(files: File[], onProgress?: (progress: number) => void): Promise<Base64FileModel[]> {
    const results: Base64FileModel[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mimeType = file.type || 'application/octet-stream';
      const dataUrl = await this.fileToDataUrl(file);
      // Calculate base64 size (actual base64 string length in bytes)
      const base64String = dataUrl.split(',')[1] || '';
      results.push({
        file,
        name: file.name,
        mimeType,
        dataUrl,
        originalSize: file.size,
        base64Size: base64String.length,
      });
      if (onProgress) {
        onProgress(Math.round(((i + 1) / files.length) * 100));
      }
    }
    return results;
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
