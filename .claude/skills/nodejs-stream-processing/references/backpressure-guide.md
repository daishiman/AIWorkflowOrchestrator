# バックプレッシャーガイド

## バックプレッシャーとは

データの生産速度が消費速度を上回った場合に発生するフロー制御の問題。適切に処理しないと、メモリ枯渇やデータ損失の原因となる。

```
Producer (100MB/s) ──> Buffer (有限) ──> Consumer (10MB/s)
                           ↑
                       ここが溢れる
```

---

## 検出方法

### write()の戻り値

```typescript
const canWrite = writable.write(chunk);

if (!canWrite) {
  // 内部バッファがhighWaterMarkに達した
  // これ以上のデータを送るとメモリ問題の可能性
  console.log("Backpressure detected!");
}
```

### drainイベント

```typescript
writable.on("drain", () => {
  // バッファが空になった
  // 書き込み再開可能
});
```

---

## 対処パターン

### パターン1: pause/resume

```typescript
import { createReadStream, createWriteStream } from "fs";

const readable = createReadStream("./input.bin");
const writable = createWriteStream("./output.bin");

readable.on("data", (chunk) => {
  const ok = writable.write(chunk);

  if (!ok) {
    // 読み込みを一時停止
    readable.pause();
  }
});

writable.on("drain", () => {
  // 読み込みを再開
  readable.resume();
});

readable.on("end", () => {
  writable.end();
});
```

### パターン2: pipeline（推奨）

```typescript
import { pipeline } from "stream/promises";

// 自動的にバックプレッシャーを処理
await pipeline(readable, transform, writable);
```

### パターン3: async iterator

```typescript
import { createReadStream, createWriteStream } from "fs";

async function processWithAsyncIterator(input: string, output: string) {
  const readable = createReadStream(input);
  const writable = createWriteStream(output);

  for await (const chunk of readable) {
    // 書き込みが完了するまで待機
    await new Promise<void>((resolve, reject) => {
      const ok = writable.write(chunk);
      if (ok) {
        resolve();
      } else {
        writable.once("drain", resolve);
        writable.once("error", reject);
      }
    });
  }

  // 書き込み終了
  await new Promise<void>((resolve) => writable.end(resolve));
}
```

---

## カスタムストリームでのバックプレッシャー対応

### Readableストリーム

```typescript
import { Readable } from "stream";

class CustomReadable extends Readable {
  private index = 0;
  private data: string[];

  constructor(data: string[]) {
    super({ highWaterMark: 16 * 1024 });
    this.data = data;
  }

  _read(size: number): void {
    if (this.index >= this.data.length) {
      this.push(null); // 終了
      return;
    }

    // push()がfalseを返したら、次の_read()まで待機
    while (this.index < this.data.length) {
      const chunk = this.data[this.index++];
      const canPush = this.push(chunk);

      if (!canPush) {
        // 内部バッファが満杯
        // 次の_read()呼び出しまで待機
        break;
      }
    }
  }
}
```

### Writableストリーム

```typescript
import { Writable, WritableOptions } from "stream";

class CustomWritable extends Writable {
  constructor(options?: WritableOptions) {
    super({
      highWaterMark: 16 * 1024,
      ...options,
    });
  }

  _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    // 非同期処理をシミュレート
    setImmediate(() => {
      console.log(`Wrote ${chunk.length} bytes`);
      callback(); // 次のチャンクを要求
    });
  }

  // オプション: バッチ書き込み
  _writev(
    chunks: Array<{ chunk: Buffer; encoding: BufferEncoding }>,
    callback: (error?: Error | null) => void,
  ): void {
    // 複数チャンクをまとめて処理
    const totalSize = chunks.reduce((acc, c) => acc + c.chunk.length, 0);
    console.log(`Wrote ${chunks.length} chunks (${totalSize} bytes)`);
    callback();
  }
}
```

### Transformストリーム

```typescript
import { Transform, TransformCallback } from "stream";

class AsyncTransform extends Transform {
  constructor() {
    super({ highWaterMark: 16 * 1024 });
  }

  async _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): Promise<void> {
    try {
      // 非同期処理
      const result = await this.processAsync(chunk);

      // push()がfalseを返す場合、自動的にバックプレッシャーがかかる
      this.push(result);
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  private async processAsync(chunk: Buffer): Promise<Buffer> {
    // 実際の非同期処理
    await new Promise((resolve) => setTimeout(resolve, 10));
    return chunk;
  }
}
```

---

## メモリ監視

### プロセスメモリ監視

```typescript
function monitorMemory(label: string): void {
  const used = process.memoryUsage();
  console.log(`[${label}] Memory:`, {
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
  });
}

// ストリーム処理中に定期的に監視
setInterval(() => monitorMemory("Stream processing"), 1000);
```

### ストリームバッファ監視

```typescript
import { Readable, Writable } from "stream";

function getBufferSize(stream: Readable | Writable): number {
  if ("readableLength" in stream) {
    return (stream as Readable).readableLength;
  }
  if ("writableLength" in stream) {
    return (stream as Writable).writableLength;
  }
  return 0;
}

function logBufferStatus(readable: Readable, writable: Writable): void {
  console.log({
    readableBuffer: `${getBufferSize(readable)} bytes`,
    writableBuffer: `${getBufferSize(writable)} bytes`,
  });
}
```

---

## トラブルシューティング

### 症状1: メモリ使用量が増加し続ける

**原因**: バックプレッシャーが適切に処理されていない

**解決策**:

```typescript
// pipeline()を使用
await pipeline(readable, writable);

// または手動でpause/resumeを実装
```

### 症状2: 処理が途中で止まる

**原因**: drainイベントが発火しない、またはリスナーが外れている

**解決策**:

```typescript
// once()ではなくon()を使用し、適切にクリーンアップ
const drainHandler = () => readable.resume();
writable.on("drain", drainHandler);

// クリーンアップ
readable.on("end", () => {
  writable.off("drain", drainHandler);
});
```

### 症状3: データが欠落する

**原因**: バッファオーバーフロー時にデータが破棄されている

**解決策**:

```typescript
// write()の戻り値を必ずチェック
const ok = writable.write(chunk);
if (!ok) {
  // 書き込み完了を待機
  await new Promise((resolve) => writable.once("drain", resolve));
}
```

---

## ベストプラクティス

1. **pipeline()を使用**: 自動的なバックプレッシャー管理とクリーンアップ

2. **適切なhighWaterMark設定**: 用途に応じた値を設定

3. **エラーハンドリング**: すべてのストリームでerrorイベントをハンドル

4. **メモリ監視**: 本番環境でメモリ使用量を監視

5. **テスト**: 大容量データでのストレステストを実施
