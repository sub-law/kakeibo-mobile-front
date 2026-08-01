"use client";

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

function getCurrentMonthInJst() {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

export default function FixedExpensesPage() {
  const targetMonth = getCurrentMonthInJst();

  return (
    <ClientLayout>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">固定費設定</h1>

          <div className="space-y-4">
            <ButtonLink href="/settings/fixed-expenses/create">
              固定費登録
            </ButtonLink>

            <ButtonLink
              href="/settings/fixed-expenses/list"
              variant="info"
            >
              固定費一覧・修正
            </ButtonLink>

            <ButtonLink
              href={`/settings/fixed-expenses/process/confirm?target_month=${targetMonth}`}
              variant="success"
            >
              今月分を出金処理
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
