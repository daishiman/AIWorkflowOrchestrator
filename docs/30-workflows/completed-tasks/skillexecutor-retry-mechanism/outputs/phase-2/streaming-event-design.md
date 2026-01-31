# Phase 2 Task 5: ストリーミングイベント設計書

## SkillStreamMessageType への追加

SkillExecutor.ts のローカル定義:

```typescript
/** ストリームメッセージタイプ */
export type SkillStreamMessageType =
  | "text"
  | "tool_use"
  | "error"
  | "complete"
  | "retry"; // 新規追加
```

## RetryMessageContent型

```typescript
/** リトライメッセージの内容 */
export interface RetryMessageContent {
  type: "retry";
  attempt: number;
  maxRetries: number;
  delayMs: number;
  errorType: RetryableErrorType;
  errorMessage: string;
}
```

## SkillStreamMessage への統合

SkillExecutor.ts のローカル SkillStreamMessage は統一的な形式を使用:

```typescript
export interface SkillStreamMessage {
  executionId: string;
  id: string;
  type: SkillStreamMessageType; // "retry" を含む
  content: string; // JSON.stringify された RetryMessageContent
  timestamp: number;
  isComplete: boolean; // retry の場合は false
}
```

retryイベントの content は JSON 文字列として送信:

```json
{
  "attempt": 0,
  "maxRetries": 3,
  "delayMs": 1000,
  "errorType": "network",
  "errorMessage": "connect ECONNRESET"
}
```

## IPC通信フロー

```
Main Process (SkillExecutor)              Renderer Process
  │                                          │
  ├── callSDKQuery() → エラー発生            │
  ├── isRetryableError() → retryable         │
  ├── sendStream(retryMessage) ──────────────►│ skill:stream
  │   type: "retry"                           │   → useSkillExecution hook
  │   content: JSON(RetryMessageContent)      │   → UI表示（スコープ外）
  ├── sleep(delay, abortSignal)              │
  ├── callSDKQuery() → 成功                  │
  ├── for await (stream) ────────────────────►│ skill:stream (text/tool_use)
  ├── sendStream(completeMessage) ───────────►│ skill:stream (complete)
  │                                          │
```

## packages/shared/src/types/skill.ts への影響

本タスクでは packages/shared の型は変更しない。理由:

1. SkillExecutor.ts はローカルに型定義を持っている
2. packages/shared の SkillStreamMessageType とは独立している
3. 後続タスクで shared 側の型を統合する場合に対応

ただし、将来の統合に備えて RetryableErrorType と RetryMessageContent の構造は shared 側の命名規則に合わせる。

## window.skillAPI への影響

Preload API に変更なし。既存の `onStream` コールバックでretryイベントも受信可能。

```typescript
// 既存のPreload API（変更なし）
onStream: (callback: (message: SkillStreamMessage) => void) => void
```
