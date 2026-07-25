//src/app/incomes/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { useRouter, useParams } from "next/navigation";

export default function IncomeEditPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id)
    ? Number(params.id[0])
    : Number(params.id);

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [successMessage, setSuccessMessage] = useState("");
  // ★ 初期値を API から取得
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDate(data.date);
        setAmount(data.amount.toString());
        setMemo(data.memo ?? "");
      })
      .catch(() => router.push("/login"));
  }, [id, router]);

  // ★ 更新処理（PUT）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          date,
          amount: Number(amount),
          memo,
        }),
      },
    );

    if (res.status === 422) {
      const data = await res.json();
      setErrors(data.errors);
      return;
    }

    if (res.ok) {
      setSuccessMessage("修正しました");

      // 2秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage("");
        router.push(`/incomes/list`);
      }, 1000);

      return;
    } else {
      alert("更新に失敗しました");
    }
  };

  return (
    <ClientLayout>
      {successMessage && (
        <p className="mb-4 p-2 text-green-700 bg-green-100 border border-green-300 rounded text-center">
          {successMessage}
        </p>
      )}

      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">入金修正</h1>

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

            {/* 入金額 */}
            <div>
              <label className="block mb-1 font-semibold">入金額</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="no-number-spinner w-full border p-2 rounded"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount[0]}</p>
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
              />
              {errors.memo && (
                <p className="text-red-600 text-sm mt-1">{errors.memo[0]}</p>
              )}
            </div>

            <Button type="submit" variant="primary">
              修正する
            </Button>

            <ButtonLink href={`/incomes/${id}`} variant="secondary">
              戻る
            </ButtonLink>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
