import { ComponentBase, customElement, html, state, inject } from "fw";
import { PortfolioService } from "../../services/PortfolioService";
import type { PortfolioShareMode } from "../../services/ApiClient";

/**
 * Share settings for the whole portfolio: either it is closed, or anyone
 * holding `/portfolio?u={login}` can open it.
 */
@customElement("portfolio-share-modal")
export class PortfolioShareModal extends ComponentBase {
  @inject(PortfolioService)
  private portfolioService!: PortfolioService;

  @state() private isOpen = false;
  @state() private isLoading = false;
  @state() private isSaving = false;
  @state() private isCopied = false;
  @state() private errorMessage = "";
  @state() private login = "";
  @state() private shareMode: PortfolioShareMode = "closed";

  async show() {
    this.isOpen = true;
    this.isLoading = true;
    this.isCopied = false;
    this.errorMessage = "";

    try {
      const settings = await this.portfolioService.getShareSettings();
      this.login = settings.login;
      this.shareMode = settings.shareMode;
    } catch (error) {
      console.error("Failed to load share settings:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to load share settings";
    } finally {
      this.isLoading = false;
    }
  }

  hide() {
    this.isOpen = false;
  }

  private get shareUrl(): string {
    return this.login ? this.portfolioService.buildPortfolioShareUrl(this.login) : "";
  }

  private async selectMode(mode: PortfolioShareMode) {
    if (mode === this.shareMode || this.isSaving) return;

    const previousMode = this.shareMode;
    this.shareMode = mode;
    this.isSaving = true;
    this.isCopied = false;
    this.errorMessage = "";

    try {
      const settings = await this.portfolioService.setShareMode(mode);
      this.login = settings.login;
      this.shareMode = settings.shareMode;
    } catch (error) {
      console.error("Failed to update share mode:", error);
      this.shareMode = previousMode;
      this.errorMessage = error instanceof Error ? error.message : "Failed to update share mode";
    } finally {
      this.isSaving = false;
    }
  }

  private async copyLink() {
    if (!this.shareUrl) return;

    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 2000);
    } catch (error) {
      console.error("Failed to copy share link:", error);
      this.errorMessage = "Failed to copy the link. Copy it manually from the field above.";
    }
  }

  private renderModeOption(
    mode: PortfolioShareMode,
    icon: string,
    title: string,
    description: string
  ) {
    const isSelected = this.shareMode === mode;

    return html`
      <button
        @click=${() => this.selectMode(mode)}
        ?disabled=${this.isSaving}
        class="w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-colors disabled:opacity-60 ${isSelected
          ? "border-primary bg-primary/5 dark:bg-primary/10"
          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"}"
      >
        <span
          class="material-icons-outlined mt-0.5 ${isSelected ? "text-primary" : "text-slate-400 dark:text-slate-500"}"
          >${icon}</span
        >
        <span class="flex-1">
          <span class="block font-semibold text-slate-900 dark:text-white">${title}</span>
          <span class="block text-sm text-slate-500 dark:text-slate-400">${description}</span>
        </span>
        <span class="material-icons-outlined ${isSelected ? "text-primary" : "text-transparent"}">check_circle</span>
      </button>
    `;
  }

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        @click=${(e: Event) => {
          if (e.target === e.currentTarget) this.hide();
        }}
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Share portfolio</h2>
            <button
              @click=${() => this.hide()}
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="p-6 space-y-4">
            ${this.errorMessage
              ? html`
                  <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p class="text-sm text-red-700 dark:text-red-400">${this.errorMessage}</p>
                  </div>
                `
              : ""}
            ${this.isLoading
              ? html`
                  <div class="flex items-center justify-center py-8">
                    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                `
              : html`
                  <div class="space-y-3">
                    ${this.renderModeOption(
                      "closed",
                      "lock",
                      "Closed",
                      "Only you can see your portfolio."
                    )}
                    ${this.renderModeOption(
                      "link",
                      "link",
                      "Anyone with the link",
                      "Everyone who has the link can browse your playables."
                    )}
                  </div>

                  ${this.shareMode === "link"
                    ? html`
                        <div class="pt-2">
                          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Portfolio link
                          </label>
                          <div class="flex gap-2">
                            <input
                              type="text"
                              readonly
                              .value=${this.shareUrl}
                              @click=${(e: Event) => (e.target as HTMLInputElement).select()}
                              class="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                            />
                            <button
                              @click=${() => this.copyLink()}
                              class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 whitespace-nowrap"
                            >
                              <span class="material-icons-outlined text-lg">
                                ${this.isCopied ? "check" : "content_copy"}
                              </span>
                              ${this.isCopied ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      `
                    : ""}
                `}
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              @click=${() => this.hide()}
              class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
