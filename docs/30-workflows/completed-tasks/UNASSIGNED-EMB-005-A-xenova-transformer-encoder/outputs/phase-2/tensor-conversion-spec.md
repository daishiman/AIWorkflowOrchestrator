# テンソル変換アルゴリズム仕様

## offset_mapping 変換（convertOffsetTensor）

### 入力形式

`@xenova/transformers` の `AutoTokenizer` が返す `offset_mapping` は flat な数値配列:

```
tensor.data = [start0, end0, start1, end1, start2, end2, ...]
// 例: [0, 5, 6, 11, 12, 17]
```

型は `Float32Array` / `Int32Array` / `BigInt64Array` のいずれにもなり得る。

### 出力形式（IEncoder 契約）

```typescript
[number, number][]
// 例: [[0, 5], [6, 11], [12, 17]]
```

### 変換アルゴリズム

```typescript
function convertOffsetTensor(tensor: {
  data: ArrayLike<number>;
}): [number, number][] {
  const flat = Array.from(tensor.data);
  const result: [number, number][] = [];
  for (let i = 0; i < flat.length; i += 2) {
    result.push([flat[i]!, flat[i + 1]!]);
  }
  return result;
}
```

### 奇数長入力の処理方針

**末尾要素を破棄**する（Phase 3 設計レビューで確定）。

理由:

- `@xenova/transformers` は常に偶数長を返すのが正常動作
- 奇数長は実装バグまたは将来の API 変更による異常状態
- `InvalidBoundaryError` を投げると正常テキストのエンコードが壊れるリスクがある
- 末尾破棄は後段 `TokenBoundaryCalculator` に影響が出ない（最後のトークンの end が欠落するだけ）

### 型の抽象化根拠

`ArrayLike<number>` で抽象化することで:

- `Float32Array`（通常）
- `Int32Array`（整数インデックス）
- `BigInt64Array`（非対応: `Array.from` で数値変換される）

いずれにも対応。`Array.from()` で JavaScript の通常配列に変換してから処理するため、元テンソルの型依存を排除。

---

## hiddenStates スライス（sliceHiddenStates）

### 入力形式

`AutoModel` の `last_hidden_state` または `hidden_states.at(-1)`:

```
tensor.dims = [1, seqLen, hiddenSize]  // batch=1 固定前提
tensor.data = Float32Array（length = 1 × seqLen × hiddenSize）
```

### 出力形式（IEncoder 契約）

```typescript
Float32Array[]
// length = seqLen
// 各要素.length = hiddenSize
```

### 変換アルゴリズム

```typescript
function sliceHiddenStates(tensor: {
  dims: [number, number, number]; // [batch, seqLen, hiddenSize]
  data: Float32Array;
}): Float32Array[] {
  const seqLen = tensor.dims[1];
  const hiddenSize = tensor.dims[2];
  return Array.from({ length: seqLen }, (_, i) =>
    tensor.data.slice(i * hiddenSize, (i + 1) * hiddenSize),
  );
}
```

### 設計上のポイント

| ポイント           | 詳細                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `slice()` でコピー | 元 `Float32Array` のメモリ参照から独立。元テンソルが GC 対象になる    |
| `batch=1` 前提     | `dims[0]` を無視。マルチバッチはスコープ外                            |
| `seqLen === 0`     | 空配列を返す。後段 `LateChunkingService` が早期 return する設計と整合 |
| テスト容易性       | 純関数のため境界条件を独立にユニットテスト可能                        |

### GC 効率の根拠

`tensor.data` は推論結果の生バッファ（大サイズの `Float32Array`）。
`slice()` で独立コピーを生成することで、元バッファへの参照が切れ、推論後のメモリが解放される。
`subarray()` は参照を共有するため使用しない。
