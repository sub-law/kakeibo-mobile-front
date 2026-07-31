"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

interface CategoryGroup {
  id: number;
  name: string;
  categories: Array<{
    id: number;
    name: string;
  }>;
}

export default function BudgetAlertCreatePage() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [warningThresholdPercent, setWarningThresholdPercent] = useState("70");
  const [isEnabled, setIsEnabled] = useState(true);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`,
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
          throw new Error("カテゴリの取得に失敗しました。");
        }

        const data: CategoryGroup[] = await response.json();

        if (!cancelled) {
          setCategoryGroups(data);
        }
      } catch {
        if (!cancelled) {
          setRequestError(
            "カテゴリの取得に失敗しました。時間をおいて再度お試しください。",
          );
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setRequestError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/budget-alert-settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            category_id: categoryId ? Number(categoryId) : null,
            monthly_budget: Number(monthlyBudget),
            warning_threshold_percent: Number(warningThresholdPercent),
            is_enabled: isEnabled,
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
        setErrors(data.errors);
        return;
      }

      if (response.status === 409) {
        const data = await response.json();
        setRequestError(data.message);
        return;
      }

      if (!response.ok) {
        throw new Error("アラート設定の登録に失敗しました。");
      }

      setSuccessMessage("アラート設定を登録しました。");
      setTimeout(() => {
        router.push("/settings/budget-alerts/list");
      }, 1000);
    } catch {
      setRequestError(
        "アラート設定の登録に失敗しました。時間をおいて再度お試しください。",
      );
    }
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">アラート設定</h1>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block font-semibold"
              >
                カテゴリ選択
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded border bg-white p-2"
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "読み込み中..." : "選択してください"}
                </option>
                {categoryGroups.map((group) => (
                  <optgroup key={group.id} label={group.name}>
                    {group.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category_id[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="monthly-budget"
                className="mb-1 block font-semibold"
              >
                金額入力
              </label>
              <input
                id="monthly-budget"
                type="number"
                min="1"
                max="4294967295"
                value={monthlyBudget}
                onChange={(event) => setMonthlyBudget(event.target.value)}
                className="no-number-spinner w-full rounded border p-2"
                placeholder="例: 120000"
              />
              {errors.monthly_budget && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.monthly_budget[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="warning-threshold-percent"
                className="mb-1 block font-semibold"
              >
                警告割合（%）
              </label>
              <input
                id="warning-threshold-percent"
                type="number"
                min="1"
                max="99"
                value={warningThresholdPercent}
                onChange={(event) =>
                  setWarningThresholdPercent(event.target.value)
                }
                className="no-number-spinner w-full rounded border p-2"
                placeholder="例: 70"
              />
              {errors.warning_threshold_percent && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.warning_threshold_percent[0]}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(event) => setIsEnabled(event.target.checked)}
                className="h-4 w-4"
              />
              アラートを有効にする
            </label>
            {errors.is_enabled && (
              <p className="text-sm text-red-600">{errors.is_enabled[0]}</p>
            )}

            <p className="rounded bg-gray-50 p-3 text-sm text-gray-600">
              選択した小分類の出金額が設定した割合に達したときと、設定金額に達したときにトップ画面でお知らせします。
            </p>

            <Button type="submit" variant="success">
              登録する
            </Button>

            <ButtonLink
              href="/settings/budget-alerts"
              variant="secondary"
            >
              戻る
            </ButtonLink>
          </form>
        </div>
      </main>
    </ClientLayout>
  );
}
