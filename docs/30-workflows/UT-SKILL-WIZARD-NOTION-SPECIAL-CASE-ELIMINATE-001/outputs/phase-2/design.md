# Phase 2: 設計書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 2                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 実行日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 採用オプション: Option 3

**`resolveLabelEntry()` を追加し、`resolveSemanticLabel()` は既存契約を維持する**

**採用理由**:

1. 後方互換性の維持: `resolveSemanticLabel()` の既存文字列契約を壊さずに済む
2. 責務分離: `resolveSemanticLabel()` は純粋なラベル正規化、`resolveLabelEntry()` は freeText 付きの回答組み立て前処理
3. テスト容易性: shared 層のユニットテストで helper と既存関数を別々に検証できる
4. 拡張性: 将来 freeText 付き変換が増えても `SEMANTIC_LABEL_MAP` と helper だけで対応可能
5. 最小変更: `ConversationRoundStep.tsx` の特殊分岐だけを helper 呼び出しへ置換できる

## 型定義変更設計

### SemanticLabelEntry 型（新設）

```typescript
export type SemanticLabelEntry = string | { label: string; freeText?: string };
```

### QuestionSemanticLabelMap 型（変更）

```typescript
// 変更前
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

// 変更後
export type QuestionSemanticLabelMap = Record<
  string,
  Record<string, SemanticLabelEntry>
>;
```

### SemanticLabelResult 型（新設）

```typescript
export type SemanticLabelResult = { label: string; freeText?: string };
```

## SEMANTIC_LABEL_MAP 変更設計

```typescript
q5: {
  slack: "Slack",
  github: "GitHub",
  notion: { label: "その他", freeText: "Notion" }, // 特別ケースをここに移管
},
```

## resolveLabelEntry() 追加設計

```typescript
export function resolveLabelEntry(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): SemanticLabelResult | undefined {
  if (value === undefined) return undefined;
  const questionMap = labelMap[questionId];
  if (!questionMap) return { label: value };
  const entry = questionMap[value];
  if (entry === undefined) return { label: value };
  return typeof entry === "string" ? { label: entry } : entry;
}
```

## resolveSemanticLabel() 変更設計

```typescript
export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  return resolveLabelEntry(value, questionId, labelMap)?.label;
}
```

変更点: `resolveLabelEntry()` に委譲するだけ。戻り値型 `string | undefined` は維持。

## createQuestionAnswer() 変更設計

```typescript
// 変更前（notion 特別ケースあり）
if (normalizedKey === "notion" && options.includes("その他")) {
  return { selectedOptions: ["その他"], freeText: "Notion" };
}
const resolved = resolveSemanticLabel(normalizedKey, questionId, labelMap);
const displayValue =
  resolved === normalizedKey ? rawValue : (resolved ?? rawValue);

// 変更後（resolveLabelEntry 使用）
const entry = resolveLabelEntry(normalizedKey, questionId, labelMap);
const displayLabel = entry?.label ?? rawValue;
const freeTextValue = entry?.freeText ?? "";
```

## 検証マトリクス

| テスト対象            | テストコマンド                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| shared ユニットテスト | `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts` |
| 型チェック（shared）  | `pnpm --filter @repo/shared typecheck`                                                          |
| 型チェック（desktop） | `pnpm --filter @repo/desktop typecheck`                                                         |
| lint                  | `pnpm --filter @repo/shared lint`                                                               |
