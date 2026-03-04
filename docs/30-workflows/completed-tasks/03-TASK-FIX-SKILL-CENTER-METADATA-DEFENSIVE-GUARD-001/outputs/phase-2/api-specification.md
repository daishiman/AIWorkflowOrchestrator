# Phase 2 API/IPC仕様（再監査版）

更新日: 2026-03-04

## 契約サマリー

- IPC チャンネル追加/変更: なし
- リクエスト/レスポンス形式の破壊的変更: なし
- 防御実装位置: Renderer（Hook/Component）

## 既存契約維持項目

| 項目                | 現状                               | 判定 |
| ------------------- | ---------------------------------- | ---- |
| `skill:list`        | 既存通り                           | OK   |
| `skill:getImported` | 既存通り（依存タスクで互換対応済） | OK   |
| `skill:import`      | 既存通り（依存タスクで冪等対応済） | OK   |
| `skill:remove`      | 既存通り                           | OK   |

## 仕様反映先

- `/.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `/.claude/skills/aiworkflow-requirements/references/task-workflow.md`
