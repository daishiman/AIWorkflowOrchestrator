---
name: .claude/skills/agent-template-patterns/SKILL.md
description: |
  エージェントテンプレートと設計パターンを専門とするスキル。
  4タイプのエージェントテンプレート（分析、実装、オーケストレーター、デプロイ）、
  {{variable}}形式による抽象化、抽象度バランス、概念要素設計の原則を提供。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/template-reference-guide.md`: テンプレート参照ガイド（11個のテンプレート一覧とPhase別活用法）
  - `resources/template-variable-guide.md`: 変数化ガイド（{{variable}}形式の設計と使用法）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/unified-agent-template.md`: 統一エージェントテンプレート
  
  Use proactively when handling agent template patterns tasks.
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

# Agent Template Patterns

## 概要

エージェントテンプレートと設計パターンを専門とするスキル。
4タイプのエージェントテンプレート（分析、実装、オーケストレーター、デプロイ）、
{{variable}}形式による抽象化、抽象度バランス、概念要素設計の原則を提供。

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
- 新しいエージェントタイプのテンプレートを作成する時
- 既存エージェントを汎用化する時
- エージェント量産のための標準化が必要な時
- 抽象度のバランスを最適化する時
- 変数化によるテンプレートの再利用性を高める時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/agent-template-patterns/resources/Level1_basics.md
cat .claude/skills/agent-template-patterns/resources/Level2_intermediate.md
cat .claude/skills/agent-template-patterns/resources/Level3_advanced.md
cat .claude/skills/agent-template-patterns/resources/Level4_expert.md
cat .claude/skills/agent-template-patterns/resources/legacy-skill.md
cat .claude/skills/agent-template-patterns/resources/template-reference-guide.md
cat .claude/skills/agent-template-patterns/resources/template-variable-guide.md
```

### スクリプト実行
```bash
node .claude/skills/agent-template-patterns/scripts/log_usage.mjs --help
node .claude/skills/agent-template-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/agent-template-patterns/templates/unified-agent-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
