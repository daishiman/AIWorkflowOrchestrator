# テスト仕様書

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b
**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts`

## 概要

`wizard/index.ts` のエクスポート契約を検証するユニットテスト。削除・追加・維持の3区分でエクスポートを網羅的に確認する。

## テストスイート一覧

| スイート             | テスト数 | 目的                                     |
| -------------------- | -------- | ---------------------------------------- |
| 削除エクスポート確認 | 3        | 旧APIが公開されていないことを保証        |
| 追加エクスポート確認 | 2        | 新APIが正しく公開されていることを保証    |
| 維持エクスポート確認 | 6        | 既存APIのリグレッションを防止            |
| 型エクスポート確認   | 2        | TypeScript型がコンパイル可能なことを保証 |

## 削除エクスポート確認テスト

- `DescribeStep` が `undefined` であること
- `ConfigureStep` が `undefined` であること
- `WizardOptions` が `undefined` であること

## 追加エクスポート確認テスト

- `SkillInfoStep` が定義済みかつ `function` 型であること
- `ConversationRoundStep` が定義済みかつ `function` 型であること

## 維持エクスポート確認テスト

- `StepIndicator` / `stepStateStyles` / `GenerateStep` / `CompleteStep` / `InterviewProgressBar` / `ApplySummaryCard` が引き続き定義済みであること

## 型エクスポート確認テスト

- `SkillInfoStepProps` のインライン型インポートが成立し、インスタンス構築できること
- `ConversationRoundStepProps` のインライン型インポートが成立し、インスタンス構築できること
