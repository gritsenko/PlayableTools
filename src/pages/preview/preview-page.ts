import {
  ComponentBase,
  customElement,
  html,
  route,
  inject,
  fromQuery,
} from "fw";
import { PreviewService } from "../../services/PreviewService";
import { PortfolioService, type PlayableAdData } from "../../services/PortfolioService";
import { AuthenticationService } from "../../services/AuthenticationService";
import { PlayablePublishService } from "../../services/PlayablePublishService";

@customElement("preview-page")
@route("/preview/:playableId?", {
  title: "Playable Ad Preview | PlayableTools",
  description: "Preview playable ads on different devices and orientations.",
})
export class PreviewPage extends ComponentBase {
  @inject(PreviewService) previewService!: PreviewService;
  @inject(PortfolioService) portfolioService!: PortfolioService;
  @inject(AuthenticationService) authService!: AuthenticationService;
  @inject(PlayablePublishService) publishService!: PlayablePublishService;
  
  routeParams: string[] = [];
  private unsubscribeAuth?: () => void;
  isAuthenticated: boolean = false;
  disconnectedCallback() {
    super.disconnectedCallback?.();
    // On page unload, reload recentUrls for next mount
    const stored = localStorage.getItem("preview-recent-urls");
    if (stored) {
      try {
        this.recentUrls = JSON.parse(stored);
      } catch {
        this.recentUrls = [];
      }
    }
    window.removeEventListener("popstate", this.handlePopState);
    window.removeEventListener("beforeunload", this._onBeforeUnload);
    window.removeEventListener("hashchange", this._onHashChange);
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = undefined;
    // playable-screen-lock handled inside previewer
  }

  urlInput: string = "";
  decodedUrl: string = "";
  recentUrls: string[] = [];
  @fromQuery("url") get encodedUrl(): string | undefined {
    return this._encodedUrlFromQuery;
  }
  private _encodedUrlFromQuery?: string;
  isEncoded: boolean = false;
  uploadedFileName: string = "";
  uploadError: string = "";
  isUploading: boolean = false;
  isLoadingPortfolioPlayable: boolean = false;
  portfolioPlayableId: string | null = null;
  portfolioPlayableData: PlayableAdData | null = null;
  portfolioProjectTitle: string | null = null;

  get hasUnsavedChanges(): boolean {
    return this.previewService.hasUnsavedChanges();
  }

  private _onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (this.hasUnsavedChanges && !(window as any).isSavingPlayable) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  private _onHashChange = (e: HashChangeEvent) => {
    if (this.hasUnsavedChanges && !(window as any).isSavingPlayable) {
      const oldHash = new URL(e.oldURL).hash;
      const newHash = new URL(e.newURL).hash;

      if (newHash !== oldHash && !newHash.startsWith("#preview")) {
        if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
          window.removeEventListener("hashchange", this._onHashChange);
          window.location.hash = oldHash;
          setTimeout(() => {
            window.addEventListener("hashchange", this._onHashChange);
          }, 0);
        }
      }
    }
  };

  connectedCallback() {
    super.connectedCallback();
    void this.initializeAuthState();
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = this.authService.subscribe((reason?: string) => {
      this.isAuthenticated = false;
      this.requestUpdate();
      if (reason) {
        console.log("Preview session expired:", reason);
      }
    });
    
    console.log(`📄 preview-page: connectedCallback, routeParams=${JSON.stringify(this.routeParams)}`);
    
    // Check if we have a playable ID from route params (portfolio playable)
    if (this.routeParams && this.routeParams[0]) {
      const playableId = this.routeParams[0];
      console.log(`📁 preview-page: Loading portfolio playable: ${playableId}`);
      this.portfolioPlayableId = playableId;
      this.portfolioPlayableData = null;
      this.portfolioProjectTitle = null;
      this.loadPortfolioPlayable(playableId);
    } else {
      // No route params - clear portfolio-related state
      this.portfolioPlayableId = null;
      this.portfolioPlayableData = null;
      this.portfolioProjectTitle = null;
      
      // Load recent URLs from localStorage for quick access
      const stored = localStorage.getItem("preview-recent-urls");
      if (stored) {
        try {
          this.recentUrls = JSON.parse(stored);
        } catch {
          this.recentUrls = [];
        }
      }
      // Clear preview state - user will upload or select from recent
      this.isEncoded = false;
      this.decodedUrl = "";
      
      // Check if there's already a filename in PreviewService (e.g. from PortfolioPage)
      const serviceFileName = this.previewService.getUploadedFileName();
      if (serviceFileName) {
        this.uploadedFileName = serviceFileName;
        // portfolioPlayableId is already cleared above
      }
    }
    
    // Listen for browser navigation (back/forward)
    window.addEventListener("popstate", this.handlePopState);
    window.addEventListener("beforeunload", this._onBeforeUnload);
    window.addEventListener("hashchange", this._onHashChange);

    // Force re-render with cleared/initialized state
    this.requestUpdate();

    // playable-screen-lock is handled inside the previewer component
  }

  private async initializeAuthState() {
    try {
      await this.portfolioService.initialize();
      this.isAuthenticated = this.portfolioService.isAuthenticated();
      this.requestUpdate();
    } catch {
      this.isAuthenticated = false;
    }
  }

  private async loadPortfolioPlayable(playableId: string) {
    this.isLoadingPortfolioPlayable = true;
    this.portfolioPlayableId = playableId;
    this.previewService.setPortfolioPlayableId(playableId);
    this.portfolioPlayableData = null;
    this.portfolioProjectTitle = null;
    this.requestUpdate();

    try {
      await this.portfolioService.initialize();
      const playable = await this.portfolioService.getPlayableById(playableId);

      if (playable) {
        console.log(`✅ preview-page: Portfolio playable loaded: ${playable.name}, contentType: ${playable.contentType}`);
        const fileDisplayName = playable.originalName || playable.title || playable.name || "Portfolio Playable";
        this.uploadedFileName = fileDisplayName;

        // Check if playable has binary content (ZIP)
        if (playable.fileBlob) {
          const fileName = fileDisplayName.toLowerCase().endsWith(".zip") ? fileDisplayName : `${fileDisplayName}.zip`;
          const zipFile = new File(
            [playable.fileBlob],
            fileName,
            { type: playable.contentType || 'application/zip' }
          );

          // Use ZIP preview flow (handles all assets via service worker)
          await this.previewService.handleZipUpload(zipFile);
          // Ensure filename is set correctly in service for proper UI display
          this.previewService.setUploadedFileName(fileDisplayName);
          console.log(`✅ preview-page: Loaded ZIP playable with ${zipFile.size} bytes`);
        } else if (playable.content) {
          // Use existing HTML flow for non-ZIP files
          // Load content into PreviewService using same pipeline as file uploads (preset processing + validation)
          await this.previewService.loadHtmlContentFromString(playable.content, this.uploadedFileName);
          console.log(`✅ preview-page: Loaded HTML playable with ${playable.content.length} chars`);
        } else {
          console.error("❌ preview-page: Playable has no content (no blob, no string)");
          this.uploadedFileName = "";
          this.portfolioPlayableData = null;
          this.portfolioProjectTitle = null;
          return;
        }

        this.portfolioPlayableData = playable;

        const projectKey = (playable.project ?? "").trim();
        if (projectKey.length > 0) {
          try {
            // Try to fetch project by ID for its full name
            const project = await this.portfolioService.getProjectById(projectKey);
            this.portfolioProjectTitle = project?.name ?? projectKey;
          } catch {
            // If project fetch fails (not found or not authorized), use the key as title
            this.portfolioProjectTitle = projectKey;
          }
        } else {
          this.portfolioProjectTitle = null;
        }
      } else {
        console.error("❌ preview-page: Playable not found");
        this.uploadedFileName = "";
        this.portfolioPlayableData = null;
        this.portfolioProjectTitle = null;
      }
    } catch (error) {
      console.error("❌ preview-page: Failed to load portfolio playable:", error);
      this.uploadedFileName = "";
      this.portfolioPlayableData = null;
      this.portfolioProjectTitle = null;
    } finally {
      this.isLoadingPortfolioPlayable = false;
      this.requestUpdate();
    }
  }

  // Lock UI moved into PlayablePreviewer component

  handlePopState = () => {
    // Handle back/forward navigation
    if (this.hasUnsavedChanges) return;
    
    // For now, just clear the preview state on navigation
    this.isEncoded = false;
    this.decodedUrl = "";
    this.requestUpdate();
  }

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.isUploading = true;
    this.uploadError = "";
    this.uploadedFileName = "";
    this.portfolioPlayableId = null;
    
    // Clear any existing state when uploading
    this.isEncoded = false;
    this.decodedUrl = "";
    
    // Clear URL from browser history
    window.history.pushState({}, "", window.location.pathname + "#preview");
    
    this.requestUpdate();

    try {
      // Route by extension: ZIP archives are handled by handleZipUpload
      if (file.name.toLowerCase().endsWith('.zip')) {
        await this.previewService.handleZipUpload(file);
      } else {
        await this.previewService.handleFileUpload(file);
      }
      this.uploadedFileName = file.name;
      this.previewService.setUploadedFileName(file.name);
      this.previewService.setPortfolioPlayableId(null);
    } catch (err: any) {
      this.uploadError = err.message || String(err);
    }

    this.isUploading = false;
    this.requestUpdate();
    
    // Clear the input so the same file can be selected again
    input.value = '';
  }

  clearUploadedContent() {
    this.previewService.clearUploadedContent();
    this.previewService.setUploadedFileName(null);
    this.uploadedFileName = "";
    this.portfolioPlayableId = null;
    this.portfolioPlayableData = null;
    this.portfolioProjectTitle = null;
    this.uploadError = "";
    this.requestUpdate();
  }

  // UI handler: toggle lock state and inform PreviewService
  toggleScreenLock() {
  // Lock UI moved into PlayablePreviewer component
  }

  private triggerSaveToLibrary() {
    const previewer = this.querySelector('playable-previewer') as any;
    if (previewer && typeof previewer.handleSaveToLibrary === 'function') {
      previewer.handleSaveToLibrary();
    }
  }

  private async triggerPublishFromPreview() {
    if (!this.portfolioPlayableData) {
      return;
    }

    if (!this.portfolioPlayableData.content) {
      alert("Publish currently supports HTML portfolio items only.");
      return;
    }

    const project = this.portfolioPlayableData.project
      ? await this.portfolioService.getProjectById(this.portfolioPlayableData.project)
      : null;

    this.publishService.setLaunchContext({
      playableTitle: this.portfolioPlayableData.title || this.portfolioPlayableData.name,
      fileName: this.portfolioPlayableData.originalName || `${this.portfolioPlayableData.name}.html`,
      htmlContent: this.portfolioPlayableData.content,
      googlePlayUrl: project?.googlePlay || "",
      appStoreUrl: project?.appStore || "",
      projectId: this.portfolioPlayableData.project || "",
      projectName: project?.name || "",
      sourceLabel: `Preview: ${this.portfolioPlayableData.title || this.portfolioPlayableData.name}`,
    });

    window.location.hash = "#/publish";
  }

  render() {
    const hasUploadedContent = this.previewService.getUploadedFileInfo().hasContent;
    const hasContent = this.isEncoded || hasUploadedContent || this.uploadedFileName;
    const showInputSections = !hasContent;
    const isFromPortfolio = this.portfolioPlayableId !== null;
    
    console.log(`🎨 preview-page render: isEncoded=${this.isEncoded}, decodedUrl='${this.decodedUrl.substring(0, 50)}...', hasUploadedContent=${hasUploadedContent}, uploadedFileName='${this.uploadedFileName}'`);

    return html`
      <div class="max-w-7xl mx-auto">
        <header class="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Playable Ad Preview</h1>
          
          <div class="flex items-center gap-4">
            ${hasContent && !isFromPortfolio
              ? html`
                  <button
                    @click=${this.triggerSaveToLibrary}
                    class="px-6 py-2.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors flex items-center gap-2"
                  >
                    <span class="material-icons-outlined">save</span>
                    Save to Library
                  </button>
                  <button
                    @click=${() => {
                      // Clear all content and return to input mode
                      this.previewService.clearUploadedContent();
                      this.previewService.setUploadedFileName(null);
                      this.uploadedFileName = "";
                      this.portfolioPlayableId = null;
                      this.uploadError = "";
                      this.isEncoded = false;
                      this.decodedUrl = "";
                      window.history.pushState({}, "", window.location.pathname + "#preview");
                      this.requestUpdate();
                    }}
                    class="px-6 py-2.5 rounded bg-red-500 text-white font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                  >
                    Load New Content
                  </button>
                `
              : hasContent && isFromPortfolio
              ? html`
                  ${this.isAuthenticated && this.portfolioPlayableData?.content
                    ? html`
                        <button
                          @click=${() => this.triggerPublishFromPreview()}
                          class="px-6 py-2.5 rounded bg-primary text-white font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors flex items-center gap-2"
                        >
                          <span class="material-icons-outlined">publish</span>
                          Publish for Ad networks
                        </button>
                      `
                    : null}
                  <button
                    @click=${() => {
                      // Clear all content and return to input mode
                      this.previewService.clearUploadedContent();
                      this.previewService.setUploadedFileName(null);
                      this.uploadedFileName = "";
                      this.portfolioPlayableId = null;
                      this.portfolioPlayableData = null;
                      this.portfolioProjectTitle = null;
                      this.uploadError = "";
                      this.isEncoded = false;
                      this.decodedUrl = "";
                      window.history.pushState({}, "", window.location.pathname + "#preview");
                      this.requestUpdate();
                    }}
                    class="px-6 py-2.5 rounded bg-red-500 text-white font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                  >
                    Load New Content
                  </button>
                `
              : null}
          </div>
        </header>

        ${isFromPortfolio && this.portfolioPlayableData
          ? html`
              <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div class="space-y-2">
                  <div>
                    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">${this.portfolioPlayableData.title || this.portfolioPlayableData.name}</h2>
                  </div>
                  ${this.portfolioPlayableData.details ? html`
                    <p class="text-slate-600 dark:text-slate-400 text-sm">${this.portfolioPlayableData.details}</p>
                  ` : ''}
                  ${this.portfolioProjectTitle ? html`
                    <div class="text-sm">
                      <span class="font-medium text-slate-700 dark:text-slate-300">Project:</span>
                      <span class="text-slate-600 dark:text-slate-400 ml-2">${this.portfolioProjectTitle}</span>
                    </div>
                  ` : ''}
                  ${this.portfolioPlayableData.tags && this.portfolioPlayableData.tags.length > 0 ? html`
                    <div class="text-sm">
                      <span class="font-medium text-slate-700 dark:text-slate-300 block mb-1">Tags:</span>
                      <div class="flex flex-wrap gap-2">
                        ${this.portfolioPlayableData.tags.map((tag: string) => 
                          html`<span class="inline-block px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">${tag}</span>`
                        )}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `
          : ''}
        
        ${showInputSections
          ? html`
              <div class="space-y-8">
                <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p class="text-slate-600 dark:text-slate-400 mb-4">
                    Upload HTML files or ZIP archives to preview playable ads on different devices and orientations.
                  </p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-icons-outlined">upload_file</span>
                    Upload HTML File
                  </h3>
                  
                  <div class="mb-4">
                    <label class="block w-full cursor-pointer">
                      <input 
                        type="file" 
                        accept=".html,.htm,.zip" 
                        @change="${this.handleFileUpload}"
                        class="block w-full text-sm text-slate-500 dark:text-slate-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-blue-600
                          cursor-pointer"
                        ?disabled="${this.isUploading}"
                      />
                    </label>
                    
                    ${this.isUploading ? html`
                      <div class="mt-2 flex items-center gap-2 text-primary">
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                        <span class="text-sm">Uploading...</span>
                      </div>
                    ` : ''}
                  </div>
                  
                  ${this.uploadError ? html`
                    <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
                      ${this.uploadError}
                    </div>
                  ` : ''}
                  
                  <div class="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                    <p>• Supported formats: .html, .htm, .zip</p>
                    <p>• Maximum file size: 10MB</p>
                    <p>• Files are processed locally</p>
                  </div>
                </div>
              </div>
              </div>
            `
          : null}
          
        <div class="mt-6">
          ${(() => {
            const hasUploadedContent = this.previewService.getUploadedFileInfo().hasContent;
            if (hasUploadedContent || this.uploadedFileName) {
              console.log(`✅ preview-page: Rendering previewer with content`);
              return html`<playable-previewer .fileName=${this.uploadedFileName}></playable-previewer>`;
            } else {
              console.log(`⛔ preview-page: Not rendering previewer (no content)`);
              return null;
            }
          })()}
        </div>
      </div>
    `;
  }
}
