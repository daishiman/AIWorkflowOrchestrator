# Knowledge Graph Store アーキテクチャ設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 2                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. アーキテクチャ概要

### 1.1 レイヤー構造

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Application Layer                                │
│   (RAGパイプライン、エンティティ抽出、関係抽出、コミュニティ検出)         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    IKnowledgeGraphStore Interface                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Entity Operations:                                              │   │
│  │  - upsertEntity / getEntity / getEntityByName / findEntities     │   │
│  │  - findSimilarEntities / deleteEntity / bulkUpsertEntities       │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Relation Operations:                                            │   │
│  │  - addRelation / getRelation / getRelations / findRelations      │   │
│  │  - deleteRelation / bulkAddRelations                             │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Graph Traversal:                                                │   │
│  │  - traverse / findShortestPath / getNeighbors                    │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Statistics:                                                     │   │
│  │  - getStats                                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SQLiteKnowledgeGraphStore 実装                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       Drizzle ORM Layer                          │   │
│  │  - entities テーブル操作                                         │   │
│  │  - graphRelations テーブル操作                                   │   │
│  │  - relationEvidence テーブル操作                                 │   │
│  │  - chunkEntities テーブル操作                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Result<T, Error> Pattern                     │   │
│  │  - 全メソッドがResult型を返却                                    │   │
│  │  - 明示的なエラーハンドリング                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SQLite Database                                 │
│  ┌───────────────┬───────────────┬───────────────┬─────────────────┐   │
│  │   entities    │   relations   │  communities  │ relation_evid.  │   │
│  │  (ノード)     │   (エッジ)    │  (クラスター) │   (証拠)        │   │
│  └───────────────┴───────────────┴───────────────┴─────────────────┘   │
│  ┌───────────────┬───────────────┐                                     │
│  │entity_commun. │chunk_entities │                                     │
│  │  (中間テーブル)│  (中間テーブル)│                                     │
│  └───────────────┴───────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 コンポーネント構成

```
packages/shared/src/services/graph/
├── knowledge-graph-store.ts    # メインStore実装 (IKnowledgeGraphStore)
├── types.ts                    # 型定義 (StoredEntity, StoredRelation等)
├── errors.ts                   # エラー型定義
├── community-detector.ts       # コミュニティ検出 (Leidenアルゴリズム)
├── community-summarizer.ts     # コミュニティ要約生成
├── leiden-algorithm.ts         # Leidenアルゴリズム実装
├── interfaces/
│   ├── community-detector.interface.ts
│   ├── community-repository.interface.ts
│   └── community-summarizer.interface.ts
├── prompts/
│   └── community-summary-prompt.ts
└── __tests__/
    ├── knowledge-graph-store.test.ts
    ├── errors.test.ts
    ├── community-detector.test.ts
    └── leiden-algorithm.test.ts
```

---

## 2. 設計パターン

### 2.1 Repository Pattern

Knowledge Graph Storeは**Repositoryパターン**を採用。

| 特徴           | 説明                                                       |
| -------------- | ---------------------------------------------------------- |
| 抽象化         | `IKnowledgeGraphStore`インターフェースによるDB操作の抽象化 |
| 実装分離       | `SQLiteKnowledgeGraphStore`による具象実装                  |
| テスタビリティ | インターフェース経由でモック可能                           |

### 2.2 Result Pattern

全API操作は**Result型パターン**を返却。

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

| 利点         | 説明                                           |
| ------------ | ---------------------------------------------- |
| 明示的エラー | 例外ではなく戻り値でエラーを表現               |
| 型安全       | TypeScriptの型システムでエラー処理を強制       |
| 予測可能     | 呼び出し側でエラーケースを明示的にハンドリング |

### 2.3 Branded Types

ID型に**Branded Types**を採用。

```typescript
type EntityId = string & { readonly __brand: "EntityId" };
type RelationId = string & { readonly __brand: "RelationId" };
type CommunityId = string & { readonly __brand: "CommunityId" };
```

| 利点                     | 説明                                     |
| ------------------------ | ---------------------------------------- |
| コンパイル時安全         | 異なるID型の混同をコンパイルエラーで検出 |
| 実行時オーバーヘッドなし | ランタイムではstring                     |
| IDE補完                  | 型情報がIDE補完に反映                    |

### 2.4 Factory Pattern

Storeインスタンス生成に**Factoryパターン**を採用。

```typescript
function createKnowledgeGraphStore(db: Database): IKnowledgeGraphStore {
  return new SQLiteKnowledgeGraphStore(db);
}
```

---

## 3. データフロー

### 3.1 エンティティ追加フロー

```
ExtractedEntity
      │
      ▼
┌─────────────────┐
│ 名前正規化       │  normalizeEntityName()
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 重複チェック     │  SELECT by normalizedName + type
└─────────────────┘
      │
      ├── 重複あり ──▶ UPDATE (mentionCount++, aliases merge)
      │
      └── 重複なし ──▶ INSERT (新規エンティティ)
      │
      ▼
┌─────────────────┐
│ チャンク関連付け │  chunk_entities INSERT/UPDATE
└─────────────────┘
      │
      ▼
StoredEntity (Result.ok)
```

### 3.2 関係追加フロー

```
ExtractedRelation
      │
      ▼
┌─────────────────┐
│ 証拠検証        │  evidence必須チェック
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ エンティティ解決 │  source/target名からID取得
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 自己ループ検証   │  sourceId !== targetId
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 重複チェック     │  SELECT by sourceId + targetId + type
└─────────────────┘
      │
      ├── 重複あり ──▶ UPDATE (weight加算, evidence追加)
      │
      └── 重複なし ──▶ INSERT (新規関係 + 証拠)
      │
      ▼
StoredRelation (Result.ok)
```

### 3.3 グラフ探索フロー (BFS)

```
traverse(startEntityId, options)
      │
      ▼
┌─────────────────┐
│ 開始エンティティ取得 │
└─────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ BFSキュー初期化                      │
│ visited = Map<EntityId, StoredEntity> │
│ queue = [{ entity, depth: 0 }]       │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ while (queue.length > 0)            │
│   ├── 深度チェック (maxDepth)       │
│   ├── ノード数チェック (maxNodes)   │
│   ├── 関係取得 (direction考慮)      │
│   ├── 重みフィルタ (minWeight)      │
│   └── 隣接ノード追加 (未訪問のみ)   │
└─────────────────────────────────────┘
      │
      ▼
GraphTraversalResult (Result.ok)
```

---

## 4. 統合ポイント

### 4.1 Store → Database 契約

| Store操作    | テーブル                           | 契約                      |
| ------------ | ---------------------------------- | ------------------------- |
| upsertEntity | entities                           | INSERT ON CONFLICT UPDATE |
| addRelation  | graphRelations + relation_evidence | 2テーブル同時操作         |
| traverse     | entities + graphRelations          | JOIN/複数クエリ           |
| getStats     | entities + graphRelations          | COUNT集計                 |

### 4.2 外部サービス契約

| サービス         | 契約                                                 |
| ---------------- | ---------------------------------------------------- |
| RAGパイプライン  | `createKnowledgeGraphStore(db)` でインスタンス取得   |
| コミュニティ検出 | `CommunityDetector` が `IKnowledgeGraphStore` を使用 |
| コミュニティ要約 | `CommunitySummarizer` が LLM + Store を使用          |

---

## 5. エラーハンドリング戦略

### 5.1 エラー階層

```
KnowledgeGraphError (基底クラス)
├── EntityNotFoundError      # エンティティ未発見
├── RelationNotFoundError    # 関係未発見
├── SelfLoopError           # 自己ループ禁止
├── EvidenceRequiredError   # 証拠必須違反
├── DatabaseConnectionError # DB接続エラー
├── DatabaseQueryError      # DBクエリエラー
└── ValidationError         # バリデーションエラー
```

### 5.2 エラー伝播

| 発生源           | エラー型             | 処理                             |
| ---------------- | -------------------- | -------------------------------- |
| Drizzle ORM      | 各種SQL例外          | DatabaseQueryError にラップ      |
| ビジネスロジック | 各種検証エラー       | 専用エラー型で返却               |
| 外部サービス     | ネットワークエラー等 | DatabaseConnectionError にラップ |

---

## 6. パフォーマンス設計

### 6.1 インデックス戦略

| テーブル  | インデックス      | 用途           |
| --------- | ----------------- | -------------- |
| entities  | name_idx          | 名前検索       |
| entities  | type_idx          | タイプフィルタ |
| entities  | importance_idx    | 重要度ソート   |
| relations | source_idx        | 起点探索       |
| relations | target_idx        | 終点探索       |
| relations | source_target_idx | 重複チェック   |

### 6.2 バッチ処理

| 操作               | 最適化                          |
| ------------------ | ------------------------------- |
| bulkUpsertEntities | 逐次処理（将来的にバッチSQL化） |
| bulkAddRelations   | 逐次処理（将来的にバッチSQL化） |

---

## 7. 拡張ポイント

### 7.1 将来対応予定

| 機能             | 現状                                        | 拡張方針                    |
| ---------------- | ------------------------------------------- | --------------------------- |
| ベクトル検索     | 未実装 (`findSimilarEntities` は空配列返却) | DiskANN統合後に実装         |
| コミュニティ検出 | 別サービス (`CommunityDetector`)            | Store統合検討               |
| トランザクション | 逐次処理                                    | Drizzleトランザクション活用 |

### 7.2 設計の柔軟性

| 設計決定             | 理由                    |
| -------------------- | ----------------------- |
| インターフェース分離 | 将来的なStore分離に対応 |
| Result型             | エラー型の拡張が容易    |
| Branded Types        | 新しいID型の追加が容易  |

---

## 8. 参照ドキュメント

| ドキュメント         | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| データベーススキーマ | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                                |
