"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

interface PreviewFixedExpense {
  id: number;
  amount: number;
  memo: string;
  category: {
    id: number;
    name: string;
    group: {
      id: number;
      name: string;
    };
  };
}

interface FixedExpensePreview {
  target_month: string;
  expense_date: string;
  count: number;
  total_amount: number;
  fixed_expenses: PreviewFixedExpense[];
}

function currentTargetMonth(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${today.getFullYear()}-${month}`;
}

function formatMonth(value: string): string {
  const [year, month] = value.split("-");

  return `${year}年${Number(month)}月`;
}

function formatDate(value: string): string {
  const [year, month, day] = value.split("-");

  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function FixedExpenseProcessConfirmPage() {
  const router = useRouter();
  const targetMonth = currentTargetMonth();
  const [preview, setPreview] = useState<FixedExpensePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchPreview = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/fixed-expenses/process-preview?target_month=${targetMonth}`,
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

        if (response.status === 422) {
          const data = await response.json();
          throw new Error(
            data.errors?.target_month?.[0] ?? "出金内容の確認に失敗しました。",
          );
        }

        if (!response.ok) {
          throw new Error("出金内容の確認に失敗しました。");
        }

        const data: FixedExpensePreview = await response.json();

        if (!cancelled) {
          setPreview(data);
        }
      } catch (error) {
        if (!cancelled) {
          setRequestError(
            error instanceof Error
              ? error.message
              : "出金内容の確認に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchPreview();

    return () => {
      cancelled = true;
    };
  }, [router, targetMonth]);

  const handleProcess = async () => {
    if (!preview || preview.count === 0 || processing) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setProcessing(true);
    setRequestError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fixed-expenses/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            target_month: preview.target_month,
          }),
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.status === 422) {
        const data = await response.json();
        setRequestError(
          data.errors?.target_month?.[0] ?? "出金処理に失敗しました。",
        );
        return;
      }

      if (!response.ok) {
        throw new Error("出金処理に失敗しました。");
      }

      const data: { message: string } = await response.json();
      setSuccessMessage(data.message);
      setTimeout(() => {
        const [year, month] = preview.target_month.split("-");
        router.push(`/expenses/list?year=${year}&month=${Number(month)}`);
      }, 1000);
    } catch {
      setRequestError(
        "出金処理に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-lg rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">固定費出金の確認</h1>

          {successMessage && (
            <p className="mb-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
              {successMessage}
            </p>
          )}

          {requestError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
              {requestError}
            </p>
          )}

          {loading ? (
            <p className="py-6 text-center text-gray-600">読み込み中...</p>
          ) : preview ? (
            <>
              <dl className="mb-4 space-y-2 rounded bg-gray-50 p-4">
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">対象月</dt>
                  <dd>{formatMonth(preview.target_month)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">出金日</dt>
                  <dd>{formatDate(preview.expense_date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">件数</dt>
                  <dd>{preview.count} 件</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold">合計金額</dt>
                  <dd className="font-bold">
                    {preview.total_amount.toLocaleString()} 円
                  </dd>
                </div>
              </dl>

              {preview.fixed_expenses.length === 0 ? (
                <p className="rounded bg-gray-50 p-4 text-center text-gray-600">
                  今月出金できる固定費はありません。
                </p>
              ) : (
                <div className="mb-4 space-y-3">
                  {preview.fixed_expenses.map((fixedExpense) => (
                    <section
                      key={fixedExpense.id}
                      className="rounded border border-gray-200 p-4"
                    >
                      <p className="text-sm text-gray-600">
                        {fixedExpense.category.group.name} / {fixedExpense.category.name}
                      </p>
                      <div className="mt-1 flex justify-between gap-4">
                        <h2 className="font-semibold">{fixedExpense.memo}</h2>
                        <p className="shrink-0 font-bold">
                          {fixedExpense.amount.toLocaleString()} 円
                        </p>
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {preview.count > 0 && !successMessage && (
                <Button onClick={() => void handleProcess()} variant="success">
                  {processing ? "出金処理中..." : "承認して出金する"}
                </Button>
              )}
            </>
          ) : null}

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
