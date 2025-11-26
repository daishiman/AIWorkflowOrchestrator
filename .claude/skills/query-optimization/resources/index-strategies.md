# インデックス設計戦略

## インデックスの基本

### インデックスとは

データベースの検索を高速化するためのデータ構造。
本の索引のように、目的のデータを素早く見つける。

### インデックスの効果

- 検索（WHERE）の高速化
- ソート（ORDER BY）の高速化
- 結合（JOIN）の高速化
- 一意性制約の実現

### インデックスのコスト

- ストレージ使用量の増加
- INSERT/UPDATE/DELETEの遅延
- メンテナンスコスト

## インデックス種類（PostgreSQL）

### B-Treeインデックス（デフォルト）

**特徴**:
- 最も一般的
- 等価条件（=）、範囲条件（<, >, BETWEEN）に有効
- ソートに使用可能

**適用場面**:
- 主キー、外部キー
- 等価・範囲検索のWHERE句
- ORDER BY

```sql
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);
```

### GINインデックス

**特徴**:
- 複数の値を含むデータ型に最適
- JSONB、配列、全文検索向け

**適用場面**:
- JSONBカラムの検索
- 配列の要素検索
- 全文検索

```sql
-- JSONB用
CREATE INDEX idx_workflows_input_payload ON workflows USING GIN(input_payload);

-- JSONB特定キー用
CREATE INDEX idx_workflows_input_type ON workflows USING GIN((input_payload -> 'type'));
```

### 複合インデックス

**特徴**:
- 複数カラムを含む
- カラムの順序が重要
- 左端から順に使用される

**適用場面**:
- 複数カラムでの検索
- 複数カラムでのソート

```sql
-- user_id と status の複合インデックス
CREATE INDEX idx_workflows_user_status ON workflows(user_id, status);
```

### 部分インデックス

**特徴**:
- 条件を満たす行のみインデックス化
- サイズが小さい
- 特定のクエリに最適化

**適用場面**:
- 特定の値のみ頻繁に検索
- NULL以外のみ検索
- ステータスフィルタ

```sql
-- PENDING状態のみインデックス
CREATE INDEX idx_workflows_pending
ON workflows(created_at)
WHERE status = 'PENDING';
```

## インデックス設計原則

### 1. カーディナリティ原則

**定義**: カーディナリティ = ユニークな値の数

**原則**:
- 高カーディナリティのカラムはインデックスに適する
- 低カーディナリティのカラムは単独インデックスに不適

**例**:
```
✅ user_id（高カーディナリティ）
❌ is_active（低カーディナリティ: true/false のみ）
⚠️ status（中程度: 5〜10種類）
```

### 2. 選択性原則

**定義**: 選択性 = マッチする行数 / 全行数

**原則**:
- 選択性が高い（マッチが少ない）条件にインデックス
- 選択性が低い条件はインデックスが使われない可能性

### 3. 複合インデックスの順序

**原則**:
- 等価条件のカラムを先に
- 範囲条件のカラムを後に
- カーディナリティが高いカラムを先に

```sql
-- WHERE user_id = ? AND created_at > ?
-- user_id（等価）を先に、created_at（範囲）を後に
CREATE INDEX idx_workflows_user_created
ON workflows(user_id, created_at);
```

### 4. カバリングインデックス原則

**定義**: クエリに必要なすべてのカラムを含むインデックス

**効果**: Index Only Scan が可能（テーブルアクセス不要）

```sql
-- SELECT id, status FROM workflows WHERE user_id = ?
-- id, status も含めることでIndex Only Scan
CREATE INDEX idx_workflows_user_covering
ON workflows(user_id, id, status);
```

## インデックス設計チェックリスト

### WHERE句の分析

- [ ] 頻繁に使用される条件は？
- [ ] 等価条件（=）か範囲条件（<, >）か？
- [ ] 複数条件の組み合わせは？
- [ ] カーディナリティは十分高いか？

### JOIN句の分析

- [ ] 外部キーにインデックスがあるか？
- [ ] 結合条件のカラムは？

### ORDER BY の分析

- [ ] ソートに使用されるカラムは？
- [ ] ソート方向（ASC/DESC）は？

### 複合インデックスの検討

- [ ] 複数カラムの組み合わせで検索するか？
- [ ] カラムの順序は最適か？

## プロジェクト固有のインデックス設計

### workflowsテーブルの推奨インデックス

```sql
-- 主キー（自動作成）
-- PRIMARY KEY (id)

-- ステータス検索
CREATE INDEX idx_workflows_status ON workflows(status);

-- ユーザー検索
CREATE INDEX idx_workflows_user_id ON workflows(user_id);

-- ユーザー + ステータスの複合
CREATE INDEX idx_workflows_user_status ON workflows(user_id, status);

-- 作成日時（降順ソート用）
CREATE INDEX idx_workflows_created_at_desc ON workflows(created_at DESC);

-- 論理削除対応
CREATE INDEX idx_workflows_deleted_at ON workflows(deleted_at)
WHERE deleted_at IS NULL;

-- JSONB検索（input_payload）
CREATE INDEX idx_workflows_input_payload ON workflows USING GIN(input_payload);
```

## インデックスの監視

### 使用状況の確認

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 未使用インデックスの検出

```sql
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename;
```

### インデックスサイズの確認

```sql
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

## アンチパターン

### 1. 過剰なインデックス

**問題**:
- 書き込み性能の低下
- ストレージの浪費
- メンテナンスコスト増大

**対策**:
- 実際のクエリパターンに基づく
- 未使用インデックスを定期的に削除

### 2. 低カーディナリティの単独インデックス

**問題**:
- インデックスが使用されない
- フルスキャンより遅くなる可能性

**対策**:
- 複合インデックスの一部として使用
- 部分インデックスを検討

### 3. 関数を使用した条件

**問題**:
```sql
-- インデックスが使用されない
WHERE LOWER(email) = 'test@example.com'
WHERE DATE(created_at) = '2025-01-01'
```

**対策**:
- 式インデックスを作成
- クエリを書き換え

```sql
-- 式インデックス
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- または条件を変更
WHERE created_at >= '2025-01-01' AND created_at < '2025-01-02'
```

## インデックス作成のベストプラクティス

1. **測定してから作成**: 実際のクエリパターンを分析
2. **少なく始める**: 必要最小限から開始
3. **監視する**: 使用状況を定期的に確認
4. **メンテナンスする**: 不要なインデックスを削除
5. **テストする**: 本番適用前に効果を確認
