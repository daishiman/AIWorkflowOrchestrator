# Claude Agent SDK統合 - テストケース一覧

## 1. HooksFactory テストケース

### 1.1 Hooks生成

| ID     | テストケース名                                     | 期待結果                                         |
| ------ | -------------------------------------------------- | ------------------------------------------------ |
| HF-001 | should create hooks object with all required hooks | PreToolUse, PostToolUse, PermissionRequestが存在 |

### 1.2 PreToolUse Hook

| ID     | テストケース名                                   | 入力                          | 期待結果                    |
| ------ | ------------------------------------------------ | ----------------------------- | --------------------------- |
| HF-002 | should block dangerous bash commands (rm -rf)    | Bash, "rm -rf /important"     | proceed: false, message含む |
| HF-003 | should block dangerous bash commands (sudo)      | Bash, "sudo apt-get install"  | proceed: false, message含む |
| HF-004 | should block dangerous bash commands (chmod 777) | Bash, "chmod 777 /etc/passwd" | proceed: false              |
| HF-005 | should allow safe commands                       | Bash, "ls -la"                | proceed: true               |
| HF-006 | should allow non-Bash tools                      | Read, "/some/file.txt"        | proceed: true               |

### 1.3 PostToolUse Hook

| ID     | テストケース名             | 入力          | 期待結果                               |
| ------ | -------------------------- | ------------- | -------------------------------------- |
| HF-007 | should send status via IPC | Read tool完了 | agent:status送信、type: tool_completed |

### 1.4 PermissionRequest Hook

| ID     | テストケース名                            | 入力                    | 期待結果                          |
| ------ | ----------------------------------------- | ----------------------- | --------------------------------- |
| HF-008 | should send request and wait for response | Write, "/some/file.txt" | agent:permission送信、proceed取得 |
| HF-009 | should handle abort signal                | AbortController.abort() | Abortedエラーをthrow              |

---

## 2. PermissionResolver テストケース

| ID     | テストケース名                          | 入力            | 期待結果             |
| ------ | --------------------------------------- | --------------- | -------------------- |
| PR-001 | should resolve pending request          | approved: true  | approved: trueを返却 |
| PR-002 | should reject on abort signal           | abort()         | Abortedエラーをthrow |
| PR-003 | should handle multiple pending requests | 2つのリクエスト | 各々独立して解決     |

---

## 3. AgentExecutor テストケース

### 3.1 SDK統合

| ID     | テストケース名                               | 入力                  | 期待結果                   |
| ------ | -------------------------------------------- | --------------------- | -------------------------- |
| AE-001 | should call SDK query() with correct options | AgentExecutionRequest | query()にtools, signal含む |

### 3.2 ストリーミング

| ID     | テストケース名                 | 入力                | 期待結果                   |
| ------ | ------------------------------ | ------------------- | -------------------------- |
| AE-002 | should stream messages via IPC | SDKからのメッセージ | agent:streamチャネルへ送信 |

### 3.3 ステータス通知

| ID     | テストケース名                           | 入力           | 期待結果                       |
| ------ | ---------------------------------------- | -------------- | ------------------------------ |
| AE-003 | should send completion status on success | 正常完了       | status: completed送信          |
| AE-004 | should send cancelled status on abort    | stop()呼び出し | status: cancelled送信          |
| AE-005 | should send error status on exception    | SDK例外        | type: error, status: error送信 |

### 3.4 Permission Rules

| ID     | テストケース名                          | 入力           | 期待結果                 |
| ------ | --------------------------------------- | -------------- | ------------------------ |
| AE-006 | should apply permission rules correctly | カスタムルール | query()にpermissions含む |

---

## 4. ExecutionManager テストケース

### 4.1 実行管理

| ID     | テストケース名                       | 入力                        | 期待結果                            |
| ------ | ------------------------------------ | --------------------------- | ----------------------------------- |
| EM-001 | should start execution and return id | executionId指定リクエスト   | 指定IDを返却                        |
| EM-002 | should generate id if not provided   | executionId未指定リクエスト | UUID形式のIDを生成                  |
| EM-003 | should track active executions       | 2つの実行開始               | 両方がgetActiveExecutionsに含まれる |

### 4.2 停止処理

| ID     | テストケース名                                 | 入力                  | 期待結果                 |
| ------ | ---------------------------------------------- | --------------------- | ------------------------ |
| EM-004 | should stop specific execution                 | 存在するexecutionId   | true返却、stop()呼び出し |
| EM-005 | should return false for non-existent execution | 存在しないexecutionId | false返却                |
| EM-006 | should stop all executions                     | stopAllExecutions()   | 全実行のstop()呼び出し   |

### 4.3 Permission連携

| ID     | テストケース名                                   | 入力                  | 期待結果                            |
| ------ | ------------------------------------------------ | --------------------- | ----------------------------------- |
| EM-007 | should resolve permission for specific execution | 存在するexecutionId   | true返却、resolvePermission呼び出し |
| EM-008 | should return false for non-existent execution   | 存在しないexecutionId | false返却                           |

---

## 5. agentHandlers テストケース

| ID     | テストケース名                            | チャネル                    | 期待結果                        |
| ------ | ----------------------------------------- | --------------------------- | ------------------------------- |
| AH-001 | should handle agent:start                 | agent:start                 | startExecution呼び出し、ID返却  |
| AH-002 | should handle agent:stop                  | agent:stop                  | stopExecution呼び出し、結果返却 |
| AH-003 | should handle agent:stop-all              | agent:stop-all              | stopAllExecutions呼び出し       |
| AH-004 | should handle agent:get-active-executions | agent:get-active-executions | getActiveExecutions呼び出し     |
| AH-005 | should handle agent:permission:res        | agent:permission:res        | resolvePermission呼び出し       |

---

## 6. テストケース総数

| カテゴリ           | ケース数 |
| ------------------ | -------- |
| HooksFactory       | 9        |
| PermissionResolver | 3        |
| AgentExecutor      | 6        |
| ExecutionManager   | 8        |
| agentHandlers      | 5        |
| **合計**           | **31**   |

---

作成日: 2026-01-12
Phase: 4
ステータス: 完了
