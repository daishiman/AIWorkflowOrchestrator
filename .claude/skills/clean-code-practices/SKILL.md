---
name: .claude/skills/clean-code-practices/SKILL.md
description: |
  ロバート・C・マーティン（Uncle Bob）の『Clean Code』に基づくコード品質プラクティスを専門とするスキル。
  
  📖 参照書籍:
  - 『Clean Code』（Robert C. Martin）: 命名と意図の明確化
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/comments-and-documentation.md`: コメントとドキュメンテーション
  - `resources/dry-principle.md`: DRY原則（Do Not Repeat Yourself）
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/meaningful-names.md`: 意図を明確にする命名・発音しやすい名前・検索しやすい名前の原則と変数/関数/クラス/ブール値の品詞別命名規則
  - `resources/small-functions.md`: 5-10行の理想サイズ・単一責任原則・抽象度の統一・パラメータ3つ以下の関数設計ガイドライン
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/measure-code-quality.mjs`: コード品質測定スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/code-review-checklist.md`: コードレビューチェックリスト
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when improving code readability, naming conventions, or applying clean code principles.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Clean Code"
    author: "Robert C. Martin"
    concepts:
      - "命名と意図の明確化"
      - "小さな関数設計"
---

# Clean Code Practices

## 概要

ロバート・C・マーティン（Uncle Bob）の『Clean Code』に基づくコード品質プラクティスを専門とするスキル。

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
- コードの命名を改善したい時
- 関数が大きすぎると感じた時
- コードの重複を発見した時
- コードの可読性を向上させたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/clean-code-practices/resources/Level1_basics.md
cat .claude/skills/clean-code-practices/resources/Level2_intermediate.md
cat .claude/skills/clean-code-practices/resources/Level3_advanced.md
cat .claude/skills/clean-code-practices/resources/Level4_expert.md
cat .claude/skills/clean-code-practices/resources/comments-and-documentation.md
cat .claude/skills/clean-code-practices/resources/dry-principle.md
cat .claude/skills/clean-code-practices/resources/legacy-skill.md
cat .claude/skills/clean-code-practices/resources/meaningful-names.md
cat .claude/skills/clean-code-practices/resources/small-functions.md
```

### スクリプト実行
```bash
node .claude/skills/clean-code-practices/scripts/log_usage.mjs --help
node .claude/skills/clean-code-practices/scripts/measure-code-quality.mjs --help
node .claude/skills/clean-code-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/clean-code-practices/templates/code-review-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
