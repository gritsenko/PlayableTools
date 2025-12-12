import { injectable, ServiceLifetime, inject } from "fw";
import { ApiClient, type Creative, type Variation, type FileMeta, type Project } from "./ApiClient";

export interface PlayableAdData {
  id: string;
  name: string;
  title: string;
  details: string;
  project: string;
  tags: string[];
  content?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  shortLink?: string;
  originalName?: string;
  contentType?: string;
  creativeId?: number;
  variationId?: number;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  token?: string;
}

export interface CreativeWithVariations {
  id: number;
  title: string;
  details: string;
  project: string;
  tags: string[];
  createdAt: number;
  variations: Array<{
    id: number;
    title: string;
    createdAt: number;
    file?: { originalName: string; contentType: string };
    screenshotFile?: { storageName: string; originalName: string };
  }>;
}

@injectable(ServiceLifetime.Singleton)
export class PortfolioService {
  @inject(ApiClient)
  private apiClient!: ApiClient;

  private currentUser: User | null = null;
  private isInitialized = false;

  /**
   * Public accessor for components/pages that need to know which API base URL is used.
   */
  public getApiBaseUrl(): string {
    return this.apiClient.getApiBaseUrl();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    
    if (storedToken && storedUser) {
      this.apiClient.setToken(storedToken);
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        this.signOut();
      }
    }
    this.isInitialized = true;
  }

  async waitForAuthState(): Promise<void> {
    return Promise.resolve();
  }

  async authenticateWithGoogle(): Promise<User> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (!window.google || !window.google.accounts) {
        reject(new Error("Google Identity Services not loaded"));
        return;
      }

      // @ts-ignore
      google.accounts.id.initialize({
        client_id: "167482240202-07ubec5htg60p01320nplrtnbkhoiani.apps.googleusercontent.com",
        use_fedcm_for_prompt: false,
        callback: async (response: any) => {
          try {
            const user = await this.loginWithBackend(response.credential);
            resolve(user);
          } catch (err) {
            reject(err);
          }
        },
        auto_select: true
      });

      // @ts-ignore
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("Google One Tap not displayed:", notification.getNotDisplayedReason());
          // If One Tap fails, we can't do much here programmatically to force it.
          // The UI should have a button that calls renderButton or similar.
          // But since this method is called by a button click in the current UI,
          // we should reject so the UI knows it failed, OR we should rely on the button flow.
          reject(new Error("Google One Tap not displayed. Please use the Sign In button."));
        }
      });
    });
  }

  renderSignInButton(elementId: string, onSuccess: (user: User) => void, onError: (error: any) => void) {
    // @ts-ignore
    if (!window.google || !window.google.accounts) {
      onError(new Error("Google Identity Services not loaded"));
      return;
    }

    // @ts-ignore
    google.accounts.id.initialize({
      client_id: "167482240202-07ubec5htg60p01320nplrtnbkhoiani.apps.googleusercontent.com",
      use_fedcm_for_prompt: false,
      callback: async (response: any) => {
        try {
          const user = await this.loginWithBackend(response.credential);
          onSuccess(user);
        } catch (err) {
          onError(err);
        }
      },
      auto_select: true
    });

    const element = document.getElementById(elementId);
    if (element) {
      // @ts-ignore
      google.accounts.id.renderButton(element, {
        theme: "outline",
        size: "large",
        width: "100%"
      });
    }
  }

  private async loginWithBackend(idToken: string): Promise<User> {
    const data = await this.apiClient.loginWithGoogle(idToken);
    this.apiClient.setToken(data.token);
    
    const user: User = {
      uid: "backend_user",
      displayName: data.username,
      email: null,
      photoURL: null,
      token: data.token
    };
    
    this.currentUser = user;
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.apiClient.isAuthenticated() && !!this.currentUser;
  }

  async getPlayables(): Promise<PlayableAdData[]> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    
    const creatives = await this.apiClient.getCreatives();
    const playables: PlayableAdData[] = [];
    
    // Flatten creatives with variations into playable ad data
    for (const creative of creatives) {
      for (const variation of creative.variations) {
        playables.push({
          id: `${creative.id}_${variation.id}`, // Composite ID
          name: variation.title,
          title: creative.title,
          details: creative.details,
          project: creative.project,
          tags: creative.tags,
          createdAt: new Date(creative.createdAt).getTime(),
          updatedAt: new Date(variation.createdAt).getTime(),
          originalName: variation.file?.originalName,
          contentType: variation.file?.contentType,
          creativeId: creative.id,
          variationId: variation.id
        });
      }
    }
    
    return playables;
  }

  async getCreativesWithVariations(): Promise<CreativeWithVariations[]> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    
    const creatives = await this.apiClient.getCreatives();
    return creatives.map(c => ({
      id: c.id,
      title: c.title,
      details: c.details,
      project: c.project,
      tags: c.tags,
      createdAt: new Date(c.createdAt).getTime(),
      variations: c.variations.map(v => ({
        id: v.id,
        title: v.title,
        createdAt: new Date(v.createdAt).getTime(),
        file: v.file ? {
          originalName: v.file.originalName,
          contentType: v.file.contentType
        } : undefined,
        screenshotFile: v.screenshotFile ? {
          storageName: v.screenshotFile.storageName,
          originalName: v.screenshotFile.originalName
        } : undefined
      }))
    }));
  }

  async getPlayableContent(id: string): Promise<string> {
    // Parse composite ID (creativeId_variationId_storageName)
    const storageNameMatch = id.match(/([a-f0-9\-]+)$/);
    if (!storageNameMatch) throw new Error("Invalid playable ID format");
    const storageName = storageNameMatch[1];
    return this.apiClient.getFileAsText(storageName);
  }

  async getPlayableById(id: string): Promise<PlayableAdData | null> {
    try {
      const content = await this.getPlayableContent(id);
      return {
        id: id,
        name: "Portfolio Playable",
        title: "Portfolio Playable",
        details: "",
        project: "",
        tags: [],
        content: content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } catch (error) {
      console.error("Failed to fetch playable by ID:", error);
      return null;
    }
  }

  async createCreative(title: string, details?: string, project?: string, tags?: string[]): Promise<Creative> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    return this.apiClient.createCreative({ title, details, project, tags });
  }

  async updateCreative(creativeId: number, title?: string, details?: string, project?: string, tags?: string[]): Promise<Creative> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    return this.apiClient.updateCreative(creativeId, { title, details, project, tags });
  }

  async uploadPlayable(name: string, content: string, description?: string, project?: string, tags?: string[]): Promise<PlayableAdData> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    
    // Create creative first
    const creative = await this.createCreative(name, description, project, tags);
    
    // Upload variation with file
    const blob = new Blob([content], { type: "text/html" });
    const file = new File([blob], name.endsWith(".html") ? name : `${name}.html`, { type: "text/html" });
    const variation = await this.apiClient.uploadVariation(creative.id, file, name);
    
    return {
      id: `${creative.id}_${variation.id}`,
      name: variation.title,
      title: creative.title,
      details: creative.details,
      project: creative.project,
      tags: creative.tags,
      content: content,
      description: description,
      createdAt: new Date(creative.createdAt).getTime(),
      updatedAt: new Date(variation.createdAt).getTime(),
      creativeId: creative.id,
      variationId: variation.id
    };
  }

  async uploadFile(file: File): Promise<FileMeta> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    return this.apiClient.uploadFile(file);
  }

  async uploadScreenshot(screenshotBlob: Blob, creativeId: number, variationId: number): Promise<number> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    const file = new File([screenshotBlob], "screenshot.jpg", { type: "image/jpeg" });
    const result = await this.apiClient.uploadScreenshot(creativeId, variationId, file);
    return result.screenshotFileId;
  }

  async uploadVariation(creativeId: number, file: File, title?: string): Promise<Variation> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    return this.apiClient.uploadVariation(creativeId, file, title);
  }

  async getProjects(): Promise<Project[]> {
    if (!this.isAuthenticated()) return [];
    return this.apiClient.getProjects();
  }

  async saveProject(project: any): Promise<void> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    
    if (project.id) {
      const { id, ...updateData } = project;
      await this.apiClient.updateProject(id, updateData);
    } else {
      await this.apiClient.createProject(project);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    await this.apiClient.deleteProject(projectId);
  }

  async updatePlayable(id: string, title: string, details: string, projectId: string, tags: string[]): Promise<PlayableAdData> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    
    // Parse composite ID to get creativeId
    const creativeIdMatch = id.match(/^(\d+)/);
    if (!creativeIdMatch) throw new Error("Invalid playable ID format");
    const creativeId = parseInt(creativeIdMatch[1], 10);
    
    const updatedCreative = await this.apiClient.updateCreative(creativeId, {
      title,
      details,
      project: projectId,
      tags
    });
    
    // Return first variation as PlayableAdData
    const variation = updatedCreative.variations[0];
    if (!variation) throw new Error("No variations found");
    
    return {
      id: `${creativeId}_${variation.id}`,
      name: variation.title,
      title: updatedCreative.title,
      details: updatedCreative.details,
      project: updatedCreative.project,
      tags: updatedCreative.tags,
      createdAt: new Date(updatedCreative.createdAt).getTime(),
      updatedAt: new Date(variation.createdAt).getTime(),
      creativeId: creativeId,
      variationId: variation.id
    };
  }

  async deletePlayable(id: string): Promise<void> {
    if (!this.isAuthenticated()) throw new Error("Not authenticated");
    
    // Parse composite ID to get creativeId and variationId
    const match = id.match(/^(\d+)_(\d+)/);
    if (!match) throw new Error("Invalid playable ID format");
    const creativeId = parseInt(match[1], 10);
    const variationId = parseInt(match[2], 10);
    
    await this.apiClient.deleteVariation(creativeId, variationId);
  }

  async getPlayableByShortLink(shortLink: string): Promise<PlayableAdData | null> {
    try {
      const content = await this.getPlayableContent(shortLink);
      return {
        id: shortLink,
        name: "Shared Playable",
        title: "Shared Playable",
        details: "",
        project: "",
        tags: [],
        content: content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } catch {
      return null;
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.apiClient.setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    // @ts-ignore
    if (window.google && window.google.accounts) {
      // @ts-ignore
      google.accounts.id.disableAutoSelect();
    }
  }
}
