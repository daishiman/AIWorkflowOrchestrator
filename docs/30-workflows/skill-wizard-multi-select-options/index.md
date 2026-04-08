# スキルウィザード 複数選択対応 仕様書パック

## 概要

スキル作成ウィザードの ConversationRoundStep（Q1〜Q6）における選択ボタンを、
現行の単一選択から複数選択（トグル方式）に変更するためのワークフロー。

ユーザーが「複数の利用者」「複数の入力形式」などを同時に指定できるようにすることで、
生成されるスキル骨格の精度を高める。

## 変更の背景

- 現行実装: `QuestionAnswer.selectedOption: string | null`（1値のみ保持）
- 要望: 複数の選択肢を同時指定したい（例: Q1で「自分のみ」と「チームメンバー」の両方を選ぶ）
- SmartDefaultResult はLLM推論結果として1値を返す設計を維持し、
  UI側の `applySmartDefaults()` 変換で `string[]` に吸収する方針を採用

## スコープ

| 対象ファイル                                                                  | 変更内容                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                   | `QuestionAnswer.selectedOption` → `selectedOptions: string[]` |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | トグル選択・判定・表示の変更                                  |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 複数値の表示対応                                              |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | `DEFAULT_ANSWERS` / `resolveExternalIntegration` の更新       |

## SmartDefaultResult の方針（設計決定）

`SmartDefaultResult` の各フィールド（who/input/timing/output/tool/format）は
`string | null` のまま変更しない。理由:

1. LLMは推論結果として1つのコンテキスト値を返すのが自然
2. LLMプロンプト変更・バックエンド変更が不要
3. `applySmartDefaults()` 内で `string → [string]` 変換するだけで完結

## タスク一覧

```
Wave 0（直列）
  W0-seq-01-types   # QuestionAnswer 型変更（selectedOption → selectedOptions）

Wave 1（並列・W0完了後）
  W1-par-02a-conversation-round-step   # ConversationRoundStep トグル選択実装
  W1-par-02b-apply-summary-card        # ApplySummaryCard 複数値表示対応

Wave 2（直列・W1完了後）
  W2-seq-03-wizard-integration         # SkillCreateWizard 統合更新
```

## Phase一覧

| Phase | 名称             | 仕様書                                                 | ステータス |
| ----- | ---------------- | ------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)   | planning   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)               | planning   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md) | planning   |
| 4     | テスト作成       | phase-4-test-creation.md                               | blocked    |
| 5     | 実装             | phase-5-implementation.md                              | blocked    |
| 6     | テスト拡充       | phase-6-test-expansion.md                              | blocked    |
| 7     | カバレッジ確認   | phase-7-coverage.md                                    | blocked    |
| 8     | リファクタリング | phase-8-refactoring.md                                 | blocked    |
| 9     | 品質保証         | phase-9-qa.md                                          | blocked    |
| 10    | 最終レビュー     | phase-10-final-review.md                               | blocked    |
| 11    | 手動テスト       | phase-11-manual-test.md                                | blocked    |
| 12    | ドキュメント更新 | phase-12-docs.md                                       | blocked    |
| 13    | PR作成           | phase-13-pr.md                                         | blocked    |

## 依存グラフ

```
W0-seq-01-types
  ├─→ W1-par-02a-conversation-round-step ─┐
  └─→ W1-par-02b-apply-summary-card      ─┼─→ W2-seq-03-wizard-integration
```

## 参照設計書

| ドキュメント            | パス                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| 型定義                  | `packages/shared/src/types/skillCreator.ts`                                   |
| ConversationRoundStep   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| ApplySummaryCard        | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      |
| SkillCreateWizard       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            |
| Phase 1-13 フォーマット | `.claude/skills/task-specification-creator/SKILL.md`                          |

## 作成日

2026-04-08
