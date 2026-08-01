"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
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

interface ProcessPreview {
  target_month: string;
  expense_date: string;
  fixed_expenses: PreviewFixedExpense[];
  count: number;
  total_amount: number;
}

interface ProcessResult {
  message: string;
  target_month: string;
  expense_date: string;
  created_count: number;
  skipped_count: number;
  total_amount: number;
}

function formatTargetMonth(targetMonth: string) {
  const [year, month] = targetMonth.split("-");
  return `${year}年${Number(month)}月`;
}

function FixedExpenseProcessConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetMonth = searchParams.get("target_month") ?? "";
  const [preview, setPreview] = useState<ProcessPreview | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/fixed-expenses/process-preview?target_month=${encodeURIComponent(targetMonth)}`,
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
          throw new Error(data.errors?.target_month?.[0] ?? "対象月が正しくありません。");
        }

        if (!response.ok) {
          throw new Error("固定費の確認情報を取得できませんでした。");
        }

        const data: ProcessPreview = await response.json();

        if (!cancelled) {
          setPreview(data);
        }
      } catch (error) {
        if (!cancelled) {
          setRequestError(
            error instanceof Error
              ? error.message
              : "固定費の確認情報を取得できませんでした。",
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
    if (processing || !preview || preview.count === 0) {
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
          body: JSON.stringify({ target_month: targetMonth }),
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
          data.errors?.target_month?.[0] ?? "出金処理を実行できませんでした。",
        );
        return;
      }

      if (!response.ok) {
        throw new Error("固定費の出金処理に失敗しました。");
      }

      const data: ProcessResult = await response.json();
      setResult(data);
    } catch {
      setRequestError(
        "固定費の出金処理に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <main className="min-h-screen bg-gray-100 p-6">
          <p className="text-center text-gray-600">読み込み中...</p>
        </main>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-lg rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">固定費出金の確認</h1>

          {requestError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
              {requestError}
            </p>
          )}

          {result ? (
            <div>
              <p className="mb-4 rounded border border-green-300 bg-green-100 p-3 text-green-700">
                {result.message}
              </p>
              <dl className="mb-4 space-y-2 rounded bg-gray-50 p-4">
                <div className="flex justify-between gap-4">
                  <dt>対象月</dt>
                  <dd className="font-semibold">
                    {formatTargetMonth(result.target_month)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>登録件数</dt>
                  <dd className="font-semibold">{result.created_count}件</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>合計金額</dt>
                  <dd className="font-semibold">
                    {result.total_amount.toLocaleString()} 円
                  </dd>
                </div>
              </dl>

              <ButtonLink href="/expenses/list" variant="info">
                出金一覧を確認
              </ButtonLink>
              <ButtonLink
                href="/settings/fixed-expenses"
                variant="secondary"
                className="mt-4"
              >
                固定費設定へ戻る
              </ButtonLink>
            </div>
          ) : preview ? (
            <div>
              <p className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-900">
                {formatTargetMonth(preview.target_month)}分として、以下の固定費を
                {preview.expense_date}付で出金登録します。
              </p>

              {preview.count === 0 ? (
                <p className="mb-4 rounded bg-gray-50 p-4 text-center text-gray-600">
                  今月分の未処理の固定費はありません。
                </p>
              ) : (
                <>
                  <div className="mb-4 space-y-3">
                    {preview.fixed_expenses.map((fixedExpense) => (
                      <section
                        key={fixedExpense.id}
                        className="rounded border border-gray-200 p-4"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h2 className="font-bold">{fixedExpense.memo}</h2>
                            <p className="mt-1 text-sm text-gray-600">
                              {fixedExpense.category.group.name} / {fixedExpense.category.name}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold">
                            {fixedExpense.amount.toLocaleString()} 円
                          </p>
                        </div>
                      </section>
                    ))}
                  </div>

                  <div className="mb-4 rounded bg-gray-50 p-4">
                    <p className="flex justify-between">
                      <span>対象件数</span>
                      <span className="font-bold">{preview.count}件</span>
                    </p>
                    <p className="mt-2 flex justify-between">
                      <span>合計金額</span>
                      <span className="font-bold">
                        {preview.total_amount.toLocaleString()} 円
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={processing}
                    className="w-full rounded bg-green-600 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {processing ? "処理中..." : "出金処理を実行"}
                  </button>
                </>
              )}

              <ButtonLink
                href="/settings/fixed-expenses"
                variant="secondary"
                className="mt-4"
              >
                戻る
              </ButtonLink>
            </div>
          ) : (
            <ButtonLink
              href="/settings/fixed-expenses"
              variant="secondary"
            >
              戻る
            </ButtonLink>
          )}
        </div>
      </main>
    </ClientLayout>
  );
}

export default function FixedExpenseProcessConfirmPage() {
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
      <FixedExpenseProcessConfirmContent />
    </Suspense>
  );
}
