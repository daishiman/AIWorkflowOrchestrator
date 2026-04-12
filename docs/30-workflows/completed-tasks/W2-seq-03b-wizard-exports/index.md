# W2-seq-03b: wizard/index.ts エクスポート更新

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-W2-seq-03b                                   |
| タスク名     | wizard/index.ts エクスポート更新                             |
| 実行順       | Wave 2（直列・W1-par-02a+W1-par-02b+W1-par-02c完了後）       |
| 依存タスク   | W1-par-02a, W1-par-02b, W1-par-02c                           |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/index.ts` |
| 作成日       | 2026-04-07                                                   |
| ステータス   | Phase 1-12 完了（Phase 13 blocked）                          |

## 概要

`wizard/index.ts` の barrel export を current implementation に揃えた。
今回の実差分は `DescribeStep` / `DescribeStepProps` / inline `GenerationMode` の除去、`SkillInfoStepProps` の公開、`GenerateStep.tsx` からの `GenerationMode` 再転送、deprecated `DescribeStep.tsx` の依存整理である。
UI マークアップ自体は変えておらず、Phase 11 では代表スクリーンショット監査と static contract check で整合を確認した。

## 削除するエクスポート

```typescript
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
export type GenerationMode = "llm" | "template";
```

## 追加するエクスポート

```typescript
export type { SkillInfoStepProps } from "./SkillInfoStep";
export type { GenerationMode } from "./GenerateStep";
```

## 変更なし（維持するエクスポート）

- `StepIndicator` / `SkillInfoStep` / `ConversationRoundStep`
- `InterviewProgressBar` / `ApplySummaryCard`
- `GenerateStep` / `CompleteStep` および関連型

## Phaseリスト

| Phase | 名前         | 仕様書                                                       | ステータス |
| ----- | ------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義     | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計         | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビュー | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成   | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装         | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充   | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | カバレッジ   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタ   | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証     | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビュー | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト   | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成       | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |
