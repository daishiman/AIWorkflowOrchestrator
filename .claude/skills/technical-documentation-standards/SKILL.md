---
name: .claude/skills/technical-documentation-standards/SKILL.md
description: |
  IEEE 830、Documentation as Code、DRY原則に基づく技術文書化標準の専門スキル。
  
  📖 参照書籍:
  - 『Software Requirements』（Karl Wiegers）: 要求分析
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/clarity-checklist.md`: Clarity Checklistリソース
  - `resources/doc-as-code.md`: Doc As Codeリソース
  - `resources/dry-for-documentation.md`: Dry For Documentationリソース
  - `resources/ieee-830-overview.md`: Ieee 830 Overviewリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/verification-patterns.md`: Verification Patternsリソース
  - `scripts/check-dry-violations.mjs`: Check Dry Violationsスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/srs-template.md`: IEEE 830準拠のソフトウェア要件仕様書テンプレート（構造化・検証可能記述）
  
  Use proactively when handling technical documentation standards tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Software Requirements"
    author: "Karl Wiegers"
    concepts:
      - "要求分析"
      - "仕様化"
---

# Technical Documentation Standards

## 概要

IEEE 830、Documentation as Code、DRY原則に基づく技術文書化標準の専門スキル。

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
cat .claude/skills/technical-documentation-standards/resources/Level1_basics.md
cat .claude/skills/technical-documentation-standards/resources/Level2_intermediate.md
cat .claude/skills/technical-documentation-standards/resources/Level3_advanced.md
cat .claude/skills/technical-documentation-standards/resources/Level4_expert.md
cat .claude/skills/technical-documentation-standards/resources/clarity-checklist.md
cat .claude/skills/technical-documentation-standards/resources/doc-as-code.md
cat .claude/skills/technical-documentation-standards/resources/dry-for-documentation.md
cat .claude/skills/technical-documentation-standards/resources/ieee-830-overview.md
cat .claude/skills/technical-documentation-standards/resources/legacy-skill.md
cat .claude/skills/technical-documentation-standards/resources/verification-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/technical-documentation-standards/scripts/check-dry-violations.mjs --help
node .claude/skills/technical-documentation-standards/scripts/log_usage.mjs --help
node .claude/skills/technical-documentation-standards/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/technical-documentation-standards/templates/srs-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
