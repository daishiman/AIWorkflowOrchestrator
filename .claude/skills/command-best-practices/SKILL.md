---
name: .claude/skills/command-best-practices/SKILL.md
description: |
  コマンド設計のベストプラクティスを専門とするスキル。
  単一責任原則、組み合わせ可能性、冪等性の原則、
  DRYの適用、保守性の高い設計を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/composability-principle.md`: 合成可能性原則の適用
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/single-responsibility-principle.md`: 1コマンド=1責任の原則、複数責任検出基準（「〜と〜」「異なるタイミング実行」）とリファクタリング手法
  - `scripts/check-best-practices.mjs`: ベストプラクティス検証スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/best-practice-checklist.md`: ベストプラクティスチェックリスト
  
  Use proactively when handling command best practices tasks.
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

# Command Best Practices

## 概要

コマンド設計のベストプラクティスを専門とするスキル。
単一責任原則、組み合わせ可能性、冪等性の原則、
DRYの適用、保守性の高い設計を提供します。

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
- コマンド設計の原則を確認したい時
- 既存コマンドをリファクタリングする時
- 保守性の高いコマンドを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/command-best-practices/resources/Level1_basics.md
cat .claude/skills/command-best-practices/resources/Level2_intermediate.md
cat .claude/skills/command-best-practices/resources/Level3_advanced.md
cat .claude/skills/command-best-practices/resources/Level4_expert.md
cat .claude/skills/command-best-practices/resources/composability-principle.md
cat .claude/skills/command-best-practices/resources/legacy-skill.md
cat .claude/skills/command-best-practices/resources/single-responsibility-principle.md
```

### スクリプト実行
```bash
node .claude/skills/command-best-practices/scripts/check-best-practices.mjs --help
node .claude/skills/command-best-practices/scripts/log_usage.mjs --help
node .claude/skills/command-best-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/command-best-practices/templates/best-practice-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
