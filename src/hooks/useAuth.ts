import { useAuthStore } from "../store/authStore";

/**
 * Hook that exposes authenticated user state and auth actions from the global store.
 *
 * Returns commonly used auth fields and helpers in a stable object
 * so components can easily consume authentication details.
 */
export const useAuth = () => {
    const store = useAuthStore();
    return {
      /** Currently authenticated user or null */
      user: store.user,
      /** JWT or session token if available */
      token: store.token,
      /** Whether a user is authenticated */
      isAuthenticated: store.isAuthenticated,
      /** Whether auth-related operations are loading */
      isLoading: store.isLoading,
      /** Log a user in and persist their session */
      login: store.login,
      /** Clear auth state and end the session */
      logout: store.logout,
      /** Check if current user has a specific role */
      hasRole: store.hasRole,
      /** Convenience check for admin role */
      isAdmin: store.isAdmin,
      /** Convenience check for employee role */
      isEmployee: store.isEmployee,
      /** Update the loading state */
      setLoading: store.setLoading,
    };
  };
