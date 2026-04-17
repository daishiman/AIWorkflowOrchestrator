# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 1                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 実行日     | 2026-04-15                                        |
| ステータス | completed                                         |

## P50チェック結果

### 現状確認

- `ConversationRoundStep.tsx` L162〜L166 に notion 特別ケースが存在することを確認済み
- `QuestionSemanticLabelMap` 型が `Record<string, Record<string, string>>` であることを確認済み
- `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts` は未存在（新規作成が必要）

### 現行コード（特別ケース）

```typescript
// notion は "その他" へマップし、freeText に "Notion" を保持する特別ケース。
// resolveSemanticLabel 単体では freeText の設定ができないため先行チェックする。
if (normalizedKey === "notion" && options.includes("その他")) {
  return { selectedOptions: ["その他"], freeText: "Notion" };
}
```

### 現行型定義

```typescript
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  q5: { slack: "Slack", github: "GitHub", notion: "その他" },
  q6: { 週次: "週に1回" },
};
```

## 特別ケース問題点の整理

| 問題               | 詳細                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| ロジック分散       | 変換ロジックが `packages/shared` と `apps/desktop` の2箇所に存在し、一元管理できていない            |
| 型制約による回避策 | `QuestionSemanticLabelMap` が `Record<string, Record<string, string>>` のため `freeText` を持てない |
| 拡張性の欠如       | 将来同様の `freeText` 付き変換が必要な場合、同様の特別ケースを都度追加する必要がある                |
| テスト困難         | `ConversationRoundStep.tsx` に埋め込まれた変換ロジックは shared 層のユニットテストでカバーできない  |

## 機能要件

| ID   | 要件                                                                                    |
| ---- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| FR-1 | `SemanticLabelEntry` 型（`string                                                        | { label: string; freeText?: string }`）の追加 |
| FR-2 | `QuestionSemanticLabelMap` 型を `SemanticLabelEntry` を値として許容するよう拡張         |
| FR-3 | `SEMANTIC_LABEL_MAP` の `q5.notion` を `{ label: "その他", freeText: "Notion" }` に変更 |
| FR-4 | `resolveLabelEntry()` 関数の新設（`SemanticLabelResult` を返す）                        |
| FR-5 | `resolveSemanticLabel()` は既存の文字列返却契約を維持する                               |
| FR-6 | `ConversationRoundStep.tsx` の notion 特別ケースを削除する                              |
| FR-7 | `createQuestionAnswer()` が `resolveLabelEntry()` を使って freeText を取得する          |

## 非機能要件

| ID    | 要件                                             |
| ----- | ------------------------------------------------ |
| NFR-1 | 型チェック（`pnpm typecheck`）がエラーなしで通過 |
| NFR-2 | 既存テストへの悪影響なし（後方互換性を維持）     |
| NFR-3 | shared 層のユニットテストカバレッジ 80%+ (Line)  |

## タスク分類宣言

| 分類項目   | 値                                         |
| ---------- | ------------------------------------------ |
| タスク種別 | リファクタリングタスク                     |
| UIタスク   | 非UIタスク（UIの見た目変更なし）           |
| 可視性     | NON_VISUAL（動作は同一、内部構造のみ変更） |
| テスト種別 | ユニットテスト（shared 層）                |
