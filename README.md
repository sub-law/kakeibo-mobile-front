# 家計簿アプリフロントエンド側

スマートフォン向けの1カラムUIで、入出金、月次資産残高、年次ダッシュボード、予算アラート、固定費を操作するNext.jsアプリです。

## プロジェクト構成

この家計簿アプリは、フロントエンドとAPIを別々のGitHubリポジトリで管理しています。

- フロントエンド：`kakeibo-mobile-front`
- API：`kakeibo-mobile-api`

ローカルでは、次の構成で配置することを推奨します。

```text
kakeibo-mobile/
├── kakeibo-mobile-front/
└── kakeibo-mobile-api/
```

## 🚀 セットアップ手順

### 1. リポジトリをクローン

```bash
git clone <リポジトリURL> <フォルダ名>
cd <フォルダ名>
```

### 2. 依存パッケージをインストール

```bash
npm install
```

---

## 🧰 環境変数の設定

### 3. `.env.local` を作成

Next.js では `.env.local` は Git 管理されないため、各自で作成します。

```bash
touch .env.local
```

`.env.local` に以下を記述：

```
NEXT_PUBLIC_API_BASE_URL=http://localhost/api
```

## 🏃 開発サーバー起動

```bash
npm run dev
```

Ctrl+Cでターミナルに戻ります

## キャッシュクリアコマンド

```bash
rm -rf .next
```

確認用URL：

```
http://localhost:3000
```

## 静的検査

```bash
npm run lint
```

---

## 📦 動作環境

- Next.js v16.2.10
- React v19.2.4
- TypeScript v5.9.3
- Recharts v3.10.0
- Tailwind CSS v4.2.3
- Node.js v20.19.3

---

## 📘 補足

- `.env.local` は Git 管理しません
- API URL は Laravel 側のポートに合わせて変更してください

## 画面遷移図

現行の全28画面と主要遷移は、[docs/screen-transition-diagram.svg](docs/screen-transition-diagram.svg)を参照してください。
