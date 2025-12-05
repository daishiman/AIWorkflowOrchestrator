# パフォーマンス監視クエリ集 (SQLite)

## データベース情報

### 基本情報

```sql
-- データベースバージョン
SELECT sqlite_version();

-- データベースサイズ
SELECT page_count * page_size as size_bytes
FROM pragma_page_count(), pragma_page_size();

-- ページサイズ
PRAGMA page_size;

-- キャッシュサイズ
PRAGMA cache_size;

-- ジャーナルモード
PRAGMA journal_mode;

-- 同期モード
PRAGMA synchronous;
```

## テーブル統計

### すべてのテーブル一覧

```sql
SELECT
  name,
  type
FROM sqlite_master
WHERE type = 'table'
  AND name NOT LIKE 'sqlite_%'
ORDER BY name;
```

### テーブル情報とインデックス数

```sql
SELECT
  m.name as table_name,
  COUNT(CASE WHEN i.type = 'index' AND i.name NOT LIKE 'sqlite_%' THEN 1 END) as index_count
FROM sqlite_master m
LEFT JOIN sqlite_master i ON i.tbl_name = m.name AND i.type = 'index'
WHERE m.type = 'table'
  AND m.name NOT LIKE 'sqlite_%'
GROUP BY m.name
ORDER BY m.name;
```

### テーブルスキーマ

```sql
-- 特定テーブルのカラム情報
PRAGMA table_info(users);

-- CREATE文の確認
SELECT sql
FROM sqlite_master
WHERE type = 'table' AND name = 'users';
```

## インデックス統計

### すべてのインデックス

```sql
SELECT
  name as index_name,
  tbl_name as table_name,
  sql
FROM sqlite_master
WHERE type = 'index'
  AND name NOT LIKE 'sqlite_%'
ORDER BY tbl_name, name;
```

### テーブル別インデックス一覧

```sql
SELECT
  m.name as table_name,
  i.name as index_name,
  i.sql
FROM sqlite_master m
INNER JOIN sqlite_master i ON i.tbl_name = m.name
WHERE m.type = 'table'
  AND i.type = 'index'
  AND m.name NOT LIKE 'sqlite_%'
  AND i.name NOT LIKE 'sqlite_%'
ORDER BY m.name, i.name;
```

### インデックスの詳細情報

```sql
-- インデックスのカラム情報
PRAGMA index_info(idx_users_email);

-- インデックスが使用されているか確認（クエリプランで）
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';
```

## 統計情報（sqlite_stat1）

### テーブル統計

```sql
-- ANALYZE実行後に利用可能
SELECT * FROM sqlite_stat1
WHERE tbl LIKE 'users%';

-- 統計情報の更新
ANALYZE;
```

## データベース整合性

### 整合性チェック

```sql
-- データベース全体の整合性チェック
PRAGMA integrity_check;

-- 高速チェック（サンプリング）
PRAGMA quick_check;

-- 外部キー制約チェック
PRAGMA foreign_key_check;

-- 特定テーブルの外部キー制約チェック
PRAGMA foreign_key_check(users);
```

## パフォーマンス設定

### 現在の設定確認

```sql
-- 主要な設定一覧
PRAGMA cache_size;         -- キャッシュサイズ（ページ数）
PRAGMA page_size;          -- ページサイズ（バイト）
PRAGMA journal_mode;       -- ジャーナルモード（WAL推奨）
PRAGMA synchronous;        -- 同期モード（1=NORMAL推奨）
PRAGMA temp_store;         -- 一時テーブル保存場所（2=MEMORY推奨）
PRAGMA mmap_size;          -- メモリマップサイズ
PRAGMA auto_vacuum;        -- 自動VACUUM設定
```

### パフォーマンス設定の最適化

```sql
-- 推奨設定
PRAGMA journal_mode = WAL;        -- Write-Ahead Loggingで同時実行性向上
PRAGMA synchronous = NORMAL;      -- バランスの取れた同期モード
PRAGMA cache_size = 10000;        -- キャッシュサイズを増加（10000ページ = 約40MB）
PRAGMA temp_store = MEMORY;       -- 一時データをメモリに保存
PRAGMA mmap_size = 268435456;     -- メモリマップを256MBに設定

-- 設定の永続化（毎回実行が必要）
-- アプリケーション起動時に実行
```

## VACUUM と最適化

### データベースの最適化

```sql
-- 通常のVACUUM（データベースファイルを圧縮）
VACUUM;

-- テーブル名とページ数の確認
PRAGMA page_count;

-- VACUUMが必要かどうかの判断
-- フラグメンテーションが多い場合にVACUUMを実行
PRAGMA freelist_count;  -- 未使用ページ数
```

### AUTO VACUUM設定

```sql
-- 現在の設定確認
PRAGMA auto_vacuum;

-- 設定変更（0=OFF, 1=FULL, 2=INCREMENTAL）
-- 注: 既存データベースでは即座に有効にならない
PRAGMA auto_vacuum = FULL;
VACUUM;  -- 設定を有効化
```

## クエリ最適化

### EXPLAIN QUERY PLAN

```sql
-- クエリプランの確認
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';

-- 複雑なクエリのプラン
EXPLAIN QUERY PLAN
SELECT u.*, o.*
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.is_active = 1
ORDER BY o.created_at DESC;
```

### クエリ実行時間測定

```sql
-- タイマーを有効化
.timer on

-- クエリを実行
SELECT COUNT(*) FROM users;

-- 出力例:
-- Run Time: real 0.001 user 0.000428 sys 0.000171
```

## トランザクションとロック

### トランザクション状態

```sql
-- 現在のトランザクション状態
-- SQLiteには専用のクエリがないため、アプリケーションレベルで管理
```

### ロックモード確認

```sql
-- データベースのロック状態
PRAGMA locking_mode;

-- WALモードのチェックポイント情報
PRAGMA wal_checkpoint;
```

## メモリ使用状況

### メモリ統計

```sql
-- 現在のメモリ使用量（バイト）
SELECT * FROM pragma_page_count() * (SELECT * FROM pragma_page_size());

-- キャッシュ使用状況
-- SQLiteには詳細なメモリ統計がない
-- OSレベルのツール（ps, top等）を使用
```

## データベースファイル情報

### ファイルサイズ

```sql
-- データベースのページ数とサイズ
SELECT
  (SELECT * FROM pragma_page_count()) as page_count,
  (SELECT * FROM pragma_page_size()) as page_size,
  (SELECT * FROM pragma_page_count()) * (SELECT * FROM pragma_page_size()) as database_size_bytes;

-- WALファイルのサイズ
-- OSコマンドで確認: ls -lh database.db-wal
```

## 監視ダッシュボード用サマリー

### 総合ヘルスチェック

```sql
-- データベース基本情報
SELECT
  sqlite_version() as version,
  (SELECT * FROM pragma_page_count()) as page_count,
  (SELECT * FROM pragma_page_size()) as page_size,
  (SELECT * FROM pragma_freelist_count()) as freelist_count,
  (SELECT * FROM pragma_cache_size()) as cache_size,
  (SELECT * FROM pragma_journal_mode()) as journal_mode,
  (SELECT * FROM pragma_synchronous()) as synchronous;
```

### テーブルとインデックスのサマリー

```sql
SELECT
  (SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%') as table_count,
  (SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%') as index_count,
  (SELECT COUNT(*) FROM sqlite_master WHERE type = 'trigger') as trigger_count,
  (SELECT COUNT(*) FROM sqlite_master WHERE type = 'view') as view_count;
```

## チェックリスト

### 日次監視

- [ ] データベースサイズの確認
- [ ] PRAGMA integrity_checkの実行
- [ ] アプリケーションログでの遅いクエリ確認

### 週次監視

- [ ] 未使用インデックスの確認
- [ ] PRAGMA freelist_countで未使用ページ確認
- [ ] WALファイルサイズの確認

### 月次レビュー

- [ ] ANALYZEの実行
- [ ] VACUUMの必要性確認
- [ ] データベース設定の見直し
- [ ] パフォーマンスレポートの作成

## 注意事項

### SQLiteの制限とTursoでの対応

SQLiteには以下のような制限がありますが、Tursoでは一部補完されています:

- **クエリ統計機能なし**: 組み込みのクエリ統計機能がない
  - 解決策: アプリケーションレベルでログ・計測
  - Turso: ダッシュボードで一部の統計情報を提供

- **リアルタイム統計なし**: 実行中のクエリやロック情報を直接取得できない
  - 解決策: WALモードで同時実行性を向上、アプリケーションで監視
  - Turso: 分散環境で自動的にWALモードを管理

- **詳細なメモリ統計なし**: メモリ使用量の詳細情報がない
  - 解決策: OSレベルのツールを使用（ローカル環境）
  - Turso: クラウド環境でリソース管理を自動化

### 推奨監視手法

1. **アプリケーションログ**: クエリ実行時間をアプリケーションで計測
2. **EXPLAIN QUERY PLAN**: 定期的にクエリプランを確認
3. **ANALYZE**: データ変更後に定期実行
4. **integrity_check**: 定期的な整合性チェック
5. **VACUUM**: フラグメンテーション解消のため定期実行
6. **Tursoダッシュボード**: クラウド環境でのメトリクス確認（クエリ数、レイテンシ、レプリカ同期状態）
