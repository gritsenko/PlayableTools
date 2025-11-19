import { ComponentBase, customElement, html, route, inject } from "fw";
import { PortfolioService } from "../../services/PortfolioService";

@customElement("portfolio-page")
@route("/portfolio", {
  title: "Portfolio | PlayableTools",
  description: "Manage and view your portfolio of playable ads from a GitHub repository.",
})
export class PortfolioPage extends ComponentBase {
  @inject(PortfolioService) portfolioService!: PortfolioService;

  repoUrl: string = "";
  playables: string[] = [];

  githubTokenInput: string = "";

  handleTokenInput = (e: Event) => {
    this.githubTokenInput = (e.target as HTMLInputElement).value;
  };
  saveGithubToken = () => {
    if (this.githubTokenInput) {
      localStorage.setItem("portfolio-github-token", this.githubTokenInput);
      this.portfolioService.setGithubToken(this.githubTokenInput);
      this.githubTokenInput = "";
      this.requestUpdate();
    }
  };


  connectedCallback() {
    super.connectedCallback();
    const stored = localStorage.getItem("portfolio-repo-url");
    if (stored) {
      this.repoUrl = stored;
      this.loadPlayables();
    }
  }

  handleInput(e: Event) {
    this.repoUrl = (e.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  saveRepoUrl() {
    localStorage.setItem("portfolio-repo-url", this.repoUrl);
    this.loadPlayables();
  }

  async loadPlayables() {
    if (!this.repoUrl) return;
    this.playables = await this.portfolioService.getPlayables(this.repoUrl);
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">Portfolio Manager</h1>
        
        <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 mb-8 shadow-sm">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">GitHub Token Setup</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">
            To access your repository, you need a GitHub <b>Personal Access Token</b> with <code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono">public_repo</code> scope.<br />
            <a href="https://github.com/settings/tokens/new?scopes=public_repo&description=PlayableTools" target="_blank" rel="noopener" class="text-primary hover:underline">Generate a token here</a>.<br />
            <b>Keep your token secure!</b> It will be stored in your browser's local storage.
          </p>
          <div class="flex flex-col md:flex-row md:items-end gap-4">
            <div class="flex-1">
              <label for="github-token-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Token:</label>
              <input 
                id="github-token-input" 
                type="password" 
                placeholder="ghp_..." 
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                @input=${this.handleTokenInput} 
              />
            </div>
            <button 
              @click=${this.saveGithubToken}
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              Save Token
            </button>
          </div>
        </section>

        <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 mb-8 shadow-sm">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Repository Settings</h3>
          <div class="flex flex-col md:flex-row md:items-end gap-4">
            <div class="flex-1">
              <label for="repo-url-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Repository URL:</label>
              <input 
                id="repo-url-input" 
                type="text" 
                .value=${this.repoUrl} 
                @input=${this.handleInput} 
                placeholder="https://github.com/user/repo" 
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button 
              @click=${this.saveRepoUrl}
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              Load Repository
            </button>
          </div>
        </section>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Playable Ads:</h3>
          <ul class="space-y-2">
            ${this.playables.length === 0
              ? html`<li class="text-slate-500 dark:text-slate-400 italic">No playables found.</li>`
              : this.playables.map(
                  (playable) => html`
                    <li class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span class="material-icons-outlined text-slate-400">folder</span>
                      ${playable}
                    </li>
                  `
                )}
          </ul>
        </div>
      </div>
    `;
  }
}
