# 実行計画分析手法

## 実行計画とは

データベースがクエリを実行する際の具体的な処理手順。
最適化判断の根拠となる重要な情報を提供する。

## PostgreSQL: EXPLAIN ANALYZE

### 基本的な使い方

```sql
-- 推定値のみ
EXPLAIN SELECT * FROM workflows WHERE status = 'PENDING';

-- 実際の実行結果を含む（推奨）
EXPLAIN ANALYZE SELECT * FROM workflows WHERE status = 'PENDING';

-- 詳細情報を含む
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM workflows WHERE status = 'PENDING';
```

### 出力の読み方

```
Seq Scan on workflows  (cost=0.00..12.50 rows=100 width=256) (actual time=0.015..0.089 rows=85 loops=1)
  Filter: (status = 'PENDING')
  Rows Removed by Filter: 15
Planning Time: 0.123 ms
Execution Time: 0.112 ms
```

**構成要素**:
- `Seq Scan`: スキャン方法
- `cost=0.00..12.50`: 推定コスト（開始..終了）
- `rows=100`: 推定行数
- `actual time=0.015..0.089`: 実際の実行時間（ミリ秒）
- `rows=85`: 実際の行数
- `loops=1`: ループ回数

## スキャン方法

### Seq Scan（シーケンシャルスキャン）

**説明**: テーブル全体を先頭から順にスキャン

**特徴**:
- インデックスを使用しない
- 小規模テーブルでは効率的
- 大規模テーブルでは遅い

**出現時の対応**:
```
Seq Scan on large_table ...
```
→ インデックスの追加を検討

### Index Scan

**説明**: インデックスを使用して行を特定

**特徴**:
- 選択性が高い条件で効率的
- テーブルへのランダムアクセスが発生

**望ましい状態**:
```
Index Scan using idx_workflows_status on workflows ...
```

### Index Only Scan

**説明**: インデックスのみで結果を返却（最速）

**特徴**:
- テーブルへのアクセスが不要
- カバリングインデックスが必要

**最も効率的**:
```
Index Only Scan using idx_workflows_status_name on workflows ...
```

### Bitmap Index Scan

**説明**: インデックスからビットマップを作成してスキャン

**特徴**:
- 中程度の選択性で使用
- 複数インデックスの組み合わせが可能

## JOIN方法

### Nested Loop

**説明**: 外側テーブルの各行に対して内側テーブルを検索

**適用場面**:
- 小規模なテーブル同士
- 内側テーブルにインデックスがある場合

```
Nested Loop  (cost=... rows=...)
  -> Seq Scan on small_table
  -> Index Scan using idx_... on large_table
```

### Hash Join

**説明**: 小さいテーブルからハッシュテーブルを作成して結合

**適用場面**:
- 大規模なテーブル同士
- 等価条件での結合

```
Hash Join  (cost=... rows=...)
  -> Seq Scan on large_table_a
  -> Hash
       -> Seq Scan on large_table_b
```

### Merge Join

**説明**: ソートされたデータを順番に結合

**適用場面**:
- 大規模データ
- ソート済みまたはインデックスがある場合

```
Merge Join  (cost=... rows=...)
  -> Index Scan using idx_a on table_a
  -> Index Scan using idx_b on table_b
```

## 問題パターンと対策

### 問題1: 大規模テーブルのSeq Scan

**検出**:
```
Seq Scan on workflows  (cost=0.00..15000.00 rows=1000000 ...)
```

**原因**:
- インデックスがない
- インデックスが使用されない条件

**対策**:
1. 適切なインデックスを追加
2. WHERE句の条件を見直し
3. 関数使用を避ける

### 問題2: 大量の行が除外される

**検出**:
```
Rows Removed by Filter: 999900
```

**原因**:
- フィルタがインデックスで処理されていない

**対策**:
1. フィルタ条件に対応するインデックスを追加
2. クエリの書き換え

### 問題3: 不適切なJOIN方法

**検出**:
```
Nested Loop  (cost=0.00..1500000.00 rows=1000000 ...)
  -> Seq Scan on large_table_a
  -> Seq Scan on large_table_b
```

**原因**:
- JOIN条件にインデックスがない
- 統計情報が古い

**対策**:
1. JOIN条件のカラムにインデックスを追加
2. `ANALYZE`で統計情報を更新
3. クエリの書き換え

### 問題4: 推定値と実際の乖離

**検出**:
```
(rows=100) (actual ... rows=100000 ...)
```

**原因**:
- 統計情報が古い
- 相関のある条件

**対策**:
1. `ANALYZE`で統計情報を更新
2. `CREATE STATISTICS`で相関情報を追加

## 実行計画分析チェックリスト

### 基本チェック

- [ ] Seq Scanが大規模テーブルで発生していないか？
- [ ] 推定行数と実際の行数に大きな乖離がないか？
- [ ] 適切なJOIN方法が選択されているか？

### インデックス活用チェック

- [ ] WHERE句の条件がインデックスで処理されているか？
- [ ] JOIN条件がインデックスを使用しているか？
- [ ] ORDER BY がインデックスを活用しているか？

### パフォーマンスチェック

- [ ] 実行時間は許容範囲内か？
- [ ] バッファヒット率は高いか？
- [ ] 一時ファイルが使用されていないか？

## ツールとコマンド

### 統計情報の更新

```sql
-- テーブルの統計情報を更新
ANALYZE workflows;

-- データベース全体
ANALYZE;
```

### インデックスの確認

```sql
-- テーブルのインデックス一覧
\di workflows*

-- インデックスの使用状況
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'workflows';
```

### キャッシュの確認

```sql
-- バッファキャッシュのヒット率
SELECT
  relname,
  heap_blks_read,
  heap_blks_hit,
  round(heap_blks_hit::numeric / (heap_blks_hit + heap_blks_read), 4) as hit_ratio
FROM pg_statio_user_tables
WHERE heap_blks_read > 0;
```

## 最適化の優先順位

1. **Seq Scanの解消**: インデックス追加
2. **JOIN方法の最適化**: インデックス追加、統計更新
3. **推定値の改善**: 統計情報の更新
4. **SELECT句の最適化**: 必要なカラムのみ取得
