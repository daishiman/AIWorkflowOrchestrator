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
| ステータス   | pending                                                      |

## 概要

`wizard/index.ts` のエクスポートを更新し、廃止コンポーネント（DescribeStep/ConfigureStep）の  
エクスポートを削除し、新コンポーネント（SkillInfoStep/ConversationRoundStep）を追加する。

## 削除するエクスポート

```typescript
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
export { ConfigureStep } from "./ConfigureStep";
export type { WizardOptions, ConfigureStepProps } from "./ConfigureStep";
export type GenerationMode = "llm" | "template";
```

## 追加するエクスポート

```typescript
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
```

## 変更なし（維持するエクスポート）

- `StepIndicator` および関連型
- `GenerateStep` および関連型
- `CompleteStep` および関連型

## Phaseリスト

| Phase | 名前         | 概要                                 |
| ----- | ------------ | ------------------------------------ |
| 1     | 要件定義     | 削除/追加エクスポートの影響範囲分析  |
| 2     | 設計         | Before/After エクスポート設計        |
| 3     | 設計レビュー | 設計の矛盾・漏れチェック             |
| 4     | テスト作成   | Red段階テスト定義                    |
| 5     | 実装         | エクスポート削除+追加の実施          |
| 6     | テスト拡充   | エッジケース・回帰テスト             |
| 7     | カバレッジ   | カバレッジ計測・未到達分析           |
| 8     | リファクタ   | コード品質改善                       |
| 9     | 品質保証     | 静的解析・リスク評価                 |
| 10    | 最終レビュー | Phase 1-9 の成果物統合レビュー       |
| 11    | 手動テスト   | ビルド確認・インポートチェック       |
| 12    | ドキュメント | 実装ガイド・仕様更新・フィードバック |
| 13    | PR作成       | 提出準備・承認待ち                   |
