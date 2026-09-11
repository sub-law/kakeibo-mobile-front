//src/app/expenses/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import ClientLayout from "@/components/ClientLayout";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import {
  authenticatedFetch,
  getApiErrorMessage,
} from "@/lib/apiClient";

interface Expense {
  id: number;
  date: string;
  amount: number;
  memo?: string;
  category: {
    name: string;
    group: {
      name: string;
    };
  };
}

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params.id)
    ? Number(params.id[0])
    : Number(params.id);

  const [expense, setExpense] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchExpense = async () => {
      setFetchError("");

      try {
        const res = await authenticatedFetch(`/expenses/${id}`);

        if (!res) {
          return;
        }

        if (!res.ok) {
          throw new Error("出金詳細の取得に失敗しました。");
        }

        const data: Expense = await res.json();
        setExpense(data);
      } catch {
        setFetchError(
          "出金詳細の取得に失敗しました。時間をおいて再度お試しください。",
        );
      }
    };

    void fetchExpense();
  }, [id]);

  if (!expense) {
    return (
      <ClientLayout>
        <div className="p-6 text-center">
          {fetchError || "読み込み中..."}
        </div>
      </ClientLayout>
    );
  }

  const handleDelete = async () => {
    setDeleteError("");

    try {
      const res = await authenticatedFetch(`/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (!res) {
        return;
      }

      if (!res.ok) {
        setDeleteError(
          "出金の削除に失敗しました。時間をおいて再度お試しください。",
        );
        return;
      }

      router.push("/expenses/list");
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "出金の削除に失敗しました。時間をおいて再度お試しください。",
        ),
      );
    } finally {
      setOpen(false);
    }
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">出金詳細</h1>

          {deleteError && (
            <p className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
              {deleteError}
            </p>
          )}

          {/* 日付・金額 */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div>
              <p className="text-gray-600 text-sm">出金日</p>
              <p className="font-semibold">{expense.date}</p>
            </div>

            <div className="text-right">
              <p className="text-gray-600 text-sm">金額</p>
              <p className="font-semibold text-lg">
                {expense.amount.toLocaleString()} 円
              </p>
            </div>
          </div>

          {/* カテゴリ */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">カテゴリ</p>
            <p className="p-3 bg-gray-50 rounded border">
              {expense.category.group.name} / {expense.category.name}
            </p>
          </div>

          {/* 備考 */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-1">備考</p>
            <p className="p-3 bg-gray-50 rounded border">
              {expense.memo ?? "（なし）"}
            </p>
          </div>

          {/* 修正・削除 */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              full={false}
              className="flex-1"
              onClick={() => router.push(`/expenses/${expense.id}/edit`)}
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

          <ButtonLink
            href="/expenses/list"
            variant="secondary"
            className="mt-4"
          >
            戻る
          </ButtonLink>
        </div>
      </div>

      <ModalConfirmDelete
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </ClientLayout>
  );
}
