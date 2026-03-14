# unassigned task detection

## 実施日時

- 2026-03-14

## 検出結果

| 区分               | 件数 | 内容                                              |
| ------------------ | ---- | ------------------------------------------------- |
| 新規未タスク       | 0    | 既存未タスクでカバー可能（重複起票なし）          |
| 既存未タスク再参照 | 2    | worktree native binary / phase11 preflight bundle |

## 再参照した既存未タスク

1. `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`
2. `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md`

## 実行コマンド

- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --target-file docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --target-file docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md`

## 監査結果

| 指標                                   | 値                                           |
| -------------------------------------- | -------------------------------------------- |
| verify-unassigned-links                | 223/223（missing=0）                         |
| diff監査                               | currentViolations=0 / baselineViolations=133 |
| target監査（worktree native binary）   | currentViolations=0（9見出し整形済み）       |
| target監査（phase11 preflight bundle） | currentViolations=0                          |

## 判定

今回差分で追加起票すべき未タスクは検出されなかった。  
再参照した既存未タスク2件は `docs/30-workflows/unassigned-task/` 配下に存在し、target監査で current 違反なしを確認した。
