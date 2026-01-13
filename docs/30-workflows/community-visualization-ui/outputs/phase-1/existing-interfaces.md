# 既存インターフェース整理 - Phase 1成果物

## 作成日: 2026-01-13

## タスク: CONV-08-05 コミュニティ構造可視化UI

---

## 1. コミュニティ検出関連インターフェース

### 1.1 ICommunityDetector

**ファイル**: `packages/shared/src/services/graph/`

| メソッド                            | 戻り値                                    | 説明                           |
| ----------------------------------- | ----------------------------------------- | ------------------------------ |
| `detect(options?)`                  | `Result<CommunityDetectionResult, Error>` | コミュニティを検出             |
| `saveResults(structure)`            | `Result<void, Error>`                     | 検出結果をDBに保存             |
| `getCommunitiesForEntity(entityId)` | `Result<Community[], Error>`              | エンティティのコミュニティ取得 |
| `getCommunitiesByLevel(level)`      | `Result<Community[], Error>`              | レベル別コミュニティ取得       |
| `getCommunityMembers(communityId)`  | `Result<StoredEntity[], Error>`           | コミュニティのメンバー取得     |

### 1.2 ICommunityRepository

| メソッド                                      | 戻り値                                    | 説明                 |
| --------------------------------------------- | ----------------------------------------- | -------------------- |
| `insert(community)`                           | `Result<Community, Error>`                | コミュニティ挿入     |
| `insertMany(communities)`                     | `Result<Community[], Error>`              | 一括挿入             |
| `findById(id)`                                | `Result<Community \| null, Error>`        | IDで取得             |
| `findByEntityId(entityId)`                    | `Result<Community[], Error>`              | エンティティIDで取得 |
| `findByLevel(level)`                          | `Result<Community[], Error>`              | レベルで取得         |
| `deleteAll()`                                 | `Result<void, Error>`                     | 全削除               |
| `getSummary(communityId)`                     | `Result<CommunitySummary \| null, Error>` | 要約取得             |
| `updateSummary(communityId, summary)`         | `Result<void, Error>`                     | 要約保存/更新        |
| `searchSummariesByEmbedding(embedding, opts)` | `Result<CommunitySummary[], Error>`       | 埋め込み検索         |

---

## 2. 型定義

### 2.1 Community型

| プロパティ          | 型              | 必須 | 説明                        |
| ------------------- | --------------- | ---- | --------------------------- |
| `id`                | `CommunityId`   | ✅   | 一意識別子（Branded Type）  |
| `level`             | `number`        | ✅   | 階層レベル（0が最下層）     |
| `memberEntityIds`   | `EntityId[]`    | ✅   | 直接メンバーエンティティID  |
| `childCommunityIds` | `CommunityId[]` | ✅   | 子コミュニティID            |
| `parentCommunityId` | `CommunityId?`  | -    | 親コミュニティID            |
| `size`              | `number`        | ✅   | コミュニティサイズ          |
| `internalEdges`     | `number`        | ✅   | 内部エッジ数                |
| `externalEdges`     | `number`        | ✅   | 外部エッジ数                |
| `modularity`        | `number`        | ✅   | モジュラリティ貢献          |
| `summary`           | `string?`       | -    | コミュニティ要約（LLM生成） |
| `createdAt`         | `Date`          | ✅   | 作成日時                    |
| `updatedAt`         | `Date`          | ✅   | 更新日時                    |

### 2.2 CommunitySummary型

| プロパティ      | 型                                      | 必須 | 説明                          |
| --------------- | --------------------------------------- | ---- | ----------------------------- |
| `communityId`   | `CommunityId`                           | ✅   | コミュニティID                |
| `level`         | `number`                                | ✅   | 階層レベル                    |
| `summary`       | `string`                                | ✅   | 要約文                        |
| `keywords`      | `string[]`                              | ✅   | 検索用キーワード              |
| `mainEntities`  | `string[]`                              | ✅   | 主要エンティティ名（最大5件） |
| `mainRelations` | `string[]`                              | ✅   | 主要関係（最大5件）           |
| `sentiment`     | `"positive" \| "negative" \| "neutral"` | ✅   | 全体的なトーン                |
| `confidence`    | `number`                                | ✅   | AI自信度（0.0〜1.0）          |
| `tokenCount`    | `number`                                | ✅   | 使用トークン数                |
| `embedding`     | `number[]?`                             | -    | 埋め込みベクトル              |
| `createdAt`     | `Date`                                  | ✅   | 作成日時                      |

### 2.3 CommunityId (Branded Type)

```typescript
type CommunityId = string & { readonly __brand: "CommunityId" };
```

### 2.4 EntityId (Branded Type)

```typescript
type EntityId = string & { readonly __brand: "EntityId" };
```

### 2.5 StoredEntity型

| プロパティ    | 型         | 説明               |
| ------------- | ---------- | ------------------ |
| `id`          | `EntityId` | エンティティID     |
| `name`        | `string`   | エンティティ名     |
| `type`        | `string`   | エンティティタイプ |
| `description` | `string?`  | 説明               |

---

## 3. コミュニティ要約関連インターフェース

### 3.1 ICommunitySummarizer

| メソッド                                              | 戻り値                                        | 説明                   |
| ----------------------------------------------------- | --------------------------------------------- | ---------------------- |
| `summarize(community, entities, relations, options?)` | `Result<CommunitySummary, Error>`             | 単一コミュニティ要約   |
| `summarizeAll(structure, options?)`                   | `Result<CommunitySummarizationResult, Error>` | 全コミュニティ一括要約 |
| `searchSummaries(query, options?)`                    | `Result<CommunitySummary[], Error>`           | セマンティック検索     |
| `updateSummary(communityId)`                          | `Result<CommunitySummary, Error>`             | 要約更新               |

---

## 4. エラーコード一覧

### 4.1 コミュニティ検出エラー

| エラーコード        | 説明                       |
| ------------------- | -------------------------- |
| `GRAPH_LOAD_FAILED` | グラフデータ読み込み失敗   |
| `DETECTION_FAILED`  | 検出処理失敗               |
| `SAVE_FAILED`       | 永続化失敗                 |
| `NOT_FOUND`         | コミュニティが見つからない |
| `INVALID_PARAMETER` | 無効なパラメータ           |

### 4.2 コミュニティ要約エラー

| エラーコード            | 説明                       |
| ----------------------- | -------------------------- |
| `LLM_GENERATION_FAILED` | LLM生成失敗                |
| `JSON_PARSE_FAILED`     | JSONパース失敗             |
| `EMBEDDING_FAILED`      | 埋め込み生成失敗           |
| `DB_SAVE_FAILED`        | データベース保存失敗       |
| `COMMUNITY_NOT_FOUND`   | コミュニティが見つからない |

---

## 5. UI使用に必要な情報

### 5.1 グラフ表示に必要なデータ

| データ           | ソース                        | 用途             |
| ---------------- | ----------------------------- | ---------------- |
| コミュニティ一覧 | `getCommunitiesByLevel()`     | ノード表示       |
| 親子関係         | `Community.parentCommunityId` | エッジ表示       |
| サイズ情報       | `Community.size`              | ノードサイズ決定 |
| 階層レベル       | `Community.level`             | レイアウト配置   |

### 5.2 詳細パネルに必要なデータ

| データ           | ソース                                     | 用途             |
| ---------------- | ------------------------------------------ | ---------------- |
| 要約情報         | `ICommunityRepository.getSummary()`        | 要約表示         |
| キーワード       | `CommunitySummary.keywords`                | キーワード表示   |
| 主要エンティティ | `CommunitySummary.mainEntities`            | エンティティ表示 |
| メンバー         | `ICommunityDetector.getCommunityMembers()` | メンバーリスト   |

---

## 確認完了

- [x] コミュニティ検出インターフェース確認
- [x] コミュニティ要約インターフェース確認
- [x] 型定義確認
- [x] エラーコード確認
- [x] UI表示に必要なデータの整理
