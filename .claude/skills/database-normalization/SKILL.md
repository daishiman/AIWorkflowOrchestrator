---
name: .claude/skills/database-normalization/SKILL.md
description: |
  C.J.デイトの『データベース実践講義』に基づくリレーショナルデータベース正規化理論。
  第1〜5正規形の段階的適用と、パフォーマンス要件に基づく意図的な非正規化の判断基準を提供。
  専門分野:
  
  📖 参照書籍:
  - 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/normalization-levels-detail.md`: normalization-levels-detail の詳細ガイド
  - `scripts/analyze-normalization.mjs`: normalizationを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/denormalization-decision-template.md`: denormalization-decision-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling database normalization tasks.
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

# Database Normalization Skill

## 概要

C.J.デイトの『データベース実践講義』に基づくリレーショナルデータベース正規化理論。
第1〜5正規形の段階的適用と、パフォーマンス要件に基づく意図的な非正規化の判断基準を提供。
専門分野:

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
- 新規テーブル設計時の正規化レベル決定
- 既存スキーマの正規化レベル評価
- パフォーマンス問題の原因が正規化レベルにある可能性がある場合
- 非正規化の判断とその文書化が必要な場合

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/database-normalization/resources/Level1_basics.md
cat .claude/skills/database-normalization/resources/Level2_intermediate.md
cat .claude/skills/database-normalization/resources/Level3_advanced.md
cat .claude/skills/database-normalization/resources/Level4_expert.md
cat .claude/skills/database-normalization/resources/legacy-skill.md
cat .claude/skills/database-normalization/resources/normalization-levels-detail.md
```

### スクリプト実行
```bash
node .claude/skills/database-normalization/scripts/analyze-normalization.mjs --help
node .claude/skills/database-normalization/scripts/log_usage.mjs --help
node .claude/skills/database-normalization/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/database-normalization/templates/denormalization-decision-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
