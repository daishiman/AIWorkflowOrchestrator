---
name: .claude/skills/ambiguity-elimination/SKILL.md
description: |
  曖昧性検出と除去スキル。定性的・不明確な表現を具体的・測定可能な要件に変換します。
  
  📖 参照書籍:
  - 『Don't Make Me Think』（Steve Krug）: ユーザビリティ
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/ambiguity-patterns-guide.md`: ambiguity-patterns-guide のパターン集
  - `resources/ambiguity-patterns.md`: 5つの曖昧性パターンの詳細な検出・除去手法と実践例（300行超）
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/detect-ambiguity.mjs`: 要件ドキュメントから曖昧性を自動検出するNode.jsスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/clarification-checklist.md`: 曖昧性を明確化するための体系的な質問チェックリスト
  - `templates/clarification-template.md`: clarification-template のテンプレート
  
  Use proactively when handling ambiguity elimination tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Don't Make Me Think"
    author: "Steve Krug"
    concepts:
      - "ユーザビリティ"
      - "情報設計"
---

# Ambiguity Elimination

## 概要

曖昧性検出と除去スキル。定性的・不明確な表現を具体的・測定可能な要件に変換します。

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
- 要件に「速い」「多い」「適切に」などの曖昧な表現がある時
- 定量化が必要な非機能要件の記述時
- 「など」「等」で範囲が不明確な時
- 条件や主体が曖昧な要件の明確化時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/ambiguity-elimination/resources/Level1_basics.md
cat .claude/skills/ambiguity-elimination/resources/Level2_intermediate.md
cat .claude/skills/ambiguity-elimination/resources/Level3_advanced.md
cat .claude/skills/ambiguity-elimination/resources/Level4_expert.md
cat .claude/skills/ambiguity-elimination/resources/ambiguity-patterns-guide.md
cat .claude/skills/ambiguity-elimination/resources/ambiguity-patterns.md
cat .claude/skills/ambiguity-elimination/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/ambiguity-elimination/scripts/detect-ambiguity.mjs --help
node .claude/skills/ambiguity-elimination/scripts/log_usage.mjs --help
node .claude/skills/ambiguity-elimination/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/ambiguity-elimination/templates/clarification-checklist.md
cat .claude/skills/ambiguity-elimination/templates/clarification-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
