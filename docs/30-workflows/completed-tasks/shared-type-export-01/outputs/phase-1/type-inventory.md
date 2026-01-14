# Phase 1: 型一覧リスト

## 作成日

2026-01-13

## 概要

`packages/shared/src/services/graph/types.ts` で定義されている全ての public 型を一覧化する。

---

## エクスポート対象型一覧

### 1. Entity 関連型（3件）

| 型名              | 種別      | 説明                       | 使用する Branded Types |
| ----------------- | --------- | -------------------------- | ---------------------- |
| `StoredEntity`    | interface | 永続化されたエンティティ   | EntityId, ChunkId      |
| `ExtractedEntity` | interface | 抽出されたエンティティ     | ChunkId                |
| `EntityMention`   | interface | エンティティメンション位置 | なし                   |

### 2. Relation 関連型（3件）

| 型名                | 種別      | 説明             | 使用する Branded Types |
| ------------------- | --------- | ---------------- | ---------------------- |
| `StoredRelation`    | interface | 永続化された関係 | RelationId, EntityId   |
| `ExtractedRelation` | interface | 抽出された関係   | なし（名前ベース）     |
| `RelationEvidence`  | interface | 関係の証拠       | ChunkId                |

### 3. Graph 関連型（5件）

| 型名                   | 種別      | 説明             | 使用する Branded Types |
| ---------------------- | --------- | ---------------- | ---------------------- |
| `GraphNode`            | interface | グラフノード     | （StoredEntity依存）   |
| `GraphPath`            | interface | グラフパス       | （StoredEntity依存）   |
| `GraphTraversalResult` | interface | トラバーサル結果 | （StoredEntity依存）   |
| `GraphStats`           | interface | グラフ統計情報   | なし                   |
| `GraphEdge`            | interface | グラフエッジ     | EntityId               |

### 4. Community 関連型（12件）

| 型名                              | 種別      | 説明             | 使用する Branded Types     |
| --------------------------------- | --------- | ---------------- | -------------------------- |
| `Community`                       | interface | コミュニティ     | CommunityId, EntityId      |
| `CommunitySummary`                | interface | コミュニティ要約 | CommunityId                |
| `CommunityStructure`              | interface | コミュニティ構造 | EntityId, CommunityId      |
| `CommunityDetectionOptions`       | interface | 検出オプション   | なし                       |
| `CommunityDetectionResult`        | interface | 検出結果         | （CommunityStructure依存） |
| `CommunityDetectionStats`         | interface | 検出統計         | なし                       |
| `CommunityErrorCode`              | enum      | エラーコード     | なし                       |
| `CommunityDetectionError`         | class     | 検出エラークラス | なし                       |
| `CommunitySummarizationOptions`   | interface | 要約オプション   | なし                       |
| `CommunitySummarizationResult`    | interface | 要約結果         | CommunityId                |
| `CommunitySummarizationErrorCode` | enum      | 要約エラーコード | なし                       |
| `CommunitySummarizationError`     | class     | 要約エラークラス | なし                       |

### 5. Query 関連型（3件）

| 型名                   | 種別      | 説明                   | 使用する Branded Types |
| ---------------------- | --------- | ---------------------- | ---------------------- |
| `EntityQuery`          | interface | エンティティ検索条件   | ChunkId                |
| `TraversalOptions`     | interface | トラバーサルオプション | なし                   |
| `RelationQueryOptions` | interface | 関係取得オプション     | なし                   |

### 6. ユーティリティ関数（1件）

| 関数名                | 種別     | 説明                 |
| --------------------- | -------- | -------------------- |
| `normalizeEntityName` | function | エンティティ名正規化 |

---

## 合計

| カテゴリ       | interface | enum  | class | function | 合計   |
| -------------- | --------- | ----- | ----- | -------- | ------ |
| Entity関連     | 3         | 0     | 0     | 0        | 3      |
| Relation関連   | 3         | 0     | 0     | 0        | 3      |
| Graph関連      | 5         | 0     | 0     | 0        | 5      |
| Community関連  | 8         | 2     | 2     | 0        | 12     |
| Query関連      | 3         | 0     | 0     | 0        | 3      |
| ユーティリティ | 0         | 0     | 0     | 1        | 1      |
| **合計**       | **22**    | **2** | **2** | **1**    | **27** |

---

## エクスポート方式

### `export type` を使用する型（22件）

TypeScript の `export type` 構文は、型情報のみをエクスポートし、コンパイル後の JavaScript には残らない。

- 全ての interface 型

### `export` を使用する型（5件）

`export` は値としてもエクスポートされ、ランタイムで使用可能。

- `CommunityErrorCode` (enum)
- `CommunitySummarizationErrorCode` (enum)
- `CommunityDetectionError` (class)
- `CommunitySummarizationError` (class)
- `normalizeEntityName` (function)

---

## タスク1完了

✅ `types.ts` 内の全ての public 型が一覧化されている
