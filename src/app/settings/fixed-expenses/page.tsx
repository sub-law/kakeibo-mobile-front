"use client";

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

export default function FixedExpensesPage() {
  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">固定費設定</h1>

          <div className="space-y-4">
            <ButtonLink href="/settings/fixed-expenses/create">
              固定費を登録
            </ButtonLink>

            <ButtonLink
              href="/settings/fixed-expenses/list"
              variant="info"
            >
              固定費一覧・修正
            </ButtonLink>

            <ButtonLink
              href="/settings/fixed-expenses/process/confirm"
              variant="success"
            >
              出金処理
            </ButtonLink>

            <ButtonLink href="/settings" variant="secondary">
              戻る
            </ButtonLink>
          </div>
        </div>
      </main>
    </ClientLayout>
  );
}
