---
name: .claude/skills/boundary-value-analysis/SKILL.md
description: |
  境界値分析と同値分割を専門とするスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/boundary-value-fundamentals.md`: 境界値分析の基本概念と境界値±1の系統的テスト手法の基礎
  - `resources/combination-strategies.md`: 複数パラメータの組み合わせテスト最適化戦略（ペアワイズ・直交表・全組み合わせ）
  - `resources/edge-cases-catalog.md`: 極端な値・空値・NULL・特殊文字・同時実行・タイムアウト等の実践的エッジケースカタログ
  - `resources/equivalence-partitioning.md`: 入力空間を同じ動作のグループに分割し代表値でテストする同値分割技法と有効・無効クラスの設計
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/boundary-test-generator.mjs`: 境界値テストケース生成スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/test-case-design-template.md`: テストケース設計テンプレート
  
  Use proactively when designing test cases for validation logic.
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

# Boundary Value Analysis

## 概要

境界値分析と同値分割を専門とするスキル。

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
- テストケースを設計する時
- 入力の妥当性検証をテストする時
- バグが境界値で発生した時
- テスト数を最適化したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/boundary-value-analysis/resources/Level1_basics.md
cat .claude/skills/boundary-value-analysis/resources/Level2_intermediate.md
cat .claude/skills/boundary-value-analysis/resources/Level3_advanced.md
cat .claude/skills/boundary-value-analysis/resources/Level4_expert.md
cat .claude/skills/boundary-value-analysis/resources/boundary-value-fundamentals.md
cat .claude/skills/boundary-value-analysis/resources/combination-strategies.md
cat .claude/skills/boundary-value-analysis/resources/edge-cases-catalog.md
cat .claude/skills/boundary-value-analysis/resources/equivalence-partitioning.md
cat .claude/skills/boundary-value-analysis/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/boundary-value-analysis/scripts/boundary-test-generator.mjs --help
node .claude/skills/boundary-value-analysis/scripts/log_usage.mjs --help
node .claude/skills/boundary-value-analysis/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/boundary-value-analysis/templates/test-case-design-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
