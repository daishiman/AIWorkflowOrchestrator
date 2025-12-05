# EXPLAIN QUERY PLAN 完全ガイド

## 概要

SQLiteの`EXPLAIN QUERY PLAN`は、クエリの実行計画を分析するための最も重要なツールです。

---

## 基本構文

```sql
EXPLAIN QUERY PLAN クエリ;
```

### 使用例

```sql
-- 基本的な使い方
EXPLAIN QUERY PLAN SELECT * FROM workflows WHERE status = 'PENDING';

-- JOINを含むクエリ
EXPLAIN QUERY PLAN
SELECT w.*, u.name
FROM workflows w
LEFT JOIN users u ON u.id = w.user_id
WHERE w.status = 'PENDING';
```

---

## 出力の読み方

### 基本構造

```
QUERY PLAN
|--SEARCH TABLE workflows USING INDEX idx_workflows_status (status=?)
```

### 各項目の意味

#### SCAN TABLE（フルテーブルスキャン）

```
SCAN TABLE users
```

- テーブル全体を読み込む
- インデックスを使用しない
- 大規模テーブルでは避けるべき

#### SEARCH TABLE（インデックス使用）

```
SEARCH TABLE workflows USING INDEX idx_workflows_status (status=?)
```

- インデックスを使用した検索
- 効率的なアクセス方法
- 推奨される状態

#### USING COVERING INDEX（カバリングインデックス）

```
SEARCH TABLE workflows USING COVERING INDEX idx_workflows_status_name
```

- インデックスのみで結果を返す
- テーブルアクセス不要
- 最も効率的

---

## スキャンタイプ

### SCAN TABLE（テーブルスキャン）

```
SCAN TABLE large_table
```

**特徴**:

- テーブル全体を読み込む
- 少量行の取得には非効率
- 大量行の取得には許容される場合も

**対策**:

- インデックス追加
- WHERE条件の見直し

### SEARCH TABLE（インデックススキャン）

```
SEARCH TABLE users USING INDEX idx_users_email (email=?)
```

**特徴**:

- インデックスを使用して行を検索
- 選択性が高い場合に効率的
- B-Treeインデックスを使用

### AUTOMATIC INDEX

```
USE TEMP B-TREE FOR ORDER BY
```

**特徴**:

- SQLiteが自動的に一時インデックスを作成
- ORDER BYやGROUP BYで発生
- 永続的なインデックス追加を検討すべき

---

## JOINアルゴリズム

SQLiteは主にNested Loop Joinを使用します。

### 基本的なJOIN

```
QUERY PLAN
|--SCAN TABLE orders
`--SEARCH TABLE users USING INDEX idx_users_id (id=?)
```

**特徴**:

- 外側テーブル（orders）の各行に対して
- 内側テーブル（users）をインデックスで検索
- 内側にインデックスがあると効率的

### 最適化されたJOIN

```
QUERY PLAN
|--SEARCH TABLE orders USING INDEX idx_orders_user_id (user_id=?)
`--SEARCH TABLE users USING INDEX idx_users_id (id=?)
```

**特徴**:

- 両テーブルでインデックスを使用
- 最も効率的な状態

### 非効率なJOIN

```
QUERY PLAN
|--SCAN TABLE orders
`--SCAN TABLE users
```

**問題**:

- 両テーブルでフルスキャン
- パフォーマンスが悪い

**対策**:

- JOIN条件のカラムにインデックスを追加

---

## 問題パターンと対策

### パターン1: SCAN TABLE（大規模テーブル）

**問題**:

```
SCAN TABLE orders
```

**対策**:

```sql
CREATE INDEX idx_orders_status ON orders(status);
```

### パターン2: AUTOMATIC INDEX発生

**問題**:

```
USE TEMP B-TREE FOR ORDER BY
```

**対策**:

```sql
-- ORDER BY に対応するインデックス追加
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### パターン3: JOIN条件にインデックスなし

**問題**:

```
|--SCAN TABLE orders
`--SCAN TABLE users
```

**対策**:

```sql
-- 結合キーにインデックス追加
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_users_id ON users(id);  -- 主キーには自動作成済みの場合も
```

---

## 実践的なデバッグフロー

### ステップ1: 現状把握

```sql
EXPLAIN QUERY PLAN
SELECT * FROM orders
WHERE user_id = 'uuid-here' AND status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

### ステップ2: 問題特定

- SCAN TABLE があるか？
- インデックスが使用されているか（SEARCH TABLE）？
- AUTOMATIC INDEX が発生しているか？

### ステップ3: 改善策実行

```sql
-- 複合インデックス追加
CREATE INDEX idx_orders_user_status_date
ON orders(user_id, status, created_at DESC);

-- 統計更新
ANALYZE orders;
```

### ステップ4: 効果検証

```sql
-- 改善後のクエリ
EXPLAIN QUERY PLAN
SELECT * FROM orders
WHERE user_id = 'uuid-here' AND status = 'pending'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 便利なクエリ

### インデックス一覧

```sql
SELECT name, sql
FROM sqlite_master
WHERE type = 'index' AND tbl_name = 'orders';
```

### テーブル情報

```sql
-- テーブル構造
PRAGMA table_info('orders');

-- インデックス一覧
PRAGMA index_list('orders');

-- インデックス詳細
PRAGMA index_info('idx_orders_status');
```

### データベース統計

```sql
-- テーブルサイズ
SELECT
  name,
  (SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND tbl_name = name) as index_count
FROM sqlite_master
WHERE type = 'table';
```

---

## SQLiteの特徴

### インデックスタイプ

SQLiteは **B-Treeインデックスのみ** をサポート:

- 単一カラムインデックス
- 複合インデックス
- 部分インデックス
- 式インデックス
- UNIQUE制約

### クエリオプティマイザー

- コストベースオプティマイザー
- ANALYZEによる統計情報を使用
- 自動インデックス選択

### 制限事項

- ハッシュインデックスなし
- ビットマップインデックスなし
- 実行時統計なし（EXPLAIN QUERY PLANは推定のみ）

---

## ベストプラクティス

### 1. 定期的なANALYZE

```sql
-- 統計情報を最新に保つ
ANALYZE;
```

### 2. 適切なインデックス設計

- WHERE句の条件カラム
- JOIN条件のカラム
- ORDER BY/GROUP BYのカラム

### 3. クエリプラン確認の習慣化

新しいクエリを書いたら必ず `EXPLAIN QUERY PLAN` で確認

### 4. 複合インデックスの活用

```sql
-- 等価条件を先に、範囲条件を後に
CREATE INDEX idx_orders_user_status_date
ON orders(user_id, status, created_at);
```

---

## トラブルシューティング

### インデックスが使用されない

**原因**:

- カーディナリティが低い
- 統計情報が古い
- クエリ条件が不適切

**対策**:

1. ANALYZEで統計更新
2. インデックス設計見直し
3. クエリ書き換え

### AUTOMATIC INDEX頻発

**原因**:

- 適切な永続インデックスがない

**対策**:

```sql
CREATE INDEX ON 対象テーブル(対象カラム);
```

### JOIN が遅い

**原因**:

- 結合キーにインデックスなし
- テーブルスキャン発生

**対策**:

1. 両テーブルの結合キーにインデックス追加
2. WHERE条件の最適化
