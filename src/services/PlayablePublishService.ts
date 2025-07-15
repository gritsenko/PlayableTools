import type { PlatformConfig, PlayableProcessOptions } from './types';

export class PlayablePublishService {
  private config: PlatformConfig[] = [];

  /**
   * Loads the platforms config from the provided JSON object.
   */
  loadConfig(configJson: any) {
    if (Array.isArray(configJson.platforms)) {
      this.config = configJson.platforms;
    } else {
      throw new Error('Invalid config: platforms array missing');
    }
  }

  /**
   * Returns the loaded platform configs.
   */
  getPlatforms(): PlatformConfig[] {
    return this.config;
  }

  /**
   * Processes an uploaded HTML file according to the platform rules.
   * @param htmlContent The HTML file content as string
   * @param platformName The name of the platform to process for
   * @param options Optional processing options
   * @returns Processed HTML as string
   */
  processHtml(htmlContent: string, platformName: string, options?: PlayableProcessOptions): string {
    const platform = this.config.find(p => p.Name === platformName);
    if (!platform) throw new Error(`Platform '${platformName}' not found in config`);

    let resultHtml = htmlContent;

    // Inject scripts if specified
    if (platform.InjeectScripts && Array.isArray(platform.InjeectScripts)) {
      resultHtml = this.injectScripts(resultHtml, platform.InjeectScripts);
    }

    // Output index.html name replacement
    if (platform.OutputIndexHtmlName && options?.name) {
      // Optionally handle renaming logic here
      // This is just a placeholder for actual file renaming logic
      // e.g., options.outputFileName = platform.OutputIndexHtmlName.replace('%name%', options.name);
    }

    // Additional processing rules can be added here (e.g., ExtractScripts, ExtraFiles, Sizes, etc.)

    return resultHtml;
  }

  /**
   * Injects script tags before </body> for each script in the list.
   */
  private injectScripts(html: string, scripts: string[]): string {
    const scriptTags = scripts.map(src => `<script src=\"${src}\"></script>`).join('\n');
    if (/<\/body>/i.test(html)) {
      return html.replace(/<\/body>/i, `${scriptTags}\n</body>`);
    } else {
      return html + scriptTags;
    }
  }
}
