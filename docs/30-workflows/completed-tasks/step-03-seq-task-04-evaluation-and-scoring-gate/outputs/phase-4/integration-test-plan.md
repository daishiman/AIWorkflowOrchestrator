# Phase 4: Integration Test Plan

## 対象フロー

| フロー                              | 検証方法                                          | 状態     |
| ----------------------------------- | ------------------------------------------------- | -------- |
| Task03 prepare -> draft gate        | `SkillLifecyclePanel.test.tsx`                    | 実装済み |
| Task03 create -> post_create gate   | `SkillLifecyclePanel.test.tsx`                    | 実装済み |
| Task03 execute -> post_execute gate | `SkillLifecyclePanel.test.tsx` + Phase11 TC-11-03 | 実装済み |
| Task03 improve -> post_improve gate | `SkillAnalysisView.test.tsx` + Phase11 TC-11-05   | 実装済み |
| Task04 -> Task05 reuse              | `SkillCenterView.test.tsx` + Phase11 TC-11-06     | 実装済み |

## 補完方針

- Task05 の本流実行面は未着手のため、Task04 では `SkillCenterView` を受け側 surface として integration を固定した。
- `SkillCenterView` 側は `latestGateDecision` と `evaluatePostImprove()` の再利用を確認し、stream 再実行は Task05 本実装へ委譲する。

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/store/slices/__tests__/skillEvaluationSlice.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx \
  src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx \
  src/preload/__tests__/skill-api.test.ts \
  src/preload/__tests__/skill-api.contract.test.ts
```
