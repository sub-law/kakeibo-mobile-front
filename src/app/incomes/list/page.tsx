//src/app/incomes/list/page.tsx
"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useRouter } from "next/navigation";

interface Income {
  id: number;
  date: string;
  amount: number;
}

export default function IncomeListPage() {
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [incomes, setIncomes] = useState<Income[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: Income[]) => {
        setIncomes(data);
      })

      .catch(() => router.push("/login"));
  }, [router, year, month]);

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
