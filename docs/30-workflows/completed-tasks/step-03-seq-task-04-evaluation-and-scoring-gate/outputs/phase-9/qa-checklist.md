# Phase 9: QA Checklist

| 項目                           | 結果  | 根拠                                                                            |
| ------------------------------ | ----- | ------------------------------------------------------------------------------- |
| 同一入力の再現性               | PASS  | `skillEvaluation.ts` pure function + `skillEvaluationSlice.test.ts`             |
| 理由文と score の整合          | PASS  | `buildLifecycleGateDecision()` と screenshot 6件で一致確認                      |
| Task03 表示整合                | PASS  | `SkillLifecyclePanel`, `SkillAnalysisView`, `ScoreDisplay`                      |
| Task05 表示整合                | PASS  | `SkillCenterView` banner                                                        |
| hard block bypass 不可         | PASS  | `critical risk` で常に revise_required                                          |
| preload 契約                   | PASS  | `skill-api.test.ts`, `skill-api.contract.test.ts`                               |
| shared / desktop typecheck     | PASS  | `pnpm --filter @repo/shared typecheck`, `pnpm --filter @repo/desktop typecheck` |
| repo global coverage threshold | MINOR | Task04 対象外ファイルを含めて FAIL                                              |

## 実行済みコマンド

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec vitest run \
  src/preload/__tests__/skill-api.test.ts \
  src/preload/__tests__/skill-api.contract.test.ts \
  src/renderer/store/slices/__tests__/skillEvaluationSlice.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx \
  src/renderer/views/SkillCenterView/__tests__/SkillCenterView.delete-confirm.test.tsx
node apps/desktop/scripts/capture-task-skill-lifecycle-04-phase11.mjs
```
