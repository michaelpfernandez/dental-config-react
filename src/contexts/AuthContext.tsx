import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { AuthState, LoginCredentials } from '../types/auth';
import authData from '../data/auth.json';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasActionRight: (actionRightId: string) => boolean;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  userRole: null,
  userActionRights: [],
  error: null,
  loading: false,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  login: () => Promise.resolve(false),
  logout: () => {},
  hasActionRight: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('dental_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const userRole = authData.roles.find((role) => role.id === userData.roleId);

        if (userRole) {
          const userActionRights = authData.actionRights.filter((right) =>
            userRole.actionRights.includes(right.id)
          );

          return {
            isAuthenticated: true,
            currentUser: userData,
            userRole,
            userActionRights,
            error: null,
            loading: false,
          };
        }
      } catch (error) {
        localStorage.removeItem('dental_user');
      }
    }
    return defaultAuthState;
  });

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = authData.users.find(
        (u) => u.username === credentials.username && u.password === credentials.password
      );

      if (!user) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: 'Invalid username or password',
        }));
        return false;
      }

      const userRole = authData.roles.find((role) => role.id === user.roleId);

      if (!userRole) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: 'User role not found',
        }));
        return false;
      }

      const userActionRights = authData.actionRights.filter((right) =>
        userRole.actionRights.includes(right.id)
      );

      const newAuthState = {
        isAuthenticated: true,
        currentUser: user,
        userRole,
        userActionRights,
        error: null,
        loading: false,
      };

      setAuthState(newAuthState);

      // Store user in localStorage
      localStorage.setItem('dental_user', JSON.stringify(user));

      return true;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'An error occurred during login',
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dental_user');
    setAuthState(defaultAuthState);
  }, []);

  const hasActionRight = useCallback(
    (actionRightId: string): boolean => {
      if (!authState.isAuthenticated || !authState.userRole) {
        return false;
      }

      // Check if user has the specific action right
      return (
        authState.userActionRights.some((right) => right.id === actionRightId) ||
        // Or if user has the 'all' version of this right
        authState.userActionRights.some(
          (right) => right.id === `${actionRightId.split('_')[0]}_all`
        )
      );
    },
    [authState]
  );

  const contextValue = useMemo(
    () => ({
      ...authState,
      login,
      logout,
      hasActionRight,
    }),
    [authState, login, logout, hasActionRight]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
