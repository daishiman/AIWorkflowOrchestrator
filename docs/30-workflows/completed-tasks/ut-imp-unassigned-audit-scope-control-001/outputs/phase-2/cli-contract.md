# Phase 2 CLI入出力契約

## 入力契約

| オプション                   | 型                   | 必須 | 制約                                                     |
| ---------------------------- | -------------------- | ---- | -------------------------------------------------------- |
| `--json`                     | boolean              | 任意 | JSON出力                                                 |
| `--unassigned-dir`           | string               | 任意 | 既定 `docs/30-workflows/unassigned-task`                 |
| `--completed-unassigned-dir` | string               | 任意 | 既定 `docs/30-workflows/completed-tasks/unassigned-task` |
| `--target-file`              | string \/ comma-list | 任意 | `.md` かつ監査対象ディレクトリ配下、存在必須             |
| `--diff-from`                | string               | 任意 | `git diff --name-only <ref>` が解決可能                  |

## 出力契約（JSON）

- 維持: `checkedAt`, `totals`, `formatViolations`, `namingViolations`, `misplacedFiles`
- 追加: `scope`, `currentViolations`, `baselineViolations`, `totals.currentViolations`, `totals.baselineViolations`

## エラー契約

- exit 2: 不正オプション/不正値/解決不能 diff ref
- exit 1: 判定対象違反あり（full=全体、scoped=current）
- exit 0: 判定対象違反なし
