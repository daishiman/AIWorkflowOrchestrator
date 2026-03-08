# Embedding Generation 型定義

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-llm.md](./interfaces-llm.md)

---

> **実装**: `packages/shared/src/services/embedding/`, `packages/shared/src/services/chunking/`
> **詳細設計**: `docs/30-workflows/embedding-generation-pipeline/`

## プロバイダーインターフェース

### IEmbeddingProvider

Embedding生成プロバイダーの共通インターフェース。モデルID、プロバイダー名、次元数、最大トークン数をプロパティとして持ち、単一テキストの埋め込み生成（embed）、バッチ処理（embedBatch）、トークン数カウント（countTokens）、ヘルスチェック（healthCheck）のメソッドを提供する。

**実装例**:

- OpenAIEmbeddingProvider: text-embedding-3-small（1536次元）
- Qwen3EmbeddingProvider: qwen3-embedding（768次元）

### ChunkingStrategy

テキストをチャンクに分割する戦略インターフェース。chunk()メソッドでテキストとオプションを受け取り、チャンク配列を返す。

**実装例**:

- MarkdownChunkingStrategy: セクション単位でチャンク
- CodeChunkingStrategy: クラス/関数単位でチャンク
- FixedSizeChunkingStrategy: 固定トークン数でチャンク
- SemanticChunkingStrategy: 意味的境界でチャンク

---

## データ型

### Chunk

チャンクデータ型。ID、コンテンツ、トークン数、位置情報（start/end）、メタデータ（documentId、sectionTitle、chunkIndex等）を持つ。

### EmbeddingResult

単一埋め込み生成の結果型。埋め込みベクトル（number配列）、トークン数、モデル名、処理時間（ミリ秒）を含む。

### BatchEmbeddingResult

バッチ埋め込み生成の結果型。埋め込み結果配列、エラー配列（インデックスとエラーメッセージ）、合計トークン数、合計処理時間を含む。

---

## 設定型

### PipelineConfig

パイプライン設定型。チャンキング設定（戦略とオプション）、埋め込み設定（モデルID、フォールバックチェーン、オプション、バッチオプション）、重複排除設定を含む。

### ChunkingOptions

チャンキングオプション型。

| オプション       | デフォルト | 説明               |
| ---------------- | ---------- | ------------------ |
| チャンクサイズ   | 512        | トークン数         |
| オーバーラップ   | 50         | オーバーラップ量   |
| 最小チャンクサイズ | 100      | 最小トークン数     |
| 改行保持フラグ   | true       | 改行を保持するか   |

### BatchEmbedOptions

バッチ埋め込みオプション型。

| オプション     | デフォルト | 説明                 |
| -------------- | ---------- | -------------------- |
| バッチサイズ   | 50         | 一度に処理する数     |
| 並行実行数     | 2          | 並列リクエスト数     |
| バッチ間遅延   | -          | 遅延（ミリ秒）       |
| 進捗コールバック | -        | 進捗通知関数         |

### DeduplicationConfig

重複排除設定型。

| 設定項目     | デフォルト | 説明                       |
| ------------ | ---------- | -------------------------- |
| 有効化フラグ | true       | 重複排除を有効化           |
| 方法         | hash       | hash/similarity/both       |
| 類似度閾値   | 0.95       | similarity方法時の閾値     |

---

## 出力型

### PipelineOutput

パイプライン出力型。ドキュメントID、チャンク配列、埋め込み配列、処理済みチャンク数、生成済み埋め込み数、削除済み重複数、キャッシュヒット数、合計処理時間、ステージ別タイミングを含む。

### StageTimings

ステージ別処理時間型。前処理、チャンキング、埋め込み、重複排除、ストレージの各ステージの処理時間（ミリ秒）を含む。

---

## 信頼性設定型

### RetryOptions

リトライオプション型。

| オプション       | デフォルト | 説明               |
| ---------------- | ---------- | ------------------ |
| 最大リトライ回数 | 3          | リトライ上限       |
| 初期遅延         | 1000ms     | 初回リトライ待機   |
| 最大遅延         | 30000ms    | 最大待機時間       |
| バックオフ乗数   | 2          | 指数バックオフ係数 |
| ジッター有効化   | true       | ランダム遅延追加   |

### RateLimitConfig

レート制限設定型。1分あたりリクエスト数、1分あたりトークン数を含む。

### CircuitBreakerConfig

サーキットブレーカー設定型。

| 設定項目     | デフォルト | 説明                 |
| ------------ | ---------- | -------------------- |
| 失敗閾値     | 5          | OPEN遷移の失敗回数   |
| 成功閾値     | 2          | CLOSED復帰の成功回数 |
| タイムアウト | 60000ms    | HALF_OPEN待機時間    |

---

## メトリクス型

### EmbeddingMetric

埋め込み生成メトリクス型。モデルID、トークン数、処理時間、成功フラグ、エラーメッセージ（任意）を含む。

### PipelineMetric

パイプラインメトリクス型。ドキュメントID、処理済みチャンク数、生成済み埋め込み数、削除済み重複数、キャッシュヒット数、合計処理時間、成功フラグ、エラー（任意）、タイムスタンプを含む。

---

## エラー型

### EmbeddingError

埋め込み生成基底エラークラス。メッセージとオプションを受け取る。

**派生エラー**:

| エラー型           | 説明                     |
| ------------------ | ------------------------ |
| ProviderError      | プロバイダー固有のエラー |
| RateLimitError     | レート制限エラー         |
| TimeoutError       | タイムアウトエラー       |
| TokenLimitError    | トークン制限超過エラー   |
| CircuitBreakerError | サーキットブレーカーエラー |

### PipelineError

パイプライン基底エラークラス。ステージ情報と原因エラーを含む。

**派生エラー**:

| エラー型            | 説明               |
| ------------------- | ------------------ |
| PreprocessingError  | 前処理エラー       |
| ChunkingError       | チャンキングエラー |
| EmbeddingStageError | 埋め込み生成エラー |
| DeduplicationError  | 重複排除エラー     |

---

## 列挙型

### DocumentType

ドキュメントタイプ列挙型。markdown、code、text、jsonの4つの値を持つ。

### ChunkingStrategy（列挙型）

チャンキング戦略列挙型。fixed（固定サイズ）、markdown（Markdown構造）、code（コード構造）、semantic（意味的境界）の4つの値を持つ。

### EmbeddingModelId

埋め込みモデルID列挙型。EMB-001（OpenAI text-embedding-3-small）、EMB-002（Qwen3 embedding）、またはカスタムモデル名（string）を持つ。

### ProviderName

プロバイダー名列挙型。openai、qwen3、またはカスタムプロバイダー名（string）を持つ。

### PipelineStage

パイプラインステージ列挙型。preprocessing（前処理）、chunking（チャンキング）、embedding（埋め込み生成）、deduplication（重複排除）、storage（ストレージ保存）の5つの値を持つ。

### CircuitState

サーキットブレーカー状態列挙型。CLOSED（正常）、OPEN（遮断）、HALF_OPEN（半開）の3つの状態を持つ。

---

## 品質メトリクス

- テストカバレッジ: 91.39% (Statement)、87.13% (Branch)、86.79% (Function)
- 全104件の自動テスト成功
- 全14件の手動テスト成功

---

## 関連ドキュメント

- [LLMインターフェース概要](./interfaces-llm.md)
- [LLM IPC型定義](./llm-ipc-types.md)
- [ベクトル検索仕様](./rag-vector-search.md)
