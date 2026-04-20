# 統合テスト計画書（フィクスチャ仕様）

## フィクスチャ設計

### buildOffsetMapping(seqLen)

```typescript
// seqLen=6 → Int32Array([0,1, 2,3, 4,5, 6,7, 8,9, 10,11])
// 各トークンが 2 文字幅（[i*2, i*2+1]）
```

### buildModelOutput(seqLen, hiddenSize)

```typescript
// dims: [1, seqLen, hiddenSize]
// data: data[i] = (i % hiddenSize) * 0.1 + 0.05
// → hiddenSize=8 なら各トークンは [0.05, 0.15, 0.25, ..., 0.75]
```

### 定数

- `HIDDEN_SIZE = 8`
- `SEQ_LEN = 6`

## テストケース別フィクスチャ

| テストID    | seqLen | hiddenSize | 備考                              |
| ----------- | ------ | ---------- | --------------------------------- |
| XENC-INT-01 | 6      | 8          | 1チャンク確認                     |
| XENC-INT-02 | 6      | 8          | 3チャンク、各チャンク2文字        |
| XENC-INT-03 | 6      | 8          | mean pooling                      |
| XENC-INT-04 | 6      | 8          | DI互換性確認                      |
| XENC-INT-05 | -      | -          | mockReject で EmbeddingError 注入 |
| XENC-INT-06 | -      | -          | RangeError("Out of memory") 注入  |

## AC-6 達成確認

`new LateChunkingService(new XenovaTransformerEncoder())` が型エラーなしでコンパイル・実行可能であることを XENC-INT-04 で確認。
`IEncoder` インターフェース互換性を静的・動的両面で検証。
