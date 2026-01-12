# Claude Agent SDK統合 - シーケンス図

## 1. 正常実行フロー

```
┌─────────┐     ┌─────────┐     ┌───────────────┐     ┌────────────────┐     ┌─────────────┐
│Renderer │     │  Main   │     │ExecutionMgr   │     │AgentExecutor   │     │Claude SDK   │
└────┬────┘     └────┬────┘     └───────┬───────┘     └───────┬────────┘     └──────┬──────┘
     │               │                  │                     │                     │
     │ agent:start   │                  │                     │                     │
     │ (request)     │                  │                     │                     │
     │──────────────►│                  │                     │                     │
     │               │                  │                     │                     │
     │               │ startExecution   │                     │                     │
     │               │ (request, win)   │                     │                     │
     │               │─────────────────►│                     │                     │
     │               │                  │                     │                     │
     │               │                  │ new AgentExecutor   │                     │
     │               │                  │ (request, win)      │                     │
     │               │                  │────────────────────►│                     │
     │               │                  │                     │                     │
     │               │                  │ executor.start()    │                     │
     │               │                  │────────────────────►│                     │
     │               │                  │                     │                     │
     │               │ return           │                     │                     │
     │◄──────────────│ executionId      │                     │                     │
     │               │                  │                     │                     │
     │               │                  │                     │ query(prompt, opts) │
     │               │                  │                     │────────────────────►│
     │               │                  │                     │                     │
     │               │                  │                     │    stream msgs      │
     │               │                  │                     │◄────────────────────│
     │               │                  │                     │                     │
     │ agent:stream  │                  │                     │                     │
     │ (message)     │                  │                     │                     │
     │◄──────────────────────────────────────────────────────│                     │
     │               │                  │                     │                     │
     │               │                  │                     │    stream msgs      │
     │               │                  │                     │◄────────────────────│
     │               │                  │                     │                     │
     │ agent:stream  │                  │                     │                     │
     │ (message)     │                  │                     │                     │
     │◄──────────────────────────────────────────────────────│                     │
     │               │                  │                     │                     │
     │               │                  │                     │    complete         │
     │               │                  │                     │◄────────────────────│
     │               │                  │                     │                     │
     │ agent:status  │                  │                     │                     │
     │ (completed)   │                  │                     │                     │
     │◄──────────────────────────────────────────────────────│                     │
     │               │                  │                     │                     │
     │               │                  │ executions.delete   │                     │
     │               │                  │◄────────────────────│                     │
```

## 2. Permission確認フロー

```
┌─────────┐     ┌─────────┐     ┌────────────────┐     ┌──────────────────┐     ┌─────────────┐
│Renderer │     │  Main   │     │AgentExecutor   │     │PermissionResolver│     │Claude SDK   │
└────┬────┘     └────┬────┘     └───────┬────────┘     └────────┬─────────┘     └──────┬──────┘
     │               │                  │                       │                      │
     │               │                  │                       │  PermissionRequest   │
     │               │                  │◄─────────────────────────────────────────────│
     │               │                  │  Hook呼び出し                                │
     │               │                  │                       │                      │
     │               │                  │ waitForResponse       │                      │
     │               │                  │ (requestId, signal)   │                      │
     │               │                  │──────────────────────►│                      │
     │               │                  │                       │                      │
     │ agent:permission                 │                       │  Promise保留         │
     │ (request)     │                  │                       │                      │
     │◄─────────────────────────────────│                       │                      │
     │               │                  │                       │                      │
     │  [User sees   │                  │                       │                      │
     │   dialog and  │                  │                       │                      │
     │   responds]   │                  │                       │                      │
     │               │                  │                       │                      │
     │ agent:permission:res             │                       │                      │
     │ (executionId, │                  │                       │                      │
     │  response)    │                  │                       │                      │
     │──────────────►│                  │                       │                      │
     │               │                  │                       │                      │
     │               │ resolvePermission│                       │                      │
     │               │ (executionId,    │                       │                      │
     │               │  response)       │                       │                      │
     │               │─────────────────►│                       │                      │
     │               │                  │                       │                      │
     │               │                  │ resolveRequest        │                      │
     │               │                  │ (response)            │                      │
     │               │                  │──────────────────────►│                      │
     │               │                  │                       │                      │
     │               │                  │◄──────────────────────│  Promise解決         │
     │               │                  │                       │                      │
     │               │                  │   return { proceed }  │                      │
     │               │                  │──────────────────────────────────────────────►
     │               │                  │                       │                      │
     │               │                  │                       │  [Continue or block] │
```

## 3. 危険コマンドブロックフロー

```
┌─────────┐     ┌────────────────┐     ┌────────────┐     ┌─────────────┐
│Renderer │     │AgentExecutor   │     │HooksFactory│     │Claude SDK   │
└────┬────┘     └───────┬────────┘     └─────┬──────┘     └──────┬──────┘
     │                  │                    │                   │
     │                  │                    │   PreToolUse      │
     │                  │                    │   (Bash, rm -rf)  │
     │                  │                    │◄──────────────────│
     │                  │                    │                   │
     │                  │                    │   Check pattern   │
     │                  │                    │   "rm -rf"        │
     │                  │                    │                   │
     │                  │                    │   return {        │
     │                  │                    │     proceed:false │
     │                  │                    │     message:...   │
     │                  │                    │   }               │
     │                  │                    │──────────────────►│
     │                  │                    │                   │
     │                  │◄───────────────────────────────────────│
     │                  │  Tool blocked                          │
     │                  │                    │                   │
     │ agent:stream     │                    │                   │
     │ (blocked msg)    │                    │                   │
     │◄─────────────────│                    │                   │
```

## 4. キャンセルフロー

```
┌─────────┐     ┌─────────┐     ┌───────────────┐     ┌────────────────┐     ┌─────────────┐
│Renderer │     │  Main   │     │ExecutionMgr   │     │AgentExecutor   │     │Claude SDK   │
└────┬────┘     └────┬────┘     └───────┬───────┘     └───────┬────────┘     └──────┬──────┘
     │               │                  │                     │                     │
     │               │                  │                     │ [実行中...]          │
     │               │                  │                     │◄───────────────────►│
     │               │                  │                     │                     │
     │ agent:stop    │                  │                     │                     │
     │ (executionId) │                  │                     │                     │
     │──────────────►│                  │                     │                     │
     │               │                  │                     │                     │
     │               │ stopExecution    │                     │                     │
     │               │ (executionId)    │                     │                     │
     │               │─────────────────►│                     │                     │
     │               │                  │                     │                     │
     │               │                  │ executor.stop()     │                     │
     │               │                  │────────────────────►│                     │
     │               │                  │                     │                     │
     │               │                  │                     │ abortController     │
     │               │                  │                     │   .abort()          │
     │               │                  │                     │                     │
     │               │                  │                     │ AbortError          │
     │               │                  │                     │◄────────────────────│
     │               │                  │                     │                     │
     │ agent:status  │                  │                     │                     │
     │ (cancelled)   │                  │                     │                     │
     │◄──────────────────────────────────────────────────────│                     │
     │               │                  │                     │                     │
     │               │ return true      │                     │                     │
     │◄──────────────│                  │                     │                     │
```

## 5. エラーハンドリングフロー

```
┌─────────┐     ┌────────────────┐     ┌─────────────┐
│Renderer │     │AgentExecutor   │     │Claude SDK   │
└────┬────┘     └───────┬────────┘     └──────┬──────┘
     │                  │                     │
     │                  │                     │
     │                  │ query(...)          │
     │                  │────────────────────►│
     │                  │                     │
     │                  │                     │ [エラー発生]
     │                  │   throw Error       │
     │                  │◄────────────────────│
     │                  │                     │
     │                  │ catch (error) {     │
     │                  │   // エラー処理     │
     │                  │ }                   │
     │                  │                     │
     │ agent:stream     │                     │
     │ (type: error,    │                     │
     │  content: {...}) │                     │
     │◄─────────────────│                     │
     │                  │                     │
     │ agent:status     │                     │
     │ (status: error,  │                     │
     │  error: ...)     │                     │
     │◄─────────────────│                     │
     │                  │                     │
     │                  │ [クリーンアップ]     │
     │                  │                     │
```

## 6. 複数実行管理フロー

```
┌─────────┐     ┌─────────┐     ┌───────────────┐     ┌────────────────┐
│Renderer │     │  Main   │     │ExecutionMgr   │     │ executors Map  │
└────┬────┘     └────┬────┘     └───────┬───────┘     └───────┬────────┘
     │               │                  │                     │
     │ start (A)     │                  │                     │
     │──────────────►│─────────────────►│                     │
     │               │                  │ set(execA, ...)     │
     │               │                  │────────────────────►│
     │◄──────────────│ execA            │                     │
     │               │                  │                     │
     │ start (B)     │                  │                     │
     │──────────────►│─────────────────►│                     │
     │               │                  │ set(execB, ...)     │
     │               │                  │────────────────────►│
     │◄──────────────│ execB            │                     │
     │               │                  │                     │
     │ [A and B running concurrently]   │                     │
     │               │                  │                     │
     │ stop (A)      │                  │                     │
     │──────────────►│─────────────────►│                     │
     │               │                  │ get(execA).stop()   │
     │               │                  │────────────────────►│
     │◄──────────────│                  │                     │
     │               │                  │                     │
     │               │                  │ delete(execA)       │
     │               │                  │◄────────────────────│
     │               │                  │                     │
     │ [B still running]                │                     │
```

---

## 7. 統合ポイント契約

| 統合ポイント               | 方向          | 契約（型）            |
| -------------------------- | ------------- | --------------------- |
| Renderer → Main (start)    | invoke        | AgentExecutionRequest |
| Main → SDK (query)         | API call      | Options (SDK型)       |
| SDK → Main (stream)        | AsyncIterator | SDKMessage (SDK型)    |
| Main → Renderer (stream)   | send          | AgentStreamMessage    |
| Main → Renderer (status)   | send          | AgentExecutionStatus  |
| Main → Renderer (perm)     | send          | PermissionRequest     |
| Renderer → Main (perm res) | invoke        | PermissionResponse    |

---

作成日: 2026-01-12
Phase: 2
ステータス: 完了
