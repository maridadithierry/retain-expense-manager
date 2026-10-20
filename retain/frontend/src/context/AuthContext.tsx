
import { useState, type ReactNode } from "react";
import api from "../services/api";
import {
  AuthContext,
  type AuthResponse,
  type User,
} from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("retain_user");

    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        localStorage.removeItem("retain_user");
        localStorage.removeItem("retain_token");
      }
    }

    return null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("retain_token")
  );

  const loading = false;

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    const response = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem("retain_token", response.data.token);
    localStorage.setItem("retain_user", JSON.stringify(response.data.user));

    setToken(response.data.token);
    setUser(response.data.user);
  };

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("retain_token", response.data.token);
    localStorage.setItem("retain_user", JSON.stringify(response.data.user));

    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = (): void => {
    localStorage.removeItem("retain_token");
    localStorage.removeItem("retain_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}