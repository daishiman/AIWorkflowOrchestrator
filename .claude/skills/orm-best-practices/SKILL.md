---
name: .claude/skills/orm-best-practices/SKILL.md
description: |
  Drizzle ORMを活用したデータベース操作のベストプラクティスを提供するスキル。
  型安全なスキーマ定義、クエリビルダーの効果的な使用、
  パフォーマンスを考慮した実装パターンを提供します。
  
  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/performance-patterns.md`: パフォーマンスパターン
  - `resources/query-builder-patterns.md`: クエリビルダーパターン
  - `resources/relation-mapping.md`: リレーション設定とマッピング
  - `resources/schema-definition.md`: スキーマ定義パターン
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-schema.mjs`: Drizzle ORMスキーマ定義の型安全性と整合性を検証
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/schema-template.md`: Drizzle ORMテーブルスキーマ定義のTypeScriptテンプレート（型定義、リレーション、インデックス含む）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling orm best practices tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Designing Data-Intensive Applications"
    author: "Martin Kleppmann"
    concepts:
      - "データモデリング"
      - "パフォーマンス"
---

# ORM Best Practices

## 概要

Drizzle ORMを活用したデータベース操作のベストプラクティスを提供するスキル。
型安全なスキーマ定義、クエリビルダーの効果的な使用、
パフォーマンスを考慮した実装パターンを提供します。

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
- Drizzle ORMでスキーマを定義する時
- 複雑なクエリを構築する時
- エンティティマッピングを設計する時
- パフォーマンスを最適化する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/orm-best-practices/resources/Level1_basics.md
cat .claude/skills/orm-best-practices/resources/Level2_intermediate.md
cat .claude/skills/orm-best-practices/resources/Level3_advanced.md
cat .claude/skills/orm-best-practices/resources/Level4_expert.md
cat .claude/skills/orm-best-practices/resources/legacy-skill.md
cat .claude/skills/orm-best-practices/resources/performance-patterns.md
cat .claude/skills/orm-best-practices/resources/query-builder-patterns.md
cat .claude/skills/orm-best-practices/resources/relation-mapping.md
cat .claude/skills/orm-best-practices/resources/schema-definition.md
```

### スクリプト実行
```bash
node .claude/skills/orm-best-practices/scripts/log_usage.mjs --help
node .claude/skills/orm-best-practices/scripts/validate-schema.mjs --help
node .claude/skills/orm-best-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/orm-best-practices/templates/schema-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
