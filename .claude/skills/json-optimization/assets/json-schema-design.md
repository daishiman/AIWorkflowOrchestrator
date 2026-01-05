# JSON構造設計テンプレート (SQLite)

## 基本情報

| 項目           | 内容                   |
| -------------- | ---------------------- |
| **日付**       | {{YYYY-MM-DD}}         |
| **設計者**     | {{名前}}               |
| **テーブル名** | {{テーブル名}}         |
| **カラム名**   | {{カラム名}}           |
| **目的**       | {{JSONを使用する理由}} |

---

## 1. JSON使用の妥当性確認

### 1.1 選択理由

- [ ] 半構造化データの格納が必要
- [ ] スキーマが動的に変化する
- [ ] 疎な属性を効率的に格納したい
- [ ] 外部APIレスポンスの保存
- [ ] その他: {{理由}}

### 1.2 代替案の検討

| 代替案          | 採用/却下       | 理由     |
| --------------- | --------------- | -------- |
| 正規化テーブル  | ☐ 採用 / ☐ 却下 | {{理由}} |
| EAV（却下推奨） | ☐ 採用 / ☐ 却下 | {{理由}} |
| JSON（本案）    | ☐ 採用          | {{理由}} |

### 1.3 リスク確認

- [ ] 頻繁に検索される属性はない（または分離済み）
- [ ] 参照整合性が不要な属性のみ
- [ ] トランザクション的な部分更新は限定的

---

## 2. JSON構造定義

### 2.1 構造概要

```json
{
  "{{property1}}": "{{type}}",
  "{{property2}}": {
    "{{nested1}}": "{{type}}",
    "{{nested2}}": "{{type}}"
  },
  "{{property3}}": ["{{array_element_type}}"]
}
```

### 2.2 プロパティ詳細

| プロパティパス           | 型     | 必須         | 説明     | 検索対象     |
| ------------------------ | ------ | ------------ | -------- | ------------ |
| `$.{{prop1}}`            | string | ☐ Yes / ☐ No | {{説明}} | ☐ Yes / ☐ No |
| `$.{{prop2}}.{{nested}}` | number | ☐ Yes / ☐ No | {{説明}} | ☐ Yes / ☐ No |
| `$.{{prop3}}[*]`         | string | ☐ Yes / ☐ No | {{説明}} | ☐ Yes / ☐ No |

### 2.3 サンプルデータ

```json
{
  // 典型的なユースケース
}
```

```json
{
  // 最小構成
}
```

```json
{
  // 最大構成（すべてのオプション属性を含む）
}
```

---

## 3. Zodスキーマ定義

```typescript
import { z } from 'zod';

export const {{SchemaName}}Schema = z.object({
  // 必須プロパティ
  {{property1}}: z.string().min(1),

  // オプションプロパティ
  {{property2}}: z.object({
    {{nested1}}: z.string(),
    {{nested2}}: z.number().positive(),
  }).optional(),

  // 配列プロパティ
  {{property3}}: z.array(z.string()).optional(),

  // Enumプロパティ
  {{property4}}: z.enum(['value1', 'value2', 'value3']).optional(),

  // 柔軟なメタデータ
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type {{TypeName}} = z.infer<typeof {{SchemaName}}Schema>;
```

---

## 4. CHECK制約定義

```sql
-- 基本妥当性検証
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_valid
CHECK (json_valid({{column}}) = 1);

-- 型検証
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_type
CHECK (json_type({{column}}) = 'object');

-- 必須フィールド検証
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_required
CHECK (
  json_extract({{column}}, '$.{{required_field1}}') IS NOT NULL AND
  json_extract({{column}}, '$.{{required_field2}}') IS NOT NULL
);

-- 値の型検証（オプション）
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_{{field}}_type
CHECK (
  json_extract({{column}}, '$.{{field}}') IS NULL OR
  json_type({{column}}, '$.{{field}}') = '{{expected_type}}'
);

-- Enum値検証（オプション）
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_{{field}}_values
CHECK (
  json_extract({{column}}, '$.{{field}}') IS NULL OR
  json_extract({{column}}, '$.{{field}}') IN ('value1', 'value2', 'value3')
);
```

---

## 5. インデックス設計

### 5.1 式インデックス（基本）

| インデックス名                       | パス          | 主な用途          |
| ------------------------------------ | ------------- | ----------------- |
| `idx_{{table}}_{{column}}_{{field}}` | `$.{{field}}` | {{field}}での検索 |

```sql
-- 単一プロパティのインデックス
CREATE INDEX idx_{{table}}_{{column}}_{{field}}
ON {{table}} (json_extract({{column}}, '$.{{field}}'));

-- 複合インデックス（複数プロパティ）
CREATE INDEX idx_{{table}}_{{column}}_multi
ON {{table}} (
  json_extract({{column}}, '$.{{field1}}'),
  json_extract({{column}}, '$.{{field2}}')
);
```

### 5.2 部分インデックス（条件付き）

```sql
-- 特定条件下でのみインデックスを作成
CREATE INDEX idx_{{table}}_{{column}}_active
ON {{table}} (json_extract({{column}}, '$.{{field}}'))
WHERE status = 'active';

-- 値が存在する場合のみインデックス
CREATE INDEX idx_{{table}}_{{column}}_optional
ON {{table}} (json_extract({{column}}, '$.{{field}}'))
WHERE json_extract({{column}}, '$.{{field}}') IS NOT NULL;
```

### 5.3 生成カラム + インデックス（推奨）

```sql
-- SQLite 3.31.0+: 生成カラムの追加
ALTER TABLE {{table}}
ADD COLUMN {{field}}_generated TEXT
GENERATED ALWAYS AS (json_extract({{column}}, '$.{{field}}')) STORED;

-- 生成カラムにインデックス
CREATE INDEX idx_{{table}}_{{field}}
ON {{table}} ({{field}}_generated);

-- 使用
SELECT * FROM {{table}} WHERE {{field}}_generated = 'value';
```

---

## 6. Drizzle ORM での定義

```typescript
import { index, sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const {{tableName}} = sqliteTable(
  '{{table_name}}',
  {
    id: text('id').primaryKey(),
    {{columnName}}: text('{{column_name}}', { mode: 'json' }),

    // 生成カラム（頻繁に検索するプロパティ）
    {{field}}Generated: text('{{field}}_generated').generatedAlwaysAs(
      sql`json_extract({{columnName}}, '$.{{field}}')`
    ),
  },
  (table) => ({
    // 式インデックス
    {{field}}Idx: index('idx_{{table}}_{{field}}').on(
      sql`json_extract(${table.{{columnName}}}, '$.{{field}}')`
    ),

    // 複合インデックス
    multiIdx: index('idx_{{table}}_multi').on(
      sql`json_extract(${table.{{columnName}}}, '$.{{field1}}')`,
      sql`json_extract(${table.{{columnName}}}, '$.{{field2}}')`
    ),

    // 部分インデックス
    activeIdx: index('idx_{{table}}_active')
      .on(sql`json_extract(${table.{{columnName}}}, '$.status')`)
      .where(sql`status = 'active'`),

    // 生成カラムのインデックス
    generatedIdx: index('idx_{{table}}_generated').on(table.{{field}}Generated),
  })
);
```

---

## 7. クエリパターン

### 7.1 検索クエリ

```sql
-- json_extract()での検索
SELECT * FROM {{table}}
WHERE json_extract({{column}}, '$.{{field}}') = '{{value}}';

-- 演算子エイリアス（SQLite 3.38.0+）
SELECT * FROM {{table}}
WHERE {{column}} ->> '$.{{field}}' = '{{value}}';

-- 複合条件
SELECT * FROM {{table}}
WHERE json_extract({{column}}, '$.{{field1}}') = '{{value1}}'
  AND json_extract({{column}}, '$.{{field2}}') > {{value2}};

-- 配列内の値検索
SELECT * FROM {{table}}
WHERE EXISTS (
  SELECT 1 FROM json_each({{column}}, '$.{{array_field}}')
  WHERE value = '{{value}}'
);

-- キー存在チェック
SELECT * FROM {{table}}
WHERE json_extract({{column}}, '$.{{field}}') IS NOT NULL;
```

### 7.2 更新クエリ

```sql
-- 単一フィールド更新
UPDATE {{table}}
SET {{column}} = json_set({{column}}, '$.{{field}}', '{{new_value}}')
WHERE id = $1;

-- 複数フィールド更新
UPDATE {{table}}
SET {{column}} = json_set(
  {{column}},
  '$.{{field1}}', '{{value1}}',
  '$.{{field2}}', {{value2}}
)
WHERE id = $1;

-- マージ更新（RFC 7396）
UPDATE {{table}}
SET {{column}} = json_patch({{column}}, '{"{{field1}}": "{{value1}}", "{{field2}}": {{value2}}}')
WHERE id = $1;

-- フィールド削除
UPDATE {{table}}
SET {{column}} = json_remove({{column}}, '$.{{field}}')
WHERE id = $1;
```

### 7.3 抽出クエリ

```sql
-- 値の抽出
SELECT json_extract({{column}}, '$.{{field}}') FROM {{table}};

-- 演算子エイリアス（SQLite 3.38.0+）
SELECT {{column}} -> '$.{{field}}' FROM {{table}};  -- JSON型
SELECT {{column}} ->> '$.{{field}}' FROM {{table}}'; -- TEXT型

-- ネストされた値
SELECT json_extract({{column}}, '$.{{parent}}.{{child}}') FROM {{table}};

-- 配列要素
SELECT json_extract({{column}}, '$.{{array}}[0]') FROM {{table}};
```

---

## 8. マイグレーション計画

### 8.1 新規作成

```sql
-- 1. カラム追加
ALTER TABLE {{table}}
ADD COLUMN {{column}} TEXT;

-- 2. CHECK制約追加
ALTER TABLE {{table}}
ADD CONSTRAINT chk_{{column}}_valid
CHECK (json_valid({{column}}) = 1);

ALTER TABLE {{table}}
ADD CONSTRAINT chk_{{column}}_type
CHECK (json_type({{column}}) = 'object');

-- 3. インデックス追加
CREATE INDEX idx_{{table}}_{{column}}_{{field}}
ON {{table}} (json_extract({{column}}, '$.{{field}}'));

-- 4. 生成カラム追加（オプション）
ALTER TABLE {{table}}
ADD COLUMN {{field}}_generated TEXT
GENERATED ALWAYS AS (json_extract({{column}}, '$.{{field}}')) STORED;

CREATE INDEX idx_{{table}}_{{field}}_gen
ON {{table}} ({{field}}_generated);
```

### 8.2 既存データ移行

```sql
-- 既存カラムからJSONへ移行
UPDATE {{table}}
SET {{column}} = json_object(
  '{{field1}}', old_column1,
  '{{field2}}', old_column2,
  '{{field3}}', old_column3
);

-- 複数カラムをネストされた構造へ
UPDATE {{table}}
SET {{column}} = json_object(
  'basic', json_object(
    'name', name_column,
    'type', type_column
  ),
  'details', json_object(
    'description', description_column,
    'metadata', metadata_column
  )
);
```

### 8.3 ロールバック

```sql
-- インデックス削除
DROP INDEX IF EXISTS idx_{{table}}_{{column}}_{{field}};

-- 生成カラム削除（SQLiteでは直接削除不可、テーブル再作成が必要）
-- または NULL に設定
UPDATE {{table}} SET {{field}}_generated = NULL;

-- 制約削除（SQLiteでは直接削除不可、テーブル再作成が必要）
```

---

## 9. ドキュメンテーション

### 9.1 構造変更履歴

| バージョン | 日付     | 変更内容 |
| ---------- | -------- | -------- |
| 1.0.0      | {{日付}} | 初期設計 |

### 9.2 使用上の注意

```markdown
1. 検索には json_extract() を使用し、式インデックスを作成してください
2. 頻繁に検索するプロパティは生成カラムへの分離を検討してください
3. 構造変更時はZodスキーマも更新してください
4. SQLite 3.38.0+ では -> および ->> 演算子が使用可能です
5. CHECK制約での検証とZodスキーマの二重検証を推奨します
```

---

## 10. 承認

| 役割       | 名前     | 承認日   |
| ---------- | -------- | -------- |
| 設計者     | {{名前}} | {{日付}} |
| レビュアー | {{名前}} | {{日付}} |
| DBA        | {{名前}} | {{日付}} |
