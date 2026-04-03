# [#1760] [TASK-AGENT-PERM-MODE] AgentPermissionMode 永続化と preload/main IPC 対応

## メタ情報

```yaml
issue_number: 1760
title: [TASK-AGENT-PERM-MODE] AgentPermissionMode 永続化と preload/main IPC 対応
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1760
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

AgentView の権限モード（AgentPermissionMode）を画面内 local state ではなく IPC + main process で永続化する。

## 背景

agentview-permission-api-fix タスクで AgentPermissionMode は local state として実装した。
ユーザーがアプリを再起動しても権限モード設定が保持されるよう、IPC ハンドラ追加と main process での永続化が必要。

## 実装方針

- preload に `getMode` / `setMode` IPC ハンドラを追加
- main process でファイルまたは DB に永続化
- AgentView の local state → IPC 呼び出しに置換

## 優先度

低（現状は画面内 local state で動作しており、ユーザー体験に影響なし）

発見元: `docs/30-workflows/agentview-permission-api-fix` Phase 12 unassigned-task-detection（2026-03-30）
