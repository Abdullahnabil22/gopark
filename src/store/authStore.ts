import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authenticated user model.
 */
interface User {
  id: string;
  username: string;
  role: "admin" | "employee";
}

/**
 * Auth slice state values persisted for the session.
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth actions that mutate the store.
 */
interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (role: "admin" | "employee") => boolean;
  isAdmin: () => boolean;
  isEmployee: () => boolean;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Set the current user and token as authenticated.
       */
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      /**
       * Clear all authentication state and tokens.
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      /** Check if the current user has the specified role */
      hasRole: (role: "admin" | "employee") => {
        const { user } = get();
        return user?.role === role;
      },

      /** Convenience helper for admin role */
      isAdmin: () => {
        const { hasRole } = get();
        return hasRole("admin");
      },

      /** Convenience helper for employee role */
      isEmployee: () => {
        const { hasRole } = get();
        return hasRole("employee");
      },

      /** Update loading indicator for auth workflows */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      /** Persist only non-sensitive fields to storage */
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


