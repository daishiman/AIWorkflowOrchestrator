# RAG・ファイル選択 インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## FileSelection API

ファイル選択機能のIPC通信インターフェース。ElectronのMain-Renderer間でファイル選択ダイアログ、メタデータ取得、パス検証を提供する。

### IPCチャンネル

| チャンネル                           | 方向            | 説明                         |
| ------------------------------------ | --------------- | ---------------------------- |
| FILE_SELECTION_OPEN_DIALOG           | Renderer → Main | ファイル選択ダイアログを開く |
| FILE_SELECTION_GET_METADATA          | Renderer → Main | 単一ファイルのメタデータ取得 |
| FILE_SELECTION_GET_MULTIPLE_METADATA | Renderer → Main | 複数ファイルのメタデータ取得 |
| FILE_SELECTION_VALIDATE_PATH         | Renderer → Main | ファイルパスの存在・種別検証 |

### リクエスト/レスポンス型

**OpenFileDialogRequest**:

| フィールド      | 型                 | 必須 | 説明                                              |
| --------------- | ------------------ | ---- | ------------------------------------------------- |
| filterCategory  | FileFilterCategory | 任意 | フィルターカテゴリ（all/office/text/media/image） |
| multiSelections | boolean            | 任意 | 複数選択を許可するか（デフォルト: true）          |

**GetFileMetadataRequest**:

| フィールド | 型     | 必須 | 説明                               |
| ---------- | ------ | ---- | ---------------------------------- |
| filePath   | string | 必須 | ファイルの絶対パス（1000文字以内） |

**GetMultipleFileMetadataRequest**:

| フィールド | 型       | 必須 | 説明                            |
| ---------- | -------- | ---- | ------------------------------- |
| filePaths  | string[] | 必須 | ファイルパスの配列（最大100件） |

**ValidateFilePathRequest**:

| フィールド | 型     | 必須 | 説明         |
| ---------- | ------ | ---- | ------------ |
| filePath   | string | 必須 | 検証対象パス |

### セキュリティ機能

| 機能                         | 説明                                               |
| ---------------------------- | -------------------------------------------------- |
| パストラバーサル防止         | `..` を含むパスを拒否                              |
| 送信元検証（SEC-M1）         | リクエストがフォーカス中のウィンドウから来たか検証 |
| 危険拡張子フィルタ（SEC-M2） | exe, bat, cmd等の危険な拡張子をダイアログから除外  |
| レート制限                   | 同一送信者からのリクエストを1秒間に10回まで制限    |

### UIコンポーネント

**FileSelector コンポーネント** (`apps/desktop/src/renderer/components/organisms/FileSelector/`):

| data-testid         | 要素             | 説明                       |
| ------------------- | ---------------- | -------------------------- |
| file-selector       | コンテナ         | FileSelectorのルート要素   |
| file-drop-zone      | ドロップゾーン   | ドラッグ&ドロップエリア    |
| file-select-button  | ボタン           | ファイル選択ダイアログ起動 |
| file-filter-select  | セレクトボックス | フィルターカテゴリ選択     |
| error-message       | アラート         | エラーメッセージ表示       |
| selected-files-list | リスト           | 選択済みファイル一覧       |
| selected-file-item  | リストアイテム   | 各ファイルエントリ         |
| file-delete-button  | ボタン           | ファイル削除               |
| file-count          | テキスト         | 選択ファイル数表示         |
| loading-spinner     | スピナー         | 読み込み中表示             |

**実装場所**:

- IPC ハンドラー: `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`
- Preload API: `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/types.ts`
- Zodスキーマ: `packages/shared/schemas/file-selection.schema.ts`
- UIコンポーネント: `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx`

## RAG型定義

RAGパイプライン実装で使用する共通型定義。

**実装場所**: `packages/shared/src/types/rag/*`

### Branded Types

型安全なID管理のための名目的型付け。

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

### RAGエラー型

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

### 共通インターフェース

**Repository パターン**:

- DIP（依存性逆転原則）準拠のデータアクセス抽象化
- `findById`, `findAll`, `create`, `update`, `delete`

### Repository パターン詳細

**実装場所**: `packages/shared/src/db/repositories/`

#### BaseRepository<TTable, TSelect, TInsert, TId>

基底Repositoryクラス。全てのRepositoryが継承し、共通CRUD操作を提供する。

| メソッド          | 戻り値                                       | 説明                         |
| ----------------- | -------------------------------------------- | ---------------------------- |
| findById(id)      | Result<TSelect \| null, RAGError>            | IDでエンティティを取得       |
| findAll(params?)  | Result<PaginatedResult<TSelect>, RAGError>   | 全レコード（ページネーション付き） |
| create(data)      | Result<TSelect, RAGError>                    | 新規エンティティを作成       |
| createMany(data[])| Result<TSelect[], RAGError>                  | 一括作成                     |
| update(id, data)  | Result<TSelect, RAGError>                    | エンティティを更新           |
| delete(id)        | Result<void, RAGError>                       | エンティティを削除           |
| exists(id)        | Result<boolean, RAGError>                    | 存在確認                     |
| count()           | Result<number, RAGError>                     | 件数取得                     |

#### 具体Repository

| Repository       | 対象テーブル | Branded Type | 固有メソッド                          |
| ---------------- | ------------ | ------------ | ------------------------------------- |
| FileRepository   | files        | FileId       | findByHash, findByPath, softDelete    |
| ChunkRepository  | chunks       | ChunkId      | findByFileId, deleteByFileId, findAdjacent |
| EntityRepository | entities     | EntityId     | upsert, searchByName, findTopByImportance |

#### ファクトリ関数

```typescript
import { createRepositories } from "@repo/shared/db/repositories";

const repos = createRepositories(db);
const file = await repos.files.findById(fileId);
const chunks = await repos.chunks.findByFileId(fileId);
```

**Strategy パターン**:

- `Converter<TInput, TOutput>` - ファイル変換の抽象化
- `SearchStrategy<TQuery, TResult>` - 検索アルゴリズムの抽象化

**ミックスイン**:

- `Timestamped` - 作成日時・更新日時
- `WithMetadata` - 任意のメタデータ
- `PaginationParams` / `PaginatedResult` - ページネーション

### ファイル・変換ドメイン型定義

RAGパイプラインにおけるファイル選択・変換処理の型定義とバリデーション。

**実装場所**: `packages/shared/src/types/rag/file/`

**主要型**:

- `FileEntity`: ファイルメタデータを表すエンティティ
- `ConversionEntity`: 変換処理の状態を管理するエンティティ
- `FileType`: サポートされるMIMEタイプ（16種類）
- `FileCategory`: ファイルのカテゴリ分類（text, code, document等）

#### FileEntity型

| プロパティ   | 型           | 説明                                      |
| ------------ | ------------ | ----------------------------------------- |
| id           | FileId       | ファイルの一意識別子（UUID）              |
| name         | string       | ファイル名（1-255文字）                   |
| path         | string       | ファイルパス                              |
| mimeType     | FileType     | MIMEタイプ                                |
| category     | FileCategory | カテゴリ                                  |
| size         | number       | ファイルサイズ（バイト、10MB上限）        |
| hash         | string       | SHA-256ハッシュ（64文字）                 |
| encoding     | string       | 文字エンコーディング（デフォルト: utf-8） |
| lastModified | Date         | 最終更新日時                              |
| createdAt    | Date         | 作成日時                                  |
| updatedAt    | Date         | 更新日時                                  |
| metadata     | object       | 拡張メタデータ                            |

#### サポートファイルタイプ

| カテゴリ       | MIMEタイプ例                                       | 用途                       |
| -------------- | -------------------------------------------------- | -------------------------- |
| テキスト系     | text/plain, text/markdown, text/html               | ドキュメント、Markdown     |
| コード系       | text/typescript, application/json                  | ソースコード、設定ファイル |
| ドキュメント系 | application/pdf, application/vnd.openxmlformats-\* | PDF、Office文書            |

#### バリデーション

**Zodスキーマ**: すべての型に対応するZodスキーマを提供

- 実行時型安全性を保証
- 日本語エラーメッセージ対応
- UUID形式、ファイルサイズ、ハッシュ形式等の検証

**ユーティリティ関数**:

- `getFileTypeFromExtension()`: 拡張子からMIMEタイプを推定
- `calculateFileHash()`: SHA-256ハッシュ計算（非同期）
- `formatFileSize()`: バイト数を人間可読形式に変換
- `validateFileSize()`: ファイルサイズの妥当性検証

**Result型**: Railway Oriented Programmingパターンによるエラーハンドリング

### 設計原則

| 原則           | 説明                                                 |
| -------------- | ---------------------------------------------------- |
| 型安全性       | Branded TypesによるID型の厳格化                      |
| DRY原則        | 共有定数の一元管理                                   |
| 不変性         | readonly修飾子による値の変更防止                     |
| バリデーション | Zodスキーマによるランタイムバリデーション            |
| テスト容易性   | 純粋関数による高いテスタビリティ（96.50%カバレッジ） |

**参照**: `docs/30-workflows/completed-tasks/file-conversion-schemas/` - 詳細な設計・実装ドキュメント

### チャンク・埋め込み型定義

RAGパイプラインにおけるテキストチャンク分割と埋め込みベクトル生成の型定義とバリデーション。

**実装場所**: `packages/shared/src/types/rag/chunk/`

**主要型**:

- `ChunkEntity`: 分割されたテキストチャンクのエンティティ
- `EmbeddingEntity`: 埋め込みベクトルのエンティティ
- `ChunkingStrategy`: チャンク分割戦略（7種類）
- `EmbeddingProvider`: 埋め込み生成プロバイダー（4種類）

#### ChunkEntity型

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

#### EmbeddingEntity型

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

#### チャンキング戦略

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

#### 埋め込みプロバイダー

埋め込みベクトル生成サービスの列挙型。

| プロバイダー | 説明                                    |
| ------------ | --------------------------------------- |
| openai       | OpenAI Embeddings（text-embedding-3等） |
| cohere       | Cohere Embeddings（embed-english-v3等） |
| voyage       | Voyage AI（voyage-2等）                 |
| local        | ローカルモデル（all-MiniLM-L6-v2等）    |

#### デフォルト設定

**チャンキング設定**: `defaultChunkingConfig`

| 設定項目           | デフォルト値 | 説明                       |
| ------------------ | ------------ | -------------------------- |
| strategy           | recursive    | 再帰的分割（バランス重視） |
| targetSize         | 512          | 目標トークン数             |
| minSize            | 100          | 最小トークン数             |
| maxSize            | 1024         | 最大トークン数             |
| overlapSize        | 50           | 重複トークン数             |
| preserveBoundaries | true         | 文・段落境界の保持         |
| includeContext     | true         | 文脈情報の付加             |

**埋め込みモデル設定**: `defaultEmbeddingModelConfigs`

| プロバイダー | モデルID               | 次元数 | 最大トークン | バッチサイズ |
| ------------ | ---------------------- | ------ | ------------ | ------------ |
| openai       | text-embedding-3-small | 1536   | 8191         | 100          |
| cohere       | embed-english-v3.0     | 1024   | 512          | 96           |
| voyage       | voyage-2               | 1024   | 4000         | 100          |
| local        | all-MiniLM-L6-v2       | 384    | 256          | 32           |

#### ベクトル演算ユーティリティ

**ベクトル演算**: 埋め込みベクトルの数学的操作

| 関数              | 説明                                |
| ----------------- | ----------------------------------- |
| normalizeVector   | L2正規化（単位ベクトル化）          |
| cosineSimilarity  | コサイン類似度計算（-1から1の範囲） |
| euclideanDistance | ユークリッド距離計算                |
| dotProduct        | 内積計算                            |
| vectorMagnitude   | ベクトルの大きさ（L2ノルム）計算    |

**変換ユーティリティ**: ベクトルのシリアライゼーション

| 関数               | 説明                                 |
| ------------------ | ------------------------------------ |
| vectorToBase64     | Float32ArrayをBase64文字列に変換     |
| base64ToVector     | Base64文字列をFloat32Arrayに復元     |
| estimateTokenCount | テキストのトークン数推定（日英対応） |

**バリデーション**: すべての型に対応するZodスキーマを提供し、実行時型安全性を保証。

**参照**: `docs/30-workflows/completed-tasks/rag-chunk-embedding/` - 詳細な設計・実装ドキュメント

### Knowledge Graph型定義

GraphRAGにおけるKnowledge Graph構造の型定義。Entity-Relation-Communityモデルに基づく。

**実装場所**: `packages/shared/src/types/rag/graph/`

#### 主要Entity型

| 型名            | 役割       | 説明                                  |
| --------------- | ---------- | ------------------------------------- |
| EntityEntity    | ノード     | Knowledge Graphの頂点（エンティティ） |
| RelationEntity  | エッジ     | Knowledge Graphの辺（関係性）         |
| CommunityEntity | クラスター | 意味的に関連するエンティティ群        |

#### EntityEntity型（ノード）

| プロパティ     | 型                   | 説明                         |
| -------------- | -------------------- | ---------------------------- |
| id             | EntityId             | エンティティID（UUID）       |
| name           | string               | エンティティ名               |
| normalizedName | string               | 正規化名                     |
| type           | EntityType           | エンティティタイプ（52種類） |
| embedding      | Float32Array \| null | ベクトル埋め込み             |
| importance     | number               | 重要度スコア（0.0〜1.0）     |

**エンティティタイプ**: 52種類を10カテゴリに分類（人物・組織、場所・時間、ビジネス・経営、技術全般、コード・ソフトウェア、抽象概念、ドキュメント構造、ドキュメント要素、メディア、その他）

#### RelationEntity型（エッジ）

| プロパティ | 型                 | 説明                   |
| ---------- | ------------------ | ---------------------- |
| id         | RelationId         | 関係ID（UUID）         |
| sourceId   | EntityId           | 始点エンティティID     |
| targetId   | EntityId           | 終点エンティティID     |
| type       | RelationType       | 関係タイプ（23種類）   |
| weight     | number             | 関係の強さ（0.0〜1.0） |
| evidence   | RelationEvidence[] | 証拠（必須1件以上）    |

**関係タイプ**: 23種類を6カテゴリに分類（汎用関係、時間的関係、技術的関係、階層関係、参照関係、人物関係）

**制約**: Self-loop禁止（`sourceId !== targetId`）

#### CommunityEntity型（クラスター）

| プロパティ      | 型                  | 説明                       |
| --------------- | ------------------- | -------------------------- |
| id              | CommunityId         | コミュニティID（UUID）     |
| level           | number              | 階層レベル（0=ルート）     |
| parentId        | CommunityId \| null | 親コミュニティID           |
| memberEntityIds | EntityId[]          | メンバーエンティティID配列 |
| memberCount     | number              | メンバー数                 |
| summary         | string              | コミュニティ要約           |

**階層制約**: level 0は`parentId === null`

#### ユーティリティ関数

| 関数                      | 説明                         |
| ------------------------- | ---------------------------- |
| normalizeEntityName       | エンティティ名の正規化       |
| calculateEntityImportance | 簡易PageRankによる重要度計算 |
| getInverseRelationType    | 関係の逆関係取得             |
| generateCommunityName     | コミュニティ名の自動生成     |
| calculateGraphDensity     | グラフ密度計算               |

**バリデーション**: Zodスキーマによるランタイムバリデーション（カスタム制約含む）

**テストカバレッジ**: 99.2%（230テストケース）

**詳細参照**: `specs/05-architecture.md` セクション5.6

### 検索クエリ・結果型定義

HybridRAG検索エンジンのクエリ・結果インターフェース。Keyword検索・Semantic検索・Graph検索を統合し、RRF（Reciprocal Rank Fusion）とCRAGによる高精度な検索を実現。

**実装場所**: `packages/shared/src/types/rag/search/`

#### 主要型

**SearchQuery**: ハイブリッド検索のクエリ型

| プロパティ | 型            | 説明                                     |
| ---------- | ------------- | ---------------------------------------- |
| text       | string        | 検索テキスト（1-1000文字）               |
| type       | QueryType     | クエリタイプ（local/global/hybrid等）    |
| embedding  | Float32Array  | 埋め込みベクトル（Semantic検索用）       |
| filters    | SearchFilters | 検索フィルター（ファイルID、日付範囲等） |
| options    | SearchOptions | 検索オプション（limit、戦略、重み等）    |

**SearchResult**: 統合検索結果

| プロパティ     | 型                    | 説明                                 |
| -------------- | --------------------- | ------------------------------------ |
| query          | SearchQuery           | 実行されたクエリ                     |
| results        | SearchResultItem[]    | 検索結果アイテム配列                 |
| totalCount     | number                | 総結果数                             |
| processingTime | number                | 処理時間（ミリ秒）                   |
| strategies     | SearchStrategyMetrics | 各戦略のメトリクス（実行時間、件数） |

**SearchResultItem**: 個別検索結果

| プロパティ | 型                  | 説明                                                 |
| ---------- | ------------------- | ---------------------------------------------------- |
| id         | string              | 結果アイテムID                                       |
| type       | SearchResultType    | 結果タイプ（chunk/entity/community）                 |
| score      | number              | 総合スコア（0.0-1.0）                                |
| relevance  | RelevanceScore      | 詳細スコア（keyword/semantic/graph/rerank）          |
| content    | SearchResultContent | コンテンツ（本文、要約、前後コンテキスト）           |
| highlights | Highlight[]         | ハイライト情報（マッチ箇所のオフセット）             |
| sources    | SearchResultSources | ソース情報（チャンクID、ファイルID、エンティティID） |

#### 列挙型

| 型名             | 値                                  | 用途                       |
| ---------------- | ----------------------------------- | -------------------------- |
| QueryType        | local, global, relationship, hybrid | ユーザーの検索意図分類     |
| SearchStrategy   | keyword, semantic, graph, hybrid    | 検索アルゴリズム識別       |
| SearchResultType | chunk, entity, community            | 検索結果アイテムの種類識別 |

#### 検索設定型

**SearchWeights**: 検索戦略の重み（合計1.0に制約）

| プロパティ | 型     | 説明                    |
| ---------- | ------ | ----------------------- |
| keyword    | number | Keyword検索重み（0-1）  |
| semantic   | number | Semantic検索重み（0-1） |
| graph      | number | Graph検索重み（0-1）    |

**SearchOptions**: 検索オプション

| プロパティ        | 型               | 説明                           |
| ----------------- | ---------------- | ------------------------------ |
| limit             | number           | 最大取得件数（1-100）          |
| offset            | number           | オフセット（ページネーション） |
| includeMetadata   | boolean          | メタデータを含む               |
| includeHighlights | boolean          | ハイライトを含む               |
| rerankEnabled     | boolean          | リランキング有効化             |
| cragEnabled       | boolean          | CRAG評価有効化                 |
| strategies        | SearchStrategy[] | 使用する検索戦略               |
| weights           | SearchWeights    | 各戦略の重み                   |

**CRAGScore**: CRAG（Corrective RAG）評価スコア

| プロパティ     | 型                                      | 説明                                  |
| -------------- | --------------------------------------- | ------------------------------------- |
| relevance      | "correct" \| "incorrect" \| "ambiguous" | 関連性評価                            |
| confidence     | number                                  | 信頼度（0.0-1.0）                     |
| needsWebSearch | boolean                                 | Web検索が必要か                       |
| refinedQuery   | string \| null                          | 改良されたクエリ（ambiguous時に生成） |

#### バリデーション

**Zodスキーマ**: 全25型に対応するZodスキーマを提供

- 実行時型安全性を保証
- カスタムrefineバリデーション（searchWeights合計1.0、日付範囲、ハイライトオフセット等）
- 日本語エラーメッセージ対応

**デフォルト値**:

- `DEFAULT_SEARCH_OPTIONS`: limit=20, weights={keyword:0.35, semantic:0.35, graph:0.3}
- `DEFAULT_RRF_CONFIG`: k=60, normalizeScores=true
- `DEFAULT_RERANK_CONFIG`: model="cross-encoder/ms-marco-MiniLM-L-6-v2", topK=50

#### ユーティリティ関数

| 関数               | 説明                                                        |
| ------------------ | ----------------------------------------------------------- |
| calculateRRFScore  | 複数戦略のランキングをRRFアルゴリズムで統合                 |
| normalizeScores    | スコア配列をMin-Max正規化                                   |
| deduplicateResults | 重複結果を4種の戦略で排除（max_score/sum_score/first/last） |
| expandQuery        | クエリ拡張（同義語・関連語追加）                            |
| calculateCRAGScore | CRAG評価スコア計算（correct/incorrect/ambiguous判定）       |
| mergeSearchResults | 複数ソースの検索結果をマージ・重複排除                      |
| sortByRelevance    | 関連度でソート（昇順/降順、タイブレーカー対応）             |
| filterByThreshold  | 閾値でフィルタリング                                        |

#### 型ガード

| 関数              | 説明                                  |
| ----------------- | ------------------------------------- |
| isChunkResult     | SearchResultItemがChunk結果か判定     |
| isEntityResult    | SearchResultItemがEntity結果か判定    |
| isCommunityResult | SearchResultItemがCommunity結果か判定 |

**テスト品質**: 123テストケース、96.93%カバレッジ達成（types, schemas, utils, type-inference, .claude/skills/zod-validation/SKILL.md）

**参照**: `docs/30-workflows/completed-tasks/rag-search-system/` - 詳細な設計・実装ドキュメント

### エンティティ抽出サービス (NER)

チャンクからエンティティを抽出し、Knowledge Graphのノード候補を生成するサービス。LLMベースとルールベースの2つの抽出方式を提供。

**実装場所**: `packages/shared/src/services/extraction/`

#### アーキテクチャ

```
Chunk (テキスト断片)
    │
    ↓
┌─────────────────────────────────────────────────┐
│         IEntityExtractor                         │
│  ┌─────────────────┐   ┌─────────────────┐      │
│  │ LLMEntityExtractor│   │RuleBasedExtractor│    │
│  │  (AIで抽出)     │   │ (パターンマッチ)│     │
│  └─────────────────┘   └─────────────────┘      │
└─────────────────────────────────────────────────┘
    │
    ↓
ExtractedEntity[] → (後続処理で) → EntityEntity (Knowledge Graph)
```

#### インターフェース

**IEntityExtractor**: エンティティ抽出の抽象インターフェース

| メソッド       | 説明                             |
| -------------- | -------------------------------- |
| extract()      | 単一チャンクからエンティティ抽出 |
| extractBatch() | 複数チャンクからバッチ抽出       |
| mergeEntities()| 抽出結果のマージ（重複除去）     |

**ILLMProvider**: LLM通信の抽象インターフェース（依存性注入用）

| プロパティ/メソッド | 説明                    |
| ------------------- | ----------------------- |
| modelId             | 使用モデルID            |
| generate()          | プロンプト送信・応答取得 |

#### 抽出オプション (EntityExtractionOptions)

| オプション            | 型        | デフォルト | 説明                       |
| --------------------- | --------- | ---------- | -------------------------- |
| types                 | string[]  | 全52タイプ | 抽出対象のエンティティタイプ |
| minConfidence         | number    | 0.5        | 最小信頼度閾値             |
| maxEntitiesPerChunk   | number    | 20         | チャンクあたり最大抽出数   |
| minNameLength         | number    | 2          | 最小名前長                 |
| generateDescriptions  | boolean   | true       | 説明生成（LLMのみ）        |
| useLLM                | boolean   | true       | LLM使用フラグ              |

#### 抽出結果型 (ExtractedEntity)

| プロパティ     | 型         | 説明                       |
| -------------- | ---------- | -------------------------- |
| name           | string     | エンティティ名（原形）     |
| normalizedName | string     | 正規化名（小文字・空白正規化）|
| type           | EntityType | エンティティタイプ（52種類）|
| confidence     | number     | 信頼度スコア（0.0〜1.0）   |
| description    | string?    | 説明文（LLM生成時のみ）    |
| aliases        | string[]   | 別名・エイリアス           |
| mentions       | Mention[]  | テキスト内出現情報         |

#### Mention型（出現情報）

| プロパティ     | 型     | 説明                           |
| -------------- | ------ | ------------------------------ |
| chunkId        | string | 出現チャンクID                 |
| startPosition  | number | 開始位置（文字オフセット）     |
| endPosition    | number | 終了位置（文字オフセット）     |
| context        | string | 前後コンテキスト（最大200文字）|

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

| カテゴリ   | 検出例                                | 信頼度 |
| ---------- | ------------------------------------- | ------ |
| 技術名     | TypeScript, React, PostgreSQL, Docker | 0.85-0.9 |
| 組織名     | Google, Microsoft, OpenAI             | 0.9    |
| 日付       | 2024-01-15, 2024年1月15日, 2024/01/15 | 0.9-0.95 |

#### エラー型

| エラークラス       | 説明                     |
| ------------------ | ------------------------ |
| LLMProviderError   | LLM API呼び出し失敗      |
| JsonParseError     | LLMレスポンスのJSON不正  |

#### ユーティリティ関数

| 関数              | 説明                           |
| ----------------- | ------------------------------ |
| normalizeEntityName | 名前正規化（小文字・空白処理）|
| escapeRegex       | 正規表現特殊文字エスケープ     |
| mergeOptions      | オプションとデフォルトのマージ |
| findMentionsInText | テキスト内出現位置検出         |
| deduplicateEntities | 重複エンティティのマージ     |

**テスト品質**: 69テストケース、97.78%カバレッジ達成

**参照**: `docs/30-workflows/entity-extraction-ner/outputs/phase-10/implementation-guide.md` - 詳細な設計・実装ドキュメント

---
