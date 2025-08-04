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
      <div class="portfolio-container">
        <section style="margin-bottom: 1.5em;">
          <h3>GitHub Token Setup</h3>
          <p>
            To access your repository, you need a GitHub <b>Personal Access Token</b> with <code>public_repo</code> scope.<br />
            <a href="https://github.com/settings/tokens/new?scopes=public_repo&description=PlayableTools" target="_blank" rel="noopener">Generate a token here</a>.<br />
            <b>Keep your token secure!</b> It will be stored in your browser's local storage.
          </p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1em;">
            <label for="github-token-input" style="margin-right: 8px;">GitHub Token:</label>
          <input id="github-token-input" type="password" placeholder="ghp_..." style="width: 300px;" @input=${this.handleTokenInput} />
          <button @click=${this.saveGithubToken}>Save Token</button>
          </div>
        </section>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1em;">
          <label for="repo-url-input" style="margin-right: 8px;">GitHub Repository URL:</label>
          <input id="repo-url-input" type="text" .value=${this.repoUrl} @input=${this.handleInput} placeholder="https://github.com/user/repo" style="width: 400px;" />
          <button @click=${this.saveRepoUrl}>Save</button>
        </div>
        <div class="playables-list">
          <h3>Playable Ads:</h3>
          <ul>
            ${this.playables.length === 0
              ? html`<li>No playables found.</li>`
              : this.playables.map(
                  (playable) => html`<li>${playable}</li>`
                )}
          </ul>
        </div>
      </div>
    `;
  }
}
