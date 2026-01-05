# 接続ライフサイクル管理

## 概要

WebSocket接続の各段階を適切に管理し、
安定した双方向通信を実現するための設計パターン。

## 接続状態

### 状態定義

```typescript
type ConnectionState =
  | "disconnected" // 未接続
  | "connecting" // 接続中
  | "connected" // 接続済み
  | "reconnecting"; // 再接続中
```

### 状態遷移図

```
                    ┌─────────────────┐
                    │  Disconnected   │
                    └────────┬────────┘
                             │ connect()
                             ▼
                    ┌─────────────────┐
                    │   Connecting    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │ open         │              │ error
              ▼              │              ▼
    ┌─────────────────┐     │    ┌─────────────────┐
    │    Connected    │     │    │  Reconnecting   │
    └────────┬────────┘     │    └────────┬────────┘
             │ close/error  │             │
             └──────────────┼─────────────┘
                            │
                            ▼
              ┌──────────────────────────────┐
              │  retry < maxRetries?         │
              │  Yes → Connecting            │
              │  No  → Disconnected          │
              └──────────────────────────────┘
```

## イベントハンドリング

### 接続確立（open）

```typescript
ws.onopen = () => {
  state = "connected";
  retryCount = 0;

  // ハートビート開始
  startHeartbeat();

  // 待機中メッセージの送信
  flushMessageQueue();

  emit("connected", { timestamp: Date.now() });
};
```

### メッセージ受信（message）

```typescript
ws.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);

    // Pongレスポンスの処理
    if (message.type === "pong") {
      handlePong();
      return;
    }

    emit("message", message);
  } catch (error) {
    emit("error", { type: "parse_error", error });
  }
};
```

### 接続終了（close）

```typescript
ws.onclose = (event) => {
  stopHeartbeat();

  if (event.wasClean) {
    // 正常終了
    state = "disconnected";
    emit("disconnected", { reason: "clean_close" });
  } else {
    // 異常終了 → 再接続
    scheduleReconnect();
  }
};
```

### エラー発生（error）

```typescript
ws.onerror = (error) => {
  emit("error", { type: "connection_error", error });

  // エラー後は自動的にcloseイベントが発生
  // 再接続はoncloseで処理
};
```

## 接続設定

### 推奨パラメータ

| パラメータ        | 推奨値  | 説明               |
| ----------------- | ------- | ------------------ |
| maxRetries        | 10      | 最大再接続回数     |
| baseDelay         | 1000ms  | 初回再接続待機時間 |
| maxDelay          | 30000ms | 最大再接続待機時間 |
| connectionTimeout | 10000ms | 接続タイムアウト   |

### 設定インターフェース

```typescript
interface ConnectionConfig {
  url: string;
  protocols?: string[];
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  connectionTimeout: number;
  autoReconnect: boolean;
}

const DEFAULT_CONFIG: ConnectionConfig = {
  url: "",
  protocols: [],
  maxRetries: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  connectionTimeout: 10000,
  autoReconnect: true,
};
```

## 再接続ロジック

### 指数バックオフ

```typescript
function calculateDelay(attempt: number): number {
  const exponential = baseDelay * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxDelay);

  // ジッター追加（±25%）
  const jitterRange = capped * 0.25;
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;

  return Math.floor(capped + jitter);
}
```

### 再接続スケジュール

```typescript
function scheduleReconnect(): void {
  if (retryCount >= maxRetries) {
    state = "disconnected";
    emit("max_retries_reached");
    return;
  }

  state = "reconnecting";
  retryCount++;

  const delay = calculateDelay(retryCount);

  emit("reconnecting", {
    attempt: retryCount,
    delay,
    nextRetryAt: Date.now() + delay,
  });

  reconnectTimer = setTimeout(() => {
    connect();
  }, delay);
}
```

## クリーンアップ

### リソース解放

```typescript
function disconnect(): void {
  // タイマーのクリア
  clearTimeout(reconnectTimer);
  clearInterval(heartbeatTimer);

  // 接続のクローズ
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close(1000, "Client disconnect");
  }

  state = "disconnected";
  ws = null;
}
```

### メモリリーク対策

1. **イベントリスナーの解除**:
   - 接続終了時に必ずリスナーを解除

2. **タイマーのクリア**:
   - 再接続タイマー
   - ハートビートタイマー

3. **参照の解放**:
   - WebSocketインスタンスをnullに設定
