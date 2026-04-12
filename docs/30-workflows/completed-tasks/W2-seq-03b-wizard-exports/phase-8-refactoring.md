# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 8                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 7                          |
| 後続Phase  | Phase 9                          |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

`wizard/index.ts` 周辺の export contract を簡潔に保ち、deprecated `DescribeStep.tsx` の依存を安定化させた状態で全テスト Green を維持する。

## リファクタリング観点

### 1. バレル契約の最小化

今回のタスクで必要な変更だけを `wizard/index.ts` に残し、既存 export 群の順序や責務を不用意に崩さない。

```typescript
// wizard/index.ts（リファクタリング後の要点）

// DescribeStep / DescribeStepProps は削除
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
export type { GenerationMode } from "./GenerateStep";
```

### 2. deprecated ファイルの依存整理

`DescribeStep.tsx` は移行期間中も残るため、`@deprecated` を明示し、型 import を barrel ではなく `GenerateStep.tsx` へ直接向ける。

```typescript
// DescribeStep.tsx（廃止時の対処）
/**
 * @deprecated UT-SKILL-WIZARD-W2-seq-03b により廃止。
 * SkillInfoStep を使用してください。
 */
export function DescribeStep() { ... }
```

### 3. コメント・JSDoc の整理

`index.ts` に各エクスポートの用途コメントを追加し、新規参入者が理解しやすくする。

## 責務境界マップ

| ファイル                           | 責務                                     | 状態     |
| ---------------------------------- | ---------------------------------------- | -------- |
| `wizard/index.ts`                  | バレルエクスポート（再エクスポートのみ） | 維持     |
| `wizard/SkillInfoStep.tsx`         | Step 0 UI（スキル情報入力）              | 新規追加 |
| `wizard/ConversationRoundStep.tsx` | Step 1 UI（会話ラリー）                  | 新規追加 |
| `wizard/StepIndicator.tsx`         | ステップインジケーター UI                | 維持     |
| `wizard/GenerateStep.tsx`          | Step 2 UI（LLM生成）                     | 維持     |
| `wizard/CompleteStep.tsx`          | Step 3 UI（完了画面）                    | 維持     |
| `wizard/DescribeStep.tsx`          | deprecated 旧 UI（移行期間の互換用）     | 維持     |

## 参照資料

| 資料名                 | パス                                              | 用途           |
| ---------------------- | ------------------------------------------------- | -------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| エクスポート設計書     | `outputs/phase-2/export-design.md`                | Phase 2 成果物 |

## 実行手順

1. Phase 7 成果物を確認する。
2. `DescribeStep.tsx` の依存整理と `@deprecated` 付与を実施する。
3. リファクタリング後に全テストが Green であることを確認する。

## 成果物

| 成果物         | パス                                             | 説明                         |
| -------------- | ------------------------------------------------ | ---------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタリング内容と方針   |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト確認計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | ファイル責務の整理           |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] export contract が最小変更に保たれていること
- [ ] `DescribeStep.tsx` に `@deprecated` が付与され、barrel 依存が除去されていること
- [ ] リファクタリング後に全テストが Green であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. `DescribeStep.tsx` の依存整理
3. `@deprecated` 付与
4. リファクタ後テスト確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
