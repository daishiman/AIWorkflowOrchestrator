# RAG・ファイル選択 インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 変更履歴

| バージョン | 日付       | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| v1.0.0     | 2025-01-01 | 初版作成                                     |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式に変換 |

---

## 概要

RAGパイプライン実装で使用する共通型定義とインターフェース。

## ドキュメント構成

| ドキュメント            | ファイル                                                                             | 説明                                      |
| ----------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- |
| FileSelection API       | [interfaces-rag-file-selection.md](./interfaces-rag-file-selection.md)               | IPC通信インターフェース、セキュリティ機能 |
| チャンク・埋め込み型    | [interfaces-rag-chunk-embedding.md](./interfaces-rag-chunk-embedding.md)             | チャンク分割戦略、埋め込みプロバイダー    |
| 検索クエリ・結果型      | [interfaces-rag-search.md](./interfaces-rag-search.md)                               | HybridRAG検索、RRF、CRAG評価              |
| Knowledge Graph Store   | [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md) | ナレッジグラフの永続化・操作              |
| Community Detection     | [interfaces-rag-community-detection.md](./interfaces-rag-community-detection.md)     | Leidenアルゴリズム、コミュニティ検出      |
| エンティティ抽出（NER） | [interfaces-rag-entity-extraction.md](./interfaces-rag-entity-extraction.md)         | IEntityExtractor、LLM/RuleBased抽出器     |

---

## Branded Types

型安全なID管理のための名目的型付け。

**実装場所**: `packages/shared/src/types/rag/*`

| 型名         | 説明                                   |
| ------------ | -------------------------------------- |
| FileId       | ファイルを一意に識別するID             |
| ChunkId      | チャンク（分割テキスト）を一意に識別   |
| ConversionId | 変換プロセスを一意に識別               |
| EntityId     | エンティティ（知識グラフノード）を識別 |
| RelationId   | 関係（知識グラフエッジ）を識別         |
| CommunityId  | コミュニティ（クラスタ）を識別         |
| EmbeddingId  | 埋め込みベクトルを識別                 |

**機能**:

- `create*()` - 既存文字列をID型に変換
- `generate*()` - UUID v4形式の新規ID生成

---

## RAGエラー型

統一されたエラーハンドリング。

| エラーコード               | カテゴリ     | 説明                   |
| -------------------------- | ------------ | ---------------------- |
| FILE_NOT_FOUND             | ファイル     | ファイルが見つからない |
| FILE_READ_ERROR            | ファイル     | ファイル読み込みエラー |
| CONVERSION_FAILED          | 変換         | 変換処理失敗           |
| DB_CONNECTION_ERROR        | データベース | DB接続エラー           |
| DB_QUERY_ERROR             | データベース | クエリ実行エラー       |
| EMBEDDING_GENERATION_ERROR | 埋め込み     | 埋め込み生成エラー     |
| SEARCH_ERROR               | 検索         | 検索処理エラー         |
| ENTITY_EXTRACTION_ERROR    | グラフ       | エンティティ抽出エラー |
| RELATION_EXTRACTION_ERROR  | グラフ       | 関係抽出エラー         |
| COMMUNITY_DETECTION_ERROR  | グラフ       | コミュニティ検出エラー |

**ファクトリ関数**: `createRAGError(code, message, context?, cause?)`

---

## 共通インターフェース

**Repository パターン**:

- DIP（依存性逆転原則）準拠のデータアクセス抽象化
- `findById`, `findAll`, `create`, `update`, `delete`

### Repository パターン詳細

**実装場所**: `packages/shared/src/db/repositories/`

#### BaseRepository<TTable, TSelect, TInsert, TId>

基底Repositoryクラス。全てのRepositoryが継承し、共通CRUD操作を提供する。

| メソッド           | 戻り値                                     | 説明                               |
| ------------------ | ------------------------------------------ | ---------------------------------- |
| findById(id)       | Result<TSelect \| null, RAGError>          | IDでエンティティを取得             |
| findAll(params?)   | Result<PaginatedResult<TSelect>, RAGError> | 全レコード（ページネーション付き） |
| create(data)       | Result<TSelect, RAGError>                  | 新規エンティティを作成             |
| createMany(data[]) | Result<TSelect[], RAGError>                | 一括作成                           |
| update(id, data)   | Result<TSelect, RAGError>                  | エンティティを更新                 |
| delete(id)         | Result<void, RAGError>                     | エンティティを削除                 |
| exists(id)         | Result<boolean, RAGError>                  | 存在確認                           |
| count()            | Result<number, RAGError>                   | 件数取得                           |

#### 具体Repository

| Repository       | 対象テーブル | Branded Type | 固有メソッド                               |
| ---------------- | ------------ | ------------ | ------------------------------------------ |
| FileRepository   | files        | FileId       | findByHash, findByPath, softDelete         |
| ChunkRepository  | chunks       | ChunkId      | findByFileId, deleteByFileId, findAdjacent |
| EntityRepository | entities     | EntityId     | upsert, searchByName, findTopByImportance  |

#### ファクトリ関数

`createRepositories(db)` を使用してRepository群を一括生成する。

| 操作                     | インポート元                      | 戻り値             |
| ------------------------ | --------------------------------- | ------------------ |
| Repository群の一括生成   | @repo/shared/db/repositories      | repos オブジェクト |

**repos オブジェクトのプロパティ**:

| プロパティ    | Repository型      | 用途                           |
| ------------- | ----------------- | ------------------------------ |
| repos.files   | FileRepository    | ファイルエンティティ操作       |
| repos.chunks  | ChunkRepository   | チャンクエンティティ操作       |
| repos.entities| EntityRepository  | エンティティ（グラフ）操作     |

**使用例（概念）**:
- `createRepositories(db)` でDBインスタンスからRepository群を生成
- `repos.files.findById(fileId)` でファイルをID検索
- `repos.chunks.findByFileId(fileId)` で特定ファイルのチャンク一覧取得

**Strategy パターン**:

- `Converter<TInput, TOutput>` - ファイル変換の抽象化
- `SearchStrategy<TQuery, TResult>` - 検索アルゴリズムの抽象化

**ミックスイン**:

- `Timestamped` - 作成日時・更新日時
- `WithMetadata` - 任意のメタデータ
- `PaginationParams` / `PaginatedResult` - ページネーション

---

## ファイル・変換ドメイン型

**実装場所**: `packages/shared/src/types/rag/file/`

### FileEntity型

| プロパティ | 型           | 説明                       |
| ---------- | ------------ | -------------------------- |
| id         | FileId       | ファイルの一意識別子       |
| name       | string       | ファイル名（1-255文字）    |
| path       | string       | ファイルパス               |
| mimeType   | FileType     | MIMEタイプ                 |
| category   | FileCategory | カテゴリ                   |
| size       | number       | ファイルサイズ（10MB上限） |
| hash       | string       | SHA-256ハッシュ            |

### サポートファイルタイプ

| カテゴリ       | MIMEタイプ例                      | 用途            |
| -------------- | --------------------------------- | --------------- |
| テキスト系     | text/plain, text/markdown         | ドキュメント    |
| コード系       | text/typescript, application/json | ソースコード    |
| ドキュメント系 | application/pdf                   | PDF、Office文書 |

---

## Knowledge Graph型

**実装場所**: `packages/shared/src/types/rag/graph/`

| 型名            | 役割       | 説明                   |
| --------------- | ---------- | ---------------------- |
| EntityEntity    | ノード     | 頂点（52種類のタイプ） |
| RelationEntity  | エッジ     | 辺（15種類の関係）     |
| CommunityEntity | クラスター | 意味的グループ         |

**永続化層**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md) - IKnowledgeGraphStoreインターフェース

**詳細参照**: `specs/05-architecture.md` セクション5.6

---

## 設計原則

| 原則           | 説明                                      |
| -------------- | ----------------------------------------- |
| 型安全性       | Branded TypesによるID型の厳格化           |
| DRY原則        | 共有定数の一元管理                        |
| 不変性         | readonly修飾子による値の変更防止          |
| バリデーション | Zodスキーマによるランタイムバリデーション |
| テスト容易性   | 純粋関数による高いテスタビリティ          |

### エンティティ抽出サービス (NER)

チャンクからエンティティを抽出し、Knowledge Graphのノード候補を生成するサービス。LLMベースとルールベースの2つの抽出方式を提供。

**実装場所**: `packages/shared/src/services/extraction/`

#### アーキテクチャ

**処理フロー**:

| ステップ | 入力                | 処理                     | 出力                |
| -------- | ------------------- | ------------------------ | ------------------- |
| 1        | Chunk（テキスト断片）| IEntityExtractorへ渡す   | -                   |
| 2        | Chunk              | 抽出器で処理             | ExtractedEntity[]   |
| 3        | ExtractedEntity[]  | 後続処理でグラフ化       | EntityEntity        |

**IEntityExtractor 実装クラス**:

| 実装クラス              | 方式               | 特徴                           |
| ----------------------- | ------------------ | ------------------------------ |
| LLMEntityExtractor      | AIベース抽出       | 高精度、未知エンティティ検出可能 |
| RuleBasedEntityExtractor| パターンマッチング | 高速（ミリ秒単位）、LLMフォールバック用 |

#### インターフェース

**IEntityExtractor**: エンティティ抽出の抽象インターフェース

| メソッド        | 説明                             |
| --------------- | -------------------------------- |
| extract()       | 単一チャンクからエンティティ抽出 |
| extractBatch()  | 複数チャンクからバッチ抽出       |
| mergeEntities() | 抽出結果のマージ（重複除去）     |

**ILLMProvider**: LLM通信の抽象インターフェース（依存性注入用）

| プロパティ/メソッド | 説明                     |
| ------------------- | ------------------------ |
| modelId             | 使用モデルID             |
| generate()          | プロンプト送信・応答取得 |

#### 抽出オプション (EntityExtractionOptions)

| オプション           | 型       | デフォルト | 説明                         |
| -------------------- | -------- | ---------- | ---------------------------- |
| types                | string[] | 全52タイプ | 抽出対象のエンティティタイプ |
| minConfidence        | number   | 0.5        | 最小信頼度閾値               |
| maxEntitiesPerChunk  | number   | 20         | チャンクあたり最大抽出数     |
| minNameLength        | number   | 2          | 最小名前長                   |
| generateDescriptions | boolean  | true       | 説明生成（LLMのみ）          |
| useLLM               | boolean  | true       | LLM使用フラグ                |

#### 抽出結果型 (ExtractedEntity)

| プロパティ     | 型         | 説明                           |
| -------------- | ---------- | ------------------------------ |
| name           | string     | エンティティ名（原形）         |
| normalizedName | string     | 正規化名（小文字・空白正規化） |
| type           | EntityType | エンティティタイプ（52種類）   |
| confidence     | number     | 信頼度スコア（0.0〜1.0）       |
| description    | string?    | 説明文（LLM生成時のみ）        |
| aliases        | string[]   | 別名・エイリアス               |
| mentions       | Mention[]  | テキスト内出現情報             |

#### Mention型（出現情報）

| プロパティ    | 型     | 説明                            |
| ------------- | ------ | ------------------------------- |
| chunkId       | string | 出現チャンクID                  |
| startPosition | number | 開始位置（文字オフセット）      |
| endPosition   | number | 終了位置（文字オフセット）      |
| context       | string | 前後コンテキスト（最大200文字） |

#### 抽出器実装

**LLMEntityExtractor**: AIベースの高精度抽出

- プロンプトエンジニアリングによる52タイプ分類
- 説明文・エイリアス生成
- 未知エンティティの検出が可能
- 処理時間: 数秒〜（LLM API依存）

**RuleBasedEntityExtractor**: パターンマッチングによる高速抽出

- 正規表現による技術名・組織名・日付検出
- LLMフォールバック用途
- 処理時間: ミリ秒単位

#### パターンカテゴリ（RuleBased）

| カテゴリ | 検出例                                | 信頼度   |
| -------- | ------------------------------------- | -------- |
| 技術名   | TypeScript, React, PostgreSQL, Docker | 0.85-0.9 |
| 組織名   | Google, Microsoft, OpenAI             | 0.9      |
| 日付     | 2024-01-15, 2024年1月15日, 2024/01/15 | 0.9-0.95 |

#### エラー型

| エラークラス     | 説明                    |
| ---------------- | ----------------------- |
| LLMProviderError | LLM API呼び出し失敗     |
| JsonParseError   | LLMレスポンスのJSON不正 |

#### ユーティリティ関数

| 関数                | 説明                           |
| ------------------- | ------------------------------ |
| normalizeEntityName | 名前正規化（小文字・空白処理） |
| escapeRegex         | 正規表現特殊文字エスケープ     |
| mergeOptions        | オプションとデフォルトのマージ |
| findMentionsInText  | テキスト内出現位置検出         |
| deduplicateEntities | 重複エンティティのマージ       |

**テスト品質**: 224テストケース、97.1%カバレッジ、96.8%品質スコア達成

**参照**: `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/implementation-guide.md` - 詳細な設計・実装ドキュメント

### 関係抽出サービス (Relation Extraction)

エンティティ間の関係を抽出し、Knowledge Graphのエッジを生成するサービス。LLMベースの高精度抽出を提供。

**実装場所**: `packages/shared/src/services/extraction/`

#### アーキテクチャ

**処理フロー**:

| ステップ | 入力                           | 処理                       | 出力                 |
| -------- | ------------------------------ | -------------------------- | -------------------- |
| 1        | ExtractedEntity[]（抽出結果）  | IRelationExtractorへ渡す   | -                    |
| 2        | ExtractedEntity[]              | LLM関係抽出器で処理        | ExtractedRelation[]  |
| 3        | ExtractedRelation[]            | 後続処理でエッジ化         | RelationEntity       |

**IRelationExtractor 実装クラス**:

| 実装クラス             | 方式         | 特徴                               |
| ---------------------- | ------------ | ---------------------------------- |
| LLMRelationExtractor   | AIベース抽出 | 15種類の関係タイプを高精度で検出   |

#### インターフェース

**IRelationExtractor**: 関係抽出の抽象インターフェース

| メソッド         | 説明                                   |
| ---------------- | -------------------------------------- |
| extract()        | 単一チャンクからエンティティ間関係抽出 |
| extractBatch()   | 複数チャンクからバッチ抽出             |
| mergeRelations() | 抽出結果のマージ（重複除去・統合）     |

#### 抽出オプション (RelationExtractionOptions)

| オプション           | 型             | デフォルト | 説明                     |
| -------------------- | -------------- | ---------- | ------------------------ |
| minConfidence        | number         | 0.5        | 最小信頼度閾値           |
| allowedRelationTypes | RelationType[] | 全15タイプ | 抽出対象の関係タイプ制限 |
| temperature          | number         | 0.1        | LLMの温度パラメータ      |
| maxTokens            | number         | 2000       | 最大トークン数           |

#### 抽出結果型 (ExtractedRelation)

| プロパティ    | 型                       | 説明                     |
| ------------- | ------------------------ | ------------------------ |
| sourceEntity  | string                   | 関係の起点エンティティ名 |
| targetEntity  | string                   | 関係の終点エンティティ名 |
| relationType  | RelationType             | 関係タイプ（15種類）     |
| description   | string?                  | 関係の説明文（LLM生成）  |
| evidence      | RelationEvidence[]       | 根拠情報（必須1件以上）  |
| confidence    | number                   | 信頼度スコア（0.0〜1.0） |
| bidirectional | boolean                  | 双方向関係フラグ         |
| attributes    | Record<string, unknown>? | カスタム属性（拡張用）   |

#### 関係タイプ (RelationType) - 15種類

| タイプ            | カテゴリ   | 説明                  | 例                    |
| ----------------- | ---------- | --------------------- | --------------------- |
| belongs_to        | 所属関係   | 組織への所属          | 山田→A社              |
| related_to        | 汎用関係   | 一般的な関連          | AI→機械学習           |
| causes            | 因果関係   | 原因-結果             | バグ→エラー           |
| depends_on        | 依存関係   | 技術的依存            | React→JavaScript      |
| created_by        | 作成関係   | 作成者-成果物         | TypeScript→Microsoft  |
| uses              | 使用関係   | 使用-被使用           | Next.js→React         |
| part_of           | 包含関係   | 部分-全体             | 章→本                 |
| located_in        | 位置関係   | 場所-所在             | Google→カリフォルニア |
| succeeds          | 時系列関係 | 後継-先行             | Python 3→Python 2     |
| precedes          | 時系列関係 | 先行-後継             | HTML→HTML5            |
| competes_with     | 競合関係   | 競合関係              | React→Vue             |
| collaborates_with | 協力関係   | 協力・提携            | OpenAI→Microsoft      |
| implements        | 実装関係   | インターフェース-実装 | Express→HTTPサーバー  |
| extends           | 拡張関係   | 拡張元-拡張先         | TypeScript→JavaScript |
| other             | その他     | 分類困難な関係        | -                     |

#### RelationEvidence型（根拠情報）

| プロパティ    | 型     | 説明                       |
| ------------- | ------ | -------------------------- |
| chunkId       | string | 出現チャンクID             |
| text          | string | 根拠テキスト               |
| startPosition | number | 開始位置（文字オフセット） |
| endPosition   | number | 終了位置（文字オフセット） |

#### エラー型

| エラーコード     | 説明                          |
| ---------------- | ----------------------------- |
| LLM_API_ERROR    | LLM API呼び出し失敗           |
| PARSE_ERROR      | LLMレスポンスのJSON不正       |
| VALIDATION_ERROR | Zodスキーマバリデーション失敗 |
| TIMEOUT          | タイムアウト                  |
| RATE_LIMITED     | レート制限超過                |

**参照**: `docs/30-workflows/CONV-06-05-relation-extraction/outputs/phase-12/implementation-guide.md` - 詳細な設計・実装ドキュメント

---

## 関連ドキュメント

- [内部API仕様](./api-internal.md)
- [コアインターフェース仕様](./interfaces-core.md)
- [エラーハンドリング仕様](./error-handling.md)
