# chunks_fts FTS5仮想テーブル設計書

**作成日**: 2025-12-26
**対象**: RAG変換システム - FTS5全文検索
**参照**: `design-chunks-schema.md`, `requirements-chunks-fts5.md`

---

## 1. 概要

本設計書は、`chunks`テーブルの全文検索を実現するFTS5仮想テーブル`chunks_fts`とその同期トリガーの詳細設計を定義します。

### 1.1 設計原則

| 原則                       | 説明                                      |
| -------------------------- | ----------------------------------------- |
| 外部コンテンツテーブル方式 | chunksテーブルをデータソースとして参照    |
| トークナイザー             | unicode61 remove_diacritics 2（日英対応） |
| 同期戦略                   | トリガーによるリアルタイム同期            |

---

## 2. FTS5仮想テーブル定義

### 2.1 DDL

```sql
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  contextual_content,
  parent_header,
  content='chunks',
  content_rowid='rowid',
  tokenize='unicode61 remove_diacritics 2'
);
```

### 2.2 カラム仕様

| カラム名           | 型   | 説明                   | 参照元                    |
| ------------------ | ---- | ---------------------- | ------------------------- |
| content            | TEXT | チャンクの主要テキスト | chunks.content            |
| contextual_content | TEXT | コンテキスト情報       | chunks.contextual_content |
| parent_header      | TEXT | 親見出し               | chunks.parent_header      |

### 2.3 FTS5オプション

| オプション    | 値                              | 説明                                        |
| ------------- | ------------------------------- | ------------------------------------------- |
| content       | 'chunks'                        | 外部コンテンツテーブルを参照                |
| content_rowid | 'rowid'                         | chunksのrowidと紐付け                       |
| tokenize      | 'unicode61 remove_diacritics 2' | Unicode正規化＋ダイアクリティカルマーク除去 |

### 2.4 トークナイザー選択理由

**問題**: デフォルトトークナイザーは日本語非対応

**解決策**: unicode61トークナイザーを採用

| トークナイザー | 日本語対応 | 英語対応 | 選択理由                  |
| -------------- | ---------- | -------- | ------------------------- |
| porter         | ❌         | ⭕       | 日本語非対応              |
| unicode61      | ⭕         | ⭕       | **採用** - バランスが良い |
| icu            | ⭕         | ⭕       | 外部依存あり              |

---

## 3. トリガー設計

### 3.1 トリガー一覧

| トリガー名        | タイミング   | 目的                                  |
| ----------------- | ------------ | ------------------------------------- |
| chunks_fts_insert | AFTER INSERT | FTS5への新規レコード追加              |
| chunks_fts_update | AFTER UPDATE | FTS5レコードの更新（DELETE + INSERT） |
| chunks_fts_delete | AFTER DELETE | FTS5からのレコード削除                |

### 3.2 INSERTトリガー

```sql
CREATE TRIGGER chunks_fts_insert AFTER INSERT ON chunks BEGIN
  INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
  VALUES (new.rowid, new.content, new.contextual_content, new.parent_header);
END;
```

**動作フロー**:

1. chunksテーブルにINSERT実行
2. トリガー発火
3. chunks_ftsに同じrowidで挿入

### 3.3 UPDATEトリガー

```sql
CREATE TRIGGER chunks_fts_update AFTER UPDATE ON chunks BEGIN
  DELETE FROM chunks_fts WHERE rowid = old.rowid;
  INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
  VALUES (new.rowid, new.content, new.contextual_content, new.parent_header);
END;
```

**設計判断: DELETE + INSERT**

- FTS5の仕様: 外部コンテンツテーブル使用時、UPDATE文は使用不可
- 解決策: DELETE後にINSERTで確実に再インデックス化

### 3.4 DELETEトリガー

```sql
CREATE TRIGGER chunks_fts_delete AFTER DELETE ON chunks BEGIN
  DELETE FROM chunks_fts WHERE rowid = old.rowid;
END;
```

---

## 4. 初期化関数

### 4.1 TypeScript実装

````typescript
import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

/**
 * chunks_fts FTS5仮想テーブルとトリガーを初期化
 *
 * @param db - Drizzle ORM データベースインスタンス
 * @throws {Error} FTS5テーブル作成に失敗した場合
 *
 * @example
 * ```typescript
 * import { initializeChunksFts } from './initialize-chunks-fts';
 *
 * await initializeChunksFts(db);
 * ```
 */
export async function initializeChunksFts(db: LibSQLDatabase): Promise<void> {
  // FTS5仮想テーブル作成
  await db.run(sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
      content,
      contextual_content,
      parent_header,
      content='chunks',
      content_rowid='rowid',
      tokenize='unicode61 remove_diacritics 2'
    )
  `);

  // INSERTトリガー作成
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_insert AFTER INSERT ON chunks BEGIN
      INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
      VALUES (new.rowid, new.content, new.contextual_content, new.parent_header);
    END
  `);

  // UPDATEトリガー作成
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_update AFTER UPDATE ON chunks BEGIN
      DELETE FROM chunks_fts WHERE rowid = old.rowid;
      INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
      VALUES (new.rowid, new.content, new.contextual_content, new.parent_header);
    END
  `);

  // DELETEトリガー作成
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_delete AFTER DELETE ON chunks BEGIN
      DELETE FROM chunks_fts WHERE rowid = old.rowid;
    END
  `);
}
````

### 4.2 実行タイミング

| タイミング       | 実行場所                   | 説明                   |
| ---------------- | -------------------------- | ---------------------- |
| DB初期化時       | アプリケーション起動時     | データベース接続直後   |
| マイグレーション | マイグレーションスクリプト | スキーマ変更時に再作成 |
| テスト時         | テストセットアップ         | 各テストスイート実行前 |

### 4.3 冪等性保証

- `IF NOT EXISTS`句により、複数回実行しても安全
- 既存テーブル・トリガーがあれば何もしない

---

## 5. 使用例

### 5.1 基本的な全文検索

```typescript
import { sql } from "drizzle-orm";

// 単一キーワード検索
const results = await db
  .select({
    rowid: sql`chunks_fts.rowid`,
    content: sql`chunks.content`,
    rank: sql`bm25(chunks_fts)`,
  })
  .from(sql`chunks_fts`)
  .innerJoin(sql`chunks`, sql`chunks.rowid = chunks_fts.rowid`)
  .where(sql`chunks_fts MATCH '検索キーワード'`)
  .orderBy(sql`bm25(chunks_fts)`)
  .limit(10);
```

### 5.2 高度な検索

```typescript
// AND検索
const andResults = await db
  .select()
  .from(sql`chunks_fts`)
  .where(sql`chunks_fts MATCH 'TypeScript AND React'`);

// フレーズ検索
const phraseResults = await db
  .select()
  .from(sql`chunks_fts`)
  .where(sql`chunks_fts MATCH '"full text search"'`);

// 特定カラム検索
const columnResults = await db
  .select()
  .from(sql`chunks_fts`)
  .where(sql`chunks_fts.content MATCH 'TypeScript'`);
```

---

## 6. パフォーマンス最適化

### 6.1 OPTIMIZE実行

```sql
-- FTS5インデックスを最適化（定期的に実行）
INSERT INTO chunks_fts(chunks_fts) VALUES('optimize');
```

**実行タイミング**:

- 大量INSERT後
- 大量DELETE後
- 定期メンテナンス（週次・月次）

### 6.2 バッチ更新時のトリガー無効化

```typescript
// 大量更新時はトリガーを一時的に無効化
await db.run(sql`DROP TRIGGER IF EXISTS chunks_fts_insert`);
await db.run(sql`DROP TRIGGER IF EXISTS chunks_fts_update`);
await db.run(sql`DROP TRIGGER IF EXISTS chunks_fts_delete`);

// バッチ更新実行
// ...

// FTS5を全再構築
await db.run(sql`INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild')`);

// トリガーを再作成
await initializeChunksFts(db);
```

---

## 7. 整合性チェック

### 7.1 同期確認クエリ

```sql
-- chunksにあるがchunks_ftsにないレコード
SELECT c.rowid
FROM chunks c
LEFT JOIN chunks_fts fts ON c.rowid = fts.rowid
WHERE fts.rowid IS NULL;

-- レコード数の一致確認
SELECT
  (SELECT COUNT(*) FROM chunks) AS chunks_count,
  (SELECT COUNT(*) FROM chunks_fts) AS chunks_fts_count;
```

### 7.2 整合性チェック関数

```typescript
export async function checkChunksFtsIntegrity(db: LibSQLDatabase): Promise<{
  isConsistent: boolean;
  chunksCount: number;
  chunksFtsCount: number;
}> {
  const [{ chunksCount, chunksFtsCount }] = await db
    .select({
      chunksCount: sql`(SELECT COUNT(*) FROM chunks)`,
      chunksFtsCount: sql`(SELECT COUNT(*) FROM chunks_fts)`,
    })
    .from(sql`(SELECT 1)`);

  return {
    isConsistent: chunksCount === chunksFtsCount,
    chunksCount: Number(chunksCount),
    chunksFtsCount: Number(chunksFtsCount),
  };
}
```

---

## 8. トラブルシューティング

### 8.1 検索結果が返らない

**原因**: FTS5とchunksの同期が取れていない

**解決策**:

```sql
-- FTS5を全再構築
INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild');
```

### 8.2 トリガーが動作しない

**原因**: トリガーが作成されていない

**解決策**:

```typescript
// トリガーの存在確認と再作成
await initializeChunksFts(db);
```

### 8.3 パフォーマンスが低下

**原因**: FTS5インデックスの断片化

**解決策**:

```sql
INSERT INTO chunks_fts(chunks_fts) VALUES('optimize');
```

---

## 9. 完了条件チェックリスト

- [x] FTS5仮想テーブルのSQL定義が明記されている
- [x] tokenizerの設定が明記されている（unicode61 remove_diacritics 2）
- [x] contentとcontent_rowidの設定が明記されている
- [x] INSERTトリガーの仕様が明記されている
- [x] UPDATEトリガーの仕様が明記されている（delete + insert）
- [x] DELETEトリガーの仕様が明記されている
- [x] 初期化関数（initializeChunksFts）の仕様が明記されている

---

## 10. 次のアクション

### T-01-3: 検索クエリビルダー設計

**依存関係**: T-01-2（本タスク）完了後に実行

**実装内容**:

1. 検索クエリビルダー関数の設計
2. BM25ランキング実装
3. ハイライト機能実装

---

## 変更履歴

| 日付       | 変更内容 | 担当         |
| ---------- | -------- | ------------ |
| 2025-12-26 | 初版作成 | db-architect |
