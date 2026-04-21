# スコープ定義・Phase 2 論点リスト

## スコープ内

| 項目                                  | 詳細                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `XenovaTransformerEncoder` クラス実装 | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` |
| `encode()` メソッド実装               | トークナイズ・推論・`hiddenStates`/`offsetMapping` 抽出                              |
| モデル遅延ロードと二重ロード防止      | `loadModel()` の冪等実装                                                             |
| エラーハンドリング                    | モデル読み込み失敗 / OOM / エンコード失敗                                            |
| ユニットテスト                        | `@xenova/transformers` モック使用、18ケース                                          |
| `LateChunkingService` 統合テスト      | DI 互換性確認（AC-6）                                                                |
| `index.ts` へのエクスポート追加       | 1行追加のみ                                                                          |
| `@xenova/transformers` 依存追加       | `pnpm --filter @repo/shared add @xenova/transformers`                                |

## スコープ外

| 項目                               | 理由                          |
| ---------------------------------- | ----------------------------- |
| `LateChunkingService` 本体の変更   | UNASSIGNED-EMB-005 で完了済み |
| OpenAI API / ONNX 等のバックエンド | 別タスクで扱う                |
| Electron 環境での E2E 動作確認     | 別タスクで扱う                |
| fine-tuning・カスタムモデル配布    | スコープ外                    |
| UI コンポーネント変更              | NON_VISUAL タスク             |
| モデルキャッシュパス設定           | `env.cacheDir` は利用者責務   |

## Phase 2 への設計論点リスト

| 論点                        | 詳細                                                                        | 優先度 |
| --------------------------- | --------------------------------------------------------------------------- | ------ |
| 型境界                      | `@xenova/transformers` の型定義が不安定なため、`unknown` + 局所アサーション | 高     |
| 遅延ロード冪等性            | `loadingPromise` キャッシュによる並行二重ロード防止                         | 高     |
| offset_mapping テンソル変換 | flat `[s0,e0,s1,e1,...]` → `[number,number][]` のアルゴリズム               | 高     |
| hiddenStates スライス       | `[seqLen × hiddenSize]` flat → `Float32Array[]` の分割                      | 高     |
| エラー分類                  | `RangeError` / OOM 文字列マッチ / `EmbeddingError` 二重ラップ防止           | 高     |
| ESM/CJS 互換性              | `@xenova/transformers` は ESM-only のため `tsconfig` の `module` 確認必要   | 中     |
| 奇数長 offset_mapping       | 末尾要素破棄か `InvalidBoundaryError` か Phase 2/3 で決定                   | 中     |
| 並行性                      | シリアル利用前提だが `loadingPromise` で安全に保証                          | 低     |

## 既存テストの非回帰確認

確認コマンド: `pnpm --filter @repo/shared test -- --run late-chunking`

対象テストファイル:

- `late-chunking-service.test.ts`
- `late-chunking-edge.test.ts`
- `late-chunking-regression.test.ts`
- `hidden-state-pooler.test.ts`
- `token-boundary-calculator.test.ts`
- `window-splitter.test.ts`
