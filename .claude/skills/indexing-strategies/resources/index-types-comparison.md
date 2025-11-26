# PostgreSQL インデックスタイプ詳細比較

## 概要

PostgreSQL は複数のインデックスタイプを提供し、それぞれ異なるユースケースに最適化されています。
このリソースでは、各インデックスタイプの詳細な特性と選択基準を解説します。

---

## インデックスタイプ比較表

| 特性 | B-Tree | GIN | GiST | BRIN | Hash |
|------|--------|-----|------|------|------|
| **等価検索** | ◎ | ○ | ○ | △ | ◎ |
| **範囲検索** | ◎ | × | ○ | ◎ | × |
| **配列/JSONB** | × | ◎ | △ | × | × |
| **全文検索** | × | ◎ | ○ | × | × |
| **地理データ** | × | × | ◎ | × | × |
| **ソート** | ◎ | × | × | × | × |
| **インデックスサイズ** | 中 | 大 | 中 | 小 | 小 |
| **更新コスト** | 低 | 高 | 中 | 低 | 低 |
| **大規模テーブル** | ○ | △ | ○ | ◎ | ○ |

◎: 非常に適している, ○: 適している, △: 条件付き, ×: 不適

---

## B-Tree インデックス詳細

### 内部構造

B-Treeは平衡木構造で、すべての葉ノードが同じ深さにあります。

```
        [Root Node]
       /     |     \
    [Node]  [Node]  [Node]
    / | \   / | \   / | \
  [L] [L] [L] [L] [L] [L] ... Leaf Nodes
```

### サポートする演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `=` | 等価 | `WHERE id = 123` |
| `<` | より小さい | `WHERE age < 30` |
| `<=` | 以下 | `WHERE price <= 100` |
| `>` | より大きい | `WHERE created_at > '2024-01-01'` |
| `>=` | 以上 | `WHERE score >= 80` |
| `BETWEEN` | 範囲 | `WHERE date BETWEEN '2024-01-01' AND '2024-12-31'` |
| `IS NULL` | NULL検査 | `WHERE deleted_at IS NULL` |
| `IS NOT NULL` | NOT NULL検査 | `WHERE email IS NOT NULL` |
| `LIKE` | 前方一致のみ | `WHERE name LIKE 'John%'` |

### 最適化オプション

```sql
-- 降順インデックス（DESC ソートが頻繁な場合）
CREATE INDEX idx_orders_created_desc ON orders (created_at DESC);

-- NULLS FIRST/LAST
CREATE INDEX idx_users_deleted ON users (deleted_at NULLS LAST);

-- フィルファクター調整（更新頻度が高いテーブル）
CREATE INDEX idx_sessions_token ON sessions (token) WITH (fillfactor = 80);
```

---

## GIN インデックス詳細

### 内部構造

GIN（Generalized Inverted Index）は転置インデックス構造で、値からキーへのマッピングを保持します。

```
値 → [キーのリスト]
"tag1" → [row1, row3, row5, row8]
"tag2" → [row2, row3, row6]
"tag3" → [row1, row4, row7]
```

### サポートする演算子（JSONB）

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `@>` | 含む | `WHERE data @> '{"status": "active"}'` |
| `<@` | 含まれる | `WHERE '{"a": 1}' <@ data` |
| `?` | キー存在 | `WHERE data ? 'email'` |
| `?\|` | いずれかのキー | `WHERE data ?\| array['a', 'b']` |
| `?&` | すべてのキー | `WHERE data ?& array['a', 'b']` |
| `@?` | JSONパス存在 | `WHERE data @? '$.items[*]'` |
| `@@` | JSONパス述語 | `WHERE data @@ '$.price > 100'` |

### GINオプション

```sql
-- 高速更新（デフォルト: 有効）
-- 書き込みパフォーマンス向上、検索時にペンディングリストを走査
CREATE INDEX gin_data ON table USING gin(data) WITH (fastupdate = on);

-- ペンディングリストサイズ制限
CREATE INDEX gin_data ON table USING gin(data)
WITH (fastupdate = on, gin_pending_list_limit = 4MB);
```

### jsonb_path_ops vs デフォルト

```sql
-- デフォルト: すべてのJSONB演算子をサポート
CREATE INDEX gin_data_default ON table USING gin(data);

-- jsonb_path_ops: @> 演算子に特化（サイズ小、検索高速）
CREATE INDEX gin_data_path ON table USING gin(data jsonb_path_ops);
```

| 特性 | デフォルト | jsonb_path_ops |
|------|-----------|----------------|
| サポート演算子 | すべて | @>, @?, @@ のみ |
| インデックスサイズ | 大 | 小（約1/3） |
| 検索速度 | 速い | より速い |
| キー存在検査（?） | 可能 | 不可 |

---

## GiST インデックス詳細

### 内部構造

GiST（Generalized Search Tree）は、データを階層的に分割する汎用検索木です。

### 主な用途

#### 1. 地理データ（PostGIS）

```sql
-- 地理インデックス
CREATE INDEX gist_locations ON locations USING gist(geom);

-- 近傍検索
SELECT * FROM locations
WHERE ST_DWithin(geom, ST_MakePoint(139.7, 35.6)::geography, 1000);
```

#### 2. 範囲型

```sql
-- 日付範囲
CREATE TABLE events (
  id INT PRIMARY KEY,
  during TSRANGE
);

CREATE INDEX gist_events_during ON events USING gist(during);

-- 重複検索
SELECT * FROM events WHERE during && '[2024-01-01, 2024-02-01)';
```

#### 3. 全文検索（tsvector）

```sql
CREATE INDEX gist_posts_search ON posts USING gist(to_tsvector('japanese', content));
```

### GiST vs GIN（全文検索）

| 特性 | GiST | GIN |
|------|------|-----|
| 更新速度 | 速い | 遅い |
| 検索速度 | 遅い | 速い |
| インデックスサイズ | 小 | 大 |
| 推奨用途 | 更新頻繁 | 検索頻繁 |

---

## BRIN インデックス詳細

### 内部構造

BRIN（Block Range Index）は、ブロック範囲ごとに最小/最大値を保持します。

```
Block 0-127:   min=2024-01-01, max=2024-01-05
Block 128-255: min=2024-01-05, max=2024-01-10
Block 256-383: min=2024-01-10, max=2024-01-15
...
```

### 適用条件

1. **物理的順序**: データが挿入順または特定の順序で物理配置されている
2. **大規模テーブル**: 数百万行以上
3. **範囲検索**: 等価検索より範囲検索が多い

### 設計考慮事項

```sql
-- pages_per_range の調整
-- デフォルト: 128ページ
-- 小さい値: より精密、サイズ大
-- 大きい値: より粗い、サイズ小
CREATE INDEX brin_logs ON logs USING brin(created_at)
WITH (pages_per_range = 64);

-- autosummarize（自動サマリー更新）
CREATE INDEX brin_logs ON logs USING brin(created_at)
WITH (autosummarize = on);
```

### BRIN vs B-Tree（時系列データ）

| テーブルサイズ | B-Tree サイズ | BRIN サイズ | 検索速度差 |
|--------------|--------------|------------|-----------|
| 100万行 | ~25MB | ~48KB | B-Tree 2x速 |
| 1000万行 | ~250MB | ~480KB | B-Tree 1.5x速 |
| 1億行 | ~2.5GB | ~4.8MB | 同等〜BRIN有利 |

---

## Hash インデックス

### 特性

- 等価検索（=）のみサポート
- PostgreSQL 10以降でWALログ対応
- B-Treeより若干高速な等価検索
- 範囲検索、ソートは不可

### 使用場面

```sql
-- 長い文字列の等価検索
CREATE INDEX hash_long_text ON table USING hash(very_long_column);

-- UUIDの等価検索（ただしB-Treeでも十分）
CREATE INDEX hash_uuid ON table USING hash(id);
```

### 注意点

- 範囲検索やソートが必要な場合は使用不可
- 多くの場合、B-Treeで十分
- 使用前にベンチマーク推奨

---

## インデックス選択フローチャート

```
データ型は？
├─ スカラー型（int, varchar, timestamp等）
│   ├─ 等価検索のみ？
│   │   ├─ Yes: Hash（または B-Tree）
│   │   └─ No: B-Tree
│   └─ 大規模時系列？
│       ├─ Yes: BRIN
│       └─ No: B-Tree
│
├─ JSONB
│   ├─ @> のみ？
│   │   ├─ Yes: GIN (jsonb_path_ops)
│   │   └─ No: GIN (デフォルト)
│   └─ 更新頻繁？
│       └─ fastupdate = on
│
├─ 配列型
│   └─ GIN
│
├─ 地理データ
│   └─ GiST (PostGIS)
│
├─ 範囲型
│   └─ GiST
│
└─ 全文検索
    ├─ 更新頻繁？
    │   ├─ Yes: GiST
    │   └─ No: GIN
    └─ 検索頻繁？
        ├─ Yes: GIN
        └─ No: GiST
```

---

## パフォーマンス測定ガイド

### インデックス作成時間の見積もり

```sql
-- テーブルサイズの確認
SELECT pg_size_pretty(pg_relation_size('table_name'));

-- インデックス作成（CONCURRENTLY オプションでロック最小化）
CREATE INDEX CONCURRENTLY idx_name ON table_name (column);
```

### インデックスサイズの確認

```sql
SELECT
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### クエリパフォーマンスの比較

```sql
-- インデックス使用前
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM table WHERE condition;

-- インデックス作成後
CREATE INDEX idx_test ON table (column);

-- 再度実行して比較
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM table WHERE condition;
```
