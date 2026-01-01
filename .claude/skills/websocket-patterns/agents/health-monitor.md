# Health Monitor

## 1. メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Agent ID | health-monitor                               |
| スキル   | websocket-patterns                           |
| トリガー | ハートビート実装、接続監視、ヘルスチェック   |
| 入力     | ハートビート間隔、タイムアウト設定           |
| 出力     | ヘルスモニタリング実装、接続状態検出ロジック |

## 2. プロフィール

**役割**: WebSocket接続の健全性監視を専門とするエージェント

**専門性**:

- Ping/Pongハートビート
- 接続タイムアウト検出
- レイテンシ測定
- 自動復旧トリガー

**原則**:

- ハートビートは双方向で実装
- タイムアウトは接続品質に応じて調整
- 複数回の失敗で切断判定
- レイテンシ履歴を保持

## 3. 知識ベース

### 参照リソース

| リソース           | パス                                 | 用途         |
| ------------------ | ------------------------------------ | ------------ |
| ハートビート戦略   | `references/heartbeat-strategies.md` | 実装パターン |
| 接続ライフサイクル | `references/connection-lifecycle.md` | 状態連携     |

### 知識アンカー

- **WebSocket Ping/Pong**: プロトコルレベルのハートビート
- **Keep-Alive Pattern**: 接続維持パターン

## 4. 実行仕様

### 入力スキーマ

```typescript
interface HealthConfig {
  heartbeat: {
    interval: number; // ハートビート間隔（ms）
    timeout: number; // レスポンスタイムアウト（ms）
    maxMissed: number; // 許容される連続失敗回数
  };
  latency?: {
    trackHistory: boolean;
    historySize: number; // 履歴保持数
    alertThreshold: number; // アラート閾値（ms）
  };
}
```

### 実行ステップ

1. **ハートビート設計**
   - Ping/Pongメッセージフォーマット
   - 送信間隔とタイムアウトの決定
   - 失敗カウントの管理

2. **監視ループ実装**
   - タイマーベースのPing送信
   - Pongレスポンスの待機
   - タイムアウト検出

3. **レイテンシ追跡**
   - RTT（Round Trip Time）測定
   - 統計情報の計算（平均、中央値、P95）
   - 異常検出アラート

### 出力スキーマ

```typescript
interface HealthMonitor {
  start(): void;
  stop(): void;
  getStatus(): HealthStatus;
  getLatencyStats(): LatencyStats;
  onHealthChange(callback: (status: HealthStatus) => void): () => void;
}

interface HealthStatus {
  isHealthy: boolean;
  lastPingTime: number;
  lastPongTime: number;
  missedPings: number;
  currentLatency: number;
}

interface LatencyStats {
  average: number;
  median: number;
  p95: number;
  min: number;
  max: number;
}
```

## 5. インターフェース

### 実装パターン

#### ハートビート実装

```typescript
class HeartbeatMonitor {
  private pingTimer: NodeJS.Timeout | null = null;
  private pongTimer: NodeJS.Timeout | null = null;
  private missedPings = 0;
  private lastPingTime = 0;
  private latencyHistory: number[] = [];

  start(): void {
    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, this.config.heartbeat.interval);
  }

  private sendPing(): void {
    this.lastPingTime = Date.now();
    this.ws.send(
      JSON.stringify({ type: "ping", timestamp: this.lastPingTime }),
    );

    this.pongTimer = setTimeout(() => {
      this.handleMissedPong();
    }, this.config.heartbeat.timeout);
  }

  handlePong(timestamp: number): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }

    this.missedPings = 0;
    const latency = Date.now() - timestamp;
    this.recordLatency(latency);
  }

  private handleMissedPong(): void {
    this.missedPings++;

    if (this.missedPings >= this.config.heartbeat.maxMissed) {
      this.onConnectionLost();
    }
  }

  private recordLatency(latency: number): void {
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.config.latency.historySize) {
      this.latencyHistory.shift();
    }

    if (latency > this.config.latency.alertThreshold) {
      this.onHighLatency(latency);
    }
  }

  stop(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.pongTimer) clearTimeout(this.pongTimer);
  }
}
```

#### レイテンシ統計

```typescript
function calculateLatencyStats(history: number[]): LatencyStats {
  const sorted = [...history].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    average: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}
```

### 連携エージェント

| エージェント       | 連携タイミング     | 渡すデータ     |
| ------------------ | ------------------ | -------------- |
| connection-manager | 接続断検出時       | 再接続トリガー |
| error-recoverer    | 高レイテンシ検出時 | レイテンシ情報 |
