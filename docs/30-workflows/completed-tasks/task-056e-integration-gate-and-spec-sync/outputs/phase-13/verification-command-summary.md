# Phase 13 Verification Command Summary

## user 実行済みコマンド

| コマンド                            | 判定      | 根拠                                         |
| ----------------------------------- | --------- | -------------------------------------------- |
| `pnpm typecheck`                    | PASS 扱い | ユーザーが本ブランチ terminal で直前実行済み |
| `pnpm lint`                         | PASS 扱い | ユーザーが本ブランチ terminal で直前実行済み |
| `pnpm --filter @repo/shared build`  | PASS 扱い | ユーザーが本ブランチ terminal で直前実行済み |
| `pnpm --filter @repo/desktop build` | PASS 扱い | ユーザーが本ブランチ terminal で直前実行済み |
| `pnpm test --testTimeout=900000`    | PASS 扱い | ユーザーが本ブランチ terminal で直前実行済み |

## 本ターンで追加実行するコマンド

| コマンド                                                                                                                                                                    | 目的                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `node ~/.claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run`                                                                                           | 未同期タスク仕様書の確認    |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync --strict` | workflow 仕様整合の最終確認 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync`                | Phase 1-13 出力構成の確認   |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                         | unassigned-task 導線の確認  |
| `gh pr checks <PR番号>`                                                                                                                                                     | PR 作成後の CI 状態確認     |

## 再テストを省略する理由

- full suite はユーザーが直前実行済み。
- main 取り込み後の追加差分は docs / workflow / PR 導線整備中心で、desktop/shared runtime 変更を含まない。
- workflow 側の根拠は Phase 11 / 12 証跡と docs 系検証で補完する。
