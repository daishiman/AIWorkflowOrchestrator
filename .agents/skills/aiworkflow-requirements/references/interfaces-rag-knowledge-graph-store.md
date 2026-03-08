# Knowledge Graph Store インターフェース仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: .claude/skills/aiworkflow-requirements/references/

---

## 概要

### 目的

Knowledge Graph StoreはRAGパイプラインにおけるナレッジグラフ（知識グラフ）の永続化と操作を担当するリポジトリ層。エンティティ（ノード）と関係（エッジ）のCRUD操作、グラフ探索機能を提供する。

### スコープ

| スコープ内                   | スコープ外                     |
| --------------------------- | ------------------------------ |
| Entity/Relation CRUD        | エンティティ抽出（NER）        |
| グラフ探索（BFS、最短経路）  | 関係抽出（Relation Extraction）|
| バッチ操作                   | コミュニティ検出               |
| 統計情報取得                 | ベクトル類似検索（将来対応）   |

---

## 要件

### 機能要件

| ID     | 要件                       | 優先度 | 説明                                               |
| ------ | -------------------------- | ------ | -------------------------------------------------- |
| FR-001 | Entity CRUD                | 必須   | エンティティの作成・取得・更新・削除               |
| FR-002 | Relation CRUD              | 必須   | 関係の作成・取得・削除（証拠情報付き）             |
| FR-003 | グラフ探索                 | 必須   | BFSトラバーサル、最短経路探索                       |
| FR-004 | バッチ操作                 | 必須   | 複数エンティティ・関係の一括操作                    |
| FR-005 | 統計情報取得               | 推奨   | エンティティ数、関係数などのグラフ統計              |
| FR-006 | 類似エンティティ検索       | 推奨   | ベクトル埋め込みによる類似検索（DiskANN統合後）     |

### 非機能要件

| 項目           | 要件                     | 基準                     |
| -------------- | ------------------------ | ------------------------ |
| パフォーマンス | バッチ操作の効率性       | 1000件/秒以上            |
| データ整合性   | 参照整合性の維持         | CASCADE削除対応          |
| 型安全性       | Branded Types使用        | EntityId, RelationId等   |
| エラー処理     | Result型パターン         | ok/err による明示的処理  |

---

## 設計

### アーキテクチャ

**実装場所**: `packages/shared/src/services/graph/knowledge-graph-store.ts`

#### レイヤー構成

| レイヤー | 役割 | 主要コンポーネント |
|---------|------|-------------------|
| Application Layer | 上位アプリケーション | エンティティ抽出、関係抽出、RAGパイプライン |
| Interface Layer | 抽象化インターフェース | IKnowledgeGraphStore |
| Implementation Layer | 具象実装 | SQLiteKnowledgeGraphStore |
| Persistence Layer | データ永続化 | SQLite Database |

#### IKnowledgeGraphStore インターフェースメソッド群

| カテゴリ | メソッド |
|---------|---------|
| Entity操作 | addEntity, getEntity, updateEntity, deleteEntity |
| Relation操作 | addRelation, getRelation, deleteRelation |
| グラフ探索 | traverse, findShortestPath, getNeighbors |
| バッチ操作 | bulkUpsertEntities, bulkAddRelations |

#### SQLiteKnowledgeGraphStore 実装詳細

- Drizzle ORMによるデータベース操作
- Result<T, Error>パターンによる明示的エラー処理

#### データベーステーブル構成

| テーブル名 | 用途 |
|-----------|------|
| entities | エンティティ（ノード）の永続化 |
| relations | 関係（エッジ）の永続化 |
| relation_evidence | 関係の根拠情報 |
| chunk_entity_relations | チャンクとエンティティ・関係のマッピング |

### データ構造

#### StoredEntity（永続化エンティティ）

| フィールド名    | 型         | 必須 | 説明                           |
| --------------- | ---------- | ---- | ------------------------------ |
| id              | EntityId   | ✅   | 一意識別子（Branded Type）     |
| name            | string     | ✅   | エンティティ名                 |
| normalizedName  | string     | ✅   | 正規化名（検索用）             |
| type            | EntityType | ✅   | エンティティタイプ（52種類）   |
| description     | string?    | -    | 説明文                         |
| aliases         | string[]   | ✅   | 別名リスト                     |
| confidence      | number     | ✅   | 信頼度スコア（0.0〜1.0）       |
| mentionCount    | number     | ✅   | 出現回数                       |
| importance      | number     | ✅   | 重要度スコア（0.0〜1.0）       |
| embedding       | number[]?  | -    | 埋め込みベクトル（384次元）    |
| createdAt       | Date       | ✅   | 作成日時                       |
| updatedAt       | Date       | ✅   | 更新日時                       |

#### StoredRelation（永続化関係）

| フィールド名    | 型             | 必須 | 説明                           |
| --------------- | -------------- | ---- | ------------------------------ |
| id              | RelationId     | ✅   | 一意識別子（Branded Type）     |
| sourceEntityId  | EntityId       | ✅   | 起点エンティティID             |
| targetEntityId  | EntityId       | ✅   | 終点エンティティID             |
| relationType    | RelationType   | ✅   | 関係タイプ（15種類）           |
| description     | string?        | -    | 関係の説明文                   |
| confidence      | number         | ✅   | 信頼度スコア（0.0〜1.0）       |
| bidirectional   | boolean        | ✅   | 双方向関係フラグ               |
| evidence        | RelationEvidence[] | ✅ | 根拠情報（1件以上必須）        |
| createdAt       | Date           | ✅   | 作成日時                       |

### 処理フロー

#### エンティティ追加フロー

- ステップ1: 名前正規化（小文字化・空白正規化）
- ステップ2: 既存エンティティの検索（normalizedNameで重複チェック）
- ステップ3: 重複時はマージ（mentionCount加算、aliases統合）
- ステップ4: 新規時は INSERT、重複時は UPDATE

#### 関係追加フロー

- ステップ1: 起点・終点エンティティの存在確認
- ステップ2: 自己ループ（source == target）の禁止チェック
- ステップ3: 証拠情報の必須チェック（1件以上）
- ステップ4: 既存関係の検索（同一ペア・同一タイプ）
- ステップ5: 重複時は証拠を追加、新規時は INSERT

---

## インターフェース定義

### IKnowledgeGraphStore

| メソッド                    | 戻り値                                           | 説明                               |
| --------------------------- | ------------------------------------------------ | ---------------------------------- |
| addEntity(entity)           | Result<StoredEntity, Error>                      | エンティティ追加（upsert）         |
| getEntity(id)               | Result<StoredEntity \| null, Error>              | IDでエンティティ取得               |
| getEntityByName(name)       | Result<StoredEntity \| null, Error>              | 名前でエンティティ取得             |
| updateEntity(id, updates)   | Result<StoredEntity, Error>                      | エンティティ更新                   |
| deleteEntity(id)            | Result<void, Error>                              | エンティティ削除（CASCADE）        |
| searchEntities(query)       | Result<StoredEntity[], Error>                    | 条件検索                           |
| addRelation(relation)       | Result<StoredRelation, Error>                    | 関係追加（証拠必須）               |
| getRelation(id)             | Result<StoredRelation \| null, Error>            | IDで関係取得                       |
| deleteRelation(id)          | Result<void, Error>                              | 関係削除                           |
| getRelationsByEntity(id)    | Result<StoredRelation[], Error>                  | エンティティの全関係取得           |
| traverse(startId, options)  | Result<TraversalResult, Error>                   | BFSトラバーサル                    |
| findShortestPath(from, to)  | Result<EntityId[] \| null, Error>                | 最短経路探索                       |
| getNeighbors(id, depth)     | Result<StoredEntity[], Error>                    | 隣接ノード取得                     |
| bulkUpsertEntities(entities)| Result<StoredEntity[], Error>                    | バッチエンティティ追加             |
| bulkAddRelations(relations) | Result<StoredRelation[], Error>                  | バッチ関係追加                     |
| getStats()                  | Result<GraphStats, Error>                        | グラフ統計取得                     |

### ファクトリ関数

ストアインスタンスの生成には `createKnowledgeGraphStore` ファクトリ関数を使用する。

| 項目 | 値 |
|------|-----|
| インポート元 | @repo/shared/services/graph |
| 関数名 | createKnowledgeGraphStore |
| 引数 | db（Drizzle ORMデータベースインスタンス） |
| 戻り値 | IKnowledgeGraphStore実装インスタンス |

**基本的な使用手順**:

1. createKnowledgeGraphStoreにデータベースインスタンスを渡してストアを生成
2. ストアのメソッド（例: addEntity）を呼び出し
3. 戻り値のResult型をisOk()でチェックし、成功時はvalueプロパティで結果を取得

---

## エラー型

| エラークラス          | 説明                                 |
| --------------------- | ------------------------------------ |
| EntityNotFoundError   | 指定エンティティが存在しない         |
| SelfLoopError         | 自己参照関係の作成試行               |
| EvidenceRequiredError | 証拠なしでの関係作成試行             |
| DatabaseError         | データベース操作エラー               |

---

## 実装ガイドライン

### コーディング規約

| 項目           | 規約                        | 理由                               |
| -------------- | --------------------------- | ---------------------------------- |
| エラー処理     | Result<T, Error>パターン    | 明示的なエラーハンドリング         |
| ID型           | Branded Types使用           | コンパイル時の型安全性確保         |
| 名前正規化     | normalizeEntityName()使用   | 検索精度と重複検出の向上           |
| 埋め込み       | Buffer形式で永続化          | SQLiteバイナリ効率化               |

### テスト要件

| テスト種別 | 対象                       | カバレッジ目標 | 必須ケース                     |
| ---------- | -------------------------- | -------------- | ------------------------------ |
| 単体テスト | 各メソッド                 | 80%+           | 正常系、異常系、境界値         |
| 結合テスト | グラフ操作フロー           | -              | BFS、最短経路、バッチ          |

**達成済みカバレッジ**: Line 87.96%, Branch 77.77%, Function 100%

---

## 実装ステータス

### 実装完了機能（2026-01-13）

| 機能カテゴリ | メソッド | 状態 | 備考 |
|-------------|---------|------|------|
| Entity CRUD | upsertEntity | ✅ 完了 | 名前正規化・重複マージ対応 |
| Entity CRUD | getEntity | ✅ 完了 | IDベース検索 |
| Entity CRUD | getEntityByName | ✅ 完了 | 正規化名で検索 |
| Entity CRUD | findEntities | ✅ 完了 | 条件検索（type, minConfidence等） |
| Entity CRUD | deleteEntity | ✅ 完了 | CASCADE削除対応 |
| Relation CRUD | addRelation | ✅ 完了 | 証拠必須・重複時証拠追加 |
| Relation CRUD | getRelation | ✅ 完了 | Evidence JOIN |
| Relation CRUD | getRelations | ✅ 完了 | エンティティID検索 |
| Relation CRUD | findRelations | ✅ 完了 | 条件検索 |
| Relation CRUD | deleteRelation | ✅ 完了 | Evidence CASCADE |
| グラフ探索 | traverse | ✅ 完了 | BFSアルゴリズム |
| グラフ探索 | findShortestPath | ✅ 完了 | 双方向BFS |
| グラフ探索 | getNeighbors | ✅ 完了 | 深さ指定可 |
| バッチ操作 | bulkUpsertEntities | ✅ 完了 | 逐次処理 |
| バッチ操作 | bulkAddRelations | ✅ 完了 | 逐次処理 |
| 統計 | getStats | ✅ 完了 | COUNT集計 |
| 類似検索 | findSimilarEntities | ⚠️ スタブ | DiskANN統合後に実装 |

### 使用例

#### ストア初期化

@repo/shared/services/graphからcreateKnowledgeGraphStoreを、@repo/shared/dbからデータベースインスタンスをインポートし、ストアを生成する。

#### Entity追加（upsert操作）

upsertEntityメソッドにエンティティ情報を渡してエンティティを追加する。

| パラメータ | 値の例 | 説明 |
|-----------|--------|------|
| name | "TypeScript" | エンティティ名 |
| type | "programming_language" | エンティティタイプ（52種類から選択） |
| description | "JavaScript with types" | 説明文（省略可） |
| confidence | 0.95 | 信頼度スコア（0.0〜1.0） |

戻り値はResult型。isOk()がtrueの場合、value.idで作成されたエンティティIDを取得可能。

#### Relation追加（証拠必須）

addRelationメソッドで関係を追加する。evidence配列は必須（1件以上）。

| パラメータ | 値の例 | 説明 |
|-----------|--------|------|
| sourceEntityId | entity1.id | 起点エンティティID |
| targetEntityId | entity2.id | 終点エンティティID |
| relationType | "uses" | 関係タイプ（15種類から選択） |
| confidence | 0.9 | 信頼度スコア |
| evidence | 配列（下記参照） | 根拠情報（1件以上必須） |

**evidence配列の各要素**:

| フィールド | 値の例 | 説明 |
|-----------|--------|------|
| chunkId | "chunk-123" (ChunkId型) | 根拠となるチャンクID |
| text | "TypeScript uses JavaScript runtime" | 根拠テキスト |
| confidence | 0.9 | この根拠の信頼度 |

#### グラフ探索（BFSトラバーサル）

traverseメソッドで幅優先探索を実行する。

| オプション | 値の例 | 説明 |
|-----------|--------|------|
| maxDepth | 3 | 最大探索深度 |
| direction | "outgoing" | 探索方向（outgoing/incoming/both） |
| relationTypes | ["uses", "depends_on"] | フィルタする関係タイプ（省略時は全タイプ） |

#### 最短経路探索

findShortestPathメソッドで2つのエンティティ間の最短経路を探索する。引数は起点エンティティIDと終点エンティティID。戻り値のResult型がisOk()かつvalueがnullでない場合、EntityId配列として経路が取得可能（例: entityA → entityB → entityC の順序で格納）。

---

## 関連ドキュメント

| ドキュメント                | 説明                                 |
| --------------------------- | ------------------------------------ |
| interfaces-rag.md           | RAG全体インターフェース仕様          |
| database-schema.md          | データベーススキーマ定義             |
| architecture-rag.md         | RAGアーキテクチャ設計                |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| 2026-01-09 | 1.0.0      | 初版作成（CONV-08-01タスク完了に伴い）         |
| 2026-01-13 | 1.1.0      | 実装ステータス・使用例セクション追加、カバレッジ86.98%達成 |
| 2026-01-26 | 1.2.0      | spec-guidelines.md準拠: コードブロックを表形式・文章に変換 |
