---
description: |
  データベースマイグレーションファイル作成を行う専門コマンド。

  スコット・アンブラーのアジャイルデータベース手法に基づき、可逆的マイグレーション（Up/Down）、
  移行期間パターン、Blue-Green移行戦略を適用して、安全なスキーマ変更を実現します。

  🤖 起動エージェント:
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント

  📚 利用可能スキル（タスクに応じてdba-mgrエージェントが必要時に参照）:
  **Phase 1（分析時）:** 既存スキーマ・マイグレーション履歴の確認
  **Phase 2（設計時）:** database-migrations（Up/Down設計、移行期間パターン、Zero-Downtime）
  **Phase 3（実装時）:** Drizzle Kit マイグレーション生成
  **Phase 4（信頼性保証時）:** backup-recovery（バックアップ確認）、query-performance-tuning（EXPLAIN ANALYZE）
  **Phase 5（デプロイ時）:** CI/CD統合、本番適用計画

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（マイグレーション名、未指定時は対話形式）
  - allowed-tools: エージェント起動とマイグレーション操作用
    • Task: dba-mgrエージェント起動用
    • Read: スキーマ・履歴参照用
    • Write(drizzle/**|docs/**): マイグレーション・ドキュメント生成用（パス制限）
    • Bash(pnpm drizzle*): Drizzle Kitコマンド実行用
    • Grep: 既存パターン検索用
  - model: sonnet（標準的なマイグレーションタスク）

  トリガーキーワード: migration, schema-change, rollback, Up/Down, Drizzle
argument-hint: "[migration-name]"
allowed-tools: [Task, Read, Write(drizzle/**|docs/**), Bash(pnpm drizzle*), Grep]
model: sonnet
---

# データベースマイグレーション作成コマンド

## 目的

Drizzle ORMを使用して、以下の原則に基づくマイグレーションを作成します:

- **可逆性**: すべての変更はロールバック可能（Up/Down必須）
- **進化的設計**: スキーマは段階的に進化、大規模一括変更を避ける
- **移行期間**: 破壊的変更は新旧スキーマの共存期間を設ける
- **自動化**: バックアップ、マイグレーション、テストをCI/CDに統合

## 使用方法

### 基本的な使用（対話形式）

```bash
/ai:create-migration
```

対話形式でマイグレーション作成の要件をヒアリングします。

### マイグレーション名指定

```bash
/ai:create-migration add-workflow-retry-count
```

特定のマイグレーションを作成します。

## 実行フロー

### Phase 1: 起動準備

**dba-mgr エージェントを起動**:

```
@.claude/agents/dba-mgr.md を起動し、以下を依頼:

1. マイグレーション名が指定されている場合:
   - 変更内容の確認
   - 既存スキーマへの影響分析

2. マイグレーション名が未指定の場合:
   - インタラクティブに要件をヒアリング
   - スキーマ変更の目的と範囲を理解
```

### Phase 2: マイグレーション設計・実装

**dba-mgr エージェントが Phase 1〜5 を実行**:

**Phase 1: スキーマ分析とコンテキスト理解**
- スキーマ定義読み取り（`src/shared/infrastructure/database/schema.ts`）
- マイグレーション履歴確認（`drizzle/**/*.sql`）
- 設計書参照（`docs/00-requirements/master_system_design.md`）

**Phase 2: マイグレーション設計**（database-migrations スキル参照）
- 変更戦略立案（追加、変更、削除、移行期間パターン）
- Up/Down両方設計（可逆性保証）
- インデックス設計（パフォーマンス影響評価）
- 破壊的変更の場合は移行期間設計

**Phase 3: 実装とテスト**
- Drizzleスキーマ更新（`schema.ts`）
- マイグレーション生成（Drizzle Kit）
  ```bash
  pnpm drizzle-kit generate
  ```
- ローカルテスト実行
  ```bash
  pnpm drizzle-kit push
  ```
- ロールバックテスト（Downマイグレーション検証）

**Phase 4: 信頼性保証**
- バックアップ確認（backup-recovery スキル参照）
- パフォーマンステスト（query-performance-tuning スキル参照）
  ```sql
  EXPLAIN (ANALYZE, BUFFERS) SELECT ...
  ```
- データ整合性検証

**Phase 5: デプロイと監視**
- CI/CD統合（GitHub Actions等）
- 本番マイグレーション計画策定
- ドキュメント更新

### Phase 3: 成果物

**dba-mgr エージェントが以下を提供**:

```
成果物:
- drizzle/migrations/YYYYMMDDHHMMSS_<migration-name>.sql（マイグレーションSQL）
- docs/database/migration-plan-<migration-name>.md（マイグレーション計画書）
- ロールバック手順書
```

## 期待される成果物

### マイグレーションSQL例

```sql
-- drizzle/migrations/20250128120000_add_workflow_retry_count.sql

-- Up Migration
ALTER TABLE workflows ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;

-- インデックス追加（パフォーマンス考慮）
CREATE INDEX idx_workflows_retry_count ON workflows(retry_count) WHERE retry_count > 0;

-- Down Migration (ロールバック用)
-- DROP INDEX idx_workflows_retry_count;
-- ALTER TABLE workflows DROP COLUMN retry_count;
```

### マイグレーション計画書例

```markdown
# マイグレーション計画: add_workflow_retry_count

## 変更概要
- テーブル: workflows
- 追加カラム: retry_count (INTEGER, NOT NULL, DEFAULT 0)

## Up/Down確認
- [x] Up マイグレーション作成済み
- [x] Down マイグレーション作成済み（コメント化）

## パフォーマンス影響
- 既存レコード数: 1,000件
- 推定実行時間: < 5秒
- ロック時間: 最小（DEFAULT値あり）

## ロールバック手順
1. Downマイグレーション実行
2. データ整合性確認
3. アプリケーション再デプロイ

## テスト結果
- [x] ローカルテスト成功
- [x] ロールバックテスト成功
- [x] EXPLAIN ANALYZE確認済み
```

## 注意事項

- **詳細な設計・実装**: すべてのマイグレーションロジックは dba-mgr エージェントと各スキルが実行
- **コマンドの役割**: エージェント起動と要件の受け渡しのみ
- **可逆性必須**: Down マイグレーションが提供されていない変更は承認しない
- **本番環境**: 直接的なSQL実行は禁止、マイグレーション経由のみ
- **破壊的変更**: DROP TABLE、DROP COLUMN等はユーザー確認必須

## 関連コマンド

- `/ai:create-db-schema`: スキーマ設計後にマイグレーション作成
- `/ai:setup-db-backup`: マイグレーション前にバックアップ確認
- `/ai:optimize-queries`: マイグレーション後のクエリ最適化
