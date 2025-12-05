# 実行計画分析手法

## 実行計画とは

データベースがクエリを実行する際の具体的な処理手順。
最適化判断の根拠となる重要な情報を提供する。

## SQLite: EXPLAIN QUERY PLAN

### 基本的な使い方

```sql
-- クエリの実行計画を表示
EXPLAIN QUERY PLAN SELECT * FROM workflows WHERE status = 'PENDING';

-- 詳細な実行計画（SQLiteは常に実際の実行は行わない）
EXPLAIN QUERY PLAN
SELECT * FROM workflows WHERE status = 'PENDING';
```

### 出力の読み方

```
QUERY PLAN
|--SCAN TABLE workflows
   USING INDEX idx_workflows_status (status=?)
```

**構成要素**:

- `SCAN TABLE`: テーブルスキャン（フルスキャン）
- `SEARCH TABLE`: インデックスを使用した検索
- `USING INDEX`: 使用されるインデックス名
- `USING COVERING INDEX`: カバリングインデックス（最速）
- ツリー構造で実行順序を表示（上から下、内側から外側）

## スキャン方法

### SCAN TABLE（フルテーブルスキャン）

**説明**: テーブル全体を先頭から順にスキャン

**特徴**:

- インデックスを使用しない
- 小規模テーブルでは効率的
- 大規模テーブルでは遅い

**出現時の対応**:

```
SCAN TABLE large_table
```

→ インデックスの追加を検討

### SEARCH TABLE（インデックス使用）

**説明**: インデックスを使用して行を特定

**特徴**:

- 選択性が高い条件で効率的
- B-Treeインデックスを使用

**望ましい状態**:

```
SEARCH TABLE workflows USING INDEX idx_workflows_status (status=?)
```

### USING COVERING INDEX（カバリングインデックス）

**説明**: インデックスのみで結果を返却（最速）

**特徴**:

- テーブルへのアクセスが不要
- 必要なすべてのカラムがインデックスに含まれる

**最も効率的**:

```
SEARCH TABLE workflows USING COVERING INDEX idx_workflows_status_name
```

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

### 問題1: 大規模テーブルのSCAN TABLE

**検出**:

```
SCAN TABLE workflows
```

**原因**:

- インデックスがない
- インデックスが使用されない条件

**対策**:

1. 適切なインデックスを追加
2. WHERE句の条件を見直し
3. 関数使用を避ける

### 問題2: インデックスが使用されない

**検出**:

```
SCAN TABLE workflows
```

（SEARCH TABLE ではなく SCAN TABLE が表示される）

**原因**:

- インデックスが存在しない
- クエリオプティマイザーがフルスキャンを選択

**対策**:

1. 適切なインデックスを追加
2. 統計情報を更新（ANALYZE）
3. クエリの書き換え

### 問題3: 不適切なJOIN方法

**検出**:

```
SCAN TABLE large_table_a
SCAN TABLE large_table_b
```

**原因**:

- JOIN条件にインデックスがない
- 統計情報が古い

**対策**:

1. JOIN条件のカラムにインデックスを追加
2. `ANALYZE`で統計情報を更新
3. クエリの書き換え

### 問題4: 複数テーブルスキャン

**検出**:

複数の `SCAN TABLE` が表示される

**原因**:

- 複数テーブルでインデックスが不足

**対策**:

1. 各テーブルの結合キーにインデックスを追加
2. 統計情報の更新

## 実行計画分析チェックリスト

### 基本チェック

- [ ] SCAN TABLEが大規模テーブルで発生していないか？
- [ ] インデックスが適切に使用されているか（SEARCH TABLE）？
- [ ] 適切なJOIN方法が選択されているか？

### インデックス活用チェック

- [ ] WHERE句の条件がインデックスで処理されているか？
- [ ] JOIN条件がインデックスを使用しているか？
- [ ] ORDER BY がインデックスを活用しているか？

### パフォーマンスチェック

- [ ] クエリプランは最適化されているか？
- [ ] 不要なテーブルスキャンはないか？

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
SELECT name, sql FROM sqlite_master
WHERE type = 'index' AND tbl_name = 'workflows';

-- 特定インデックスの詳細
PRAGMA index_info('idx_workflows_status');

-- インデックスリスト
PRAGMA index_list('workflows');
```

### テーブル情報の確認

```sql
-- テーブル構造確認
PRAGMA table_info('workflows');

-- データベース統計
SELECT name, rootpage FROM sqlite_master WHERE type = 'table';
```

## 最適化の優先順位

1. **SCAN TABLEの解消**: インデックス追加
2. **JOIN方法の最適化**: インデックス追加、統計更新
3. **統計情報の更新**: ANALYZE実行
4. **SELECT句の最適化**: 必要なカラムのみ取得
