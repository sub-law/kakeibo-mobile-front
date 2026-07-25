// src/app/asset-balances/page.tsx

"use client";

import ClientLayout from "@/components/ClientLayout";
import ButtonLink from "@/components/ui/ButtonLink";

export default function AssetMenuPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">資産メニュー</h1>

          <div className="space-y-4">
            {/* ★ 新しい月次残高一括入力 */}
            <ButtonLink href="/asset-balances/bulk">
              月次残高入力・修正
            </ButtonLink>

            {/* ★ 月次一覧 */}
            <ButtonLink href="/asset-balances/list" variant="success">
              月次残高一覧
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
