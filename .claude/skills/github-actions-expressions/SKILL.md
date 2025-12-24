---
name: .claude/skills/github-actions-expressions/SKILL.md
description: |
  GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。
  ${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。
  専門分野:
  
  📖 参照書籍:
  - 『Continuous Delivery』（Jez Humble）: パイプライン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/builtin-functions.md`: builtin-functions の詳細ガイド
  - `resources/conditional-patterns.md`: conditional-patterns のパターン集
  - `resources/context-objects.md`: context-objects の詳細ガイド
  - `resources/expression-syntax.md`: expression-syntax の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-expressions.mjs`: expressionsを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/expression-examples.yaml`: expression-examples のテンプレート
  
  Use proactively when handling github actions expressions tasks.
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

# GitHub Actions Expressions

## 概要

GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。
${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。
専門分野:

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
- ワークフローで条件付き実行（if:）を設定する時
- ステップ出力を参照したり、動的に値を生成する時
- コンテキスト情報（ブランチ名、コミットSHA、イベントタイプ）を使用する時
- 組み込み関数で文字列操作やJSON処理を行う時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/github-actions-expressions/resources/Level1_basics.md
cat .claude/skills/github-actions-expressions/resources/Level2_intermediate.md
cat .claude/skills/github-actions-expressions/resources/Level3_advanced.md
cat .claude/skills/github-actions-expressions/resources/Level4_expert.md
cat .claude/skills/github-actions-expressions/resources/builtin-functions.md
cat .claude/skills/github-actions-expressions/resources/conditional-patterns.md
cat .claude/skills/github-actions-expressions/resources/context-objects.md
cat .claude/skills/github-actions-expressions/resources/expression-syntax.md
cat .claude/skills/github-actions-expressions/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/github-actions-expressions/scripts/log_usage.mjs --help
node .claude/skills/github-actions-expressions/scripts/validate-expressions.mjs --help
node .claude/skills/github-actions-expressions/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/github-actions-expressions/templates/expression-examples.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
