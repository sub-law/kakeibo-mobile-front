// src/hooks/useAuth.ts
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 初期値は必ず false（SSR と CSR を一致させる）
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // CSR でのみ localStorage を読む
  useEffect(() => {
    const token = localStorage.getItem("token");

    // setState を非同期にする
    Promise.resolve().then(() => {
      setIsLoggedIn(!!token);
    });
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { isLoggedIn, login, logout } },
    children,
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
