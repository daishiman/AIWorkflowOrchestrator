---
name: .claude/skills/database-seeding/SKILL.md
description: |
  データベースシーディング（初期データ投入）の専門スキル。
  開発環境のセットアップ、テストデータ生成、本番初期データ管理を
  安全かつ効率的に行うための知識を提供します。
  
  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/data-generation.md`: data-generation の詳細ガイド
  - `resources/environment-separation.md`: environment-separation の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/seed-strategies.md`: seed-strategies の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/seed-runner.mjs`: runnerをシードするスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/seed-file-template.ts`: seed-file-template のテンプレート
  
  Use proactively when handling database seeding tasks.
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

# Database Seeding

## 概要

データベースシーディング（初期データ投入）の専門スキル。
開発環境のセットアップ、テストデータ生成、本番初期データ管理を
安全かつ効率的に行うための知識を提供します。

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
- 新規プロジェクトの初期データを設計する時
- 開発環境のテストデータを生成する時
- テスト用フィクスチャを作成する時
- 本番デプロイ用の初期データを管理する時
- データ生成の自動化を構築する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/database-seeding/resources/Level1_basics.md
cat .claude/skills/database-seeding/resources/Level2_intermediate.md
cat .claude/skills/database-seeding/resources/Level3_advanced.md
cat .claude/skills/database-seeding/resources/Level4_expert.md
cat .claude/skills/database-seeding/resources/data-generation.md
cat .claude/skills/database-seeding/resources/environment-separation.md
cat .claude/skills/database-seeding/resources/legacy-skill.md
cat .claude/skills/database-seeding/resources/seed-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/database-seeding/scripts/log_usage.mjs --help
node .claude/skills/database-seeding/scripts/seed-runner.mjs --help
node .claude/skills/database-seeding/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/database-seeding/templates/seed-file-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
