---
name: .claude/skills/commit-hooks/SKILL.md
description: |
  Git commit hooksとプレコミット品質ゲートの専門知識。
  Husky、lint-staged統合による自動lint/format実行を設計します。
  
  📖 参照書籍:
  - 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/husky-configuration.md`: Huskyによるコミットフック設定
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/lint-staged-patterns.md`: lint-stagedパターンと設定例
  - `resources/performance-optimization.md`: コミットフックのパフォーマンス最適化
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/test-hooks.mjs`: コミットフックテストスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/lint-staged-advanced.js`: 高度なlint-staged設定
  - `templates/pre-commit-basic.sh`: 基本的なpre-commitフックシェルスクリプト
  
  Use proactively when handling commit hooks tasks.
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

# Commit Hooks Skill

## 概要

Git commit hooksとプレコミット品質ゲートの専門知識。
Husky、lint-staged統合による自動lint/format実行を設計します。

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
- コミット時の自動品質チェックを設定する時
- Husky、lint-stagedを導入する時
- ステージングファイルのみを処理する設定を行う時
- pre-commit、commit-msg、pre-pushフックを設計する時
- コミットフローの自動化を計画する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/commit-hooks/resources/Level1_basics.md
cat .claude/skills/commit-hooks/resources/Level2_intermediate.md
cat .claude/skills/commit-hooks/resources/Level3_advanced.md
cat .claude/skills/commit-hooks/resources/Level4_expert.md
cat .claude/skills/commit-hooks/resources/husky-configuration.md
cat .claude/skills/commit-hooks/resources/legacy-skill.md
cat .claude/skills/commit-hooks/resources/lint-staged-patterns.md
cat .claude/skills/commit-hooks/resources/performance-optimization.md
```

### スクリプト実行
```bash
node .claude/skills/commit-hooks/scripts/log_usage.mjs --help
node .claude/skills/commit-hooks/scripts/test-hooks.mjs --help
node .claude/skills/commit-hooks/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/commit-hooks/templates/lint-staged-advanced.js
cat .claude/skills/commit-hooks/templates/pre-commit-basic.sh
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
