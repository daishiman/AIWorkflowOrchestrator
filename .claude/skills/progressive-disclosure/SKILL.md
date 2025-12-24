---
name: .claude/skills/progressive-disclosure/SKILL.md
description: |
  3層開示モデルによるトークン効率と知識スケーラビリティの両立を専門とするスキル。
  メタデータ→本文→リソースの段階的な情報提供により、必要な時に必要な知識だけを
  ロードし、スキル発動信頼性を最大化します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/agent-dependency-format-guide.md`: agent-dependency-format-guide のガイド
  - `resources/commitment-mechanism.md`: コミットメントメカニズム設計ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/metadata-design.md`: メタデータ設計ガイド
  - `resources/skill-activation-optimization.md`: スキル発動最適化ガイド
  - `resources/three-layer-model.md`: 3層開示モデル詳細ガイド
  - `resources/token-efficiency-strategies.md`: 遅延読み込み、インデックス駆動設計によるトークン使用量60-80%削減手法
  - `scripts/calculate-token-usage.mjs`: Token Usage Calculator for Claude Code Skills
  - `scripts/calculate-token-usage.sh`: File Size Checker for Claude Code Skills
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/skill-metadata-template.yaml`: skill-metadata-template設定ファイル
  
  Use proactively when handling progressive disclosure tasks.
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

# Progressive Disclosure

## 概要

3層開示モデルによるトークン効率と知識スケーラビリティの両立を専門とするスキル。
メタデータ→本文→リソースの段階的な情報提供により、必要な時に必要な知識だけを
ロードし、スキル発動信頼性を最大化します。

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
- スキルのYAML Frontmatter（特にdescription）を設計する時
- トークン使用量を最小化する必要がある時
- スキルの自動発動率を向上させる時
- 大量の知識を効率的に提供する必要がある時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/progressive-disclosure/resources/Level1_basics.md
cat .claude/skills/progressive-disclosure/resources/Level2_intermediate.md
cat .claude/skills/progressive-disclosure/resources/Level3_advanced.md
cat .claude/skills/progressive-disclosure/resources/Level4_expert.md
cat .claude/skills/progressive-disclosure/resources/agent-dependency-format-guide.md
cat .claude/skills/progressive-disclosure/resources/commitment-mechanism.md
cat .claude/skills/progressive-disclosure/resources/legacy-skill.md
cat .claude/skills/progressive-disclosure/resources/metadata-design.md
cat .claude/skills/progressive-disclosure/resources/skill-activation-optimization.md
cat .claude/skills/progressive-disclosure/resources/three-layer-model.md
cat .claude/skills/progressive-disclosure/resources/token-efficiency-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs --help
.claude/skills/progressive-disclosure/scripts/calculate-token-usage.sh
node .claude/skills/progressive-disclosure/scripts/log_usage.mjs --help
node .claude/skills/progressive-disclosure/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
