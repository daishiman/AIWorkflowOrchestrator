# ハートビート戦略

## 概要

WebSocket接続の死活監視と維持のためのハートビート設計。
Ping-Pongメカニズムによる接続状態の確認。

## ハートビートの目的

1. **接続の死活監視**: サーバーが応答しているか確認
2. **接続の維持**: プロキシやファイアウォールによるアイドル切断を防止
3. **早期異常検出**: ネットワーク障害を素早く検知

## Ping-Pong方式

### プロトコルレベルPing

WebSocketプロトコル（RFC 6455）のPing/Pong:

```typescript
// ブラウザのWebSocket APIでは直接利用不可
// サーバー側から送信されるPingに対して自動でPongを返す
```

### アプリケーションレベルPing

JSONメッセージによる独自実装:

```typescript
// Ping送信
function sendPing(): void {
  send({
    type: "ping",
    timestamp: Date.now(),
  });
}

// Pong受信
function handlePong(message: { timestamp: number }): void {
  const latency = Date.now() - message.timestamp;
  lastPongAt = Date.now();
  missedPongs = 0;

  emit("latency", { latency });
}
```

## ハートビート設定

### 推奨パラメータ

| パラメータ | 推奨値  | 説明                 |
| ---------- | ------- | -------------------- |
| interval   | 30000ms | Ping送信間隔         |
| timeout    | 10000ms | Pong待機タイムアウト |
| maxMissed  | 3       | 許容する連続失敗回数 |

### 設定インターフェース

```typescript
interface HeartbeatConfig {
  interval: number; // Ping間隔
  timeout: number; // タイムアウト
  maxMissed: number; // 最大連続失敗回数
}

const DEFAULT_HEARTBEAT: HeartbeatConfig = {
  interval: 30000,
  timeout: 10000,
  maxMissed: 3,
};
```

## 実装パターン

### シンプルなハートビート

```typescript
class Heartbeat {
  private timer: NodeJS.Timeout | null = null;
  private pendingPing = false;
  private missedCount = 0;

  start(): void {
    this.timer = setInterval(() => {
      this.ping();
    }, config.interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private ping(): void {
    if (this.pendingPing) {
      // 前回のPingに応答がない
      this.missedCount++;

      if (this.missedCount >= config.maxMissed) {
        this.onTimeout();
        return;
      }
    }

    this.pendingPing = true;
    sendPing();

    // タイムアウト設定
    setTimeout(() => {
      if (this.pendingPing) {
        this.missedCount++;
      }
    }, config.timeout);
  }

  onPong(): void {
    this.pendingPing = false;
    this.missedCount = 0;
  }

  private onTimeout(): void {
    this.stop();
    emit("heartbeat_timeout");
    // 再接続をトリガー
    scheduleReconnect();
  }
}
```

### アダプティブハートビート

ネットワーク状況に応じて間隔を調整:

```typescript
class AdaptiveHeartbeat {
  private latencies: number[] = [];
  private currentInterval: number;

  constructor(private config: HeartbeatConfig) {
    this.currentInterval = config.interval;
  }

  recordLatency(latency: number): void {
    this.latencies.push(latency);

    // 直近10回の平均を使用
    if (this.latencies.length > 10) {
      this.latencies.shift();
    }

    this.adjustInterval();
  }

  private adjustInterval(): void {
    const avgLatency = this.average(this.latencies);

    if (avgLatency > 5000) {
      // 高レイテンシ → 間隔を長く
      this.currentInterval = Math.min(this.config.interval * 2, 60000);
    } else if (avgLatency < 1000) {
      // 低レイテンシ → 間隔を短く
      this.currentInterval = Math.max(this.config.interval / 2, 15000);
    }
  }

  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}
```

## トラブルシューティング

### 問題1: Pongが返ってこない

**原因**:

- サーバーがPingを処理していない
- ネットワーク遅延

**解決策**:

- サーバー側のPing処理を確認
- タイムアウトを長めに設定

### 問題2: 頻繁なタイムアウト

**原因**:

- 間隔が短すぎる
- ネットワークが不安定

**解決策**:

- 間隔を長くする（30秒→60秒）
- maxMissedを増やす

### 問題3: プロキシによる切断

**原因**:

- プロキシのアイドルタイムアウト

**解決策**:

- 間隔をプロキシタイムアウトより短く設定
- 一般的には30秒以下を推奨
