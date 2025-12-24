---
name: .claude/skills/semantic-versioning/SKILL.md
description: |
  セマンティックバージョニング（semver）に基づく依存関係変更の影響予測と対応戦略を専門とするスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/breaking-change-detection.md`: Breaking Change Detectionリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/migration-strategies.md`: Migration Strategiesリソース
  - `resources/semver-specification.md`: Semver Specificationリソース
  - `resources/version-range-patterns.md`: Version Range Patternsリソース
  - `scripts/analyze-version-impact.mjs`: Analyze Version Impactスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/upgrade-assessment-template.md`: Upgrade Assessmentテンプレート
  
  Use proactively when handling semantic versioning tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Semantic Versioning

## 概要

セマンティックバージョニング（semver）に基づく依存関係変更の影響予測と対応戦略を専門とするスキル。

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/semantic-versioning/resources/Level1_basics.md
cat .claude/skills/semantic-versioning/resources/Level2_intermediate.md
cat .claude/skills/semantic-versioning/resources/Level3_advanced.md
cat .claude/skills/semantic-versioning/resources/Level4_expert.md
cat .claude/skills/semantic-versioning/resources/breaking-change-detection.md
cat .claude/skills/semantic-versioning/resources/legacy-skill.md
cat .claude/skills/semantic-versioning/resources/migration-strategies.md
cat .claude/skills/semantic-versioning/resources/semver-specification.md
cat .claude/skills/semantic-versioning/resources/version-range-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/semantic-versioning/scripts/analyze-version-impact.mjs --help
node .claude/skills/semantic-versioning/scripts/log_usage.mjs --help
node .claude/skills/semantic-versioning/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/semantic-versioning/templates/upgrade-assessment-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
