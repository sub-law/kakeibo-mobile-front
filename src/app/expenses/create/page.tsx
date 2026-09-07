//src/app/expenses/create/page.tsx

"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/apiClient";

interface CategoryGroup {
  id: number;
  name: string;
  categories: { id: number; name: string }[];
}

export default function ExpenseCreatePage() {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [categoryFetchError, setCategoryFetchError] = useState("");

  // ★ カテゴリ一覧取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authenticatedFetch("/categories");

        if (!res) {
          return;
        }

        if (!res.ok) {
          throw new Error("カテゴリ一覧の取得に失敗しました。");
        }

        const data: CategoryGroup[] = await res.json();
        setCategoryGroups(data);
      } catch {
        setCategoryFetchError(
          "カテゴリ一覧の取得に失敗しました。時間をおいて再度お試しください。",
        );
      }
    };

    void fetchCategories();
  }, []);

  // ★ 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const res = await authenticatedFetch("/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        amount: Number(amount),
        memo,
        category_id: categoryId,
      }),
    });

    if (!res) {
      return;
    }

    if (res.status === 422) {
      const data = await res.json();
      setErrors(data.errors);
      return;
    }

    if (res.ok) {
      sessionStorage.setItem("expenseSuccessMessage", "登録しました");
      router.push("/expenses/category-summary");
    } else {
      alert("登録に失敗しました");
    }
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">出金入力</h1>

          {categoryFetchError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {categoryFetchError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 日付 */}
            <div>
              <label className="block mb-1 font-semibold">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
              {errors.date && (
                <p className="text-red-600 text-sm mt-1">{errors.date[0]}</p>
              )}
            </div>

            {/* 金額 */}
            <div>
              <label className="block mb-1 font-semibold">出金額</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="no-number-spinner w-full border p-2 rounded"
                placeholder="例: 5,000"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount[0]}</p>
              )}
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block mb-1 font-semibold">カテゴリ</label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full border p-2 rounded"
              >
                <option value="">選択してください</option>

                {categoryGroups.map((group) => (
                  <optgroup key={group.id} label={group.name}>
                    {group.categories.map((cat) => (
                      <option key={`${group.id}-${cat.id}`} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {errors.category_id && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.category_id[0]}
                </p>
              )}
            </div>

            {/* 備考 */}
            <div>
              <label className="block mb-1 font-semibold">備考</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="任意"
              />
              {errors.memo && (
                <p className="text-red-600 text-sm mt-1">{errors.memo[0]}</p>
              )}
            </div>

            <Button type="submit" variant="success">
              登録する
            </Button>

            <ButtonLink href="/expenses" variant="secondary">
              戻る
            </ButtonLink>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
