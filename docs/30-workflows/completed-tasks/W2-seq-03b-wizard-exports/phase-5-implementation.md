# Phase 5: 実装

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| 作成日     | 2026-04-07                       |
| ステータス | completed                        |

## 目的

Phase 4 で定義した Red テストを Green へ移行する最小実装（エクスポート削除と追加）を行う。

## Before/After テーブル（実装記録用）

| エクスポート                 | Before | After | 操作 | 実装状況 |
| ---------------------------- | ------ | ----- | ---- | -------- |
| `DescribeStep`               | あり   | なし  | 削除 | [ ]      |
| `DescribeStepProps`          | あり   | なし  | 削除 | [ ]      |
| `ConfigureStep`              | あり   | なし  | 削除 | [ ]      |
| `WizardOptions`              | あり   | なし  | 削除 | [ ]      |
| `ConfigureStepProps`         | あり   | なし  | 削除 | [ ]      |
| `GenerationMode`             | あり   | なし  | 削除 | [ ]      |
| `SkillInfoStep`              | なし   | あり  | 追加 | [ ]      |
| `SkillInfoStepProps`         | なし   | あり  | 追加 | [ ]      |
| `ConversationRoundStep`      | なし   | あり  | 追加 | [ ]      |
| `ConversationRoundStepProps` | なし   | あり  | 追加 | [ ]      |
| `InterviewProgressBar` 等    | あり   | あり  | 維持 | [ ]      |
| `ApplySummaryCard` 等        | あり   | あり  | 維持 | [ ]      |
| `StepIndicator` 等           | あり   | あり  | 維持 | [ ]      |
| `GenerateStep` 等            | あり   | あり  | 維持 | [ ]      |
| `CompleteStep` 等            | あり   | あり  | 維持 | [ ]      |

## 実装手順

### Step 1: 削除作業

`apps/desktop/src/renderer/components/skill/wizard/index.ts` から以下を削除する：

```typescript
// 削除する行
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
export { ConfigureStep } from "./ConfigureStep";
export type { WizardOptions, ConfigureStepProps } from "./ConfigureStep";
export type GenerationMode = "llm" | "template";
```

### Step 2: 追加作業

`apps/desktop/src/renderer/components/skill/wizard/index.ts` に以下を追加する：

```typescript
// 追加する行
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
export { InterviewProgressBar } from "./InterviewProgressBar";
export type { InterviewProgressBarProps } from "./InterviewProgressBar";
export { ApplySummaryCard } from "./ApplySummaryCard";
export type { ApplySummaryCardProps } from "./ApplySummaryCard";
```

### Step 3: 型チェック確認

```bash
pnpm --filter @repo/desktop typecheck
```

エラーがないことを確認する。

### Step 4: ビルド確認

```bash
pnpm --filter @repo/desktop build
```

ビルドが成功することを確認する。

## 変更後の index.ts 全体像

```typescript
// wizard/index.ts（変更後）

// 新規追加
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
export { InterviewProgressBar } from "./InterviewProgressBar";
export type { InterviewProgressBarProps } from "./InterviewProgressBar";
export { ApplySummaryCard } from "./ApplySummaryCard";
export type { ApplySummaryCardProps } from "./ApplySummaryCard";

// 維持
export { StepIndicator } from "./StepIndicator";
export type { StepIndicatorProps } from "./StepIndicator";
export { GenerateStep } from "./GenerateStep";
export type { GenerateStepProps } from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps } from "./CompleteStep";
```

## 参照資料

| 資料名             | パス                                    | 用途           |
| ------------------ | --------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| Red テスト結果     | `outputs/phase-4/red-test-result.md`    | Phase 4 成果物 |
| エクスポート設計書 | `outputs/phase-2/export-design.md`      | Phase 2 成果物 |
| 変更差分テーブル   | `outputs/phase-2/change-diff-table.md`  | Phase 2 成果物 |

## 実行手順

1. Phase 4 成果物を確認する。
2. Step 1 で削除作業を実施する。
3. Step 2 で追加作業を実施する。
4. Step 3 で型チェックを確認する。
5. Step 4 でビルドを確認する。
6. Phase 4 のテストが全て Green になることを確認する。

## 成果物

| 成果物           | パス                                        | 説明                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 削除/追加の実施記録    |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル       |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | エクスポート差分の記録 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 削除エクスポート5件が全て除去されていること
- [ ] 追加エクスポート4件が全て追加されていること
- [ ] 維持エクスポートに変更がないこと
- [ ] `pnpm typecheck` がエラーなしで通過すること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 削除作業（Step 1）
3. 追加作業（Step 2）
4. 型チェック・ビルド確認（Step 3〜4）
5. テスト Green 確認
6. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
