// src/app/expenses/page.tsx

"use client";

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

export default function ExpenseMenuPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">出金メニュー</h1>

          <div className="space-y-4">
            <ButtonLink variant="navigation" href="/expenses/create">
              出金入力
            </ButtonLink>

            <ButtonLink href="/expenses/list" variant="navigation">
              出金一覧
            </ButtonLink>

            <ButtonLink href="/expenses/category-summary" variant="navigation">
              出金一覧（カテゴリ別）
            </ButtonLink>

            <ButtonLink href="/settings/fixed-expenses" variant="navigation">
              月次固定費設定
            </ButtonLink>

            <ButtonLink href="/" variant="secondary">
              トップへ戻る
            </ButtonLink>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
