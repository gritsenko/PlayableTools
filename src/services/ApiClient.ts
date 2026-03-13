import { injectable, ServiceLifetime, inject } from "fw";
import { AuthenticationService } from "./AuthenticationService";

/**
 * Centralized API client for all backend interactions
 * Handles authentication, request formatting, and error handling
 */
@injectable(ServiceLifetime.Singleton)
export class ApiClient {
  @inject(AuthenticationService)
  private authService!: AuthenticationService;

  private token: string | null = null;

  private get baseUrl(): string {
    const envUrl = (import.meta.env as any).VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
      return envUrl;
    }
    return import.meta.env.DEV ? "http://localhost:5189" : "https://api.gritsenko.biz";
  }

  getApiBaseUrl(): string {
    return this.baseUrl;
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async parseSuccessfulResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      const text = await response.text();
      return (text ? text : undefined) as T;
    }

    const text = await response.text();
    if (!text.trim()) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token expired, clear it and notify authentication service
      this.token = null;
      this.authService.handleUnauthorized("Your session has expired. Please sign in again.");
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new Error(error || `HTTP ${response.status}`);
    }
    return this.parseSuccessfulResponse<T>(response);
  }

  // === AUTHENTICATION ===
  async loginWithGoogle(idToken: string): Promise<{ token: string; username: string }> {
    const response = await fetch(`${this.baseUrl}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ IdToken: idToken })
    });
    return this.handleResponse(response);
  }

  // === CREATIVES ===
  async getCreatives(): Promise<Creative[]> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/creatives`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getCreative(id: number): Promise<Creative> {
    // Allow anonymous access for reading creatives (public viewing of playables)
    const response = await fetch(`${this.baseUrl}/api/creatives/${id}`, {
      headers: this.getHeaders(false) // Don't include auth for read operations
    });
    return this.handleResponse(response);
  }

  async createCreative(data: CreateCreativeRequest): Promise<Creative> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/creatives`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async updateCreative(id: number, data: UpdateCreativeRequest): Promise<Creative> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/creatives/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async deleteCreative(id: number): Promise<void> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/creatives/${id}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    await this.handleResponse(response);
  }

  // === VARIATIONS ===
  async getVariations(creativeId: number): Promise<Variation[]> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  async uploadVariation(creativeId: number, file: File, title?: string): Promise<Variation> {
    if (!this.token) throw new Error("Not authenticated");
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData
      }
    );
    return this.handleResponse(response);
  }

  async replaceVariationFile(creativeId: number, variationId: number, file: File, title?: string): Promise<Variation> {
    if (!this.token) throw new Error("Not authenticated");
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations/${variationId}/file`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData
      }
    );
    return this.handleResponse(response);
  }

  async updateVariation(
    creativeId: number,
    variationId: number,
    data: UpdateVariationRequest
  ): Promise<Variation> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations/${variationId}`,
      {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return this.handleResponse(response);
  }

  async deleteVariation(creativeId: number, variationId: number): Promise<void> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations/${variationId}`,
      {
        method: "DELETE",
        headers: this.getHeaders()
      }
    );
    await this.handleResponse(response);
  }

  async uploadScreenshot(
    creativeId: number,
    variationId: number,
    file: File
  ): Promise<{ screenshotFileId: number }> {
    if (!this.token) throw new Error("Not authenticated");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations/${variationId}/screenshot`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData
      }
    );
    return this.handleResponse(response);
  }

  async replaceVariationScreenshot(
    creativeId: number,
    variationId: number,
    file: File
  ): Promise<{ screenshotFileId: number }> {
    if (!this.token) throw new Error("Not authenticated");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseUrl}/api/creatives/${creativeId}/variations/${variationId}/screenshot`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData
      }
    );
    return this.handleResponse(response);
  }

  // === FILES ===
  async uploadFile(file: File): Promise<FileMeta> {
    if (!this.token) throw new Error("Not authenticated");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData
    });
    return this.handleResponse(response);
  }

  async getFile(storageName: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/files/${storageName}`);
    if (!response.ok) throw new Error("Failed to fetch file");
    return response.blob();
  }

  async getFileAsText(storageName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/files/${storageName}`);
    if (!response.ok) throw new Error("Failed to fetch file");
    return response.text();
  }

  // === PROJECTS ===
  async getProjects(): Promise<Project[]> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/projects`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getProject(id: string): Promise<Project> {
    // Allow anonymous access for reading projects (public viewing of project info)
    const response = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(id)}`, {
      headers: this.getHeaders(false) // Don't include auth for read operations
    });
    return this.handleResponse(response);
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/projects`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.token) throw new Error("Not authenticated");
    const response = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
    await this.handleResponse(response);
  }

  /**
   * Generates a temporary shareable link for a file stored on the backend.
   * The link is stateless (HMAC-signed, 24h expiry) and requires no authentication.
   */
  async generateShareLink(storageName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/shareable/${encodeURIComponent(storageName)}/generate`);
    if (!response.ok) {
      throw new Error(`Failed to generate share link: ${response.status} ${response.statusText}`);
    }
    const data = await response.json() as { url: string };
    return data.url;
  }
}

// === TYPE DEFINITIONS ===

export interface Creative {
  id: number;
  title: string;
  details: string;
  createdAt: string;
  ownerUserId: number;
  project: string;
  tags: string[];
  variations: Variation[];
}

export interface CreateCreativeRequest {
  title: string;
  details?: string;
  project?: string;
  tags?: string[];
}

export interface UpdateCreativeRequest {
  title?: string;
  details?: string;
  project?: string;
  tags?: string[];
}

export interface Variation {
  id: number;
  title: string;
  fileId: number;
  file?: FileMeta;
  screenshotFileId?: number;
  screenshotFile?: FileMeta;
  createdAt: string;
}

export interface UpdateVariationRequest {
  title?: string;
}

export interface FileMeta {
  id: number;
  storageName: string;
  originalName: string;
  contentType: string;
  uploadedAt: string;
  ownerUserId: number;
}

export interface Project {
  id: string;
  name: string;
  shortName: string;
  appStore: string;
  googlePlay: string;
  ownerUserId: number;
}

export interface CreateProjectRequest {
  id?: string;
  name: string;
  shortName?: string;
  appStore?: string;
  googlePlay?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  shortName?: string;
  appStore?: string;
  googlePlay?: string;
}
