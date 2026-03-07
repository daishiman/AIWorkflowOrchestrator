# Phase 13 Handoff Checklist

## reviewer 向け確認項目

- [ ] `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/` が current workflow 正本であり、Phase 1〜13 仕様書と `outputs/phase-*` が揃っている
- [ ] `outputs/phase-12/implementation-guide.md` の Part 1 / Part 2 要点が PR 本文 `## その他` と implementation-guide 全文コメントへ反映されている
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `lessons-learned.md` に task-056e 実装内容、苦戦箇所、未タスク backlog が反映されている
- [ ] `.claude/skills/skill-creator/` と `.claude/skills/task-specification-creator/` に Phase 12 task spec 再確認テンプレート改善と branch-level visual recheck 例外が反映されている
- [ ] `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-task-spec-recheck-adoption-001.md` が残差 backlog として適切に参照されている
- [ ] PR 本文では UI/UX 実装変更なしと判断し、`## スクリーンショット` セクションを削除している

## 実行検証メモ

- full suite はユーザーが直前実行済み:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm --filter @repo/shared build`
  - `pnpm --filter @repo/desktop build`
  - `pnpm test --testTimeout=900000`
- 本ターンで追加確認するコマンド:
  - `node ~/.claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run`
  - `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync --strict`
  - `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync`
  - `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

## 参考導線

- `phase-13-pr-creation.md`
- `outputs/phase-13/pr-description.md`
- `outputs/phase-13/pr-info.md`
- `outputs/phase-13/review-handshake.md`
- `outputs/phase-12/implementation-guide.md`
