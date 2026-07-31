// src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

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

export default function HomePage() {
  const router = useRouter();
  const [alertStatus, setAlertStatus] = useState<BudgetAlertStatus | null>(null);
  const [alertFetchError, setAlertFetchError] = useState("");
  const [readError, setReadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchAlertStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/budget-alert-status`,
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

    void fetchAlertStatus();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleRead = async (settingId: number) => {
    setReadError("");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/budget-alert-settings/${settingId}/read`,
        {
          method: "POST",
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

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">家計簿トップ</h1>

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
            <ButtonLink href="/expenses">
              出金メニュー
            </ButtonLink>

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
        </div>
      </div>
    </ClientLayout>
  );
}
