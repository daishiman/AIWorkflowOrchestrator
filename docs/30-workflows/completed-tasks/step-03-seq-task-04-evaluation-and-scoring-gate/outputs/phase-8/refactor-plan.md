# Phase 8: Refactor Plan

## 実施済み refactor

| 項目             | 内容                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| 閾値集約         | `LIFECYCLE_SCORE_THRESHOLDS` を `skillEvaluation.ts` に集約          |
| gate 文言集約    | `getLifecycleGateLabel()` と `summary` 生成を pure function に集約   |
| history 変換集約 | `buildLifecycleEvaluationSnapshot()` で `deltaFromPrevious` を一元化 |
| selector 集約    | `store/index.ts` に Task04 selector 群を追加                         |

## 追加で維持する方針

1. UI 側で閾値計算を再実装しない
2. `summary` を component ごとに個別生成しない
3. Task05 側は `latestGateDecision` を read-only で再利用し、独自採点ロジックを持たない

## refactor 後の確認

- targeted tests: PASS
- typecheck: PASS
- screenshot 6件: PASS
