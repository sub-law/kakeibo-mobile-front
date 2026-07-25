// src/app/ClientLayout.tsx
"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  return (
    <>
      <Header />
      {children}
    </>
  );
}
