//src/app/components/Header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { authenticatedFetch } from "@/lib/apiClient";

export default function Header() {
  const router = useRouter();
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn ?? false;
  const logout = auth?.logout;

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await authenticatedFetch("/logout", {
          method: "POST",
        });
      }
    } catch {
      // 通信できない場合もローカルのログアウト処理を続行する
    } finally {
      if (logout) {
        logout(); // ← 状態を更新
      }
      router.replace("/login");
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          家計簿アプリ
        </Link>

        {isLoggedIn && (
          <Button
            variant="danger"
            full={false}
            className="px-4"
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        )}
      </nav>
    </header>
  );
}
