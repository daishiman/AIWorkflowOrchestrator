---
name: .claude/skills/functional-non-functional-requirements/SKILL.md
description: |
  機能要件と非機能要件の分類と定義スキル。要件を適切なカテゴリに分類し、
  漏れなく体系的に管理するための方法論を提供します。
  専門分野:
  
  📖 参照書籍:
  - 『Don't Make Me Think』（Steve Krug）: ユーザビリティ
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/classification-guide.md`: classification-guide のガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/measurement-guide.md`: measurement-guide のガイド
  - `resources/nfr-templates.md`: nfr-templates の詳細ガイド
  - `resources/quality-attributes.md`: quality-attributes の詳細ガイド
  - `scripts/check-nfr-coverage.mjs`: nfrcoverageを検証するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/nfr-definition-template.md`: nfr-definition-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling functional non functional requirements tasks.
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

# Functional and Non-Functional Requirements

## 概要

機能要件と非機能要件の分類と定義スキル。要件を適切なカテゴリに分類し、
漏れなく体系的に管理するための方法論を提供します。
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
- 要件を機能/非機能に分類する時
- 非機能要件を定義する時
- 品質特性を網羅的に確認する時
- 見落としがちな要件を発見する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/functional-non-functional-requirements/resources/Level1_basics.md
cat .claude/skills/functional-non-functional-requirements/resources/Level2_intermediate.md
cat .claude/skills/functional-non-functional-requirements/resources/Level3_advanced.md
cat .claude/skills/functional-non-functional-requirements/resources/Level4_expert.md
cat .claude/skills/functional-non-functional-requirements/resources/classification-guide.md
cat .claude/skills/functional-non-functional-requirements/resources/legacy-skill.md
cat .claude/skills/functional-non-functional-requirements/resources/measurement-guide.md
cat .claude/skills/functional-non-functional-requirements/resources/nfr-templates.md
cat .claude/skills/functional-non-functional-requirements/resources/quality-attributes.md
```

### スクリプト実行
```bash
node .claude/skills/functional-non-functional-requirements/scripts/check-nfr-coverage.mjs --help
node .claude/skills/functional-non-functional-requirements/scripts/log_usage.mjs --help
node .claude/skills/functional-non-functional-requirements/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/functional-non-functional-requirements/templates/nfr-definition-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
