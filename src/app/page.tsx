// src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { authenticatedFetch } from "@/lib/apiClient";

interface BudgetAlert {
  setting_id: number;
  level: "warning" | "danger";
  category: {
    id: number;
    name: string;
  };
  monthly_budget: number;
  warning_threshold_percent: number;
  spent_amount: number;
  usage_rate: number;
  message: string;
}

interface BudgetAlertStatus {
  alerts: BudgetAlert[];
}

interface MonthlySummary {
  month: number;
  income: number;
  expense: number;
}

interface StatsResponse {
  monthly: MonthlySummary[];
}

interface PreviousLogin {
  id: number;
  logged_in_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

const formatLoginDateTime = (dateTime: string) => {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "日時を表示できません";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(date);
};

export default function HomePage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [alertStatus, setAlertStatus] = useState<BudgetAlertStatus | null>(null);
  const [alertFetchError, setAlertFetchError] = useState("");
  const [readError, setReadError] = useState("");
  const [monthlySummary, setMonthlySummary] =
    useState<MonthlySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryFetchError, setSummaryFetchError] = useState("");
  const [previousLogin, setPreviousLogin] = useState<
    PreviousLogin | null | undefined
  >(undefined);
  const [loginHistoryReadError, setLoginHistoryReadError] = useState("");
  const [showPreviousLoginDetails, setShowPreviousLoginDetails] =
    useState(false);

  useEffect(() => {
    const storedPreviousLogin = sessionStorage.getItem("previousLogin");

    if (storedPreviousLogin === null) {
      return;
    }

    try {
      const parsedPreviousLogin: PreviousLogin | null =
        JSON.parse(storedPreviousLogin);

      Promise.resolve().then(() => setPreviousLogin(parsedPreviousLogin));
    } catch {
      sessionStorage.removeItem("previousLogin");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchAlertStatus = async () => {
      try {
        const response = await authenticatedFetch("/budget-alert-status");

        if (!response) {
          return;
        }

        if (!response.ok) {
          throw new Error("予算アラートの取得に失敗しました。");
        }

        const data: BudgetAlertStatus = await response.json();

        if (!cancelled) {
          setAlertStatus(data);
        }
      } catch {
        if (!cancelled) {
          setAlertFetchError(
            "予算アラートの取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      }
    };

    const fetchMonthlySummary = async () => {
      try {
        const response = await authenticatedFetch(
          `/stats/${currentYear}/monthly-summary`,
        );

        if (!response) {
          return;
        }

        if (!response.ok) {
          throw new Error("当月の収支の取得に失敗しました。");
        }

        const data: StatsResponse = await response.json();
        const summary = data.monthly.find(
          (item) => item.month === currentMonth,
        );

        if (!summary) {
          throw new Error("当月の収支が見つかりませんでした。");
        }

        if (!cancelled) {
          setMonthlySummary(summary);
        }
      } catch {
        if (!cancelled) {
          setSummaryFetchError(
            "当月の収支の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    };

    void fetchAlertStatus();
    void fetchMonthlySummary();

    return () => {
      cancelled = true;
    };
  }, [currentMonth, currentYear]);

  const handleRead = async (settingId: number) => {
    setReadError("");

    try {
      const response = await authenticatedFetch(
        `/budget-alert-settings/${settingId}/read`,
        {
          method: "POST",
        },
      );

      if (!response) {
        return;
      }

      if (!response.ok) {
        throw new Error("アラートを既読にできませんでした。");
      }

      setAlertStatus((current) =>
        current
          ? {
              alerts: current.alerts.filter(
                (alert) => alert.setting_id !== settingId,
              ),
            }
          : current,
      );
    } catch {
      setReadError(
        "アラートを既読にできませんでした。時間をおいて再度お試しください。",
      );
    }
  };

  const handleLoginHistoryRead = async (historyId: number) => {
    setLoginHistoryReadError("");

    try {
      const response = await authenticatedFetch(
        `/login-histories/${historyId}/read`,
        {
          method: "POST",
        },
      );

      if (!response) {
        return;
      }

      if (!response.ok) {
        throw new Error("ログイン履歴を既読にできませんでした。");
      }

      sessionStorage.removeItem("previousLogin");
      setPreviousLogin(undefined);
    } catch {
      setLoginHistoryReadError(
        "ログイン履歴を既読にできませんでした。時間をおいて再度お試しください。",
      );
    }
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">家計簿トップ</h1>

          {previousLogin === null ? (
            <p className="mb-4 rounded bg-gray-50 px-3 py-2 text-sm text-gray-600">
              前回ログイン：なし（初回ログイン）
            </p>
          ) : previousLogin ? (
            <section className="mb-4 rounded border border-blue-200 bg-blue-50 p-4 text-sm text-gray-700">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-gray-900">前回のログイン</h2>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="navigation"
                    size="compact"
                    full={false}
                    className="text-gray-800"
                    onClick={() =>
                      setShowPreviousLoginDetails((current) => !current)
                    }
                  >
                    {showPreviousLoginDetails ? "閉じる" : "詳細"}
                  </Button>
                  <Button
                    variant="navigation"
                    size="compact"
                    full={false}
                    className="text-gray-800"
                    onClick={() => handleLoginHistoryRead(previousLogin.id)}
                  >
                    既読
                  </Button>
                </div>
              </div>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="font-semibold">日時</dt>
                  <dd>{formatLoginDateTime(previousLogin.logged_in_at)}</dd>
                </div>
                {showPreviousLoginDetails && (
                  <>
                    <div>
                      <dt className="font-semibold">IPアドレス</dt>
                      <dd>{previousLogin.ip_address ?? "取得できません"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">端末情報</dt>
                      <dd className="break-all">
                        {previousLogin.user_agent ?? "取得できません"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              {loginHistoryReadError && (
                <p className="mt-3 text-red-700">{loginHistoryReadError}</p>
              )}
            </section>
          ) : null}

          {alertFetchError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {alertFetchError}
            </p>
          )}

          {readError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {readError}
            </p>
          )}

          {!alertFetchError && alertStatus === null ? (
            <p className="mb-4 rounded bg-gray-50 p-3 text-center text-sm text-gray-600">
              お知らせを確認中...
            </p>
          ) : alertStatus?.alerts.length === 0 ? (
            <p
              aria-live="polite"
              className="mb-4 rounded border border-gray-200 bg-gray-50 p-3 text-center text-gray-700"
            >
              現在お知らせはありません
            </p>
          ) : (
            <div className="mb-4 space-y-3" aria-live="polite">
              {alertStatus?.alerts.map((alert) => (
                <section
                  key={alert.setting_id}
                  className={`rounded border p-4 ${
                    alert.level === "danger"
                      ? "border-red-300 bg-red-100 text-red-800"
                      : "border-amber-300 bg-amber-100 text-amber-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{alert.message}</p>
                    <Button
                      variant="navigation"
                      size="compact"
                      full={false}
                      className="shrink-0 text-gray-800"
                      onClick={() => handleRead(alert.setting_id)}
                    >
                      既読
                    </Button>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                    <dt>月間予算</dt>
                    <dd className="text-right">
                      {alert.monthly_budget.toLocaleString()} 円
                    </dd>
                    <dt>現在の出金</dt>
                    <dd className="text-right">
                      {alert.spent_amount.toLocaleString()} 円
                    </dd>
                    <dt>現在の使用割合</dt>
                    <dd className="text-right">
                      {alert.usage_rate.toLocaleString()}%
                    </dd>
                    <dt>警告割合</dt>
                    <dd className="text-right">
                      {alert.warning_threshold_percent}%
                    </dd>
                  </dl>
                </section>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <ButtonLink href="/expenses">出金メニュー</ButtonLink>

            <ButtonLink href="/incomes" variant="success">
              入金メニュー
            </ButtonLink>

            <ButtonLink href="/asset-balances" variant="dark">
              資産メニュー
            </ButtonLink>

            <ButtonLink href="/dashboard" variant="info">
              管理画面
            </ButtonLink>

            <ButtonLink href="/settings" variant="secondary">
              各種設定
            </ButtonLink>
          </div>

          <section
            className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
            aria-labelledby="monthly-summary-heading"
          >
            <h2
              id="monthly-summary-heading"
              className="mb-3 text-lg font-bold text-gray-900"
            >
              {currentMonth}月の収支
            </h2>

            {summaryFetchError ? (
              <p className="rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
                {summaryFetchError}
              </p>
            ) : summaryLoading ? (
              <p className="py-3 text-center text-sm text-gray-600">
                当月の収支を読み込み中...
              </p>
            ) : monthlySummary ? (
              <div className="grid grid-cols-2 gap-3" aria-live="polite">
                <Link
                  href="/expenses/category-summary"
                  className="rounded border border-red-200 bg-white p-3 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <span className="block text-sm text-gray-600">
                    当月の出金
                  </span>
                  <span className="mt-1 block font-bold text-red-700">
                    {monthlySummary.expense.toLocaleString()} 円
                  </span>
                </Link>

                <Link
                  href="/incomes/list"
                  className="rounded border border-green-200 bg-white p-3 transition hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  <span className="block text-sm text-gray-600">
                    当月の収入
                  </span>
                  <span className="mt-1 block font-bold text-green-700">
                    {monthlySummary.income.toLocaleString()} 円
                  </span>
                </Link>

                <div className="col-span-2 border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">差額（収入 − 出金）</p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      monthlySummary.income - monthlySummary.expense >= 0
                        ? "text-blue-700"
                        : "text-red-700"
                    }`}
                  >
                    {(
                      monthlySummary.income - monthlySummary.expense
                    ).toLocaleString()}{" "}
                    円
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </ClientLayout>
  );
}
