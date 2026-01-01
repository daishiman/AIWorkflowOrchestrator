---
name: .claude/skills/slo-sli-design/SKILL.md
description: |
  SLO/SLI設計とエラーバジェット管理の専門スキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/error-budget-management.md`: Error Budget Managementリソース
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/sli-design-guide.md`: Sli Design Guideリソース
  - `scripts/calculate-error-budget.mjs`: Calculate Error Budgetスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/slo-definition-template.yaml`: Slo Definitionテンプレート
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling slo sli design tasks.
---

# SLO/SLI Design - サービスレベル目標設計

## 概要

SLO/SLI設計とエラーバジェット管理の専門スキル。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/slo-sli-design/references/Level1_basics.md
cat .claude/skills/slo-sli-design/references/Level2_intermediate.md
cat .claude/skills/slo-sli-design/references/Level3_advanced.md
cat .claude/skills/slo-sli-design/references/Level4_expert.md
cat .claude/skills/slo-sli-design/references/error-budget-management.md
cat .claude/skills/slo-sli-design/references/legacy-skill.md
cat .claude/skills/slo-sli-design/references/sli-design-guide.md
```

### スクリプト実行
```bash
node .claude/skills/slo-sli-design/scripts/calculate-error-budget.mjs --help
node .claude/skills/slo-sli-design/scripts/log_usage.mjs --help
node .claude/skills/slo-sli-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/slo-sli-design/assets/slo-definition-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
