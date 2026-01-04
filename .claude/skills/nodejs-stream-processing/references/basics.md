# Node.js Streams 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: Node.js Streams API Documentation

---

## ストリームとは

ストリームはNode.jsにおけるデータの流れを抽象化したインターフェース。
データを小さなチャンクに分割して処理することで、メモリ効率を最大化する。

---

## ストリームの4つのタイプ

| タイプ    | 説明                   | 主なユースケース           |
| --------- | ---------------------- | -------------------------- |
| Readable  | データを読み取る       | ファイル読み込み、HTTP応答 |
| Writable  | データを書き込む       | ファイル書き込み、HTTP要求 |
| Duplex    | 読み書き両方           | TCPソケット                |
| Transform | 読み込んだデータを変換 | 圧縮、暗号化               |

---

## 基本的なAPI

### Readableストリーム

```typescript
import { createReadStream } from "fs";

const readable = createReadStream("input.txt", {
  highWaterMark: 16 * 1024, // 16KB
  encoding: "utf8",
});

readable.on("data", (chunk) => {
  console.log("受信:", chunk.length, "bytes");
});

readable.on("end", () => {
  console.log("読み込み完了");
});

readable.on("error", (err) => {
  console.error("エラー:", err);
});
```

### Writableストリーム

```typescript
import { createWriteStream } from "fs";

const writable = createWriteStream("output.txt", {
  highWaterMark: 16 * 1024,
});

writable.write("データ1\n");
writable.write("データ2\n");
writable.end("最終データ\n");

writable.on("finish", () => {
  console.log("書き込み完了");
});

writable.on("error", (err) => {
  console.error("エラー:", err);
});
```

---

## highWaterMark

内部バッファの最大サイズを指定するオプション。

| 値                 | 用途                           |
| ------------------ | ------------------------------ |
| 16KB（デフォルト） | 一般的なファイル操作           |
| 64KB以上           | 大容量ファイル、高スループット |
| 1KB以下            | メモリ制約環境                 |
| objectMode時は16   | オブジェクト数                 |

---

## イベント一覧

### Readableイベント

| イベント | 発火タイミング                     |
| -------- | ---------------------------------- |
| data     | チャンクが利用可能になった         |
| end      | 読み込み完了                       |
| error    | エラー発生                         |
| close    | ストリームが閉じられた             |
| readable | データが読み取り可能（pullモード） |

### Writableイベント

| イベント | 発火タイミング                |
| -------- | ----------------------------- |
| drain    | バッファが空になった          |
| finish   | end()後、すべての書き込み完了 |
| error    | エラー発生                    |
| close    | ストリームが閉じられた        |
| pipe     | readable.pipe()で接続された   |

---

## Object Mode

オブジェクトをストリームで流す場合に使用。

```typescript
import { Transform } from "stream";

const objectTransform = new Transform({
  objectMode: true,
  transform(obj, encoding, callback) {
    // objはオブジェクト
    callback(null, { ...obj, processed: true });
  },
});
```

**注意**: objectModeではhighWaterMarkはバイト数ではなくオブジェクト数を指す。

---

## 関連リソース

- **パターン集**: See [patterns.md](patterns.md)
- **バックプレッシャー**: See [backpressure-guide.md](backpressure-guide.md)
