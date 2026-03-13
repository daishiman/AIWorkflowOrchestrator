# Phase 1: 現行資産棚卸し

## 結論

Task04 の実装対象は既存資産を破棄せず、`prompt品質` `skill品質` `execution品質` を横断する判定レイヤーを追加する形で整理した。Task03 側は `SkillLifecyclePanel` と `SkillAnalysisView`、Task05 側は `SkillCenterView` を受け側に採用した。

## 現行資産と責務

| 区分                        | 実装アンカー                                                         | 現行責務                                        | Task04 での扱い                                                                                         |
| --------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Prompt 評価                 | `apps/desktop/src/main/services/skill/PromptOptimizer.ts`            | prompt score と breakdown を返す                | 直接 Renderer から呼ばず、preload 経由の `evaluatePrompt()` に統一                                      |
| Preload 契約                | `apps/desktop/src/preload/skill-api.ts`                              | `skill:*` API を公開                            | `skill.evaluatePrompt()` を追加し、Task04 の draft / post_create / post_execute / post_improve で再利用 |
| Shared 型                   | `packages/shared/src/types/skill-improver.ts`                        | `SkillAnalysis` / `PromptEvaluation` を定義     | 新規 `skill-evaluation.ts` で lifecycle 専用型を追加                                                    |
| Store: 既存 lifecycle state | `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | create / execute / analyze / improve の既存状態 | `currentAnalysis` と execution stream は維持し、判定結果のみ別 slice へ分離                             |
| Store: 新規評価 state       | `apps/desktop/src/renderer/store/slices/skillEvaluationSlice.ts`     | なし                                            | 最新 snapshot / gate / history / error / re-evaluate action を所有                                      |
| Pure gate engine            | `apps/desktop/src/renderer/store/skillEvaluation.ts`                 | なし                                            | 閾値、hard block、nextSurface、summary、delta を集約                                                    |
| Task03 surface              | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | create / execute / improve 導線                 | 各 checkpoint の自動評価と session log 追記を追加                                                       |
| 改善 surface                | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`   | 分析結果と改善適用                              | `SkillEvaluationPanel` と再評価 CTA を追加                                                              |
| Score 可視化                | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`        | overall / category score 表示                   | gate badge / next / delta 表示を追加                                                                    |
| Task05 受け側               | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`          | 作成済みツールの探索導線                        | 利用前品質ゲート banner と再評価入口を追加                                                              |

## 3軸の根拠データ

| 評価軸        | 主データ                                                                                        | 実装位置                                                  |
| ------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| prompt品質    | `PromptEvaluation.score`, `breakdown.clarity/specificity/completeness/reproducibility/security` | preload `skill.evaluatePrompt()` + `skillEvaluationSlice` |
| skill品質     | `SkillAnalysis.overallScore`, `categories`, `suggestions`, `risks`                              | `agentSlice.currentAnalysis`                              |
| execution品質 | `status`, `messages`, `permissionPending` から導出する `ExecutionQualityEvaluation`             | `buildExecutionQualityEvaluation()`                       |

## 4 checkpoint の現行接続

| checkpoint     | 入力元                                             | 実装アンカー                              | 出力                    |
| -------------- | -------------------------------------------------- | ----------------------------------------- | ----------------------- |
| `draft`        | 作成依頼文                                         | `SkillLifecyclePanel.handlePrepare()`     | `evaluateDraft()`       |
| `post_create`  | `createSkill()` + `analyzeSkill()`                 | `SkillLifecyclePanel.handleCreate()`      | `evaluatePostCreate()`  |
| `post_execute` | `executeSkill()` + stream 結果                     | `SkillLifecyclePanel` effect              | `evaluatePostExecute()` |
| `post_improve` | `applyImprovements()` / `autoImprove()` 後の再分析 | `useSkillAnalysis.ts` / `SkillCenterView` | `evaluatePostImprove()` |

## hard block の現行判定

| 条件                        | 判定ロジック                                     |
| --------------------------- | ------------------------------------------------ |
| prompt security < 70        | `PromptEvaluation.breakdown.security` を判定     |
| critical risk 残存          | `SkillAnalysis.risks.some(level === "critical")` |
| permission safety < 70      | `ExecutionQualityEvaluation.permissionSafety`    |
| 実行失敗かつ retry 根拠不足 | `reliability < 60 && retryReadiness < 70`        |

## Task03 / Task05 handoff の棚卸し結果

| handoff                       | 実現方法                                                                      | 状態     |
| ----------------------------- | ----------------------------------------------------------------------------- | -------- |
| Task03 create -> Task04 gate  | `SkillLifecyclePanel` で自動実行                                              | 実装済み |
| Task03 execute -> Task04 gate | `evaluatePostExecute()` を effect で実行                                      | 実装済み |
| Task03 improve -> Task04 gate | `useSkillAnalysis` の improve 後再評価                                        | 実装済み |
| Task04 -> Task05 reuse        | `SkillCenterView` が `latestGateDecision` と `evaluatePostImprove()` を再利用 | 実装済み |

## 棚卸しで見つかった差分と解消

| 差分                                                 | 解消内容                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| post_improve に execution 品質が常に揃うとは限らない | 欠損軸を 0 点扱いせず、利用可能軸だけで重みを正規化する実装へ修正 |
| Task05 側の再利用 UI が未接続                        | `SkillCenterView` に品質ゲート banner と再評価入口を追加          |
| 文字列重複により UI テストが不安定                   | `SkillAnalysisView.test.tsx` を総合スコア要素の特定方式へ修正     |
