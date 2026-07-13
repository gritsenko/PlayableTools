import { ComponentBase, customElement, html, state, inject, property, route, navigate } from "fw";
import { PortfolioService, type PlayableAdData } from "../../services/PortfolioService";
import { AuthenticationService } from "../../services/AuthenticationService";
import "./project-manager";

export interface PlayableVariation {
  id: string;
  name: string;
  type: "version" | "ab_test" | "localization";
  content: string;
  uploadedAt: number;
}

@customElement("playable-editor")
@route("/editor/:creativeId?/:variationId?", {
  title: "Edit Playable | PlayableTools",
  description: "Edit and manage your playable advertisements.",
})
export class PlayableEditor extends ComponentBase {
  @inject(PortfolioService)
  private portfolioService!: PortfolioService;

  @inject(AuthenticationService)
  private authService!: AuthenticationService;

  @property({ attribute: false })
  playableId: string | null = null;

  @property({ attribute: false })
  existingPlayable: PlayableAdData | null = null;

  @property({ attribute: false })
  routeParams: string[] = [];

  @state()
  title: string = "";

  @state()
  details: string = "";

  @state()
  projectId: string = "";

  @state()
  tags: string = "";

  @state()
  screenshot: string = "";

  @state()
  fileContent: string = "";
  fileSource: "computer" | "url" | "paste" = "computer";
  fileName: string = "";
  variationName: string = "";
  variationType: "version" | "ab_test" | "localization" = "version";
  uploadedFile: File | null = null;

  @state()
  isLoading: boolean = false;

  @state()
  errorMessage: string = "";

  @state()
  successMessage: string = "";

  @state()
  externalUrl: string = "";

  @state()
  pastedContent: string = "";

  @state()
  variations: PlayableVariation[] = [];

  @state()
  showVariationUpload: boolean = false;

  @state()
  projects: Array<{ id: string; name: string; appStore: string; googlePlay: string }> = [];

  @state()
  isProjectModalOpen: boolean = false;

  @state()
  newProjectForm = {
    name: "",
    shortName: "",
    appStore: "",
    googlePlay: "",
  };

  @state()
  projectFormError: string = "";

  @state()
  projectFormLoading: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    
    this.authService.subscribe((reason?: string) => {
      console.log("Session expired:", reason);
      this.errorMessage = reason || "Your session has expired. Please sign in again.";
      this.requestUpdate();
    });
    
    // Load projects first, then load playable data
    this.loadProjects().then(() => {
      // Load playable data from route params if provided
      if (this.routeParams && this.routeParams.length > 0 && this.routeParams[0]) {
        const creativeId = parseInt(this.routeParams[0], 10);
        this.loadPlayableFromId(creativeId);
      } else if (this.existingPlayable) {
        // Fallback to property-based data
        this.title = this.existingPlayable.title || this.existingPlayable.name;
        this.details = this.existingPlayable.details || this.existingPlayable.description || "";
        this.projectId = this.existingPlayable.project || "";
        this.tags = this.existingPlayable.tags?.join(", ") || "";
        this.fileName = this.existingPlayable.name;
      }
    });
  }

  async loadPlayableFromId(creativeId: number) {
    this.isLoading = true;
    this.errorMessage = "";
    
    try {
      const creative = await this.portfolioService.getCreativeById(creativeId);
      if (creative && creative.variations && creative.variations.length > 0) {
        const latestVariation = creative.variations[creative.variations.length - 1];
        this.existingPlayable = {
          id: `${creative.id}_${latestVariation.id}`,
          name: latestVariation.title,
          title: creative.title,
          details: creative.details,
          project: creative.project,
          tags: creative.tags,
          createdAt: creative.createdAt,
          updatedAt: latestVariation.createdAt,
          creativeId: creative.id,
          variationId: latestVariation.id
        };
        
        this.title = creative.title;
        this.details = creative.details;
        this.projectId = creative.project || "";
        this.tags = creative.tags?.join(", ") || "";
        this.fileName = latestVariation.title;
      }
    } catch (error) {
      console.error("Error loading playable:", error);
      this.errorMessage = error instanceof Error ? error.message : "Failed to load playable";
    } finally {
      this.isLoading = false;
    }
  }

  async loadProjects() {
    try {
      this.projects = await this.portfolioService.getProjects();
    } catch (error) {
      console.error("Error loading projects:", error);
      
      if (this.authService.isAuthError(error)) {
        console.log("Session expired, redirecting to portfolio");
        this.authService.logout("Your session has expired. Please sign in again.");
      }
    }
  }

  handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.fileName = file.name.replace(/\.[^/.]+$/, "");
    if (!this.title) {
      this.title = this.fileName;
    }

    if (file.name.endsWith(".zip")) {
      this.uploadedFile = file;
      this.fileContent = `<ZIP FILE: ${file.name}>`;
      this.fileSource = "computer";
      this.requestUpdate();
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.fileContent = event.target?.result as string;
        this.fileSource = "computer";
        this.requestUpdate();
      };
      reader.readAsText(file);
    }
  };

  handleUrlInput = (e: Event) => {
    this.externalUrl = (e.target as HTMLInputElement).value;
  };

  async loadFromUrl() {
    if (!this.externalUrl) {
      this.errorMessage = "Please enter a URL";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    try {
      const response = await fetch(this.externalUrl);
      this.fileContent = await response.text();
      this.fileSource = "url";
      this.fileName = new URL(this.externalUrl).pathname.split("/").pop() || "external-file";
      if (!this.title) {
        this.title = this.fileName;
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : "Failed to load URL";
    } finally {
      this.isLoading = false;
    }
  }

  handlePastedContent = (e: Event) => {
    this.pastedContent = (e.target as HTMLTextAreaElement).value;
  };

  setPastedAsSource() {
    if (!this.pastedContent) {
      this.errorMessage = "Please paste content";
      return;
    }
    this.fileContent = this.pastedContent;
    this.fileSource = "paste";
    this.fileName = "pasted-content";
    if (!this.title) {
      this.title = "Pasted Playable";
    }
  }

  handleTitleInput = (e: Event) => {
    this.title = (e.target as HTMLInputElement).value;
  };

  handleDetailsInput = (e: Event) => {
    this.details = (e.target as HTMLTextAreaElement).value;
  };

  handleProjectChange = (e: Event) => {
    this.projectId = (e.target as HTMLSelectElement).value;
  };

  openProjectModal = () => {
    this.isProjectModalOpen = true;
    this.newProjectForm = {
      name: "",
      shortName: "",
      appStore: "",
      googlePlay: "",
    };
    this.projectFormError = "";
  };

  closeProjectModal = () => {
    this.isProjectModalOpen = false;
    this.newProjectForm = {
      name: "",
      shortName: "",
      appStore: "",
      googlePlay: "",
    };
    this.projectFormError = "";
  };

  handleNewProjectNameInput = (e: Event) => {
    this.newProjectForm.name = (e.target as HTMLInputElement).value;
  };

  handleNewProjectShortNameInput = (e: Event) => {
    this.newProjectForm.shortName = (e.target as HTMLInputElement).value;
  };

  handleNewProjectAppStoreInput = (e: Event) => {
    this.newProjectForm.appStore = (e.target as HTMLInputElement).value;
  };

  handleNewProjectGooglePlayInput = (e: Event) => {
    this.newProjectForm.googlePlay = (e.target as HTMLInputElement).value;
  };

  async saveNewProject() {
    if (!this.newProjectForm.name || !this.newProjectForm.shortName) {
      this.projectFormError = "Project name and short name are required";
      return;
    }

    this.projectFormLoading = true;
    this.projectFormError = "";

    try {
      await this.portfolioService.saveProject(this.newProjectForm);
      
      // Reload projects
      await this.loadProjects();
      
      // Select the newly created project (assuming it's added to the list)
      const newProject = this.projects.find(p => p.name === this.newProjectForm.name);
      if (newProject) {
        this.projectId = newProject.id;
      }
      
      this.closeProjectModal();
    } catch (error) {
      this.projectFormError = error instanceof Error ? error.message : "Failed to create project";
    } finally {
      this.projectFormLoading = false;
    }
  }

  handleTagsInput = (e: Event) => {
    this.tags = (e.target as HTMLInputElement).value;
  };

  handleScreenshotSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      this.screenshot = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  handleVariationNameInput = (e: Event) => {
    this.variationName = (e.target as HTMLInputElement).value;
  };

  async uploadVariation() {
    if (!this.fileContent || !this.variationName) {
      this.errorMessage = "Please provide a variation name and file";
      return;
    }

    const variation: PlayableVariation = {
      id: `var_${Date.now()}`,
      name: this.variationName,
      type: this.variationType,
      content: this.fileContent,
      uploadedAt: Date.now(),
    };

    this.variations = [...this.variations, variation];
    this.variationName = "";
    this.fileContent = "";
    this.fileName = "";
    this.successMessage = "Variation uploaded successfully!";
    setTimeout(() => (this.successMessage = ""), 3000);
  }

  deleteVariation(id: string) {
    this.variations = this.variations.filter((v) => v.id !== id);
  }

async handleSavePlayable() {
    if (!this.title) {
      this.errorMessage = "Please provide a title";
      return;
    }
    
    if (!this.existingPlayable && !this.fileContent) {
      this.errorMessage = "Please select a file for new playable";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    try {
      if (this.existingPlayable) {
        // Update existing playable properties
        const tagsList = this.tags.split(",").map(t => t.trim()).filter(t => t);
        await this.portfolioService.updatePlayable(
          this.existingPlayable.id,
          this.title,
          this.details,
          this.projectId,
          tagsList
        );
        this.successMessage = "Playable updated successfully!";
      } else {
        // Create new creative
        const tagsList = this.tags.split(",").map(t => t.trim()).filter(t => t);
        
        if (this.uploadedFile && this.uploadedFile.name.endsWith(".zip")) {
          // Handle ZIP file upload
          const creative = await this.portfolioService.createCreative(this.title, this.details, this.projectId, tagsList);
          await this.portfolioService.uploadVariation(creative.id, this.uploadedFile, this.uploadedFile.name);
          this.successMessage = "Playable created successfully!";
        } else {
          // Handle HTML file upload
          await this.portfolioService.uploadPlayable(this.title, this.fileContent, this.details, this.projectId, tagsList);
          this.successMessage = "Playable created successfully!";
        }
      }

      // Redirect to portfolio page after 1 second
      setTimeout(() => {
        navigate("/portfolio");
      }, 1000);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : "Failed to save playable";
    } finally {
      this.isLoading = false;
    }
  }

  handleCancel() {
    navigate("/portfolio");
  }

  async handleDeletePlayable() {
    if (!this.existingPlayable) return;

    const creativeId = this.existingPlayable.creativeId;
    if (creativeId == null) {
      this.errorMessage = "Cannot delete playable: missing creative id";
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${this.existingPlayable.name}"? This will delete the playable and all its variations. This action cannot be undone.`
    );

    if (!confirmed) return;

    this.isLoading = true;
    this.errorMessage = "";

    try {
      // Delete the whole creative (including all variations and files),
      // not just a single variation — otherwise an empty card is left behind.
      await this.portfolioService.deleteCreative(creativeId);
      this.successMessage = "Playable deleted successfully!";
      setTimeout(() => {
        navigate("/portfolio");
      }, 1000);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : "Failed to delete playable";
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return html`
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            ${this.existingPlayable ? "Edit Playable" : "Create New Playable"}
          </h1>
          <button
            @click=${this.handleCancel}
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- File Source Selection (only for new playables) -->
            ${!this.existingPlayable ? html`
              <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Playable Source</h3>
              <div class="space-y-4">
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      value="computer"
                      ?checked=${this.fileSource === "computer"}
                      @change=${() => (this.fileSource = "computer")}
                      class="w-4 h-4"
                    />
                    <span>Upload from Computer</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      value="url"
                      ?checked=${this.fileSource === "url"}
                      @change=${() => (this.fileSource = "url")}
                      class="w-4 h-4"
                    />
                    <span>Load from URL</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      value="paste"
                      ?checked=${this.fileSource === "paste"}
                      @change=${() => (this.fileSource = "paste")}
                      class="w-4 h-4"
                    />
                    <span>Paste Content</span>
                  </label>
                </div>

                ${this.fileSource === "computer"
                  ? html`
                      <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          HTML or ZIP File:
                        </label>
                        <input
                          type="file"
                          accept=".html,.htm,.zip"
                          @change=${this.handleFileSelect}
                          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    `
                  : ""}

                ${this.fileSource === "url"
                  ? html`
                      <div class="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/playable.html"
                          .value=${this.externalUrl}
                          @input=${this.handleUrlInput}
                          class="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <button
                          @click=${this.loadFromUrl}
                          ?disabled=${this.isLoading || !this.externalUrl}
                          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Load
                        </button>
                      </div>
                    `
                  : ""}

                ${this.fileSource === "paste"
                  ? html`
                      <div>
                        <textarea
                          placeholder="Paste your HTML content here..."
                          .value=${this.pastedContent}
                          @input=${this.handlePastedContent}
                          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm h-32"
                        ></textarea>
                        <button
                          @click=${this.setPastedAsSource}
                          ?disabled=${!this.pastedContent}
                          class="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Use This Content
                        </button>
                      </div>
                    `
                  : ""}

                ${this.fileContent
                  ? html`
                      <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                        <p class="text-green-700 dark:text-green-400 text-sm">
                          ✓ File loaded: <code class="font-mono">${this.fileName}</code>
                        </p>
                      </div>
                    `
                  : ""}
</div>
            </section>
            ` : ""}

            <!-- Basic Info -->
            <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Basic Information</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title:</label>
                  <input
                    type="text"
                    placeholder="Playable Ad Title"
                    .value=${this.title}
                    @input=${this.handleTitleInput}
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Details:</label>
                  <textarea
                    placeholder="Describe your playable ad..."
                    .value=${this.details}
                    @input=${this.handleDetailsInput}
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary h-24"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated):</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Animation"
                    .value=${this.tags}
                    @input=${this.handleTagsInput}
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Project:</label>
                    <button
                      @click=${this.openProjectModal}
                      class="text-xs text-primary hover:underline font-medium"
                    >
                      + Add Project
                    </button>
                  </div>
                  <select
                    .value=${this.projectId}
                    @change=${this.handleProjectChange}
                    class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a project...</option>
                    ${this.projects.map(
                      (p) => html` <option value=${p.id}>${p.name}</option> `
                    )}
                  </select>
                </div>
              </div>
            </section>

            <!-- Screenshot -->
            <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Screenshot</h3>
              <div class="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  @change=${this.handleScreenshotSelect}
                  class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                ${this.screenshot
                  ? html`
                      <img
                        src=${this.screenshot}
                        alt="Screenshot"
                        class="w-full rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 object-cover"
                      />
                    `
                  : ""}
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Actions -->
            <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Actions</h3>
              <div class="space-y-2">
<button
                  @click=${this.handleSavePlayable}
                  ?disabled=${this.isLoading || !this.title || (!this.existingPlayable && !this.fileContent)}
                  class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ${this.isLoading ? "Saving..." : this.existingPlayable ? "Update Playable" : "Create Playable"}
                </button>
                <button
                  @click=${this.handleCancel}
                  class="w-full px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                ${this.existingPlayable
                  ? html`
                      <button
                        @click=${this.handleDeletePlayable}
                        ?disabled=${this.isLoading}
                        class="w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete Playable
                      </button>
                    `
                  : ""}
              </div>
            </section>

            <!-- Variations (only for existing playables) -->
            ${this.existingPlayable
              ? html`
                  <section class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Variations</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Upload variations for A/B tests, versions, or localizations.
                    </p>

                    ${!this.showVariationUpload
                      ? html`
                          <button
                            @click=${() => (this.showVariationUpload = true)}
                            class="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                          >
                            + Add Variation
                          </button>
                        `
                      : html`
                          <div class="space-y-3">
                            <div>
                              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Variation Name:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Version 2.0"
                                .value=${this.variationName}
                                @input=${this.handleVariationNameInput}
                                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              />
                            </div>

                            <div>
                              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Type:
                              </label>
                              <select
                                .value=${this.variationType}
                                @change=${(e: Event) =>
                                  (this.variationType = (e.target as HTMLSelectElement).value as any)}
                                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              >
                                <option value="version">Version</option>
                                <option value="ab_test">A/B Test</option>
                                <option value="localization">Localization</option>
                              </select>
                            </div>

                            <input
                              type="file"
                              accept=".html,.htm,.zip"
                              @change=${this.handleFileSelect}
                              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />

                            <div class="flex gap-2">
                              <button
                                @click=${this.uploadVariation}
                                ?disabled=${!this.fileContent || !this.variationName}
                                class="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                Upload
                              </button>
                              <button
                                @click=${() => (this.showVariationUpload = false)}
                                class="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        `}

                    ${this.variations.length > 0
                      ? html`
                          <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                              ${this.variations.length} variation(s)
                            </p>
                            <ul class="space-y-2">
                              ${this.variations.map(
                                (v) => html`
                                  <li class="p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-xs flex justify-between items-start">
                                    <div>
                                      <p class="font-medium text-slate-900 dark:text-white">${v.name}</p>
                                      <p class="text-slate-500 dark:text-slate-400">${v.type}</p>
                                    </div>
                                    <button
                                      @click=${() => this.deleteVariation(v.id)}
                                      class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                    >
                                      ✕
                                    </button>
                                  </li>
                                `
                              )}
                            </ul>
                          </div>
                        `
                      : ""}
                  </section>
                `
              : ""}
          </div>
        </div>
      </div>

      <!-- Project Modal -->
      ${this.isProjectModalOpen
        ? html`
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div class="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
                <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
                  <button
                    @click=${this.closeProjectModal}
                    class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div class="p-6 space-y-4">
                  ${this.projectFormError
                    ? html`
                        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p class="text-red-700 dark:text-red-400 text-sm">${this.projectFormError}</p>
                        </div>
                      `
                    : ""}

                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Project Name:
                    </label>
                    <input
                      type="text"
                      placeholder="My App Project"
                      .value=${this.newProjectForm.name}
                      @input=${this.handleNewProjectNameInput}
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Short Name:
                    </label>
                    <input
                      type="text"
                      placeholder="HC, ZC, etc."
                      maxlength="10"
                      .value=${this.newProjectForm.shortName}
                      @input=${this.handleNewProjectShortNameInput}
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      App Store Link (optional):
                    </label>
                    <input
                      type="url"
                      placeholder="https://apps.apple.com/app/..."
                      .value=${this.newProjectForm.appStore}
                      @input=${this.handleNewProjectAppStoreInput}
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
                      .value=${this.newProjectForm.googlePlay}
                      @input=${this.handleNewProjectGooglePlayInput}
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                  <button
                    @click=${this.saveNewProject}
                    ?disabled=${this.projectFormLoading}
                    class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ${this.projectFormLoading ? "Creating..." : "Create"}
                  </button>
                  <button
                    @click=${this.closeProjectModal}
                    class="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}
    `;
  }
}
