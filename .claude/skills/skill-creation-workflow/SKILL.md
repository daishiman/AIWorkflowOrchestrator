---
name: .claude/skills/skill-creation-workflow/SKILL.md
description: |
  スキル作成・改善の詳細ワークフロー（Phase 1-5）を定義。
  新規スキル作成、既存エージェント軽量化、既存スキル改善の
  3つのワークフローパターンと、各Phaseの具体的なステップ、
  
  📖 参照書籍:
  - 『Continuous Delivery』（Jez Humble）: パイプライン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/phase-details.md`: Phase 1-5の詳細手順、判断基準、成功条件の完全ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキルファイル品質検証ツール（必須フィールド、行数チェック）
  - `templates/skill-template.md`: 新規スキル作成用の標準テンプレート（YAML frontmatter + 本文構造）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  - 「Use proactively when」（英語の発動条件）.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Continuous Delivery"
    author: "Jez Humble"
    concepts:
      - "パイプライン"
      - "自動化"
---

# Skill Creation Workflow

## 概要

スキル作成・改善の詳細ワークフロー（Phase 1-5）を定義。
新規スキル作成、既存エージェント軽量化、既存スキル改善の
3つのワークフローパターンと、各Phaseの具体的なステップ、

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
- 新規スキルを作成する時（ワークフローA）
- 既存エージェントを軽量化する時（ワークフローB）
- 既存スキルを改善する時（ワークフローC）
- 各Phaseの詳細手順を確認したい時
- 品質基準と成功の定義を確認したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/skill-creation-workflow/resources/Level1_basics.md
cat .claude/skills/skill-creation-workflow/resources/Level2_intermediate.md
cat .claude/skills/skill-creation-workflow/resources/Level3_advanced.md
cat .claude/skills/skill-creation-workflow/resources/Level4_expert.md
cat .claude/skills/skill-creation-workflow/resources/legacy-skill.md
cat .claude/skills/skill-creation-workflow/resources/phase-details.md
```

### スクリプト実行
```bash
node .claude/skills/skill-creation-workflow/scripts/log_usage.mjs --help
node .claude/skills/skill-creation-workflow/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/skill-creation-workflow/templates/skill-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
