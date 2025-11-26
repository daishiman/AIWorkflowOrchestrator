# メッセージキューイング

## 概要

WebSocket接続断時のメッセージ保全と、
接続復旧時の順序保証送信を実現する設計パターン。

## キューの目的

1. **メッセージ保全**: 接続断中のメッセージを失わない
2. **順序保証**: 送信順序を維持
3. **優先度処理**: 重要なメッセージを優先送信

## キュー設計

### メッセージ構造

```typescript
interface QueuedMessage {
  id: string;            // 一意ID
  payload: unknown;      // メッセージ本体
  priority: 'high' | 'normal' | 'low';
  createdAt: number;     // 作成タイムスタンプ
  attempts: number;      // 送信試行回数
  maxAttempts: number;   // 最大試行回数
}
```

### キュー設定

```typescript
interface QueueConfig {
  maxSize: number;       // 最大キューサイズ
  maxAge: number;        // 最大保持時間（ミリ秒）
  retryLimit: number;    // 送信リトライ上限
}

const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxSize: 1000,
  maxAge: 300000,        // 5分
  retryLimit: 3
};
```

## 実装パターン

### 基本キュー

```typescript
class MessageQueue {
  private queue: QueuedMessage[] = [];
  private config: QueueConfig;

  enqueue(payload: unknown, priority = 'normal'): string {
    const id = randomUUID();

    const message: QueuedMessage = {
      id,
      payload,
      priority,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: this.config.retryLimit
    };

    // サイズ制限チェック
    if (this.queue.length >= this.config.maxSize) {
      this.removeOldest();
    }

    this.queue.push(message);
    this.sortByPriority();

    return id;
  }

  dequeue(): QueuedMessage | null {
    return this.queue.shift() ?? null;
  }

  peek(): QueuedMessage | null {
    return this.queue[0] ?? null;
  }

  requeue(message: QueuedMessage): void {
    message.attempts++;

    if (message.attempts >= message.maxAttempts) {
      this.onMaxRetries(message);
      return;
    }

    this.queue.unshift(message);
  }

  private sortByPriority(): void {
    const order = { high: 0, normal: 1, low: 2 };
    this.queue.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  private removeOldest(): void {
    // 低優先度から削除
    const lowPriority = this.queue.filter(m => m.priority === 'low');
    if (lowPriority.length > 0) {
      const oldest = lowPriority[0];
      this.queue = this.queue.filter(m => m.id !== oldest.id);
      return;
    }

    // なければ最古を削除
    this.queue.shift();
  }

  private onMaxRetries(message: QueuedMessage): void {
    emit('message_failed', { message });
  }
}
```

### 永続化キュー

IndexedDBを使用した永続化:

```typescript
class PersistentQueue extends MessageQueue {
  private dbName = 'websocket-queue';
  private storeName = 'messages';

  async save(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);

    // 既存をクリア
    await store.clear();

    // 全メッセージを保存
    for (const message of this.queue) {
      await store.add(message);
    }
  }

  async restore(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);

    const messages = await store.getAll();

    // 有効期限内のメッセージのみ復元
    const now = Date.now();
    this.queue = messages.filter(m =>
      now - m.createdAt < this.config.maxAge
    );
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

## フラッシュ処理

### 接続復旧時の送信

```typescript
async function flushQueue(): Promise<void> {
  if (!isConnected()) return;

  while (queue.size > 0) {
    const message = queue.dequeue();
    if (!message) break;

    try {
      await send(message.payload);
      emit('message_sent', { id: message.id });
    } catch (error) {
      queue.requeue(message);
      break;  // 失敗したら中断
    }
  }
}
```

### 流量制御

```typescript
async function flushWithThrottle(
  messagesPerSecond = 10
): Promise<void> {
  const delay = 1000 / messagesPerSecond;

  while (queue.size > 0 && isConnected()) {
    const message = queue.dequeue();
    if (!message) break;

    try {
      await send(message.payload);
      await sleep(delay);
    } catch (error) {
      queue.requeue(message);
      break;
    }
  }
}
```

## 期限切れ処理

### 定期クリーンアップ

```typescript
function cleanupExpired(): void {
  const now = Date.now();

  queue.queue = queue.queue.filter(message => {
    const age = now - message.createdAt;

    if (age > config.maxAge) {
      emit('message_expired', { message });
      return false;
    }

    return true;
  });
}

// 1分ごとにクリーンアップ
setInterval(cleanupExpired, 60000);
```

## ベストプラクティス

### すべきこと

1. **サイズ制限を設ける**: メモリ枯渇を防止
2. **期限を設定する**: 古いメッセージを削除
3. **優先度を付ける**: 重要なメッセージを優先

### 避けるべきこと

1. **無限バッファ**: メモリリークの原因
2. **同期的なフラッシュ**: UIブロックの原因
3. **リトライなしの送信**: 一時的な失敗でメッセージ損失
