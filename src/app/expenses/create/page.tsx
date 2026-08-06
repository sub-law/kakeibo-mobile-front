//src/app/expenses/create/page.tsx

"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useRouter } from "next/navigation";

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

  // ★ カテゴリ一覧取得
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

  // ★ 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          date,
          amount: Number(amount),
          memo,
          category_id: categoryId,
        }),
      },
    );

    if (res.status === 422) {
      const data = await res.json();
      setErrors(data.errors);
      return;
    }

    if (res.ok) {
      sessionStorage.setItem("expenseCreateSuccessMessage", "登録しました");
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
