import { injectable, ServiceLifetime } from "fw";

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
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  token?: string;
}

interface FileMeta {
  id: number;
  storageName: string;
  originalName: string;
  contentType: string;
  uploadedAt: string;
  ownerUserId: number;
  title: string;
  details: string;
  project: string;
  tags: string[];
}

@injectable(ServiceLifetime.Singleton)
export class PortfolioService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private isInitialized = false;

  private get baseUrl(): string {
    // Allow overriding the API base URL via Vite env var VITE_API_BASE_URL
    // Example: create a .env.local with VITE_API_BASE_URL=https://my-custom-api.example
    const envUrl = (import.meta.env as any).VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
      return envUrl;
    }

    // Default to localhost for dev, otherwise the public API
    return import.meta.env.DEV ? "http://localhost:5189" : "https://api.gritsenko.biz";
  }

  /**
   * Public accessor for components/pages that need to know which API base URL is used.
   * This is the same value used by internal methods.
   */
  public getApiBaseUrl(): string {
    return this.baseUrl;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    
    if (storedToken && storedUser) {
      this.token = storedToken;
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
    const res = await fetch(`${this.baseUrl}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ IdToken: idToken })
    });
    
    if (!res.ok) throw new Error("Backend login failed");
    
    const data = await res.json();
    this.token = data.token;
    
    const user: User = {
      uid: "backend_user",
      displayName: data.username,
      email: null,
      photoURL: null,
      token: data.token
    };
    
    this.currentUser = user;
    localStorage.setItem("authToken", this.token!);
    localStorage.setItem("authUser", JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  async getPlayables(): Promise<PlayableAdData[]> {
    if (!this.token) throw new Error("Not authenticated");
    
    const res = await fetch(`${this.baseUrl}/api/files/my`, {
      headers: { "Authorization": `Bearer ${this.token}` }
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        this.signOut();
        throw new Error("Your session has expired. Please sign in again.");
      }
      throw new Error("Failed to fetch files");
    }
    
    const files: FileMeta[] = await res.json();
    return files.map(f => ({
      id: f.storageName,
      name: f.originalName,
      title: f.title,
      details: f.details,
      project: f.project,
      tags: f.tags,
      content: undefined,
      description: f.details,
      createdAt: new Date(f.uploadedAt).getTime(),
      updatedAt: new Date(f.uploadedAt).getTime(),
      originalName: f.originalName,
      contentType: f.contentType
    }));
  }

  async getPlayableContent(id: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/files/${id}`);
    if (!res.ok) throw new Error("Failed to fetch content");
    return await res.text();
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

  async uploadPlayable(name: string, content: string, description?: string, project?: string, tags?: string[]): Promise<PlayableAdData> {
    if (!this.token) throw new Error("Not authenticated");
    
    const blob = new Blob([content], { type: "text/html" });
    const formData = new FormData();
    formData.append("file", blob, name.endsWith(".html") ? name : `${name}.html`);
    if (description) formData.append("details", description);
    if (name) formData.append("title", name);
    if (project) formData.append("project", project);
    if (tags && tags.length > 0) formData.append("tags", tags.join(","));
    
    const res = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.token}` },
      body: formData
    });
    
    if (!res.ok) throw new Error("Upload failed");
    
    const f: FileMeta = await res.json();
    return {
      id: f.storageName,
      name: f.originalName,
      title: f.title,
      details: f.details,
      project: f.project,
      tags: f.tags,
      content: content,
      description: description,
      createdAt: new Date(f.uploadedAt).getTime(),
      updatedAt: new Date(f.uploadedAt).getTime(),
      originalName: f.originalName,
      contentType: f.contentType
    };
  }

  async uploadFile(file: File, title?: string, details?: string, project?: string, tags?: string[]): Promise<FileMeta> {
    if (!this.token) throw new Error("Not authenticated");
    
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (details) formData.append("details", details);
    if (project) formData.append("project", project);
    if (tags && tags.length > 0) formData.append("tags", tags.join(","));
    
    const res = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.token}` },
      body: formData
    });
    
    if (!res.ok) throw new Error("Upload failed");
    
    return await res.json();
  }

  async getProjects(): Promise<any[]> {
    // If not authenticated, return an empty list - projects are user-scoped
    if (!this.token) return [];

    const res = await fetch(`${this.baseUrl}/api/projects`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch projects");

    const projects = await res.json();
    // Backend returns owner information; map to frontend-friendly shape
    return projects.map((p: any) => ({ id: p.Id || p.id, name: p.Name || p.name, shortName: p.ShortName || p.shortName, appStore: p.AppStore || p.appStore, googlePlay: p.GooglePlay || p.googlePlay }));
  }

  async saveProject(project: any): Promise<void> {
    if (!this.token) throw new Error("Not authenticated");

    const res = await fetch(`${this.baseUrl}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify(project)
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Failed to save project");
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!this.token) throw new Error("Not authenticated");

    const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Failed to delete project");
    }
  }

  async updatePlayable(id: string, title: string, details: string, projectId: string, tags: string[]): Promise<PlayableAdData> {
    if (!this.token) throw new Error("Not authenticated");
    
    const updatePayload = {
      Title: title,
      Details: details,
      Project: projectId,
      Tags: tags
    };

    const res = await fetch(`${this.baseUrl}/api/files/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      body: JSON.stringify(updatePayload)
    });

    if (!res.ok) throw new Error("Failed to update playable");

    const f: FileMeta = await res.json();
    return {
      id: f.storageName,
      name: f.originalName,
      title: f.title,
      details: f.details,
      project: f.project,
      tags: f.tags,
      description: details,
      createdAt: new Date(f.uploadedAt).getTime(),
      updatedAt: new Date(f.uploadedAt).getTime(),
      originalName: f.originalName,
      contentType: f.contentType
    };
  }

  async deletePlayable(id: string): Promise<void> {
    throw new Error(`Delete not supported by backend. (Attempted to delete ${id})`);
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
    this.token = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    // @ts-ignore
    if (window.google && window.google.accounts) {
      // @ts-ignore
      google.accounts.id.disableAutoSelect();
    }
  }
}
