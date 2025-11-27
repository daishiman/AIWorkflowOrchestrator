# インデックス戦略ガイド

## インデックスの基本

### B-treeインデックス（デフォルト）

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

### 部分インデックス（Partial Index）

```sql
-- アクティブユーザーのみインデックス
CREATE INDEX idx_users_active ON users(email)
WHERE is_active = true;

-- 未処理注文のみインデックス
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';
```

**適用場面**:
- 特定条件のデータのみ頻繁にクエリされる
- インデックスサイズを削減したい
- カーディナリティが低いカラムの条件

### カバリングインデックス（Covering Index）

```sql
-- よく取得するカラムを含める
CREATE INDEX idx_users_email_name ON users(email) INCLUDE (name, created_at);
```

**適用場面**:
- Index Only Scanを実現したい
- 特定のクエリパターンを最適化

### GINインデックス

```sql
-- 配列カラム
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- JSONB
CREATE INDEX idx_data_gin ON documents USING GIN(data);

-- 全文検索
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('english', content));
```

**適用場面**:
- 配列の要素検索: `WHERE tags @> ARRAY['postgresql']`
- JSONBのキー/値検索
- 全文検索

### GiSTインデックス

```sql
-- 範囲型
CREATE INDEX idx_events_during ON events USING GIST(during);

-- 地理データ（PostGIS）
CREATE INDEX idx_locations_geom ON locations USING GIST(geom);
```

**適用場面**:
- 範囲の重なり検索
- 地理的検索
- 近傍検索

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
column_order:
  1. 等値条件のカラム（選択性が高い順）
  2. 範囲条件のカラム
  3. ORDER BY/GROUP BYのカラム
  4. SELECT句で使うカラム（INCLUDE）

example:
  query: |
    SELECT id, name
    FROM orders
    WHERE user_id = ? AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 10

  optimal_index: |
    CREATE INDEX idx_orders_optimal
    ON orders(user_id, status, created_at DESC)
    INCLUDE (name);
```

## インデックスの選択性

### カーディナリティの確認

```sql
-- カラムごとのカーディナリティを確認
SELECT
  'email' as column_name,
  COUNT(DISTINCT email)::float / COUNT(*) as selectivity
FROM users
UNION ALL
SELECT
  'status',
  COUNT(DISTINCT status)::float / COUNT(*)
FROM users;
```

| 選択性 | 例 | インデックス推奨 |
|--------|-----|----------------|
| 高 (>0.9) | id, email | ✅ 非常に効果的 |
| 中 (0.1-0.9) | category | ✅ 条件付きで効果的 |
| 低 (<0.1) | is_active, gender | ⚠️ 部分インデックス推奨 |

### 低選択性カラムの対処

```sql
-- ❌ 非効率
CREATE INDEX idx_users_active ON users(is_active);

-- ✅ 部分インデックスを使用
CREATE INDEX idx_users_active ON users(created_at)
WHERE is_active = true;

-- ✅ 複合インデックスの後ろに配置
CREATE INDEX idx_users_email_active ON users(email, is_active);
```

## インデックスのメンテナンス

### 未使用インデックスの特定

```sql
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 重複インデックスの特定

```sql
SELECT
  pg_size_pretty(SUM(pg_relation_size(idx))::bigint) AS size,
  array_agg(idx) AS indexes
FROM (
  SELECT
    indexrelid::regclass AS idx,
    (indrelid::text || E'\n' || indclass::text || E'\n' || indkey::text) AS key
  FROM pg_index
) sub
GROUP BY key
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;
```

### インデックスの肥大化確認

```sql
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

### インデックスの再構築

```sql
-- オンラインで再構築（推奨）
REINDEX INDEX CONCURRENTLY idx_users_email;

-- テーブルの全インデックスを再構築
REINDEX TABLE CONCURRENTLY users;
```

## 本番環境での安全な操作

### CONCURRENTLYオプション

```sql
-- ✅ ロックを最小化（推奨）
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
DROP INDEX CONCURRENTLY idx_users_email;

-- ❌ テーブルロックが発生
CREATE INDEX idx_users_email ON users(email);
```

### 大規模テーブルでの注意

```yaml
precautions:
  - CONCURRENTLY を常に使用
  - 低負荷時間帯に実行
  - インデックス作成時間を事前に見積もり
  - ストレージ空き容量を確認（元サイズの2倍程度必要）
  - 進捗の監視方法を用意

monitoring:
  # インデックス作成の進捗確認
  query: |
    SELECT
      a.query,
      p.phase,
      round(p.blocks_done / p.blocks_total::numeric * 100, 2) AS "% complete"
    FROM pg_stat_activity a
    JOIN pg_stat_progress_create_index p ON p.pid = a.pid;
```

## チェックリスト

### 新規インデックス作成時
- [ ] クエリパターンを分析したか？
- [ ] 選択性を確認したか？
- [ ] 複合インデックスのカラム順序は適切か？
- [ ] 部分インデックスが適切か検討したか？
- [ ] CONCURRENTLYを使用しているか？
- [ ] 作成後にEXPLAIN ANALYZEで効果を確認したか？

### 定期メンテナンス
- [ ] 未使用インデックスを特定したか？
- [ ] 重複インデックスがないか？
- [ ] 肥大化したインデックスを再構築したか？
- [ ] 統計情報を更新したか（ANALYZE）？
