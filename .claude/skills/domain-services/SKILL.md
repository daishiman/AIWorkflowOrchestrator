---
name: .claude/skills/domain-services/SKILL.md
description: |
  ドメイン駆動設計におけるドメインサービスの設計と実装を専門とするスキル。
  エンティティや値オブジェクトに属さないドメインロジックを適切にモデル化します。
  専門分野:
  
  📖 参照書籍:
  - 『Domain-Driven Design』（Eric Evans）: ドメインモデル
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/service-patterns.md`: service-patterns のパターン集
  - `resources/service-vs-application.md`: service-vs-application の詳細ガイド
  - `resources/when-to-use-domain-services.md`: when-to-use-domain-services の詳細ガイド
  - `scripts/analyze-service-responsibilities.mjs`: serviceresponsibilitiesを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/domain-service-template.ts`: domain-service-template のテンプレート
  
  Use proactively when handling domain services tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Domain-Driven Design"
    author: "Eric Evans"
    concepts:
      - "ドメインモデル"
      - "境界づけられたコンテキスト"
---

# Domain Services

## 概要

ドメイン駆動設計におけるドメインサービスの設計と実装を専門とするスキル。
エンティティや値オブジェクトに属さないドメインロジックを適切にモデル化します。
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
- エンティティに属さないドメインロジックがある時
- 複数の集約をまたがる操作が必要な時
- ドメインポリシーや計算ロジックを実装する時
- サービスの責務を明確にしたい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/domain-services/resources/Level1_basics.md
cat .claude/skills/domain-services/resources/Level2_intermediate.md
cat .claude/skills/domain-services/resources/Level3_advanced.md
cat .claude/skills/domain-services/resources/Level4_expert.md
cat .claude/skills/domain-services/resources/legacy-skill.md
cat .claude/skills/domain-services/resources/service-patterns.md
cat .claude/skills/domain-services/resources/service-vs-application.md
cat .claude/skills/domain-services/resources/when-to-use-domain-services.md
```

### スクリプト実行
```bash
node .claude/skills/domain-services/scripts/analyze-service-responsibilities.mjs --help
node .claude/skills/domain-services/scripts/log_usage.mjs --help
node .claude/skills/domain-services/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/domain-services/templates/domain-service-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
