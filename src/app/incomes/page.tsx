// src/app/incomes/page.tsx

"use client";

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

export default function IncomeMenuPage() {

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">入金メニュー</h1>

          <div className="space-y-4">
            <ButtonLink href="/incomes/create">
              入金入力
            </ButtonLink>

            <ButtonLink href="/incomes/list" variant="success">
              入金一覧
            </ButtonLink>

            <ButtonLink href="/" variant="secondary">
              戻る
            </ButtonLink>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
