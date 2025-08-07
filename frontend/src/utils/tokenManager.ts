// Global token manager for sharing Clerk tokens
class TokenManager {
  private token: string | null = null;
  private listeners: ((token: string | null) => void)[] = [];

  setToken(token: string | null) {
    this.token = token;
    // Notify all listeners
    this.listeners.forEach(listener => listener(token));
  }

  getToken(): string | null {
    return this.token;
  }

  subscribe(listener: (token: string | null) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export const tokenManager = new TokenManager(); 