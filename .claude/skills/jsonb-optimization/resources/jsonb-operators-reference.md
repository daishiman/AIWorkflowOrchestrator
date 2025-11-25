# JSONB 演算子詳細リファレンス

## 概要

PostgreSQLのJSONB型で使用可能な演算子の完全なリファレンスです。
各演算子のパフォーマンス特性とインデックス対応状況を含みます。

---

## 1. 包含演算子

### @> （含む）

**説明**: 左辺のJSONBが右辺を含むか

```sql
-- 基本使用
SELECT * FROM products WHERE data @> '{"category": "electronics"}';

-- 深いパス
SELECT * FROM products WHERE data @> '{"specs": {"color": "red"}}';

-- 配列要素
SELECT * FROM products WHERE data @> '{"tags": ["sale"]}';
```

**インデックス**: GIN（デフォルト、jsonb_path_ops）で使用可能

**パフォーマンス**: 最も効率的なJSONB検索方法

### <@ （含まれる）

**説明**: 左辺のJSONBが右辺に含まれるか

```sql
SELECT * FROM products WHERE data <@ '{"category": "electronics", "price": 100}';
```

**インデックス**: GIN（デフォルトのみ）で使用可能

---

## 2. キー存在演算子

### ? （キー存在）

**説明**: 指定されたキーが存在するか

```sql
-- トップレベルキー
SELECT * FROM products WHERE data ? 'discount';

-- 注意: ネストされたキーには使用不可
-- data ? 'specs.color' は動作しない
```

**インデックス**: GIN（デフォルトのみ）で使用可能

### ?| （いずれかのキー存在）

**説明**: 指定されたキーのいずれかが存在するか

```sql
SELECT * FROM products WHERE data ?| array['discount', 'sale', 'promotion'];
```

**インデックス**: GIN（デフォルトのみ）で使用可能

### ?& （すべてのキー存在）

**説明**: 指定されたすべてのキーが存在するか

```sql
SELECT * FROM products WHERE data ?& array['name', 'price', 'category'];
```

**インデックス**: GIN（デフォルトのみ）で使用可能

---

## 3. JSONパス演算子（PostgreSQL 12+）

### @? （パス存在）

**説明**: JSONパスが存在するか

```sql
-- 配列要素の存在チェック
SELECT * FROM orders WHERE data @? '$.items[*].product_id';

-- 条件付きパス
SELECT * FROM orders WHERE data @? '$.items[*] ? (@.quantity > 10)';
```

**インデックス**: GIN（デフォルト、jsonb_path_ops）で使用可能

### @@ （パス述語）

**説明**: JSONパス述語がtrueを返すか

```sql
-- 数値比較
SELECT * FROM orders WHERE data @@ '$.total > 1000';

-- 文字列比較
SELECT * FROM products WHERE data @@ '$.status == "active"';

-- 複合条件
SELECT * FROM products WHERE data @@ '$.price > 100 && $.stock > 0';
```

**インデックス**: GIN（デフォルト、jsonb_path_ops）で使用可能

---

## 4. 抽出演算子

### -> （JSON値として抽出）

**説明**: キーまたはインデックスでJSON値を抽出

```sql
-- キーで抽出
SELECT data -> 'name' FROM products;  -- {"value": "Product A"}

-- 配列インデックスで抽出
SELECT data -> 'tags' -> 0 FROM products;  -- "electronics"

-- チェーン
SELECT data -> 'specs' -> 'dimensions' -> 'width' FROM products;
```

**戻り値**: JSONB型

**インデックス**: 直接使用不可（式インデックスは可能）

### ->> （テキストとして抽出）

**説明**: キーまたはインデックスでテキスト値を抽出

```sql
-- キーで抽出
SELECT data ->> 'name' FROM products;  -- "Product A"

-- WHERE句での使用（非効率）
SELECT * FROM products WHERE data ->> 'category' = 'electronics';
```

**戻り値**: TEXT型

**インデックス**: 直接使用不可（式インデックスは可能）

### #> （パスでJSON抽出）

**説明**: パス配列でJSON値を抽出

```sql
-- ネストされた値
SELECT data #> '{specs,dimensions,width}' FROM products;

-- 配列とオブジェクトの混合
SELECT data #> '{items,0,name}' FROM orders;
```

**戻り値**: JSONB型

### #>> （パスでテキスト抽出）

**説明**: パス配列でテキスト値を抽出

```sql
SELECT data #>> '{specs,dimensions,width}' FROM products;
```

**戻り値**: TEXT型

---

## 5. 更新演算子

### || （結合）

**説明**: 2つのJSONBを結合（同じキーは右辺で上書き）

```sql
-- 属性の追加/更新
UPDATE products
SET data = data || '{"status": "updated", "modified_at": "2024-01-01"}'
WHERE id = 1;
```

### - （キー/要素削除）

**説明**: キーまたは配列要素を削除

```sql
-- キー削除
UPDATE products SET data = data - 'temp_field' WHERE id = 1;

-- 複数キー削除
UPDATE products SET data = data - '{temp1,temp2}'::text[] WHERE id = 1;

-- 配列要素削除（インデックス指定）
UPDATE products SET data = data - 1 WHERE id = 1;  -- 2番目の要素
```

### #- （パスで削除）

**説明**: パスで指定された要素を削除

```sql
UPDATE products
SET data = data #- '{specs,deprecated_field}'
WHERE id = 1;
```

---

## 6. jsonb_set / jsonb_insert 関数

### jsonb_set

**説明**: パスで指定された位置に値を設定

```sql
-- 既存キーの更新
UPDATE products
SET data = jsonb_set(data, '{status}', '"active"')
WHERE id = 1;

-- ネストされたパスの更新
UPDATE products
SET data = jsonb_set(data, '{specs,color}', '"blue"')
WHERE id = 1;

-- 新規パスの作成（create_if_missing = true）
UPDATE products
SET data = jsonb_set(data, '{new_field}', '"value"', true)
WHERE id = 1;
```

### jsonb_insert

**説明**: 配列の指定位置に要素を挿入

```sql
-- 配列の先頭に挿入
UPDATE products
SET data = jsonb_insert(data, '{tags,0}', '"new_tag"')
WHERE id = 1;

-- 配列の末尾に挿入（after = true）
UPDATE products
SET data = jsonb_insert(data, '{tags,0}', '"new_tag"', true)
WHERE id = 1;
```

---

## 7. 型検査・変換関数

### jsonb_typeof

**説明**: JSONB値の型を返す

```sql
SELECT jsonb_typeof(data -> 'price') FROM products;
-- 結果: "number", "string", "object", "array", "boolean", "null"
```

### jsonb_array_length

**説明**: 配列の長さを返す

```sql
SELECT jsonb_array_length(data -> 'tags') FROM products;
```

### jsonb_object_keys

**説明**: オブジェクトのキーを返す（セット返却関数）

```sql
SELECT jsonb_object_keys(data) FROM products WHERE id = 1;
```

### jsonb_each / jsonb_each_text

**説明**: キーと値のペアを展開

```sql
SELECT key, value FROM products, jsonb_each(data) WHERE id = 1;
```

### jsonb_array_elements / jsonb_array_elements_text

**説明**: 配列要素を展開

```sql
SELECT elem FROM products, jsonb_array_elements(data -> 'tags') AS elem WHERE id = 1;
```

---

## インデックス対応まとめ

| 演算子 | GIN (default) | GIN (jsonb_path_ops) | B-Tree式 |
|--------|---------------|---------------------|----------|
| @> | ✅ | ✅ | ❌ |
| <@ | ✅ | ❌ | ❌ |
| ? | ✅ | ❌ | ❌ |
| ?\| | ✅ | ❌ | ❌ |
| ?& | ✅ | ❌ | ❌ |
| @? | ✅ | ✅ | ❌ |
| @@ | ✅ | ✅ | ❌ |
| -> | ❌ | ❌ | ✅ |
| ->> | ❌ | ❌ | ✅ |
| #> | ❌ | ❌ | ✅ |
| #>> | ❌ | ❌ | ✅ |

---

## パフォーマンス推奨順序

1. **最高効率**: `@>` + GIN (jsonb_path_ops)
2. **高効率**: `@>` + GIN (default)
3. **中効率**: `?`, `?|`, `?&` + GIN (default)
4. **低効率**: `->>` + B-Tree式インデックス
5. **非効率**: `->>` インデックスなし

---

## 使用例パターン集

### 1. フィルタリング

```sql
-- 効率的: @>を使用
SELECT * FROM products WHERE data @> '{"status": "active", "category": "electronics"}';

-- 非効率: ->>を使用（避ける）
SELECT * FROM products WHERE data ->> 'status' = 'active' AND data ->> 'category' = 'electronics';
```

### 2. 存在チェック

```sql
-- キー存在
SELECT * FROM products WHERE data ? 'discount';

-- 値存在（配列内）
SELECT * FROM products WHERE data @> '{"tags": ["sale"]}';
```

### 3. 数値範囲

```sql
-- JSONパス述語（PostgreSQL 12+）
SELECT * FROM products WHERE data @@ '$.price > 100 && $.price < 500';

-- 抽出して比較（古い方法）
SELECT * FROM products WHERE (data ->> 'price')::numeric BETWEEN 100 AND 500;
```

### 4. 部分更新

```sql
-- 単一フィールド更新
UPDATE products
SET data = jsonb_set(data, '{status}', '"sold"')
WHERE id = 1;

-- 複数フィールド更新
UPDATE products
SET data = data || '{"status": "sold", "sold_at": "2024-01-01"}'
WHERE id = 1;
```
