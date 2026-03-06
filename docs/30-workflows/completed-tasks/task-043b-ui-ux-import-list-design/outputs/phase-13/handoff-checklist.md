# Phase 13 Handoff Checklist

## reviewer 向け確認項目

- [ ] `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` が imported / available の 2 セクション、検索、success message、focus 復帰を持つ
- [ ] `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx` が post-condition で import 成功を確定し、dialog open 中の alert 重複を防ぐ
- [ ] `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` / `SkillManagementPanel.integration.test.tsx` / `SkillImportDialog.test.tsx` が mixed state, no-result, error dedupe, focus, success を固定している
- [ ] Phase 11 の 9 スクリーンショットと Apple UI/UX 観点レビューを `outputs/phase-11/manual-test-result.md` で確認した
- [ ] `outputs/phase-12/implementation-guide.md` の Part 1 / Part 2 が PR 本文 `## その他` と PR コメントへ反映されている
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` / `ui-ux-components.md` に今回の実装内容と苦戦箇所が反映されている
- [ ] `.claude/skills/skill-creator/` と `.claude/skills/task-specification-creator/` に Phase 12/13 向けテンプレート改善が反映されている
- [ ] `docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/` に workflow 本体と phase outputs が揃っている
- [ ] 実装固有の未タスクは workflow 配下 `unassigned-task/` に移管済みで、継続 backlog は root `docs/30-workflows/unassigned-task/` に分離されている

## 実行検証メモ

- full suite はユーザーが 2026-03-06 に実行済み:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm --filter @repo/shared build`
  - `pnpm --filter @repo/desktop build`
  - `pnpm test --testTimeout=900000`
- 本ターンで追加確認するコマンド:
  - `node ~/.claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run`
  - `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design --strict`
  - `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design`
  - `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design`
  - `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 参考導線

- `phase-13-pr-creation.md`
- `outputs/phase-13/pr-info.md`
- `outputs/phase-13/review-handshake.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`
- `outputs/phase-12/implementation-guide.md`
