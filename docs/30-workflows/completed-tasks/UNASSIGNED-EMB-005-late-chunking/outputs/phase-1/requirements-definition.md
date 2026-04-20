# 要件定義書 - UNASSIGNED-EMB-005 Late Chunking

## 機能要件

### FR-001: LateChunkingService

- 全文テキストとチャンク境界配列を入力として受け取り、チャンクごとのEmbeddingを返す
- 入力: `text: string`, `chunkBoundaries: ChunkBoundary[]`, `config?: LateChunkingConfig`
- 出力: `ChunkEmbeddingResult[]`

### FR-002: TokenBoundaryCalculator

- 文字オフセット（startChar/endChar）からトークンインデックス（startToken/endToken）へ変換する
- `offset_mapping` を利用して双方向マッピングを提供する
- オフセット範囲外の入力には `RangeError` をスローする

### FR-003: HiddenStatePooler

- 指定トークン範囲のHidden Stateを以下3戦略でプーリングする
  - `mean`: 範囲内トークンの要素平均
  - `max`: 範囲内トークンの要素最大値
  - `cls`: CLSトークン（インデックス0）をそのまま使用
- PoolingStrategyは依存注入で切り替え可能

### FR-004: WindowSplitter

- `maxTokenLength` 超過時にスライディングウィンドウで分割する
- `windowOverlapTokens` でウィンドウ間の重複トークン数を指定する
- 最終ウィンドウはパディングなしで末端打ち切り

### FR-005: EmbeddingService統合

- `useLateChunking: true` フラグで LateChunkingService に委譲する
- デフォルト（`useLateChunking: false`）で既存フローを維持する

## 非機能要件

### NFR-001: メモリ効率

- Float16採用でHidden State配列のメモリを半減する
- `useFloat16: true` 設定で有効化

### NFR-002: 後方互換性

- 既存 `EmbeddingService` の公開APIを変更しない
- `useLateChunking` フラグはオプション（デフォルト: false）

### NFR-003: エラーハンドリング

- トークン長超過: `TokenLimitError`
- 無効な境界: `InvalidBoundaryError`
- プーリング失敗: 上位に再スロー（リトライなし）

### NFR-004: 検索品質

- 既存EarlyChunkingと比較してMRR/NDCG指標で10〜30%向上を目標とする
