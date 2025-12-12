import { ComponentBase, customElement, html, route, inject, state } from "fw";
import { PortfolioService, type PlayableAdData, type CreativeWithVariations } from "../../services/PortfolioService";
import "./playable-editor";
import "./project-manager";

@customElement("portfolio-page")
@route("/portfolio", {
  title: "Portfolio | PlayableTools",
  description: "Manage and view your playable ads with Firebase storage.",
})
export class PortfolioPage extends ComponentBase {
  @inject(PortfolioService) portfolioService!: PortfolioService;

  @state()
  playables: PlayableAdData[] = [];

  @state()
  creatives: CreativeWithVariations[] = [];

  @state()
  isAuthenticated = false;

  @state()
  isLoading = false;

  @state()
  errorMessage = "";

  @state()
  currentView: "list" | "editor" | "projects" = "list";

  @state()
  selectedPlayable: PlayableAdData | null = null;

  @state()
  expandedCreativeId: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
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
      this.playables = await this.portfolioService.getPlayables();
      this.creatives = await this.portfolioService.getCreativesWithVariations();
    } catch (error) {
      console.error("Loading playables error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to load playables";
    } finally {
      this.isLoading = false;
    }
  }

  async handleDeletePlayable(id: string) {
    if (!confirm("Are you sure you want to delete this playable?")) return;

    this.isLoading = true;
    this.errorMessage = "";

    try {
      await this.portfolioService.deletePlayable(id);
      await this.loadPlayables();
    } catch (error) {
      console.error("Delete error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to delete playable";
    } finally {
      this.isLoading = false;
    }
  }

  async handleSignOut() {
    try {
      await this.portfolioService.signOut();
      this.isAuthenticated = false;
      this.playables = [];
    } catch (error) {
      console.error("Sign out error:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to sign out";
    }
  }

  handleNewPlayable = () => {
    this.selectedPlayable = null;
    this.currentView = "editor";
  };

  handleEditPlayable = (playable: PlayableAdData) => {
    this.selectedPlayable = playable;
    this.currentView = "editor";
  };

  handleEditorClosed = () => {
    this.currentView = "list";
    this.selectedPlayable = null;
  };

  handlePlayableSaved = () => {
    this.loadPlayables();
    this.handleEditorClosed();
  };

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

  handleCopyLink = async (playableId: string) => {
    const link = this.getPlayableDirectLink(playableId);
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link");
    }
  };

  handlePreviewPlayable = (playable: PlayableAdData) => {
    // Redirect to preview page with playable ID
    window.location.hash = `preview/${playable.id}`;
  };

  handleShowProjects = () => {
    this.currentView = "projects";
  };

  toggleCreativeExpanded = (creativeId: number) => {
    this.expandedCreativeId = this.expandedCreativeId === creativeId ? null : creativeId;
  };

  getScreenshotUrl = (screenshotStorageName: string): string => {
    return `${this.portfolioService.getApiBaseUrl()}/api/files/${screenshotStorageName}`;
  };

  render() {
    if (!this.isAuthenticated) {
      return html`
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">Portfolio Manager</h1>
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

    if (this.currentView === "editor") {
      return html`
        <playable-editor
          .existingPlayable=${this.selectedPlayable}
          @playable-saved=${this.handlePlayableSaved}
          @playable-deleted=${this.handlePlayableSaved}
          @editor-closed=${this.handleEditorClosed}
        ></playable-editor>
      `;
    }

    if (this.currentView === "projects") {
      return html` <project-manager></project-manager> `;
    }

    return html`
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Portfolio Manager</h1>
          ${this.renderDevInfo()}
          <div class="flex gap-3">
            <button
              @click=${this.handleShowProjects}
              class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Project Manager
            </button>
            <button
              @click=${this.handleSignOut}
              class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Sign Out
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

        <div class="mb-6">
          <button
            @click=${this.handleNewPlayable}
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20"
          >
            + New Playable
          </button>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Playable Ads:</h3>
          ${this.isLoading
            ? html` <p class="text-slate-500 dark:text-slate-400">Loading playables...</p> `
            : this.creatives.length === 0
              ? html`
                  <p class="text-slate-500 dark:text-slate-400 italic">
                    No playables uploaded yet. Start by clicking "New Playable"!
                  </p>
                `
              : html`
                  <div class="space-y-4">
                    ${this.creatives.map(creative => {
                      const isExpanded = this.expandedCreativeId === creative.id;
                      const latestVariation = creative.variations[creative.variations.length - 1];
                      const hasScreenshot = latestVariation?.screenshotFile;
                      
                      return html`
                        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
                          <!-- Creative Header -->
                          <div class="flex justify-between items-start gap-4">
                            <div class="flex-1 cursor-pointer" @click=${() => this.toggleCreativeExpanded(creative.id)}>
                              <div class="flex items-center gap-2">
                                <span class="text-slate-400 dark:text-slate-600 text-lg">
                                  ${isExpanded ? '▼' : '▶'}
                                </span>
                                <h4 class="font-semibold text-slate-900 dark:text-white text-lg">${creative.title}</h4>
                                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                  ${creative.variations.length} variation${creative.variations.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              ${creative.details
                                ? html`
                                    <p class="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                      ${creative.details}
                                    </p>
                                  `
                                : ''}
                              ${creative.tags.length > 0
                                ? html`
                                    <div class="flex gap-2 mt-2 flex-wrap">
                                      ${creative.tags.map(tag => html`
                                        <span class="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                                          ${tag}
                                        </span>
                                      `)}
                                    </div>
                                  `
                                : ''}
                              <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                Created: ${new Date(creative.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <!-- Expanded Content -->
                          ${isExpanded
                            ? html`
                                <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                  <!-- Latest Variation Screenshot Preview -->
                                  ${latestVariation
                                    ? html`
                                        <div class="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                                          <h5 class="font-semibold text-slate-900 dark:text-white mb-3">Latest Variation: ${latestVariation.title}</h5>
                                          ${hasScreenshot
                                            ? html`
                                                <div class="mb-3">
                                                  <img 
                                                    src="${this.getScreenshotUrl(latestVariation.screenshotFile!.storageName)}"
                                                    alt="Screenshot of ${latestVariation.title}"
                                                    class="max-w-xs h-auto rounded border border-slate-200 dark:border-slate-700"
                                                  />
                                                </div>
                                              `
                                            : html`
                                                <div class="mb-3 p-4 bg-slate-100 dark:bg-slate-800 rounded text-center text-slate-500 dark:text-slate-400 text-sm">
                                                  No screenshot available
                                                </div>
                                              `}
                                          <p class="text-xs text-slate-400 dark:text-slate-500">
                                            Updated: ${new Date(latestVariation.createdAt).toLocaleString()}
                                          </p>
                                        </div>
                                      `
                                    : ''}

                                  <!-- All Variations List -->
                                  <div class="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                                    <h5 class="font-semibold text-slate-900 dark:text-white mb-3">All Variations (${creative.variations.length})</h5>
                                    <div class="space-y-2">
                                      ${creative.variations.map((variation, idx) => html`
                                        <div class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
                                          <div class="flex-1">
                                            <div class="flex items-center gap-2">
                                              <span class="font-medium text-slate-900 dark:text-white">${variation.title}</span>
                                              ${idx === creative.variations.length - 1
                                                ? html`<span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">Latest</span>`
                                                : ''}
                                            </div>
                                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                              ${variation.file?.originalName || 'Unknown file'} • ${new Date(variation.createdAt).toLocaleString()}
                                            </p>
                                          </div>
                                          <div class="flex gap-2">
                                            ${variation.screenshotFile
                                              ? html`
                                                  <a
                                                    href="${this.getScreenshotUrl(variation.screenshotFile.storageName)}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-xs font-medium"
                                                  >
                                                    View Screenshot
                                                  </a>
                                                `
                                              : ''}
                                          </div>
                                        </div>
                                      `)}
                                    </div>
                                  </div>
                                </div>
                              `
                            : ''}
                        </div>
                      `;
                    })}
                  </div>
                `}
        </div>
      </div>
    `;
  }
}
