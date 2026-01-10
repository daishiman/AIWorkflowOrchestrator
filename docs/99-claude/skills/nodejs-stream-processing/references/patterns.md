# Node.js Streams パターン集

> **相対パス**: `references/patterns.md`
> **原典**: Node.js Streams API Documentation, The Pragmatic Programmer

---

## pipeline()パターン（推奨）

### 基本形

```typescript
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import { createGzip } from "zlib";

async function compressFile(input: string, output: string): Promise<void> {
  await pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output),
  );
}
```

### 利点

| 利点               | 説明                                  |
| ------------------ | ------------------------------------- |
| 自動エラー伝播     | 1箇所でエラーをキャッチ可能           |
| 自動クリーンアップ | エラー時にすべてのストリームをdestroy |
| Promise対応        | async/awaitで自然に書ける             |

---

## カスタムTransformストリーム

### クラスベース

```typescript
import { Transform, TransformCallback } from "stream";

class LineCounter extends Transform {
  private count = 0;

  constructor() {
    super({ objectMode: true });
  }

  _transform(
    chunk: string,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    const lines = chunk.split("\n").filter(Boolean);
    this.count += lines.length;
    callback(null, chunk);
  }

  _flush(callback: TransformCallback): void {
    this.push(`\n合計行数: ${this.count}\n`);
    callback();
  }
}
```

### ジェネレータベース（Node.js 16+）

```typescript
import { pipeline } from "stream/promises";
import { Readable } from "stream";

async function* transform(source: AsyncIterable<string>) {
  for await (const chunk of source) {
    yield chunk.toUpperCase();
  }
}

await pipeline(Readable.from(["hello", "world"]), transform, process.stdout);
```

---

## カスタムReadableストリーム

### Pushモード

```typescript
import { Readable } from "stream";

class DataGenerator extends Readable {
  private current = 0;
  private max: number;

  constructor(max: number) {
    super({ objectMode: true });
    this.max = max;
  }

  _read(): void {
    if (this.current >= this.max) {
      this.push(null); // 終了
      return;
    }
    this.push({ id: this.current++, timestamp: Date.now() });
  }
}
```

### Readable.from（配列・イテレータから）

```typescript
import { Readable } from "stream";

const data = [1, 2, 3, 4, 5];
const readable = Readable.from(data, { objectMode: true });

for await (const item of readable) {
  console.log(item);
}
```

---

## カスタムWritableストリーム

```typescript
import { Writable } from "stream";

class DatabaseWriter extends Writable {
  constructor() {
    super({ objectMode: true, highWaterMark: 100 });
  }

  _write(
    record: Record<string, unknown>,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    // データベースに書き込み
    db.insert(record)
      .then(() => callback())
      .catch(callback);
  }

  _final(callback: (error?: Error | null) => void): void {
    // すべての書き込み後の後処理
    db.flush()
      .then(() => callback())
      .catch(callback);
  }
}
```

---

## Duplexストリーム

```typescript
import { Duplex } from "stream";

class Echo extends Duplex {
  private buffer: Buffer[] = [];

  _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.buffer.push(chunk);
    callback();
  }

  _read(size: number): void {
    if (this.buffer.length > 0) {
      this.push(this.buffer.shift());
    } else {
      this.push(null);
    }
  }
}
```

---

## エラーハンドリングパターン

### pipeline()でのエラーハンドリング

```typescript
try {
  await pipeline(source, transform, destination);
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("ファイルが見つかりません");
  } else {
    console.error("ストリームエラー:", error);
  }
}
```

### 個別ストリームでのエラーハンドリング

```typescript
const readable = createReadStream("input.txt");
const writable = createWriteStream("output.txt");

readable.on("error", (err) => {
  console.error("読み込みエラー:", err);
  writable.destroy(err);
});

writable.on("error", (err) => {
  console.error("書き込みエラー:", err);
  readable.destroy(err);
});

readable.pipe(writable);
```

---

## ユースケース別パターン

| ユースケース       | パターン                                          |
| ------------------ | ------------------------------------------------- |
| ファイルコピー     | createReadStream → createWriteStream              |
| ファイル圧縮       | createReadStream → createGzip → createWriteStream |
| CSVパース          | createReadStream → LineTransform → CSVParser      |
| HTTPレスポンス転送 | res.body → createWriteStream                      |
| ログ集約           | 複数Readable → PassThrough → Writable             |

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **バックプレッシャー**: See [backpressure-guide.md](backpressure-guide.md)
