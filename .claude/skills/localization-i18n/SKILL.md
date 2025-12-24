---
name: .claude/skills/localization-i18n/SKILL.md
description: |
  多言語対応ドキュメントの設計・翻訳準備スキル。
  国際化（i18n）と地域化（l10n）のベストプラクティスを提供。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/translation-ready-writing.md`: 翻訳しやすい文章の原則、文化依存表現の回避、プレースホルダー設計、品質チェック項目
  - `scripts/check-translation-ready.mjs`: i18n対応度の自動チェック（文化依存表現検出、プレースホルダー検証）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/multilingual-doc-template.md`: 多言語ドキュメント構造テンプレート（言語別ディレクトリ、共通リソース）
  
  Use proactively when handling localization i18n tasks.
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

# Localization & i18n スキル

## 概要

多言語対応ドキュメントの設計・翻訳準備スキル。
国際化（i18n）と地域化（l10n）のベストプラクティスを提供。

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
- 多言語ドキュメントを設計する時
- 翻訳しやすい原文を作成する時
- ローカライゼーションワークフローを構築する時
- 文化的適応を考慮する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/localization-i18n/resources/Level1_basics.md
cat .claude/skills/localization-i18n/resources/Level2_intermediate.md
cat .claude/skills/localization-i18n/resources/Level3_advanced.md
cat .claude/skills/localization-i18n/resources/Level4_expert.md
cat .claude/skills/localization-i18n/resources/legacy-skill.md
cat .claude/skills/localization-i18n/resources/translation-ready-writing.md
```

### スクリプト実行
```bash
node .claude/skills/localization-i18n/scripts/check-translation-ready.mjs --help
node .claude/skills/localization-i18n/scripts/log_usage.mjs --help
node .claude/skills/localization-i18n/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/localization-i18n/templates/multilingual-doc-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
