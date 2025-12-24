---
name: .claude/skills/json-optimization/SKILL.md
description: |
  SQLiteのJSON1拡張を活用した柔軟なデータ構造設計とパフォーマンス最適化。
  式インデックス、JSON関数の効率的使用、スキーマ検証の統合を提供。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/json-optimization/resources/json-functions-reference.md`: json_extract/json_type/json_valid関数とインデックス活用
  - `.claude/skills/json-optimization/scripts/analyze-json-usage.mjs`: JSON使用状況分析とリレーショナル分離推奨の自動判定
  - `.claude/skills/json-optimization/templates/json-schema-design.md`: JSON構造設計テンプレート（式インデックス/CHECK制約/Zodスキーマ統合）

  専門分野:
  - JSON設計判断: リレーショナル vs JSON の適切な選択
  - 式インデックス: json_extract()を使用した効率的なインデックス設計
  - JSON関数: json_extract, json_type, json_valid, json_array, json_object の効率的使用
  - スキーマ検証: CHECK制約とZodスキーマの統合

  使用タイミング:
  - 半構造化データの格納設計時
  - JSON検索パフォーマンスの最適化時
  - スキーマが動的に変化する属性の設計時
  - JSON構造の検証ルール策定時

  Use proactively when designing JSON columns, optimizing JSON queries,
version: 2.0.0
---

# JSON Optimization Skill (SQLite)

## 概要

このスキルは、SQLite の JSON1 拡張機能を効果的に活用するための専門知識を提供します。
柔軟性とパフォーマンスのバランスを取りながら、適切なユースケースで JSON を使用する判断基準を学びます。

## JSON 使用の判断基準

### JSON が適切なケース

1. **半構造化データ**
   - 外部 API のレスポンス保存
   - イベントペイロード
   - 設定オプション

2. **スキーマの柔軟性が必要**
   - 属性が頻繁に追加・変更される
   - エンティティごとに異なる属性セット
   - 将来の拡張性が重要

3. **疎な属性**
   - 多くの NULL 値を含む属性群
   - オプショナルなメタデータ

### JSON を避けるべきケース

1. **頻繁な検索・ソート対象**
   - WHERE 句で常に使用される属性
   - ORDER BY 対象の属性
   - 集計・GROUP BY 対象

2. **参照整合性が必要**
   - 他テーブルへの外部キー関係
   - マスターデータへの参照

3. **トランザクション的更新**
   - 個別属性の頻繁な更新
   - 競合の可能性が高い属性

## 式インデックス設計

### 基本的な式インデックス

SQLite では JSON フィールドに対して式インデックスを作成できます：

```sql
-- 単一プロパティのインデックス
CREATE INDEX idx_workflows_type
ON workflows (json_extract(input_payload, '$.type'));

-- 複数プロパティの複合インデックス
CREATE INDEX idx_workflows_type_priority
ON workflows (
  json_extract(input_payload, '$.type'),
  json_extract(input_payload, '$.priority')
);
```

### Drizzle ORM での定義

```typescript
import { index, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const workflows = sqliteTable(
  "workflows",
  {
    id: text("id").primaryKey(),
    inputPayload: text("input_payload", { mode: "json" }),
    outputPayload: text("output_payload", { mode: "json" }),
    metadata: text("metadata", { mode: "json" }),
  },
  (table) => ({
    // 単一プロパティのインデックス
    inputTypeIdx: index("idx_workflows_input_type").on(
      sql`json_extract(${table.inputPayload}, '$.type')`,
    ),

    // 複合インデックス
    inputTypePriorityIdx: index("idx_workflows_input_type_priority").on(
      sql`json_extract(${table.inputPayload}, '$.type')`,
      sql`json_extract(${table.inputPayload}, '$.priority')`,
    ),

    // 部分インデックス
    activeMetadataIdx: index("idx_workflows_active_metadata")
      .on(sql`json_extract(${table.metadata}, '$.status')`)
      .where(sql`json_extract(${table.metadata}, '$.active') = 1`),
  }),
);
```

## JSON 関数の効率的使用

### json_extract() - 値の抽出

```sql
-- 単一プロパティの抽出
SELECT json_extract(input_payload, '$.type') FROM workflows;

-- ネストされたプロパティ
SELECT json_extract(input_payload, '$.specs.color') FROM workflows;

-- 配列要素
SELECT json_extract(input_payload, '$.items[0].name') FROM workflows;

-- WHERE句での使用（式インデックスがあれば高速）
SELECT * FROM workflows
WHERE json_extract(input_payload, '$.type') = 'batch';
```

### json_type() - 型チェック

```sql
-- 型の確認
SELECT json_type(input_payload, '$.price') FROM products;
-- 結果: "integer", "real", "text", "null", "true", "false", "array", "object"

-- 型を条件にしたクエリ
SELECT * FROM products
WHERE json_type(data, '$.price') = 'real';
```

### json_valid() - 妥当性検証

```sql
-- JSON文字列の妥当性チェック
SELECT json_valid('{"valid": true}');  -- 1
SELECT json_valid('invalid json');     -- 0

-- CHECK制約での使用
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  input_payload TEXT,
  CHECK (json_valid(input_payload) = 1)
);
```

### json_array() / json_object() - 構築

```sql
-- 配列の構築
SELECT json_array('apple', 'banana', 'cherry');
-- ["apple","banana","cherry"]

-- オブジェクトの構築
SELECT json_object('name', 'Product A', 'price', 100, 'stock', 50);
-- {"name":"Product A","price":100,"stock":50}

-- UPDATE での使用
UPDATE products
SET data = json_object(
  'name', 'Updated Product',
  'price', json_extract(data, '$.price'),
  'updated_at', datetime('now')
)
WHERE id = 1;
```

### json_each() / json_tree() - 展開

```sql
-- 配列要素の展開
SELECT value FROM products, json_each(data, '$.tags')
WHERE id = 1;

-- オブジェクトのキー・値展開
SELECT key, value FROM products, json_each(data)
WHERE id = 1;

-- ツリー構造の再帰的展開
SELECT fullkey, value FROM products, json_tree(data)
WHERE id = 1;
```

## スキーマ検証の統合

### データベース層での検証（CHECK 制約）

```sql
-- 基本型検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_payload_valid
CHECK (json_valid(input_payload) = 1);

-- 型検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_payload_type
CHECK (json_type(input_payload) = 'object');

-- 必須フィールド検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_required_fields
CHECK (
  json_extract(input_payload, '$.type') IS NOT NULL AND
  json_extract(input_payload, '$.source') IS NOT NULL
);

-- 値の型検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_type_string
CHECK (
  json_extract(input_payload, '$.type') IS NULL OR
  json_type(input_payload, '$.type') = 'text'
);

-- Enum値検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_type_values
CHECK (
  json_extract(input_payload, '$.type') IS NULL OR
  json_extract(input_payload, '$.type') IN ('batch', 'realtime', 'scheduled')
);
```

### アプリケーション層での検証（Zod）

```typescript
import { z } from "zod";

// JSON構造のZodスキーマ
export const InputPayloadSchema = z.object({
  type: z.enum(["batch", "realtime", "scheduled"]),
  source: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]).optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().positive(),
      }),
    )
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type InputPayload = z.infer<typeof InputPayloadSchema>;

// 使用例
const validated = InputPayloadSchema.parse(rawData);
```

### 二重検証戦略

```typescript
// Repository層での検証
class WorkflowRepository {
  async create(workflow: CreateWorkflowInput) {
    // アプリケーション層での詳細検証
    const validatedPayload = InputPayloadSchema.parse(workflow.inputPayload);

    // DB層はCHECK制約で基本型を保証
    return await db.insert(workflows).values({
      ...workflow,
      inputPayload: validatedPayload,
    });
  }
}
```

## パフォーマンス最適化パターン

### パターン 1: 頻繁に検索する属性の分離

```sql
-- 問題: JSON内の属性で頻繁に検索
SELECT * FROM workflows
WHERE json_extract(input_payload, '$.status') = 'pending';
-- → 式インデックスがないと遅い

-- 解決: 頻繁に検索する属性を通常カラムに
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,  -- 分離
  input_payload TEXT
);

CREATE INDEX idx_workflows_status ON workflows (status);
```

### パターン 2: 部分インデックス

```sql
-- 特定条件でのみインデックスを作成
CREATE INDEX idx_active_workflows_type
ON workflows (json_extract(input_payload, '$.type'))
WHERE status = 'active';
```

### パターン 3: 式インデックス

```sql
-- 特定のJSONパスにインデックス
CREATE INDEX idx_workflows_type
ON workflows (json_extract(input_payload, '$.type'));

-- 使用
SELECT * FROM workflows
WHERE json_extract(input_payload, '$.type') = 'batch';
```

### パターン 4: 生成カラム（Generated Column）

```sql
-- SQLite 3.31.0+
ALTER TABLE workflows
ADD COLUMN workflow_type TEXT
GENERATED ALWAYS AS (json_extract(input_payload, '$.type')) STORED;

CREATE INDEX idx_workflows_type ON workflows (workflow_type);

-- 使用
SELECT * FROM workflows WHERE workflow_type = 'batch';
```

### パターン 5: 複合インデックス

```sql
-- 複数のJSONプロパティを組み合わせる
CREATE INDEX idx_workflows_type_priority
ON workflows (
  json_extract(input_payload, '$.type'),
  json_extract(input_payload, '$.priority')
);

-- 使用
SELECT * FROM workflows
WHERE json_extract(input_payload, '$.type') = 'batch'
  AND json_extract(input_payload, '$.priority') = 'high';
```

## 設計判断チェックリスト

### JSON 使用時

- [ ] なぜ JSON を選択したか明確か？
- [ ] 頻繁に検索される属性は通常カラムに分離したか？
- [ ] 適切な式インデックスが設定されているか？
- [ ] スキーマ検証（Zod + CHECK 制約）が設定されているか？
- [ ] JSON 構造がドキュメント化されているか？

### パフォーマンス確認

- [ ] EXPLAIN QUERY PLAN でインデックス使用を確認したか？
- [ ] json_extract() の呼び出し回数を最小化したか？
- [ ] 頻繁に使用するパスには式インデックスを作成したか？
- [ ] 必要に応じて生成カラムを検討したか？

## 関連スキル

- `.claude/skills/indexing-strategies/SKILL.md` - インデックス戦略詳細
- `.claude/skills/database-normalization/SKILL.md` - JSON vs 正規化の判断
- `.claude/skills/query-optimization/SKILL.md` - クエリ最適化

## 参照リソース

詳細な情報は以下のリソースを参照:

- `resources/json-functions-reference.md` - JSON 関数詳細リファレンス
- `templates/json-schema-design.md` - JSON 構造設計テンプレート
- `scripts/analyze-json-usage.mjs` - JSON 使用分析スクリプト
