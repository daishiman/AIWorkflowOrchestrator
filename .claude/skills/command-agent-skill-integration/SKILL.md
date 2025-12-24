---
name: .claude/skills/command-agent-skill-integration/SKILL.md
description: |
  コマンド、エージェント、スキルの統合を専門とするスキル。
  三位一体の概念、コマンド→エージェント起動パターン、コマンド→スキル参照パターン、
  複合ワークフローの設計を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/command-to-agent-patterns.md`: コマンドからエージェント呼び出しパターン
  - `resources/command-to-skill-patterns.md`: コマンドからスキル参照パターン
  - `resources/composite-workflows.md`: 複合ワークフロー設計
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/trinity-architecture.md`: コマンド・エージェント・スキル三位一体アーキテクチャ
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-integration.mjs`: エージェント参照・スキル参照・連携パターンの正確性検証とTrinity Architectureの統合チェック
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/agent-invocation-template.md`: エージェント起動テンプレート
  - `templates/composite-workflow-template.md`: 複合ワークフローテンプレート
  - `templates/skill-reference-template.md`: スキル参照テンプレート
  
  Use proactively when handling command agent skill integration tasks.
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

# Command-Agent-Skill Integration

## 概要

コマンド、エージェント、スキルの統合を専門とするスキル。
三位一体の概念、コマンド→エージェント起動パターン、コマンド→スキル参照パターン、
複合ワークフローの設計を提供します。

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
- コマンドからエージェントを起動したい時
- コマンド内でスキルを参照したい時
- Command-Agent-Skillの協調ワークフローを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/command-agent-skill-integration/resources/Level1_basics.md
cat .claude/skills/command-agent-skill-integration/resources/Level2_intermediate.md
cat .claude/skills/command-agent-skill-integration/resources/Level3_advanced.md
cat .claude/skills/command-agent-skill-integration/resources/Level4_expert.md
cat .claude/skills/command-agent-skill-integration/resources/command-to-agent-patterns.md
cat .claude/skills/command-agent-skill-integration/resources/command-to-skill-patterns.md
cat .claude/skills/command-agent-skill-integration/resources/composite-workflows.md
cat .claude/skills/command-agent-skill-integration/resources/legacy-skill.md
cat .claude/skills/command-agent-skill-integration/resources/trinity-architecture.md
```

### スクリプト実行
```bash
node .claude/skills/command-agent-skill-integration/scripts/log_usage.mjs --help
node .claude/skills/command-agent-skill-integration/scripts/validate-integration.mjs --help
node .claude/skills/command-agent-skill-integration/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/command-agent-skill-integration/templates/agent-invocation-template.md
cat .claude/skills/command-agent-skill-integration/templates/composite-workflow-template.md
cat .claude/skills/command-agent-skill-integration/templates/skill-reference-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
