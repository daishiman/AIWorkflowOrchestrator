---
name: .claude/skills/gitignore-management/SKILL.md
description: |
  .gitignore設計と管理スキル。機密ファイルパターン、プロジェクト固有除外、
  プラットフォーム別パターン、.gitignore検証手法を提供します。
  使用タイミング:
  
  📖 参照書籍:
  - 『Pro Git』（Scott Chacon）: ブランチ戦略
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/pattern-library.md`: pattern-library の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-gitignore.mjs`: gitignoreを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/gitignore-template.txt`: gitignore-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling gitignore management tasks.
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

# .gitignore Management

## 概要

.gitignore設計と管理スキル。機密ファイルパターン、プロジェクト固有除外、
プラットフォーム別パターン、.gitignore検証手法を提供します。
使用タイミング:

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
- .gitignoreを新規作成する時
- .gitignoreに機密パターンを追加する時
- プロジェクト固有の除外パターンを設計する時
- .gitignoreの完全性を検証する時
- Gitignoreベストプラクティスを適用する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/gitignore-management/resources/Level1_basics.md
cat .claude/skills/gitignore-management/resources/Level2_intermediate.md
cat .claude/skills/gitignore-management/resources/Level3_advanced.md
cat .claude/skills/gitignore-management/resources/Level4_expert.md
cat .claude/skills/gitignore-management/resources/legacy-skill.md
cat .claude/skills/gitignore-management/resources/pattern-library.md
```

### スクリプト実行
```bash
node .claude/skills/gitignore-management/scripts/log_usage.mjs --help
node .claude/skills/gitignore-management/scripts/validate-gitignore.mjs --help
node .claude/skills/gitignore-management/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/gitignore-management/templates/gitignore-template.txt
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
