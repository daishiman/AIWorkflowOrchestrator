# Phase 7: カバレッジ確認

## メタ情報

- Phase: 7
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 目的

Phase 4・6 で作成したテストが追加型の全フィールド・全 union メンバーを網羅しているかを確認する。型定義ファイルに対するテストカバレッジの観点で漏れを検出する。

## 実行タスク

- [ ] 全 7 型のテスト網羅表を作成し、未テスト箇所を特定する
- [ ] `SkillCategory` の全 5 メンバーがテストされていることを確認する
- [ ] `ConversationAnswers` の q1〜q6 がテストされていることを確認する
- [ ] `SmartDefaultResult.inferenceLog` がテストされていることを確認する
- [ ] 未テスト箇所があれば追加テストを作成する

## 参照資料

| 資料名         | パス                                                              | 説明                               |
| -------------- | ----------------------------------------------------------------- | ---------------------------------- |
| テストファイル | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | カバレッジ確認対象                 |
| 設計書         | `phase-2-design.md`                                               | 全フィールド・union メンバーの一覧 |

## 実行手順

### Step 1: テスト網羅表の確認

| 型                          | フィールド/メンバー                             | テスト有無  | 備考                        |
| --------------------------- | ----------------------------------------------- | ----------- | --------------------------- |
| `SkillInfoFormData`         | `skillName?: string`                            | Phase 4 + 6 | 空文字・省略確認あり        |
| `SkillInfoFormData`         | `purpose: string`                               | Phase 4     |                             |
| `SkillInfoFormData`         | `category: SkillCategory \| null`               | Phase 4 + 6 | null 確認あり               |
| `SkillCategory`             | `"automation"`                                  | Phase 4     |                             |
| `SkillCategory`             | `"external-integration"`                        | Phase 4     |                             |
| `SkillCategory`             | `"data-analysis"`                               | Phase 4     |                             |
| `SkillCategory`             | `"code-support"`                                | Phase 4     |                             |
| `SkillCategory`             | `"other"`                                       | Phase 4     |                             |
| `SkillWizardScheduleConfig` | `cronExpression: string`                        | Phase 4 + 6 |                             |
| `SkillWizardScheduleConfig` | `timezone: string`                              | Phase 4 + 6 |                             |
| `QuestionAnswer`            | `selectedOption: string \| null`                | Phase 4 + 6 |                             |
| `QuestionAnswer`            | `freeText: string`                              | Phase 4 + 6 |                             |
| `QuestionAnswer`            | `scheduleConfig?: SkillWizardScheduleConfig`    | Phase 4 + 6 |                             |
| `ConversationAnswers`       | `q1`〜`q6`                                      | Phase 4 + 6 | q3 の scheduleConfig も確認 |
| `SmartDefaultResult`        | `who / input / timing / output / tool / format` | Phase 4     |                             |
| `SmartDefaultResult`        | `inferenceLog`                                  | Phase 4 + 6 | 推論根拠の配列              |
| `SkeletonQualityFeedback`   | `satisfied: boolean`                            | Phase 4     |                             |
| `SkeletonQualityFeedback`   | `generationMethod: "complete" \| "skip"`        | Phase 4     | skip も含む                 |
| `SkeletonQualityFeedback`   | `timestamp: number`                             | Phase 4     |                             |

### Step 2: 未テスト箇所への追加テスト

現時点では網羅表上の未テスト箇所はない。Phase 4 / 6 のテストをそのまま採用し、必要に応じて `SmartDefaultResult.inferenceLog` の順序保持だけを追加で確認する。

### Step 3: カバレッジ確認コマンド

```bash
# テスト実行（詳細出力）
pnpm --filter @repo/shared test packages/shared/src/types/__tests__/skillCreator-wizard.test.ts --reporter=verbose

# 型チェックでも網羅性を確認
pnpm --filter @repo/shared typecheck
```

### Step 4: カバレッジサマリー

| 型                          | フィールド数 | テスト済み | カバレッジ |
| --------------------------- | ------------ | ---------- | ---------- |
| `SkillInfoFormData`         | 3            | 3          | 100%       |
| `SkillCategory`             | 5 メンバー   | 5          | 100%       |
| `SkillWizardScheduleConfig` | 2            | 2          | 100%       |
| `QuestionAnswer`            | 3            | 3          | 100%       |
| `ConversationAnswers`       | 6            | 6          | 100%       |
| `SmartDefaultResult`        | 7            | 7          | 100%       |
| `SkeletonQualityFeedback`   | 3            | 3          | 100%       |

## 成果物

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: カバレッジ確認済みテスト（**修正**）

## 完了条件

- [ ] テスト網羅表が作成されている
- [ ] 全フィールド・全 union メンバーが少なくとも 1 つのテストケースでカバーされている
- [ ] 追加の未テスト箇所が残っていない
- [ ] 全テストケースがパスしている
