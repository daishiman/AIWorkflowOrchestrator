# 受け入れ基準（AC-1〜AC-8）と検証手段マッピング

## AC一覧

| AC番号 | 条件                                                                                       | 検証手段                                  | 対応テストID                                               |
| ------ | ------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------- |
| AC-1   | `XenovaTransformerEncoder` が `IEncoder` インターフェースを完全実装している                | TypeScript コンパイル（`pnpm typecheck`） | XENC-NORMAL-06                                             |
| AC-2   | `encode()` が `hiddenStates: Float32Array[]` と `offsetMapping: [number, number][]` を返す | ユニットテスト                            | XENC-NORMAL-01, XENC-NORMAL-02, XENC-BOUNDARY-03           |
| AC-3   | モデル読み込み失敗時に `EmbeddingError` がスローされる                                     | ユニットテスト                            | XENC-ERROR-01, XENC-ERROR-02, XENC-ERROR-05, XENC-ERROR-06 |
| AC-4   | OOM 発生時に `OutOfMemoryError` がスローされる                                             | ユニットテスト                            | XENC-ERROR-03, XENC-ERROR-04                               |
| AC-5   | コンストラクタでカスタムモデル名を指定できる（既定 `Xenova/all-MiniLM-L6-v2`）             | ユニットテスト                            | XENC-NORMAL-03, XENC-NORMAL-04                             |
| AC-6   | `LateChunkingService` に渡して `generateChunkEmbeddings()` が動作する                      | 統合テスト                                | XENC-INT-01〜04                                            |
| AC-7   | `index.ts` から `XenovaTransformerEncoder` がエクスポートされている                        | コードレビュー（grep）                    | -                                                          |
| AC-8   | 全テスト PASS・`pnpm typecheck` PASS・`pnpm lint` PASS                                     | CI                                        | 全テスト                                                   |

## AC-1 詳細

- `implements IEncoder` 宣言により TypeScript コンパイラが静的保証
- `encode()` シグネチャが `Promise<EncoderOutput>` と一致しない場合はコンパイルエラー

## AC-2 詳細

- `hiddenStates` は `Float32Array[]`（各要素は1トークン分の隠れ状態ベクトル）
- `offsetMapping` は `[number, number][]`（各トークンの文字スパン `[startChar, endChar]`）
- `hiddenStates.length === offsetMapping.length`（seqLen が一致）

## AC-3 詳細

- `AutoTokenizer.from_pretrained` / `AutoModel.from_pretrained` の失敗
- `model(inputs)` の推論失敗
- `last_hidden_state` / `hidden_states` の双方が undefined の場合
- いずれも `EmbeddingError` に正規化してスロー

## AC-4 詳細

- `RangeError` または メッセージに "OOM"/"out of memory" を含む例外が発生した場合
- `loadModel()` 時と `encode()` 推論時の両方で検知

## AC-5 詳細

- `new XenovaTransformerEncoder()` で `Xenova/all-MiniLM-L6-v2` が使われる
- `new XenovaTransformerEncoder("Xenova/bge-small-en")` でカスタム名が `from_pretrained` に伝播

## AC-6 詳細

- `new LateChunkingService(new XenovaTransformerEncoder())` がコンパイル・実行可能
- `generateChunkEmbeddings()` が `ChunkEmbeddingResult[]` を返す

## AC-7 詳細

- `packages/shared/src/services/embedding/late-chunking/index.ts` に追加
- `export { XenovaTransformerEncoder } from "./xenova-transformer-encoder"` の1行

## AC-8 詳細

- `pnpm --filter @repo/shared test` で全テスト PASS
- `pnpm --filter @repo/shared typecheck` で型エラー 0件
- `pnpm --filter @repo/shared lint` で lint エラー 0件
