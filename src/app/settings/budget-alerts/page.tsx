"use client";

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

export default function BudgetAlertsPage() {
  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">アラート設定</h1>

          <div className="space-y-4">
            <ButtonLink href="/settings/budget-alerts/create">
              アラート設定
            </ButtonLink>

            <ButtonLink
              href="/settings/budget-alerts/list"
              variant="info"
            >
              アラート一覧・修正
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
