// src/app/expenses/list/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useRouter, useSearchParams } from "next/navigation";

interface Expense {
  id: number;
  date: string;
  amount: number;
  memo: string;
  category_id: number;
  category: {
    id: number;
    name: string;
    category_group_id: number;
    group: {
      id: number;
      name: string;
    };
  };
}

interface CategoryGroup {
  id: number;
  name: string;
  categories: {
    id: number;
    name: string;
  }[];
}

function getInitialYearMonth(
  requestedYear: string | null,
  requestedMonth: string | null,
) {
  const year = Number(requestedYear);
  const month = Number(requestedMonth);
  const isValidYear =
    requestedYear !== null &&
    /^\d{4}$/.test(requestedYear) &&
    year >= 1900 &&
    year <= 2100;
  const isValidMonth =
    requestedMonth !== null &&
    /^\d{1,2}$/.test(requestedMonth) &&
    month >= 1 &&
    month <= 12;

  if (isValidYear && isValidMonth) {
    return { year, month };
  }

  const today = new Date();

  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
}

function ExpenseListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialYearMonth = getInitialYearMonth(
    searchParams.get("year"),
    searchParams.get("month"),
  );

  const [year, setYear] = useState(initialYearMonth.year);
  const [month, setMonth] = useState(initialYearMonth.month);

  const [expenses, setExpenses] = useState<Expense[]>([]);

  // ★ 大分類フィルタ用
  const [groupId, setGroupId] = useState<number | null>(null);

  // ★ 小分類フィルタ用
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // カテゴリ一覧
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);

  // ★ 支出一覧取得（年・月で再取得）
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses?year=${year}&month=${month}`,
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
      .then((data: Expense[]) => {
        setExpenses(data);
      })
      .catch(() => router.push("/login"));
  }, [router, year, month]);

  // ★ カテゴリ一覧取得（初回のみ）
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setCategoryGroups(data))
      .catch(() => router.push("/login"));
  }, [router]);

  // ★ カテゴリフィルタ適用
  let filteredExpenses = expenses;

  // ★ 大分類フィルタ
  if (groupId) {
    filteredExpenses = filteredExpenses.filter(
      (item) => item.category.group.id === groupId,
    );
  }

  // ★ 小分類フィルタ
  if (categoryId) {
    filteredExpenses = filteredExpenses.filter(
      (item) => item.category_id === categoryId,
    );
  }

  const total = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">出金一覧</h1>
          {/* フィルタ（横並び） */}
          <div className="mb-4 flex gap-4">
            {/* 大分類 */}
            <div className="flex-1">
              <label className="block mb-1 font-semibold">
                大分類で絞り込み
              </label>
              <select
                value={groupId ?? ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setGroupId(value);
                  setCategoryId(null); // 小分類リセット
                }}
                className="w-full border p-2 rounded"
              >
                <option value="">すべて表示</option>
                {categoryGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 小分類 */}
            <div className="flex-1">
              <label className="block mb-1 font-semibold">
                小分類で絞り込み
              </label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full border p-2 rounded"
              >
                <option value="">すべて表示</option>
                {categoryGroups
                  .filter((group) => !groupId || group.id === groupId)
                  .map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {group.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </div>
          </div>

          {/* 月移動 */}
          <div className="flex items-center justify-between mb-4">
            {/* ← ボタン */}
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
              ←
            </Button>

            {/* 年月（中央寄せ） */}
            <div className="font-bold text-center flex-1">
              {year}年 {month}月
            </div>

            {/* → ボタン */}
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
              →
            </Button>
          </div>

          {/* 合計 */}
          <div className="text-right font-bold text-lg mb-4">
            合計：{total.toLocaleString()} 円
          </div>

          {/* 一覧 */}
          <div className="space-y-3">
            {filteredExpenses.map((item) => (
              <div
                key={item.id}
                className="border-b pb-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{item.date}</p>
                  <p className="text-gray-600">
                    {item.amount.toLocaleString()} 円
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.category.group.name} / {item.category.name}
                  </p>
                </div>

                <ButtonLink
                  href={`/expenses/${item.id}`}
                  size="compact"
                  full={false}
                >
                  詳細
                </ButtonLink>
              </div>
            ))}
            <ButtonLink href="/expenses/create">
              出金入力
            </ButtonLink>
            <ButtonLink href="/expenses" variant="secondary">
              戻る
            </ButtonLink>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

export default function ExpenseListPage() {
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
      <ExpenseListContent />
    </Suspense>
  );
}
