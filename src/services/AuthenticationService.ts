import { injectable, ServiceLifetime } from 'fw';

@injectable(ServiceLifetime.Singleton)
export class AuthenticationService {
  private callbacks: Array<(reason?: string) => void> = [];
  private isLoggingOut = false;

  public subscribe(callback: (reason?: string) => void): void {
    this.callbacks.push(callback);
  }

  public handleUnauthorized(reason: string = 'Your session has expired'): void {
    this.logout(reason);
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
  }
}