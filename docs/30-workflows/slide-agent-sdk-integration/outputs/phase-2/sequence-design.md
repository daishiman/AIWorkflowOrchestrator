# シーケンス設計書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 2                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、Claude Agent SDK統合における処理シーケンスを設計する。正常系、異常系、キャンセルの各フローを定義する。

---

## 正常系シーケンス

### スキル実行フロー（順方向同期）

```mermaid
sequenceDiagram
    participant FW as FileWatcher
    participant SM as SyncManager
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant SDK as Claude SDK
    participant FS as File System

    FW->>SM: onStructureChange(filePath)
    SM->>SM: checkChangeContext()
    Note right of SM: 逆同期による変更でないことを確認
    SM->>SE: execute("html", projectPath)

    SE->>SE: isExecuting() check
    Note right of SE: 排他制御確認
    SE->>SE: getSkillName("html") → "html-generator"
    SE->>SE: emitProgress(0)
    SE->>SE: emitProgress(25)

    SE->>AC: query(prompt, options)
    SE->>SE: emitProgress(50)

    AC->>AC: getApiKey()
    Note right of AC: safeStorage → 環境変数
    AC->>SDK: messages.create(request)

    SDK-->>AC: response (content, usage)
    AC-->>SE: ModifierAgentQueryResponse

    SE->>SE: emitProgress(100)
    SE-->>SM: SkillExecutionResult

    SM->>FS: writeFile(index.html)
    SM->>SM: markChangeContext("forward")
    Note right of SM: 無限ループ防止
```

### スキル実行フロー（逆方向同期 - ModifierSkill）

```mermaid
sequenceDiagram
    participant FW as FileWatcher
    participant SM as SyncManager
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant SDK as Claude SDK
    participant FS as File System

    FW->>SM: onHtmlChange(filePath)
    SM->>SM: checkChangeContext()
    Note right of SM: 順同期による変更でないことを確認
    SM->>SE: execute("modifier", projectPath)

    SE->>SE: isExecuting() check
    SE->>SE: getSkillName("modifier") → "slide-modifier"
    SE->>SE: emitProgress(0)
    SE->>SE: emitProgress(25)

    SE->>AC: query(prompt, options)
    Note right of SE: HTML内容を含むプロンプト
    SE->>SE: emitProgress(50)

    AC->>AC: getApiKey()
    AC->>SDK: messages.create(request)

    SDK-->>AC: response (updatedStructure)
    AC-->>SE: ModifierAgentQueryResponse

    SE->>SE: parseChanges(response)
    SE->>SE: emitProgress(100)
    SE-->>SM: SkillExecutionResult (with changes)

    SM->>FS: writeFile(structure.md)
    SM->>SM: markChangeContext("reverse")
```

---

## キャンセルシーケンス

### ユーザーキャンセルフロー

```mermaid
sequenceDiagram
    participant User
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant ABC as AbortController

    User->>SE: cancel()

    SE->>SE: cancelled = true
    SE->>ABC: abort()

    ABC-->>AC: signal.aborted = true
    Note right of AC: AbortSignalがトリガー

    AC->>AC: reject(Error("Aborted"))
    AC-->>SE: throw Error("Aborted")

    SE->>SE: catch: errorMessage = "Cancelled"
    SE->>SE: executing = false
    SE->>SE: abortController = null
    SE-->>User: { success: false, error: "Cancelled" }
```

### AbortController詳細フロー

```mermaid
sequenceDiagram
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant TO as Timeout
    participant ABC as AbortController

    SE->>ABC: new AbortController()
    SE->>AC: query(options) with signal

    par Timeout監視
        AC->>TO: setTimeout(30000)
        TO-->>AC: timeout fired
        AC->>ABC: reject(Error("Request timeout"))
    and Abort監視
        ABC->>AC: signal.addEventListener("abort")
        Note right of AC: キャンセル時にトリガー
    end

    alt Cancel called
        SE->>ABC: abort()
        ABC-->>AC: abort event
        AC->>TO: clearTimeout()
        AC-->>SE: throw Error("Aborted")
    else Timeout
        TO-->>AC: timeout
        AC->>ABC: clearTimeout不要
        AC-->>SE: throw Error("Request timeout")
    else Success
        AC->>TO: clearTimeout()
        AC-->>SE: response
    end
```

---

## エラーシーケンス

### タイムアウトエラーフロー

```mermaid
sequenceDiagram
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant SDK as Claude SDK
    participant TO as Timeout

    SE->>AC: query(options)
    AC->>TO: setTimeout(30000)
    AC->>SDK: messages.create(request)

    Note right of SDK: 応答が30秒以上かかる

    TO-->>AC: timeout fired (30000ms)
    AC->>AC: reject(Error("Request timeout"))
    AC->>AC: currentStatus = "error"
    AC-->>SE: throw Error("Request timeout")

    SE->>SE: catch(error)
    SE->>SE: errorMessage = "Request timeout"
    SE-->>SE: { success: false, error: "Request timeout" }
```

### API認証エラーフロー

```mermaid
sequenceDiagram
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant SS as safeStorage
    participant ENV as Environment

    SE->>AC: query(options)
    AC->>SS: getStoredApiKey()
    SS-->>AC: null (not found)

    AC->>ENV: process.env.ANTHROPIC_API_KEY
    ENV-->>AC: undefined

    AC->>AC: throw Error("API key not found")
    AC->>AC: currentStatus = "error"
    AC-->>SE: throw Error("API key not found")

    SE->>SE: catch(error)
    SE-->>SE: { success: false, error: "API key not found" }
```

### SDK呼び出しエラーフロー

```mermaid
sequenceDiagram
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant SDK as Claude SDK

    SE->>AC: query(options)
    AC->>SDK: messages.create(request)

    SDK-->>AC: Error (401 Unauthorized / 500 Internal Server Error)

    AC->>AC: catch(error)
    AC->>AC: currentStatus = "error"
    AC-->>SE: throw Error("SDK call failed: ...")

    SE->>SE: catch(error)
    SE-->>SE: { success: false, error: "SDK call failed: ..." }
```

### 排他エラーフロー

```mermaid
sequenceDiagram
    participant User
    participant SE as SkillExecutor

    User->>SE: execute("html", projectPath)
    Note right of SE: executing = true

    User->>SE: execute("modifier", projectPath)
    SE->>SE: isExecuting() → true
    SE-->>User: { success: false, error: "Another skill is already executing" }
```

---

## 進捗通知シーケンス

### 進捗コールバックフロー

```mermaid
sequenceDiagram
    participant UI as Renderer (SyncStatusIndicator)
    participant IPC as IPC Channel
    participant SM as SyncManager
    participant SE as SkillExecutor

    UI->>SE: onProgress(callback)
    Note right of SE: progressCallbacks.push(callback)

    SM->>SE: execute(phase, projectPath)

    SE->>SE: emitProgress(0)
    SE-->>UI: callback(0)

    SE->>SE: emitProgress(25)
    SE-->>UI: callback(25)

    SE->>SE: emitProgress(50)
    SE-->>UI: callback(50)

    Note right of SE: SDK呼び出し中...

    SE->>SE: emitProgress(100)
    SE-->>UI: callback(100)
```

---

## メッセージ通知シーケンス

### SDKメッセージフロー

```mermaid
sequenceDiagram
    participant SE as SkillExecutor
    participant AC as AgentClient
    participant SDK as Claude SDK
    participant ML as MessageListeners

    SE->>AC: onMessage(callback)
    Note right of AC: messageListeners.add(callback)

    SE->>AC: query(options)
    AC->>SDK: messages.create(request)

    SDK-->>AC: response
    AC->>AC: create SDKMessage
    AC->>ML: forEach(listener => listener(message))
    ML-->>SE: callback(message)

    AC-->>SE: response
```

---

## 状態遷移図

### AgentClient状態

```mermaid
stateDiagram-v2
    [*] --> idle

    idle --> running: query() called
    running --> idle: success
    running --> error: timeout/abort/api error
    error --> idle: reset()
    error --> running: query() called (retry)

    running --> idle: abort() called
```

### SkillExecutor状態

```mermaid
stateDiagram-v2
    [*] --> idle

    idle --> executing: execute() called
    executing --> idle: success
    executing --> idle: error
    executing --> idle: cancelled

    executing --> executing: progress update
```

---

## タイミング図

### 正常実行タイミング

```
Time:  0ms    25ms   50ms   ------   2000ms  2100ms
       |      |      |              |       |
       v      v      v              v       v
SE:    [START][SKILL_NAME][API_CALL]........[COMPLETE]
AC:           |      [QUERY_START]--[RESPONSE]
SDK:                 |----[PROCESSING]-----|
Progress: 0%   25%   50%                   100%
```

### タイムアウトタイミング

```
Time:  0ms    25ms   50ms   ------   30000ms 30100ms
       |      |      |              |       |
       v      v      v              v       v
SE:    [START][SKILL_NAME][API_CALL]........[TIMEOUT_ERROR]
AC:           |      [QUERY_START]--[TIMEOUT]
SDK:                 |----[PROCESSING...]---|
Progress: 0%   25%   50%                   (error)
```

---

## エラーリカバリ設計

### リカバリ戦略

| エラー種別        | リカバリ | 説明                   |
| ----------------- | -------- | ---------------------- |
| タイムアウト      | なし     | ユーザーに再試行を促す |
| 認証エラー        | なし     | APIキー設定を促す      |
| SDK呼び出しエラー | なし     | エラーメッセージ表示   |
| キャンセル        | なし     | 正常なキャンセル処理   |
| 排他エラー        | なし     | 前の実行完了を待つ     |

**注**: リトライロジックは本タスクのスコープ外（将来タスク）

### リソースクリーンアップ

```typescript
// SkillExecutor finally ブロック
finally {
  executing = false;
  abortController = null;
}

// AgentClient finally ブロック
finally {
  currentAbortController = null;
  currentStatus = currentStatus === "running" ? "idle" : currentStatus;
}
```

---

## IPC通信シーケンス（参考）

### 進捗通知IPC

```mermaid
sequenceDiagram
    participant Main as Main Process
    participant IPC as IPC Channel
    participant Renderer as Renderer Process
    participant UI as SyncStatusIndicator

    Main->>IPC: send("slide:sync-progress", { progress: 50 })
    IPC-->>Renderer: receive
    Renderer->>UI: setProgress(50)
```

### エラー通知IPC

```mermaid
sequenceDiagram
    participant Main as Main Process
    participant IPC as IPC Channel
    participant Renderer as Renderer Process
    participant UI as ErrorDisplay

    Main->>IPC: send("slide:sync-error", { error: "Request timeout" })
    IPC-->>Renderer: receive
    Renderer->>UI: showError("Request timeout")
```

---

## 次のステップ

Phase 3: 設計レビューゲート - 設計の妥当性検証

---

**作成日**: 2026-01-17
**Phase 2 タスク3 完了**
