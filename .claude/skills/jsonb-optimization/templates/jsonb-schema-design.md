# JSONB構造設計テンプレート

## 基本情報

| 項目 | 内容 |
|------|------|
| **日付** | {{YYYY-MM-DD}} |
| **設計者** | {{名前}} |
| **テーブル名** | {{テーブル名}} |
| **カラム名** | {{カラム名}} |
| **目的** | {{JSONBを使用する理由}} |

---

## 1. JSONB使用の妥当性確認

### 1.1 選択理由

- [ ] 半構造化データの格納が必要
- [ ] スキーマが動的に変化する
- [ ] 疎な属性を効率的に格納したい
- [ ] 外部APIレスポンスの保存
- [ ] その他: {{理由}}

### 1.2 代替案の検討

| 代替案 | 採用/却下 | 理由 |
|--------|----------|------|
| 正規化テーブル | ☐ 採用 / ☐ 却下 | {{理由}} |
| EAV（却下推奨） | ☐ 採用 / ☐ 却下 | {{理由}} |
| JSONB（本案） | ☐ 採用 | {{理由}} |

### 1.3 リスク確認

- [ ] 頻繁に検索される属性はない（または分離済み）
- [ ] 参照整合性が不要な属性のみ
- [ ] トランザクション的な部分更新は限定的

---

## 2. JSONB構造定義

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

| プロパティパス | 型 | 必須 | 説明 | 検索対象 |
|--------------|-----|------|------|---------|
| `$.{{prop1}}` | string | ☐ Yes / ☐ No | {{説明}} | ☐ Yes / ☐ No |
| `$.{{prop2}}.{{nested}}` | number | ☐ Yes / ☐ No | {{説明}} | ☐ Yes / ☐ No |
| `$.{{prop3}}[*]` | string | ☐ Yes / ☐ No | {{説明}} | ☐ Yes / ☐ No |

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
-- 基本型検証
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_type
CHECK (jsonb_typeof({{column}}) = 'object');

-- 必須フィールド検証
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_required
CHECK (
  {{column}} ? '{{required_field1}}' AND
  {{column}} ? '{{required_field2}}'
);

-- 値の型検証（オプション）
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_{{field}}_type
CHECK (
  {{column}} -> '{{field}}' IS NULL OR
  jsonb_typeof({{column}} -> '{{field}}') = '{{expected_type}}'
);

-- Enum値検証（オプション）
ALTER TABLE {{table_name}}
ADD CONSTRAINT chk_{{column}}_{{field}}_values
CHECK (
  {{column}} ->> '{{field}}' IS NULL OR
  {{column}} ->> '{{field}}' IN ('value1', 'value2', 'value3')
);
```

---

## 5. インデックス設計

### 5.1 GINインデックス

| インデックス名 | タイプ | 対象 | 主な用途 |
|--------------|--------|------|---------|
| `gin_{{table}}_{{column}}` | GIN (default) | {{column}} | キー存在検査、包含検索 |
| `gin_{{table}}_{{column}}_path` | GIN (jsonb_path_ops) | {{column}} | @>検索のみ（高速） |

```sql
-- デフォルトGIN（キー存在検査が必要な場合）
CREATE INDEX gin_{{table}}_{{column}}
ON {{table}} USING gin({{column}});

-- jsonb_path_ops（@>のみ使用する場合）
CREATE INDEX gin_{{table}}_{{column}}_path
ON {{table}} USING gin({{column}} jsonb_path_ops);
```

### 5.2 式インデックス（頻繁に抽出する属性）

| インデックス名 | 式 | 用途 |
|--------------|-----|------|
| `idx_{{table}}_{{column}}_{{field}}` | `({{column}} ->> '{{field}}')` | {{field}}での検索 |

```sql
CREATE INDEX idx_{{table}}_{{column}}_{{field}}
ON {{table}} (({{column}} ->> '{{field}}'));
```

### 5.3 部分インデックス（条件付き）

```sql
CREATE INDEX gin_{{table}}_{{column}}_active
ON {{table}} USING gin({{column}})
WHERE status = 'active';
```

---

## 6. クエリパターン

### 6.1 検索クエリ

```sql
-- 包含検索（推奨）
SELECT * FROM {{table}}
WHERE {{column}} @> '{"{{field}}": "{{value}}"}';

-- キー存在検索
SELECT * FROM {{table}}
WHERE {{column}} ? '{{field}}';

-- 配列要素検索
SELECT * FROM {{table}}
WHERE {{column}} @> '{"{{array_field}}": ["{{value}}"]}';
```

### 6.2 更新クエリ

```sql
-- 単一フィールド更新
UPDATE {{table}}
SET {{column}} = jsonb_set({{column}}, '{{{field}}}', '"{{new_value}}"')
WHERE id = $1;

-- 複数フィールド更新
UPDATE {{table}}
SET {{column}} = {{column}} || '{"{{field1}}": "{{value1}}", "{{field2}}": {{value2}}}'
WHERE id = $1;
```

### 6.3 抽出クエリ

```sql
-- JSON値として抽出
SELECT {{column}} -> '{{field}}' FROM {{table}};

-- テキストとして抽出
SELECT {{column}} ->> '{{field}}' FROM {{table}};

-- ネストされた値
SELECT {{column}} #>> '{{{path}},{{to}},{{field}}}' FROM {{table}};
```

---

## 7. マイグレーション計画

### 7.1 新規作成

```sql
-- 1. カラム追加
ALTER TABLE {{table}}
ADD COLUMN {{column}} JSONB;

-- 2. CHECK制約追加
ALTER TABLE {{table}}
ADD CONSTRAINT chk_{{column}}_type
CHECK (jsonb_typeof({{column}}) = 'object');

-- 3. インデックス追加
CREATE INDEX gin_{{table}}_{{column}}
ON {{table}} USING gin({{column}});
```

### 7.2 既存データ移行

```sql
-- 既存カラムからJSONBへ移行
UPDATE {{table}}
SET {{column}} = jsonb_build_object(
  '{{field1}}', old_column1,
  '{{field2}}', old_column2
);
```

### 7.3 ロールバック

```sql
-- インデックス削除
DROP INDEX IF EXISTS gin_{{table}}_{{column}};

-- 制約削除
ALTER TABLE {{table}} DROP CONSTRAINT IF EXISTS chk_{{column}}_type;

-- カラム削除
ALTER TABLE {{table}} DROP COLUMN IF EXISTS {{column}};
```

---

## 8. ドキュメンテーション

### 8.1 構造変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | {{日付}} | 初期設計 |

### 8.2 使用上の注意

```markdown
1. 検索には @> 演算子を優先使用してください
2. ->> での検索は式インデックスがある場合のみ
3. 構造変更時はZodスキーマも更新してください
```

---

## 9. 承認

| 役割 | 名前 | 承認日 |
|------|------|--------|
| 設計者 | {{名前}} | {{日付}} |
| レビュアー | {{名前}} | {{日付}} |
| DBA | {{名前}} | {{日付}} |
