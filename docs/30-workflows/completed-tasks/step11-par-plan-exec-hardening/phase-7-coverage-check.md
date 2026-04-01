# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 7                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 6 までに追加したテストの coverage を計測し、drift 再発を数値で抑える。

## 実行タスク

- runtime 側の agent 名導出 coverage を測る
- renderer 側の approved snapshot coverage を測る
- 追加ケースの未カバー分岐を洗い出す

## 参照資料

| 資料名            | パス                                                                                               | 参照理由            |
| ----------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| runtime plan test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`          | P0-07 coverage 対象 |
| renderer llm test | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U2 coverage 対象    |

## カバレッジマッピング

### TASK-P0-07

| 対象                                               | 目標 | 計測結果   |
| -------------------------------------------------- | ---- | ---------- |
| `RuntimeSkillCreatorFacade.plan()` の agent 導出   | 100% | （未計測） |
| `PLAN_RESOURCE_REQUESTS` の agent / reference 分岐 | 100% | （未計測） |
| `AGENT_NAMES` 残留チェック                         | 0 件 | （未計測） |

### TASK-SDK-04-U2

| 対象                            | 目標 | 計測結果   |
| ------------------------------- | ---- | ---------- |
| `handleGeneratePlan`            | 100% | （未計測） |
| `handleExecutePlan`             | 100% | （未計測） |
| generate → edit → execute drift | 検出 | （未計測） |

## 実行手順

### ステップ1: coverage を取る

1. `pnpm --filter @repo/desktop vitest run --coverage` を実行する
2. `RuntimeSkillCreatorFacade.plan()` と `SkillLifecyclePanel.tsx` の coverage を確認する

### ステップ2: 未カバー分岐を潰す

1. `PLAN_RESOURCE_REQUESTS` の non-agent 分岐を確認する
2. `approvedSkillSpec` の cancel / regenerate 分岐を確認する

### ステップ3: 記録する

1. coverage 結果を outputs に記録する
2. 0 件の grep 結果があるならそのまま記録する

## 成果物

| 成果物           | パス                                  | 説明         |
| ---------------- | ------------------------------------- | ------------ |
| coverage summary | `outputs/phase-7/coverage-summary.md` | 実測値の固定 |

## 完了条件

- [ ] runtime / renderer の coverage が計測されている
- [ ] drift 再発を防ぐ分岐がカバーされている
- [ ] Phase 8 へ進める状態になっている

## サブタスク管理

1. runtime coverage
2. renderer coverage
3. 未カバー分岐の確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 追加テストの coverage が記録されている
- [ ] Phase 8 で refactoring へ進める
