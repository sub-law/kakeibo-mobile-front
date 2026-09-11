//src/app/login/page.tsx
"use client";

import ClientLayout from "../../components/ClientLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import {
  API_CONNECTION_ERROR_MESSAGE,
  AUTH_REDIRECT_MESSAGE_KEY,
} from "@/lib/apiClient";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  useEffect(() => {
    const message = sessionStorage.getItem("passwordChangeSuccess");
    const redirectMessage = sessionStorage.getItem(
      AUTH_REDIRECT_MESSAGE_KEY,
    );

    if (message) {
      sessionStorage.removeItem("passwordChangeSuccess");
      Promise.resolve().then(() => setSuccessMessage(message));
    }

    if (redirectMessage) {
      sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY);
      Promise.resolve().then(() => setAuthMessage(redirectMessage));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // バリデーションエラー（422）
      if (res.status === 422) {
        setErrors({
          email: data.errors?.email?.[0],
          password: data.errors?.password?.[0],
        });
        return;
      }

      // 認証失敗（401）
      if (res.status === 401) {
        setErrors({
          general: "メールアドレスまたはパスワードが正しくありません。",
        });
        return;
      }

      // ログイン試行回数超過（429）
      if (res.status === 429) {
        setErrors({
          general:
            data.message ??
            "ログイン試行回数が上限に達しました。しばらくしてから再度お試しください。",
        });
        return;
      }

      if (!res.ok || typeof data.token !== "string") {
        setErrors({ general: "ログイン処理でエラーが発生しました。" });
        return;
      }

      // 成功
      localStorage.setItem("token", data.token);
      sessionStorage.setItem(
        "previousLogin",
        JSON.stringify(data.previous_login ?? null),
      );
      auth?.login(data.token);
      router.push("/");
    } catch {
      setErrors({ general: API_CONNECTION_ERROR_MESSAGE });
    }
  };

  return (
    <ClientLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded shadow">
          <h1 className="text-2xl font-bold text-center mb-4">ログイン</h1>

          {successMessage && (
            <p className="mb-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
              {successMessage}
            </p>
          )}

          {authMessage && (
            <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-amber-800">
              {authMessage}
            </p>
          )}

          {errors.general && (
            <p className="text-red-600 mb-2">{errors.general}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                メールアドレス
              </label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">パスワード</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password}</p>
              )}
            </div>

            <Button type="submit" variant="primary">
              ログイン
            </Button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
