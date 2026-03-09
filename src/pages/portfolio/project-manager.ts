import { ComponentBase, customElement, html, state, inject, route } from "fw";
import { PortfolioService } from "../../services/PortfolioService";
import { AuthenticationService } from "../../services/AuthenticationService";

export interface Project {
  id: string;
  name: string;
  shortName: string;
  appStore: string;
  googlePlay: string;
}

@customElement("project-manager")
@route("/projects", {
  title: "Project Manager - PlayableTools",
  description: "Manage your projects and store links"
})
export class ProjectManager extends ComponentBase {
  @inject(PortfolioService)
  private portfolioService!: PortfolioService;

  @inject(AuthenticationService)
  private authService!: AuthenticationService;

  @state()
  projects: Project[] = [];

  @state()
  errorMessage: string = "";

  @state()
  isLoading: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.loadProjects();
    
    this.authService.subscribe((reason?: string) => {
      console.log("Session expired:", reason);
      this.projects = [];
      this.errorMessage = reason || "Your session has expired. Please sign in again.";
      this.requestUpdate();
    });
  }

  async loadProjects() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      this.projects = await this.portfolioService.getProjects();
    } catch (error) {
      console.error("Error loading projects:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load projects";
      
      if (this.authService.isAuthError(error)) {
        console.log("Session expired, redirecting to portfolio");
        this.authService.logout("Your session has expired. Please sign in again.");
      } else {
        this.errorMessage = errorMessage;
      }
    } finally {
      this.isLoading = false;
    }
  }

  deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    this.isLoading = true;
    this.errorMessage = "";

    try {
      await this.portfolioService.deleteProject(id);
      await this.loadProjects();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : "Failed to delete project";
    } finally {
      this.isLoading = false;
    }
  };

  render() {
    return html`
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <a href="#/portfolio" class="text-primary hover:underline text-sm font-medium flex items-center gap-2">
            ← Back to my playables
          </a>
        </div>

        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Project Manager</h1>
          <a
            href="#/projects/new"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20"
          >
            + New Project
          </a>
        </div>

        ${this.errorMessage
          ? html`
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p class="text-red-700 dark:text-red-400">${this.errorMessage}</p>
              </div>
            `
          : ""}

        <div class="space-y-4">
          ${this.projects.length === 0
            ? html`
                <div class="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                  <p class="text-slate-600 dark:text-slate-400">No projects yet. Create your first one!</p>
                </div>
              `
            : this.projects.map(
                (project) => html`
                  <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div class="flex justify-between items-start mb-4">
                      <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">${project.name}</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono font-bold">
                            ${project.shortName}
                          </code>
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <a
                          href="#/projects/${project.id}/edit"
                          class="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Edit
                        </a>
                        <button
                          @click=${() => this.deleteProject(project.id)}
                          class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div class="space-y-2">
                      ${project.appStore
                        ? html`
                            <p class="text-sm text-slate-700 dark:text-slate-300">
                              <span class="font-medium">App Store:</span>
                              <a href=${project.appStore} target="_blank" rel="noopener" class="text-primary hover:underline">
                                View on App Store
                              </a>
                            </p>
                          `
                        : ""}
                      ${project.googlePlay
                        ? html`
                            <p class="text-sm text-slate-700 dark:text-slate-300">
                              <span class="font-medium">Google Play:</span>
                              <a href=${project.googlePlay} target="_blank" rel="noopener" class="text-primary hover:underline">
                                View on Google Play
                              </a>
                            </p>
                          `
                        : ""}
                      ${!project.appStore && !project.googlePlay
                        ? html` <p class="text-sm text-slate-500 dark:text-slate-400 italic">No store links added</p> `
                        : ""}
                    </div>
                  </div>
                `
              )}
        </div>
      </div>
    `;
  }
}
