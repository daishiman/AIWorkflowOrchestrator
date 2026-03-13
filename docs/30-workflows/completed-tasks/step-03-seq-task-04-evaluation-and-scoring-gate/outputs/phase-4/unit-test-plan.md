# Phase 4: Unit / Store Test Plan

## pure function

| 対象                                | ケース                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `buildExecutionQualityEvaluation()` | completed / error / permission pending                                  |
| `calculateLifecycleTotalScore()`    | 59 / 60 / 79 / 80 / 90、欠損軸正規化                                    |
| `detectLifecycleHardBlocks()`       | security 69, critical risk, permission 69, retry 根拠不足               |
| `buildLifecycleGateDecision()`      | revise / save_with_warning / use_with_warning / use_ready / recommended |

## store

| 対象                    | ケース                                    |
| ----------------------- | ----------------------------------------- |
| `evaluateDraft()`       | latest snapshot 保存                      |
| `evaluatePostCreate()`  | warning スコア帯                          |
| `evaluatePostExecute()` | completed -> use_ready                    |
| `evaluatePostImprove()` | delta > 0 -> recommended                  |
| `evaluationHistory`     | previous snapshot を使った delta 計算     |
| error path              | evaluatePrompt 失敗時の `evaluationError` |

## 実装済みテストファイル

- `apps/desktop/src/renderer/store/slices/__tests__/skillEvaluationSlice.test.ts`
- `apps/desktop/src/preload/__tests__/skill-api.test.ts`
- `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`
