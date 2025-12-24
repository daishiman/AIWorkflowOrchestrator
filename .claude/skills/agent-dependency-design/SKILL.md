---
name: .claude/skills/agent-dependency-design/SKILL.md
description: |
  エージェント依存関係とインターフェース設計を専門とするスキル。
  スキル参照、コマンド連携、エージェント間協調のプロトコルを定義し、
  循環依存を防ぎながら効果的なマルチエージェントシステムを構築します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/dependency-patterns.md`: 4種類の依存関係（スキル・エージェント・コマンド・ツール）のパターンと標準ハンドオフプロトコル（JSON形式）、循環依存検出・解消策
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/check-circular-deps.mjs`: 循環依存検出スクリプト (Node.js)
  - `scripts/check-circular-deps.sh`: 循環依存検出スクリプト (Shell)
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/handoff-protocol-template.json`: ハンドオフプロトコルテンプレート
  
  Use proactively when handling agent dependency design tasks.
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

# Agent Dependency Design

## 概要

エージェント依存関係とインターフェース設計を専門とするスキル。
スキル参照、コマンド連携、エージェント間協調のプロトコルを定義し、
循環依存を防ぎながら効果的なマルチエージェントシステムを構築します。

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
- エージェントがスキルを参照する必要がある時
- エージェント間の情報受け渡しを設計する時
- 依存関係の循環を検出・解消する時
- ハンドオフプロトコルを定義する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/agent-dependency-design/resources/Level1_basics.md
cat .claude/skills/agent-dependency-design/resources/Level2_intermediate.md
cat .claude/skills/agent-dependency-design/resources/Level3_advanced.md
cat .claude/skills/agent-dependency-design/resources/Level4_expert.md
cat .claude/skills/agent-dependency-design/resources/dependency-patterns.md
cat .claude/skills/agent-dependency-design/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs --help
.claude/skills/agent-dependency-design/scripts/check-circular-deps.sh
node .claude/skills/agent-dependency-design/scripts/log_usage.mjs --help
node .claude/skills/agent-dependency-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/agent-dependency-design/templates/handoff-protocol-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
