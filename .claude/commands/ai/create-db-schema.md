---
description: |
  Drizzle ORMスキーマ作成を行う専門コマンド。

  C.J.デイトのリレーショナルモデル理論に基づき、正規化（1NF〜5NF）、JSONB最適化、
  インデックス戦略、外部キー制約を適用して、型安全で高パフォーマンスなスキーマを設計します。

  🤖 起動エージェント:
  - `.claude/agents/db-architect.md`: データベーススキーマ設計専門エージェント

  📚 利用可能スキル（タスクに応じてdb-architectエージェントが必要時に参照）:
  **Phase 1（要件理解時）:** master_system_design.md参照
  **Phase 2（論理設計時）:** database-normalization（正規化理論）、jsonb-optimization（JSONB設計）
  **Phase 3（インデックス設計時）:** indexing-strategies（B-Tree、GIN、GiST、BRIN選択）
  **Phase 4（制約設計時）:** foreign-key-constraints（参照整合性）、transaction-management（ACID特性）
  **Phase 5（検証時）:** sql-anti-patterns（アンチパターン検出）、query-optimization（クエリ最適化）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（テーブル名、未指定時は対話形式）
  - allowed-tools: エージェント起動と最小限のスキーマ操作用
    • Task: db-architectエージェント起動用
    • Read: 既存スキーマ・設計書参照用
    • Write(src/shared/infrastructure/database/**): スキーマファイル生成用（パス制限）
    • Edit: スキーマファイル編集用
    • Grep: 既存パターン検索用
  - model: sonnet（標準的なスキーマ設計タスク）

  トリガーキーワード: schema, database, table, Drizzle, normalization, JSONB
argument-hint: "[table-name]"
allowed-tools: [Task, Read, Write(src/shared/infrastructure/database/**|docs/database/**), Edit, Grep]
model: sonnet
---

# データベーススキーマ作成コマンド

## 目的

Drizzle ORMを使用して、以下の原則に基づくデータベーススキーマを設計・実装します:

- **正規化**: 第3正規形（3NF）を基本とし、意図的非正規化は文書化
- **JSONB活用**: 柔軟なスキーマが必要な箇所（動的属性、疎なデータ）に使用
- **UUID主キー**: 分散システム対応、セキュリティ向上
- **タイムスタンプ**: `created_at`, `updated_at` を全テーブルに必須
- **ソフトデリート**: `deleted_at` による論理削除を推奨

## 使用方法

### 基本的な使用（対話形式）

```bash
/ai:create-db-schema
```

対話形式でスキーマ設計の要件をヒアリングします。

### テーブル名指定

```bash
/ai:create-db-schema workflows
```

特定のテーブルスキーマを作成します。

## 実行フロー

### Phase 1: 起動準備

**db-architect エージェントを起動**:

```
@.claude/agents/db-architect.md を起動し、以下を依頼:

1. テーブル名が指定されている場合:
   - 対象テーブルの要件確認
   - 既存スキーマとの関係性分析

2. テーブル名が未指定の場合:
   - インタラクティブに要件をヒアリング
   - データモデル全体の理解
```

### Phase 2: スキーマ設計実行

**db-architect エージェントが Phase 1〜5 を実行**:

**Phase 1: 要件理解**
- `docs/00-requirements/master_system_design.md` から要件抽出
- 既存スキーマ分析（`src/shared/infrastructure/database/schema.ts`）
- アクセスパターン特定（WHERE句、JOIN条件、JSONB演算子）

**Phase 2: スキーマ設計**
- 論理スキーマ設計（database-normalization スキル参照）
  - エンティティ特定、主キー決定
  - 第3正規形への正規化
  - 意図的非正規化の判断と文書化
- JSONB構造設計（jsonb-optimization スキル参照）
  - JSONB使用判断（動的属性、疎なデータに限定）
  - 構造定義（ネスト2-3階層まで）
- 物理スキーマ実装（Drizzle ORM）
  - TypeScript型の正確なマッピング
  - ソフトデリート対応（deleted_at）
  - 状態管理（Enum）

**Phase 3: インデックス設計**（indexing-strategies スキル参照）
- インデックス候補特定（外部キー、WHERE句頻出カラム）
- インデックスタイプ選択（B-Tree、GIN、部分インデックス）
- 複合インデックス設計（カラム順序の最適化）

**Phase 4: 制約設計**（foreign-key-constraints スキル参照）
- 外部キー制約（CASCADE動作の戦略的選択）
- CHECK制約（値の範囲制約、JSONB基本検証）

**Phase 5: 検証**（sql-anti-patterns スキル参照）
- アンチパターンチェック（ジェイウォーク、EAV、Polymorphic Associations）
- スキーマドキュメント作成

### Phase 3: 成果物

**db-architect エージェントが以下を提供**:

```
成果物:
- src/shared/infrastructure/database/schema.ts（スキーマ定義）
- docs/database/schema-design.md（設計ドキュメント）
- インデックス戦略とCASCADE動作の文書化
```

## 期待される成果物

```typescript
// src/shared/infrastructure/database/schema.ts
import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const workflowStatusEnum = pgEnum('workflow_status', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'RETRYING'
]);

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(),
  user_id: varchar('user_id', { length: 100 }).notNull(),
  status: workflowStatusEnum('status').notNull().default('PENDING'),
  input_payload: jsonb('input_payload').notNull().default('{}'),
  output_payload: jsonb('output_payload'),
  error_log: text('error_log'),
  retry_count: integer('retry_count').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  completed_at: timestamp('completed_at'),
  deleted_at: timestamp('deleted_at')
});

// インデックス定義
export const workflowsIndexes = {
  statusIdx: index('idx_workflows_status').on(workflows.status),
  userIdIdx: index('idx_workflows_user_id').on(workflows.user_id),
  typeStatusIdx: index('idx_workflows_type_status').on(workflows.type, workflows.status),
  // JSONB検索用GINインデックス
  inputPayloadIdx: index('idx_workflows_input_payload').using('gin', workflows.input_payload),
  // ソフトデリート対応
  deletedAtIdx: index('idx_workflows_deleted_at').on(workflows.deleted_at)
};
```

## 注意事項

- **詳細な設計**: すべての設計ロジックは db-architect エージェントと各スキルが実行
- **コマンドの役割**: エージェント起動と要件の受け渡しのみ
- **マイグレーション**: スキーマ変更は必ず Drizzle マイグレーション経由
- **既存パターン遵守**: プロジェクト固有の命名規則と設計原則を継承

## 関連コマンド

- `/ai:create-migration`: スキーマ変更をマイグレーションに反映
- `/ai:optimize-queries`: スキーマに基づくクエリ最適化
- `/ai:setup-db-backup`: バックアップ戦略の確立
