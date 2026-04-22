import { ComponentBase, customElement, html, state, inject, route, navigate } from "fw";
import { PortfolioService } from "../../services/PortfolioService";
import { AuthenticationService } from "../../services/AuthenticationService";

export interface Project {
  id?: string;
  name: string;
  shortName: string;
  appStore: string;
  googlePlay: string;
}

@customElement("project-editor")
@route("/projects/new", {
  title: "Create Project - PlayableTools",
  description: "Create a new project"
})
@route("/projects/:id/edit", {
  title: "Edit Project - PlayableTools",
  description: "Edit your project"
})
export class ProjectEditor extends ComponentBase {
  @inject(PortfolioService)
  private portfolioService!: PortfolioService;

  @inject(AuthenticationService)
  private authService!: AuthenticationService;

  @state()
  projectId: string | null = null;

  @state()
  formData: Project = {
    name: "",
    shortName: "",
    appStore: "",
    googlePlay: "",
  };

  @state()
  errorMessage: string = "";

  @state()
  successMessage: string = "";

  @state()
  isLoading: boolean = false;

  @state()
  titleBlurred: boolean = false;

  routeParams: string[] = [];

  async connectedCallback() {
    super.connectedCallback();
    
    this.authService.subscribe((reason?: string) => {
      console.log("Session expired:", reason);
      this.errorMessage = reason || "Your session has expired. Please sign in again.";
      this.requestUpdate();
    });
    
    if (this.routeParams && this.routeParams[0]) {
      this.projectId = this.routeParams[0];
      await this.loadProject();
    }
  }

  async loadProject() {
    if (!this.projectId) return;

    this.isLoading = true;
    this.errorMessage = "";

    try {
      const projects = await this.portfolioService.getProjects();
      const project = projects.find((p) => p.id === this.projectId);
      
      if (project) {
        this.formData = { ...project };
        // If project has a name, mark title as blurred to show search links
        if (this.formData.name) {
          this.titleBlurred = true;
        }
      } else {
        this.errorMessage = "Project not found";
      }
    } catch (error) {
      console.error("Error loading project:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load project";
      
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

  handleNameInput = (e: Event) => {
    this.formData.name = (e.target as HTMLInputElement).value;
  };

  handleNameBlur = () => {
    this.titleBlurred = true;
  };

  handleShortNameInput = (e: Event) => {
    this.formData.shortName = (e.target as HTMLInputElement).value;
  };

  handleAppStoreInput = (e: Event) => {
    this.formData.appStore = (e.target as HTMLInputElement).value;
  };

  handleGooglePlayInput = (e: Event) => {
    this.formData.googlePlay = (e.target as HTMLInputElement).value;
  };

  saveProject = async () => {
    if (!this.formData.name || !this.formData.shortName) {
      this.errorMessage = "Project name and short name are required";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    try {
      const projectData = {
        ...(this.projectId && { id: this.projectId }),
        ...this.formData,
      };

      await this.portfolioService.saveProject(projectData);
      this.successMessage = this.projectId ? "Project updated!" : "Project created!";
      
      // Redirect to project list after 1 second
      setTimeout(() => {
        navigate("/projects");
      }, 1000);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : "Failed to save project";
    } finally {
      this.isLoading = false;
    }
  };

  render() {
    return html`
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <a href="/projects" class="text-primary hover:underline text-sm font-medium flex items-center gap-2">
            ← Back to projects
          </a>
        </div>

        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          ${this.projectId ? "Edit Project" : "Create New Project"}
        </h1>

        ${this.errorMessage
          ? html`
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p class="text-red-700 dark:text-red-400">${this.errorMessage}</p>
              </div>
            `
          : ""}

        ${this.successMessage
          ? html`
              <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p class="text-green-700 dark:text-green-400">${this.successMessage}</p>
              </div>
            `
          : ""}

        <section class="bg-white dark:bg-slate-900 p-8 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Name:
              </label>
              <input
                type="text"
                placeholder="My App Project"
                .value=${this.formData.name}
                @input=${this.handleNameInput}
                @blur=${this.handleNameBlur}
                class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Short Name (for builds):
              </label>
              <input
                type="text"
                placeholder="HC, ZC, etc."
                maxlength="10"
                .value=${this.formData.shortName}
                @input=${this.handleShortNameInput}
                class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Used in output build names and project identification</p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  App Store Link (optional):
                </label>
                ${this.formData.name && this.titleBlurred
                  ? html`<a
                      href="https://apps.apple.com/us/iphone/search?term=${encodeURIComponent(this.formData.name)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-primary hover:underline font-medium"
                      >Search App Store →</a
                    >`
                  : ""}
              </div>
              <input
                type="url"
                placeholder="https://apps.apple.com/app/..."
                .value=${this.formData.appStore}
                @input=${this.handleAppStoreInput}
                class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Google Play Link (optional):
                </label>
                ${this.formData.name && this.titleBlurred
                  ? html`<a
                      href="https://play.google.com/store/search?q=${encodeURIComponent(this.formData.name)}&c=apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-primary hover:underline font-medium"
                      >Search Google Play →</a
                    >`
                  : ""}
              </div>
              <input
                type="url"
                placeholder="https://play.google.com/store/apps/details?id=..."
                .value=${this.formData.googlePlay}
                @input=${this.handleGooglePlayInput}
                class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click=${this.saveProject}
                ?disabled=${this.isLoading}
                class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${this.isLoading ? "Saving..." : this.projectId ? "Update Project" : "Create Project"}
              </button>
              <a
                href="/projects"
                class="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium text-center"
              >
                Cancel
              </a>
            </div>
          </div>
        </section>
      </div>
    `;
  }
}
