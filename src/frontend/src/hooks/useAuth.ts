import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const {
    loginStatus,
    isLoginSuccess,
    identity,
    login,
    clear,
    isInitializing,
  } = useInternetIdentity();

  const isAuthenticated = isLoginSuccess;
  const isLoading = isInitializing;
  const principal = identity?.getPrincipal();

  return {
    isAuthenticated,
    isLoading,
    loginStatus,
    principal,
    login,
    logout: clear,
  };
}
