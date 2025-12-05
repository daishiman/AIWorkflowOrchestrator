# インデックス戦略ガイド

## インデックスの基本

### B-treeインデックス（SQLiteの唯一のインデックス）

```sql
-- 単一カラムインデックス
CREATE INDEX idx_users_email ON users(email);

-- 複合インデックス（カラム順序が重要）
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- 一意インデックス
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

**適用場面**:

- 等値検索: `WHERE email = 'user@example.com'`
- 範囲検索: `WHERE created_at > '2024-01-01'`
- ORDER BY
- 外部キー

**注**: SQLiteはB-treeインデックスのみをサポート。PostgreSQLのようなHash、GIN、GiSTインデックスはありません。

### 部分インデックス（Partial Index）

```sql
-- アクティブユーザーのみインデックス
CREATE INDEX idx_users_active ON users(email) WHERE is_active = 1;

-- 未処理注文のみインデックス
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';

-- NULL以外の値のみインデックス
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
```

**適用場面**:

- 特定条件のデータのみ頻繁にクエリされる
- インデックスサイズを削減したい
- カーディナリティが低いカラムの条件

### 式インデックス（Expression Index）

```sql
-- 小文字変換した値にインデックス
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- 計算式にインデックス
CREATE INDEX idx_products_price_with_tax ON products(price * 1.1);

-- JSON抽出値にインデックス
CREATE INDEX idx_data_name ON documents(json_extract(data, '$.name'));
```

**適用場面**:

- WHERE句で関数を使用する場合
- 大文字小文字を区別しない検索
- 計算結果での検索

## 複合インデックスの設計

### カラム順序の重要性

```sql
-- インデックス: (user_id, status, created_at)

-- ✅ 効率的に使える
WHERE user_id = 1
WHERE user_id = 1 AND status = 'active'
WHERE user_id = 1 AND status = 'active' AND created_at > '2024-01-01'

-- ⚠️ 部分的に使える
WHERE user_id = 1 AND created_at > '2024-01-01'  -- statusをスキップ

-- ❌ 使えない
WHERE status = 'active'  -- 先頭カラムがない
WHERE created_at > '2024-01-01'  -- 先頭カラムがない
```

### 設計原則

```yaml
column_order: 1. 等値条件のカラム（選択性が高い順）
  2. 範囲条件のカラム
  3. ORDER BY/GROUP BYのカラム

example:
  query: |
    SELECT id, name
    FROM orders
    WHERE user_id = ? AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 10

  optimal_index: |
    CREATE INDEX idx_orders_optimal
    ON orders(user_id, status, created_at DESC);
```

## インデックスの選択性

### カーディナリティの確認

```sql
-- カラムごとのカーディナリティを確認
SELECT
  'email' as column_name,
  COUNT(DISTINCT email) * 1.0 / COUNT(*) as selectivity
FROM users
UNION ALL
SELECT
  'status',
  COUNT(DISTINCT status) * 1.0 / COUNT(*)
FROM users;
```

| 選択性       | 例                | インデックス推奨        |
| ------------ | ----------------- | ----------------------- |
| 高 (>0.9)    | id, email         | ✅ 非常に効果的         |
| 中 (0.1-0.9) | category          | ✅ 条件付きで効果的     |
| 低 (<0.1)    | is_active, gender | ⚠️ 部分インデックス推奨 |

### 低選択性カラムの対処

```sql
-- ❌ 非効率
CREATE INDEX idx_users_active ON users(is_active);

-- ✅ 部分インデックスを使用
CREATE INDEX idx_users_active ON users(created_at) WHERE is_active = 1;

-- ✅ 複合インデックスの後ろに配置
CREATE INDEX idx_users_email_active ON users(email, is_active);
```

## インデックスのメンテナンス

### 未使用インデックスの特定

SQLiteには直接的な統計情報がないため、アプリケーションレベルで監視:

```sql
-- すべてのインデックスを表示
SELECT
  name,
  tbl_name,
  sql
FROM sqlite_master
WHERE type = 'index'
  AND name NOT LIKE 'sqlite_%'
ORDER BY tbl_name, name;
```

### インデックスサイズの確認

```sql
-- データベース全体のページ数
PRAGMA page_count;

-- ページサイズ
PRAGMA page_size;

-- インデックス情報（手動で追跡が必要）
-- SQLiteはインデックスごとのサイズ情報を直接提供しない
```

### ANALYZE の実行

```sql
-- データベース全体を分析
ANALYZE;

-- 特定テーブルのみ分析
ANALYZE users;

-- 統計情報の確認
SELECT * FROM sqlite_stat1;
```

## 本番環境での安全な操作

### インデックス作成

```sql
-- 通常の作成（ロックあり）
CREATE INDEX idx_users_email ON users(email);

-- SQLiteにはCONCURRENTLYオプションはない
-- 代わりに：
-- 1. WALモードを使用（PRAGMA journal_mode=WAL）
-- 2. 負荷の低い時間帯に実行
-- 3. バックアップを事前に取得
```

### WALモードの設定

```sql
-- WALモードに変更（同時読み取りを改善）
PRAGMA journal_mode = WAL;

-- 現在のモードを確認
PRAGMA journal_mode;
```

## インデックスのパフォーマンス最適化

### カバリングインデックス

```sql
-- よく取得するカラムを含める
CREATE INDEX idx_orders_covering
ON orders(user_id, status, created_at, amount);

-- EXPLAIN QUERY PLANで確認
EXPLAIN QUERY PLAN
SELECT amount, created_at
FROM orders
WHERE user_id = ? AND status = 'active';

-- 出力: SEARCH ... USING COVERING INDEX
```

### 降順インデックス

```sql
-- 降順ソート用インデックス
CREATE INDEX idx_posts_created_desc ON posts(created_at DESC);

-- 両方向のソートをサポート
CREATE INDEX idx_posts_user_date
ON posts(user_id ASC, created_at DESC);
```

### インデックスヒント（SQLiteには限定的）

```sql
-- SQLiteは自動的にインデックスを選択
-- 明示的なヒントはないが、INDEXED BY句で強制可能
SELECT * FROM users INDEXED BY idx_users_email
WHERE email = 'user@example.com';

-- インデックスを使わないことを強制
SELECT * FROM users NOT INDEXED
WHERE email = 'user@example.com';
```

## よくある最適化パターン

### パターン1: LIKE検索の最適化

```sql
-- ❌ 前方一致以外はインデックス不可
WHERE name LIKE '%test%'

-- ✅ 前方一致はインデックス使用可能
WHERE name LIKE 'test%'

-- ✅ FTS (Full-Text Search) 仮想テーブルを使用
CREATE VIRTUAL TABLE users_fts USING fts5(name, email);
INSERT INTO users_fts SELECT name, email FROM users;
SELECT * FROM users_fts WHERE users_fts MATCH 'test';
```

### パターン2: OR条件の最適化

```sql
-- ❌ ORは複数インデックスを使えないことがある
WHERE email = 'a@example.com' OR name = 'test'

-- ✅ UNIONに書き換え
SELECT * FROM users WHERE email = 'a@example.com'
UNION
SELECT * FROM users WHERE name = 'test';
```

### パターン3: NULL検索

```sql
-- IS NULLもインデックスを使用可能
CREATE INDEX idx_users_phone ON users(phone);
SELECT * FROM users WHERE phone IS NULL;

-- 部分インデックスでNULL以外を効率化
CREATE INDEX idx_users_phone_not_null
ON users(phone) WHERE phone IS NOT NULL;
```

## チェックリスト

### 新規インデックス作成時

- [ ] EXPLAIN QUERY PLANでクエリパターンを分析したか？
- [ ] 選択性を確認したか？
- [ ] 複合インデックスのカラム順序は適切か？
- [ ] 部分インデックスが適切か検討したか？
- [ ] WALモードを有効にしているか？
- [ ] 作成後にANALYZEを実行したか？

### 定期メンテナンス

- [ ] 未使用インデックスを確認したか？
- [ ] PRAGMA integrity_checkを実行したか？
- [ ] ANALYZEを定期的に実行しているか？
- [ ] データベースサイズの増加を監視しているか？

## SQLiteのインデックス制限事項

### SQLiteの特性とTursoでの考慮点

| 機能                   | SQLite      | Turso（libSQL）          |
| ---------------------- | ----------- | ------------------------ |
| インデックスタイプ     | B-tree のみ | B-tree のみ              |
| CONCURRENT作成         | ❌          | ❌                       |
| 部分インデックス       | ✅          | ✅                       |
| 式インデックス         | ✅          | ✅                       |
| カバリングインデックス | ✅ (暗黙的) | ✅ (暗黙的)              |
| オンライン再構築       | ❌          | ❌（レプリカで代替可能） |
| WALモード              | ✅          | ✅（分散環境で自動管理） |

### 回避策

```sql
-- インデックス再構築が必要な場合
-- 1. 新しいインデックスを作成
CREATE INDEX idx_users_email_new ON users(email);

-- 2. 古いインデックスを削除
DROP INDEX idx_users_email;

-- 3. 新しいインデックスをリネーム（ALTER TABLEで間接的に）
-- SQLiteは直接リネームできないため、アプリケーションコードで対応
```

## ベストプラクティス

### すべきこと

1. **WALモードを使用**: 同時実行性の向上
2. **ANALYZEを定期実行**: 統計情報を最新に保つ
3. **部分インデックスを活用**: メモリ効率の向上
4. **式インデックスを検討**: 関数適用検索の高速化

### 避けるべきこと

1. **過剰なインデックス**: 書き込み性能の低下
2. **低選択性カラムの単独インデックス**: 効果が薄い
3. **ANALYZEの怠慢**: 不正確なクエリプラン
4. **トランザクション外でのインデックス作成**: ロールバック不可
