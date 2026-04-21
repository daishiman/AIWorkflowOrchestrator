# XenovaTransformerEncoder 実装ガイド

## Part 1: 中学生レベルの概念説明

### Late Chunking

長い文章を AI に読ませるとき、先に細かく切ってから読むと前後のつながりが弱くなります。
Late Chunking は、まず文章全体を読ませてから後で区切る方法です。
丸ごと焼いたピザをあとで切るイメージで、全体の流れを保ったまま部分ごとの特徴を取り出せます。

### IEncoder

`IEncoder` は、「文章を渡すと決まった形の結果を返す」という約束です。
飲み物の注文票が決まっていれば、自販機が違っても同じ押し方で買えるのと同じです。

### XenovaTransformerEncoder

`XenovaTransformerEncoder` は、その約束を `@xenova/transformers` で実際に動かす部品です。
`LateChunkingService` から見れば「同じ注文票で使える自販機」が一台増えることになります。

---

## Part 2: 技術者向けガイド

### 契約

```typescript
// packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts
export interface IEncoder {
  encode(text: string): Promise<EncoderOutput>;
}

export interface EncoderOutput {
  hiddenStates: Float32Array[]; // 各トークンの隠れ状態ベクトル
  offsetMapping: [number, number][]; // 各トークンの文字スパン [start, end]
}
```

### 使用例

```typescript
import { XenovaTransformerEncoder, LateChunkingService } from "@repo/shared";

// デフォルトモデル（Xenova/all-MiniLM-L6-v2）
const encoder = new XenovaTransformerEncoder();

// カスタムモデル
const encoder2 = new XenovaTransformerEncoder("Xenova/bge-small-en");

// LateChunkingService への DI
const service = new LateChunkingService(encoder);
const results = await service.generateChunkEmbeddings(text, boundaries);
```

### 依存

- `@xenova/transformers` — `packages/shared/dependencies` に追加済み
- 動的 import で遅延ロード（未使用時はロードコストなし）
- エラー分類の根拠: `outputs/phase-2/error-decision-table.md`
- 拡張テストの根拠: `outputs/phase-6/expansion-test-result.md`

### エラー分類

| 状況                   | 例外型             |
| ---------------------- | ------------------ |
| モデル読み込み失敗     | `EmbeddingError`   |
| モデル読み込み OOM     | `OutOfMemoryError` |
| tokenizer / 推論失敗   | `EmbeddingError`   |
| tokenizer / 推論中 OOM | `OutOfMemoryError` |
| hidden states 欠落     | `EmbeddingError`   |

`classifyError()` を通る経路では `cause` プロパティに元エラーを保持する。`hidden states` 欠落は出力検査で直接 `EmbeddingError` を投げるため `cause` は付かない。

### 実装ファイル

| ファイル                                                     | 説明                    |
| ------------------------------------------------------------ | ----------------------- |
| `late-chunking/xenova-transformer-encoder.ts`                | クラス本体              |
| `late-chunking/index.ts`                                     | エクスポート（1行追加） |
| `__tests__/late-chunking/xenova-transformer-encoder.test.ts` | ユニットテスト（29件）  |
| `__tests__/late-chunking/xenova-encoder-integration.test.ts` | 統合テスト（6件）       |

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要

代替証跡: `outputs/phase-10/final-review-result.md` と
`outputs/phase-11/manual-test-result.md`
