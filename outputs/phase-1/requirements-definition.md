# Phase 1: 要件定義書 — UT-SKILL-WIZARD-W2-seq-03b

## タスク概要

`wizard/index.ts` の barrel export を更新し、廃止コンポーネント（DescribeStep）のエクスポートを削除し、
新コンポーネント（SkillInfoStep/ConversationRoundStep）の型エクスポートを整備する。

## 機能要件

| ID    | 要件                                                                                   | 優先度 |
| ----- | -------------------------------------------------------------------------------------- | ------ |
| FR-01 | `DescribeStep` のエクスポートを `wizard/index.ts` から削除する                         | 必須   |
| FR-02 | `DescribeStepProps` の型エクスポートを `wizard/index.ts` から削除する                  | 必須   |
| FR-03 | `GenerationMode` のインライン型定義を `wizard/index.ts` から削除する                   | 必須   |
| FR-04 | `SkillInfoStepProps` の型エクスポートを `wizard/index.ts` に追加する                   | 必須   |
| FR-05 | `SkillInfoStep.tsx` の `SkillInfoStepProps` interface に `export` キーワードを付与する | 必須   |
| FR-06 | `GenerationMode` を `GenerateStep.tsx` から再エクスポートし型エラーを防ぐ              | 必須   |
| FR-07 | `StepIndicator`/`GenerateStep`/`CompleteStep` のエクスポートを維持する                 | 必須   |

## 非機能要件

| ID     | 要件                                                        |
| ------ | ----------------------------------------------------------- |
| NFR-01 | `pnpm --filter @repo/desktop typecheck` がエラー 0 件で通過 |
| NFR-02 | 既存テストが Green を維持すること                           |
| NFR-03 | barrel export の循環参照が発生しないこと                    |

## 現状調査結果

### 仕様書の想定と実際のコードの差分

| 仕様書の想定                        | 実際の現状                                                | 対処         |
| ----------------------------------- | --------------------------------------------------------- | ------------ |
| `ConfigureStep` を削除              | すでに `index.ts` に存在しない（先行タスクで削除済み）    | スキップ     |
| `WizardOptions` を削除              | すでに `index.ts` に存在しない（先行タスクで削除済み）    | スキップ     |
| `ConfigureStepProps` を削除         | すでに `index.ts` に存在しない（先行タスクで削除済み）    | スキップ     |
| `SkillInfoStep` を追加              | すでに `index.ts` にエクスポートされている                | スキップ     |
| `ConversationRoundStep` を追加      | すでに `index.ts` にエクスポートされている                | スキップ     |
| `ConversationRoundStepProps` を追加 | すでに `index.ts` にエクスポートされている                | スキップ     |
| `SkillInfoStepProps` を追加         | `SkillInfoStep.tsx` の interface が `export` されていない | 修正必要     |
| `GenerationMode` を削除             | `SkillCreateWizard.tsx` が `wizard` から参照中            | 再転送で対応 |

### 依存ファイルの状態

| ファイル                           | 状態                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `wizard/SkillInfoStep.tsx`         | 存在する。`SkillInfoStepProps` は `export` なしで定義されている           |
| `wizard/ConversationRoundStep.tsx` | 存在する。`ConversationRoundStepProps` は `export interface` で公開済み   |
| `wizard/DescribeStep.tsx`          | 存在する（廃止対象）。`GenerationMode` を `index.ts` から循環インポート中 |
| `wizard/GenerateStep.tsx`          | `GenerationMode` 型を独自定義・エクスポートしている                       |
| `wizard/ConfigureStep.tsx`         | 存在しない（先行タスクで削除済み）                                        |
