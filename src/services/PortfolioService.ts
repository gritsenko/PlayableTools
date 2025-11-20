import { injectable, ServiceLifetime } from "fw";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  get,
  set,
  remove,
  type Database,
} from "firebase/database";

export interface PlayableAdData {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  shortLink?: string;
}

@injectable(ServiceLifetime.Singleton)
export class PortfolioService {
  private auth: Auth | null = null;
  private database: Database | null = null;
  private currentUser: User | null = null;
  private isInitialized = false;

  /**
   * Initialize Firebase with the provided configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    };

    try {
      const app = initializeApp(firebaseConfig);
      this.auth = getAuth(app);
      this.database = getDatabase(app);

      // Set persistence to LOCAL so user stays logged in
      await setPersistence(this.auth, browserLocalPersistence);

      // Check if already authenticated
      await this.checkAuth();

      this.isInitialized = true;
    } catch (error) {
      console.error("Firebase initialization error:", error);
      throw error;
    }
  }

  /**
   * Check if user is already authenticated
   */
  private async checkAuth(): Promise<void> {
    if (!this.auth) return;

    return new Promise((resolve) => {
      const unsubscribe = this.auth!.onAuthStateChanged((user) => {
        this.currentUser = user;
        unsubscribe();
        resolve();
      });
    });
  }

  /**
   * Wait for Firebase to restore authentication state
   */
  async waitForAuthState(): Promise<void> {
    if (!this.auth) return;

    return new Promise((resolve) => {
      const unsubscribe = this.auth!.onAuthStateChanged((user) => {
        this.currentUser = user;
        unsubscribe();
        resolve();
      });
    });
  }

  /**
   * Authenticate user with Google Sign-In
   */
  async authenticateWithGoogle(): Promise<User> {
    await this.initialize();

    if (!this.auth) {
      throw new Error("Firebase auth not initialized");
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      return result.user;
    } catch (error) {
      console.error("Google authentication error:", error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Fetch all playable ads for the current user
   */
  async getPlayables(): Promise<PlayableAdData[]> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const userPlayablesRef = ref(
        this.database,
        `users/${this.currentUser.uid}/playables`
      );
      const snapshot = await get(userPlayablesRef);

      if (!snapshot.exists()) {
        return [];
      }

      const playablesData = snapshot.val();
      return Object.keys(playablesData).map((key) => ({
        id: key,
        ...playablesData[key],
      }));
    } catch (error) {
      console.error("Error fetching playables:", error);
      throw error;
    }
  }

  /**
   * Get all projects for the current user
   */
  async getProjects(): Promise<any[]> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const userProjectsRef = ref(
        this.database,
        `users/${this.currentUser.uid}/projects`
      );
      const snapshot = await get(userProjectsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const projectsData = snapshot.val();
      return Object.keys(projectsData).map((key) => ({
        id: key,
        ...projectsData[key],
      }));
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  /**
   * Save a project for the current user
   */
  async saveProject(project: any): Promise<void> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const projectId = project.id || `proj_${Date.now()}`;
      const projectRef = ref(
        this.database,
        `users/${this.currentUser.uid}/projects/${projectId}`
      );

      const { id, ...projectData } = project;
      await set(projectRef, projectData);
    } catch (error) {
      console.error("Error saving project:", error);
      throw error;
    }
  }

  /**
   * Delete a project for the current user
   */
  async deleteProject(projectId: string): Promise<void> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const projectRef = ref(
        this.database,
        `users/${this.currentUser.uid}/projects/${projectId}`
      );

      await remove(projectRef);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  /**
   * Upload a new playable ad
   */
  async uploadPlayable(
    name: string,
    content: string
  ): Promise<PlayableAdData> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const userPlayablesRef = ref(
        this.database,
        `users/${this.currentUser.uid}/playables`
      );
      const newPlayableRef = push(userPlayablesRef);

      const playableData: Omit<PlayableAdData, "id"> = {
        name,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        shortLink: newPlayableRef.key || undefined,
      };

      await set(newPlayableRef, playableData);

      return {
        id: newPlayableRef.key!,
        ...playableData,
      };
    } catch (error) {
      console.error("Error uploading playable:", error);
      throw error;
    }
  }

  /**
   * Update an existing playable ad
   */
  async updatePlayable(
    id: string,
    name: string,
    content: string
  ): Promise<void> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const playableRef = ref(
        this.database,
        `users/${this.currentUser.uid}/playables/${id}`
      );

      await set(playableRef, {
        name,
        content,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating playable:", error);
      throw error;
    }
  }

  /**
   * Delete a playable ad
   */
  async deletePlayable(id: string): Promise<void> {
    if (!this.currentUser || !this.database) {
      throw new Error("Not authenticated or database not initialized");
    }

    try {
      const playableRef = ref(
        this.database,
        `users/${this.currentUser.uid}/playables/${id}`
      );

      await remove(playableRef);
    } catch (error) {
      console.error("Error deleting playable:", error);
      throw error;
    }
  }

  /**
   * Get a public playable by short link
   */
  async getPlayableByShortLink(shortLink: string): Promise<PlayableAdData | null> {
    if (!this.database) {
      await this.initialize();
    }

    if (!this.database) {
      throw new Error("Database not initialized");
    }

    try {
      // This would require a public playables index
      // For now, searching across all users (optional: implement security rules)
      const playablesRef = ref(this.database, "playables");
      const snapshot = await get(playablesRef);

      if (!snapshot.exists()) {
        return null;
      }

      const playablesData = snapshot.val();
      for (const key in playablesData) {
        if (playablesData[key].shortLink === shortLink) {
          return {
            id: key,
            ...playablesData[key],
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching public playable:", error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    if (!this.auth) return;

    try {
      await signOut(this.auth);
      this.currentUser = null;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }
}
