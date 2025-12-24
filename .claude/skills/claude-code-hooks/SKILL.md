---
name: .claude/skills/claude-code-hooks/SKILL.md
description: |
  ## 概要
  
  📖 参照書籍:
  - 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/claude-code-guidelines.md`: Claude Code ガイドライン
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/quality-metrics.md`: カバレッジ80%・複雑度10以下・脆弱性0個などの定量的品質基準とメトリクス収集方法
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-claude-quality.mjs`: Claude Code Quality Validation Script
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/claude-commit-template.sh`: !/bin/bash
  - `templates/claude-quality-template.sh`: !/bin/bash
  
  Use proactively when handling claude code hooks tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Learning React"
    author: "Alex Banks, Eve Porcello"
    concepts:
      - "コンポーネント設計"
      - "パフォーマンス"
---

# Claude Code フック実装

## 概要

## 概要

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
cat .claude/skills/claude-code-hooks/resources/Level1_basics.md
cat .claude/skills/claude-code-hooks/resources/Level2_intermediate.md
cat .claude/skills/claude-code-hooks/resources/Level3_advanced.md
cat .claude/skills/claude-code-hooks/resources/Level4_expert.md
cat .claude/skills/claude-code-hooks/resources/claude-code-guidelines.md
cat .claude/skills/claude-code-hooks/resources/legacy-skill.md
cat .claude/skills/claude-code-hooks/resources/quality-metrics.md
```

### スクリプト実行
```bash
node .claude/skills/claude-code-hooks/scripts/log_usage.mjs --help
node .claude/skills/claude-code-hooks/scripts/validate-claude-quality.mjs --help
node .claude/skills/claude-code-hooks/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/claude-code-hooks/templates/claude-commit-template.sh
cat .claude/skills/claude-code-hooks/templates/claude-quality-template.sh
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
