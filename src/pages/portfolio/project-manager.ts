import { ComponentBase, customElement, html, state, inject } from "fw";
import { PortfolioService } from "../../services/PortfolioService";

export interface Project {
  id: string;
  name: string;
  shortName: string;
  appStore: string;
  googlePlay: string;
}

@customElement("project-manager")
export class ProjectManager extends ComponentBase {
  @inject(PortfolioService)
  private portfolioService!: PortfolioService;

  @state()
  projects: Project[] = [];

  @state()
  showForm: boolean = false;

  @state()
  editingId: string | null = null;

  @state()
  formData = {
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

  connectedCallback() {
    super.connectedCallback();
    this.loadProjects();
  }

  async loadProjects() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      this.projects = await this.portfolioService.getProjects();
    } catch (error) {
      console.error("Error loading projects:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to load projects";
    } finally {
      this.isLoading = false;
    }
  }

  openForm(project?: Project) {
    if (project) {
      this.editingId = project.id;
      this.formData = { ...project };
    } else {
      this.editingId = null;
      this.formData = { name: "", shortName: "", appStore: "", googlePlay: "" };
    }
    this.showForm = true;
    this.errorMessage = "";
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.formData = { name: "", shortName: "", appStore: "", googlePlay: "" };
  }

  handleNameInput = (e: Event) => {
    this.formData.name = (e.target as HTMLInputElement).value;
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
        id: this.editingId || `proj_${Date.now()}`,
        ...this.formData,
      };

      await this.portfolioService.saveProject(projectData);
      this.successMessage = this.editingId ? "Project updated!" : "Project created!";
      setTimeout(() => (this.successMessage = ""), 2000);
      await this.loadProjects();
      this.closeForm();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : "Failed to save project";
    } finally {
      this.isLoading = false;
    }
  };

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
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-8">Project Manager</h1>

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

        <div class="mb-6">
          ${!this.showForm
            ? html`
                <button
                  @click=${() => this.openForm()}
                  class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20"
                >
                  + New Project
                </button>
              `
            : html`
                <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    ${this.editingId ? "Edit Project" : "Create New Project"}
                  </h2>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Project Name:
                      </label>
                      <input
                        type="text"
                        placeholder="My App Project"
                        .value=${this.formData.name}
                        @input=${this.handleNameInput}
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Short Name (for builds):
                      </label>
                      <input
                        type="text"
                        placeholder="HC, ZC, etc."
                        maxlength="10"
                        .value=${this.formData.shortName}
                        @input=${this.handleShortNameInput}
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Used in output build names and project identification</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        App Store Link (optional):
                      </label>
                      <input
                        type="url"
                        placeholder="https://apps.apple.com/app/..."
                        .value=${this.formData.appStore}
                        @input=${this.handleAppStoreInput}
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Google Play Link (optional):
                      </label>
                      <input
                        type="url"
                        placeholder="https://play.google.com/store/apps/details?id=..."
                        .value=${this.formData.googlePlay}
                        @input=${this.handleGooglePlayInput}
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div class="flex gap-3">
                      <button
                        @click=${this.saveProject}
                        class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                      >
                        Save Project
                      </button>
                      <button
                        @click=${this.closeForm}
                        class="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </section>
              `}
        </div>

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
                        <button
                          @click=${() => this.openForm(project)}
                          class="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Edit
                        </button>
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
