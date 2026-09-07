"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";
import { authenticatedFetch } from "@/lib/apiClient";

interface Expense {
  id: number;
  date: string;
  amount: number;
  memo?: string;
  category: {
    name: string;
    group: {
      name: string;
    };
  };
}

interface Income {
  id: number;
  date: string;
  amount: number;
  memo?: string;
}

interface CashflowItem {
  id: number;
  type: "expense" | "income";
  date: string;
  amount: number;
  description?: string;
}

function getYearMonth(
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

const formatCurrency = (amount: number) =>
  `${Math.round(amount).toLocaleString()} 円`;

function CashflowContent() {
  const searchParams = useSearchParams();
  const { year, month } = getYearMonth(
    searchParams.get("year"),
    searchParams.get("month"),
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchCashflow = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const [expenseResponse, incomeResponse] = await Promise.all([
          authenticatedFetch(`/expenses?year=${year}&month=${month}`),
          authenticatedFetch(`/incomes?year=${year}&month=${month}`),
        ]);

        if (!expenseResponse || !incomeResponse) {
          return;
        }

        if (!expenseResponse.ok || !incomeResponse.ok) {
          throw new Error("出金・入金明細の取得に失敗しました。");
        }

        const [expenseData, incomeData]: [Expense[], Income[]] =
          await Promise.all([expenseResponse.json(), incomeResponse.json()]);

        if (!cancelled) {
          setExpenses(expenseData);
          setIncomes(incomeData);
        }
      } catch {
        if (!cancelled) {
          setExpenses([]);
          setIncomes([]);
          setFetchError(
            "出金・入金明細の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchCashflow();

    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const cashflowItems = useMemo<CashflowItem[]>(
    () =>
      [
        ...expenses.map((expense) => ({
          id: expense.id,
          type: "expense" as const,
          date: expense.date,
          amount: expense.amount,
          description: `${expense.category.group.name} / ${expense.category.name}`,
        })),
        ...incomes.map((income) => ({
          id: income.id,
          type: "income" as const,
          date: income.date,
          amount: income.amount,
          description: income.memo,
        })),
      ].sort((first, second) => {
        const dateOrder = first.date.localeCompare(second.date);

        if (dateOrder !== 0) {
          return dateOrder;
        }

        if (first.type !== second.type) {
          return first.type.localeCompare(second.type);
        }

        return first.id - second.id;
      }),
    [expenses, incomes],
  );

  const expenseTotal = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const incomeTotal = incomes.reduce(
    (total, income) => total + income.amount,
    0,
  );
  const balance = incomeTotal - expenseTotal;

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 px-4 py-5 sm:p-6">
        <div className="mx-auto max-w-lg rounded-lg bg-white p-4 shadow sm:p-6">
          <p className="text-sm font-semibold text-blue-600">月間レポート</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            出金・入金明細
          </h1>
          <p className="mt-2 font-semibold text-gray-700">
            {year}年 {month}月
          </p>

          {fetchError ? (
            <p className="mt-5 rounded border border-red-300 bg-red-100 p-3 text-center text-red-700">
              {fetchError}
            </p>
          ) : loading ? (
            <p className="py-16 text-center text-gray-600">読み込み中...</p>
          ) : (
            <>
              <section
                className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                aria-label="月間収支"
              >
                <div>
                  <p className="text-sm text-gray-600">出金合計</p>
                  <p className="mt-1 font-bold text-red-700">
                    {formatCurrency(expenseTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">入金合計</p>
                  <p className="mt-1 font-bold text-green-700">
                    {formatCurrency(incomeTotal)}
                  </p>
                </div>
                <div className="col-span-2 border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">収支</p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      balance >= 0 ? "text-blue-700" : "text-red-700"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>
                </div>
              </section>

              <section className="mt-6" aria-label="出金・入金の一覧">
                <h2 className="mb-3 font-bold text-gray-800">明細</h2>
                {cashflowItems.length === 0 ? (
                  <p className="rounded-lg border border-gray-200 py-8 text-center text-gray-600">
                    この月の出金・入金はありません。
                  </p>
                ) : (
                  <div className="divide-y rounded-lg border border-gray-200">
                    {cashflowItems.map((item) => {
                      const isExpense = item.type === "expense";

                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="flex items-start justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-bold ${
                                  isExpense
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {isExpense ? "出金" : "入金"}
                              </span>
                              <span className="font-semibold text-gray-700">
                                {item.date}
                              </span>
                            </div>
                            {item.description && (
                              <p className="mt-1 truncate text-sm text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p
                              className={`font-bold ${
                                isExpense ? "text-red-700" : "text-green-700"
                              }`}
                            >
                              {isExpense ? "-" : "+"}
                              {formatCurrency(item.amount)}
                            </p>
                            <ButtonLink
                              href={`/${isExpense ? "expenses" : "incomes"}/${item.id}`}
                              size="compact"
                              full={false}
                              className="mt-2 text-sm"
                            >
                              詳細
                            </ButtonLink>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          <ButtonLink href="/dashboard" variant="secondary" className="mt-6">
            管理画面へ戻る
          </ButtonLink>
        </div>
      </main>
    </ClientLayout>
  );
}

export default function CashflowPage() {
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
      <CashflowContent />
    </Suspense>
  );
}
