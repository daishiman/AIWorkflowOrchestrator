# 受け入れ基準: Knowledge Graph テーブル群

## 1. entitiesテーブル

### AC-01: スキーマ定義

- [ ] `id` カラムがTEXT型でPRIMARY KEY
- [ ] `name` カラムがTEXT型でNOT NULL
- [ ] `normalizedName` カラムがTEXT型でNOT NULL
- [ ] `type` カラムがTEXT型（Enum）でNOT NULL
- [ ] `description` カラムがTEXT型でNULL許容
- [ ] `aliases` カラムがJSON型でデフォルト`[]`
- [ ] `embedding` カラムがBLOB型でNULL許容
- [ ] `embeddingModelId` カラムがTEXT型でNULL許容
- [ ] `importance` カラムがREAL型でデフォルト`0.5`
- [ ] `mentionCount` カラムがINTEGER型でデフォルト`1`
- [ ] `metadata` カラムがJSON型でNULL許容
- [ ] `createdAt` カラムがINTEGER型（timestamp）
- [ ] `updatedAt` カラムがINTEGER型（timestamp）

### AC-02: インデックス

- [ ] `normalizedName` にインデックスが存在する
- [ ] `type` にインデックスが存在する
- [ ] `importance` にインデックスが存在する
- [ ] `normalizedName` + `type` に一意インデックスが存在する

### AC-03: 型エクスポート

- [ ] `Entity` 型がエクスポートされている
- [ ] `NewEntity` 型がエクスポートされている

---

## 2. relationsテーブル

### AC-04: スキーマ定義

- [ ] `id` カラムがTEXT型でPRIMARY KEY
- [ ] `sourceId` カラムがTEXT型でNOT NULL、外部キー
- [ ] `targetId` カラムがTEXT型でNOT NULL、外部キー
- [ ] `type` カラムがTEXT型（Enum）でNOT NULL
- [ ] `description` カラムがTEXT型でNULL許容
- [ ] `weight` カラムがREAL型でデフォルト`0.5`
- [ ] `bidirectional` カラムがINTEGER型（boolean）でデフォルト`false`
- [ ] `evidenceCount` カラムがINTEGER型でデフォルト`1`
- [ ] `metadata` カラムがJSON型でNULL許容
- [ ] `createdAt`, `updatedAt` カラムが存在する

### AC-05: 外部キー

- [ ] `sourceId` は `entities.id` を参照し、CASCADE削除
- [ ] `targetId` は `entities.id` を参照し、CASCADE削除

### AC-06: インデックス

- [ ] `sourceId` にインデックスが存在する
- [ ] `targetId` にインデックスが存在する
- [ ] `type` にインデックスが存在する
- [ ] `weight` にインデックスが存在する
- [ ] `sourceId` + `targetId` + `type` に一意インデックスが存在する

### AC-07: 型エクスポート

- [ ] `Relation` 型がエクスポートされている
- [ ] `NewRelation` 型がエクスポートされている

---

## 3. relationEvidenceテーブル

### AC-08: スキーマ定義

- [ ] `relationId` + `chunkId` が複合主キー
- [ ] `relationId` カラムがTEXT型でNOT NULL、外部キー
- [ ] `chunkId` カラムがTEXT型でNOT NULL、外部キー
- [ ] `excerpt` カラムがTEXT型でNOT NULL
- [ ] `confidence` カラムがREAL型でデフォルト`0.5`
- [ ] `createdAt`, `updatedAt` カラムが存在する

### AC-09: 外部キー

- [ ] `relationId` は `relations.id` を参照し、CASCADE削除
- [ ] `chunkId` は `chunks.id` を参照し、CASCADE削除

### AC-10: 型エクスポート

- [ ] `RelationEvidence` 型がエクスポートされている
- [ ] `NewRelationEvidence` 型がエクスポートされている

---

## 4. communitiesテーブル

### AC-11: スキーマ定義

- [ ] `id` カラムがTEXT型でPRIMARY KEY
- [ ] `level` カラムがINTEGER型でデフォルト`0`
- [ ] `parentId` カラムがTEXT型でNULL許容（自己参照）
- [ ] `name` カラムがTEXT型でNOT NULL
- [ ] `summary` カラムがTEXT型でNOT NULL
- [ ] `memberCount` カラムがINTEGER型でデフォルト`0`
- [ ] `embedding`, `embeddingModelId` カラムが存在する
- [ ] `createdAt`, `updatedAt` カラムが存在する

### AC-12: インデックス

- [ ] `level` にインデックスが存在する
- [ ] `parentId` にインデックスが存在する

### AC-13: 型エクスポート

- [ ] `Community` 型がエクスポートされている
- [ ] `NewCommunity` 型がエクスポートされている

---

## 5. entityCommunitiesテーブル

### AC-14: スキーマ定義

- [ ] `entityId` + `communityId` が複合主キー
- [ ] 両カラムがTEXT型でNOT NULL、外部キー

### AC-15: 外部キー

- [ ] `entityId` は `entities.id` を参照し、CASCADE削除
- [ ] `communityId` は `communities.id` を参照し、CASCADE削除

### AC-16: 型エクスポート

- [ ] `EntityCommunity` 型がエクスポートされている
- [ ] `NewEntityCommunity` 型がエクスポートされている

---

## 6. chunkEntitiesテーブル

### AC-17: スキーマ定義

- [ ] `chunkId` + `entityId` が複合主キー
- [ ] `mentionCount` カラムがINTEGER型でデフォルト`1`
- [ ] `positions` カラムがJSON型でデフォルト`[]`

### AC-18: 外部キー

- [ ] `chunkId` は `chunks.id` を参照し、CASCADE削除
- [ ] `entityId` は `entities.id` を参照し、CASCADE削除

### AC-19: 型エクスポート

- [ ] `ChunkEntity` 型がエクスポートされている
- [ ] `NewChunkEntity` 型がエクスポートされている

---

## 7. Drizzleリレーション

### AC-20: リレーション定義

- [ ] `entitiesRelations` が定義されている
- [ ] `relationsTableRelations` が定義されている
- [ ] `relationEvidenceRelations` が定義されている
- [ ] `communitiesRelations` が定義されている
- [ ] `entityCommunitiesRelations` が定義されている
- [ ] `chunkEntitiesRelations` が定義されている

---

## 8. 統合

### AC-21: エクスポート

- [ ] `index.ts` から全テーブル・型がエクスポートされている
- [ ] メインの `schema/index.ts` からgraphモジュールがエクスポートされている

### AC-22: マイグレーション

- [ ] マイグレーション生成が正常に完了する
- [ ] マイグレーション適用が正常に完了する
