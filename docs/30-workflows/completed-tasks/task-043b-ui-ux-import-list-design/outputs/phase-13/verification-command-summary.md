# Phase 13 Verification Command Summary

## user 実行済みコマンド

| コマンド                            | 判定      | 根拠                                                   |
| ----------------------------------- | --------- | ------------------------------------------------------ |
| `pnpm typecheck`                    | PASS 扱い | ユーザーが本ブランチ terminal で 2026-03-06 に実行済み |
| `pnpm lint`                         | PASS 扱い | ユーザーが本ブランチ terminal で 2026-03-06 に実行済み |
| `pnpm --filter @repo/shared build`  | PASS 扱い | ユーザーが本ブランチ terminal で 2026-03-06 に実行済み |
| `pnpm --filter @repo/desktop build` | PASS 扱い | ユーザーが本ブランチ terminal で 2026-03-06 に実行済み |
| `pnpm test --testTimeout=900000`    | PASS 扱い | ユーザーが本ブランチ terminal で 2026-03-06 に実行済み |

## 本ターンで追加実行するコマンド

| コマンド                                                                                                                                                                         | 目的                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `node ~/.claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run`                                                                                                | 未同期タスク仕様書の有無確認     |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design --strict`            | workflow 仕様整合の最終確認      |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design`                           | Phase 1-13 出力構成の確認        |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design` | screenshot coverage 9/9 の再確認 |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`                  | unassigned-task 導線の確認       |
| `gh pr checks <PR番号>`                                                                                                                                                          | PR 作成後の CI 状態確認          |

## 再テストを省略する理由

- 直前の full suite 実行が terminal history で確認できている
- `origin/main` 取り込み後の追加差分は workflow / spec / PR 準備が中心で、desktop/shared runtime の再変更を含まない
- UI/UX については Phase 11 のスクリーンショット証跡を PR に添付する
