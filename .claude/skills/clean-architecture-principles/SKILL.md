---
name: .claude/skills/clean-architecture-principles/SKILL.md
description: |
  ロバート・C・マーティン（Uncle Bob）の『Clean Architecture』に基づく
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/dependency-rule.md`: 内側→外側依存の禁止ルール、インポート文・型参照・継承での違反検出と対処法
  - `resources/hybrid-architecture-mapping.md`: ハイブリッドアーキテクチャへのマッピング
  - `resources/layer-structure.md`: Entities・Use Cases・Interface Adapters・Frameworksの4層構造と各層の責務・依存制約・チェックリスト
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/check-layer-violation.mjs`: Clean Architecture レイヤー違反検出スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/architecture-review-checklist.md`: アーキテクチャレビューチェックリスト
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling clean architecture principles tasks.
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

# Clean Architecture Principles

## 概要

ロバート・C・マーティン（Uncle Bob）の『Clean Architecture』に基づく

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
- アーキテクチャの依存関係違反を検出する時
- レイヤー構造を設計・検証する時
- インターフェースによる境界設計が必要な時
- 技術的詳細の漏出をチェックする時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/clean-architecture-principles/resources/Level1_basics.md
cat .claude/skills/clean-architecture-principles/resources/Level2_intermediate.md
cat .claude/skills/clean-architecture-principles/resources/Level3_advanced.md
cat .claude/skills/clean-architecture-principles/resources/Level4_expert.md
cat .claude/skills/clean-architecture-principles/resources/dependency-rule.md
cat .claude/skills/clean-architecture-principles/resources/hybrid-architecture-mapping.md
cat .claude/skills/clean-architecture-principles/resources/layer-structure.md
cat .claude/skills/clean-architecture-principles/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/clean-architecture-principles/scripts/check-layer-violation.mjs --help
node .claude/skills/clean-architecture-principles/scripts/log_usage.mjs --help
node .claude/skills/clean-architecture-principles/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/clean-architecture-principles/templates/architecture-review-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
