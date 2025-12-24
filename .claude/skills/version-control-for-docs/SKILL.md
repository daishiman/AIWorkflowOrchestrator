---
name: .claude/skills/version-control-for-docs/SKILL.md
description: |
  Gitを活用したドキュメントのバージョン管理と変更履歴管理の専門スキル。
  
  📖 参照書籍:
  - 『Pro Git』（Scott Chacon）: ブランチ戦略
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/branch-strategy.md`: Branch Strategyリソース
  - `resources/changelog-generation.md`: Changelog Generationリソース
  - `resources/commit-conventions.md`: Commit Conventionsリソース
  - `resources/git-diff-guide.md`: Git Diff Guideリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/review-workflow.md`: Review Workflowリソース
  - `scripts/generate-changelog.mjs`: Generate Changelogスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/changelog-template.md`: Changelogテンプレート
  - `templates/pr-template.md`: ドキュメント変更用PRテンプレート（変更種類・チェックリスト・レビュー観点付き）
  
  Use proactively when handling version control for docs tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Pro Git"
    author: "Scott Chacon"
    concepts:
      - "ブランチ戦略"
      - "履歴管理"
---

# Version Control for Docs

## 概要

Gitを活用したドキュメントのバージョン管理と変更履歴管理の専門スキル。

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
cat .claude/skills/version-control-for-docs/resources/Level1_basics.md
cat .claude/skills/version-control-for-docs/resources/Level2_intermediate.md
cat .claude/skills/version-control-for-docs/resources/Level3_advanced.md
cat .claude/skills/version-control-for-docs/resources/Level4_expert.md
cat .claude/skills/version-control-for-docs/resources/branch-strategy.md
cat .claude/skills/version-control-for-docs/resources/changelog-generation.md
cat .claude/skills/version-control-for-docs/resources/commit-conventions.md
cat .claude/skills/version-control-for-docs/resources/git-diff-guide.md
cat .claude/skills/version-control-for-docs/resources/legacy-skill.md
cat .claude/skills/version-control-for-docs/resources/review-workflow.md
```

### スクリプト実行
```bash
node .claude/skills/version-control-for-docs/scripts/generate-changelog.mjs --help
node .claude/skills/version-control-for-docs/scripts/log_usage.mjs --help
node .claude/skills/version-control-for-docs/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/version-control-for-docs/templates/changelog-template.md
cat .claude/skills/version-control-for-docs/templates/pr-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
