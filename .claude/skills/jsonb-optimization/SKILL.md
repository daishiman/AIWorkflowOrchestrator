---
name: jsonb-optimization
description: |
  PostgreSQLのJSONB型を活用した柔軟なデータ構造設計とパフォーマンス最適化。
  GINインデックス、演算子の効率的使用、スキーマ検証の統合を提供。

  専門分野:
  - JSONB設計判断: リレーショナル vs JSONB の適切な選択
  - GINインデックス: jsonb_path_ops vs デフォルト、部分インデックス
  - JSONB演算子: @>, ?, ?|, ?&, @?, @@ の効率的使用
  - スキーマ検証: CHECK制約とZodスキーマの統合

  使用タイミング:
  - 半構造化データの格納設計時
  - JSONB検索パフォーマンスの最適化時
  - スキーマが動的に変化する属性の設計時
  - JSONB構造の検証ルール策定時

  Use proactively when designing JSONB columns, optimizing JSONB queries,
  or implementing validation for semi-structured data.
version: 1.0.0
---

# JSONB Optimization Skill

## 概要

このスキルは、PostgreSQLのJSONB型を効果的に活用するための専門知識を提供します。
柔軟性とパフォーマンスのバランスを取りながら、適切なユースケースでJSONBを使用する判断基準を学びます。

## JSONB使用の判断基準

### JSONBが適切なケース

1. **半構造化データ**
   - 外部APIのレスポンス保存
   - イベントペイロード
   - 設定オプション

2. **スキーマの柔軟性が必要**
   - 属性が頻繁に追加・変更される
   - エンティティごとに異なる属性セット
   - 将来の拡張性が重要

3. **疎な属性**
   - 多くのNULL値を含む属性群
   - オプショナルなメタデータ

### JSONBを避けるべきケース

1. **頻繁な検索・ソート対象**
   - WHERE句で常に使用される属性
   - ORDER BY対象の属性
   - 集計・GROUP BY対象

2. **参照整合性が必要**
   - 他テーブルへの外部キー関係
   - マスターデータへの参照

3. **トランザクション的更新**
   - 個別属性の頻繁な更新
   - 競合の可能性が高い属性

## GINインデックス設計

### インデックスタイプの選択

#### デフォルト GIN

```sql
CREATE INDEX gin_data ON table USING gin(data);
```

**サポート演算子**:
- `@>` : 含む
- `<@` : 含まれる
- `?` : キー存在
- `?|` : いずれかのキー存在
- `?&` : すべてのキー存在
- `@?` : JSONパス存在
- `@@` : JSONパス述語

#### jsonb_path_ops

```sql
CREATE INDEX gin_data_path ON table USING gin(data jsonb_path_ops);
```

**サポート演算子**（限定的）:
- `@>` : 含む
- `@?` : JSONパス存在
- `@@` : JSONパス述語

**比較**:

| 特性 | デフォルト | jsonb_path_ops |
|------|-----------|----------------|
| インデックスサイズ | 大 | 小（約1/3） |
| @> 検索速度 | 速い | より速い |
| ? 演算子 | 使用可能 | 使用不可 |
| キー存在検査 | 可能 | 不可 |

**選択指針**:
- `@>` のみ使用 → `jsonb_path_ops`
- キー存在検査が必要 → デフォルト

### Drizzle ORM での定義

```typescript
import { index, pgTable, jsonb, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  inputPayload: jsonb('input_payload'),
  outputPayload: jsonb('output_payload'),
  metadata: jsonb('metadata'),
}, (table) => ({
  // デフォルトGIN（キー存在検査が必要な場合）
  metadataGinIdx: index('gin_workflows_metadata')
    .on(table.metadata)
    .using(sql`gin`),

  // jsonb_path_ops（@>のみ使用する場合）
  inputPayloadGinIdx: index('gin_workflows_input_payload')
    .on(table.inputPayload)
    .using(sql`gin (input_payload jsonb_path_ops)`),
}));
```

## JSONB演算子の効率的使用

### 包含演算子（@>）

```sql
-- 最も効率的：GINインデックスを完全活用
SELECT * FROM workflows
WHERE input_payload @> '{"type": "batch", "priority": "high"}';
```

**パフォーマンス特性**:
- GINインデックスで高速検索
- トップレベルと深いパスの両方で使用可能
- 複数条件を1つの@>で結合するのが効率的

### キー存在演算子（?、?|、?&）

```sql
-- 単一キー存在
SELECT * FROM workflows WHERE metadata ? 'retry_count';

-- いずれかのキー存在
SELECT * FROM workflows WHERE metadata ?| array['error', 'warning'];

-- すべてのキー存在
SELECT * FROM workflows WHERE metadata ?& array['status', 'progress'];
```

**注意**: `jsonb_path_ops` では使用不可

### JSONパス演算子（@?、@@）

```sql
-- パス存在チェック
SELECT * FROM workflows
WHERE input_payload @? '$.items[*].price';

-- パス述語
SELECT * FROM workflows
WHERE input_payload @@ '$.total > 1000';
```

### 値の抽出（->、->>、#>、#>>）

```sql
-- JSON値として抽出
SELECT input_payload -> 'type' FROM workflows;

-- テキストとして抽出
SELECT input_payload ->> 'type' FROM workflows;

-- パスで抽出（JSON）
SELECT input_payload #> '{items,0,name}' FROM workflows;

-- パスで抽出（テキスト）
SELECT input_payload #>> '{items,0,name}' FROM workflows;
```

**インデックス使用の注意**:
- `->>`/`#>>` での検索はGINインデックスを使用しない
- 頻繁に検索する属性は通常カラムへの分離を検討

## スキーマ検証の統合

### データベース層での検証（CHECK制約）

```sql
-- 基本型検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_payload_type
CHECK (jsonb_typeof(input_payload) = 'object');

-- 必須フィールド検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_required_fields
CHECK (
  input_payload ? 'type' AND
  input_payload ? 'source'
);

-- 値の型検証
ALTER TABLE workflows
ADD CONSTRAINT chk_input_type_string
CHECK (jsonb_typeof(input_payload -> 'type') = 'string');
```

### アプリケーション層での検証（Zod）

```typescript
import { z } from 'zod';

// JSONB構造のZodスキーマ
export const InputPayloadSchema = z.object({
  type: z.enum(['batch', 'realtime', 'scheduled']),
  source: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
  })).optional(),
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

### パターン1: 頻繁に検索する属性の分離

```sql
-- 問題: JSONB内の属性で頻繁に検索
SELECT * FROM workflows
WHERE input_payload ->> 'status' = 'pending';
-- → インデックスが効かない

-- 解決: 頻繁に検索する属性を通常カラムに
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  status VARCHAR(20) NOT NULL,  -- 分離
  input_payload JSONB
);

CREATE INDEX idx_workflows_status ON workflows (status);
```

### パターン2: 部分インデックス

```sql
-- 特定条件でのみインデックスを作成
CREATE INDEX gin_active_workflows_payload
ON workflows USING gin(input_payload)
WHERE status = 'active';
```

### パターン3: 式インデックス

```sql
-- 特定のJSONBパスにB-Treeインデックス
CREATE INDEX idx_workflows_type
ON workflows ((input_payload ->> 'type'));

-- 使用
SELECT * FROM workflows
WHERE input_payload ->> 'type' = 'batch';
```

### パターン4: 計算済みカラム（Generated Column）

```sql
-- PostgreSQL 12+
ALTER TABLE workflows
ADD COLUMN workflow_type VARCHAR(50)
GENERATED ALWAYS AS (input_payload ->> 'type') STORED;

CREATE INDEX idx_workflows_type ON workflows (workflow_type);
```

## 設計判断チェックリスト

### JSONB使用時

- [ ] なぜJSONBを選択したか明確か？
- [ ] 頻繁に検索される属性は通常カラムに分離したか？
- [ ] 適切なGINインデックスが設定されているか？
- [ ] スキーマ検証（Zod + CHECK制約）が設定されているか？
- [ ] JSONB構造がドキュメント化されているか？

### パフォーマンス確認

- [ ] EXPLAIN ANALYZEでインデックス使用を確認したか？
- [ ] @> 演算子を優先的に使用しているか？
- [ ] ->> での検索は最小限か？
- [ ] 必要に応じて式インデックスを検討したか？

## 関連スキル

- `.claude/skills/indexing-strategies/SKILL.md` - GINインデックス詳細
- `.claude/skills/database-normalization/SKILL.md` - JSONB vs 正規化の判断
- `.claude/skills/sql-anti-patterns/SKILL.md` - EAVパターン回避

## 参照リソース

詳細な情報は以下のリソースを参照:
- `resources/jsonb-operators-reference.md` - JSONB演算子詳細リファレンス
- `templates/jsonb-schema-design.md` - JSONB構造設計テンプレート
- `scripts/analyze-jsonb-usage.mjs` - JSONB使用分析スクリプト
