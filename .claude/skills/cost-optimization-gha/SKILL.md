---
name: .claude/skills/cost-optimization-gha/SKILL.md
description: |
  GitHub Actions ワークフローのコスト最適化戦略。
  専門分野:
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/execution-time.md`: execution-time の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/runner-costs.md`: runner-costs の詳細ガイド
  - `scripts/estimate-costs.mjs`: estimatecostsを処理するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/optimized-workflow.yaml`: optimized-workflow のテンプレート
  
  Use proactively when handling cost optimization gha tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "High Performance Browser Networking"
    author: "Ilya Grigorik"
    concepts:
      - "パフォーマンス測定"
      - "最適化"
---

# GitHub Actions Cost Optimization

## 概要

GitHub Actions ワークフローのコスト最適化戦略。
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
- GitHub Actions の実行コストを削減したい時
- 月次請求額を最適化したい時
- ランナーの使用時間を短縮したい時
- ストレージコストを管理する時
- 無料枠を効率的に使用したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/cost-optimization-gha/resources/Level1_basics.md
cat .claude/skills/cost-optimization-gha/resources/Level2_intermediate.md
cat .claude/skills/cost-optimization-gha/resources/Level3_advanced.md
cat .claude/skills/cost-optimization-gha/resources/Level4_expert.md
cat .claude/skills/cost-optimization-gha/resources/execution-time.md
cat .claude/skills/cost-optimization-gha/resources/legacy-skill.md
cat .claude/skills/cost-optimization-gha/resources/runner-costs.md
```

### スクリプト実行
```bash
node .claude/skills/cost-optimization-gha/scripts/estimate-costs.mjs --help
node .claude/skills/cost-optimization-gha/scripts/log_usage.mjs --help
node .claude/skills/cost-optimization-gha/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/cost-optimization-gha/templates/optimized-workflow.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
