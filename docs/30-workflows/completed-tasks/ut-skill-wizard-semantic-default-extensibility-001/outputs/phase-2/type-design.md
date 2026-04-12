# Phase 2: 型設計書

## QuestionSemanticLabelMap 型

```typescript
// packages/shared/src/types/skill-wizard-label-map.ts

/**
 * 質問IDと semantic default 値の UI ラベルへのマッピング。
 * questionId → (rawValue → displayLabel) の2段階構造。
 * rawValue は toLowerCase() 正規化後の文字列を使用する。
 */
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;
```

## SEMANTIC_LABEL_MAP 定数

```typescript
export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  q5: { slack: "Slack", github: "GitHub", notion: "その他" },
  q6: { 週次: "週に1回" },
};
```

### ノート: notion の扱い

`notion → "その他"` のエントリは SEMANTIC_LABEL_MAP に含めるが、
ConversationRoundStep の `createQuestionAnswer` 内では `notion` 判定を
先行チェックし `freeText: "Notion"` も設定する特別ケースとして残す。
（resolveSemanticLabel だけでは freeText 設定が不可能なため）

## resolveSemanticLabel 関数シグネチャ

```typescript
/**
 * semantic default の rawValue を UI ラベルへ正規化する。
 * @param value - 変換対象の raw 値（toLowerCase() 済みを推奨）
 * @param questionId - 質問ID（q1〜q6）
 * @param labelMap - 変換テーブル（省略時は SEMANTIC_LABEL_MAP を使用）
 * @returns 正規化後の UI ラベル、または undefined（value が undefined の場合）
 */
export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined;
```

## createQuestionAnswer 変更後シグネチャ

```typescript
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
  questionId: string,
  labelMap?: QuestionSemanticLabelMap,
): QuestionAnswer;
```

## applySmartDefaults 変更後（エクスポート追加）

```typescript
export function applySmartDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): ConversationAnswers;
```
