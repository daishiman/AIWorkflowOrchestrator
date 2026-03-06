# Phase 13 Handoff Checklist

## reviewer 向け確認項目

- [ ] `packages/shared/src/types/auth-mode.ts` の `IPCResponse<T>` / `AuthModeStatus` / `AuthModeChangedEvent` が公開契約の正本になっている
- [ ] `apps/desktop/src/main/ipc/authModeHandlers.ts` が shared DTO を直接返し、`invalid sender` / `invalid mode` / credential不足の分岐が仕様どおり
- [ ] `apps/desktop/src/preload/index.ts` と `apps/desktop/src/preload/types.ts` の公開 API が `get/set/status/validate/onModeChanged` で揃っている
- [ ] `apps/desktop/src/renderer/store/slices/authModeSlice.ts` が `fetchMode -> fetchStatus` / `setMode -> fetchStatus` と `changed` event を整合的に扱う
- [ ] `apps/desktop/src/renderer/views/SettingsView/index.tsx` と `AuthModeSelector` の `data-testid` / state 表示がテスト・スクリーンショットと一致する
- [ ] Phase 11 証跡 5件と Apple UI/UX 観点レビューを [manual-test-result.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260306-075818-wt1/docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-11/manual-test-result.md) で確認した
- [ ] [implementation-guide.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260306-075818-wt1/docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/implementation-guide.md) の Part 1 / Part 2 が PR本文と PRコメントへ反映されている
- [ ] `aiworkflow-requirements` の `interfaces-auth.md` / `api-ipc-system.md` / `task-workflow.md` / `lessons-learned.md` に今回の実装内容と苦戦箇所が反映されている
- [ ] workflow が `completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/` へ移管され、関連未タスク 2 件が親 workflow 配下 `unassigned-task/` にある
- [ ] `docs/30-workflows/unassigned-task/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` が Issue #1013 に同期済みである

## 実行検証メモ

- full suite はユーザーが 2026-03-06 に実行済み: `pnpm typecheck`, `pnpm lint`, `pnpm --filter @repo/shared build`, `pnpm --filter @repo/desktop build`, `pnpm test --testTimeout=900000`
- 追加で本ターンで確認したコマンド:
  - `verify-all-specs --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 --strict`
  - `validate-phase-output docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001`
  - `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001`
  - `verify-unassigned-links --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 参考導線

- [phase-13-pr-creation.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260306-075818-wt1/docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/phase-13-pr-creation.md)
- [pr-info.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260306-075818-wt1/docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-13/pr-info.md)
- [phase12-task-spec-compliance-check.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260306-075818-wt1/docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/phase12-task-spec-compliance-check.md)
