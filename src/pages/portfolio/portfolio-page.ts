import { ComponentBase, customElement, html, route, inject, state } from "fw";
import { PortfolioService, type PlayableAdData } from "../../services/PortfolioService";
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
  isAuthenticated = false;

  @state()
  isLoading = false;

  @state()
  errorMessage = "";

  @state()
  currentView: "list" | "editor" | "projects" = "list";

  @state()
  selectedPlayable: PlayableAdData | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
  }

  async checkAuthentication() {
    try {
      await this.portfolioService.initialize();
      await this.portfolioService.waitForAuthState();
      const user = this.portfolioService.getCurrentUser();
      if (user) {
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

  handleShowProjects = () => {
    this.currentView = "projects";
  };

  render() {
    if (!this.isAuthenticated) {
      return html`
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">Portfolio Manager</h1>

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
            <button
              @click=${this.handleGoogleAuthenticate}
              ?disabled=${this.isLoading}
              class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              ${this.isLoading ? "Signing in..." : "Sign in with Google"}
            </button>
          </section>
        </div>
      `;
    }

    if (this.currentView === "editor") {
      return html`
        <playable-editor
          .existingPlayable=${this.selectedPlayable}
          @playable-saved=${this.handlePlayableSaved}
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
            : this.playables.length === 0
              ? html`
                  <p class="text-slate-500 dark:text-slate-400 italic">
                    No playables uploaded yet. Start by clicking "New Playable"!
                  </p>
                `
              : html`
                  <ul class="space-y-3">
                    ${this.playables.map(
                      (playable) => html`
                        <li class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
                          <div class="flex justify-between items-start gap-4">
                            <div class="flex-1">
                              <h4 class="font-semibold text-slate-900 dark:text-white">${playable.name}</h4>
                              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                ID: <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">${playable.id}</code>
                              </p>
                              ${playable.shortLink
                                ? html`
                                    <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                      Short Link:
                                      <code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">${playable.shortLink}</code>
                                    </p>
                                  `
                                : ""}
                              <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                Updated: ${new Date(playable.updatedAt).toLocaleString()}
                              </p>
                            </div>
                            <div class="flex gap-2">
                              <button
                                @click=${() => this.handleEditPlayable(playable)}
                                class="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                @click=${() => this.handleDeletePlayable(playable.id)}
                                class="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      `
                    )}
                  </ul>
                `}
        </div>
      </div>
    `;
  }
}
