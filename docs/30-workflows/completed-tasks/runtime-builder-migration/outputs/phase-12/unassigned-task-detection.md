# 未タスク検出レポート: UT-RUNTIME-BUILDER-MIGRATION-001

## 検出日: 2026-03-23

## 検出件数: 2件

### UT-1: chat-edit/TerminalHandoffBuilder.ts 削除

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001                                       |
| 由来       | Phase 3 MINOR-1                                                               |
| 優先度     | low                                                                           |
| 内容       | 移行完了後の chat-edit/TerminalHandoffBuilder.ts を削除またはリダイレクトする |
| 指示書パス | docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-DELETE-CHAT-EDIT-001.md  |

### UT-2: RuntimeSkillCreatorFacade 戻り値型波及確認

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| タスクID   | UT-RUNTIME-FACADE-RETURN-TYPE-001                                                                   |
| 由来       | Phase 3 MINOR-2                                                                                     |
| 優先度     | medium                                                                                              |
| 内容       | RuntimeSkillCreatorPlanResponse の bundle → guidance 変更が Preload/Renderer に波及していないか確認 |
| 指示書パス | docs/30-workflows/unassigned-task/UT-RUNTIME-FACADE-RETURN-TYPE-001.md                              |

## 3ステップ完了状況

| ステップ              | UT-1                                  | UT-2                                  |
| --------------------- | ------------------------------------- | ------------------------------------- |
| 1. 指示書作成         | 完了                                  | 完了                                  |
| 2. task-workflow 登録 | task-workflow-backlog.md に登録済み   | task-workflow-backlog.md に登録済み   |
| 3. 仕様書リンク       | llm-workspace-chat-edit.md に追記済み | llm-workspace-chat-edit.md に追記済み |
