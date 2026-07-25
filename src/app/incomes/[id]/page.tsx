//src/app/incomes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes/${id}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: Income) => {
        setIncome(data);
      })
      .catch((err) => {
        console.error("detail error:", err);
        router.push("/login");
      });
  }, [id, router]);

  if (!income) {
    return (
      <ClientLayout>
        <div className="p-6 text-center">読み込み中...</div>
      </ClientLayout>
    );
  }

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes/${income.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

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
