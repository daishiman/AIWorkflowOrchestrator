# Phase 8: リファクタリング

## メタ情報

- Phase: 8
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

動作するテストを GREEN に保ちながら、`ConversationRoundStep.tsx` および関連コンポーネントのコード品質を向上させる。可読性・保守性・再利用性の観点でリファクタリングを行う。

## 方針（過剰設計を避ける）

- 目的は「読みやすく壊れにくくする」であり、抽象化や分割を増やすこと自体は目的にしない
- **新しいファイル/フック/汎用コンポーネントは増やさないのが既定**。増やす場合は採用条件を満たすときだけ
- `useMemo` / `useCallback` は性能問題が観測されない限り追加しない（先回りしない）

## 実行タスク

- [ ] `QUESTIONS` 定数の整理・型安全化を行う
- [ ] `QuestionCard` のインライン実装を評価し、必要に応じて抽出する
- [ ] 条件付きクラス名を整理する（clsx/cn 活用）
- [ ] カスタムフック抽出の要否を評価する
- [ ] 不要なコメント・デッドコードを削除する
- [ ] lint / typecheck を実行する
- [ ] リファクタリング後にテストが全て GREEN であることを確認する

## 参照資料

| 資料名             | パス                                                                          | 説明                 |
| ------------------ | ----------------------------------------------------------------------------- | -------------------- |
| 実装ファイル       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | リファクタリング対象 |
| サブコンポーネント | `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`  | リファクタリング対象 |
| サブコンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | リファクタリング対象 |
| テストファイル     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/`                | グリーン維持確認用   |

## 実行手順

### Step 1: QUESTIONS 定数の型安全化

```typescript
// 各問の型を厳密に定義する
type QuestionKey = "q1" | "q2" | "q3" | "q4" | "q5" | "q6";

interface QuestionDefinition {
  key: QuestionKey;
  label: string;
  options: readonly [string, string, string, string]; // 4択固定
}

const QUESTIONS: readonly QuestionDefinition[] = [
  // ...
] as const;
```

### Step 2: QuestionCard 抽出の評価

`QuestionCard` 抽出は、次の条件をすべて満たす場合のみ実施する（満たさないならインライン維持）。

採用条件:

- 重複がある: 同等の UI/ロジックが複数箇所で繰り返される
- 依存が増えない: 親の状態や handler を過剰に引き回さずに済む
- テスト容易性が上がる: props を分けることでテストが明確に簡単になる

抽出する場合のファイル（必要な場合のみ）:

- `apps/desktop/src/renderer/components/skill/wizard/QuestionCard.tsx`

### Step 3: カスタムフック抽出の評価

`useConversationRound` のようなフック抽出は、状態が増え続けて読みづらくなった場合のみ検討する。
現時点のロジック（`currentPage` / `showSummaryCard` / `isQ5Required` 程度）で収まるなら抽出しない。

```typescript
// hooks/useConversationRound.ts（必要な場合のみ）
function useConversationRound(
  formData: SkillInfoFormData,
  answers: ConversationAnswers,
  onAnswersChange: (answers: ConversationAnswers) => void,
  onGenerate: (method: "complete" | "skip") => void
) {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const isQ5Required = formData.category === "external-integration";
  // ...
  return { currentPage, showSummaryCard, isQ5Required, ... };
}
```

注意: 単純な実装の場合はフック抽出不要。テストが難しくなる場合は抽出しない。

### Step 4: ApplySummaryCard のロジック整理

未回答問の抽出ロジックは **key-based** を維持し、インデックス依存へ戻さない。

```typescript
// Before: インデックスベースのマッピング（誤りやすい）
const unansweredDefaults = questionKeys
  .filter(...)
  .map((key, i) => ({ ..., defaultValue: smartDefaults[SMART_DEFAULT_KEYS[i]] }));

// After: key-based マッピング（明示的）
const DEFAULT_KEY_BY_QUESTION: Record<keyof ConversationAnswers, keyof SmartDefaultResult> = {
  q1: "who", q2: "input", q3: "timing", q4: "output", q5: "tool", q6: "format",
};
```

### Step 5: lint / typecheck の実行

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

### Step 6: テスト再実行（GREEN 確認）

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/
```

## 成果物

- リファクタリング済み `ConversationRoundStep.tsx`
- リファクタリング済み `ApplySummaryCard.tsx`
- lint / typecheck エラーなしの確認結果

## 完了条件

- [ ] `QUESTIONS` 定数が型安全に定義されている
- [ ] `ApplySummaryCard` の key-based マッピングが整理されている
- [ ] 不要なコメント・デッドコードが除去されている
- [ ] lint / typecheck エラーがない
- [ ] リファクタリング後も全テストが GREEN になっている
