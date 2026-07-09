declare module "#auth-utils" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    mustChangePassword: boolean;
  }

  interface UserSession {
    rememberMe?: boolean;
    currentSpaceId?: string;
  }
}

export {};
