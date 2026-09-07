//src/app/incomes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { authenticatedFetch } from "@/lib/apiClient";

interface Income {
  id: number;
  date: string;
  amount: number;
  memo?: string;
}

export default function IncomeDetailPage() {
  const router = useRouter();
  const params = useParams();

  // id を安全に取得（配列対策）
  const id = Array.isArray(params.id)
    ? Number(params.id[0])
    : Number(params.id);

  const [income, setIncome] = useState<Income | null>(null);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchIncome = async () => {
      setFetchError("");

      try {
        const res = await authenticatedFetch(`/incomes/${id}`);

        if (!res) {
          return;
        }

        if (!res.ok) {
          throw new Error("入金詳細の取得に失敗しました。");
        }

        const data: Income = await res.json();
        setIncome(data);
      } catch (err) {
        console.error("detail error:", err);
        setFetchError(
          "入金詳細の取得に失敗しました。時間をおいて再度お試しください。",
        );
      }
    };

    void fetchIncome();
  }, [id]);

  if (!income) {
    return (
      <ClientLayout>
        <div className="p-6 text-center">
          {fetchError || "読み込み中..."}
        </div>
      </ClientLayout>
    );
  }

  const handleDelete = async () => {
    const res = await authenticatedFetch(`/incomes/${income.id}`, {
      method: "DELETE",
    });

    if (!res) {
      return;
    }

    if (res.ok) {
      // 削除成功 → 一覧へ
      router.push("/incomes/list");
    } else {
      alert("削除に失敗しました");
    }

    setOpen(false);
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">入金詳細</h1>

          {/* 日付・金額 */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div>
              <p className="text-gray-600 text-sm">入金日</p>
              <p className="font-semibold">{income.date}</p>
            </div>

            <div className="text-right">
              <p className="text-gray-600 text-sm">金額</p>
              <p className="font-semibold text-lg">
                {income.amount.toLocaleString()} 円
              </p>
            </div>
          </div>

          {/* 備考 */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-1">備考</p>
            <p className="p-3 bg-gray-50 rounded border">
              {income.memo ?? "（なし）"}
            </p>
          </div>

          {/* 修正・削除ボタン */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              full={false}
              className="flex-1"
              onClick={() => router.push(`/incomes/${income.id}/edit`)}
            >
              修正
            </Button>

            <Button
              variant="danger"
              full={false}
              className="flex-1"
              onClick={() => setOpen(true)}
            >
              削除
            </Button>
          </div>

          <ButtonLink href="/incomes/list" variant="secondary" className="mt-4">
            戻る
          </ButtonLink>
        </div>
      </div>

      {/* 削除確認モーダル */}
      <ModalConfirmDelete
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </ClientLayout>
  );
}
