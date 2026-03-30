# Phase 8: Refactoring Record

## 目的

PlanResultDetailPanel と ExecuteResultDetailPanel 間で重複していた UI パターンを `result-panel-parts.tsx` に抽出し、DRY 原則に基づく共通化を実施。

## 抽出先: result-panel-parts.tsx

### 共通定数

| エクスポート名     | 種別 | 内容                                                                             |
| ------------------ | ---- | -------------------------------------------------------------------------------- |
| PANEL_CARD_CLASSES | 定数 | `rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5` |

### 共通コンポーネント

| コンポーネント名 | Props                                             | 用途                                              |
| ---------------- | ------------------------------------------------- | ------------------------------------------------- |
| SectionHeader    | `title: string`                                   | セクション区切り線 + タイトル表示                 |
| TagList          | `items: string[], variant: "accent" \| "default"` | タグスタイルのリスト表示（triggers/anchors 向け） |
| DetailFooter     | `label: string, value: string`                    | ID フッター表示（Plan ID / Execute ID）           |
| StatusBadge      | `status: "success" \| "failure" \| "pending"`     | 成功/失敗/保留バッジ表示                          |

## リファクタリング適用マップ

### PlanResultDetailPanel

| 変更前（直接記述）                      | 変更後（共通パーツ使用）                          |
| --------------------------------------- | ------------------------------------------------- |
| カード外枠の Tailwind クラス直書き      | `PANEL_CARD_CLASSES` 定数参照                     |
| セクション `<div>` + `<h4>` 直書き      | `<SectionHeader title="..." />`                   |
| triggers/anchors のタグ `<span>` ループ | `<TagList items={...} variant="accent" />`        |
| planId フッター `<div>` 直書き          | `<DetailFooter label="Plan ID" value={planId} />` |

### ExecuteResultDetailPanel

| 変更前（直接記述）                       | 変更後（共通パーツ使用）                                   |
| ---------------------------------------- | ---------------------------------------------------------- |
| カード外枠の Tailwind クラス直書き       | `PANEL_CARD_CLASSES` 定数参照                              |
| 成功/失敗バッジの条件分岐 + クラス直書き | `<StatusBadge status={success ? "success" : "failure"} />` |
| executeId フッター `<div>` 直書き        | `<DetailFooter label="Execute ID" value={executeId} />`    |

## リファクタリング前後の比較

| メトリクス                     | リファクタリング前 | リファクタリング後 |
| ------------------------------ | ------------------ | ------------------ |
| PlanResultDetailPanel 行数     | 約 180 行          | 約 130 行          |
| ExecuteResultDetailPanel 行数  | 約 160 行          | 約 120 行          |
| result-panel-parts.tsx 行数    | (未作成)           | 約 80 行           |
| 重複 Tailwind クラス定義       | 6 箇所             | 1 箇所（定数）     |
| 重複セクションヘッダーパターン | 8 箇所             | 0 箇所             |

## テスト回帰確認

| 項目           | 結果 |
| -------------- | ---- |
| 全テスト実行   | PASS |
| テスト数       | 53   |
| 失敗テスト数   | 0    |
| 新規テスト追加 | なし |

> リファクタリングは内部構造の変更のみであり、外部インターフェース（props / レンダリング結果）に変更はない。
> 全 53 テストがリファクタリング後も変更なしで PASS することを確認済み。

## 判定: PASS

- 共通パーツ抽出により重複コードを排除
- 全テストが回帰なしで PASS
- TypeScript 型エラー: 0
- ESLint 警告: 0
