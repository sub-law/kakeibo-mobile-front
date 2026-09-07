# 家計簿アプリフロントエンド側

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
Ctrl+Cでターミナルに戻ります
```

## キャッシュクリアコマンド

```bash
rm -rf .next
```

確認用URL：

```
http://localhost:3000
```

---

## 🧪 動作確認

Lintを実行：

```bash
npm run lint
```

ローカルでプロダクションビルドを確認：

```bash
npm run build
```

認証・トークン有効期限に関する手動確認項目：

- 有効なトークンでログイン後の各画面を利用できる
- トークンがない状態でログインが必要な画面を開くと、ログイン画面へ移動する
- APIが401を返すと、保存されているトークンが削除され、ログイン画面に再ログイン案内が表示される
- APIの一時的な通信エラーや401以外のエラーでは、自動的にログアウトされない
- ログアウトAPIが失敗した場合も、端末上のログイン状態を終了できる

---

## 🔐 セキュリティヘッダー

すべての画面レスポンスに、以下のセキュリティヘッダーを設定しています。

- `Content-Security-Policy-Report-Only`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: DENY`

CSPは現在Report-Onlyで設定されているため、違反したリソースはブロックされません。
ローカル環境のブラウザ開発者ツールで、意図しないCSP違反がないことを確認します。

ローカル環境での確認項目：

- ログイン、ログアウト、期限切れ時の再ログインが正常に動作する
- トップ画面、出金、入金、資産、各種設定画面が正常に表示される
- 管理画面のグラフ、ツールチップ、凡例が正常に表示される
- ローカルAPIとの通信がCSP違反として報告されない
- JavaScript、CSS、フォント、画像について意図しないCSP違反がない
- レスポンスヘッダーに設定した各セキュリティヘッダーが含まれる

`connect-src`には、`NEXT_PUBLIC_API_BASE_URL`から取得したAPIのオリジンが自動的に追加されます。

---

## 📦 動作環境

- Next.js v16.2.4
- React v19.2.4
- TypeScript v5.9.3
- Node.js v20.19.3

---

## 📘 補足

- `.env.local` は Git 管理しません
- API URL は Laravel 側のポートに合わせて変更してください
