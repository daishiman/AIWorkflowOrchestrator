---
name: .claude/skills/agent-persona-design/SKILL.md
description: |
  エージェントペルソナ設計を専門とするスキル。実在する専門家の思想をエージェントに移植します。
  
  📖 参照書籍:
  - 『The Society of Mind（心の社会）』（Marvin Minsky）: 小さなエージェント群による知性実現
  - 『Thinking, Fast and Slow（ファスト&スロー）』（Daniel Kahneman）: 専門家の思考パターンモデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/expert-modeling-guide.md`: 専門家モデリングガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/analyze-persona.mjs`: ペルソナ分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動レベルアップスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/persona-template.md`: ペルソナ設計テンプレート
  
  Use proactively when designing agent personas or selecting expert models.
version: 2.0.0
level: 2
last_updated: 2025-12-24
references:
  - book: "The Society of Mind（心の社会）"
    author: "Marvin Minsky"
    concepts:
      - "小さなエージェント群による知性実現"
  - book: "Thinking, Fast and Slow（ファスト&スロー）"
    author: "Daniel Kahneman"
    concepts:
      - "専門家の思考パターンモデリング"
---

# Agent Persona Design

## 概要

エージェントペルソナ設計を専門とするスキル。実在する専門家の思想をエージェントに移植します。

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
cat .claude/skills/agent-persona-design/resources/Level1_basics.md
cat .claude/skills/agent-persona-design/resources/Level2_intermediate.md
cat .claude/skills/agent-persona-design/resources/Level3_advanced.md
cat .claude/skills/agent-persona-design/resources/Level4_expert.md
cat .claude/skills/agent-persona-design/resources/expert-modeling-guide.md
cat .claude/skills/agent-persona-design/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/agent-persona-design/scripts/analyze-persona.mjs --help
node .claude/skills/agent-persona-design/scripts/log_usage.mjs --help
node .claude/skills/agent-persona-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/agent-persona-design/templates/persona-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 2.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
