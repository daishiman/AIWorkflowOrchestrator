# Embedding Generation Pipeline アーキテクチャ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

Embedding Generation Pipelineは、ドキュメントを意味的に検索可能なベクトル表現に変換するための統合処理基盤を提供する。

**詳細設計**: `docs/30-workflows/embedding-generation-pipeline/`
**実装**: `packages/shared/src/services/embedding/`, `packages/shared/src/services/chunking/`

**処理フロー**:

| 順序 | ステップ | 説明 |
|------|----------|------|
| 1 | ドキュメント入力 | 処理対象のドキュメントを受け取る |
| 2 | チャンキング | ドキュメントを適切なサイズに分割 |
| 3 | 埋め込み生成 | 各チャンクをベクトル表現に変換 |
| 4 | 重複排除 | 重複するチャンクを検出・除去 |
| 5 | ベクトルDB保存 | 生成したベクトルをデータベースに保存 |

## 主要コンポーネント

| コンポーネント | 責務 |
|----------------|------|
| `EmbeddingPipeline` | パイプライン全体のオーケストレーション |
| `ChunkingService` | ドキュメントのチャンク分割（複数戦略サポート） |
| `EmbeddingService` | 埋め込みベクトル生成（マルチプロバイダー） |
| `BatchProcessor` | バッチ処理と並列実行制御 |
| `RetryHandler` | リトライ機構（指数バックオフ） |
| `CircuitBreaker` | サーキットブレーカー（障害遮断） |
| `RateLimiter` | レート制限（Token Bucket） |

## チャンキング戦略

**実装場所**: `packages/shared/src/services/chunking/strategies/`

| 戦略 | 用途 | チャンク単位 |
|------|------|--------------|
| MarkdownChunkingStrategy | Markdownドキュメント | セクション（見出し） |
| CodeChunkingStrategy | ソースコード | クラス/関数 |
| FixedSizeChunkingStrategy | プレーンテキスト | 固定トークン数 |
| SemanticChunkingStrategy | 意味的境界での分割 | 意味的まとまり |

**共通設定**:

| 設定 | 値 |
|------|------|
| チャンクサイズ（デフォルト） | 512トークン |
| オーバーラップ（デフォルト） | 50トークン |
| 最小チャンクサイズ | 100トークン |

## 埋め込みプロバイダー

**実装場所**: `packages/shared/src/services/embedding/providers/`

| プロバイダー | モデル | 次元数 | 用途 |
|--------------|--------|--------|------|
| OpenAIProvider | text-embedding-3-small | 1536 | 高品質埋め込み |
| Qwen3Provider | qwen3-embedding | 768 | 軽量・フォールバック |

**フォールバックチェーン**:

1. OpenAIProvider（第一選択）
2. Qwen3Provider（フォールバック）

## 信頼性機能

### リトライ機構

| 設定 | 値 |
|------|------|
| 最大リトライ回数 | 3回 |
| 初期遅延 | 1000ms |
| バックオフ倍率 | 2（指数バックオフ） |
| ジッター | 有効 |

### サーキットブレーカー

| 設定 | 値 |
|------|------|
| 状態遷移 | CLOSED → OPEN → HALF_OPEN |
| 失敗閾値 | 5回 |
| タイムアウト | 60秒 |
| 成功閾値（HALF_OPEN→CLOSED） | 2回 |

### レート制限

| 設定 | 値 |
|------|------|
| アルゴリズム | Token Bucket |
| OpenAI | 1M tokens/分 |
| バースト許容 | 設定可能 |

## パフォーマンス最適化

### キャッシング

- LRUキャッシュ: 埋め込み結果をメモリ内保持
- ハッシュベース: コンテンツのSHA-256ハッシュをキーとして使用
- ヒット率追跡: キャッシュ効率のメトリクス

### 重複排除

1. **コンテンツハッシュ**: 完全一致の検出（SHA-256）
2. **コサイン類似度**: 類似コンテンツの検出（閾値: 0.95）

### 差分更新

- ファイルハッシュによる変更検出
- 変更されたファイルのみ再処理
- 性能向上: 初回比4.34倍高速化

### バッチ処理

| 設定 | 値 |
|------|------|
| 推奨バッチサイズ | 50チャンク/バッチ |
| 推奨並列度 | 2 |
| スループット | 53,333 chunks/min（モック環境） |

## Late Chunking パイプライン拡張

**実装場所**: `packages/shared/src/services/embedding/late-chunking/`
**タスクID**: UNASSIGNED-EMB-005
**ステータス**: 実装完了（2026-04-19）

Late Chunkingは、テキスト全体をエンコーダに通した後にチャンク境界に応じてhidden stateをpoolingすることで、チャンク間の文脈を保持したまま埋め込みを生成する手法。従来のチャンキング比で検索品質10-30%向上。

### Late Chunking コンポーネント構成

| コンポーネント | ファイル | 責務 |
|---|---|---|
| `LateChunkingService` | `late-chunking-service.ts` | token-level `IEncoder` ベースの Late Chunking 処理 |
| `ChunkingLateChunkingAdapter` | `chunking-late-chunking-adapter.ts` | `ChunkingService` 専用の Late Chunking 委譲先 |
| `XenovaTransformerEncoder` | `xenova-transformer-encoder.ts` | `IEncoder` の concrete 実装。transformers.js の tokenizer/model 呼び出しと例外分類を担当 |
| `LateChunkingService` | `late-chunking-service.ts` | Late Chunking処理のオーケストレーション |
| `TokenBoundaryCalculator` | `token-boundary-calculator.ts` | チャンク境界をトークン範囲に変換 |
| `HiddenStatePooler` | `hidden-state-pooler.ts` | hidden stateのpooling（mean/max/cls） |
| `WindowSplitter` | `window-splitter.ts` | 長文テキストのウィンドウ分割 |

### ChunkingLateChunkingAdapter 命名由来とAdapter層の設計方針

`ChunkingLateChunkingAdapter` という命名は、token-level インターフェース（`IEncoder`）を実装する `LateChunkingService` との名前衝突を回避するために採用された。`LateChunkingService` がtoken-level層の責務（エンコーダ操作・hidden state pooling）を担うのに対し、`ChunkingLateChunkingAdapter` はtext-level層に位置し、`ChunkingService` から委譲される Late Chunking 専用ロジック（`applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`）をカプセル化する。

**Adapter層の責務**:

| 責務 | 説明 |
|---|---|
| SRP遵守 | `ChunkingService` の責務をチャンク分割のオーケストレーションに限定し、Late Chunking固有ロジックをAdapter層に移譲 |
| テスト観測性向上 | `ChunkingLateChunkingAdapter` を独立してモック・スタブ可能にすることでユニットテストの観測境界を明確化 |
| レイヤー分離 | token-level（`LateChunkingService`）とtext-level（`ChunkingLateChunkingAdapter`）を明確に分離し、相互依存を排除 |

### Late Chunking 型定義

| 型 | 定義場所 | 説明 |
|---|---|---|
| `ChunkBoundary` | `late-chunking-types.ts` | チャンク文字境界（startChar/endChar/chunkId） |
| `TokenRange` | `late-chunking-types.ts` | チャンクのトークン範囲（startToken/endToken/chunkId） |
| `PoolingStrategy` | `late-chunking-types.ts` | "mean" / "max" / "cls" |
| `LateChunkingConfig` | `late-chunking-types.ts` | Late Chunking設定（poolingStrategy/useFloat16/maxTokenLength/windowOverlapTokens） |
| `IEncoder` | `late-chunking-types.ts` | エンコーダインターフェース（encode(text) → EncoderOutput） |
| `EncoderOutput` | `late-chunking-types.ts` | エンコーダ出力（hiddenStates/offsetMapping） |
| `ChunkEmbeddingResult` | `late-chunking-types.ts` | チャンク埋め込み結果（chunkId/embedding/tokenCount） |

### Late Chunking インターフェース

| インターフェース | 定義場所 | 説明 |
|---|---|---|
| `ITokenBoundaryCalculator` | `late-chunking-interfaces.ts` | トークン境界計算の抽象 |
| `IHiddenStatePooler` | `late-chunking-interfaces.ts` | hidden state poolingの抽象 |
| `IWindowSplitter` | `late-chunking-interfaces.ts` | ウィンドウ分割の抽象 |
| `ILateChunkingService` | `late-chunking-interfaces.ts` | Late Chunkingサービスの公開インターフェース |

`LateChunkingService` は `IEncoder` を DI で受け取る。標準実装は `new XenovaTransformerEncoder()` を注入する構成を想定する。

### Late Chunking エラークラス

| エラークラス | 親クラス | 説明 |
|---|---|---|
| `InvalidBoundaryError` | `EmbeddingError` | チャンク境界が不正な場合 |
| `OutOfMemoryError` | `EmbeddingError` | メモリ不足の場合 |

### EmbeddingService への統合

`EmbeddingServiceConfig` に `lateChunkingService?: ILateChunkingService` が追加された（オプション）。

`EmbeddingService.generateChunkEmbeddings()` メソッドが追加され、Late Chunkingサービスが設定されていない場合は `EmbeddingError` をスローする。

### デフォルト設定（DEFAULT_LATE_CHUNKING_CONFIG）

| 設定項目 | デフォルト値 | 説明 |
|---|---|---|
| `poolingStrategy` | `"mean"` | pooling戦略 |
| `useFloat16` | `false` | Float16使用フラグ |
| `maxTokenLength` | `512` | 最大トークン長 |
| `windowOverlapTokens` | `16` | ウィンドウオーバーラップトークン数 |

## 品質メトリクス

### テストカバレッジ

| 指標 | 値 |
|------|------|
| Statement Coverage | 91.39% |
| Branch Coverage | 87.13% |
| Function Coverage | 86.79% |

### パフォーマンス

| 指標 | 値 | 品質ゲート |
|------|------|------------|
| 1000チャンク処理時間 | 2.17秒 | 5分 |
| メモリ使用量 | 8.90MB | 500MB |
| スループット | 27,667 chunks/min | 100 chunks/min |

### 信頼性

| 指標 | 値 |
|------|------|
| リトライ成功率 | 100% |
| サーキットブレーカー | 3状態管理で障害遮断 |
| エラーケース網羅 | 4種類 |

---

## 関連ドキュメント

- [ファイル変換基盤アーキテクチャ](./architecture-file-conversion.md)
- [RAGアーキテクチャ](./architecture-rag.md)
- [Embedding API仕様](./api-internal.md)

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.1.0 | 2026-01-26 | 処理フローのコードブロックを表形式に変換（spec-guidelines.md準拠） |
| v1.0.0 | - | 初版作成 |
