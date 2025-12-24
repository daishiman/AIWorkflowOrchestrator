---
name: .claude/skills/agent-structure-design/SKILL.md
description: |
  Claude Codeエージェントの構造設計を専門とするスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/dependency-skill-format-guide.md`: 📚 依存スキル形式の詳細ルール
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/skill-dependency-format-examples.md`: skill-dependency-format-examples の詳細ガイド
  - `resources/yaml-description-rules.md`: yaml-description-rules の詳細ガイド
  - `resources/yaml-frontmatter-guide.md`: YAML Frontmatter必須フィールド（name・description・tools・model・version）の最適化とトリガーキーワード設計ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-structure.mjs`: YAML Frontmatter構文・必須フィールド・必須セクション・ファイル構造の4項目を自動検証するNode.jsスクリプト
  - `scripts/validate-structure.sh`: structureを検証するスクリプト
  - `templates/agent-template.md`: エージェントテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling agent structure design tasks.
version: 1.1.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "手順設計"
      - "実践的改善"
---

# Agent Structure Design

## 概要

Claude Codeエージェントの構造設計を専門とするスキル。

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
- 新しいエージェントのYAML Frontmatterを設計する時
- 📚 依存スキルセクションを標準化する時
- システムプロンプト本文の構造を決定する時
- ワークフローのPhase構成を設計する時
- 必須セクションの内容を定義する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/agent-structure-design/resources/Level1_basics.md
cat .claude/skills/agent-structure-design/resources/Level2_intermediate.md
cat .claude/skills/agent-structure-design/resources/Level3_advanced.md
cat .claude/skills/agent-structure-design/resources/Level4_expert.md
cat .claude/skills/agent-structure-design/resources/dependency-skill-format-guide.md
cat .claude/skills/agent-structure-design/resources/legacy-skill.md
cat .claude/skills/agent-structure-design/resources/skill-dependency-format-examples.md
cat .claude/skills/agent-structure-design/resources/yaml-description-rules.md
cat .claude/skills/agent-structure-design/resources/yaml-frontmatter-guide.md
```

### スクリプト実行
```bash
node .claude/skills/agent-structure-design/scripts/log_usage.mjs --help
node .claude/skills/agent-structure-design/scripts/validate-skill.mjs --help
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs --help
.claude/skills/agent-structure-design/scripts/validate-structure.sh
```

### テンプレート参照
```bash
cat .claude/skills/agent-structure-design/templates/agent-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.1.0 | 2025-12-24 | Spec alignment and required artifacts added |
