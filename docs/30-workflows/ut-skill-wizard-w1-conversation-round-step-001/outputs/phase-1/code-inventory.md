# Phase 1 成果物: コードインベントリ

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 |
| Phase    | 1 — 要件定義                                   |
| 作成日   | 2026-04-08                                     |

---

## P50 チェック結果

### 型定義確認

| 型名                        | ファイル                                         | 確認結果 |
| --------------------------- | ------------------------------------------------ | -------- |
| `ConversationAnswers`       | `packages/shared/src/types/skillCreator.ts:981`  | FOUND ✓  |
| `QuestionAnswer`            | `packages/shared/src/types/skillCreator.ts:968`  | FOUND ✓  |
| `SmartDefaultResult`        | `packages/shared/src/types/skillCreator.ts:1000` | FOUND ✓  |
| `SkillWizardScheduleConfig` | `packages/shared/src/types/skillCreator.ts:957`  | FOUND ✓  |

#### ConversationAnswers（抜粋）

```typescript
export interface ConversationAnswers {
  q1: QuestionAnswer; // Q1: 利用者
  q2: QuestionAnswer; // Q2: 入力データ
  q3: QuestionAnswer; // Q3: 実行タイミング
  q4: QuestionAnswer; // Q4: 出力先
  q5: QuestionAnswer; // Q5: 外部ツール連携
  q6: QuestionAnswer; // Q6: 出力フォーマット
}
export interface QuestionAnswer {
  selectedOption: string | null;
  freeText: string;
  scheduleConfig?: SkillWizardScheduleConfig;
}
```

#### SmartDefaultResult（抜粋）

```typescript
export interface SmartDefaultResult {
  who: string | null; // Q1 相当
  input: string | null; // Q2 相当
  timing: string | null; // Q3 相当
  output: string | null; // Q4 相当
  tool: string | null; // Q5 相当
  format: string | null; // Q6 相当
  inferenceLog?: string[]; // 診断用途・無視
}
```

### inferSmartDefaults 公開確認

| 関数名               | ファイル                                               | 確認結果 |
| -------------------- | ------------------------------------------------------ | -------- |
| `inferSmartDefaults` | `packages/shared/src/services/skillCreator/index.ts:1` | FOUND ✓  |

### wizard ディレクトリ確認

| ファイル                    | 種別     | 確認結果                     |
| --------------------------- | -------- | ---------------------------- |
| `SkillInfoStep.tsx`         | 既存     | FOUND ✓                      |
| `ConfigureStep.tsx`         | 既存     | FOUND ✓（削除は W2-seq-03a） |
| `CompleteStep.tsx`          | 既存     | FOUND ✓                      |
| `GenerateStep.tsx`          | 既存     | FOUND ✓                      |
| `StepIndicator.tsx`         | 既存     | FOUND ✓                      |
| `index.ts`                  | 更新対象 | FOUND ✓                      |
| `ConversationRoundStep.tsx` | 実装済み | FOUND ✓                      |

### interview-widgets 確認

| ウィジェット          | ファイル                                    | 確認結果 |
| --------------------- | ------------------------------------------- | -------- |
| `SingleSelectChips`   | `interview-widgets/SingleSelectChips.tsx`   | FOUND ✓  |
| `FreeTextInput`       | `interview-widgets/FreeTextInput.tsx`       | FOUND ✓  |
| `MultiSelectCheckbox` | `interview-widgets/MultiSelectCheckbox.tsx` | FOUND ✓  |

### InterviewProgressBar 確認

| ファイル                   | インターフェース                     | 確認結果 |
| -------------------------- | ------------------------------------ | -------- |
| `InterviewProgressBar.tsx` | `{ current: number; total: number }` | FOUND ✓  |

---

## 参照対象ファイル一覧

| ファイル                                                                             | 種別     | 利用目的                          |
| ------------------------------------------------------------------------------------ | -------- | --------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                          | 参照     | 型定義 (ConversationAnswers 等)   |
| `packages/shared/src/services/skillCreator/index.ts`                                 | 参照     | inferSmartDefaults export 経路    |
| `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx`                | 再利用   | 進捗バー表示                      |
| `apps/desktop/src/renderer/components/skill/interview-widgets/SingleSelectChips.tsx` | 再利用   | 選択肢 UI                         |
| `apps/desktop/src/renderer/components/skill/interview-widgets/FreeTextInput.tsx`     | 再利用   | 自由入力 UI                       |
| `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`                | 参照のみ | W2-seq-03a で削除・参照除去       |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                         | 更新対象 | ConversationRoundStep export 追加 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | 参照     | Props パターン参照                |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`             | 参照     | 既存質問 UI パターン              |
