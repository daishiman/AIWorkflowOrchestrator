# DiskANN ベクトルインデックス - 受け入れ基準

## メタ情報

| 項目           | 内容                       |
| -------------- | -------------------------- |
| 文書バージョン | 1.0                        |
| 作成日         | 2026-01-04                 |
| タスクID       | CONV-04-04                 |
| 参照           | requirements-definition.md |
| フォーマット   | Given-When-Then (BDD形式)  |

---

## 1. embeddingsテーブル定義 (FR-01, FR-02)

### AC-01-01: 埋め込みの挿入

**Given** (前提条件):

- chunksテーブルに有効なchunk (id: "chunk-123") が存在する
- Float32Array形式の1536次元ベクトルが準備されている

**When** (実行条件):

- embeddingsテーブルに新しい埋め込みを挿入する

**Then** (期待結果):

- 埋め込みレコードが正常に作成される
- id (UUID) が自動生成される
- created_at, updated_at がUNIX epochで設定される

### AC-01-02: chunk_idの一意性制約

**Given** (前提条件):

- embeddingsテーブルにchunk_id="chunk-123"のレコードが存在する

**When** (実行条件):

- 同じchunk_id="chunk-123"で新しい埋め込みを挿入しようとする

**Then** (期待結果):

- UNIQUE制約違反エラーが発生する
- 既存のレコードは変更されない

### AC-01-03: カスケード削除

**Given** (前提条件):

- chunksテーブルにchunk (id: "chunk-123") が存在する
- embeddingsテーブルにchunk_id="chunk-123"の埋め込みが存在する

**When** (実行条件):

- chunksテーブルからid="chunk-123"のレコードを削除する

**Then** (期待結果):

- 関連するembeddingsレコードが自動的に削除される
- 孤立レコードが存在しない

---

## 2. ベクトルインデックス管理 (FR-03)

### AC-02-01: インデックスの作成

**Given** (前提条件):

- embeddingsテーブルが存在する
- VectorIndexConfigが定義されている (dimensions: 1536, metric: "cosine")

**When** (実行条件):

- createVectorIndex()を実行する

**Then** (期待結果):

- embeddings_vector_idxインデックスが作成される
- インデックスがDiskANN方式で構築される
- エラーが発生しない

### AC-02-02: インデックスの削除

**Given** (前提条件):

- embeddings_vector_idxインデックスが存在する

**When** (実行条件):

- dropVectorIndex()を実行する

**Then** (期待結果):

- インデックスが削除される
- テーブルデータは保持される

### AC-02-03: インデックスの再構築

**Given** (前提条件):

- embeddings_vector_idxインデックスが存在する
- 新しいデータが追加されている

**When** (実行条件):

- rebuildVectorIndex()を実行する

**Then** (期待結果):

- インデックスが再構築される
- 既存データへのクエリが正常に動作する

### AC-02-04: インデックス統計情報の取得

**Given** (前提条件):

- embeddings_vector_idxインデックスが存在する
- 100件以上の埋め込みデータがある

**When** (実行条件):

- getIndexStats()を実行する

**Then** (期待結果):

- インデックスのエントリ数が返される
- インデックスのメトリクス情報が返される

---

## 3. コサイン類似度検索 (FR-04)

### AC-03-01: 基本的なコサイン類似度検索

**Given** (前提条件):

- embeddingsテーブルに10件の埋め込みデータがある
- クエリベクトル (1536次元Float32Array) が準備されている

**When** (実行条件):

- searchByVector(db, queryVector, { limit: 5 })を実行する

**Then** (期待結果):

- 最大5件の結果が返される
- 結果がsimilarity降順でソートされている
- 各結果にchunkId, embeddingId, distance, similarity, contentが含まれる

### AC-03-02: minSimilarityフィルター

**Given** (前提条件):

- embeddingsテーブルにsimilarityが0.3〜0.9の埋め込みデータがある
- クエリベクトルが準備されている

**When** (実行条件):

- searchByVector(db, queryVector, { minSimilarity: 0.7 })を実行する

**Then** (期待結果):

- similarity >= 0.7の結果のみが返される
- similarity < 0.7の結果は含まれない

### AC-03-03: fileIdsフィルター

**Given** (前提条件):

- embeddingsテーブルに複数のfileIdに紐づく埋め込みがある
- クエリベクトルが準備されている

**When** (実行条件):

- searchByVector(db, queryVector, { fileIds: ["file-1", "file-2"] })を実行する

**Then** (期待結果):

- 指定されたfileIdsに関連するチャンクの埋め込みのみが返される
- 他のfileIdの結果は含まれない

---

## 4. ユークリッド距離検索 (FR-05)

### AC-04-01: 基本的なユークリッド距離検索

**Given** (前提条件):

- embeddingsテーブルに埋め込みデータがある
- クエリベクトルが準備されている

**When** (実行条件):

- searchByVectorL2(db, queryVector, { limit: 10 })を実行する

**Then** (期待結果):

- 最大10件の結果が返される
- 結果がdistance昇順（近い順）でソートされている
- 各結果にdistance（ユークリッド距離）が含まれる

---

## 5. 内積検索 (FR-06)

### AC-05-01: 基本的な内積検索

**Given** (前提条件):

- embeddingsテーブルに正規化された埋め込みデータがある
- 正規化されたクエリベクトルが準備されている

**When** (実行条件):

- searchByVectorDot(db, queryVector, { limit: 10 })を実行する

**Then** (期待結果):

- 最大10件の結果が返される
- 結果が内積値の降順でソートされている
- 各結果に内積値が含まれる

---

## 6. Float32Array ⇔ Blob 変換 (FR-07)

### AC-06-01: vectorToBlob変換

**Given** (前提条件):

- 1536次元のFloat32Arrayベクトルがある

**When** (実行条件):

- vectorToBlob(vector)を実行する

**Then** (期待結果):

- Bufferが返される
- Buffer.length === 1536 \* 4 (Float32は4バイト)
- データが正しくシリアライズされている

### AC-06-02: blobToVector変換

**Given** (前提条件):

- vectorToBlob()で作成されたBufferがある

**When** (実行条件):

- blobToVector(blob)を実行する

**Then** (期待結果):

- Float32Arrayが返される
- Float32Array.length === 1536
- 全ての値が元のベクトルと一致する

### AC-06-03: 往復変換の整合性

**Given** (前提条件):

- ランダムな値を持つ1536次元Float32Arrayがある

**When** (実行条件):

- blobToVector(vectorToBlob(originalVector))を実行する

**Then** (期待結果):

- 復元されたベクトルが元のベクトルと完全に一致する
- 浮動小数点精度内でデータ損失がない

---

## 7. バッチ挿入 (FR-08)

### AC-07-01: 基本的なバッチ挿入

**Given** (前提条件):

- 50件のEmbeddingInsertItemがある
- 各アイテムに有効なchunkId, vector, modelId, dimensionsがある

**When** (実行条件):

- insertEmbeddingsBatch(db, items)を実行する

**Then** (期待結果):

- 50件全てが正常に挿入される
- 各レコードにUUID idが生成される
- トランザクションが正常にコミットされる

### AC-07-02: 大量データのバッチ分割

**Given** (前提条件):

- 500件のEmbeddingInsertItemがある

**When** (実行条件):

- insertEmbeddingsBatch(db, items)を実行する

**Then** (期待結果):

- 100件単位で5回のバッチ処理が行われる
- メモリ使用量が安定している（急激な増加がない）
- 全500件が正常に挿入される

### AC-07-03: バッチ挿入のエラーハンドリング

**Given** (前提条件):

- 100件のEmbeddingInsertItemがあり、50件目に無効なchunkIdが含まれる

**When** (実行条件):

- insertEmbeddingsBatch(db, items)を実行する

**Then** (期待結果):

- エラーが発生する
- トランザクションがロールバックされる
- 部分的な挿入が発生しない

---

## 8. 検索オプション (FR-09)

### AC-08-01: limitオプション

**Given** (前提条件):

- embeddingsテーブルに100件のデータがある

**When** (実行条件):

- searchByVector(db, queryVector, { limit: 20 })を実行する

**Then** (期待結果):

- 正確に20件以下の結果が返される

### AC-08-02: limit=0の場合

**Given** (前提条件):

- embeddingsテーブルにデータがある

**When** (実行条件):

- searchByVector(db, queryVector, { limit: 0 })を実行する

**Then** (期待結果):

- 空の配列が返される

### AC-08-03: modelIdフィルター

**Given** (前提条件):

- embeddingsテーブルに複数のmodelIdの埋め込みがある

**When** (実行条件):

- searchByVector(db, queryVector, { modelId: "text-embedding-3-small" })を実行する

**Then** (期待結果):

- 指定されたmodelIdの結果のみが返される

---

## 9. マイグレーション (FR-10)

### AC-09-01: マイグレーションの実行

**Given** (前提条件):

- データベースにembeddingsテーブルが存在しない
- 0006_create_embeddings_table.sqlが準備されている

**When** (実行条件):

- マイグレーションを実行する

**Then** (期待結果):

- embeddingsテーブルが作成される
- embeddings_chunk_id_idx (UNIQUE)が作成される
- embeddings_model_id_idxが作成される
- embeddings_vector_idx (ベクトルインデックス)が作成される

### AC-09-02: マイグレーションの冪等性

**Given** (前提条件):

- embeddingsテーブルが既に存在する
- マイグレーションSQLに`IF NOT EXISTS`が使用されている

**When** (実行条件):

- マイグレーションを再度実行する

**Then** (期待結果):

- エラーが発生しない
- 既存のデータが保持される

---

## 10. パフォーマンス要件 (NFR-01, NFR-02)

### AC-10-01: 小規模データセットの検索速度

**Given** (前提条件):

- embeddingsテーブルに5,000件のデータがある
- ベクトルインデックスが構築されている

**When** (実行条件):

- searchByVector(db, queryVector, { limit: 10 })を10回実行する

**Then** (期待結果):

- 平均検索時間が50ms未満

### AC-10-02: 中規模データセットの検索速度

**Given** (前提条件):

- embeddingsテーブルに50,000件のデータがある
- ベクトルインデックスが構築されている

**When** (実行条件):

- searchByVector(db, queryVector, { limit: 10 })を10回実行する

**Then** (期待結果):

- 平均検索時間が100ms未満

### AC-10-03: 大規模データセットの検索速度

**Given** (前提条件):

- embeddingsテーブルに100,000件以上のデータがある
- ベクトルインデックスが構築されている

**When** (実行条件):

- searchByVector(db, queryVector, { limit: 10 })を10回実行する

**Then** (期待結果):

- 平均検索時間が200ms未満

### AC-10-04: バッチ挿入のメモリ効率

**Given** (前提条件):

- 1,000件のEmbeddingInsertItemを準備する
- 初期メモリ使用量を記録する

**When** (実行条件):

- insertEmbeddingsBatch(db, items)を実行する

**Then** (期待結果):

- メモリ増加が50MB未満
- 100件単位でのバッチ処理が確認できる

---

## 11. エッジケース

### AC-11-01: 空のベクトル

**Given** (前提条件):

- 0次元のFloat32Array (空の配列)を準備する

**When** (実行条件):

- searchByVector(db, emptyVector)を実行する

**Then** (期待結果):

- バリデーションエラーが発生する
- 適切なエラーメッセージが返される

### AC-11-02: 次元数不一致

**Given** (前提条件):

- インデックスは1536次元で構成されている
- 512次元のクエリベクトルを準備する

**When** (実行条件):

- searchByVector(db, wrongDimensionVector)を実行する

**Then** (期待結果):

- 次元数不一致エラーが発生する
- 期待される次元数がエラーメッセージに含まれる

### AC-11-03: 存在しないchunkIdへの参照

**Given** (前提条件):

- chunksテーブルに存在しないchunkId="invalid-chunk"を使用する

**When** (実行条件):

- 埋め込みを挿入しようとする

**Then** (期待結果):

- 外部キー制約エラーが発生する
- レコードは挿入されない

### AC-11-04: minSimilarity=1.0 (完全一致のみ)

**Given** (前提条件):

- embeddingsテーブルにデータがある
- クエリベクトルと完全に一致するベクトルが1つだけ存在する

**When** (実行条件):

- searchByVector(db, queryVector, { minSimilarity: 1.0 })を実行する

**Then** (期待結果):

- 完全一致のベクトルのみが返される
- 結果は1件以下

---

## 12. コード品質 (NFR-05, NFR-06, NFR-09)

### AC-12-01: ESLintチェック

**Given** (前提条件):

- 全ての実装ファイルが作成されている

**When** (実行条件):

- `pnpm --filter @repo/shared lint`を実行する

**Then** (期待結果):

- 警告・エラーが0件

### AC-12-02: TypeScript型チェック

**Given** (前提条件):

- 全ての実装ファイルが作成されている

**When** (実行条件):

- `pnpm --filter @repo/shared typecheck`を実行する

**Then** (期待結果):

- 型エラーが0件

### AC-12-03: テストカバレッジ

**Given** (前提条件):

- 全ての実装ファイルとテストファイルが作成されている

**When** (実行条件):

- `pnpm --filter @repo/shared test:coverage`を実行する

**Then** (期待結果):

- カバレッジが80%以上

### AC-12-04: JSDocコメント

**Given** (前提条件):

- 全てのパブリック関数・型が定義されている

**When** (実行条件):

- コードレビューを実施する

**Then** (期待結果):

- 全パブリックAPIにJSDocコメントが記述されている
- @param, @returns, @exampleが適切に含まれている

---

## 検証チェックリスト

### テーブル・インデックス

- [ ] AC-01-01: 埋め込みの挿入
- [ ] AC-01-02: chunk_idの一意性制約
- [ ] AC-01-03: カスケード削除
- [ ] AC-02-01: インデックスの作成
- [ ] AC-02-02: インデックスの削除
- [ ] AC-02-03: インデックスの再構築
- [ ] AC-02-04: インデックス統計情報の取得

### ベクトル検索

- [ ] AC-03-01: 基本的なコサイン類似度検索
- [ ] AC-03-02: minSimilarityフィルター
- [ ] AC-03-03: fileIdsフィルター
- [ ] AC-04-01: 基本的なユークリッド距離検索
- [ ] AC-05-01: 基本的な内積検索

### データ変換・バッチ処理

- [ ] AC-06-01: vectorToBlob変換
- [ ] AC-06-02: blobToVector変換
- [ ] AC-06-03: 往復変換の整合性
- [ ] AC-07-01: 基本的なバッチ挿入
- [ ] AC-07-02: 大量データのバッチ分割
- [ ] AC-07-03: バッチ挿入のエラーハンドリング

### オプション・マイグレーション

- [ ] AC-08-01: limitオプション
- [ ] AC-08-02: limit=0の場合
- [ ] AC-08-03: modelIdフィルター
- [ ] AC-09-01: マイグレーションの実行
- [ ] AC-09-02: マイグレーションの冪等性

### パフォーマンス

- [ ] AC-10-01: 小規模データセットの検索速度 (< 50ms)
- [ ] AC-10-02: 中規模データセットの検索速度 (< 100ms)
- [ ] AC-10-03: 大規模データセットの検索速度 (< 200ms)
- [ ] AC-10-04: バッチ挿入のメモリ効率

### エッジケース

- [ ] AC-11-01: 空のベクトル
- [ ] AC-11-02: 次元数不一致
- [ ] AC-11-03: 存在しないchunkIdへの参照
- [ ] AC-11-04: minSimilarity=1.0

### コード品質

- [ ] AC-12-01: ESLintチェック
- [ ] AC-12-02: TypeScript型チェック
- [ ] AC-12-03: テストカバレッジ (80%以上)
- [ ] AC-12-04: JSDocコメント
