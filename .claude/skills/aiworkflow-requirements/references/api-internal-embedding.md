# Embedding Generation API

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 変更履歴

| バージョン | 日付       | 変更内容                                         |
| ---------- | ---------- | ------------------------------------------------ |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式に変換 |
| v1.0.0     | -          | 初版作成                                         |

---

**実装**: `packages/shared/src/services/embedding/`

## 主要インターフェース

### ドキュメント埋め込み処理

**メソッド**: `EmbeddingPipeline.process()`

ドキュメントを入力として受け取り、チャンク分割・埋め込み生成・重複排除を一括処理するパイプラインメソッド。進捗コールバックによりリアルタイムで処理状況を監視可能。

**メソッドシグネチャ**:

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| メソッド名 | process                                                    |
| 引数1      | input: PipelineInput（必須）- パイプライン入力データ       |
| 引数2      | config?: PipelineConfig（任意）- パイプライン設定          |
| 引数3      | onProgress?: function（任意）- 進捗通知コールバック関数    |
| 戻り値     | Promise&lt;PipelineOutput&gt; - 処理結果を含む非同期応答   |

**入力パラメータ**:

| パラメータ                                | 型           | 説明                               |
| ----------------------------------------- | ------------ | ---------------------------------- |
| `input.documentId`                        | string       | ドキュメント識別子                 |
| `input.documentType`                      | DocumentType | markdown / code / text             |
| `input.text`                              | string       | ドキュメントテキスト               |
| `input.metadata`                          | object       | メタデータ（オプション）           |
| `config.chunking.strategy`                | string       | fixed / markdown / code / semantic |
| `config.chunking.options.chunkSize`       | number       | 512（デフォルト）                  |
| `config.embedding.modelId`                | string       | EMB-002等                          |
| `config.embedding.batchOptions.batchSize` | number       | 50（デフォルト）                   |
| `onProgress`                              | function     | 進捗コールバック                   |

**出力パラメータ**:

| フィールド              | 型         | 説明                   |
| ----------------------- | ---------- | ---------------------- |
| `documentId`            | string     | ドキュメントID         |
| `chunks`                | Chunk[]    | 生成されたチャンク配列 |
| `embeddings`            | number[][] | 埋め込みベクトル配列   |
| `chunksProcessed`       | number     | 処理されたチャンク数   |
| `embeddingsGenerated`   | number     | 生成された埋め込み数   |
| `duplicatesRemoved`     | number     | 重複排除数             |
| `cacheHits`             | number     | キャッシュヒット数     |
| `totalProcessingTimeMs` | number     | 総処理時間（ms）       |
| `stageTimings`          | object     | ステージ別処理時間     |

### 単一埋め込み生成

**メソッド**: `EmbeddingService.embed()`

単一のテキストに対して埋め込みベクトルを生成するメソッド。タイムアウトやリトライ設定をオプションで指定可能。

**メソッドシグネチャ**:

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| メソッド名 | embed                                                    |
| 引数1      | text: string（必須）- 埋め込み対象テキスト               |
| 引数2      | options?: EmbedOptions（任意）- タイムアウト・リトライ等 |
| 戻り値     | Promise&lt;EmbeddingResult&gt; - 埋め込み結果            |

**入力パラメータ**:

| パラメータ        | 型           | 説明                 |
| ----------------- | ------------ | -------------------- |
| `text`            | string       | 埋め込み対象テキスト |
| `options.timeout` | number       | タイムアウト（ms）   |
| `options.retry`   | RetryOptions | リトライ設定         |

**出力パラメータ**:

| フィールド         | 型       | 説明             |
| ------------------ | -------- | ---------------- |
| `embedding`        | number[] | 埋め込みベクトル |
| `tokenCount`       | number   | トークン数       |
| `model`            | string   | 使用モデル       |
| `processingTimeMs` | number   | 処理時間（ms）   |

### バッチ埋め込み生成

**メソッド**: `EmbeddingService.embedBatch()`

複数のテキストを一括で埋め込みベクトルに変換するメソッド。バッチサイズ・並列数・重複排除の設定が可能で、大量データの効率的な処理に適している。

**メソッドシグネチャ**:

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| メソッド名 | embedBatch                                                     |
| 引数1      | texts: string[]（必須）- 埋め込み対象テキスト配列              |
| 引数2      | options?: BatchEmbedOptions（任意）- バッチ処理オプション      |
| 戻り値     | Promise&lt;BatchEmbeddingResult&gt; - バッチ埋め込み結果       |

**入力パラメータ**:

| パラメータ                    | 型       | 説明                           |
| ----------------------------- | -------- | ------------------------------ |
| `texts`                       | string[] | テキスト配列                   |
| `options.batchSize`           | number   | バッチサイズ（デフォルト: 50） |
| `options.concurrency`         | number   | 並列数（デフォルト: 2）        |
| `options.enableDeduplication` | boolean  | 重複排除（デフォルト: true）   |

**出力パラメータ**:

| フィールド         | 型         | 説明                 |
| ------------------ | ---------- | -------------------- |
| `embeddings`       | number[][] | 埋め込みベクトル配列 |
| `duplicatesRemoved | number     | 重複排除数           |
| `totalTimeMs`      | number     | 総処理時間（ms）     |

### チャンク生成

**メソッド**: `ChunkingService.chunk()`

ドキュメントを指定された戦略に基づいてチャンク（断片）に分割するメソッド。Markdown・コード・固定長など複数の分割戦略をサポートし、オーバーラップ設定で文脈の連続性を維持可能。

**メソッドシグネチャ**:

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| メソッド名 | chunk                                                             |
| 引数1      | document: Document（必須）- 分割対象ドキュメント                  |
| 引数2      | strategy: ChunkingStrategy（必須）- 分割戦略                      |
| 引数3      | options?: ChunkingOptions（任意）- チャンクサイズ・オーバーラップ |
| 戻り値     | Promise&lt;Chunk[]&gt; - 生成されたチャンク配列                   |

**入力パラメータ**:

| パラメータ            | 型               | 説明                            |
| --------------------- | ---------------- | ------------------------------- |
| `document.id`         | string           | ドキュメントID                  |
| `document.type`       | DocumentType     | markdown / code / text          |
| `document.content`    | string           | ドキュメント本文                |
| `strategy`            | ChunkingStrategy | fixed / markdown / code / ...   |
| `options.chunkSize`   | number           | チャンクサイズ（デフォルト512） |
| `options.overlapSize` | number           | オーバーラップ（デフォルト50）  |

**出力パラメータ**:

| フィールド                | 型     | 説明                 |
| ------------------------- | ------ | -------------------- |
| `chunks[].content`        | string | チャンク本文         |
| `chunks[].metadata.index` | number | チャンクインデックス |
| `chunks[].metadata.type`  | string | チャンクタイプ       |
| `chunks[].size`           | number | サイズ（文字数）     |

## エラーコード

| エラーコード              | 説明                         | HTTPステータス |
| ------------------------- | ---------------------------- | -------------- |
| `EMB_INVALID_INPUT`       | 入力パラメータが不正         | 400            |
| `EMB_PROVIDER_ERROR`      | プロバイダAPIエラー          | 502            |
| `EMB_CIRCUIT_OPEN`        | サーキットブレーカーが開状態 | 503            |
| `EMB_RATE_LIMIT_EXCEEDED` | レート制限超過               | 429            |
| `EMB_TIMEOUT`             | タイムアウト                 | 504            |
| `EMB_CACHE_ERROR`         | キャッシュエラー             | 500            |

## 性能指標

| 指標                         | 値      |
| ---------------------------- | ------- |
| 1000チャンク処理時間         | 2.17秒  |
| メモリ使用量（1000チャンク） | 8.9MB   |
| キャッシュヒット率           | 95%以上 |
| 重複排除率                   | 10-15%  |
| 差分更新高速化               | 4.34倍  |
