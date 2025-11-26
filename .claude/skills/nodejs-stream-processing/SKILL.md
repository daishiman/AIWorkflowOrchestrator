---
name: nodejs-stream-processing
description: |
  Node.jsにおけるストリーム処理とバックプレッシャー管理の専門知識。
  大容量ファイルの効率的処理、メモリ使用量の最適化、
  Readable/Writable/Transform/Duplexストリームの適切な活用方法を提供。

  使用タイミング:
  - 大容量ファイル（>10MB）を処理する時
  - メモリ使用量を一定に保ちたい時
  - ファイルアップロード/ダウンロードを実装する時
  - データ変換パイプラインを構築する時
  - バックプレッシャー問題を解決したい時
version: 1.0.0
---

# Node.js Stream Processing

## 概要

このスキルは、Node.jsのストリームAPIを活用した効率的なデータ処理の専門知識を提供します。Ryan Dahlの非同期I/O思想に基づき、大容量データを低メモリで処理するためのパターンを定義します。

---

## 核心概念

### ストリームの種類

| 種類 | 目的 | 例 |
|------|------|-----|
| **Readable** | データソース | fs.createReadStream, HTTP response |
| **Writable** | データシンク | fs.createWriteStream, HTTP request |
| **Duplex** | 読み書き両方 | TCP socket, WebSocket |
| **Transform** | データ変換 | zlib.createGzip, crypto |

### なぜストリームを使うのか

```typescript
// ❌ 非効率: 全データをメモリに読み込む
const data = await fs.promises.readFile('large-file.bin'); // 1GBならメモリ1GB消費
await uploadToCloud(data);

// ✅ 効率的: ストリームで分割処理
const readStream = fs.createReadStream('large-file.bin');
readStream.pipe(uploadStream); // 64KB単位で処理、メモリ最小化
```

---

## 基本パターン

### Readableストリーム

```typescript
import { createReadStream } from 'fs';
import type { Readable } from 'stream';

// ファイル読み込み
const fileStream = createReadStream('./large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024, // 64KB chunks
});

// イベントベース処理
fileStream.on('data', (chunk: string) => {
  console.log(`Received ${chunk.length} bytes`);
});

fileStream.on('end', () => {
  console.log('File reading completed');
});

fileStream.on('error', (error) => {
  console.error('Read error:', error);
});
```

### Writableストリーム

```typescript
import { createWriteStream } from 'fs';

const writeStream = createWriteStream('./output.txt', {
  encoding: 'utf8',
  highWaterMark: 16 * 1024, // 16KB buffer
});

// 書き込み
const canWrite = writeStream.write('Hello, World!');

if (!canWrite) {
  // バッファがいっぱい - drainを待機
  writeStream.once('drain', () => {
    // 書き込み再開可能
  });
}

// 終了
writeStream.end(() => {
  console.log('Writing completed');
});
```

### pipe() によるチェーン

```typescript
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

// 読み込み → 圧縮 → 書き込み
createReadStream('./input.txt')
  .pipe(createGzip())
  .pipe(createWriteStream('./output.txt.gz'));
```

### pipeline() による安全なチェーン（推奨）

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

async function compressFile(input: string, output: string): Promise<void> {
  await pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output)
  );
  // すべてのストリームが自動的にクリーンアップされる
}
```

---

## バックプレッシャー管理

### 問題の理解

```
書き込み速度 < 読み込み速度 → メモリ枯渇

Readable (100MB/s) ──> Buffer (溢れる!) ──> Writable (10MB/s)
```

### 手動制御

```typescript
import { createReadStream, createWriteStream } from 'fs';

const readable = createReadStream('./large-file.bin');
const writable = createWriteStream('./output.bin');

readable.on('data', (chunk) => {
  const canWrite = writable.write(chunk);

  if (!canWrite) {
    // バッファフル - 読み込みを一時停止
    readable.pause();

    writable.once('drain', () => {
      // バッファが空になったら再開
      readable.resume();
    });
  }
});

readable.on('end', () => {
  writable.end();
});
```

### pipeline()による自動制御（推奨）

```typescript
import { pipeline } from 'stream/promises';

// pipeline()は自動的にバックプレッシャーを処理
await pipeline(readable, transform, writable);
```

---

## Transformストリーム

### 基本パターン

```typescript
import { Transform, TransformCallback } from 'stream';

class UpperCaseTransform extends Transform {
  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    try {
      const upperCased = chunk.toString().toUpperCase();
      this.push(upperCased);
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }
}

// 使用
createReadStream('./input.txt')
  .pipe(new UpperCaseTransform())
  .pipe(createWriteStream('./output.txt'));
```

### 行単位処理

```typescript
import { Transform, TransformCallback } from 'stream';

class LineProcessor extends Transform {
  private buffer = '';

  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');

    // 最後の不完全な行を保持
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this.push(this.processLine(line) + '\n');
    }

    callback();
  }

  _flush(callback: TransformCallback): void {
    // 残りのバッファを処理
    if (this.buffer) {
      this.push(this.processLine(this.buffer));
    }
    callback();
  }

  private processLine(line: string): string {
    // カスタム処理
    return line.trim();
  }
}
```

---

## ファイル監視との統合

### 検知 → 読み込み → アップロード

```typescript
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

interface FileEvent {
  path: string;
  stats?: { size: number };
}

async function processDetectedFile(event: FileEvent): Promise<void> {
  const fileStream = createReadStream(event.path, {
    highWaterMark: 64 * 1024, // 64KB chunks
  });

  // アップロードストリームを作成（例: HTTPリクエスト）
  const uploadStream = createUploadStream(event.path);

  try {
    await pipeline(fileStream, uploadStream);
    console.log(`Uploaded: ${event.path}`);
  } catch (error) {
    console.error(`Upload failed: ${event.path}`, error);
    throw error;
  }
}
```

### 大容量ファイルの進捗追跡

```typescript
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

class ProgressTracker extends Transform {
  private bytesProcessed = 0;

  constructor(
    private totalBytes: number,
    private onProgress: (percent: number) => void
  ) {
    super();
  }

  _transform(chunk: Buffer, encoding: string, callback: () => void): void {
    this.bytesProcessed += chunk.length;
    const percent = (this.bytesProcessed / this.totalBytes) * 100;
    this.onProgress(Math.min(100, percent));
    this.push(chunk);
    callback();
  }
}

async function uploadWithProgress(filePath: string): Promise<void> {
  const stats = await stat(filePath);

  const progressTracker = new ProgressTracker(stats.size, (percent) => {
    console.log(`Progress: ${percent.toFixed(1)}%`);
  });

  await pipeline(
    createReadStream(filePath),
    progressTracker,
    createUploadStream(filePath)
  );
}
```

---

## highWaterMark設定ガイド

### 推奨値

| 用途 | highWaterMark | 理由 |
|------|---------------|------|
| 小ファイル (<1MB) | 16KB | メモリ効率 |
| 中ファイル (1-100MB) | 64KB | バランス |
| 大ファイル (>100MB) | 256KB-1MB | スループット |
| ネットワーク | 16-64KB | レイテンシ考慮 |

### 設定例

```typescript
// ファイル読み込み
createReadStream('./file.bin', {
  highWaterMark: 64 * 1024, // 64KB
});

// ファイル書き込み
createWriteStream('./file.bin', {
  highWaterMark: 16 * 1024, // 16KB
});
```

---

## 判断基準チェックリスト

### 設計時

- [ ] ファイルサイズに対して適切なhighWaterMarkを設定したか？
- [ ] バックプレッシャーの発生可能性を考慮したか？
- [ ] エラーハンドリングがすべてのストリームに設定されているか？

### 実装時

- [ ] pipe()ではなくpipeline()を使用しているか？（自動クリーンアップ）
- [ ] Transform._flush()で残りデータを処理しているか？
- [ ] ストリームエラーが適切に伝播されるか？

### テスト時

- [ ] 大容量ファイルでメモリ使用量が一定か？
- [ ] エラー発生時にリソースリークがないか？
- [ ] バックプレッシャー発生時もデータが失われないか？

---

## アンチパターン

### ❌ 避けるべきパターン

```typescript
// 1. pipe()でのエラーハンドリング漏れ
readable.pipe(writable);
// readableのエラーでwritableがリークする

// 2. 全データをメモリに読み込む
const chunks: Buffer[] = [];
readable.on('data', (chunk) => chunks.push(chunk));
readable.on('end', () => {
  const data = Buffer.concat(chunks); // メモリ爆発の可能性
});

// 3. バックプレッシャー無視
readable.on('data', (chunk) => {
  writable.write(chunk); // 戻り値をチェックしていない
});
```

### ✅ 推奨パターン

```typescript
// 1. pipeline()でエラーハンドリング
await pipeline(readable, writable);

// 2. ストリーム処理で分割
await pipeline(readable, transform, writable);

// 3. バックプレッシャー対応
readable.on('data', (chunk) => {
  const canWrite = writable.write(chunk);
  if (!canWrite) {
    readable.pause();
    writable.once('drain', () => readable.resume());
  }
});
```

---

## 関連スキル

- `.claude/skills/event-driven-file-watching/SKILL.md` - ファイル監視
- `.claude/skills/graceful-shutdown-patterns/SKILL.md` - リソースクリーンアップ
- `.claude/skills/context-optimization/SKILL.md` - パフォーマンス最適化

---

## リソース参照

```bash
# ストリームパターン詳細
cat .claude/skills/nodejs-stream-processing/resources/stream-patterns.md

# バックプレッシャーガイド
cat .claude/skills/nodejs-stream-processing/resources/backpressure-guide.md

# ストリームユーティリティテンプレート
cat .claude/skills/nodejs-stream-processing/templates/stream-utils.ts
```
