---
name: .claude/skills/agent-architecture-patterns/SKILL.md
description: |
  マービン・ミンスキーの『心の社会』に基づくエージェントアーキテクチャパターンと
  設計原則を専門とするスキル。単一責任の原則、創発的複雑性、階層的組織化により、
  効果的なマルチエージェントシステムを設計します。
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/pattern-catalog.md`: 4つのアーキテクチャパターン（オーケストレーター・ワーカー、ハブアンドスポーク、パイプライン、ステートマシン）の詳細カタログと選択ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-architecture.mjs`: アーキテクチャ検証スクリプト (Node.js)
  - `scripts/validate-architecture.sh`: アーキテクチャ検証スクリプト (Shell)
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/orchestrator-worker-template.md`: オーケストレーター・ワーカーテンプレート
  - `templates/pipeline-template.md`: パイプラインテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling agent architecture patterns tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Clean Architecture"
    author: "Robert C. Martin"
    concepts:
      - "依存関係ルール"
      - "境界の設計"
---

# Agent Architecture Patterns

## 概要

マービン・ミンスキーの『心の社会』に基づくエージェントアーキテクチャパターンと
設計原則を専門とするスキル。単一責任の原則、創発的複雑性、階層的組織化により、
効果的なマルチエージェントシステムを設計します。

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
- 新しいエージェントのアーキテクチャを設計する時
- マルチエージェントシステムの構造を決定する時
- エージェント間の協調パターンを選択する時
- 既存エージェントの構造をリファクタリングする時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/agent-architecture-patterns/resources/Level1_basics.md
cat .claude/skills/agent-architecture-patterns/resources/Level2_intermediate.md
cat .claude/skills/agent-architecture-patterns/resources/Level3_advanced.md
cat .claude/skills/agent-architecture-patterns/resources/Level4_expert.md
cat .claude/skills/agent-architecture-patterns/resources/legacy-skill.md
cat .claude/skills/agent-architecture-patterns/resources/pattern-catalog.md
```

### スクリプト実行
```bash
node .claude/skills/agent-architecture-patterns/scripts/log_usage.mjs --help
node .claude/skills/agent-architecture-patterns/scripts/validate-architecture.mjs --help
.claude/skills/agent-architecture-patterns/scripts/validate-architecture.sh
node .claude/skills/agent-architecture-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/agent-architecture-patterns/templates/orchestrator-worker-template.md
cat .claude/skills/agent-architecture-patterns/templates/pipeline-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
