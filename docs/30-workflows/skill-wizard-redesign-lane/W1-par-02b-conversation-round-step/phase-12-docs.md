# Phase 12: ドキュメント整備

## メタ情報

- Phase: 12
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物を揃え、`ConversationRoundStep` 実装の current facts をドキュメントへ同期する。

スコープ（過剰防止）:

- この Phase は **コード内コメントと export 更新が主責務**である
- ただし Phase 12 の canonical 6成果物として `system-spec-update-summary.md` と `phase12-task-spec-compliance-check.md` は必ず作成する

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件                        |
| -------- | --------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可                      |
| C        | `system-spec-update-summary.md`         | Part 2 の更新対象確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可                      |
| E        | `unassigned-task-detection.md`          | D と並列可                      |
| F        | `skill-feedback-report.md`              | E と並列可                      |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## 実行タスク（必須 6 タスク）

- [ ] `ConversationRoundStep` に JSDoc コメントを追加する
- [ ] `InterviewProgressBar` に JSDoc コメントを追加する
- [ ] `ApplySummaryCard` に JSDoc コメントを追加する
- [ ] 共有型定義（`packages/shared/src/types/skillCreator.ts`）の該当型にコメントを追加する
- [ ] W2-seq-03b が `wizard/index.ts` のエクスポート更新を担当することを記録する
- [ ] `phase12-task-spec-compliance-check.md` で task-specification-creator / aiworkflow-requirements への準拠を確認する

## 参照資料

| 資料名             | パス                                                                          | 説明                          |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------- |
| 実装ファイル       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | ドキュメント追加対象          |
| サブコンポーネント | `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`  | ドキュメント追加対象          |
| サブコンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | ドキュメント追加対象          |
| 型定義ファイル     | `packages/shared/src/types/skillCreator.ts`                                   | 共有型定義の JSDoc/説明を更新 |
| task-spec 正本     | `.claude/skills/task-specification-creator/SKILL.md`                          | Phase 12 判定基準             |
| system spec 正本   | `.claude/skills/aiworkflow-requirements/SKILL.md`                             | 更新対象基準                  |

## 実行手順

### Step 1: ConversationRoundStep への JSDoc 追加（要点のみ）

必須で含める要点:

- 6問・2ページ（Q1-3 / Q4-6）
- 進捗表示（質問 N/6）
- Q3 定期実行でのスケジュールUI展開
- Q5 の必須化条件（`formData.category === "external-integration"`）
- 「今すぐ生成する」サマリーカードの意図（未回答へデフォルト適用の確認）

```typescript
/**
 * スキルウィザード Step 1 — 6問のインタビュー形式でスキル設定を収集するコンポーネント。
 *
 * - 2ページ構成（Q1-Q3 / Q4-Q6）で進捗バー「質問 N/6」を常時表示する。
 * - `SmartDefaultResult` を受け取り各問に事前入力する。
 * - Q3 で「定期実行」選択時は `SkillWizardScheduleConfig` 入力UIをインライン展開する。
 * - Q5 は `formData.category === "external-integration"` のとき必須★になる。
 * - 「今すぐ生成する」ボタンは適用サマリーカードを表示してから生成する。
 *
 * @example
 * <ConversationRoundStep
 *   formData={formData}
 *   smartDefaults={smartDefaults}
 *   answers={answers}
 *   onAnswersChange={setAnswers}
 *   onBack={handleBack}
 *   onGenerate={handleGenerate}
 * />
 */
export function ConversationRoundStep({ ... }: ConversationRoundStepProps) { ... }
```

### Step 2: InterviewProgressBar への JSDoc 追加（表示契約の固定）

```typescript
/**
 * インタビュー進捗バーコンポーネント。
 *
 * 「質問 N/6」のテキストと視覚的なゲージを常時表示する。
 * ConversationRoundStep で Page1（1/6）・Page2（4/6）として使用する。
 *
 * @example
 * <InterviewProgressBar currentQuestion={1} />
 * <InterviewProgressBar currentQuestion={4} totalQuestions={6} />
 */
export function InterviewProgressBar({ ... }: InterviewProgressBarProps) { ... }
```

### Step 3: ApplySummaryCard への JSDoc 追加（警告はブロックではない）

```typescript
/**
 * 「今すぐ生成する」時に表示される適用サマリーカード。
 *
 * - 未回答問のスマートデフォルト値一覧を表示する。
 * - `category === "external-integration"` かつ Q5 未設定の場合に警告を表示する。
 * - 「×」ボタン（dismissible）で閉じられる。
 * - 「生成する」ボタンで `onConfirmGenerate` を呼ぶ（`onGenerate("skip")` に対応）。
 */
export function ApplySummaryCard({ ... }: ApplySummaryCardProps) { ... }
```

### Step 4: shared 型定義への型コメント追加（Q3 の条件付きフィールドを明記）

```typescript
/**
 * スケジュール設定（Q3「定期実行」選択時に使用）。
 */
export interface SkillWizardScheduleConfig {
  /** cron式（例: "0 9 * * 1-5"）*/
  cronExpression: string;
  /** タイムゾーン（例: "Asia/Tokyo"）*/
  timezone: string;
}

/**
 * 各問の回答データ型。
 */
export interface QuestionAnswer {
  /** 4択から選択された値（未選択時は null）*/
  selectedOption: string | null;
  /** 自由入力テキスト */
  freeText: string;
  /** Q3「定期実行」選択時のスケジュール設定 */
  scheduleConfig?: SkillWizardScheduleConfig;
}

/**
 * ConversationRoundStep（Step 1）の全問回答データ型。
 * onAnswersChange で親コンポーネントへ通知される。
 */
export interface ConversationAnswers {
  q1: QuestionAnswer; // 利用者
  q2: QuestionAnswer; // 入力データ
  q3: QuestionAnswer; // 実行タイミング
  q4: QuestionAnswer; // 出力先
  q5: QuestionAnswer; // 外部ツール連携（category依存で必須/任意）
  q6: QuestionAnswer; // 出力フォーマット
}
```

これらのコメントは `packages/shared/src/types/skillCreator.ts` の該当エントリに追加する。

### Step 5: バレルファイルの更新（W2 に委任）

`wizard/index.ts` のエクスポート再構成は W2-seq-03b の担当とする。Phase 12 では該当変更には手を入れず、「新コンポーネントが shared 型を使って動作する」ことだけを記録する。W1-par-02b には local `types.ts` を新設しない。

```typescript
// Before
export { ConfigureStep } from "./ConfigureStep";

// After
export { ConversationRoundStep } from "./ConversationRoundStep";
export { InterviewProgressBar } from "./InterviewProgressBar";
export { ApplySummaryCard } from "./ApplySummaryCard";
```

### Step 6: 変更履歴の記録（簡潔な差分のみ）

**変更サマリー（2026-04-07）**:

- 追加: `ConversationRoundStep.tsx` — スキルウィザード Step 1 コンポーネント（6問・2ページ）
- 追加: `InterviewProgressBar.tsx` — 「質問 N/6」進捗バー
- 追加: `ApplySummaryCard.tsx` — 今すぐ生成時の適用サマリーカード
- 共有型 `packages/shared/src/types/skillCreator.ts` に `ConversationAnswers` / `QuestionAnswer` / `SkillWizardScheduleConfig` のドキュメントコメントを追加
- 削除: `ConfigureStep.tsx`（`WizardOptions` チェックボックス3個含む）
- 削除: `WizardOptions` 型のエクスポート

### Step 7: システム仕様更新サマリーの作成

`outputs/phase-12/system-spec-update-summary.md` に、ConversationRoundStep の公開面更新と型参照方針を記録する。

### Step 8: Phase 12 タスク仕様準拠チェックの作成

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の両方に対して準拠しているかを最終確認する。

- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の存在確認
- canonical filename の不一致、見出し不足、planned wording 残存の確認
- PASS / FAIL と不足点の記録

## 成果物

- コード内ドキュメント更新（JSDoc/型コメント）
- 公開面の更新（barrel export）
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## Phase 12 成果物

| 成果物                   | パス                                                     | 説明                    |
| ------------------------ | -------------------------------------------------------- | ----------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2         |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の記録  |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴    |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成） |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）   |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の整合確認       |

## 完了条件

- [ ] `ConversationRoundStep` に JSDoc コメントが付与されている
- [ ] `InterviewProgressBar` に JSDoc コメントが付与されている
- [ ] `ApplySummaryCard` に JSDoc コメントが付与されている
- [ ] `ConversationAnswers` / `QuestionAnswer` / `SkillWizardScheduleConfig` 型にコメントが付与されている
- [ ] `wizard/index.ts` のエクスポート更新は W2-seq-03b が担当することを記録する
- [ ] `ConfigureStep` / `WizardOptions` のエクスポートが削除されている
- [ ] 変更履歴が記録されている（簡潔でよい）
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] Phase 12 仕様準拠チェックが PASS である
