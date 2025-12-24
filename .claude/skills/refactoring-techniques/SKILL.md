---
name: .claude/skills/refactoring-techniques/SKILL.md
description: |
  マーティン・ファウラーの『リファクタリング』に基づくコード改善技術を専門とするスキル。
  外部から見た振る舞いを変えずに、内部構造を改善する体系的手法を提供します。
  
  📖 参照書籍:
  - 『Clean Code』（Robert C. Martin）: 命名と意図の明確化
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/code-smells-catalog.md`: コードスメルカタログ
  - `resources/decompose-conditional.md`: Decompose Conditional
  - `resources/extract-method.md`: Extract Method
  - `resources/introduce-parameter-object.md`: Introduce Parameter Object
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/replace-temp-with-query.md`: Replace Temp with Query
  - `scripts/detect-code-smells.mjs`: コードスメル検出スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/refactoring-checklist.md`: リファクタリングチェックリスト
  
  Use proactively when refactoring code, improving readability, or detecting code smells.
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

# Refactoring Techniques

## 概要

マーティン・ファウラーの『リファクタリング』に基づくコード改善技術を専門とするスキル。
外部から見た振る舞いを変えずに、内部構造を改善する体系的手法を提供します。

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
- メソッドが30行を超える場合
- 同じロジックが複数箇所に重複している場合
- 複雑な条件式（ネスト3段階以上）がある場合
- コードレビューで可読性の問題を指摘された場合
- テストが通っている状態でコード品質を改善したい場合

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/refactoring-techniques/resources/Level1_basics.md
cat .claude/skills/refactoring-techniques/resources/Level2_intermediate.md
cat .claude/skills/refactoring-techniques/resources/Level3_advanced.md
cat .claude/skills/refactoring-techniques/resources/Level4_expert.md
cat .claude/skills/refactoring-techniques/resources/code-smells-catalog.md
cat .claude/skills/refactoring-techniques/resources/decompose-conditional.md
cat .claude/skills/refactoring-techniques/resources/extract-method.md
cat .claude/skills/refactoring-techniques/resources/introduce-parameter-object.md
cat .claude/skills/refactoring-techniques/resources/legacy-skill.md
cat .claude/skills/refactoring-techniques/resources/replace-temp-with-query.md
```

### スクリプト実行
```bash
node .claude/skills/refactoring-techniques/scripts/detect-code-smells.mjs --help
node .claude/skills/refactoring-techniques/scripts/log_usage.mjs --help
node .claude/skills/refactoring-techniques/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/refactoring-techniques/templates/refactoring-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
