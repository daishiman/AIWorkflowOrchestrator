---
name: .claude/skills/database-migrations/SKILL.md
description: |
  スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。
  Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、
  ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。
  
  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/drizzle-kit-commands.md`: drizzle-kit-commands の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/migration-strategies.md`: migration-strategies の詳細ガイド
  - `resources/rollback-procedures.md`: rollback-procedures の詳細ガイド
  - `resources/schema-change-patterns.md`: schema-change-patterns のパターン集
  - `resources/transition-period-patterns.md`: transition-period-patterns のパターン集
  - `resources/zero-downtime-patterns.md`: zero-downtime-patterns のパターン集
  - `scripts/check-migration-safety.mjs`: マイグレーションsafetyを検証するスクリプト
  - `scripts/generate-rollback.mjs`: rollbackを生成するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/migration-checklist.md`: migration-checklist のチェックリスト
  - `templates/migration-plan-template.md`: migration-plan-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling database migrations tasks.
version: 1.1.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Designing Data-Intensive Applications"
    author: "Martin Kleppmann"
    concepts:
      - "データモデリング"
      - "パフォーマンス"
---

# Database Migrations

## 概要

スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。
Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、
ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- スキーマを変更する時
- マイグレーションを生成・適用する時
- 破壊的変更に移行期間を設ける時
- 本番環境にデプロイする時
- 問題発生時にロールバックする時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/database-migrations/resources/Level1_basics.md
cat .claude/skills/database-migrations/resources/Level2_intermediate.md
cat .claude/skills/database-migrations/resources/Level3_advanced.md
cat .claude/skills/database-migrations/resources/Level4_expert.md
cat .claude/skills/database-migrations/resources/drizzle-kit-commands.md
cat .claude/skills/database-migrations/resources/legacy-skill.md
cat .claude/skills/database-migrations/resources/migration-strategies.md
cat .claude/skills/database-migrations/resources/rollback-procedures.md
cat .claude/skills/database-migrations/resources/schema-change-patterns.md
cat .claude/skills/database-migrations/resources/transition-period-patterns.md
cat .claude/skills/database-migrations/resources/zero-downtime-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/database-migrations/scripts/check-migration-safety.mjs --help
node .claude/skills/database-migrations/scripts/generate-rollback.mjs --help
node .claude/skills/database-migrations/scripts/log_usage.mjs --help
node .claude/skills/database-migrations/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/database-migrations/templates/migration-checklist.md
cat .claude/skills/database-migrations/templates/migration-plan-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.1.0 | 2025-12-24 | Spec alignment and required artifacts added |
