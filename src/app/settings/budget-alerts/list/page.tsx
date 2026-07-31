"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

interface BudgetAlertSetting {
  id: number;
  monthly_budget: number;
  warning_threshold_percent: number;
  is_enabled: boolean;
  category: {
    id: number;
    name: string;
    group: {
      id: number;
      name: string;
    };
  };
}

export default function BudgetAlertListPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<BudgetAlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<BudgetAlertSetting | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/budget-alert-settings`,
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
          throw new Error("アラート設定一覧の取得に失敗しました。");
        }

        const data: BudgetAlertSetting[] = await response.json();

        if (!cancelled) {
          setSettings(data);
        }
      } catch {
        if (!cancelled) {
          setRequestError(
            "アラート設定一覧の取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchSettings();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/budget-alert-settings/${deleteTarget.id}`,
        {
          method: "DELETE",
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
        throw new Error("アラート設定の削除に失敗しました。");
      }

      setSettings((current) =>
        current.filter((setting) => setting.id !== deleteTarget.id),
      );
    } catch {
      setRequestError(
        "アラート設定の削除に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-lg rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">アラート一覧・修正</h1>

          {requestError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700">
              {requestError}
            </p>
          )}

          {loading ? (
            <p className="py-6 text-center text-gray-600">読み込み中...</p>
          ) : settings.length === 0 ? (
            <p className="rounded bg-gray-50 p-4 text-center text-gray-600">
              アラート設定はありません。
            </p>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <section
                  key={setting.id}
                  className="rounded border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        {setting.category.group.name}
                      </p>
                      <h2 className="font-bold text-gray-900">
                        {setting.category.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-700">
                        月間予算：
                        {setting.monthly_budget.toLocaleString()} 円
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        警告割合：{setting.warning_threshold_percent}%
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          setting.is_enabled
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {setting.is_enabled ? "有効" : "無効"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <ButtonLink
                        href={`/settings/budget-alerts/${setting.id}/edit`}
                        size="compact"
                        full={false}
                      >
                        修正
                      </ButtonLink>
                      <Button
                        variant="danger"
                        size="compact"
                        full={false}
                        onClick={() => setDeleteTarget(setting)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}

          <ButtonLink
            href="/settings/budget-alerts/create"
            variant="success"
            className="mt-4"
          >
            アラート設定を追加
          </ButtonLink>

          <ButtonLink
            href="/settings/budget-alerts"
            variant="secondary"
            className="mt-4"
          >
            戻る
          </ButtonLink>
        </div>
      </main>

      <ModalConfirmDelete
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </ClientLayout>
  );
}
