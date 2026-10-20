
import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);