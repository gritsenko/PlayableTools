import { ComponentBase, customElement, html, inject, state } from "fw";
import { PlayablePublishService } from "../../services/PlayablePublishService";
import { PortfolioService } from "../../services/PortfolioService";
import type { Project } from "../../services/ApiClient";
import type { PublishValidationIssue } from "../../services/types";

@customElement("playable-publisher")
export class PlayablePublisher extends ComponentBase {
  @inject(PlayablePublishService) playablePublishService!: PlayablePublishService;
  @inject(PortfolioService) portfolioService!: PortfolioService;

  @state() private dragActive = false;
  @state() private loadedFile: File | null = null;
  @state() private isPublishing = false;
  @state() private publishProgress = 0;
  @state() private currentPlatform: string | null = null;
  @state() private publishStartTime: number | null = null;
  @state() private publishElapsed: string | null = null;
  @state() private playableTitle = "";
  @state() private googlePlayUrl = "";
  @state() private appStoreUrl = "";
  @state() private customSuffix = "EN";
  @state() private availablePlatforms: string[] = [];
  @state() private selectedPlatforms: string[] = [];
  @state() private validationIssues: PublishValidationIssue[] = [];
  @state() private projects: Project[] = [];
  @state() private selectedProjectId = "";
  @state() private isAuthenticated = false;
  @state() private sourceLabel = "";

  private readonly STORAGE_KEYS = {
    playableTitle: "playable-publisher-title",
    googlePlayUrl: "playable-publisher-google-url",
    appStoreUrl: "playable-publisher-app-store-url",
    customSuffix: "playable-publisher-suffix",
    selectedPlatforms: "playable-publisher-selected-platforms",
    selectedProjectId: "playable-publisher-selected-project-id",
  } as const;

  connectedCallback() {
    super.connectedCallback();
    void this.initialize();
  }

  private async initialize() {
    this.loadFromLocalStorage();
    this.availablePlatforms = this.playablePublishService.getAvailablePlatforms();
    if (this.selectedPlatforms.length === 0) {
      this.selectedPlatforms = [...this.availablePlatforms];
    }
    await this.loadProjects();
    await this.applyLaunchContext();
    await this.validateCurrentState();
  }

  render() {
    const errors = this.validationIssues.filter((issue) => issue.level === "error");
    const warnings = this.validationIssues.filter((issue) => issue.level === "warning");

    return html`
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Publish Playable Ad</h1>
          <div class="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </div>
          ${this.sourceLabel ? html`<div class="text-sm font-medium text-primary">Prefilled from ${this.sourceLabel}</div>` : null}
        </div>

        ${!this.loadedFile
          ? html`
              <div
                class="border-2 border-dashed rounded-lg p-6 md:p-12 text-center transition-colors ${
                  this.dragActive
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p class="text-slate-600 dark:text-slate-400 mb-4">Drop your .html file here or</p>
                <label class="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
                  Select file
                  <input type="file" accept=".html" @change=${this._onFileChange} class="hidden" />
                </label>
              </div>
            `
          : html`
              <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div class="flex items-center gap-3 mb-4">
                  <span class="material-icons-outlined text-slate-400">description</span>
                  <div>
                    <div class="font-medium text-slate-900 dark:text-white">File loaded: ${this.loadedFile.name}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">${(this.loadedFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>

                ${this.isPublishing
                  ? html`
                      <div class="mt-4">
                        <div class="text-sm text-slate-600 dark:text-slate-400 mb-2 flex justify-between">
                          <span>Publishing... ${Math.round(this.publishProgress)}%</span>
                          ${this.currentPlatform ? html`<span class="font-medium text-primary">(${this.currentPlatform})</span>` : null}
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                          <div class="bg-primary h-2.5 rounded-full transition-all duration-300" style="width: ${this.publishProgress}%;"></div>
                        </div>
                      </div>
                    `
                  : null}
              </div>
            `}

        ${this.loadedFile
          ? html`
              <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Playable Configuration</h3>
                </div>

                ${errors.length > 0
                  ? html`
                      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                        ${errors.map((issue) => html`<div>${issue.message}</div>`) }
                      </div>
                    `
                  : null}

                ${warnings.length > 0
                  ? html`
                      <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                        ${warnings.map((issue) => html`<div>${issue.message}</div>`) }
                      </div>
                    `
                  : null}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  ${this.isAuthenticated
                    ? html`
                        <div class="md:col-span-2">
                          <label for="projectSelect" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project URLs:</label>
                          <select
                            id="projectSelect"
                            .value=${this.selectedProjectId}
                            @change=${this._onProjectChange}
                            class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="">Manual URLs</option>
                            ${this.projects.map((project) => html`<option value=${project.id}>${project.name}</option>`) }
                          </select>
                        </div>
                      `
                    : null}

                  <div>
                    <label for="playableTitle" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Playable Title:</label>
                    <input
                      id="playableTitle"
                      type="text"
                      .value=${this.playableTitle}
                      @input=${(e: Event) => this.updateField("playableTitle", (e.target as HTMLInputElement).value)}
                      placeholder="e.g., GoH_PBCustomHero3D"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label for="customSuffix" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Suffix:</label>
                    <input
                      id="customSuffix"
                      type="text"
                      .value=${this.customSuffix}
                      @input=${(e: Event) => this.updateField("customSuffix", (e.target as HTMLInputElement).value)}
                      placeholder="EN"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label for="googlePlayUrl" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Google Play URL:</label>
                    <input
                      id="googlePlayUrl"
                      type="url"
                      .value=${this.googlePlayUrl}
                      @input=${(e: Event) => this.updateField("googlePlayUrl", (e.target as HTMLInputElement).value)}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label for="appStoreUrl" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">App Store URL:</label>
                    <input
                      id="appStoreUrl"
                      type="url"
                      .value=${this.appStoreUrl}
                      @input=${(e: Event) => this.updateField("appStoreUrl", (e.target as HTMLInputElement).value)}
                      placeholder="https://apps.apple.com/app/..."
                      class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div class="flex justify-between items-center mb-4">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Platforms:</label>
                    <div class="flex gap-4 text-sm">
                      <a href="#" @click=${this._selectAllPlatforms} class="text-primary hover:underline">Select all</a>
                      <a href="#" @click=${this._clearAllPlatforms} class="text-primary hover:underline">Clear all</a>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    ${this.availablePlatforms.map((platform) => html`
                      <label class="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          .checked=${this.selectedPlatforms.includes(platform)}
                          @change=${(e: Event) => this._onPlatformCheckboxChange(e, platform)}
                          class="rounded text-primary focus:ring-primary"
                        />
                        <span class="text-sm text-slate-700 dark:text-slate-300">${this.playablePublishService.getPlatformLabel(platform)}</span>
                      </label>
                    `)}
                  </div>
                </div>
              </div>
            `
          : null}

        <div class="mb-8 flex gap-4 justify-center">
          ${this.loadedFile && !this.isPublishing
            ? html`
                <button
                  @click=${() => this._publishPlayable("directory")}
                  class="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  ?disabled=${errors.length > 0}
                >
                  <span class="material-icons-outlined">folder_open</span>
                  Save to folder
                </button>
                <button
                  @click=${() => this._publishPlayable("zip")}
                  class="px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  ?disabled=${errors.length > 0}
                >
                  <span class="material-icons-outlined">archive</span>
                  Download zip
                </button>
              `
            : null}
        </div>
      </div>
    `;
  }

  private _onProjectChange = async (e: Event) => {
    this.selectedProjectId = (e.target as HTMLSelectElement).value;
    const project = this.projects.find((item) => item.id === this.selectedProjectId);
    if (project) {
      this.googlePlayUrl = project.googlePlay || this.googlePlayUrl;
      this.appStoreUrl = project.appStore || this.appStoreUrl;
    }
    this.saveToLocalStorage();
    await this.validateCurrentState();
  };

  private _onPlatformCheckboxChange(e: Event, platform: string) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedPlatforms.includes(platform)) {
        this.selectedPlatforms = [...this.selectedPlatforms, platform];
      }
    } else {
      this.selectedPlatforms = this.selectedPlatforms.filter((value) => value !== platform);
    }
    this.saveToLocalStorage();
    void this.validateCurrentState();
  }

  private _selectAllPlatforms(e: Event) {
    e.preventDefault();
    this.selectedPlatforms = [...this.availablePlatforms];
    this.saveToLocalStorage();
    void this.validateCurrentState();
  }

  private _clearAllPlatforms(e: Event) {
    e.preventDefault();
    this.selectedPlatforms = [];
    this.saveToLocalStorage();
    void this.validateCurrentState();
  }

  private _onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragActive = true;
  }

  private _onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
  }

  private _onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      void this.processFile(files[0]);
    }
  }

  private _onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      void this.processFile(file);
    }
  }

  private async processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
      alert("Please select a valid .html file.");
      return;
    }

    this.loadedFile = file;
    if (!this.playableTitle) {
      this.playableTitle = this.smartPrefillTitle(file.name);
    }
    this.saveToLocalStorage();
    await this.validateCurrentState();
    this.dispatchEvent(new CustomEvent("file-selected", { detail: file }));
  }

  private async _publishPlayable(mode: "directory" | "zip") {
    if (!this.loadedFile) {
      return;
    }

    this.isPublishing = true;
    this.publishProgress = 10;
    this.currentPlatform = null;
    this.publishElapsed = null;
    this.publishStartTime = Date.now();

    try {
      const htmlContent = await this.readFileContent(this.loadedFile);
      this.validationIssues = this.playablePublishService.validatePublishRequest(htmlContent, {
        title: this.playableTitle,
        googlePlayUrl: this.googlePlayUrl,
        appStoreUrl: this.appStoreUrl,
        selectedPlatforms: [...this.selectedPlatforms],
      });
      if (this.validationIssues.some((issue) => issue.level === "error")) {
        this.isPublishing = false;
        this.publishProgress = 0;
        return;
      }

      const options = {
        name: this.playableTitle,
        title: this.playableTitle,
        googlePlayUrl: this.googlePlayUrl,
        appStoreUrl: this.appStoreUrl,
        suffix: this.customSuffix,
        selectedPlatforms: [...this.selectedPlatforms],
        onProgress: (progress: number, platform?: string) => {
          this.publishProgress = progress;
          this.currentPlatform = platform ?? null;
        },
      };

      if (mode === "zip") {
        await this.playablePublishService.downloadAggregateZip(htmlContent, options);
        this.publishProgress = 100;
      } else {
        const outputDirectory = await this.playablePublishService.requestOutputDirectory();
        await this.playablePublishService.processAllPlatforms(htmlContent, {
          ...options,
          outputDirectory,
        });
        this.publishProgress = 100;
      }

      if (this.publishStartTime) {
        this.publishElapsed = this.formatElapsed(Date.now() - this.publishStartTime);
      }

      let message = mode === "zip"
        ? "Publishing completed successfully! One ZIP archive has been downloaded."
        : "Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.";
      if (this.publishElapsed) {
        message += `\n\nElapsed time: ${this.publishElapsed}`;
      }
      alert(message);
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("File System Access API is not supported")) {
        errorMessage += "\n\nFor best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.";
      }
      alert(`Publishing failed: ${errorMessage}`);
    } finally {
      this.isPublishing = false;
      this.publishProgress = 0;
      this.currentPlatform = null;
    }
  }

  private smartPrefillTitle(fileName: string): string {
    return fileName.replace(/\.(html|htm)$/i, "").trim();
  }

  private formatElapsed(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const seconds = sec % 60;
    if (min > 0) {
      return `${min}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read file as text"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  private loadFromLocalStorage() {
    this.playableTitle = localStorage.getItem(this.STORAGE_KEYS.playableTitle) || "";
    this.googlePlayUrl = localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl) || "";
    this.appStoreUrl = localStorage.getItem(this.STORAGE_KEYS.appStoreUrl) || "";
    this.customSuffix = localStorage.getItem(this.STORAGE_KEYS.customSuffix) || "EN";
    this.selectedProjectId = localStorage.getItem(this.STORAGE_KEYS.selectedProjectId) || "";

    const selectedPlatformsStr = localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);
    if (selectedPlatformsStr) {
      try {
        const parsed = JSON.parse(selectedPlatformsStr);
        if (Array.isArray(parsed)) {
          this.selectedPlatforms = parsed;
        }
      } catch {
        this.selectedPlatforms = [];
      }
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.STORAGE_KEYS.playableTitle, this.playableTitle);
    localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl, this.googlePlayUrl);
    localStorage.setItem(this.STORAGE_KEYS.appStoreUrl, this.appStoreUrl);
    localStorage.setItem(this.STORAGE_KEYS.customSuffix, this.customSuffix);
    localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms, JSON.stringify(this.selectedPlatforms));
    localStorage.setItem(this.STORAGE_KEYS.selectedProjectId, this.selectedProjectId);
  }

  private updateField(field: keyof typeof this.STORAGE_KEYS, value: string) {
    switch (field) {
      case "playableTitle":
        this.playableTitle = value;
        break;
      case "googlePlayUrl":
        this.googlePlayUrl = value;
        break;
      case "appStoreUrl":
        this.appStoreUrl = value;
        break;
      case "customSuffix":
        this.customSuffix = value;
        break;
      default:
        break;
    }
    this.saveToLocalStorage();
    void this.validateCurrentState();
  }

  private async loadProjects() {
    try {
      await this.portfolioService.initialize();
      this.isAuthenticated = this.portfolioService.isAuthenticated();
      if (this.isAuthenticated) {
        this.projects = await this.portfolioService.getProjects();
      }
    } catch {
      this.isAuthenticated = false;
      this.projects = [];
    }
  }

  private async applyLaunchContext() {
    const context = this.playablePublishService.consumeLaunchContext();
    if (!context) {
      return;
    }

    this.sourceLabel = context.sourceLabel || "Preview";
    if (context.playableTitle) {
      this.playableTitle = context.playableTitle;
    }
    if (context.googlePlayUrl) {
      this.googlePlayUrl = context.googlePlayUrl;
    }
    if (context.appStoreUrl) {
      this.appStoreUrl = context.appStoreUrl;
    }
    if (context.projectId) {
      this.selectedProjectId = context.projectId;
    }
    if (context.htmlContent) {
      const fileName = context.fileName || `${context.playableTitle || "playable"}.html`;
      this.loadedFile = new File([context.htmlContent], fileName, { type: "text/html" });
    }
    if (!this.playableTitle && context.fileName) {
      this.playableTitle = this.smartPrefillTitle(context.fileName);
    }
    this.saveToLocalStorage();
  }

  private async validateCurrentState() {
    if (!this.loadedFile) {
      this.validationIssues = [];
      return;
    }

    try {
      const htmlContent = await this.readFileContent(this.loadedFile);
      this.validationIssues = this.playablePublishService.validatePublishRequest(htmlContent, {
        title: this.playableTitle,
        googlePlayUrl: this.googlePlayUrl,
        appStoreUrl: this.appStoreUrl,
        selectedPlatforms: [...this.selectedPlatforms],
      });
    } catch {
      this.validationIssues = [{ level: "error", message: "Failed to read loaded HTML file." }];
    }
  }
}
