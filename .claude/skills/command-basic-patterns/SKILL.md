---
name: .claude/skills/command-basic-patterns/SKILL.md
description: |
  4つの基本実装パターンを専門とするスキル。
  シンプル指示型、ステップバイステップ型、条件分岐型、ファイル参照型の
  選択基準と実装例を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/pattern-selection-guide.md`: 基本パターン選択ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-patterns.mjs`: パターン検証スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/step-by-step-template.md`: ステップバイステップコマンドテンプレート
  
  Use proactively when handling command basic patterns tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "手順設計"
      - "実践的改善"
---

# Command Basic Patterns

## 概要

4つの基本実装パターンを専門とするスキル。
シンプル指示型、ステップバイステップ型、条件分岐型、ファイル参照型の
選択基準と実装例を提供します。

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
- コマンドの複雑度に応じたパターンを選択する時
- 既存コマンドのパターンを理解したい時
- ワークフローの構造化方法を知りたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/command-basic-patterns/resources/Level1_basics.md
cat .claude/skills/command-basic-patterns/resources/Level2_intermediate.md
cat .claude/skills/command-basic-patterns/resources/Level3_advanced.md
cat .claude/skills/command-basic-patterns/resources/Level4_expert.md
cat .claude/skills/command-basic-patterns/resources/legacy-skill.md
cat .claude/skills/command-basic-patterns/resources/pattern-selection-guide.md
```

### スクリプト実行
```bash
node .claude/skills/command-basic-patterns/scripts/log_usage.mjs --help
node .claude/skills/command-basic-patterns/scripts/validate-patterns.mjs --help
node .claude/skills/command-basic-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/command-basic-patterns/templates/step-by-step-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
