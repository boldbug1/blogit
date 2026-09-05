"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Author, api } from "@/lib/api";

interface AuthContextType {
  user: Author | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, author: Author) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Author | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("blogit_token");
    const savedAuthor = localStorage.getItem("blogit_author");

    if (savedToken) {
      setToken(savedToken);
      if (savedAuthor) {
        try {
          setUser(JSON.parse(savedAuthor));
        } catch {
          // ignore parsing error
        }
      }

      // Verify token with backend /me
      api.auth
        .me()
        .then((author) => {
          setUser(author);
          localStorage.setItem("blogit_author", JSON.stringify(author));
        })
        .catch(() => {
          // If token expired or invalid, clear
          localStorage.removeItem("blogit_token");
          localStorage.removeItem("blogit_author");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newAuthor: Author) => {
    localStorage.setItem("blogit_token", newToken);
    localStorage.setItem("blogit_author", JSON.stringify(newAuthor));
    setToken(newToken);
    setUser(newAuthor);
  };

  const logout = () => {
    localStorage.removeItem("blogit_token");
    localStorage.removeItem("blogit_author");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const author = await api.auth.me();
      setUser(author);
      localStorage.setItem("blogit_author", JSON.stringify(author));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
