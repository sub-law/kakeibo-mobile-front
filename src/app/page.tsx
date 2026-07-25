// src/app/page.tsx

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

export default function HomePage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">家計簿トップ</h1>

          <div className="space-y-4">
            <ButtonLink href="/expenses">
              出金メニュー
            </ButtonLink>

            <ButtonLink href="/incomes" variant="success">
              入金メニュー
            </ButtonLink>

            <ButtonLink href="/asset-balances" variant="dark">
              資産メニュー
            </ButtonLink>

            <ButtonLink href="/dashboard" variant="info">
              管理画面
            </ButtonLink>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
