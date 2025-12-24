---
name: .claude/skills/git-hooks-concepts/SKILL.md
description: |
  Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。
  
  📖 参照書籍:
  - 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/hook-types-reference.md`: フック種類の詳細リファレンス
  - `resources/implementation-patterns.md`: 10種類の実装パターン（Prettier+ESLint、型チェック、テスト、Conventional Commits検証等）
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-git-hooks.mjs`: Git Hooks設定と動作検証スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/pre-commit-template.sh`: pre-commitテンプレート
  - `templates/pre-push-template.sh`: pre-pushテンプレート
  
  Use proactively when handling git hooks concepts tasks.
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

# Git Hooks 概念

## 概要

Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。

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
- Git Hooks を実装する時
- コミット前のコード品質チェックを自動化したい時
- プッシュ前のテスト実行を強制したい時
- コミットメッセージの検証を行う時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/git-hooks-concepts/resources/Level1_basics.md
cat .claude/skills/git-hooks-concepts/resources/Level2_intermediate.md
cat .claude/skills/git-hooks-concepts/resources/Level3_advanced.md
cat .claude/skills/git-hooks-concepts/resources/Level4_expert.md
cat .claude/skills/git-hooks-concepts/resources/hook-types-reference.md
cat .claude/skills/git-hooks-concepts/resources/implementation-patterns.md
cat .claude/skills/git-hooks-concepts/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/git-hooks-concepts/scripts/log_usage.mjs --help
node .claude/skills/git-hooks-concepts/scripts/validate-git-hooks.mjs --help
node .claude/skills/git-hooks-concepts/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/git-hooks-concepts/templates/pre-commit-template.sh
cat .claude/skills/git-hooks-concepts/templates/pre-push-template.sh
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
