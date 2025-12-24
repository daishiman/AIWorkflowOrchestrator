---
name: .claude/skills/prettier-integration/SKILL.md
description: |
  ESLintとPrettierの統合とフォーマット自動化の専門知識。
  責務分離、競合解決、エディタ統合、保存時自動実行を設計します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/automation-strategies.md`: Prettier Automation Strategies
  - `resources/conflict-resolution.md`: Prettier-ESLint Conflict Resolution
  - `resources/editor-integration.md`: Prettier Editor Integration
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/format-check.mjs`: Prettierフォーマット検証スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/prettierrc-base.json`: prettierrc-base設定ファイル
  - `templates/vscode-settings.json`: vscode-settings設定ファイル
  
  Use proactively when handling prettier integration tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Prettier Integration Skill

## 概要

ESLintとPrettierの統合とフォーマット自動化の専門知識。
責務分離、競合解決、エディタ統合、保存時自動実行を設計します。

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
- ESLintとPrettierを統合する時
- フォーマットルールの競合を解決する時
- エディタでの保存時自動フォーマットを設定する時
- lint/formatの責務を分離する時
- 自動フォーマット適用戦略を設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/prettier-integration/resources/Level1_basics.md
cat .claude/skills/prettier-integration/resources/Level2_intermediate.md
cat .claude/skills/prettier-integration/resources/Level3_advanced.md
cat .claude/skills/prettier-integration/resources/Level4_expert.md
cat .claude/skills/prettier-integration/resources/automation-strategies.md
cat .claude/skills/prettier-integration/resources/conflict-resolution.md
cat .claude/skills/prettier-integration/resources/editor-integration.md
cat .claude/skills/prettier-integration/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/prettier-integration/scripts/format-check.mjs --help
node .claude/skills/prettier-integration/scripts/log_usage.mjs --help
node .claude/skills/prettier-integration/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/prettier-integration/templates/prettierrc-base.json
cat .claude/skills/prettier-integration/templates/vscode-settings.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
