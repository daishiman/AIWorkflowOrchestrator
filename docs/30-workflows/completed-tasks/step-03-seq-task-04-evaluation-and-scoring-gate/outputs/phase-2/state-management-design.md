# Phase 2: 状態管理設計

## slice ownership

| state                                                                                                                                                              | 所有者                                                | 理由                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------- |
| `currentAnalysis`, `isAnalyzing`, `isImproving`, `streamingMessages`, `skillExecutionStatus`                                                                       | `agentSlice`                                          | 既存 lifecycle state を維持するため |
| `latestPromptRequest`, `latestEvaluationSnapshot`, `latestGateDecision`, `latestExecutionQuality`, `evaluationHistory`, `evaluationError`, `isEvaluatingLifecycle` | `skillEvaluationSlice`                                | Task04 固有責務を分離するため       |
| 一時 UI 状態                                                                                                                                                       | `SkillLifecyclePanel` / `SkillCenterView` local state | 表示専用で永続共有が不要            |

## action 設計

| action                                                                                           | 入力                | 出力                    |
| ------------------------------------------------------------------------------------------------ | ------------------- | ----------------------- |
| `evaluateDraft(prompt)`                                                                          | prompt              | `LifecycleGateDecision` |
| `evaluatePostCreate({ skillName, prompt, skillAnalysis })`                                       | create 後 analysis  | `LifecycleGateDecision` |
| `evaluatePostExecute({ skillName, prompt, skillAnalysis, status, messages, permissionPending })` | execute 後 stream   | `LifecycleGateDecision` |
| `evaluatePostImprove({ skillName, prompt, skillAnalysis })`                                      | improve 後 analysis | `LifecycleGateDecision` |
| `clearSkillEvaluation()`                                                                         | なし                | 初期状態へ戻す          |

## selector 設計

| selector                        | 用途                                     |
| ------------------------------- | ---------------------------------------- |
| `useLatestGateDecision()`       | badge / summary / nextSurface を描画する |
| `useLatestEvaluationSnapshot()` | stage / delta / totalScore を描画する    |
| `useLatestPromptRequest()`      | 再評価時の prompt 再利用                 |
| `useLatestExecutionQuality()`   | execute 後の品質再利用                   |
| `useSkillEvaluationHistory()`   | 履歴監査                                 |
| `useIsLifecycleEvaluating()`    | 再評価中 UI                              |
| `useSkillEvaluationError()`     | 失敗時の error surface                   |

## イベントフロー

| surface               | trigger                        | action                |
| --------------------- | ------------------------------ | --------------------- |
| `SkillLifecyclePanel` | 作成依頼の準備                 | `evaluateDraft`       |
| `SkillLifecyclePanel` | create 完了                    | `evaluatePostCreate`  |
| `SkillLifecyclePanel` | execute が terminal state 到達 | `evaluatePostExecute` |
| `SkillAnalysisView`   | 選択適用 / 全自動改善 / 再評価 | `evaluatePostImprove` |
| `SkillCenterView`     | 利用前再評価                   | `evaluatePostImprove` |

## 永続化方針

`skillEvaluationSlice` は persist 対象に入れない。判定結果は current session の文脈に依存し、古い評価を自動復元すると stale risk が高いため。
