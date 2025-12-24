---
name: .claude/skills/design-system-architecture/SKILL.md
description: |
  一貫性と拡張性を両立するデザインシステムの基盤設計を専門とするスキル。
  Diana MounterやBrad Frostのデザインシステム思想に基づき、
  デザイントークン管理、コンポーネント規約策定、Figma/コード統合を実現します。
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/component-hierarchy.md`: component-hierarchy の詳細ガイド
  - `resources/design-tokens-guide.md`: design-tokens-guide のガイド
  - `resources/figma-code-sync.md`: figma-code-sync の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/naming-conventions.md`: naming-conventions の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-tokens.mjs`: tokensを検証するスクリプト
  - `templates/component-spec-template.md`: component-spec-template のテンプレート
  - `templates/design-tokens-template.json`: design-tokens-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling design system architecture tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Clean Architecture"
    author: "Robert C. Martin"
    concepts:
      - "依存関係ルール"
      - "境界の設計"
---

# Design System Architecture

## 概要

一貫性と拡張性を両立するデザインシステムの基盤設計を専門とするスキル。
Diana MounterやBrad Frostのデザインシステム思想に基づき、
デザイントークン管理、コンポーネント規約策定、Figma/コード統合を実現します。

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
- デザインシステムの新規構築時
- デザイントークンの定義・拡張時
- コンポーネントライブラリの規約策定時
- Figmaとコードベース間の同期戦略策定時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/design-system-architecture/resources/Level1_basics.md
cat .claude/skills/design-system-architecture/resources/Level2_intermediate.md
cat .claude/skills/design-system-architecture/resources/Level3_advanced.md
cat .claude/skills/design-system-architecture/resources/Level4_expert.md
cat .claude/skills/design-system-architecture/resources/component-hierarchy.md
cat .claude/skills/design-system-architecture/resources/design-tokens-guide.md
cat .claude/skills/design-system-architecture/resources/figma-code-sync.md
cat .claude/skills/design-system-architecture/resources/legacy-skill.md
cat .claude/skills/design-system-architecture/resources/naming-conventions.md
```

### スクリプト実行
```bash
node .claude/skills/design-system-architecture/scripts/log_usage.mjs --help
node .claude/skills/design-system-architecture/scripts/validate-skill.mjs --help
node .claude/skills/design-system-architecture/scripts/validate-tokens.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/design-system-architecture/templates/component-spec-template.md
cat .claude/skills/design-system-architecture/templates/design-tokens-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
