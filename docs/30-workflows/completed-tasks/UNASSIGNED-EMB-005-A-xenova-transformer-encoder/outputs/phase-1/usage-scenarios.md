# LateChunkingService での encoder.encode() 利用シナリオ

## 呼び出しパス

```
LateChunkingService.generateChunkEmbeddings(text, boundaries, config)
  └─ this.encoder.encode(text)
       └─ { hiddenStates, offsetMapping }
            ├─ hiddenStates.length → totalTokens（ウィンドウ分割に使用）
            └─ offsetMapping → TokenBoundaryCalculator.calculate() に渡す
```

## コード上の利用箇所（late-chunking-service.ts:32-43）

```typescript
const { hiddenStates, offsetMapping } = await this.encoder.encode(text);
const tokenRanges = this.calculator.calculate(chunkBoundaries, offsetMapping);
const totalTokens = hiddenStates.length;
const windows = splitter.split(
  Array.from({ length: totalTokens }, (_, i) => i),
);
```

## `hiddenStates` の使われ方

- `hiddenStates.length` がトークン総数として扱われる
- `pooler.pool(hiddenStates, range)` に渡され、チャンク境界内のトークンをプーリングして embedding を生成
- `range.startToken` ～ `range.endToken` の範囲でスライスされる

## `offsetMapping` の使われ方

- `TokenBoundaryCalculator.calculate(chunkBoundaries, offsetMapping)` に渡される
- 各 `ChunkBoundary`（文字位置）を対応する `TokenRange`（トークンインデックス）に変換するために使用
- 型: `[number, number][]`（`[startChar, endChar]` のタプル配列）

## 典型的な呼び出しシナリオ

1. ユーザーが `LateChunkingService` に `XenovaTransformerEncoder` を DI
2. テキスト「Hello world」と境界 `[{0,5,"c1"},{6,11,"c2"}]` を渡す
3. `encoder.encode("Hello world")` が呼ばれ `hiddenStates`（各トークン）と `offsetMapping` が返る
4. `offsetMapping` からトークン境界を計算し、チャンクごとのembeddingを生成

## 注意事項

- `generateChunkEmbeddings` は `text.length === 0 || chunkBoundaries.length === 0` で早期 return
- そのため `encoder.encode("")` が呼ばれることは通常ない（LateChunkingService 側でガード）
- シリアル呼び出しが前提（並行 encode 呼び出しは一般的でない）
