"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

interface Expense {
  amount: number;
  category_id: number;
}

interface CategoryGroup {
  id: number;
  name: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
}

const categoryGroupColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#ea580c",
  "#4f46e5",
];

export default function ExpenseCategorySummaryPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchSummaryData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setFetchError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };
        const [expensesResponse, categoriesResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses?year=${year}&month=${month}`,
            { headers },
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
            headers,
          }),
        ]);

        if (
          expensesResponse.status === 401 ||
          categoriesResponse.status === 401
        ) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!expensesResponse.ok || !categoriesResponse.ok) {
          throw new Error("カテゴリ別出金の取得に失敗しました。");
        }

        const [expenseData, categoryData]: [Expense[], CategoryGroup[]] =
          await Promise.all([
            expensesResponse.json(),
            categoriesResponse.json(),
          ]);

        if (!cancelled) {
          setExpenses(expenseData);
          setCategoryGroups(categoryData);
        }
      } catch {
        if (!cancelled) {
          setExpenses([]);
          setCategoryGroups([]);
          setFetchError(
            "カテゴリ別出金の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchSummaryData();

    return () => {
      cancelled = true;
    };
  }, [month, router, year]);

  const totalsByCategory = useMemo(() => {
    const totals = new Map<number, number>();

    for (const expense of expenses) {
      totals.set(
        expense.category_id,
        (totals.get(expense.category_id) ?? 0) + Math.round(expense.amount),
      );
    }

    return totals;
  }, [expenses]);

  const monthlyTotal = expenses.reduce(
    (total, expense) => total + Math.round(expense.amount),
    0,
  );

  const categoryGroupChartData = useMemo(
    () =>
      categoryGroups
        .map((group, index) => ({
          id: group.id,
          name: group.name,
          amount: group.categories.reduce(
            (total, category) =>
              total + (totalsByCategory.get(category.id) ?? 0),
            0,
          ),
          color: categoryGroupColors[index % categoryGroupColors.length],
        }))
        .filter((group) => group.amount > 0),
    [categoryGroups, totalsByCategory],
  );

  const moveMonth = (difference: number) => {
    const nextDate = new Date(year, month - 1 + difference, 1);
    setYear(nextDate.getFullYear());
    setMonth(nextDate.getMonth() + 1);
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 px-4 py-5 sm:p-6">
        <div className="mx-auto max-w-md rounded-lg bg-white p-4 shadow sm:p-6">
          <h1 className="mb-5 text-2xl font-bold">出金一覧（カテゴリ別）</h1>

          <div className="mb-5 flex items-center justify-between gap-3">
            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => moveMonth(-1)}
            >
              ← 前の月
            </Button>

            <p className="font-bold">
              {year}年 {month}月
            </p>

            <Button
              variant="navigation"
              size="compact"
              full={false}
              onClick={() => moveMonth(1)}
            >
              次の月 →
            </Button>
          </div>

          <Link
            href={`/expenses/list?year=${year}&month=${month}`}
            aria-label={`${year}年${month}月の出金一覧を表示`}
            className="mb-5 block rounded-lg border border-red-200 bg-red-50 p-4 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <p className="text-sm text-red-700">月間合計</p>
            <p className="mt-1 text-2xl font-bold text-red-800">
              {monthlyTotal.toLocaleString()} 円
            </p>
          </Link>

          {fetchError ? (
            <p className="rounded border border-red-300 bg-red-100 p-3 text-center text-red-700">
              {fetchError}
            </p>
          ) : loading ? (
            <p className="py-12 text-center text-gray-600">読み込み中...</p>
          ) : categoryGroups.length === 0 ? (
            <p className="py-8 text-center text-gray-600">
              カテゴリが登録されていません。
            </p>
          ) : categoryGroupChartData.length === 0 ? (
            <p className="py-8 text-center text-gray-600">
              この月の出金はありません。
            </p>
          ) : (
            <section aria-label="大カテゴリ別の出金割合">
              <h2 className="mb-3 font-bold text-gray-800">大カテゴリ別</h2>

              <div
                className="h-64 w-full"
                role="img"
                aria-label={`${year}年${month}月の大カテゴリ別出金グラフ`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryGroupChartData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={2}
                    >
                      {categoryGroupChartData.map((group) => (
                        <Cell key={group.id} fill={group.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toLocaleString()} 円`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 divide-y rounded-lg border border-gray-200">
                {categoryGroupChartData.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: group.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-gray-700">
                        {group.name}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-gray-900">
                        {group.amount.toLocaleString()} 円
                      </p>
                      <p className="text-sm text-gray-500">
                        {((group.amount / monthlyTotal) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <ButtonLink href="/expenses" variant="secondary" className="mt-6">
            出金メニューへ戻る
          </ButtonLink>
        </div>
      </main>
    </ClientLayout>
  );
}
