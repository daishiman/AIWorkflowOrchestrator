---
name: .claude/skills/command-performance-optimization/SKILL.md
description: |
  コマンドのパフォーマンス最適化を専門とするスキル。
  トークン効率化、並列実行の活用、モデル選択の最適化、
  実行速度の改善方法を提供します。
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/execution-speed.md`: キャッシング・早期リターン・遅延実行・バッチ処理による実行速度改善と<5秒目標の測定方法
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/model-selection.md`: Haiku(単純)/Sonnet(標準)/Opus(複雑)の選択基準と90%コスト削減のHaiku活用戦略
  - `resources/parallel-execution.md`: 独立タスクの並列化条件判定とBranch/Wait/Combineパターンによる並列実行設計
  - `resources/token-optimization.md`: description/本文圧縮で73%削減、不要情報削除と箇条書き活用によるトークン最適化技法
  - `scripts/analyze-performance.mjs`: パフォーマンス分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/optimized-command-template.md`: 最適化コマンドテンプレート
  - `templates/parallel-execution-template.md`: 並列実行テンプレート
  
  Use proactively when handling command performance optimization tasks.
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

# Command Performance Optimization

## 概要

コマンドのパフォーマンス最適化を専門とするスキル。
トークン効率化、並列実行の活用、モデル選択の最適化、
実行速度の改善方法を提供します。

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
- コマンドの実行速度を改善したい時
- トークン使用量を削減したい時
- 並列実行を活用したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/command-performance-optimization/resources/Level1_basics.md
cat .claude/skills/command-performance-optimization/resources/Level2_intermediate.md
cat .claude/skills/command-performance-optimization/resources/Level3_advanced.md
cat .claude/skills/command-performance-optimization/resources/Level4_expert.md
cat .claude/skills/command-performance-optimization/resources/execution-speed.md
cat .claude/skills/command-performance-optimization/resources/legacy-skill.md
cat .claude/skills/command-performance-optimization/resources/model-selection.md
cat .claude/skills/command-performance-optimization/resources/parallel-execution.md
cat .claude/skills/command-performance-optimization/resources/token-optimization.md
```

### スクリプト実行
```bash
node .claude/skills/command-performance-optimization/scripts/analyze-performance.mjs --help
node .claude/skills/command-performance-optimization/scripts/log_usage.mjs --help
node .claude/skills/command-performance-optimization/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/command-performance-optimization/templates/optimized-command-template.md
cat .claude/skills/command-performance-optimization/templates/parallel-execution-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
