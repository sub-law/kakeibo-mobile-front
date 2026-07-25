//src/app/asset-balances/list/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

interface Balance {
  id: number;
  user_id?: number;
  account_id: number;
  amount: number;
  date: string;
  account: {
    id: number;
    name: string;
    type: string;
  };
}

function getInitialMonth(requestedMonth: string | null) {
  const isValidMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth ?? "");
  const requestedYear = Number(requestedMonth?.slice(0, 4));

  return isValidMonth && requestedYear >= 1900 && requestedYear <= 2100
    ? (requestedMonth as string)
    : new Date().toISOString().slice(0, 7);
}

function AssetBalanceListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ★ 月選択（YYYY-MM）
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getInitialMonth(searchParams.get("month")),
  );

  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchBalances = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setFetchError("");

      const [year, month] = selectedMonth.split("-");
      const monthNumber = Number(month);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/asset-balances?year=${year}&month=${monthNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("月次残高の取得に失敗しました。");
        }

        const json = await res.json();

        if (cancelled) {
          return;
        }

        // ★ API が { data: [...] } を返す前提に統一
        const list = Array.isArray(json.data) ? json.data : [];

        setBalances(list);
      } catch {
        if (!cancelled) {
          setFetchError(
            "月次残高の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchBalances();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth, router]);

  // ★ 合計金額（安全ガード付き）
  const totalAmount = balances.reduce(
    (sum, bal) => sum + Math.round(bal.amount),
    0,
  );

  // ★ 前月・翌月への遷移
  const moveMonth = (diff: number) => {
    if (!selectedMonth) {
      return;
    }

    const [year, month] = selectedMonth.split("-").map(Number);

    const newYear =
      month + diff < 1 ? year - 1 : month + diff > 12 ? year + 1 : year;

    const newMonth = ((month - 1 + diff + 12) % 12) + 1;

    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    setSelectedMonth(newMonthStr);
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">月次残高一覧</h1>

          {/* ★ 月選択 */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">対象月</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* ★ 前月・翌月ボタン */}
          <div className="flex justify-between mb-4">
            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => moveMonth(-1)}
            >
              ◀ 前の月
            </Button>
            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => moveMonth(1)}
            >
              次の月 ▶
            </Button>
          </div>

          {/* ★ 合計金額 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold text-blue-700">
              合計：{totalAmount.toLocaleString()} 円
            </p>
          </div>

          {fetchError ? (
            <p className="p-2 text-red-700 bg-red-100 border border-red-300 rounded text-center">
              {fetchError}
            </p>
          ) : loading ? (
            <p>読み込み中...</p>
          ) : balances.length === 0 ? (
            <p className="text-gray-600">この月のデータはありません</p>
          ) : (
            <div className="space-y-3">
              {balances.map((bal) => (
                <div
                  key={bal.id}
                  className="border p-3 rounded bg-gray-50 shadow-sm"
                >
                  <p className="font-semibold">
                    {bal.account.name}（{bal.account.type}）
                  </p>
                  <p className="text-gray-700">
                    残高：{bal.amount.toLocaleString()} 円
                  </p>
                </div>
              ))}
            </div>
          )}

          <ButtonLink href="/asset-balances" variant="secondary" className="mt-6">
            戻る
          </ButtonLink>
        </div>
      </div>
    </ClientLayout>
  );
}

export default function AssetBalanceListPage() {
  return (
    <Suspense
      fallback={
        <ClientLayout>
          <main className="min-h-screen bg-gray-100 p-6">
            <p className="text-center text-gray-600">読み込み中...</p>
          </main>
        </ClientLayout>
      }
    >
      <AssetBalanceListContent />
    </Suspense>
  );
}
