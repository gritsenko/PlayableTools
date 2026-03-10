import { injectable, ServiceLifetime } from 'fw';

@injectable(ServiceLifetime.Singleton)
export class AuthenticationService {
  private callbacks: Array<(reason?: string) => void> = [];
  private isLoggingOut = false;

  public subscribe(callback: (reason?: string) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((item) => item !== callback);
    };
  }

  public handleUnauthorized(reason: string = 'Your session has expired'): void {
    this.logout(reason);
  }

  public isAuthError(error: unknown): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();
    return (
      lowerMessage.includes("session") ||
      lowerMessage.includes("expired") ||
      lowerMessage.includes("401") ||
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("failed to fetch")
    );
  }

  public logout(reason?: string): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    this.callbacks.forEach(callback => {
      try {
        callback(reason);
      } catch (error) {
        console.error('Error in logout callback:', error);
      }
    });
    
    window.location.hash = '#/portfolio';
    this.isLoggingOut = false;
  }
}