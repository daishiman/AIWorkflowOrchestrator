---
name: .claude/skills/context-optimization/SKILL.md
description: |
  トークン使用量の最小化と必要情報の効率的抽出を専門とするスキル。
  遅延読み込み、インデックス駆動設計、圧縮と精錬により、
  コンテキストウィンドウを最適活用します。
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/compression-techniques.md`: compression-techniques の詳細ガイド
  - `resources/index-driven-design.md`: index-driven-design の詳細ガイド
  - `resources/lazy-loading-patterns.md`: lazy-loading-patterns のパターン集
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/estimate-tokens.mjs`: estimatetokensを処理するスクリプト
  - `scripts/estimate-tokens.sh`: estimatetokensを処理するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  
  Use proactively when handling context optimization tasks.
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

# Context Optimization

## 概要

トークン使用量の最小化と必要情報の効率的抽出を専門とするスキル。
遅延読み込み、インデックス駆動設計、圧縮と精錬により、
コンテキストウィンドウを最適活用します。

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
- トークン使用量を削減する必要がある時
- 大量の情報を効率的に提供したい時
- コンテキスト汚染を防ぎたい時
- 情報アクセスを最適化する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/context-optimization/resources/Level1_basics.md
cat .claude/skills/context-optimization/resources/Level2_intermediate.md
cat .claude/skills/context-optimization/resources/Level3_advanced.md
cat .claude/skills/context-optimization/resources/Level4_expert.md
cat .claude/skills/context-optimization/resources/compression-techniques.md
cat .claude/skills/context-optimization/resources/index-driven-design.md
cat .claude/skills/context-optimization/resources/lazy-loading-patterns.md
cat .claude/skills/context-optimization/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs --help
.claude/skills/context-optimization/scripts/estimate-tokens.sh
node .claude/skills/context-optimization/scripts/log_usage.mjs --help
node .claude/skills/context-optimization/scripts/validate-skill.mjs --help
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
