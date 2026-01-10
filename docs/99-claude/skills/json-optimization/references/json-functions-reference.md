# SQLite JSON1 関数詳細リファレンス

## 概要

SQLiteのJSON1拡張で使用可能な関数の完全なリファレンスです。
各関数のパフォーマンス特性とインデックス対応状況を含みます。

---

## 1. 抽出関数

### json_extract()

**説明**: JSONパスを使用して値を抽出

```sql
-- 単一プロパティの抽出
SELECT json_extract(data, '$.name') FROM products;

-- ネストされたプロパティ
SELECT json_extract(data, '$.specs.color') FROM products;

-- 配列要素
SELECT json_extract(data, '$.tags[0]') FROM products;
SELECT json_extract(data, '$.items[*].name') FROM products;  -- 配列の全要素

-- 複数パス（配列として返却）
SELECT json_extract(data, '$.name', '$.price') FROM products;

-- WHERE句での使用
SELECT * FROM products WHERE json_extract(data, '$.category') = 'electronics';
```

**戻り値**: JSON型（文字列、数値、オブジェクトなど）

**インデックス**: 式インデックスで使用可能

**エイリアス**: `->` 演算子（SQLite 3.38.0+）

```sql
SELECT data -> '$.name' FROM products;
SELECT data -> '$.specs' -> '$.color' FROM products;
```

**エイリアス**: `->>` 演算子（テキスト抽出、SQLite 3.38.0+）

```sql
SELECT data ->> '$.name' FROM products;  -- テキストとして返却
```

---

## 2. 型検査関数

### json_type()

**説明**: JSON値の型を返す

```sql
-- 型の確認
SELECT json_type(data, '$.price') FROM products;
-- 結果: "integer", "real", "text", "null", "true", "false", "array", "object"

-- トップレベルの型
SELECT json_type('{"name": "Product"}');  -- "object"
SELECT json_type('[1,2,3]');              -- "array"

-- 型を条件にしたクエリ
SELECT * FROM products
WHERE json_type(data, '$.price') = 'real';
```

**戻り値**: TEXT型

**使用例**:

- CHECK制約での型検証
- 動的な型チェック

### json_valid()

**説明**: JSON文字列の妥当性を検証

```sql
-- 妥当性チェック
SELECT json_valid('{"valid": true}');  -- 1
SELECT json_valid('invalid json');     -- 0
SELECT json_valid(NULL);               -- NULL

-- CHECK制約での使用
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  input_payload TEXT,
  CHECK (json_valid(input_payload) = 1)
);

-- データクリーニング
SELECT * FROM raw_data
WHERE json_valid(json_column) = 1;
```

**戻り値**: INTEGER（1: 有効、0: 無効、NULL: NULL入力）

---

## 3. 構築関数

### json_object()

**説明**: キーと値のペアからJSONオブジェクトを構築

```sql
-- 基本使用
SELECT json_object('name', 'Product A', 'price', 100);
-- {"name":"Product A","price":100}

-- NULLの扱い
SELECT json_object('name', 'Test', 'optional', NULL);
-- {"name":"Test","optional":null}

-- 動的オブジェクト構築
SELECT json_object(
  'id', id,
  'name', name,
  'created_at', created_at
) FROM products;

-- UPDATE での使用
UPDATE products
SET data = json_object(
  'name', 'Updated Product',
  'price', json_extract(data, '$.price'),
  'updated_at', datetime('now')
)
WHERE id = 1;
```

**引数**: キーと値のペア（可変長）

**戻り値**: TEXT型（JSON形式）

### json_array()

**説明**: 値から JSON 配列を構築

```sql
-- 基本使用
SELECT json_array('apple', 'banana', 'cherry');
-- ["apple","banana","cherry"]

-- 数値配列
SELECT json_array(1, 2, 3, 4, 5);
-- [1,2,3,4,5]

-- NULLを含む配列
SELECT json_array('item1', NULL, 'item3');
-- ["item1",null,"item3"]

-- 動的配列構築
SELECT json_array(id, name, price) FROM products;

-- 空配列
SELECT json_array();
-- []
```

**引数**: 値（可変長）

**戻り値**: TEXT型（JSON配列形式）

### json_quote()

**説明**: 文字列をJSON文字列としてエスケープ

```sql
-- 基本使用
SELECT json_quote('Hello "World"');
-- "Hello \"World\""

-- 特殊文字のエスケープ
SELECT json_quote('Line1\nLine2');
-- "Line1\\nLine2"

-- 使用例：動的JSONの構築
SELECT json_object('message', json_quote(user_input))
FROM user_messages;
```

**引数**: TEXT

**戻り値**: TEXT型（JSON文字列形式）

---

## 4. 集約関数

### json_group_array()

**説明**: グループの値をJSON配列に集約

```sql
-- 基本使用
SELECT json_group_array(name) FROM products;
-- ["Product A","Product B","Product C"]

-- GROUP BY との組み合わせ
SELECT category, json_group_array(name)
FROM products
GROUP BY category;
-- electronics: ["TV","Phone"]
-- books: ["Novel","Magazine"]

-- オブジェクトの配列
SELECT json_group_array(
  json_object('id', id, 'name', name)
) FROM products;
-- [{"id":1,"name":"A"},{"id":2,"name":"B"}]
```

**使用例**:

- 親子関係の結合
- ネストされたJSON構造の生成

### json_group_object()

**説明**: キーと値のペアをJSONオブジェクトに集約

```sql
-- 基本使用
SELECT json_group_object(key, value)
FROM config_table;
-- {"setting1":"value1","setting2":"value2"}

-- カテゴリごとの製品数
SELECT json_group_object(category, COUNT(*))
FROM products
GROUP BY category;
-- {"electronics":5,"books":3}
```

**引数**: キー、値のペア

**戻り値**: TEXT型（JSONオブジェクト形式）

---

## 5. 修正関数

### json_set()

**説明**: 指定されたパスの値を設定（パスが存在しない場合は作成）

```sql
-- 既存値の更新
SELECT json_set('{"a":1,"b":2}', '$.a', 99);
-- {"a":99,"b":2}

-- 新規キーの追加
SELECT json_set('{"a":1}', '$.b', 2);
-- {"a":1,"b":2}

-- ネストされた値の設定
SELECT json_set('{"a":{}}', '$.a.b', 3);
-- {"a":{"b":3}}

-- 配列要素の更新
SELECT json_set('[1,2,3]', '$[1]', 99);
-- [1,99,3]

-- UPDATE での使用
UPDATE products
SET data = json_set(data, '$.status', 'active')
WHERE id = 1;

-- 複数パスの同時設定
SELECT json_set(
  '{"a":1}',
  '$.a', 99,
  '$.b', 2,
  '$.c', 3
);
-- {"a":99,"b":2,"c":3}
```

**引数**: JSON、パス、値のペア（可変長）

**戻り値**: TEXT型（修正されたJSON）

### json_insert()

**説明**: パスが存在しない場合のみ値を挿入

```sql
-- 新規キーの挿入
SELECT json_insert('{"a":1}', '$.b', 2);
-- {"a":1,"b":2}

-- 既存キーは変更しない
SELECT json_insert('{"a":1}', '$.a', 99);
-- {"a":1}  -- 変更なし

-- 配列への挿入
SELECT json_insert('[1,2,3]', '$[3]', 4);
-- [1,2,3,4]
```

**引数**: JSON、パス、値のペア（可変長）

**戻り値**: TEXT型（修正されたJSON）

### json_replace()

**説明**: パスが存在する場合のみ値を置換

```sql
-- 既存値の置換
SELECT json_replace('{"a":1,"b":2}', '$.a', 99);
-- {"a":99,"b":2}

-- 存在しないキーは無視
SELECT json_replace('{"a":1}', '$.b', 2);
-- {"a":1}  -- 変更なし

-- UPDATE での使用
UPDATE products
SET data = json_replace(data, '$.price', new_price)
WHERE id = 1;
```

**引数**: JSON、パス、値のペア（可変長）

**戻り値**: TEXT型（修正されたJSON）

### json_remove()

**説明**: 指定されたパスの値を削除

```sql
-- キーの削除
SELECT json_remove('{"a":1,"b":2}', '$.a');
-- {"b":2}

-- 配列要素の削除
SELECT json_remove('[1,2,3]', '$[1]');
-- [1,3]

-- 複数パスの同時削除
SELECT json_remove('{"a":1,"b":2,"c":3}', '$.a', '$.c');
-- {"b":2}

-- UPDATE での使用
UPDATE products
SET data = json_remove(data, '$.deprecated_field')
WHERE id = 1;
```

**引数**: JSON、パス（可変長）

**戻り値**: TEXT型（修正されたJSON）

### json_patch()

**説明**: RFC 7396 JSON Merge Patch を適用

```sql
-- 基本的なパッチ
SELECT json_patch('{"a":1,"b":2}', '{"b":3,"c":4}');
-- {"a":1,"b":3,"c":4}

-- nullでキーを削除
SELECT json_patch('{"a":1,"b":2}', '{"b":null}');
-- {"a":1}

-- ネストされたオブジェクトのマージ
SELECT json_patch('{"a":{"x":1}}', '{"a":{"y":2}}');
-- {"a":{"x":1,"y":2}}
```

**引数**: JSON、パッチJSON

**戻り値**: TEXT型（パッチ適用後のJSON）

---

## 6. テーブル値関数

### json_each()

**説明**: JSONオブジェクトまたは配列の要素を行として展開

```sql
-- オブジェクトの展開
SELECT key, value, type
FROM json_each('{"a":1,"b":"text","c":null}');
-- a | 1 | integer
-- b | text | text
-- c | null | null

-- 配列の展開
SELECT key, value
FROM json_each('[10,20,30]');
-- 0 | 10
-- 1 | 20
-- 2 | 30

-- テーブルとの結合
SELECT p.id, e.key, e.value
FROM products p, json_each(p.data)
WHERE p.id = 1;

-- 特定パスの展開
SELECT value
FROM products, json_each(data, '$.tags')
WHERE id = 1;
```

**返却カラム**:

- `key`: TEXT（オブジェクトのキーまたは配列のインデックス）
- `value`: 任意型
- `type`: TEXT（"object", "array", "integer", "real", "text", "null", "true", "false"）
- `atom`: 基本型の値（オブジェクト/配列以外）
- `id`: INTEGER（内部用）
- `parent`: INTEGER（内部用）
- `fullkey`: TEXT（ルートからの完全パス）
- `path`: TEXT（親のパス）

### json_tree()

**説明**: JSON構造を再帰的にツリーとして展開

```sql
-- ツリー構造の完全展開
SELECT key, value, type, fullkey, path
FROM json_tree('{"a":{"b":1,"c":2}}');
-- null | {"a":{"b":1,"c":2}} | object | $ | $
-- a | {"b":1,"c":2} | object | $.a | $
-- b | 1 | integer | $.a.b | $.a
-- c | 2 | integer | $.a.c | $.a

-- 深い構造の探索
SELECT fullkey, value
FROM products, json_tree(data)
WHERE type = 'text' AND value LIKE '%search%';

-- 特定の深さのみ抽出
SELECT fullkey, value
FROM json_tree(data)
WHERE fullkey LIKE '$.items[*].name';
```

**返却カラム**: `json_each()`と同じ + 再帰構造

---

## 7. その他の関数

### json_array_length()

**説明**: JSON配列の長さを返す

```sql
-- 配列の長さ
SELECT json_array_length('[1,2,3,4,5]');  -- 5
SELECT json_array_length('[]');           -- 0

-- テーブルカラムの配列長
SELECT id, json_array_length(data, '$.tags')
FROM products;

-- WHERE 条件での使用
SELECT * FROM products
WHERE json_array_length(data, '$.items') > 3;
```

**引数**: JSON、パス（省略可）

**戻り値**: INTEGER（非配列の場合はNULL）

---

## インデックス対応まとめ

| 関数                | 式インデックス | 使用例                                                     |
| ------------------- | -------------- | ---------------------------------------------------------- |
| json_extract()      | ✅             | `CREATE INDEX idx ON t (json_extract(col, '$.path'))`      |
| json_type()         | ✅             | `CREATE INDEX idx ON t (json_type(col, '$.path'))`         |
| json_valid()        | ✅             | `CREATE INDEX idx ON t (json_valid(col))`                  |
| json_array_length() | ✅             | `CREATE INDEX idx ON t (json_array_length(col, '$.path'))` |
| 構築・修正関数      | ❌             | インデックス不可（計算関数のため）                         |
| テーブル値関数      | ❌             | 結果セット返却のため不可                                   |

---

## パフォーマンス推奨順序

1. **最高効率**: `json_extract()` + 式インデックス
2. **高効率**: `json_type()` + 式インデックス（型チェック付き検索）
3. **中効率**: 生成カラム + 通常インデックス
4. **低効率**: `json_extract()` インデックスなし
5. **非効率**: `json_tree()` での全探索

---

## 使用例パターン集

### 1. フィルタリング

```sql
-- 効率的: 式インデックスを使用
CREATE INDEX idx_products_category
ON products (json_extract(data, '$.category'));

SELECT * FROM products
WHERE json_extract(data, '$.category') = 'electronics';

-- 複合条件
SELECT * FROM products
WHERE json_extract(data, '$.category') = 'electronics'
  AND json_extract(data, '$.stock') > 0;
```

### 2. 存在チェック

```sql
-- キー存在チェック
SELECT * FROM products
WHERE json_extract(data, '$.discount') IS NOT NULL;

-- 配列内の値存在
SELECT * FROM products
WHERE EXISTS (
  SELECT 1 FROM json_each(data, '$.tags')
  WHERE value = 'sale'
);
```

### 3. 数値範囲

```sql
-- 数値比較
SELECT * FROM products
WHERE CAST(json_extract(data, '$.price') AS REAL) BETWEEN 100 AND 500;

-- 配列の長さチェック
SELECT * FROM orders
WHERE json_array_length(data, '$.items') > 5;
```

### 4. 部分更新

```sql
-- 単一フィールド更新
UPDATE products
SET data = json_set(data, '$.status', 'sold')
WHERE id = 1;

-- 複数フィールド更新
UPDATE products
SET data = json_set(
  data,
  '$.status', 'sold',
  '$.sold_at', datetime('now')
)
WHERE id = 1;

-- マージ更新
UPDATE products
SET data = json_patch(data, '{"status":"sold","updated_at":"2024-01-01"}')
WHERE id = 1;
```

### 5. 集約とグループ化

```sql
-- カテゴリごとの製品リスト
SELECT category, json_group_array(name) AS products
FROM products
GROUP BY category;

-- ネストされたJSON構造
SELECT category, json_group_array(
  json_object('id', id, 'name', name, 'price', price)
) AS products
FROM products
GROUP BY category;
```
