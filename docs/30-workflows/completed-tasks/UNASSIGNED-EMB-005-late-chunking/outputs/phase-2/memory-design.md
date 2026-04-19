# メモリ設計書

## 課題と対策

| 課題                                 | 対策                                  | 効果                   |
| ------------------------------------ | ------------------------------------- | ---------------------- |
| 全文入力によるHidden State配列肥大化 | `useFloat16: true` でFloat16Array採用 | メモリ50%削減          |
| 長文の一括処理でOOM                  | WindowSplitterでウィンドウ分割        | ピークメモリ抑制       |
| ウィンドウ間の埋め込み精度低下       | `windowOverlapTokens` で重複範囲設定  | 境界チャンクの精度維持 |

## Float16戦略

```typescript
// useFloat16: true の場合
const vector = new Float16Array(hiddenDim);

// useFloat16: false の場合（デフォルト）
const vector = new Float32Array(hiddenDim);
```

注: `Float16Array` はNode.js 20+でネイティブサポート。未サポート環境では `Float32Array` にフォールバック。

## ウィンドウ分割メモリ計算

- 1ウィンドウのHidden State: `maxTokenLength × hiddenDim × 4バイト (Float32)`
- `maxTokenLength=512, hiddenDim=4096` の場合: 約8MB/ウィンドウ
- Float16採用時: 約4MB/ウィンドウ
