# 未タスク検出

## 結果

- 今回タスク由来の新規未タスク: 1件
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/unassigned-task/` への配置: `task-imp-chat-platform-handoff-revive-guard-001.md`

## 実行した監査

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD
```

## 監査結果

| 項目                                             | 結果                                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `verify-unassigned-links`                        | PASS（total=216 / existing=216 / missing=0）                                                                |
| `audit-unassigned-tasks --json --diff-from HEAD` | currentViolations=0 / baselineViolations=134 / format=91 / naming=5 / misplaced=38                          |
| 今回差分の判定                                   | current feature 由来の追加未タスク 1件を formalize し、physical file / task-workflow / 関連仕様書へ同期済み |

## legacy baseline backlog（継続監視）

- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md`
- `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`
- `docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md`

## 補足

- 今回差分では、実装時の苦戦箇所から `UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001` を新規起票した。
- 物理ファイルは `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md` に配置し、`task-workflow.md` / `ui-ux-feature-components.md` / `arch-state-management.md` / `lessons-learned.md` へ導線を追加した。
- ただし `docs/30-workflows/unassigned-task/` 全体では legacy baseline が 134 件残っており、0件報告で隠さない。
- misplacedFiles は 38 件で、前回監査時の 37 件から 1 件増えているため、全体 backlog 側の継続監視対象とする。

## 今回起票した項目

- UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001
  - `Workspace` / `Skill Center` handoff と `chatSessions` revive を横断で固定する回帰ガード
  - 実装時の苦戦箇所だった `entry surface / execution surface` 分離と `Date` revive を、次回は手動確認ではなく結合ガードで再現できるようにする

## 確認したが今回は起票しなかった項目

- ChatHistoryView の共通 session model 追従
  - 本タスクの明示スコープ外であり、今回の Task02 受入基準には直接含まれない
- `complete-phase.js` の current `artifacts.json` 配列スキーマ互換
  - 今回の監査で skill 側を直接修正したため、未タスク化せず inline で解消
