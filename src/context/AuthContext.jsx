import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  isAuthenticated,
  login as apiLogin,
  logout as apiLogout,
  onAuthChange,
  register as apiRegister,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    if (!isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
    return onAuthChange(refreshUser);
  }, []);

  async function login(payload) {
    const response = await apiLogin(payload);
    await refreshUser();
    return response;
  }

  async function register(payload) {
    const response = await apiRegister(payload);
    await refreshUser();
    return response;
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user) || isAuthenticated(),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
