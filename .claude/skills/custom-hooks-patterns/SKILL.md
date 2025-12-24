---
name: .claude/skills/custom-hooks-patterns/SKILL.md
description: |
  Reactカスタムフックの設計パターンと実装ベストプラクティスを専門とするスキル。
  再利用可能で保守性の高いカスタムフック作成を支援します。
  専門分野:
  
  📖 参照書籍:
  - 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/composition-patterns.md`: composition-patterns のパターン集
  - `resources/design-patterns.md`: design-patterns のパターン集
  - `resources/extraction-criteria.md`: extraction-criteria の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/testing-strategies.md`: testing-strategies の詳細ガイド
  - `scripts/analyze-hook-candidates.mjs`: hookcandidatesを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/advanced-hooks-template.md`: advanced-hooks-template のテンプレート
  - `templates/basic-hooks-template.md`: basic-hooks-template のテンプレート
  
  Use proactively when handling custom hooks patterns tasks.
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

# Custom Hooks Patterns

## 概要

Reactカスタムフックの設計パターンと実装ベストプラクティスを専門とするスキル。
再利用可能で保守性の高いカスタムフック作成を支援します。
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
- コンポーネントのロジックを再利用したい時
- 複雑な状態管理をカプセル化したい時
- 副作用の処理を整理したい時
- カスタムフックのテスト方法を知りたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/custom-hooks-patterns/resources/Level1_basics.md
cat .claude/skills/custom-hooks-patterns/resources/Level2_intermediate.md
cat .claude/skills/custom-hooks-patterns/resources/Level3_advanced.md
cat .claude/skills/custom-hooks-patterns/resources/Level4_expert.md
cat .claude/skills/custom-hooks-patterns/resources/composition-patterns.md
cat .claude/skills/custom-hooks-patterns/resources/design-patterns.md
cat .claude/skills/custom-hooks-patterns/resources/extraction-criteria.md
cat .claude/skills/custom-hooks-patterns/resources/legacy-skill.md
cat .claude/skills/custom-hooks-patterns/resources/testing-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/custom-hooks-patterns/scripts/analyze-hook-candidates.mjs --help
node .claude/skills/custom-hooks-patterns/scripts/log_usage.mjs --help
node .claude/skills/custom-hooks-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/custom-hooks-patterns/templates/advanced-hooks-template.md
cat .claude/skills/custom-hooks-patterns/templates/basic-hooks-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
