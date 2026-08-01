"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

interface FixedExpense {
  id: number;
  amount: number;
  memo: string;
  is_enabled: boolean;
  category: {
    id: number;
    name: string;
    group: {
      id: number;
      name: string;
    };
  };
}

export default function FixedExpenseListPage() {
  const router = useRouter();
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchFixedExpenses = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/fixed-expenses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("固定費一覧の取得に失敗しました。");
        }

        const data: FixedExpense[] = await response.json();

        if (!cancelled) {
          setFixedExpenses(data);
        }
      } catch {
        if (!cancelled) {
          setRequestError(
            "固定費一覧の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchFixedExpenses();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-lg rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">固定費一覧・修正</h1>

          {requestError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
              {requestError}
            </p>
          )}

          {loading ? (
            <p className="py-6 text-center text-gray-600">読み込み中...</p>
          ) : fixedExpenses.length === 0 ? (
            <p className="rounded bg-gray-50 p-4 text-center text-gray-600">
              固定費は登録されていません。
            </p>
          ) : (
            <div className="space-y-3">
              {fixedExpenses.map((fixedExpense) => (
                <section
                  key={fixedExpense.id}
                  className="rounded border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {fixedExpense.memo}
                      </h2>
                      <p className="mt-1 text-sm text-gray-700">
                        月額：{fixedExpense.amount.toLocaleString()} 円
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {fixedExpense.category.group.name} / {fixedExpense.category.name}
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          fixedExpense.is_enabled
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {fixedExpense.is_enabled ? "有効" : "無効"}
                      </p>
                    </div>

                    <ButtonLink
                      href={`/settings/fixed-expenses/${fixedExpense.id}/edit`}
                      size="compact"
                      full={false}
                    >
                      修正
                    </ButtonLink>
                  </div>
                </section>
              ))}
            </div>
          )}

          <ButtonLink
            href="/settings/fixed-expenses/create"
            variant="success"
            className="mt-4"
          >
            固定費を追加
          </ButtonLink>

          <ButtonLink
            href="/settings/fixed-expenses"
            variant="secondary"
            className="mt-4"
          >
            戻る
          </ButtonLink>
        </div>
      </main>
    </ClientLayout>
  );
}
