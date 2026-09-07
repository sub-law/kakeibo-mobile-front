//src/app/incomes/list/page.tsx
"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { authenticatedFetch } from "@/lib/apiClient";

interface Income {
  id: number;
  date: string;
  amount: number;
}

export default function IncomeListPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchIncomes = async () => {
      setFetchError("");

      try {
        const res = await authenticatedFetch(
          `/incomes?year=${year}&month=${month}`,
        );

        if (!res) {
          return;
        }

        if (!res.ok) {
          throw new Error("入金一覧の取得に失敗しました。");
        }

        const data: Income[] = await res.json();
        setIncomes(data);
      } catch {
        setFetchError(
          "入金一覧の取得に失敗しました。時間をおいて再度お試しください。",
        );
      }
    };

    void fetchIncomes();
  }, [year, month]);

  const total = incomes.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">入金一覧</h1>
          <div className="flex justify-between mb-4">
            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => {
                if (month === 1) {
                  setYear(year - 1);
                  setMonth(12);
                } else {
                  setMonth(month - 1);
                }
              }}
            >
              ← 前の月
            </Button>

            <div className="font-bold">
              {year}年 {month}月
            </div>

            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => {
                if (month === 12) {
                  setYear(year + 1);
                  setMonth(1);
                } else {
                  setMonth(month + 1);
                }
              }}
            >
              次の月 →
            </Button>
          </div>
          <div className="text-right font-bold text-lg mb-4">
            合計：{total.toLocaleString()} 円
          </div>
          {fetchError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {fetchError}
            </p>
          )}
          <div className="space-y-3">
            {incomes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-semibold">{item.date}</p>
                  <p className="text-gray-600">
                    {item.amount.toLocaleString()} 円
                  </p>
                </div>

                <ButtonLink
                  href={`/incomes/${item.id}`}
                  size="compact"
                  full={false}
                  className="transition-colors duration-200"
                >
                  詳細
                </ButtonLink>
              </div>
            ))}
            <ButtonLink href="/incomes/create">
              入金入力
            </ButtonLink>
            <ButtonLink href="/incomes" variant="secondary">
              戻る
            </ButtonLink>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
