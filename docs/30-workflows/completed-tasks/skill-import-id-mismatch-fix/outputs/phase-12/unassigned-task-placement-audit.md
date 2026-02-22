# 未タスク配置・フォーマット監査レポート

## メタ情報

| 項目         | 値                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------- |
| 対象ブランチ | `fix/ut-fix-skill-import-id-mismatch-001`                                                 |
| 実施日       | 2026-02-22                                                                                |
| 実施コマンド | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` |

## 監査結果サマリー

| チェック項目                                    | 結果                   |
| ----------------------------------------------- | ---------------------- |
| `docs/30-workflows/unassigned-task/` 総件数     | 313件                  |
| フォーマット不一致（9セクション不足）           | 67件                   |
| 命名規則違反（`*`/大文字含む）                  | 5件                    |
| `completed-tasks/unassigned-task/` の未実施混在 | 0件                    |
| `task-workflow.md` の未タスクリンク整合         | PASS（83件中83件存在） |

## 今回の是正実施

### 1. 誤配置ファイルの是正（完了）

`docs/30-workflows/completed-tasks/unassigned-task/` に残っていた未実施タスクを `docs/30-workflows/unassigned-task/` へ移動し、重複1件は `unassigned-task` 側を正本として整理した。

- 移動: `task-imp-ipc-handler-coverage-granular-001.md`
- 移動: `task-imp-multiagent-phase-ordering-guard-001.md`
- 移動: `task-imp-phase11-worktree-testing-protocol-001.md`
- 移動: `task-skill-getdetail-naming-drift.md`
- 移動: `task-skill-ipc-response-consistency.md`
- 移動: `task-skill-validation-consistency.md`
- 重複整理: `task-refactor-shared-source-structure-consolidation.md`

### 2. 参照リンク更新（完了）

以下の仕様書で `completed-tasks/unassigned-task/` 参照を `unassigned-task/` に統一。

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

## 残課題（今回の監査で新規検出）

- legacy未タスク指示書 67件が 9セクションテンプレート未準拠
- 命名規則違反ファイル 5件が残存

## 結論

- **配置要件**（指定ディレクトリへの配置）: 是正済み
- **フォーマット要件**（テンプレート準拠）: 一部未達（67件）
