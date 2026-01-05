# SQLite/Turso 統計情報ガイド

## PRAGMA database_list

接続されているデータベースの一覧を取得。

### 基本クエリ

```sql
-- データベース一覧
PRAGMA database_list;

-- 結果例:
-- seq | name | file
-- 0   | main | /path/to/database.db
-- 1   | temp |
```

## PRAGMA table_info

テーブルのスキーマ情報を取得。

```sql
-- テーブル構造の確認
PRAGMA table_info(users);

-- カラム一覧
SELECT name, type, [notnull], dflt_value, pk
FROM pragma_table_info('users');
```

### メトリクス収集

```sql
-- テーブル数の確認
SELECT COUNT(*) AS table_count
FROM sqlite_master
WHERE type = 'table'
  AND name NOT LIKE 'sqlite_%';

-- インデックス数の確認
SELECT COUNT(*) AS index_count
FROM sqlite_master
WHERE type = 'index'
  AND name NOT LIKE 'sqlite_%';
```

## データベースサイズ統計

```sql
-- ページサイズとページ数
PRAGMA page_size;
PRAGMA page_count;

-- データベースサイズ（バイト）
SELECT
  (SELECT page_count FROM pragma_page_count()) *
  (SELECT page_size FROM pragma_page_size()) AS size_bytes;

-- 未使用領域の確認
PRAGMA freelist_count;

-- データベースの断片化状況
SELECT
  (SELECT freelist_count FROM pragma_freelist_count()) * 100.0 /
  (SELECT page_count FROM pragma_page_count()) AS fragmentation_pct;
```

## インデックス統計

```sql
-- インデックス一覧
PRAGMA index_list(table_name);

-- インデックスの詳細情報
PRAGMA index_info(index_name);

-- すべてのインデックスとそのテーブル
SELECT
  m.name AS table_name,
  il.name AS index_name,
  il.origin,
  il.[unique],
  il.partial
FROM sqlite_master m
CROSS JOIN pragma_index_list(m.name) il
WHERE m.type = 'table'
  AND m.name NOT LIKE 'sqlite_%';
```

## クエリプランナー統計

```sql
-- 統計テーブルの確認
SELECT * FROM sqlite_stat1;

-- テーブル行数の推定値
SELECT tbl, stat
FROM sqlite_stat1
WHERE idx IS NULL;

-- インデックス統計
SELECT tbl, idx, stat
FROM sqlite_stat1
WHERE idx IS NOT NULL;
```

## データベース整合性チェック

```sql
-- クイック整合性チェック
PRAGMA quick_check;

-- 完全整合性チェック（時間がかかる）
PRAGMA integrity_check;

-- 外部キー制約の検証
PRAGMA foreign_key_check;
```

## キャッシュとメモリ統計

```sql
-- キャッシュサイズ（ページ数）
PRAGMA cache_size;

-- 一時ストレージの場所
PRAGMA temp_store;

-- メモリマップドI/Oのサイズ
PRAGMA mmap_size;
```

## WALモード統計（該当する場合）

```sql
-- ジャーナルモードの確認
PRAGMA journal_mode;

-- WALモードの場合の統計
PRAGMA wal_autocheckpoint;  -- 自動チェックポイント間隔
PRAGMA wal_checkpoint(PASSIVE);  -- チェックポイント実行と統計取得
```

## Turso固有の統計

### libSQL拡張機能

```sql
-- レプリケーション状態（Turso）
-- Tursoダッシュボードまたはライブラリ経由でアクセス

-- 接続情報
-- アプリケーションレベルで接続プール統計を取得
```

### HTTPSyncプロトコル統計

```javascript
// Turso Client経由での統計取得例
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 接続統計の取得
const stats = await client.execute(`
  SELECT
    (SELECT page_count FROM pragma_page_count()) AS total_pages,
    (SELECT page_size FROM pragma_page_size()) AS page_size,
    (SELECT freelist_count FROM pragma_freelist_count()) AS free_pages
`);
```

## 監視クエリ例

### データベースサイズ追跡

```sql
-- 人間が読みやすい形式でサイズ取得
SELECT
  CASE
    WHEN size_bytes < 1024 THEN size_bytes || ' B'
    WHEN size_bytes < 1024*1024 THEN ROUND(size_bytes/1024.0, 2) || ' KB'
    WHEN size_bytes < 1024*1024*1024 THEN ROUND(size_bytes/(1024.0*1024), 2) || ' MB'
    ELSE ROUND(size_bytes/(1024.0*1024*1024), 2) || ' GB'
  END AS db_size
FROM (
  SELECT
    (SELECT page_count FROM pragma_page_count()) *
    (SELECT page_size FROM pragma_page_size()) AS size_bytes
);
```

### テーブルサイズ推定

```sql
-- テーブル別の推定行数（sqlite_stat1から）
SELECT
  tbl AS table_name,
  CAST(stat AS INTEGER) AS estimated_rows
FROM sqlite_stat1
WHERE idx IS NULL
ORDER BY estimated_rows DESC;
```

### インデックス効率分析

```sql
-- 未使用の可能性があるインデックス（手動で確認が必要）
SELECT
  m.name AS table_name,
  il.name AS index_name,
  il.origin
FROM sqlite_master m
CROSS JOIN pragma_index_list(m.name) il
WHERE m.type = 'table'
  AND il.origin = 'c'  -- ユーザー作成のインデックス
  AND m.name NOT LIKE 'sqlite_%'
ORDER BY m.name, il.name;
```

### 断片化モニタリング

```sql
-- 断片化率とVACUUM推奨
SELECT
  CASE
    WHEN fragmentation_pct > 30 THEN 'VACUUM推奨'
    WHEN fragmentation_pct > 15 THEN '注意'
    ELSE '正常'
  END AS status,
  ROUND(fragmentation_pct, 2) AS fragmentation_pct,
  free_pages || ' / ' || total_pages AS pages
FROM (
  SELECT
    (SELECT freelist_count FROM pragma_freelist_count()) AS free_pages,
    (SELECT page_count FROM pragma_page_count()) AS total_pages,
    (SELECT freelist_count FROM pragma_freelist_count()) * 100.0 /
    (SELECT page_count FROM pragma_page_count()) AS fragmentation_pct
);
```

## 定期メンテナンスクエリ

```sql
-- ANALYZE実行（統計更新）
ANALYZE;

-- 特定テーブルのANALYZE
ANALYZE table_name;

-- VACUUM実行（断片化解消）
VACUUM;

-- 自動VACUUM設定
PRAGMA auto_vacuum = FULL;  -- 0=OFF, 1=FULL, 2=INCREMENTAL
```

## パフォーマンス最適化設定

```sql
-- 同期モード（パフォーマンスvs安全性）
PRAGMA synchronous = NORMAL;  -- OFF, NORMAL, FULL, EXTRA

-- ロックモード
PRAGMA locking_mode = NORMAL;  -- NORMAL, EXCLUSIVE

-- WALモード有効化（推奨）
PRAGMA journal_mode = WAL;

-- キャッシュサイズ最適化
PRAGMA cache_size = -64000;  -- 64MBのキャッシュ（負の値はKB単位）
```
