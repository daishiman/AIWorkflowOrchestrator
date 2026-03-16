# Phase 2 成果物: 状態遷移図詳細

## Permission応答フロー - 状態遷移の詳細

### 状態一覧

| 状態                 | ExecutionState  | 説明                          |
| -------------------- | --------------- | ----------------------------- |
| WaitingForPermission | running         | Permission応答を待機中        |
| Approved             | running         | Permission承認、ツール実行へ  |
| SkipFlow             | running         | ツールスキップ処理中          |
| RetryFlow            | running         | Permission再送信準備中        |
| AbortFlow            | running→aborted | abort 4ステップ実行中         |
| Running              | running         | ツール実行中 / 後続処理継続中 |
| Aborted              | aborted         | 安全停止完了                  |

### 遷移トリガーと条件

| From                 | To                   | トリガー         | 条件                                |
| -------------------- | -------------------- | ---------------- | ----------------------------------- |
| WaitingForPermission | Approved             | response 受信    | approved === true                   |
| WaitingForPermission | SkipFlow             | response 受信    | approved === false && skip === true |
| WaitingForPermission | RetryFlow            | response 受信    | approved === false && skip !== true |
| WaitingForPermission | AbortFlow            | timeout          | 300000ms 経過                       |
| RetryFlow            | WaitingForPermission | retry 実行       | retryCount < 3                      |
| RetryFlow            | AbortFlow            | max retries 到達 | retryCount >= 3                     |
| AbortFlow            | Aborted              | 4ステップ完了    | 常に                                |
| SkipFlow             | Running              | skip 完了        | 常に                                |
| Approved             | Running              | ツール実行開始   | 常に                                |

### abort 4ステップの内部状態

```
AbortFlow:
  Step 1 (cancelAll)
    ↓ PermissionResolver.cancelAll()
  Step 2 (revokeSession)
    ↓ PermissionStore.revokeSessionEntries(executionId)
  Step 3 (log)
    ↓ log.warn("[SkillExecutor] abort: ...")
  Step 4 (notifyRenderer)
    ↓ mainWindow.webContents.send(SKILL_STREAM, { type: "abort", ... })
  Aborted
    ↓ state = "aborted"
```

### fail-closed 遷移（NFR-1）

どの状態からでも、不明なエラー発生時は AbortFlow に遷移する:

```
Any State --[unknown error]--> AbortFlow --> Aborted
```

### 冪等性保証（NFR-3）

```
Aborted --[executeAbortFlow]--> Aborted (no-op, early return)
```
