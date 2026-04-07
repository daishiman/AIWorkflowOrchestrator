# Phase 2: 設計

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

`wizard/index.ts` の Before/After エクスポート設計を確定し、実装方針を固める。

## Before/After エクスポート設計

### Before（現行）

```typescript
// ---- 削除対象 ----
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
export { ConfigureStep } from "./ConfigureStep";
export type { WizardOptions, ConfigureStepProps } from "./ConfigureStep";
export type GenerationMode = "llm" | "template";

// ---- 維持対象 ----
export { StepIndicator } from "./StepIndicator";
export type { StepIndicatorProps } from "./StepIndicator";
export { GenerateStep } from "./GenerateStep";
export type { GenerateStepProps } from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps } from "./CompleteStep";
```

### After（変更後）

```typescript
// ---- 新規追加 ----
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";

// ---- 維持（変更なし）----
export { StepIndicator } from "./StepIndicator";
export type { StepIndicatorProps } from "./StepIndicator";
export { GenerateStep } from "./GenerateStep";
export type { GenerateStepProps } from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps } from "./CompleteStep";
```

## 変更差分テーブル

| エクスポート                           | 変更前 | 変更後 | 操作 |
| -------------------------------------- | ------ | ------ | ---- |
| `DescribeStep`                         | あり   | なし   | 削除 |
| `DescribeStepProps`                    | あり   | なし   | 削除 |
| `ConfigureStep`                        | あり   | なし   | 削除 |
| `WizardOptions`                        | あり   | なし   | 削除 |
| `ConfigureStepProps`                   | あり   | なし   | 削除 |
| `GenerationMode`                       | あり   | なし   | 削除 |
| `SkillInfoStep`                        | なし   | あり   | 追加 |
| `SkillInfoStepProps`                   | なし   | あり   | 追加 |
| `ConversationRoundStep`                | なし   | あり   | 追加 |
| `ConversationRoundStepProps`           | なし   | あり   | 追加 |
| `StepIndicator` / `StepIndicatorProps` | あり   | あり   | 維持 |
| `GenerateStep` / `GenerateStepProps`   | あり   | あり   | 維持 |
| `CompleteStep` / `CompleteStepProps`   | あり   | あり   | 維持 |

## 実装方針

1. 削除対象エクスポート（5項目）を `index.ts` から除去する。
2. 追加対象エクスポート（4項目）を `index.ts` に追記する。
3. 維持対象エクスポート（6項目）は変更しない。
4. TypeScript の型チェック (`pnpm typecheck`) でエラーがないことを確認する。

## 参照資料

| 資料名         | パス                                                         | 用途           |
| -------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 影響範囲マップ | `outputs/phase-1/impact-scope-map.md`                        | Phase 1 成果物 |
| 現行index.ts   | `apps/desktop/src/renderer/components/skill/wizard/index.ts` | 現行実装確認   |

## 実行手順

1. Phase 1 成果物を確認し、設計の前提を固める。
2. Before/After エクスポートテーブルを完成させる。
3. 変更差分テーブルで削除/追加/維持を整理する。
4. 実装方針を確定する。

## 成果物

| 成果物             | パス                                   | 説明                       |
| ------------------ | -------------------------------------- | -------------------------- |
| エクスポート設計書 | `outputs/phase-2/export-design.md`     | Before/After テーブル      |
| 変更差分テーブル   | `outputs/phase-2/change-diff-table.md` | 削除/追加/維持の整理       |
| テスト戦略         | `outputs/phase-2/test-strategy.md`     | 型チェック・ビルド検証方針 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Before/After テーブルが完成していること
- [ ] 削除5件・追加4件・維持6件が確定していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Before/After エクスポート設計の確定
3. 変更差分テーブルの整理
4. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
