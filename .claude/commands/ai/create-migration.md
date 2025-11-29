---
description: |
  データベースマイグレーションファイル作成(Drizzle Kit 0.39.x準拠)。

  安全で可逆的なUp/Downマイグレーション設計、移行期間パターン、ロールバック戦略を含む完全なマイグレーション管理を実行します。

  🤖 起動エージェント:
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント(Phase 1で起動)

  📚 利用可能スキル(フェーズ別、dba-mgrエージェントが必要時に参照):
  **Phase 1(スキーマ分析時):** なし(既存スキーマ・マイグレーション履歴分析のみ)
  **Phase 2(マイグレーション設計時):** database-migrations(必須), query-performance-tuning(インデックス追加時)
  **Phase 3(実装時):** database-seeding(初期データ投入時), connection-pooling(接続設定変更時)
  **Phase 4(信頼性保証時):** backup-recovery(必須), query-performance-tuning(必須)
  **Phase 5(デプロイ時):** database-migrations(必須), database-monitoring(本番監視設定時)

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ(未指定時はインタラクティブ)
  - allowed-tools: エージェント起動と最小限のマイグレーション実行用
    • Task: dba-mgrエージェント起動用
    • Read: 既存スキーマ・マイグレーション履歴確認用
    • Write(drizzle/migrations/**): マイグレーション成果物書き込み専用(パス制限)
    • Bash(pnpm drizzle*): Drizzle Kitコマンド実行のみ(パターン制限)
    • Grep: スキーマ分析・インデックス検索用
  - model: sonnet(構造化マイグレーション設計タスク)

  トリガーキーワード: migration, schema change, migrate, rollback, マイグレーション, スキーマ変更, ロールバック
argument-hint: "[migration-name]"
allowed-tools: [Task, Read, Write(drizzle/migrations/**), Bash(pnpm drizzle*), Grep]
model: opus
---

# データベースマイグレーション作成コマンド

## Phase 1: 準備とコンテキスト収集

**対象マイグレーション**: `$ARGUMENTS`(未指定時はインタラクティブに質問)

**必須参照**:
- `docs/00-requirements/master_system_design.md` 第5.2節(データベース設計原則、トランザクション管理、マイグレーション原則)
- `src/shared/infrastructure/database/schema.ts`(既存スキーマパターン)
- `drizzle/migrations/`(マイグレーション履歴)

---

## Phase 2: dba-mgrエージェント起動

`.claude/agents/dba-mgr.md` を以下のパラメータで起動:

**入力情報**:
- 対象: `$ARGUMENTS` または対話的に決定
- 技術スタック: Drizzle ORM 0.39.x + Neon PostgreSQL
- スキーマ配置: `src/shared/infrastructure/database/schema.ts`
- マイグレーション配置: `drizzle/migrations/`

**実行依頼内容**:
1. スキーマ分析(既存テーブル構造、関係性、インデックス、マイグレーション履歴)
2. マイグレーション設計(Up/Down両方必須、移行期間パターン、インデックス戦略)
3. 実装とテスト(Drizzleスキーマ更新、マイグレーション生成、Seed実装、ロールバックテスト)
4. 信頼性保証(バックアップ確認、パフォーマンステスト、EXPLAIN ANALYZE検証)
5. デプロイと監視(CI/CD統合、本番マイグレーション計画、監視設定)

**エージェントが参照するスキル**(Progressive Disclosure方式):
- `.claude/skills/database-migrations/SKILL.md`(Phase 2, 3, 5: マイグレーション設計・実装・デプロイ時)
- `.claude/skills/backup-recovery/SKILL.md`(Phase 4: バックアップ確認時)
- `.claude/skills/query-performance-tuning/SKILL.md`(Phase 2, 4: インデックス設計・パフォーマンステスト時)
- その他必要に応じて: database-seeding, connection-pooling, database-monitoring

---

## Phase 3: 成果物の確認

**期待される成果物**:
- `src/shared/infrastructure/database/schema.ts`(スキーマ更新)
- `drizzle/migrations/YYYYMMDD_HHMMSS_*.sql`(UpマイグレーションSQL)
- `drizzle/migrations/YYYYMMDD_HHMMSS_*_down.sql`(DownマイグレーションSQL)
- `docs/database/migration-plan-[name].md`(マイグレーション計画書)
- `src/shared/infrastructure/database/seed.ts`(初期データ投入、必要時)

**設計原則準拠チェック**(master_system_design.md 第5.2節):
- ✅ Up/Down両方のマイグレーション提供(可逆性保証)
- ✅ ローカル環境でのテスト成功(up → down → up)
- ✅ バックアップ戦略確立(変更前バックアップ必須)
- ✅ パフォーマンステスト完了(EXPLAIN ANALYZE検証)
- ✅ CI/CDパイプライン統合(drizzle:migrate実行)
- ✅ ドキュメント更新(スキーマ変更内容、影響範囲)
- ✅ ACID特性遵守(トランザクション内実行)
- ✅ インデックス戦略適用(全外部キー、GIN索引)

---

**使用例**:

```bash
# 基本マイグレーション作成
/ai:create-migration add-user-role-column

# テーブル追加マイグレーション
/ai:create-migration create-notifications-table

# インデックス追加マイグレーション
/ai:create-migration add-index-workflows-status

# 移行期間パターン(破壊的変更)
/ai:create-migration rename-column-with-transition

# インタラクティブモード
/ai:create-migration
```

**関連コマンド**:
- `/ai:design-database` - スキーマ設計(マイグレーション前提)
- `/ai:optimize-queries` - クエリ最適化(パフォーマンステスト後)
- `/ai:create-schema` - Zodスキーマ定義(入力バリデーション連携)
