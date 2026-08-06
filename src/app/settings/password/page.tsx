"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useAuth } from "@/hooks/useAuth";

export default function PasswordSettingsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [requestError, setRequestError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setRequestError("");

    const token = localStorage.getItem("token");

    if (!token) {
      auth?.logout();
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            password,
            password_confirmation: passwordConfirmation,
          }),
        },
      );

      if (response.status === 401) {
        auth?.logout();
        router.push("/login");
        return;
      }

      if (response.status === 422) {
        const data = await response.json();
        setErrors(data.errors ?? {});
        return;
      }

      if (!response.ok) {
        throw new Error("パスワードの変更に失敗しました。");
      }

      sessionStorage.setItem(
        "passwordChangeSuccess",
        "パスワードを変更しました。新しいパスワードでログインしてください。",
      );
      auth?.logout();
      router.push("/login");
    } catch {
      setRequestError(
        "パスワードの変更に失敗しました。時間をおいて再度お試しください。",
      );
    }
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">パスワード変更</h1>

          {requestError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
              {requestError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="mb-1 block font-semibold"
              >
                現在のパスワード
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded border p-2"
              />
              {errors.current_password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.current_password[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block font-semibold"
              >
                新しいパスワード
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded border p-2"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password-confirmation"
                className="mb-1 block font-semibold"
              >
                新しいパスワード（確認）
              </label>
              <input
                id="password-confirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                className="w-full rounded border p-2"
              />
            </div>

            <p className="rounded bg-gray-50 p-3 text-sm text-gray-600">
              パスワードは8文字以上で設定してください。変更後は再度ログインが必要です。
            </p>

            <Button type="submit" variant="success">
              変更する
            </Button>

            <ButtonLink href="/settings" variant="secondary">
              戻る
            </ButtonLink>
          </form>
        </div>
      </main>
    </ClientLayout>
  );
}
