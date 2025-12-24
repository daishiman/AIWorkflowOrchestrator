---
name: .claude/skills/chain-of-thought-reasoning/SKILL.md
description: |
  Chain-of-Thought（思考の連鎖）推論パターンを提供するスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/cot-fundamentals.md`: Chain-of-Thought 基礎理論
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/prompting-techniques.md`: CoTプロンプティング技法
  - `resources/reasoning-patterns.md`: 演繹・帰納・類推・仮説検証・分割統治・逆問題・比較分析の7つの推論パターンと適用場面
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/cot-prompt-templates.md`: CoTプロンプトテンプレート
  - `templates/self-consistency-template.md`: Self-Consistencyテンプレート
  
  Use proactively when designing prompts requiring.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "手順設計"
      - "実践的改善"
---

# Chain-of-Thought Reasoning

## 概要

Chain-of-Thought（思考の連鎖）推論パターンを提供するスキル。

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
- 複雑な推論が必要な時
- 回答の根拠を明示したい時
- 多段階の論理的思考が必要な時
- AIの思考プロセスを検証したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/chain-of-thought-reasoning/resources/Level1_basics.md
cat .claude/skills/chain-of-thought-reasoning/resources/Level2_intermediate.md
cat .claude/skills/chain-of-thought-reasoning/resources/Level3_advanced.md
cat .claude/skills/chain-of-thought-reasoning/resources/Level4_expert.md
cat .claude/skills/chain-of-thought-reasoning/resources/cot-fundamentals.md
cat .claude/skills/chain-of-thought-reasoning/resources/legacy-skill.md
cat .claude/skills/chain-of-thought-reasoning/resources/prompting-techniques.md
cat .claude/skills/chain-of-thought-reasoning/resources/reasoning-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/chain-of-thought-reasoning/scripts/log_usage.mjs --help
node .claude/skills/chain-of-thought-reasoning/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/chain-of-thought-reasoning/templates/cot-prompt-templates.md
cat .claude/skills/chain-of-thought-reasoning/templates/self-consistency-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
