# チャンク・埋め込み型定義

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-rag.md](./interfaces-rag.md)

RAGパイプラインにおけるテキストチャンク分割と埋め込みベクトル生成の型定義とバリデーション。

**実装場所**: `packages/shared/src/types/rag/chunk/`

---

## 主要型

- `ChunkEntity`: 分割されたテキストチャンクのエンティティ
- `EmbeddingEntity`: 埋め込みベクトルのエンティティ
- `ChunkingStrategy`: チャンク分割戦略（7種類）
- `EmbeddingProvider`: 埋め込み生成プロバイダー（4種類）

---

## ChunkEntity型

分割されたテキストチャンクを表すエンティティ。

| プロパティ        | 型               | 説明                                    |
| ----------------- | ---------------- | --------------------------------------- |
| id                | ChunkId          | チャンクの一意識別子（UUID）            |
| fileId            | FileId           | 親ファイルのID                          |
| content           | string           | チャンクの本文（10-10000文字）          |
| contextualContent | string \| null   | 文脈情報付きコンテンツ（RAG精度向上用） |
| position          | ChunkPosition    | チャンクの位置情報                      |
| strategy          | ChunkingStrategy | 使用した分割戦略                        |
| tokenCount        | number           | 推定トークン数                          |
| hash              | string           | SHA-256ハッシュ（重複検出用、64文字）   |
| metadata          | object           | 拡張メタデータ                          |
| createdAt         | Date             | 作成日時（Timestamped継承）             |
| updatedAt         | Date             | 更新日時（Timestamped継承）             |

**継承**: `Timestamped`, `WithMetadata`（CONV-03-01基礎型）

---

## EmbeddingEntity型

埋め込みベクトルを表すエンティティ。

| プロパティ | 型                | 説明                                       |
| ---------- | ----------------- | ------------------------------------------ |
| id         | EmbeddingId       | 埋め込みの一意識別子（UUID）               |
| chunkId    | ChunkId           | 関連チャンクのID                           |
| vector     | Float32Array      | 埋め込みベクトル（64-4096次元）            |
| provider   | EmbeddingProvider | 埋め込みプロバイダー                       |
| modelId    | string            | 使用モデルID（例: text-embedding-3-small） |
| dimensions | number            | ベクトルの次元数（64-4096）                |
| metadata   | object            | 拡張メタデータ                             |
| createdAt  | Date              | 作成日時（Timestamped継承）                |
| updatedAt  | Date              | 更新日時（Timestamped継承）                |

**継承**: `Timestamped`, `WithMetadata`（CONV-03-01基礎型）

---

## チャンキング戦略

テキスト分割の方法を定義する列挙型。

| 戦略            | 説明                                     |
| --------------- | ---------------------------------------- |
| fixed_size      | 固定トークン数で分割（単純、予測可能）   |
| semantic        | 意味的まとまりで分割（AI活用、高品質）   |
| recursive       | 再帰的分割（バランス重視、デフォルト）   |
| sentence        | 文単位で分割（文脈保持）                 |
| paragraph       | 段落単位で分割（長文向け）               |
| markdown_header | Markdownヘッダー階層で分割（構造化文書） |
| code_block      | コードブロック単位で分割（プログラム）   |

---

## 埋め込みプロバイダー

埋め込みベクトル生成サービスの列挙型。

| プロバイダー | 説明                                    |
| ------------ | --------------------------------------- |
| openai       | OpenAI Embeddings（text-embedding-3等） |
| cohere       | Cohere Embeddings（embed-english-v3等） |
| voyage       | Voyage AI（voyage-2等）                 |
| local        | ローカルモデル（all-MiniLM-L6-v2等）    |

---

## デフォルト設定

### チャンキング設定 `defaultChunkingConfig`

| 設定項目           | デフォルト値 | 説明                       |
| ------------------ | ------------ | -------------------------- |
| strategy           | recursive    | 再帰的分割（バランス重視） |
| targetSize         | 512          | 目標トークン数             |
| minSize            | 100          | 最小トークン数             |
| maxSize            | 1024         | 最大トークン数             |
| overlapSize        | 50           | 重複トークン数             |
| preserveBoundaries | true         | 文・段落境界の保持         |
| includeContext     | true         | 文脈情報の付加             |

### 埋め込みモデル設定 `defaultEmbeddingModelConfigs`

| プロバイダー | モデルID               | 次元数 | 最大トークン | バッチサイズ |
| ------------ | ---------------------- | ------ | ------------ | ------------ |
| openai       | text-embedding-3-small | 1536   | 8191         | 100          |
| cohere       | embed-english-v3.0     | 1024   | 512          | 96           |
| voyage       | voyage-2               | 1024   | 4000         | 100          |
| local        | all-MiniLM-L6-v2       | 384    | 256          | 32           |

---

## ベクトル演算ユーティリティ

### ベクトル演算

| 関数              | 説明                                |
| ----------------- | ----------------------------------- |
| normalizeVector   | L2正規化（単位ベクトル化）          |
| cosineSimilarity  | コサイン類似度計算（-1から1の範囲） |
| euclideanDistance | ユークリッド距離計算                |
| dotProduct        | 内積計算                            |
| vectorMagnitude   | ベクトルの大きさ（L2ノルム）計算    |

### 変換ユーティリティ

| 関数               | 説明                                 |
| ------------------ | ------------------------------------ |
| vectorToBase64     | Float32ArrayをBase64文字列に変換     |
| base64ToVector     | Base64文字列をFloat32Arrayに復元     |
| estimateTokenCount | テキストのトークン数推定（日英対応） |

---

## バリデーション

すべての型に対応するZodスキーマを提供し、実行時型安全性を保証。

**参照**: `docs/30-workflows/completed-tasks/rag-chunk-embedding/` - 詳細な設計・実装ドキュメント

---

## 関連ドキュメント

- [RAG・ファイル選択インターフェース](./interfaces-rag.md)
- [Embedding Generation API](./api-internal-embedding.md)
- [検索クエリ・結果型定義](./interfaces-rag-search.md)
