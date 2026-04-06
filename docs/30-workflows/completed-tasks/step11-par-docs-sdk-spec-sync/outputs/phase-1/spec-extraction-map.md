# Phase 1 成果物: Spec Extraction Map

## drift 種別と更新先の対応表

### SDK-02: system spec wording drift

| ファイル                                  | drift 種別 | 更新観点                                                                 | 現状確認                                                                         |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `architecture-overview-core.md`           | wording    | `SkillCreatorWorkflowEngine` を future ではなく current owner として記述 | **解消済み** — L289「workflow state owner」として現在形記述                      |
| `arch-electron-services-details-part2.md` | wording    | Electron サービス層の実装済み facts を反映                               | **解消済み** — L133/L151 で current owner 記述確認                               |
| `api-ipc-system-core.md`                  | wording    | workflow engine の IPC/API 仕様を実装済み契約に更新                      | **解消済み** — L510「完了タスク（TASK-SDK-02）」セクションで current fact を反映 |

**SDK-02 wording drift 残存件数**: 0件

### SDK-04: canonical path drift

| ファイル                     | drift 種別 | stale path                                                                    | current path                                                                                  |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `task-workflow-completed.md` | path       | `docs/30-workflows/step-04-par-task-04-user-interaction-bridge-and-phase-ui/` | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` |
| `resource-map.md`            | path       | `step-03-par-task-04-user-interaction-bridge-and-phase-ui` 関連エントリ       | **参照なし** — 該当エントリ不在のため no-op                                                   |
| `quick-reference.md`         | path       | `step-03-par-task-04-user-interaction-bridge-and-phase-ui` 関連エントリ       | **参照なし** — 該当エントリ不在のため no-op                                                   |
| `topic-map.md`               | path       | `step-03-par-task-04-user-interaction-bridge-and-phase-ui` 関連エントリ       | **参照なし** — 該当エントリ不在のため no-op                                                   |

**SDK-04 path drift 残存件数**: 1件（task-workflow-completed.md line 300 のみ）

## 検証コマンド定義

```bash
# AC-9: 旧 path パターンの残存確認
rg "skill-creator-agent-sdk-lane.*step-03" .claude/skills/aiworkflow-requirements/references/ .claude/skills/aiworkflow-requirements/indexes/
# 期待値: 0件

# AC-9 補足: step-04-par-task-04 の残存確認
rg "step-04-par-task-04-user-interaction-bridge" .claude/skills/aiworkflow-requirements/
# 期待値: 0件（修正後）

# AC-8: 未完了表現の残存確認
rg "更新予定|後でやる|後続判断待ち|仕様策定のみ|実行予定|保留として記録" .claude/skills/aiworkflow-requirements/references/ .claude/skills/aiworkflow-requirements/indexes/
# 期待値: 0件

# AC-1: SkillCreatorWorkflowEngine current owner 確認
rg "SkillCreatorWorkflowEngine" .claude/skills/aiworkflow-requirements/references/architecture-overview-core.md
# 期待値: current 記述が存在

# AC-10: コード変更なし確認
git diff --name-only | grep -v "^\\.claude\\|^docs"
# 期待値: 0件
```

## Phase 2 引き継ぎ前提

- SDK-02 対象 3 ファイルの wording drift: 解消済み（no-op）
- SDK-04 対象 4 ファイル: task-workflow-completed.md line 300 のみ修正が必要
- resource-map.md / quick-reference.md / topic-map.md: SDK-04 関連 stale path 不在（no-op）
- コード変更: 一切不要
