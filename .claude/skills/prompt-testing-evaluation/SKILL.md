---
name: .claude/skills/prompt-testing-evaluation/SKILL.md
description: |
  プロンプトのテスト、評価、反復改善を専門とするスキル。
  A/Bテスト、評価メトリクス、自動化されたプロンプト品質保証により、
  本番環境で信頼性の高いプロンプトを実現します。
  
  📖 参照書籍:
  - 『Test-Driven Development: By Example』（Kent Beck）: Red-Green-Refactor
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/ab-testing-guide.md`: プロンプトA/Bテスト設計（サンプルサイズ、メトリクス、成功基準）
  - `resources/automated-evaluation.md`: LLM-as-a-Judge、自動スコアリング、回帰テスト自動化手法
  - `resources/evaluation-metrics.md`: 精度、一貫性、完全性、レイテンシ、コスト等の定量評価指標
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/prompt-evaluator.mjs`: Prompt Evaluator Script
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/evaluation-rubric.md`: 評価ルーブリックテンプレート
  - `templates/test-case-template.md`: テストケーステンプレート
  
  Use proactively when handling prompt testing evaluation tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Test-Driven Development: By Example"
    author: "Kent Beck"
    concepts:
      - "Red-Green-Refactor"
      - "テスト設計"
---

# Prompt Testing & Evaluation

## 概要

プロンプトのテスト、評価、反復改善を専門とするスキル。
A/Bテスト、評価メトリクス、自動化されたプロンプト品質保証により、
本番環境で信頼性の高いプロンプトを実現します。

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
- プロンプトの品質を定量的に評価したい時
- 複数のプロンプト候補を比較したい時
- プロンプトの継続的改善サイクルを確立したい時
- 本番デプロイ前の品質保証を行いたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/prompt-testing-evaluation/resources/Level1_basics.md
cat .claude/skills/prompt-testing-evaluation/resources/Level2_intermediate.md
cat .claude/skills/prompt-testing-evaluation/resources/Level3_advanced.md
cat .claude/skills/prompt-testing-evaluation/resources/Level4_expert.md
cat .claude/skills/prompt-testing-evaluation/resources/ab-testing-guide.md
cat .claude/skills/prompt-testing-evaluation/resources/automated-evaluation.md
cat .claude/skills/prompt-testing-evaluation/resources/evaluation-metrics.md
cat .claude/skills/prompt-testing-evaluation/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/prompt-testing-evaluation/scripts/log_usage.mjs --help
node .claude/skills/prompt-testing-evaluation/scripts/prompt-evaluator.mjs --help
node .claude/skills/prompt-testing-evaluation/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/prompt-testing-evaluation/templates/evaluation-rubric.md
cat .claude/skills/prompt-testing-evaluation/templates/test-case-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
