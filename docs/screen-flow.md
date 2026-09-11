# 画面遷移図

## この資料について

この資料は、`src/app`のApp Router構成と、画面内のリンク・遷移処理を基にしたフロントエンドの画面遷移図です。

- URL中の`[id]`は、出金・入金・設定などのIDが入る動的セグメントです。
- `/login`以外はログイン後の利用を想定しています。
- 共通ヘッダーのログアウト、トークン未保存、APIからの`401 Unauthorized`は、いずれも最終的に`/login`へ遷移します。
- APIとの対応は[各画面とAPIの対応](./screen-api-mapping.md)、認証処理の詳細は[フロント側の認証フロー](./authentication-flow.md)を参照してください。

## 全体構成

```mermaid
flowchart TD
    Login["ログイン<br/>/login"] -->|ログイン成功| Home["家計簿トップ<br/>/"]

    Home --> Expenses["出金メニュー<br/>/expenses"]
    Home --> Incomes["入金メニュー<br/>/incomes"]
    Home --> Assets["資産メニュー<br/>/asset-balances"]
    Home --> Dashboard["管理画面<br/>/dashboard"]
    Home --> Settings["各種設定<br/>/settings"]

    Expenses --> FixedExpenses["月次固定費設定<br/>/settings/fixed-expenses"]
    Dashboard --> Cashflow["出金・入金明細<br/>/dashboard/cashflow"]
    Settings --> BudgetAlerts["アラート設定<br/>/settings/budget-alerts"]
    Settings --> Password["パスワード変更<br/>/settings/password"]

    Protected["認証が必要な画面"] -. "トークンなし・401・ログアウト" .-> Login
```

## 出金・入金

```mermaid
flowchart TD
    Home["家計簿トップ<br/>/"] --> ExpenseMenu["出金メニュー<br/>/expenses"]
    Home -->|当月の出金| ExpenseSummary["カテゴリ別出金<br/>/expenses/category-summary"]

    ExpenseMenu --> ExpenseCreate["出金入力<br/>/expenses/create"]
    ExpenseMenu --> ExpenseList["出金一覧<br/>/expenses/list"]
    ExpenseMenu --> ExpenseSummary
    ExpenseMenu --> FixedMenu["月次固定費設定<br/>/settings/fixed-expenses"]
    ExpenseCreate -->|登録成功| ExpenseSummary
    ExpenseSummary -->|年月・大分類を指定| ExpenseList
    ExpenseList --> ExpenseDetail["出金詳細<br/>/expenses/[id]"]
    ExpenseDetail --> ExpenseEdit["出金修正<br/>/expenses/[id]/edit"]
    ExpenseDetail -->|削除成功| ExpenseList
    ExpenseEdit -->|更新成功| ExpenseList

    Home --> IncomeMenu["入金メニュー<br/>/incomes"]
    Home -->|当月の入金| IncomeList["入金一覧<br/>/incomes/list"]
    IncomeMenu --> IncomeCreate["入金入力<br/>/incomes/create"]
    IncomeMenu --> IncomeList
    IncomeCreate -->|登録成功| IncomeList
    IncomeList --> IncomeDetail["入金詳細<br/>/incomes/[id]"]
    IncomeDetail --> IncomeEdit["入金修正<br/>/incomes/[id]/edit"]
    IncomeDetail -->|削除成功| IncomeList
    IncomeEdit -->|更新成功| IncomeList
```

## 資産・管理画面

```mermaid
flowchart TD
    Home["家計簿トップ<br/>/"] --> AssetMenu["資産メニュー<br/>/asset-balances"]
    AssetMenu --> AssetBulk["月次残高登録<br/>/asset-balances/bulk"]
    AssetMenu --> AssetList["月次残高一覧<br/>/asset-balances/list"]
    AssetBulk -->|登録・更新成功| AssetList

    Home --> Dashboard["管理画面<br/>/dashboard"]
    Dashboard -->|収支のグラフ・月別詳細| Cashflow["出金・入金明細<br/>/dashboard/cashflow"]
    Dashboard -->|資産のグラフ・月別詳細| AssetList
    Cashflow --> ExpenseDetail["出金詳細<br/>/expenses/[id]"]
    Cashflow --> IncomeDetail["入金詳細<br/>/incomes/[id]"]
```

## 設定・月次固定費

```mermaid
flowchart TD
    Home["家計簿トップ<br/>/"] --> Settings["各種設定<br/>/settings"]
    Settings --> BudgetMenu["アラート設定<br/>/settings/budget-alerts"]
    Settings --> Password["パスワード変更<br/>/settings/password"]
    Password -->|変更成功・再ログイン| Login["ログイン<br/>/login"]

    BudgetMenu --> BudgetCreate["アラート登録<br/>/settings/budget-alerts/create"]
    BudgetMenu --> BudgetList["アラート一覧<br/>/settings/budget-alerts/list"]
    BudgetCreate -->|登録成功| BudgetList
    BudgetList --> BudgetEdit["アラート修正<br/>/settings/budget-alerts/[id]/edit"]
    BudgetEdit -->|更新成功| BudgetList

    ExpenseMenu["出金メニュー<br/>/expenses"] --> FixedMenu["月次固定費設定<br/>/settings/fixed-expenses"]
    FixedMenu --> FixedCreate["月次固定費登録<br/>/settings/fixed-expenses/create"]
    FixedMenu --> FixedList["月次固定費一覧<br/>/settings/fixed-expenses/list"]
    FixedMenu -->|当月を指定| FixedConfirm["月次固定費出金の確認<br/>/settings/fixed-expenses/process/confirm"]
    FixedCreate -->|登録成功| FixedList
    FixedList --> FixedEdit["月次固定費修正<br/>/settings/fixed-expenses/[id]/edit"]
    FixedEdit -->|更新成功| FixedList
    FixedConfirm -->|処理成功後に確認| ExpenseList["出金一覧<br/>/expenses/list"]
```

## URLクエリ

| 画面 | クエリ | 用途 |
| --- | --- | --- |
| `/expenses/list` | `year`, `month` | 表示する出金の年月を初期化 |
| `/expenses/list` | `groupId` | 大分類の絞り込みを初期化 |
| `/dashboard/cashflow` | `year`, `month` | 管理画面で選択した月の出金・入金明細を表示 |
| `/asset-balances/list` | `month=YYYY-MM` | 管理画面で選択した月の残高を表示 |
| `/settings/fixed-expenses/process/confirm` | `target_month=YYYY-MM` | 固定費を出金へ反映する対象月を指定 |

不正または不足している年月は、画面ごとの入力検証や現在年月への補正を経てAPIへ渡されます。
