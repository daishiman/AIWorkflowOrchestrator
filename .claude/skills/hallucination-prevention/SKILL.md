---
name: .claude/skills/hallucination-prevention/SKILL.md
description: |
  AIのハルシネーション（幻覚・誤情報生成）を防止するスキル。
  プロンプトレベル、パラメータレベル、検証レベルの3層防御により、
  信頼性の高いAI出力を実現します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/parameter-tuning.md`: parameter-tuning の詳細ガイド
  - `resources/prompt-level-defense.md`: prompt-level-defense の詳細ガイド
  - `resources/verification-mechanisms.md`: verification-mechanisms の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/verification-checklist.md`: verification-checklist のチェックリスト
  
  Use proactively when handling hallucination prevention tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Hallucination Prevention

## 概要

AIのハルシネーション（幻覚・誤情報生成）を防止するスキル。
プロンプトレベル、パラメータレベル、検証レベルの3層防御により、
信頼性の高いAI出力を実現します。

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
- 事実に基づく出力が必要な時
- AIの誤情報を防ぎたい時
- 信頼性の高い出力が求められる時
- 出力に根拠を持たせたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/hallucination-prevention/resources/Level1_basics.md
cat .claude/skills/hallucination-prevention/resources/Level2_intermediate.md
cat .claude/skills/hallucination-prevention/resources/Level3_advanced.md
cat .claude/skills/hallucination-prevention/resources/Level4_expert.md
cat .claude/skills/hallucination-prevention/resources/legacy-skill.md
cat .claude/skills/hallucination-prevention/resources/parameter-tuning.md
cat .claude/skills/hallucination-prevention/resources/prompt-level-defense.md
cat .claude/skills/hallucination-prevention/resources/verification-mechanisms.md
```

### スクリプト実行
```bash
node .claude/skills/hallucination-prevention/scripts/log_usage.mjs --help
node .claude/skills/hallucination-prevention/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/hallucination-prevention/templates/verification-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
