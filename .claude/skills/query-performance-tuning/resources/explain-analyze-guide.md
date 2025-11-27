# EXPLAIN ANALYZEガイド

## 基本構文

```sql
-- 基本的なEXPLAIN
EXPLAIN SELECT * FROM users WHERE id = 1;

-- 実際の実行時間を取得
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 1;

-- 詳細情報を取得（推奨）
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE id = 1;

-- JSON形式で出力（プログラムでの解析用）
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM users WHERE id = 1;
```

## オプション一覧

| オプション | 説明 | 推奨 |
|-----------|------|------|
| ANALYZE | 実際に実行して時間を測定 | ✅ |
| BUFFERS | バッファ使用量を表示 | ✅ |
| COSTS | コスト見積もりを表示 | デフォルトON |
| TIMING | ノードごとの時間を表示 | デフォルトON |
| VERBOSE | 追加情報を表示 | 必要時のみ |
| FORMAT | 出力形式(TEXT/JSON/YAML/XML) | TEXT |

## 実行計画の読み方

### 基本構造

```
                                    QUERY PLAN
--------------------------------------------------------------------------------
 Index Scan using users_email_idx on users  (cost=0.28..8.30 rows=1 width=100)
   Index Cond: (email = 'user@example.com'::text)
   Buffers: shared hit=3
 Planning Time: 0.085 ms
 Execution Time: 0.035 ms
```

### 各要素の解説

```
Index Scan using users_email_idx on users
│         │                       │
│         │                       └─ 対象テーブル
│         └─ 使用インデックス
└─ 操作種類

(cost=0.28..8.30 rows=1 width=100)
       │     │      │       │
       │     │      │       └─ 行の推定バイト幅
       │     │      └─ 推定行数
       │     └─ 全行取得までのコスト
       └─ 最初の行取得までのコスト

(actual time=0.015..0.016 rows=1 loops=1)
              │       │      │      │
              │       │      │      └─ 繰り返し回数
              │       │      └─ 実際の行数
              │       └─ 全行取得までの時間(ms)
              └─ 最初の行取得までの時間(ms)
```

## スキャン種類

### Seq Scan（シーケンシャルスキャン）

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE name LIKE '%test%';
```

```
Seq Scan on users  (cost=0.00..35.50 rows=10 width=100)
  Filter: (name ~~ '%test%'::text)
  Rows Removed by Filter: 990
```

**特徴**:
- テーブル全体を読み込む
- 小さいテーブルでは最適な場合も
- LIKE '%...' はインデックスを使えない

### Index Scan（インデックススキャン）

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
```

```
Index Scan using users_email_idx on users  (cost=0.28..8.30 rows=1 width=100)
  Index Cond: (email = 'user@example.com'::text)
```

**特徴**:
- インデックスを使用してテーブルにアクセス
- 選択性が高い場合に効率的
- インデックスとテーブルの両方を読む

### Index Only Scan（インデックスオンリースキャン）

```sql
EXPLAIN ANALYZE SELECT email FROM users WHERE email = 'user@example.com';
```

```
Index Only Scan using users_email_idx on users  (cost=0.28..4.30 rows=1 width=50)
  Index Cond: (email = 'user@example.com'::text)
  Heap Fetches: 0
```

**特徴**:
- インデックスのみでクエリを完結
- テーブルアクセス不要（最も効率的）
- Heap Fetches: 0 が理想

### Bitmap Scan（ビットマップスキャン）

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id IN (1, 2, 3, 4, 5);
```

```
Bitmap Heap Scan on orders  (cost=4.35..15.68 rows=5 width=100)
  Recheck Cond: (user_id = ANY ('{1,2,3,4,5}'::integer[]))
  ->  Bitmap Index Scan on orders_user_id_idx  (cost=0.00..4.35 rows=5 width=0)
        Index Cond: (user_id = ANY ('{1,2,3,4,5}'::integer[]))
```

**特徴**:
- 中程度の選択性で効率的
- 複数インデックスの組み合わせが可能
- 2段階：Index Scan → Heap Scan

## JOIN操作

### Nested Loop

```
Nested Loop  (cost=0.28..16.60 rows=10 width=200)
  ->  Seq Scan on users  (cost=0.00..1.10 rows=10 width=100)
  ->  Index Scan using orders_user_id_idx on orders  (cost=0.28..1.55 rows=1 width=100)
        Index Cond: (user_id = users.id)
```

**特徴**:
- 外側テーブルの各行に対して内側をスキャン
- 小さいテーブル同士、または内側にインデックスがある場合に効率的
- loops値に注意（N+1問題の指標）

### Hash Join

```
Hash Join  (cost=1.25..2.53 rows=10 width=200)
  Hash Cond: (orders.user_id = users.id)
  ->  Seq Scan on orders  (cost=0.00..1.10 rows=10 width=100)
  ->  Hash  (cost=1.10..1.10 rows=10 width=100)
        ->  Seq Scan on users  (cost=0.00..1.10 rows=10 width=100)
```

**特徴**:
- 一方のテーブルでハッシュテーブルを構築
- 大きなテーブル同士のJOINに効率的
- メモリ使用量に注意

### Merge Join

```
Merge Join  (cost=2.25..4.50 rows=10 width=200)
  Merge Cond: (users.id = orders.user_id)
  ->  Index Scan using users_pkey on users  (cost=0.28..12.29 rows=10 width=100)
  ->  Index Scan using orders_user_id_idx on orders  (cost=0.28..12.29 rows=10 width=100)
```

**特徴**:
- 両テーブルがソート済みの場合に効率的
- 大きなテーブルで効果的
- ORDER BYと相性が良い

## バッファ情報の読み方

```
Buffers: shared hit=100 read=20
                 │       │
                 │       └─ ディスクから読み込んだブロック数
                 └─ キャッシュヒットしたブロック数
```

| 指標 | 意味 | 目指すべき状態 |
|------|------|--------------|
| shared hit | キャッシュヒット | 高いほど良い |
| shared read | ディスク読み込み | 低いほど良い |
| temp read/written | 一時ファイル | 0が理想 |

## よくある問題パターン

### 1. 統計情報の不一致

```
Seq Scan on users  (cost=0.00..35.50 rows=1 width=100)
  Filter: (status = 'active'::text)
  Rows Removed by Filter: 9999
```

**問題**: rows=1 と予測したが実際は10000行
**解決**: `ANALYZE users;` で統計情報を更新

### 2. 非効率なソート

```
Sort  (cost=100.00..102.50 rows=1000 width=100)
  Sort Key: created_at
  Sort Method: external merge  Disk: 1024kB
```

**問題**: メモリ不足でディスクソート
**解決**: work_memの増加、またはインデックス追加

### 3. 多すぎるloops

```
Index Scan using orders_user_id_idx on orders  (cost=0.28..8.30 rows=1 width=100)
  (actual time=0.020..0.025 rows=1 loops=10000)
```

**問題**: 10000回のIndex Scan（N+1問題）
**解決**: JOINまたはIN句に書き換え

## チェックリスト

### 分析時
- [ ] ANALYZE, BUFFERSオプションを使用しているか？
- [ ] 本番データまたは類似のデータ量で実行しているか？
- [ ] 複数回実行してキャッシュ効果を確認したか？

### 解釈時
- [ ] rows（推定）とactual rows（実際）の乖離を確認したか？
- [ ] Seq Scanが適切かどうか判断したか？
- [ ] loopsの値をチェックしたか？
- [ ] Buffers readが多すぎないか確認したか？

### 改善後
- [ ] 改善前後のEXPLAIN ANALYZEを比較したか？
- [ ] 実行時間が改善したか？
- [ ] 他のクエリへの影響がないか確認したか？
