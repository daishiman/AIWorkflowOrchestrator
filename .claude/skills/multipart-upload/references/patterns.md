# マルチパートアップロード - 実装パターン

## 概要

マルチパートアップロードの実装における設計パターンと実装戦略。
チャンク分割、並列アップロード、エラーハンドリング、状態管理を網羅する。

## チャンク分割パターン

### 固定サイズ分割

```typescript
function splitIntoChunks(file: File, chunkSize: number): Chunk[] {
  const chunks: Chunk[] = [];
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    chunks.push({
      index: i,
      start,
      end,
      size: end - start,
      blob: file.slice(start, end),
    });
  }

  return chunks;
}
```

### 動的サイズ決定

```typescript
function determineChunkSize(
  fileSize: number,
  networkQuality: "high" | "medium" | "low",
): number {
  const baseSize = getBaseChunkSize(fileSize);
  const multiplier = {
    high: 1.5,
    medium: 1.0,
    low: 0.5,
  }[networkQuality];

  return Math.round(baseSize * multiplier);
}

function getBaseChunkSize(fileSize: number): number {
  if (fileSize < 10 * 1024 * 1024) return fileSize; // 10MB未満は分割なし
  if (fileSize < 100 * 1024 * 1024) return 5 * 1024 * 1024; // 5MB
  if (fileSize < 500 * 1024 * 1024) return 10 * 1024 * 1024; // 10MB
  if (fileSize < 1024 * 1024 * 1024) return 20 * 1024 * 1024; // 20MB
  return 50 * 1024 * 1024; // 50MB
}
```

## 並列アップロードパターン

### 制限付き並列

```typescript
class ParallelUploader {
  private queue: Chunk[] = [];
  private activeUploads = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async uploadChunks(chunks: Chunk[]): Promise<void> {
    this.queue = [...chunks];
    const results: Promise<void>[] = [];

    while (this.queue.length > 0 || this.activeUploads > 0) {
      while (this.activeUploads < this.maxConcurrent && this.queue.length > 0) {
        const chunk = this.queue.shift()!;
        this.activeUploads++;
        results.push(
          this.uploadChunk(chunk).finally(() => this.activeUploads--),
        );
      }
      await Promise.race(results.filter((p) => p));
    }
  }
}
```

### 優先度付きキュー

```typescript
interface PrioritizedChunk extends Chunk {
  priority: number; // 低い値 = 高優先度
  retryCount: number;
}

class PriorityQueue {
  private chunks: PrioritizedChunk[] = [];

  enqueue(chunk: PrioritizedChunk): void {
    this.chunks.push(chunk);
    this.chunks.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): PrioritizedChunk | undefined {
    return this.chunks.shift();
  }
}
```

## 状態管理パターン

### ローカルストレージ永続化

```typescript
interface PersistedState {
  uploadId: string;
  fileName: string;
  fileHash: string;
  completedChunks: number[];
  lastUpdated: number;
}

class UploadStateManager {
  private storageKey: string;

  constructor(uploadId: string) {
    this.storageKey = `upload_${uploadId}`;
  }

  save(state: PersistedState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  load(): PersistedState | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
```

### IndexedDB大容量状態

```typescript
class IndexedDBStateManager {
  private dbName = "upload_states";
  private storeName = "uploads";

  async save(state: PersistedState): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.storeName, "readwrite");
    await tx.store.put(state);
  }

  async load(uploadId: string): Promise<PersistedState | null> {
    const db = await this.openDB();
    return db.get(this.storeName, uploadId);
  }
}
```

## エラーハンドリングパターン

### リトライデコレータ

```typescript
function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        if (attempt === maxRetries || !isRetryable(error)) {
          reject(error);
          return;
        }
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay + Math.random() * 1000);
      }
    }
  });
}

function isRetryable(error: any): boolean {
  return (
    error.status >= 500 ||
    error.name === "NetworkError" ||
    error.name === "TimeoutError"
  );
}
```

### サーキットブレーカー

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  private readonly threshold = 5;
  private readonly resetTimeMs = 30000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.resetTimeMs) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = "open";
    }
  }
}
```

## 進捗通知パターン

### イベントエミッター

```typescript
type ProgressEvent = {
  type: "progress";
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  speed: number;
};

class UploadEmitter extends EventEmitter {
  emitProgress(progress: ProgressEvent): void {
    this.emit("progress", progress);
  }

  onProgress(callback: (progress: ProgressEvent) => void): void {
    this.on("progress", callback);
  }
}
```

### コールバックパターン

```typescript
interface UploadCallbacks {
  onProgress?: (progress: UploadProgress) => void;
  onChunkComplete?: (chunkIndex: number) => void;
  onError?: (error: Error, chunkIndex: number) => void;
  onComplete?: (result: UploadResult) => void;
}

async function uploadFile(
  file: File,
  callbacks: UploadCallbacks
): Promise<void> {
  // 実装...
  callbacks.onProgress?.({ ... });
}
```

## キャンセルパターン

### AbortController

```typescript
class CancellableUpload {
  private abortController = new AbortController();

  async upload(file: File): Promise<void> {
    const chunks = splitIntoChunks(file);

    for (const chunk of chunks) {
      if (this.abortController.signal.aborted) {
        throw new Error("Upload cancelled");
      }

      await fetch("/upload", {
        method: "POST",
        body: chunk.blob,
        signal: this.abortController.signal,
      });
    }
  }

  cancel(): void {
    this.abortController.abort();
  }
}
```

## アンチパターン

| パターン         | 問題               | 解決策                 |
| ---------------- | ------------------ | ---------------------- |
| 無制限並列       | サーバー過負荷     | 並列数制限             |
| リトライなし     | 一時障害で失敗     | 指数バックオフ         |
| 状態非永続化     | 中断時にやり直し   | ローカルストレージ保存 |
| チェックサムなし | データ破損検出不可 | SHA-256検証            |
| 進捗通知なし     | UX低下             | イベント/コールバック  |

## チェックリスト

### 設計時

- [ ] チャンクサイズ決定ロジックを定義したか
- [ ] 並列数を決定したか
- [ ] リトライ戦略を設計したか
- [ ] 状態永続化方式を選定したか

### 実装時

- [ ] チェックサム検証を実装したか
- [ ] キャンセル機能を実装したか
- [ ] 進捗通知を実装したか
- [ ] エラーハンドリングを実装したか

### テスト時

- [ ] 大容量ファイルでテストしたか
- [ ] ネットワーク障害をシミュレートしたか
- [ ] 中断再開をテストしたか
