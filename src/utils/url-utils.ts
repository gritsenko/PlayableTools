// Utility for URL rewriting and subfolder deployment support
export class UrlUtils {
  /**
   * Returns the base directory URL for subfolder deployments, ensuring trailing slash.
   */
  static getBaseDir(): string {
    const basePath = window.location.origin + window.location.pathname.replace(/([?#].*)$/, "");
    return basePath.endsWith("/") ? basePath : basePath + "/";
  }

  /**
   * Builds a fetch URL for a resource in a subfolder deployment.
   * @param subPath Subfolder path (e.g., 'publish-data/')
   * @param resource Resource filename (e.g., 'cta.Facebook.js')
   */
  static buildFetchUrl(subPath: string, resource: string): string {
    return this.getBaseDir() + subPath + resource;
  }
}
