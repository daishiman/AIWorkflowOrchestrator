---
name: .claude/skills/acceptance-criteria-writing/SKILL.md
description: |
  Given-When-Then形式によるテスト可能な受け入れ基準の定義スキル。
  要件の完了条件を明確化し、自動テストへの変換を可能にします。
  
  📖 参照書籍:
  - 『Software Requirements』（Karl Wiegers）: 要求分析
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/edge-case-patterns.md`: エッジケースパターン集
  - `resources/gwt-patterns.md`: Given-When-Thenパターン集
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/testability-guide.md`: 曖昧な基準を測定可能で検証可能な形に変換する4つの特性（具体性・測定可能性・観測可能性・再現可能性）の実践ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-acceptance-criteria.mjs`: 受け入れ基準検証スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/acceptance-criteria-template.md`: 受け入れ基準テンプレート
  
  Use proactively when handling acceptance criteria writing tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Software Requirements"
    author: "Karl Wiegers"
    concepts:
      - "要求分析"
      - "仕様化"
---

# Acceptance Criteria Writing

## 概要

Given-When-Then形式によるテスト可能な受け入れ基準の定義スキル。
要件の完了条件を明確化し、自動テストへの変換を可能にします。

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
- 機能要件の完了条件を定義する時
- ユーザーストーリーに受け入れ基準を追加する時
- テストケースの基盤を作成する時
- 実装完了の判定基準を明確化する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/acceptance-criteria-writing/resources/Level1_basics.md
cat .claude/skills/acceptance-criteria-writing/resources/Level2_intermediate.md
cat .claude/skills/acceptance-criteria-writing/resources/Level3_advanced.md
cat .claude/skills/acceptance-criteria-writing/resources/Level4_expert.md
cat .claude/skills/acceptance-criteria-writing/resources/edge-case-patterns.md
cat .claude/skills/acceptance-criteria-writing/resources/gwt-patterns.md
cat .claude/skills/acceptance-criteria-writing/resources/legacy-skill.md
cat .claude/skills/acceptance-criteria-writing/resources/testability-guide.md
```

### スクリプト実行
```bash
node .claude/skills/acceptance-criteria-writing/scripts/log_usage.mjs --help
node .claude/skills/acceptance-criteria-writing/scripts/validate-acceptance-criteria.mjs --help
node .claude/skills/acceptance-criteria-writing/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/acceptance-criteria-writing/templates/acceptance-criteria-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
