declare module "#auth-utils" {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarPath?: string | null;
    mustChangePassword: boolean;
  }

  interface UserSession {
    rememberMe?: boolean;
    currentSpaceId?: string;
    currentProjectId?: string;
  }
}

export {};
