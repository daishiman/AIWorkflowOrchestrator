# XenovaTransformerEncoder クラス設計

## クラス図・フィールド・メソッドシグネチャ

```typescript
export class XenovaTransformerEncoder implements IEncoder {
  private readonly modelName: string; // immutable, constructor で確定
  private tokenizer: unknown; // @xenova/transformers の AutoTokenizer インスタンス
  private model: unknown; // @xenova/transformers の AutoModel インスタンス
  private loadingPromise: Promise<void> | null = null; // 並行二重ロード防止キャッシュ

  constructor(modelName: string = "Xenova/all-MiniLM-L6-v2");

  private async loadModel(): Promise<void>; // 冪等な遅延ロード
  async encode(text: string): Promise<EncoderOutput>; // IEncoder 契約
}
```

## AC-1 準拠の根拠

- `implements IEncoder` 宣言により TypeScript コンパイラが `encode()` シグネチャを静的検証
- `encode(text: string): Promise<EncoderOutput>` が IEncoder と一致しない場合はコンパイルエラー

## フィールド設計根拠

| フィールド       | 型                      | 理由                                                                    |
| ---------------- | ----------------------- | ----------------------------------------------------------------------- |
| `modelName`      | `readonly string`       | コンストラクタ後の差し替えを禁止。AC-5 でカスタム名を保持               |
| `tokenizer`      | `unknown`               | `@xenova/transformers` の型定義不安定性を吸収。局所アサーションで境界化 |
| `model`          | `unknown`               | 同上                                                                    |
| `loadingPromise` | `Promise<void> \| null` | 並行 encode 呼び出し時の二重 `from_pretrained` を防止                   |

## 並行性方針（観点6 対応）

`loadingPromise` キャッシュを採用する。

```typescript
private async loadModel(): Promise<void> {
  if (this.tokenizer && this.model) return;           // 既ロード済みガード
  if (this.loadingPromise) return this.loadingPromise; // 進行中のロードを再利用
  this.loadingPromise = this._doLoad();
  await this.loadingPromise;
}
```

理由: シリアル利用が前提でも、テスト環境での並行呼び出しシナリオで安全性を保証するため採用する。
コスト: フィールド1本（`Promise<void> | null`）のみ。過剰な複雑さにならない。

## 既定モデル名

`"Xenova/all-MiniLM-L6-v2"` （AC-5 準拠、元仕様書 §3.2 に従う）
