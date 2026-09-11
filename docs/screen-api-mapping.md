# 各画面とAPIの対応

## 前提

この資料は、各`page.tsx`と共通ヘッダーから呼び出しているAPIを画面単位で整理したものです。

- エンドポイントは`NEXT_PUBLIC_API_BASE_URL`からの相対パスです。
- `/login`を除くAPI通信は、原則として`authenticatedFetch`を使用します。
- `authenticatedFetch`は`Authorization: Bearer <token>`と`Accept: application/json`を付与します。
- `GET`はコード上で`method`を省略している呼び出しです。
- 画面遷移は[画面遷移図](./screen-flow.md)、認証時の共通処理は[フロント側の認証フロー](./authentication-flow.md)を参照してください。

## 共通・トップ

| 画面 | フロントURL | メソッド | API | 用途 |
| --- | --- | --- | --- | --- |
| ログイン | `/login` | `POST` | `/login` | メールアドレスとパスワードでログインし、トークンと前回ログイン情報を取得 |
| 共通ヘッダー | 認証後の各画面 | `POST` | `/logout` | API上の現在のトークンを失効させる。通信結果にかかわらず端末側のログイン状態も終了 |
| 家計簿トップ | `/` | `GET` | `/budget-alert-status` | 当月の予算アラートを取得 |
| 家計簿トップ | `/` | `GET` | `/stats/{year}/monthly-summary` | 現在年の月次集計から当月の収支を表示 |
| 家計簿トップ | `/` | `POST` | `/budget-alert-settings/{id}/read` | 表示中の予算アラートを既読化 |
| 家計簿トップ | `/` | `POST` | `/login-histories/{id}/read` | ログイン時に受け取った前回ログイン情報を既読化 |

## 出金

| 画面 | フロントURL | メソッド | API | 用途 |
| --- | --- | --- | --- | --- |
| 出金メニュー | `/expenses` | ― | ― | 出金関連画面と月次固定費設定へのメニュー |
| 出金入力 | `/expenses/create` | `GET` | `/categories` | 入力候補のカテゴリを取得 |
| 出金入力 | `/expenses/create` | `POST` | `/expenses` | 出金を登録 |
| 出金一覧 | `/expenses/list` | `GET` | `/expenses?year={year}&month={month}` | 指定年月の出金を取得 |
| 出金一覧 | `/expenses/list` | `GET` | `/categories` | 大分類・小分類の絞り込み候補を取得 |
| カテゴリ別出金 | `/expenses/category-summary` | `GET` | `/expenses?year={year}&month={month}` | 指定年月の出金を取得してカテゴリ別に集計 |
| カテゴリ別出金 | `/expenses/category-summary` | `GET` | `/categories` | カテゴリ構造と表示名を取得 |
| 出金詳細 | `/expenses/[id]` | `GET` | `/expenses/{id}` | 対象出金の詳細を取得 |
| 出金詳細 | `/expenses/[id]` | `DELETE` | `/expenses/{id}` | 対象出金を削除 |
| 出金修正 | `/expenses/[id]/edit` | `GET` | `/expenses/{id}` | 修正対象の出金を取得 |
| 出金修正 | `/expenses/[id]/edit` | `GET` | `/categories` | カテゴリ候補を取得 |
| 出金修正 | `/expenses/[id]/edit` | `PUT` | `/expenses/{id}` | 対象出金を更新 |

## 入金

| 画面 | フロントURL | メソッド | API | 用途 |
| --- | --- | --- | --- | --- |
| 入金メニュー | `/incomes` | ― | ― | 入金関連画面へのメニュー |
| 入金入力 | `/incomes/create` | `POST` | `/incomes` | 入金を登録 |
| 入金一覧 | `/incomes/list` | `GET` | `/incomes?year={year}&month={month}` | 指定年月の入金を取得 |
| 入金詳細 | `/incomes/[id]` | `GET` | `/incomes/{id}` | 対象入金の詳細を取得 |
| 入金詳細 | `/incomes/[id]` | `DELETE` | `/incomes/{id}` | 対象入金を削除 |
| 入金修正 | `/incomes/[id]/edit` | `GET` | `/incomes/{id}` | 修正対象の入金を取得 |
| 入金修正 | `/incomes/[id]/edit` | `PUT` | `/incomes/{id}` | 対象入金を更新 |

## 資産・管理画面

| 画面 | フロントURL | メソッド | API | 用途 |
| --- | --- | --- | --- | --- |
| 資産メニュー | `/asset-balances` | ― | ― | 月次残高の登録・一覧画面へのメニュー |
| 月次残高登録 | `/asset-balances/bulk` | `GET` | `/accounts` | ログインユーザーの口座一覧を取得 |
| 月次残高登録 | `/asset-balances/bulk` | `GET` | `/asset-balances?year={year}&month={month}` | 入力対象月の登録済み残高を取得 |
| 月次残高登録 | `/asset-balances/bulk` | `POST` | `/asset-balances/bulk` | 対象月の口座残高を一括登録・更新 |
| 月次残高一覧 | `/asset-balances/list` | `GET` | `/asset-balances?year={year}&month={month}` | 指定月の口座別残高を取得 |
| 管理画面 | `/dashboard` | `GET` | `/stats/{year}/monthly-summary` | 年間の入金・出金・資産推移を取得 |
| 出金・入金明細 | `/dashboard/cashflow` | `GET` | `/expenses?year={year}&month={month}` | 指定月の出金明細を取得 |
| 出金・入金明細 | `/dashboard/cashflow` | `GET` | `/incomes?year={year}&month={month}` | 指定月の入金明細を取得 |

## 各種設定・予算アラート

| 画面 | フロントURL | メソッド | API | 用途 |
| --- | --- | --- | --- | --- |
| 各種設定 | `/settings` | ― | ― | 予算アラートとパスワード変更へのメニュー |
| パスワード変更 | `/settings/password` | `PUT` | `/user/password` | パスワードを変更し、成功後に再ログインへ移動 |
| アラート設定 | `/settings/budget-alerts` | ― | ― | 予算アラートの登録・一覧画面へのメニュー |
| アラート登録 | `/settings/budget-alerts/create` | `GET` | `/categories` | 設定対象のカテゴリ候補を取得 |
| アラート登録 | `/settings/budget-alerts/create` | `POST` | `/budget-alert-settings` | 予算額、警告割合、有効状態を登録 |
| アラート一覧 | `/settings/budget-alerts/list` | `GET` | `/budget-alert-settings` | 登録済みアラート設定を取得 |
| アラート一覧 | `/settings/budget-alerts/list` | `DELETE` | `/budget-alert-settings/{id}` | 対象アラート設定を削除 |
| アラート修正 | `/settings/budget-alerts/[id]/edit` | `GET` | `/budget-alert-settings/{id}` | 修正対象の設定を取得 |
| アラート修正 | `/settings/budget-alerts/[id]/edit` | `GET` | `/categories` | 設定対象のカテゴリ候補を取得 |
| アラート修正 | `/settings/budget-alerts/[id]/edit` | `PUT` | `/budget-alert-settings/{id}` | 対象アラート設定を更新 |

## 月次固定費

| 画面 | フロントURL | メソッド | API | 用途 |
| --- | --- | --- | --- | --- |
| 月次固定費設定 | `/settings/fixed-expenses` | ― | ― | 固定費の登録・一覧・当月処理へのメニュー |
| 月次固定費登録 | `/settings/fixed-expenses/create` | `GET` | `/categories` | 固定費に設定するカテゴリ候補を取得 |
| 月次固定費登録 | `/settings/fixed-expenses/create` | `POST` | `/fixed-expenses` | 金額、メモ、カテゴリ、有効状態を登録 |
| 月次固定費一覧 | `/settings/fixed-expenses/list` | `GET` | `/fixed-expenses` | 登録済み固定費を取得 |
| 月次固定費修正 | `/settings/fixed-expenses/[id]/edit` | `GET` | `/fixed-expenses/{id}` | 修正対象の固定費を取得 |
| 月次固定費修正 | `/settings/fixed-expenses/[id]/edit` | `GET` | `/categories` | 固定費に設定するカテゴリ候補を取得 |
| 月次固定費修正 | `/settings/fixed-expenses/[id]/edit` | `PUT` | `/fixed-expenses/{id}` | 対象固定費を更新 |
| 月次固定費出金の確認 | `/settings/fixed-expenses/process/confirm` | `GET` | `/fixed-expenses/process-preview?target_month={YYYY-MM}` | 対象月に出金化する有効な固定費を事前確認 |
| 月次固定費出金の確認 | `/settings/fixed-expenses/process/confirm` | `POST` | `/fixed-expenses/process` | 対象月の固定費を出金として登録 |

## 画面側のエラー処理

`authenticatedFetch`が返した`401`以外のHTTPエラーは、各画面がステータスを判定します。入力系画面は主に`422 Unprocessable Entity`の項目別エラーを表示し、取得・更新・削除の失敗時は画面ごとの日本語メッセージを表示します。

API URL未設定やネットワーク例外は共通の接続エラーへ変換されます。認証切れを含むリダイレクトの扱いは[フロント側の認証フロー](./authentication-flow.md)に記載しています。
