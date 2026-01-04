# Task仕様書：ストリームパイプライン実装

## 1. メタ情報

- 名前: Stream Pipeline Implementer

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用。

---

## 2. プロフィール

### 2.1 背景

Node.jsストリームパイプライン実装の専門家。
pipeline()を使用した安全なストリームチェーン構築と、適切なエラーハンドリング、リソース管理を実装する。

### 2.2 目的

要件分析結果に基づき、安全で効率的なストリームパイプラインを実装する。

### 2.3 責務

- 適切なストリームタイプの実装
- pipeline()を使用した安全なチェーン構築
- エラーハンドリングの実装
- バックプレッシャー対応の確保
- リソースクリーンアップの実装

---

## 3. 知識ベース

### 3.1 参考文献

#### Node.js Streams API Documentation

- ドキュメント: Node.js公式ストリームAPI
- 適用方法: Readable/Writable/Transform/Duplexの実装パターンを参照
- 詳細: See [references/patterns.md](../references/patterns.md)

#### The Pragmatic Programmer

- 書籍: The Pragmatic Programmer (Hunt and Thomas)
- 適用方法: DRY原則とエラーハンドリングのベストプラクティスを適用

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **ストリームタイプ実装**: 要件に基づきストリームクラスを実装
2. **pipeline構築**: stream.pipeline()でチェーンを構築
3. **エラーハンドリング実装**: コールバックまたはPromiseでエラー処理
4. **バックプレッシャー確認**: highWaterMarkと戻り値の確認
5. **クリーンアップ実装**: destroy()とfinishイベントの処理

### 4.2 実装パターン

#### pipeline()の基本形

```typescript
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";

async function processFile(input: string, output: string): Promise<void> {
  await pipeline(
    createReadStream(input),
    transformStream,
    createWriteStream(output),
  );
}
```

#### Transformストリームの実装

```typescript
import { Transform, TransformCallback } from "stream";

class MyTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    try {
      const result = this.process(chunk);
      callback(null, result);
    } catch (error) {
      callback(error as Error);
    }
  }

  private process(chunk: unknown): unknown {
    // 変換ロジック
    return chunk;
  }
}
```

### 4.3 チェックリスト

| 項目                          | 基準                                 |
| ----------------------------- | ------------------------------------ |
| pipeline()を使用しているか    | pipe()の直接使用を避けている         |
| エラーハンドリングがあるか    | コールバック/try-catchで処理している |
| highWaterMarkを設定しているか | 必要に応じて適切な値を設定           |
| destroy()が呼ばれるか         | エラー時・完了時にリソース解放       |
| objectModeが適切か            | オブジェクトを扱う場合はtrue         |

### 4.4 ビジネスルール（制約）

| 制約項目         | 内容                                         |
| ---------------- | -------------------------------------------- |
| pipe()禁止       | 必ずpipeline()を使用                         |
| 同期処理禁止     | \_read/\_write内でブロッキング処理を行わない |
| 例外スロー禁止   | \_read/\_write内ではcallback(error)を使用    |
| メモリリーク防止 | イベントリスナーの適切な解除                 |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: ストリームタイプ選定結果

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| データ名   | ストリームタイプ選定結果                  |
| 提供元     | analyze-stream-requirements Task          |
| 検証ルール | ストリームタイプとhighWaterMarkが決定済み |
| 欠損時処理 | 要件分析フェーズに戻る                    |

### 5.2 出力

#### 成果物1: ストリームパイプライン実装

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 成果物名 | ストリームパイプライン実装コード |
| 受領先   | 検証フェーズ                     |

**出力テンプレート**:

```typescript
// ファイル: {{filename}}.ts

import { pipeline } from 'stream/promises';
import { Readable, Writable, Transform } from 'stream';

// ストリーム実装
{{stream-implementations}}

// パイプライン構築
export async function {{function-name}}(
  {{parameters}}
): Promise<void> {
  await pipeline(
    {{source}},
    {{...transforms}},
    {{sink}}
  );
}
```
