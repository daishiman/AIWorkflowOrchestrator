# 要件定義書 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容                       |
| -------------- | -------------------------- |
| プロジェクト名 | Knowledge Graph ストア実装 |
| タスクID       | CONV-08-01                 |
| 文書バージョン | 1.0.0                      |
| 作成日         | 2026-01-09                 |
| 最終更新日     | 2026-01-09                 |
| 作成者         | Claude                     |

## 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |

---

## 1. 概要

### 1.1 目的

GraphRAGアーキテクチャにおいて、エンティティ抽出サービス（CONV-06-04）および関係抽出サービス（CONV-06-05）で抽出されたデータを永続化し、効率的なグラフトラバーサル・検索機能を提供する**Knowledge Graphストア**を実装する。

### 1.2 背景

現在の問題点:

- 抽出されたエンティティ・関係データがセッション間で保持されない
- グラフ構造に基づいた検索・トラバーサルができない
- 埋め込みベースの類似エンティティ検索が実装されていない
- グラフ統計の取得・分析ができない

この問題を放置した場合の影響:

- GraphRAG機能が動作しない（致命的）
- コミュニティ検出が実行不可
- グラフベースの質問応答が不可

### 1.3 用語定義

| 用語              | 定義                                                         |
| ----------------- | ------------------------------------------------------------ |
| Entity            | Knowledge Graphのノード（頂点）。人物、組織、概念などを表現  |
| Relation          | Knowledge Graphのエッジ（辺）。エンティティ間の関係を表現    |
| Traversal         | グラフ上を辿って関連エンティティを探索する操作               |
| BFS               | 幅優先探索。グラフトラバーサルのアルゴリズム                 |
| DiskANN           | libSQLのベクトル検索インデックス。高速な近似最近傍探索を提供 |
| StoredEntity      | 永続化されたエンティティ。メタデータと埋め込みを含む         |
| StoredRelation    | 永続化された関係。証拠情報と重みを含む                       |
| ExtractedEntity   | 抽出サービスから出力されたエンティティ                       |
| ExtractedRelation | 抽出サービスから出力された関係                               |

---

## 2. ステークホルダー

### 2.1 ステークホルダー一覧

| ステークホルダー         | 役割       | 関心事                           |
| ------------------------ | ---------- | -------------------------------- |
| RAGパイプライン          | 主要利用者 | エンティティ・関係の永続化と検索 |
| コミュニティ検出サービス | 利用者     | グラフトラバーサル機能           |
| 質問応答サービス         | 利用者     | 類似エンティティ検索、関係検索   |
| 開発者                   | 実装・保守 | APIの使いやすさ、テスト容易性    |

### 2.2 ユーザー分類

| ユーザータイプ | 説明                                   | 技術レベル |
| -------------- | -------------------------------------- | ---------- |
| 内部サービス   | RAGパイプラインの他コンポーネント      | 高         |
| 開発者         | ストアを使用するアプリケーション開発者 | 中〜高     |

---

## 3. 機能要件

### 3.1 機能要件一覧

| ID     | 要件名                   | 優先度 | ステータス |
| ------ | ------------------------ | ------ | ---------- |
| FR-001 | エンティティのUpsert     | Must   | Draft      |
| FR-002 | エンティティの取得       | Must   | Draft      |
| FR-003 | エンティティの検索       | Must   | Draft      |
| FR-004 | 類似エンティティ検索     | Must   | Draft      |
| FR-005 | エンティティの削除       | Must   | Draft      |
| FR-006 | 関係の追加               | Must   | Draft      |
| FR-007 | 関係の取得               | Must   | Draft      |
| FR-008 | 関係の検索               | Should | Draft      |
| FR-009 | 関係の削除               | Must   | Draft      |
| FR-010 | グラフトラバーサル       | Must   | Draft      |
| FR-011 | 最短パス検索             | Should | Draft      |
| FR-012 | 隣接ノード取得           | Must   | Draft      |
| FR-013 | グラフ統計取得           | Should | Draft      |
| FR-014 | バッチエンティティUpsert | Must   | Draft      |
| FR-015 | バッチ関係追加           | Must   | Draft      |

### 3.2 機能要件詳細

#### FR-001: エンティティのUpsert

**概要**: 抽出されたエンティティを永続化し、既存エンティティとマージする

**アクター**: RAGパイプライン、抽出サービス

**前提条件**:

- ExtractedEntity型のデータが提供される
- データベース接続が確立されている

**トリガー**: upsertEntity()メソッドの呼び出し

**基本フロー**:

1. ExtractedEntityを受け取る
2. normalizedNameで既存エンティティを検索
3. 存在する場合: マージ処理（mentionCount増加、aliases統合、chunkIds追加）
4. 存在しない場合: 新規エンティティとして挿入
5. StoredEntityを返却

**事後条件**:

- エンティティがデータベースに永続化されている
- 重複エンティティは適切にマージされている

**ビジネスルール**:

- normalizedNameは一意である必要がある
- マージ時はmentionCountを累積する
- 埋め込みは最新のものを使用する

**優先度**: Must
**関連要件**: FR-014

---

#### FR-002: エンティティの取得

**概要**: IDまたは正規化名でエンティティを取得する

**アクター**: 各種サービス

**前提条件**:

- 有効なEntityIdまたはnormalizedNameが提供される

**トリガー**: getEntity()またはgetEntityByName()メソッドの呼び出し

**基本フロー**:

1. IDまたは正規化名を受け取る
2. データベースから該当エンティティを検索
3. 見つかった場合はStoredEntityを返却
4. 見つからない場合はnullを返却

**事後条件**:

- 該当エンティティが存在すれば返却される

**優先度**: Must
**関連要件**: FR-001

---

#### FR-003: エンティティの検索

**概要**: 複合条件でエンティティを検索する

**アクター**: 質問応答サービス、UI

**前提条件**:

- EntityQuery型の検索条件が提供される

**トリガー**: findEntities()メソッドの呼び出し

**基本フロー**:

1. 検索条件（types、namePattern、minMentionCount、chunkIds等）を受け取る
2. 条件に基づいてSQLクエリを構築
3. ページネーション（limit/offset）を適用
4. 検索結果を返却

**事後条件**:

- 条件に一致するエンティティのリストが返却される

**優先度**: Must
**関連要件**: FR-001

---

#### FR-004: 類似エンティティ検索

**概要**: 埋め込みベクトルを使用して類似エンティティを検索する

**アクター**: 質問応答サービス、重複検出

**前提条件**:

- 検索用の埋め込みベクトルが提供される
- DiskANNインデックスが構築されている

**トリガー**: findSimilarEntities()メソッドの呼び出し

**基本フロー**:

1. 埋め込みベクトル、limit、threshold（オプション）を受け取る
2. DiskANN検索を実行
3. 類似度でソートされた結果を返却

**事後条件**:

- 類似度スコアが閾値以上のエンティティが返却される

**ビジネスルール**:

- デフォルトの類似度閾値は0.5
- 結果は類似度の降順でソートされる

**優先度**: Must
**関連要件**: FR-003

---

#### FR-006: 関係の追加

**概要**: エンティティ間の関係を追加し、既存関係とマージする

**アクター**: 関係抽出サービス

**前提条件**:

- ExtractedRelation型のデータが提供される
- sourceとtargetのエンティティが存在する

**トリガー**: addRelation()メソッドの呼び出し

**基本フロー**:

1. ExtractedRelationを受け取る
2. 同一のsource/target/typeを持つ関係を検索
3. 存在する場合: weightを累積し、evidenceを追加
4. 存在しない場合: 新規関係として挿入
5. StoredRelationを返却

**事後条件**:

- 関係がデータベースに永続化されている
- 重複関係は重みが累積されている

**ビジネスルール**:

- Self-loop（sourceId === targetId）は禁止
- 少なくとも1つのevidenceが必要

**優先度**: Must
**関連要件**: FR-015

---

#### FR-010: グラフトラバーサル

**概要**: 指定したエンティティからグラフをトラバースする

**アクター**: コミュニティ検出サービス、質問応答

**前提条件**:

- 有効な開始エンティティIDが提供される
- TraversalOptions型のオプションが提供される

**トリガー**: traverse()メソッドの呼び出し

**基本フロー**:

1. 開始エンティティIDとオプション（maxDepth、relationTypes、direction等）を受け取る
2. BFSアルゴリズムでグラフを探索
3. 訪問したエンティティと経路を記録
4. GraphTraversalResultを返却

**事後条件**:

- 到達可能なエンティティと経路情報が返却される

**ビジネスルール**:

- maxDepthを超えた探索は行わない
- maxNodesを超えた場合は探索を打ち切る

**優先度**: Must
**関連要件**: FR-011, FR-012

---

#### FR-011: 最短パス検索

**概要**: 2つのエンティティ間の最短パスを検索する

**アクター**: 質問応答サービス

**前提条件**:

- 有効なソースとターゲットのエンティティIDが提供される

**トリガー**: findShortestPath()メソッドの呼び出し

**基本フロー**:

1. ソースID、ターゲットID、maxDepth（オプション）を受け取る
2. 双方向BFSで最短パスを探索
3. パスが見つかった場合はGraphPathを返却
4. 見つからない場合はnullを返却

**事後条件**:

- 最短パスが存在すれば返却される

**優先度**: Should
**関連要件**: FR-010

---

#### FR-013: グラフ統計取得

**概要**: Knowledge Graphの統計情報を取得する

**アクター**: 管理者、分析サービス

**前提条件**:

- データベース接続が確立されている

**トリガー**: getStats()メソッドの呼び出し

**基本フロー**:

1. 統計クエリを実行
2. GraphStats（entityCount、relationCount、各種分布等）を返却

**事後条件**:

- 現在のグラフ状態の統計が返却される

**優先度**: Should

---

## 4. 非機能要件

### 4.1 非機能要件一覧

| ID      | カテゴリ         | 要件名               | 優先度 |
| ------- | ---------------- | -------------------- | ------ |
| NFR-001 | パフォーマンス   | クエリ応答時間       | High   |
| NFR-002 | パフォーマンス   | バッチ処理効率       | High   |
| NFR-003 | スケーラビリティ | 大規模グラフ対応     | Medium |
| NFR-004 | 信頼性           | トランザクション保証 | High   |
| NFR-005 | 保守性           | テストカバレッジ     | High   |
| NFR-006 | 型安全性         | TypeScript型定義     | High   |

### 4.2 パフォーマンス要件

#### NFR-001: クエリ応答時間

**指標**: 単一エンティティ取得の応答時間
**目標値**: 50ms以内（95パーセンタイル）
**測定方法**: ユニットテストでの計測
**重要度**: High
**根拠**: RAGパイプラインのレイテンシ要件

#### NFR-002: バッチ処理効率

**指標**: 1000件のバッチ挿入時間
**目標値**: 5秒以内
**測定方法**: 統合テストでの計測
**重要度**: High
**根拠**: ドキュメント処理のスループット確保

### 4.3 スケーラビリティ要件

#### NFR-003: 大規模グラフ対応

**指標**: 対応可能なエンティティ数
**目標値**: 100万エンティティ、1000万関係
**測定方法**: ロードテスト
**重要度**: Medium
**根拠**: 大規模ドキュメントコーパスへの対応

### 4.4 信頼性要件

#### NFR-004: トランザクション保証

**指標**: ACID特性の準拠
**目標値**: 全てのバッチ操作がアトミック
**測定方法**: 障害注入テスト
**重要度**: High
**根拠**: データ整合性の確保

### 4.5 保守性要件

#### NFR-005: テストカバレッジ

**指標**: コードカバレッジ
**目標値**: Line 80%+、Branch 60%+、Function 80%+
**測定方法**: Vitest coverage
**重要度**: High
**根拠**: 品質保証と回帰防止

### 4.6 型安全性要件

#### NFR-006: TypeScript型定義

**指標**: 型エラー数
**目標値**: 0件
**測定方法**: tsc --noEmit
**重要度**: High
**根拠**: 開発時エラー検出の強化

---

## 5. 制約条件

### 5.1 技術的制約

- SQLite/Turso (libSQL) をデータストアとして使用
- Drizzle ORMを使用してデータアクセス
- DiskANNインデックスを使用したベクトル検索
- TypeScriptで実装

### 5.2 依存制約

- CONV-04-05（Knowledge Graphテーブル）が完了していること
- entities, graph_relationsテーブルが存在すること
- ベクトルインデックスが利用可能であること

### 5.3 運用制約

- オフライン動作をサポート（Embedded Replicas）
- Last-Write-Winsによるコンフリクト解決

---

## 6. 前提条件

- Drizzle ORMのセットアップが完了している
- sqlite-vecまたはlibSQLのベクトル機能が利用可能
- EntityId, RelationId等のBranded Typeが定義済み
- ExtractedEntity, ExtractedRelation型が定義済み

---

## 7. 依存関係

### 7.1 外部システム依存

| システム     | 依存内容         | リスク                   |
| ------------ | ---------------- | ------------------------ |
| SQLite/Turso | データ永続化     | 低（標準技術）           |
| DiskANN      | ベクトル検索     | 中（libSQL固有機能）     |
| Drizzle ORM  | データアクセス層 | 低（安定したライブラリ） |

### 7.2 要件間依存

```
FR-001 → FR-014（バッチはupsertを利用）
FR-006 → FR-015（バッチはaddを利用）
FR-010 → FR-011, FR-012（トラバーサル基盤）
FR-003 → FR-004（検索インフラ共有）
```

---

## 8. 接続要件（統合テスト連携）

### 8.1 DBアクセス要件

| 項目         | 仕様                                      |
| ------------ | ----------------------------------------- |
| データベース | SQLite/Turso (libSQL)                     |
| 対象テーブル | entities, graph_relations, chunk_entities |
| アクセス方式 | Drizzle ORM経由                           |

### 8.2 リポジトリ連携

| リポジトリ      | 操作                           |
| --------------- | ------------------------------ |
| entities        | SELECT, INSERT, UPDATE, DELETE |
| graph_relations | SELECT, INSERT, UPDATE, DELETE |
| chunk_entities  | SELECT, INSERT                 |

### 8.3 ベクトル検索

| 項目         | 仕様                                    |
| ------------ | --------------------------------------- |
| インデックス | DiskANN (libSQL vector index)           |
| メトリクス   | cosine distance                         |
| 次元数       | 512/768/1024/1536（埋め込みモデル依存） |

---

## 9. 承認

| 役割       | 氏名 | 日付 | 署名 |
| ---------- | ---- | ---- | ---- |
| 技術リード |      |      |      |

---

## 付録

### A. インターフェース定義

```typescript
interface IKnowledgeGraphStore {
  // エンティティ操作
  upsertEntity(entity: ExtractedEntity): Promise<Result<StoredEntity, Error>>;
  getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>>;
  getEntityByName(
    normalizedName: string,
  ): Promise<Result<StoredEntity | null, Error>>;
  findEntities(query: EntityQuery): Promise<Result<StoredEntity[], Error>>;
  findSimilarEntities(
    embedding: number[],
    limit: number,
    threshold?: number,
  ): Promise<Result<StoredEntity[], Error>>;
  deleteEntity(id: EntityId): Promise<Result<void, Error>>;

  // 関係操作
  addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>>;
  getRelation(id: RelationId): Promise<Result<StoredRelation | null, Error>>;
  getRelations(
    entityId: EntityId,
    options?: RelationQueryOptions,
  ): Promise<Result<StoredRelation[], Error>>;
  findRelations(
    sourceHint: string,
    targetHint: string,
    relationHint?: string,
  ): Promise<Result<StoredRelation[], Error>>;
  deleteRelation(id: RelationId): Promise<Result<void, Error>>;

  // グラフトラバーサル
  traverse(
    startEntityId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, Error>>;
  findShortestPath(
    sourceId: EntityId,
    targetId: EntityId,
    maxDepth?: number,
  ): Promise<Result<GraphPath | null, Error>>;
  getNeighbors(
    entityId: EntityId,
    depth?: number,
  ): Promise<Result<GraphNode[], Error>>;

  // グラフ統計
  getStats(): Promise<Result<GraphStats, Error>>;

  // バッチ操作
  bulkUpsertEntities(
    entities: ExtractedEntity[],
  ): Promise<Result<StoredEntity[], Error>>;
  bulkAddRelations(
    relations: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], Error>>;
}
```

### B. データモデル

参照: `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`
