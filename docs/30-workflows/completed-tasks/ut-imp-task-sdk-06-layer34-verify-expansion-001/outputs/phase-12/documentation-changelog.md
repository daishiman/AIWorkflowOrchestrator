# Documentation Changelog

## 2026-03-27

- `docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/` を current root として更新
- `UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001` の Phase 1-13 task spec を追加
- `packages/shared/src/types/skillCreator.ts` と `packages/shared/src/types/index.ts` に verify detail / reverify DTO を追加
- `apps/desktop/` の main / preload / renderer / tests に Layer 3 / Layer 4 verify detail surface を実装
- `.claude/skills/aiworkflow-requirements/references/` と `.agents/skills/aiworkflow-requirements/references/` の canonical API/IPC docs を更新
- `.claude` / `.agents` 双方の `topic-map.md` / `keywords.json` を再生成
- Phase 11 / Phase 12 outputs を実装実績ベースへ更新
- Phase 11 に `screenshot-coverage.md` / `screenshots/phase11-capture-metadata.json` / review board screenshot を追加

## current / baseline

| 種別                       | 件数 | 内容                                                         |
| -------------------------- | ---- | ------------------------------------------------------------ |
| current workflow violation | 0    | 本 task pack 自体の構造違反は 0                              |
| baseline repo violation    | 381  | unassigned-task 全体の既存違反。今回 task 固有の違反ではない |

## validation

- `pnpm exec tsc --noEmit -p apps/desktop/tsconfig.json`: PASS
- `pnpm exec prettier --check <changed files>`: PASS
- `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001`: PASS（13/13, warnings=0）
- `node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001`: PASS（32項目, errors=0, warnings=0）
- `verify-unassigned-links.js --source docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/outputs/phase-12/unassigned-task-detection.md`: PASS（links 0）
- `node .agents/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md`: currentViolations=0, baselineViolations=381
- `pnpm exec vitest ...`: BLOCKED（`esbuild` host/binary mismatch）

## 補足

- `verify-unassigned-links` の repo 全体 baseline 課題は既存負債であり、本 task の current 差分には含めない
- `artifacts.json` と `outputs/artifacts.json` の同期は current wave で維持した
- `apps/backend/` は今回の機能面の変更対象外であり、差分なしを確認した
- Phase 11 の visual evidence は live capture ではなく current workflow review board fallback で記録した
