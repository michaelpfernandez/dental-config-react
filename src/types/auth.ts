export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  roleId: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  actionRights: string[];
}

export interface ActionRight {
  id: string;
  description: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  userRole: Role | null;
  userActionRights: ActionRight[];
  error: string | null;
  loading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
