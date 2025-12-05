# EXPLAIN QUERY PLANガイド

## 基本構文

```sql
-- 基本的なEXPLAIN QUERY PLAN
EXPLAIN QUERY PLAN SELECT * FROM users WHERE id = 1;

-- 実行時間を測定
.timer on
SELECT * FROM users WHERE id = 1;

-- 詳細情報を取得（推奨パターン）
.eqp on
.timer on
SELECT * FROM users WHERE id = 1;
```

## オプション一覧

| コマンド           | 説明                             | 推奨       |
| ------------------ | -------------------------------- | ---------- |
| EXPLAIN QUERY PLAN | クエリ実行計画を表示             | ✅         |
| .timer on          | 実行時間を測定                   | ✅         |
| .eqp on            | クエリ実行時に自動的にプラン表示 | 開発時     |
| .eqp full          | より詳細なプラン表示             | 必要時のみ |

## 実行計画の読み方

### 基本構造

```
QUERY PLAN
|--SEARCH TABLE users USING INDEX idx_users_email (email=?)
```

または

```
--SCAN TABLE users
```

### 各要素の解説

```
SEARCH TABLE users USING INDEX idx_users_email (email=?)
  │      │           │          │
  │      │           │          └─ 使用されるインデックス名と検索条件
  │      │           └─ インデックスを使用
  │      └─ 対象テーブル
  └─ 操作種類（SEARCH = インデックス使用、SCAN = フルスキャン）

SCAN TABLE users
  │      │
  │      └─ 対象テーブル
  └─ フルテーブルスキャン
```

## スキャン種類

### SCAN TABLE（フルテーブルスキャン）

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE name LIKE '%test%';
```

```
SCAN TABLE users
```

**特徴**:

- テーブル全体を読み込む
- 小さいテーブルでは最適な場合も
- LIKE '%...' はインデックスを使えない
- 大量データでは避けるべき

### SEARCH (インデックススキャン)

```sql
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'user@example.com';
```

```
SEARCH TABLE users USING INDEX idx_users_email (email=?)
```

**特徴**:

- インデックスを使用してテーブルにアクセス
- 選択性が高い場合に効率的
- インデックスとテーブルの両方を読む

### SEARCH (カバリングインデックス)

```sql
EXPLAIN QUERY PLAN SELECT email FROM users WHERE email = 'user@example.com';
```

```
SEARCH TABLE users USING COVERING INDEX idx_users_email (email=?)
```

**特徴**:

- インデックスのみでクエリを完結
- テーブルアクセス不要（最も効率的）
- SELECT句のカラムがすべてインデックスに含まれる

### USE TEMP B-TREE（一時インデックス）

```sql
EXPLAIN QUERY PLAN SELECT * FROM users ORDER BY created_at;
```

```
SCAN TABLE users
USE TEMP B-TREE FOR ORDER BY
```

**特徴**:

- ソートのために一時的なインデックスを作成
- パフォーマンス低下の原因になりうる
- 適切なインデックス追加で回避可能

### AUTOMATIC INDEX（自動インデックス）

```sql
EXPLAIN QUERY PLAN
SELECT * FROM users u
JOIN orders o ON u.id = o.user_id;
```

```
SCAN TABLE users
SEARCH TABLE orders USING AUTOMATIC COVERING INDEX (user_id=?)
```

**特徴**:

- SQLiteが自動的に作成する一時インデックス
- パフォーマンス改善の機会を示唆
- 永続的なインデックス作成を検討すべき

## JOIN操作

### Nested Loop (基本パターン)

```sql
EXPLAIN QUERY PLAN
SELECT u.*, o.*
FROM users u
JOIN orders o ON u.id = o.user_id;
```

```
SCAN TABLE users AS u
SEARCH TABLE orders AS o USING INDEX idx_orders_user_id (user_id=?)
```

**特徴**:

- SQLiteの基本的なJOIN実装
- 外側テーブルの各行に対して内側をスキャン
- 内側にインデックスがあると効率的

### 複数テーブルJOIN

```sql
EXPLAIN QUERY PLAN
SELECT u.*, o.*, p.*
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN products p ON o.product_id = p.id;
```

```
SCAN TABLE users AS u
SEARCH TABLE orders AS o USING INDEX idx_orders_user_id (user_id=?)
SEARCH TABLE products AS p USING INDEX sqlite_autoindex_products_1 (id=?)
```

**特徴**:

- JOIN順序が実行計画に影響
- 最初のテーブルは通常SCANされる
- 後続テーブルはインデックスでSEARCHされる

## 実行時間の測定

### .timer on の使用

```sql
.timer on
SELECT * FROM users WHERE email = 'user@example.com';
```

出力例:

```
Run Time: real 0.001 user 0.000428 sys 0.000171
```

| 指標 | 意味                      | 目安           |
| ---- | ------------------------- | -------------- |
| real | 実際の経過時間            | 主要な改善指標 |
| user | CPU時間（ユーザーモード） | 計算負荷の指標 |
| sys  | CPU時間（システムモード） | I/O負荷の指標  |

## よくある問題パターン

### 1. インデックスが使われない

```
SCAN TABLE users
```

**問題**: インデックスがあるのにSCAN TABLE
**原因**:

- 統計情報が古い（ANALYZE未実行）
- WHERE句に関数を適用
- データ型の不一致
- 小さいテーブル（フルスキャンの方が高速）

**解決**:

```sql
-- 統計情報の更新
ANALYZE;

-- インデックスの確認
SELECT * FROM sqlite_master WHERE type = 'index' AND tbl_name = 'users';
```

### 2. USE TEMP B-TREE

```
SCAN TABLE users
USE TEMP B-TREE FOR ORDER BY
```

**問題**: ソートのための一時インデックス作成
**解決**: ORDER BYカラムにインデックスを追加

```sql
CREATE INDEX idx_users_created ON users(created_at);
```

### 3. AUTOMATIC INDEX

```
SEARCH TABLE orders USING AUTOMATIC COVERING INDEX (user_id=?)
```

**問題**: 自動作成インデックスに依存
**解決**: 永続的なインデックスを作成

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 4. 複雑なJOIN順序

```
SCAN TABLE large_table
SEARCH TABLE small_table USING INDEX ...
```

**問題**: 大きいテーブルを先にスキャン
**解決**: FROM句の順序を変更、またはサブクエリで絞り込み

```sql
-- 小さいテーブルを先に
SELECT * FROM small_table s
JOIN large_table l ON s.id = l.small_id;
```

## チェックリスト

### 分析時

- [ ] EXPLAIN QUERY PLANを使用しているか？
- [ ] .timer onで実行時間を測定しているか？
- [ ] 本番データまたは類似のデータ量で実行しているか？
- [ ] 複数回実行してキャッシュ効果を確認したか？

### 解釈時

- [ ] SCANではなくSEARCHが使われているか？
- [ ] AUTOMATIC INDEXが表示されていないか？
- [ ] USE TEMP B-TREEが必要以上に使われていないか？
- [ ] JOIN順序は適切か？

### 改善後

- [ ] 改善前後のEXPLAIN QUERY PLANを比較したか？
- [ ] 実行時間が改善したか？
- [ ] 他のクエリへの影響がないか確認したか？
- [ ] ANALYZEを実行して統計情報を更新したか？
