---
description: |
  データベーススキーマ設計（Drizzle ORM 0.39.x + Neon PostgreSQL準拠）。

  3NF正規化、インデックス戦略、JSONB最適化を含む完全なスキーマ設計を実行します。

  🤖 起動エージェント:
  - `.claude/agents/db-architect.md`: データベーススキーマ設計専門エージェント（Phase 1で起動）

  📚 利用可能スキル（フェーズ別、db-architectエージェントが必要時に参照）:
  **Phase 1（要件理解時）:** なし（既存スキーマ分析のみ）
  **Phase 2（スキーマ設計時）:** database-normalization（必須）, jsonb-optimization（JSONB使用時）
  **Phase 3（インデックス設計時）:** indexing-strategies（必須）
  **Phase 4（制約設計時）:** foreign-key-constraints（必須）, transaction-management（必要時）
  **Phase 5（検証時）:** sql-anti-patterns（必須）, database-migrations（マイグレーション実行時）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時は全スキーマ設計）
  - allowed-tools: エージェント起動と最小限のスキーマ生成用
    • Task: db-architectエージェント起動用
    • Read: 既存スキーマ・設計書確認用
    • Write(docs/**|src/shared/infrastructure/database/**|drizzle/migrations/**): スキーマ・ドキュメント・マイグレーション生成用（パス制限）
    • Grep: アクセスパターン分析、アンチパターン検索用
  - model: sonnet（構造化設計タスク）

  トリガーキーワード: database design, schema, table, ER diagram, データベース設計, スキーマ, テーブル, 正規化
argument-hint: "[table-name]"
allowed-tools: [Task, Read, Write(docs/**|src/shared/infrastructure/database/**|drizzle/migrations/**), Grep]
model: opus
---

# データベーススキーマ設計コマンド

## Phase 1: 準備とコンテキスト収集

**対象テーブル**: `$ARGUMENTS`（未指定時は全スキーマ設計）

**必須参照**:
- `docs/00-requirements/master_system_design.md` 第5.2節（データベース設計原則）
- `src/shared/infrastructure/database/schema.ts`（既存スキーマパターン）

---

## Phase 2: db-architectエージェント起動

`.claude/agents/db-architect.md` を以下のパラメータで起動:

**入力情報**:
- 対象: `$ARGUMENTS` または全スキーマ
- 技術スタック: Drizzle ORM 0.39.x + Neon PostgreSQL
- スキーマ配置: `src/shared/infrastructure/database/schema.ts`
- マイグレーション: `drizzle/migrations/`

**実行依頼内容**:
1. 要件理解（既存スキーマ・アクセスパターン分析）
2. スキーマ設計（3NF正規化、JSONB構造、Drizzle型定義）
3. インデックス設計（外部キー索引、GIN索引、複合索引）
4. 制約設計（外部キー制約、CASCADE動作、CHECK制約）
5. 検証・ドキュメント化（アンチパターンチェック、マイグレーション計画）

**エージェントが参照するスキル**（Progressive Disclosure方式）:
- `.claude/skills/database-normalization/SKILL.md`（Phase 2: スキーマ設計時）
- `.claude/skills/indexing-strategies/SKILL.md`（Phase 3: インデックス設計時）
- `.claude/skills/foreign-key-constraints/SKILL.md`（Phase 4: 制約設計時）
- `.claude/skills/sql-anti-patterns/SKILL.md`（Phase 5: 検証時）
- その他必要に応じて: jsonb-optimization, transaction-management, database-migrations

---

## Phase 3: 成果物の確認

**期待される成果物**:
- `docs/database/er-diagram.md`（ER図Mermaid形式）
- `src/shared/infrastructure/database/schema.ts`（Drizzleスキーマ定義）
- `drizzle/migrations/YYYYMMDD_HHMMSS_*.sql`（マイグレーションスクリプト）
- `docs/database/indexing-strategy.md`（インデックス戦略ドキュメント）

**設計原則準拠チェック**（master_system_design.md 第5.2節）:
- ✅ 第3正規形準拠（意図的非正規化は文書化）
- ✅ UUID主キー、created_at/updated_at必須
- ✅ ソフトデリート（deleted_at）対応
- ✅ 全外部キーにインデックスと制約
- ✅ JSONB構造にGINインデックス
- ✅ マイグレーションロールバック可能

---

**使用例**:

```bash
# 全スキーマ設計
/ai:design-database

# 特定テーブル設計
/ai:design-database users

# 既存テーブル最適化
/ai:design-database workflows
```

**関連コマンド**:
- `/ai:create-migration` - マイグレーション実行
- `/ai:optimize-queries` - クエリ最適化
