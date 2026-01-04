# DiskANN ベクトルインデックス - テスト仕様書

## メタ情報

| 項目           | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| 文書バージョン | 1.0                                                          |
| 作成日         | 2026-01-04                                                   |
| タスクID       | CONV-04-04                                                   |
| Phase          | 4 (テスト作成 - TDD Red)                                     |
| テストファイル | `packages/shared/src/db/schema/__tests__/embeddings.test.ts` |

---

## 1. テスト対象

| 対象                 | ファイルパス                                      | テスト種別 |
| -------------------- | ------------------------------------------------- | ---------- |
| embeddings スキーマ  | `packages/shared/src/db/schema/embeddings.ts`     | 単体       |
| vector-index 関数    | `packages/shared/src/db/schema/vector-index.ts`   | 単体       |
| vector-search クエリ | `packages/shared/src/db/queries/vector-search.ts` | 単体       |

---

## 2. テストケース一覧

### 2.1 embeddings スキーマテスト

| ID    | テストケース                        | 検証内容                            |
| ----- | ----------------------------------- | ----------------------------------- |
| ES-01 | テーブル名が正しい                  | `tableConfig.name === "embeddings"` |
| ES-02 | 全カラムが定義されている            | 8カラム全てが存在                   |
| ES-03 | chunk_id に外部キー制約がある       | FK → chunks.id, ON DELETE CASCADE   |
| ES-04 | chunk_id に UNIQUE 制約がある       | 1チャンク1埋め込みを保証            |
| ES-05 | model_id インデックスがある         | `embeddings_model_id_idx` が存在    |
| ES-06 | Embedding 型がエクスポートされる    | `Embedding` 型が利用可能            |
| ES-07 | NewEmbedding 型がエクスポートされる | `NewEmbedding` 型が利用可能         |

### 2.2 VectorIndexConfig テスト

| ID    | テストケース                    | 検証内容                           |
| ----- | ------------------------------- | ---------------------------------- |
| VI-01 | defaultVectorIndexConfig が定義 | デフォルト設定が存在               |
| VI-02 | dimensions が 1536              | OpenAI text-embedding-3-small 想定 |
| VI-03 | metric が cosine                | コサイン類似度がデフォルト         |
| VI-04 | vectorIndexConfigs が定義       | 複数モデル設定が存在               |

### 2.3 インデックス管理関数テスト

| ID    | テストケース               | 検証内容                 |
| ----- | -------------------------- | ------------------------ |
| IM-01 | createVectorIndex が存在   | 関数が export されている |
| IM-02 | dropVectorIndex が存在     | 関数が export されている |
| IM-03 | rebuildVectorIndex が存在  | 関数が export されている |
| IM-04 | getVectorIndexStats が存在 | 関数が export されている |
| IM-05 | VectorIndexStats 型が定義  | 統計情報の型が利用可能   |

### 2.4 データ変換関数テスト

| ID    | テストケース                           | 検証内容                      |
| ----- | -------------------------------------- | ----------------------------- |
| DC-01 | vectorToBlob が Float32Array を変換    | Buffer が返される             |
| DC-02 | vectorToBlob が空ベクトルでエラー      | Error がスローされる          |
| DC-03 | blobToVector が Buffer を変換          | Float32Array が返される       |
| DC-04 | blobToVector が空 Buffer でエラー      | Error がスローされる          |
| DC-05 | blobToVector が不正サイズでエラー      | 4の倍数でない場合 Error       |
| DC-06 | 往復変換でデータが保持される           | vector → blob → vector で一致 |
| DC-07 | normalizeVector が正規化する           | L2ノルム = 1.0                |
| DC-08 | normalizeVector がゼロベクトルでエラー | Error がスローされる          |
| DC-09 | calculateMagnitude が正しく計算        | √(Σx²) を返す                 |
| DC-10 | validateVector が空ベクトルを拒否      | Error がスローされる          |
| DC-11 | validateVector が次元数不一致を拒否    | Error がスローされる          |
| DC-12 | validateVector が NaN/Infinity を拒否  | Error がスローされる          |

### 2.5 検索関数テスト

| ID    | テストケース                 | 検証内容                 |
| ----- | ---------------------------- | ------------------------ |
| SF-01 | searchByVector が存在        | 関数が export されている |
| SF-02 | searchByVectorL2 が存在      | 関数が export されている |
| SF-03 | searchByVectorDot が存在     | 関数が export されている |
| SF-04 | VectorSearchResult 型が定義  | 結果型が利用可能         |
| SF-05 | VectorSearchOptions 型が定義 | オプション型が利用可能   |

### 2.6 挿入関数テスト

| ID    | テストケース                 | 検証内容                 |
| ----- | ---------------------------- | ------------------------ |
| IF-01 | insertEmbedding が存在       | 関数が export されている |
| IF-02 | insertEmbeddingsBatch が存在 | 関数が export されている |
| IF-03 | EmbeddingInsertItem 型が定義 | 入力型が利用可能         |

### 2.7 削除・ユーティリティ関数テスト

| ID    | テストケース                    | 検証内容                 |
| ----- | ------------------------------- | ------------------------ |
| DU-01 | deleteEmbeddingByChunkId が存在 | 関数が export されている |
| DU-02 | deleteEmbeddingsByFileId が存在 | 関数が export されている |
| DU-03 | getEmbeddingByChunkId が存在    | 関数が export されている |
| DU-04 | countEmbeddingsByModelId が存在 | 関数が export されている |

---

## 3. テスト実行方法

```bash
# embeddings テスト実行
pnpm --filter @repo/shared test:run -- --grep "embeddings"

# 全テスト実行
pnpm --filter @repo/shared test:run
```

---

## 4. TDD サイクル確認

### Phase 4 (Red) 期待結果

- [ ] 全テストが失敗する（実装が存在しないため）
- [ ] `embeddings` モジュールが見つからないエラー
- [ ] `vector-index` モジュールが見つからないエラー
- [ ] `vector-search` モジュールが見つからないエラー

### Phase 5 (Green) 期待結果

- [ ] 全テストがパスする

---

## 5. テストダブル設計

### 5.1 モック不要

本テストでは以下の理由からモックを使用しない:

1. **スキーマテスト**: Drizzle ORM の `getTableConfig` を使用した静的検証
2. **型テスト**: TypeScript のコンパイル時チェックで検証
3. **関数存在確認**: export されているかの確認のみ

### 5.2 将来の統合テストで必要なモック

Phase 5以降の統合テストでは以下のモックが必要:

| モック対象        | 用途             |
| ----------------- | ---------------- |
| LibSQLDatabase    | DB操作のモック   |
| crypto.randomUUID | 決定論的なID生成 |

---

## 6. カバレッジ目標

| 対象             | 目標カバレッジ |
| ---------------- | -------------- |
| embeddings.ts    | 100%           |
| vector-index.ts  | 80%            |
| vector-search.ts | 80%            |

---

## 7. 参照資料

- Phase 2 API仕様書: `outputs/phase-2/api-specification.md`
- Phase 2 スキーマ設計書: `outputs/phase-2/database-schema.md`
- 既存テストパターン: `packages/shared/src/db/schema/__tests__/chunks.test.ts`
