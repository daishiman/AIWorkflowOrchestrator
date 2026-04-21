# IEncoder / EncoderOutput 契約スナップショット

## 取得元

`packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`（2026-04-20時点）

## 契約定義

```typescript
export interface EncoderOutput {
  hiddenStates: Float32Array[];
  offsetMapping: [number, number][];
}

export interface IEncoder {
  encode(text: string): Promise<EncoderOutput>;
}
```

## 関連エラー型

```typescript
// packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts
export class OutOfMemoryError extends EmbeddingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OutOfMemoryError";
  }
}

// packages/shared/src/services/embedding/types/errors.ts
export class EmbeddingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EmbeddingError";
  }
}
```

## 前提確認結果

| 確認項目                                             | 結果                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `IEncoder` 型に変更なし                              | ✅ 確認済み                                                         |
| `EncoderOutput` 型に変更なし                         | ✅ 確認済み                                                         |
| `EmbeddingError` 基底クラス存在                      | ✅ `types/errors.ts` に存在                                         |
| `OutOfMemoryError` 存在                              | ✅ `late-chunking-types.ts` に存在（`EmbeddingError` を継承）       |
| `LateChunkingService` が DI で `IEncoder` を受け取る | ✅ コンストラクタ `constructor(private readonly encoder: IEncoder)` |
| `XenovaTransformerEncoder` が `index.ts` に未追加    | ✅ 未エクスポート                                                   |
| `@xenova/transformers` 未インストール                | ✅ `pnpm list` で未検出                                             |

## XenovaTransformerEncoder の実装で満たすべき契約

1. `encode(text: string): Promise<EncoderOutput>` を実装する
2. 戻り値 `hiddenStates` は `Float32Array[]`（各要素が1トークンの隠れ状態ベクトル）
3. 戻り値 `offsetMapping` は `[number, number][]`（各トークンの文字スパン）
4. エラー時は `EmbeddingError` または `OutOfMemoryError` をスローする
