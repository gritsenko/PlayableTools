import { injectable } from "fw";
import pako from "pako";

@injectable()
export class PreviewService {
  // Example: fetch playable ad data, generate shareable links, etc.
  getShareableLink(adId: string, size: string, orientation: string): string {
    // This is a stub. Replace with real logic as needed.
    const params = new URLSearchParams({ adId, size, orientation });
    return `${window.location.origin}/preview?${params.toString()}`;
  }

  encodeUrl(longUrl: string): string {
    const compressed = pako.deflate(longUrl) as Uint8Array;
    const str = String.fromCharCode(...Array.from(compressed));
    const base64 = btoa(str);
    const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    return urlSafe;
  }

  decodeUrl(encodedStr: string): string {
    let base64 = encodedStr.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const compressedStr = atob(base64);
    const compressed = new Uint8Array([...compressedStr].map(char => char.charCodeAt(0)));
    try {
      const originalUrl = pako.inflate(compressed, { to: "string" });
      return originalUrl;
    } catch (err) {
      return String(err);
    }
  }

  /**
   * Converts a GitHub file URL to its raw content URL.
   * Example:
   * https://github.com/user/repo/blob/main/path/file.html
   * -> https://raw.githubusercontent.com/user/repo/refs/heads/main/path/file.html
   */
  githubToRawUrl(githubUrl: string): string | null {
    const match = githubUrl.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/
    );
    if (!match) return null;
    const [, owner, repo, branch, path] = match;
    // Use refs/heads/branch for raw URL
    return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${path}`;
  }

  /**
   * Downloads the content of a raw URL as a string.
   */
  async fetchRawContent(rawUrl: string): Promise<string> {
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return await response.text();
  }

  // In-memory uploaded HTML content (not persisted). When set, components can preview it.
  private _uploadedContent: string | null = null;
  private _uploadedListeners = new Set<(content: string | null) => void>();

  setUploadedContent(content: string | null) {
    this._uploadedContent = content;
    for (const cb of Array.from(this._uploadedListeners)) cb(content);
  }

  getUploadedContent(): string | null {
    return this._uploadedContent;
  }

  onUploadedContentChange(cb: (content: string | null) => void): () => void {
    this._uploadedListeners.add(cb);
    // return unsubscribe
    return () => this._uploadedListeners.delete(cb);
  }

  /**
   * Handles file upload from user's PC and reads HTML content
   */
  async handleFileUpload(file: File): Promise<string> {
    // Validate file type
    if (!this.isValidHtmlFile(file)) {
      throw new Error('Please select a valid HTML file (.html, .htm)');
    }

    // Validate file size (limit to 10MB)
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size must be less than ${maxSizeInMB}MB`);
    }

    try {
      const content = await this.readFileAsText(file);
      
      // Basic HTML validation
      if (!this.isValidHtmlContent(content)) {
        throw new Error('The file does not appear to contain valid HTML content');
      }

      // Set the uploaded content so components can access it
      this.setUploadedContent(content);
      
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to read the uploaded file');
    }
  }

  /**
   * Validates if the file is an HTML file based on extension
   */
  private isValidHtmlFile(file: File): boolean {
    const validExtensions = ['.html', '.htm'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Reads a file as text using FileReader
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Basic validation to check if content contains HTML
   */
  private isValidHtmlContent(content: string): boolean {
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return false;
    }
    
    // Check for basic HTML structure
    const hasHtmlTags = /<html|<!DOCTYPE|<head|<body|<div|<script|<style/i.test(trimmedContent);
    return hasHtmlTags;
  }

  /**
   * Clears the uploaded content
   */
  clearUploadedContent(): void {
    this.setUploadedContent(null);
  }

  /**
   * Gets file info for uploaded content
   */
  getUploadedFileInfo(): { hasContent: boolean; size?: number } {
    const content = this.getUploadedContent();
    return {
      hasContent: content !== null,
      size: content ? new Blob([content]).size : undefined
    };
  }
}
