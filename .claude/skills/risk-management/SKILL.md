---
name: .claude/skills/risk-management/SKILL.md
description: |
  プロジェクトリスクの識別、評価、軽減戦略の体系的手法。
  プロアクティブなリスク管理により、プロジェクトの成功確率を最大化します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/risk-analysis-framework.md`: risk-analysis-framework の詳細ガイド
  - `resources/risk-analysis.md`: 確率・影響度マトリクス、EMV分析、モンテカルロシミュレーション等の分析手法詳細
  - `resources/risk-identification-guide.md`: risk-identification-guide のガイド
  - `resources/risk-identification.md`: リスク識別手法（ブレインストーミング、SWOT、チェックリスト、デルファイ法等）の詳細ガイド
  - `scripts/calculate-risk-score.mjs`: リスクスコア・EMV自動計算ツール（Node.js実行可能）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/risk-register-template.md`: risk-register-template のテンプレート
  - `templates/risk-register.md`: リスクレジスター標準テンプレート（評価、対応策、監視計画含む）
  
  Use proactively when handling risk management tasks.
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

# リスク管理スキル

## 概要

プロジェクトリスクの識別、評価、軽減戦略の体系的手法。
プロアクティブなリスク管理により、プロジェクトの成功確率を最大化します。

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
- プロジェクト開始時のリスク評価
- スプリント計画でのリスク特定
- アーキテクチャ決定時の影響分析
- 変更管理とインパクト評価

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/risk-management/resources/Level1_basics.md
cat .claude/skills/risk-management/resources/Level2_intermediate.md
cat .claude/skills/risk-management/resources/Level3_advanced.md
cat .claude/skills/risk-management/resources/Level4_expert.md
cat .claude/skills/risk-management/resources/legacy-skill.md
cat .claude/skills/risk-management/resources/risk-analysis-framework.md
cat .claude/skills/risk-management/resources/risk-analysis.md
cat .claude/skills/risk-management/resources/risk-identification-guide.md
cat .claude/skills/risk-management/resources/risk-identification.md
```

### スクリプト実行
```bash
node .claude/skills/risk-management/scripts/calculate-risk-score.mjs --help
node .claude/skills/risk-management/scripts/log_usage.mjs --help
node .claude/skills/risk-management/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/risk-management/templates/risk-register-template.md
cat .claude/skills/risk-management/templates/risk-register.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
