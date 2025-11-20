import { injectable, ServiceLifetime } from "fw";

export interface PlayableAdData {
  id: string;
  name: string;
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
}

@injectable(ServiceLifetime.Singleton)
export class PortfolioService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private isInitialized = false;

  private get baseUrl() {
    return import.meta.env.DEV ? "http://localhost:5189" : "https://api.gritsenko.biz";
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

  async getPlayables(): Promise<PlayableAdData[]> {
    if (!this.token) throw new Error("Not authenticated");
    
    const res = await fetch(`${this.baseUrl}/api/files/my`, {
      headers: { "Authorization": `Bearer ${this.token}` }
    });
    
    if (!res.ok) throw new Error("Failed to fetch files");
    
    const files: FileMeta[] = await res.json();
    return files.map(f => ({
      id: f.storageName,
      name: f.originalName,
      content: undefined,
      description: "",
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

  async uploadPlayable(name: string, content: string, description?: string): Promise<PlayableAdData> {
    if (!this.token) throw new Error("Not authenticated");
    
    const blob = new Blob([content], { type: "text/html" });
    const formData = new FormData();
    formData.append("file", blob, name.endsWith(".html") ? name : `${name}.html`);
    
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
      content: content,
      description: description,
      createdAt: new Date(f.uploadedAt).getTime(),
      updatedAt: new Date(f.uploadedAt).getTime(),
      originalName: f.originalName,
      contentType: f.contentType
    };
  }

  async getProjects(): Promise<any[]> {
    return [];
  }

  async saveProject(project: any): Promise<void> {
    console.warn("Projects not supported in backend", project);
  }

  async deleteProject(projectId: string): Promise<void> {
    console.warn("Projects not supported in backend", projectId);
  }

  async updatePlayable(id: string, _name: string, _content: string, _description?: string): Promise<void> {
    throw new Error(`Update not supported by backend. Please create new. (Attempted to update ${id})`);
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
