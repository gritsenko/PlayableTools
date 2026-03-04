import { ComponentBase, customElement, html, route, inject, state } from "fw";
import { PortfolioService, type CreativeWithVariations } from "../../services/PortfolioService";
import { PreviewService } from "../../services/PreviewService";
import { AuthenticationService } from "../../services/AuthenticationService";
import "./project-manager";

@customElement("portfolio-page")
@route("/portfolio", {
  title: "Portfolio | PlayableTools",
  description: "Manage and view your playable ads with Firebase storage.",
})
export class PortfolioPage extends ComponentBase {
  @inject(PortfolioService) portfolioService!: PortfolioService;
  @inject(PreviewService) previewService!: PreviewService;
  @inject(AuthenticationService) authService!: AuthenticationService;

  @state()
  creatives: CreativeWithVariations[] = [];

  @state()
  projects: any[] = [];

  @state()
  isAuthenticated = false;

  @state()
  isLoading = false;

  @state()
  errorMessage = "";

  @state()
  private openMenuId: number | null = null;

  private _onWindowClick = () => {
    if (this.openMenuId !== null) {
      this.openMenuId = null;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
    window.addEventListener("click", this._onWindowClick);
    
    // Subscribe to logout events (e.g., when 401 happens)
    this.authService.subscribe((reason?: string) => {
      console.log("Session expired:", reason);
      this.isAuthenticated = false;
      this.creatives = [];
      this.projects = [];
      this.errorMessage = reason || "Your session has expired. Please sign in again.";
      this.portfolioService.handleSessionExpired();
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("click", this._onWindowClick);
  }

  async checkAuthentication() {
    try {
      await this.portfolioService.initialize();
      await this.portfolioService.waitForAuthState();
      const user = this.portfolioService.getCurrentUser();
      if (user && this.portfolioService.isAuthenticated()) {
        this.isAuthenticated = true;
        this.requestUpdate();
        await this.loadPlayables();
      } else {
        this.isAuthenticated = false;
        this.requestUpdate();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      this.errorMessage = error instanceof Error ? error.message : "An error occurred";
    }
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (!this.isAuthenticated && !this.isLoading) {
      this.renderGoogleButton();
    }
  }

  renderGoogleButton() {
    this.portfolioService.renderSignInButton(
      "google-signin-button",
      (user) => {
        this.isAuthenticated = true;
        this.requestUpdate();
        console.log("Authenticated with Google as:", user.uid);
        this.loadPlayables();
      },
      (error) => {
        console.error("Google authentication error:", error);
        this.errorMessage = error instanceof Error ? error.message : "Google authentication failed";
        this.isAuthenticated = false;
      }
    );
  }

  async handleGoogleAuthenticate() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      const user = await this.portfolioService.authenticateWithGoogle();
      this.isAuthenticated = true;
      this.requestUpdate();
      console.log("Authenticated with Google as:", user.uid);
      await this.loadPlayables();
    } catch (error) {
      console.error("Google authentication error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Google authentication failed";
      this.isAuthenticated = false;
    } finally {
      this.isLoading = false;
    }
  }

  async loadPlayables() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      this.projects = await this.portfolioService.getProjects();
      this.creatives = await this.portfolioService.getCreativesWithVariations();
    } catch (error) {
      console.error("Loading playables error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load playables";
      
      if (errorMessage.toLowerCase().includes("session") || errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("401") || errorMessage.toLowerCase().includes("unauthorized")) {
        console.log("Session expired, automatically signing out");
        await this.handleSignOut();
        this.errorMessage = "Your session has expired. Please sign in again.";
      } else {
        this.errorMessage = errorMessage;
      }
    } finally {
      this.isLoading = false;
    }
  }

  async handleSignOut() {
    try {
      await this.portfolioService.signOut();
      this.isAuthenticated = false;
      this.creatives = [];
    } catch (error) {
      console.error("Sign out error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to sign out";
    }
  }

  getPlayableDirectLink = (playableId: string): string => {
    const baseUrl = this.portfolioService.getApiBaseUrl();
    return `${baseUrl}/api/files/${playableId}`;
  };

  private renderDevInfo() {
    if (!import.meta.env.DEV) return null;

    return html`
      <div class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        API base URL: <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">${this.portfolioService.getApiBaseUrl()}</code>
      </div>
    `;
  }

  handlePreviewCreative = (creative: CreativeWithVariations) => {
    const latestVariation = creative.variations[creative.variations.length - 1];
    if (latestVariation && latestVariation.file) {
      const previewId = `${creative.id}_${latestVariation.id}_${(latestVariation.file as any).storageName}`;
      window.location.hash = `preview/${previewId}`;
    }
  };

  handleEditCreative = (creative: CreativeWithVariations) => {
    window.location.hash = `#editor/${creative.id}`;
  };

  handleCopyCreativeLink = async (creative: CreativeWithVariations) => {
    const latestVariation = creative.variations[creative.variations.length - 1];
    if (latestVariation && latestVariation.file) {
      const storageName = (latestVariation.file as any).storageName;
      const link = this.getPlayableDirectLink(storageName);
      try {
        await navigator.clipboard.writeText(link);
        alert("Direct link to playable file copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy link:", error);
        alert("Failed to copy link");
      }
    }
  };

  async handleDeleteCreative(id: number) {
    if (!confirm("Are you sure you want to delete this playable and all its variations?")) return;

    this.isLoading = true;
    this.errorMessage = "";

    try {
      await this.portfolioService.deleteCreative(id);
      await this.loadPlayables();
    } catch (error) {
      console.error("Delete error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to delete playable";
    } finally {
      this.isLoading = false;
    }
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.classList.add("border-primary", "bg-primary/5", "dark:bg-primary/10");
  }

  handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("border-primary", "bg-primary/5", "dark:bg-primary/10");
  }

  async handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("border-primary", "bg-primary/5", "dark:bg-primary/10");

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.processUploadedFile(files[0]);
    }
  }

  async handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      await this.processUploadedFile(files[0]);
    }
    input.value = ""; // Reset for next time
  }

  private async processUploadedFile(file: File) {
    this.isLoading = true;
    this.errorMessage = "";
    this.requestUpdate();

    try {
      if (file.name.toLowerCase().endsWith(".zip")) {
        await this.previewService.handleZipUpload(file);
      } else {
        await this.previewService.handleFileUpload(file);
      }
      this.previewService.setUploadedFileName(file.name);
      // Navigate to preview page
      window.location.hash = "preview";
    } catch (error) {
      console.error("File upload error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to process file";
    } finally {
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  handleShowProjects = () => {
    window.location.hash = "#/projects";
  };

  getScreenshotUrl = (screenshotStorageName: string): string => {
    return `${this.portfolioService.getApiBaseUrl()}/api/files/${screenshotStorageName}`;
  };

  private getProjectName = (projectId: string): string => {
    const project = this.projects.find((p: any) => p.id === projectId);
    return project?.name || projectId;
  };

  private renderGhostCard() {
    return html`
      <div
        class="group relative bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center p-6 cursor-pointer min-h-[300px]"
        @click=${() => (this.querySelector("#fileInput") as HTMLInputElement)?.click()}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          class="hidden"
          accept=".html,.htm,.zip"
          @change=${this.handleFileSelect}
        />
        <div
          class="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform"
        >
          <span class="material-icons-outlined text-3xl text-primary">add</span>
        </div>
        <h4 class="font-bold text-slate-900 dark:text-white mb-1">New Playable</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 text-center">Drop HTML/ZIP here or click to upload</p>
      </div>
    `;
  }

  private renderCreativeCard(creative: CreativeWithVariations) {
    const latestVariation = creative.variations[creative.variations.length - 1];
    const hasScreenshot = latestVariation?.screenshotFile;
    const screenshotUrl = hasScreenshot
      ? this.getScreenshotUrl(latestVariation.screenshotFile!.storageName)
      : null;

    return html`
      <div
        class="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
      >
        <!-- Card Cover / Screenshot -->
        <div
          class="aspect-square w-full bg-slate-100 dark:bg-slate-800 relative cursor-pointer overflow-hidden"
          @click=${() => this.handlePreviewCreative(creative)}
        >
          ${screenshotUrl
            ? html`<img
                src="${screenshotUrl}"
                class="w-full h-full object-cover transition-transform group-hover:scale-105"
                alt="${creative.title}"
              />`
            : html`
                <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                  <span class="material-icons-outlined text-4xl mb-2">image</span>
                  <span class="text-xs">No screenshot</span>
                </div>
              `}
          
          <!-- Project Label -->
          ${creative.project ? html`
            <div class="absolute top-2 left-2">
              <span class="px-2.5 py-1 bg-blue-500/90 text-white rounded-full text-xs font-semibold shadow-lg">
                ${this.getProjectName(creative.project)}
              </span>
            </div>
          ` : ''}
          
          <!-- Overlay on hover -->
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
          >
            <span
              class="material-icons-outlined text-white opacity-0 group-hover:opacity-100 text-4xl transition-opacity"
              >play_circle_outline</span
            >
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-1 flex-1" title="${creative.title}">
              ${creative.title}
            </h4>

            <!-- Actions Menu -->
            <div class="relative ml-2">
              <button
                @click=${(e: Event) => this.toggleMenu(creative.id, e)}
                class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span class="material-icons-outlined">more_vert</span>
              </button>

              ${this.openMenuId === creative.id
                ? html`
                    <div
                      class="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 py-1 overflow-hidden"
                    >
                      <button
                        @click=${() => this.handleEditCreative(creative)}
                        class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <span class="material-icons-outlined text-lg">edit</span> Edit
                      </button>
                      <button
                        @click=${() => this.handleCopyCreativeLink(creative)}
                        class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <span class="material-icons-outlined text-lg">share</span> Share Link
                      </button>
                      <div class="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                      <button
                        @click=${() => this.handleDeleteCreative(creative.id)}
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <span class="material-icons-outlined text-lg">delete</span> Delete
                      </button>
                    </div>
                  `
                : ""}
            </div>
          </div>

          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
            ${creative.details || "No description provided."}
          </p>

          <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <div class="flex gap-1 overflow-hidden">
              ${creative.tags.slice(0, 2).map(
                (tag) => html`
                  <span
                    class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-medium uppercase tracking-wider"
                  >
                    ${tag}
                  </span>
                `
              )}
              ${creative.tags.length > 2
                ? html`<span class="text-[10px] text-slate-400">+${creative.tags.length - 2}</span>`
                : ""}
            </div>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">
              ${new Date(creative.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.isAuthenticated) {
      return html`
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">My Playables</h1>
          ${this.renderDevInfo()}

          ${this.errorMessage
            ? html`
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p class="text-red-700 dark:text-red-400">${this.errorMessage}</p>
                </div>
              `
            : ""}

          <section
            class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 mb-8 shadow-sm"
          >
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Sign In with Google</h3>
            <p class="text-slate-600 dark:text-slate-400 mb-6">
              Sign in to manage and share your playable ads. Your playables will be stored securely and accessible via
              short links.
            </p>
            <div id="google-signin-button" class="flex justify-center"></div>
          </section>
        </div>
      `;
    }

    return html`
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Playables</h1>
            ${this.renderDevInfo()}
          </div>
          <div class="flex gap-3">
            <button
              @click=${this.handleShowProjects}
              class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium flex items-center gap-2"
            >
              <span class="material-icons-outlined">folder</span> Projects
            </button>
            <button
              @click=${this.handleSignOut}
              class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium flex items-center gap-2"
            >
              <span class="material-icons-outlined">logout</span> Sign Out
            </button>
          </div>
        </div>

        ${this.errorMessage
          ? html`
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p class="text-red-700 dark:text-red-400">${this.errorMessage}</p>
              </div>
            `
          : ""}

        ${this.isLoading && this.creatives.length === 0
          ? html`
              <div class="flex flex-col items-center justify-center py-20">
                <div
                  class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"
                ></div>
                <p class="text-slate-500 dark:text-slate-400">Loading your playables...</p>
              </div>
            `
          : html`
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${this.renderGhostCard()} ${[...this.creatives].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((creative) => this.renderCreativeCard(creative))}
              </div>
            `}
      </div>
    `;
  }
}
