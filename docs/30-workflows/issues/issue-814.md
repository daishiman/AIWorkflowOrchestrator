# [#814] fix: IPC ハンドラ二重登録防止修正（activate イベント）

## メタ情報

```yaml
issue_number: 814
title: fix: IPC ハンドラ二重登録防止修正（activate イベント）
state: CLOSED
priority: 高
scale: -
category: -
status: -
created_date: 2026-02-13
updated_date: 2026-02-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/814
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 高   |
| 規模       | -    |
| ステータス | -    |

---

## タスクID

UT-FIX-IPC-HANDLER-DOUBLE-REG-001

## 優先度

🔴 高

## 概要

`app.on("activate")` イベント（macOS でドックアイコンクリック時）で `registerAllIpcHandlers()` が再実行され、`ipcMain.handle()` が同一チャンネルに2回目のハンドラ登録を試みて例外が発生する。

## エラーメッセージ

```
Uncaught Exception: Error: Attempted to register a second handler for 'file:get-tree'
  at IpcMainImpl.handle
  at registerFileHandlers
  at registerAllIpcHandlers
```

## 根本原因

`apps/desktop/src/main/index.ts` の `app.on("activate")` コールバックが `registerAllIpcHandlers(mainWindowRef)` を呼び出すが、`ipcMain.handle()` は同一チャンネルへの重複登録を許可しない。既存ハンドラの `removeHandler()` が呼ばれないまま再登録が試行される。

## 影響範囲

- macOS でのアプリ再アクティブ化時にクラッシュ
- 全 IPC チャンネル（file, store, dashboard, graph, ai, theme, skill）が影響対象

## 修正方針

3つのアプローチ候補:

- A案: 既存ハンドラを削除してから再登録（推奨）
- B案: 登録済みフラグでガード
- C案: activate では IPC 再登録しない

## 関連ファイル

- `apps/desktop/src/main/index.ts:272-277`
- `apps/desktop/src/main/ipc/index.ts:63-70`
- `apps/desktop/src/main/ipc/fileHandlers.ts`

## 関連Pitfall

P5（リスナー二重登録）

## タスク仕様書

`docs/30-workflows/unassigned-task/task-ut-fix-ipc-handler-double-reg-001.md`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
