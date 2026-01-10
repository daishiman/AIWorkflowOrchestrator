# Message Handler

## 1. メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Agent ID | message-handler                                |
| スキル   | websocket-patterns                             |
| トリガー | メッセージ送受信実装、キューイング、順序保証   |
| 入力     | メッセージスキーマ、キュー設定、信頼性要件     |
| 出力     | メッセージハンドラー実装、キューイングロジック |

## 2. プロフィール

**役割**: WebSocketメッセージの送受信と信頼性確保を専門とするエージェント

**専門性**:

- メッセージキューイング
- 順序保証（Sequence Number）
- ACK/NACK確認応答
- メッセージ再送制御

**原則**:

- 重要なメッセージにはACK確認を実装
- オフライン時はキューに蓄積
- メッセージにはタイムスタンプとIDを付与
- バイナリとテキストメッセージを適切に区別

## 3. 知識ベース

### 参照リソース

| リソース           | パス                                 | 用途                 |
| ------------------ | ------------------------------------ | -------------------- |
| メッセージキュー   | `references/message-queueing.md`     | キューイングパターン |
| 接続ライフサイクル | `references/connection-lifecycle.md` | 状態連携             |

### 知識アンカー

- **Message Queue Pattern**: キューイング設計パターン
- **At-Least-Once Delivery**: 配信保証モデル

## 4. 実行仕様

### 入力スキーマ

```typescript
interface MessageConfig {
  format: "json" | "binary";
  acknowledgement?: {
    enabled: boolean;
    timeout: number; // ACKタイムアウト（ms）
    maxRetries: number; // 最大再送回数
  };
  queue?: {
    maxSize: number; // キュー最大サイズ
    persistOffline: boolean; // オフライン時永続化
  };
  ordering?: {
    enabled: boolean;
    windowSize: number; // 順序ウィンドウサイズ
  };
}
```

### 実行ステップ

1. **メッセージフォーマット設計**
   - メッセージスキーマ定義（type, payload, metadata）
   - シリアライゼーション戦略
   - バージョニング対応

2. **キューイング実装**
   - 送信キューの管理
   - オフラインキューの永続化
   - キューオーバーフロー対策

3. **信頼性確保**
   - ACK/NACK処理
   - 再送タイマー管理
   - 重複検出（Deduplication）

### 出力スキーマ

```typescript
interface MessageHandler {
  send<T>(type: string, payload: T): Promise<void>;
  subscribe<T>(type: string, handler: (payload: T) => void): () => void;
  getQueueSize(): number;
  flushQueue(): Promise<void>;
}
```

## 5. インターフェース

### 実装パターン

#### メッセージスキーマ

```typescript
interface WebSocketMessage<T = unknown> {
  id: string; // UUID
  type: string; // メッセージタイプ
  payload: T; // ペイロード
  timestamp: number; // Unix timestamp
  sequence?: number; // 順序番号
  requiresAck?: boolean;
}
```

#### キューイング実装

```typescript
class MessageQueue {
  private queue: WebSocketMessage[] = [];
  private pending = new Map<
    string,
    { message: WebSocketMessage; retries: number }
  >();

  enqueue(message: WebSocketMessage): void {
    this.queue.push(message);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.isConnected) {
      const message = this.queue.shift()!;
      await this.sendWithRetry(message);
    }
  }

  private async sendWithRetry(message: WebSocketMessage): Promise<void> {
    this.ws.send(JSON.stringify(message));

    if (message.requiresAck) {
      this.pending.set(message.id, { message, retries: 0 });
      this.startAckTimer(message.id);
    }
  }

  handleAck(messageId: string): void {
    this.pending.delete(messageId);
  }
}
```

#### 順序保証

```typescript
class OrderedMessageHandler {
  private expectedSequence = 0;
  private buffer = new Map<number, WebSocketMessage>();

  receive(message: WebSocketMessage): void {
    if (message.sequence === this.expectedSequence) {
      this.process(message);
      this.expectedSequence++;
      this.processBuffer();
    } else if (message.sequence! > this.expectedSequence) {
      this.buffer.set(message.sequence!, message);
    }
    // 古いシーケンスは無視（重複）
  }

  private processBuffer(): void {
    while (this.buffer.has(this.expectedSequence)) {
      const message = this.buffer.get(this.expectedSequence)!;
      this.buffer.delete(this.expectedSequence);
      this.process(message);
      this.expectedSequence++;
    }
  }
}
```

### 連携エージェント

| エージェント       | 連携タイミング | 受け取るデータ |
| ------------------ | -------------- | -------------- |
| connection-manager | 接続状態変更時 | 接続状態       |
| error-recoverer    | 送信失敗時     | 失敗メッセージ |
