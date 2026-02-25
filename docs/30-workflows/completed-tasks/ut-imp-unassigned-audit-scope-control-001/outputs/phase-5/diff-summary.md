# Phase 5 差分サマリー

## 変更ファイル

- `M .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `A .claude/skills/task-specification-creator/scripts/__tests__/audit-unassigned-tasks.test.mjs`

## 変更内容

| 区分   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| CLI    | `--target-file`/`--diff-from` 追加、未知オプションエラー化 |
| 出力   | `scope`, `currentViolations`, `baselineViolations` を追加  |
| 判定   | scoped実行時は current違反のみ fail                        |
| テスト | full/scoped/diff/invalid の5ケース追加                     |

## 参照

- `outputs/phase-5/git-diff-name-status.txt`
- `outputs/phase-5/git-status-short.txt`
