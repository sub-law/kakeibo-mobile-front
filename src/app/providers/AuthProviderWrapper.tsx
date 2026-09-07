// src/app/components/AuthProviderWrapper.tsx
"use client";

import { AuthProvider } from "@/hooks/useAuth";

export function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
