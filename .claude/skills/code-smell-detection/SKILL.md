---
name: .claude/skills/code-smell-detection/SKILL.md
description: |
  コードスメル（悪臭）とアーキテクチャアンチパターンの検出を専門とするスキル。
  
  📖 参照書籍:
  - 『Clean Code』（Robert C. Martin）: 命名と意図の明確化
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/architecture-antipatterns.md`: アーキテクチャ・アンチパターン
  - `resources/class-smells.md`: クラス関連のコードスメル
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/method-smells.md`: メソッド関連のコードスメル
  - `scripts/detect-code-smells.mjs`: コードスメル検出スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/code-smell-report.md`: コードスメル検出レポート
  
  Use proactively when handling code smell detection tasks.
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

# Code Smell Detection

## 概要

コードスメル（悪臭）とアーキテクチャアンチパターンの検出を専門とするスキル。

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
- コードレビューで品質問題を検出する時
- リファクタリング対象を特定する時
- 技術的負債を可視化する時
- 保守性低下の原因を分析する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/code-smell-detection/resources/Level1_basics.md
cat .claude/skills/code-smell-detection/resources/Level2_intermediate.md
cat .claude/skills/code-smell-detection/resources/Level3_advanced.md
cat .claude/skills/code-smell-detection/resources/Level4_expert.md
cat .claude/skills/code-smell-detection/resources/architecture-antipatterns.md
cat .claude/skills/code-smell-detection/resources/class-smells.md
cat .claude/skills/code-smell-detection/resources/legacy-skill.md
cat .claude/skills/code-smell-detection/resources/method-smells.md
```

### スクリプト実行
```bash
node .claude/skills/code-smell-detection/scripts/detect-code-smells.mjs --help
node .claude/skills/code-smell-detection/scripts/log_usage.mjs --help
node .claude/skills/code-smell-detection/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/code-smell-detection/templates/code-smell-report.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
