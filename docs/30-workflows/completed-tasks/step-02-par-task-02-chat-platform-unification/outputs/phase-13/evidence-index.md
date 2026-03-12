# Evidence Index

## Phase 1-12 成果物

| Phase    | 根拠                                                     | 要点                                                                    |
| -------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Phase 1  | `outputs/phase-1/requirements-definition.md`             | 3 mode 共通化、Task03 契約、spec 抽出方針                               |
| Phase 2  | `outputs/phase-2/common-chat-domain-model.md`            | session / mode / context の共通ドメインモデル                           |
| Phase 3  | `outputs/phase-3/design-review-findings.md`              | entry surface と execution surface の分離                               |
| Phase 4  | `outputs/phase-4/test-matrix.md`                         | handoff / retry / revive / screenshot coverage の観点固定               |
| Phase 5  | `outputs/phase-5/implementation-log.md`                  | `chatSlice` / `ChatView` / `WorkspaceView` / `SkillCenterView` 実装記録 |
| Phase 6  | `outputs/phase-6/regression-case-matrix.md`              | retry / abort / resume / mode reuse の回帰整理                          |
| Phase 7  | `outputs/phase-7/requirement-traceability.md`            | AC-1〜AC-5 と自動/手動検証の対応                                        |
| Phase 8  | `outputs/phase-8/refactoring-log.md`                     | context builder、session platform、責務再配置                           |
| Phase 9  | `outputs/phase-9/quality-report.md`                      | type / test / build / spec audit の品質証跡                             |
| Phase 10 | `outputs/phase-10/final-review-result.md`                | release 可否と blocking issue なし判定                                  |
| Phase 11 | `outputs/phase-11/manual-test-result.md`                 | Apple UI/UX 観点レビュー、6 screenshot 証跡                             |
| Phase 12 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | task spec 完全性、system spec / skill / unassigned 同期                 |

## 主要検証コマンド

| コマンド                                                                                                                                                                                                                                                              | 結果                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `pnpm typecheck`                                                                                                                                                                                                                                                      | PASS                          |
| `pnpm lint`                                                                                                                                                                                                                                                           | PASS（warning あり、error 0） |
| `pnpm --filter @repo/shared build`                                                                                                                                                                                                                                    | PASS                          |
| `pnpm --filter @repo/desktop build`                                                                                                                                                                                                                                   | PASS                          |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/chatSlice.test.ts src/renderer/views/ChatView/ChatView.test.tsx src/renderer/views/WorkspaceView/WorkspaceView.test.tsx src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx` | PASS                          |
| `pnpm test --testTimeout=900000`                                                                                                                                                                                                                                      | PASS（pre-push hook 成功）    |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification`                                                                           | PASS                          |
| `node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --check`                                                                                                                                                                                         | PASS                          |

## UI / UX 証跡

- `outputs/phase-11/screenshots/TC-02-01-chat-general-foundation.png`
- `outputs/phase-11/screenshots/TC-02-02-chat-retry-error-state.png`
- `outputs/phase-11/screenshots/TC-02-03-workspace-surface.png`
- `outputs/phase-11/screenshots/TC-02-04-workspace-handoff-chat.png`
- `outputs/phase-11/screenshots/TC-02-05-skill-center-journey.png`
- `outputs/phase-11/screenshots/TC-02-06-skill-lifecycle-handoff-chat.png`

## 関連仕様同期

- system spec 正本: `.claude/skills/aiworkflow-requirements/references/`
- task spec / validators: `.claude/skills/task-specification-creator/`
- skill 改善: `.claude/skills/skill-creator/`
- issue 同期: `.claude/skills/github-issue-manager/`
- mirror 同期先: `.agents/skills/*`

## 関連未タスク / follow-up

- `docs/30-workflows/unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md`
- GitHub Issue: `#1163`
