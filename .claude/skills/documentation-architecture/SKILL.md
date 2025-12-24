---
name: .claude/skills/documentation-architecture/SKILL.md
description: |
  ドキュメント構造設計、リソース分割、階層設計を専門とするスキル。
  500行制約に基づく適切なファイル分割とトピックベース組織化により、
  保守性と発見可能性の高いドキュメントアーキテクチャを実現します。
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/directory-organization.md`: directory-organization の詳細ガイド
  - `resources/hierarchy-design.md`: hierarchy-design の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/naming-conventions.md`: naming-conventions の詳細ガイド
  - `resources/splitting-patterns.md`: splitting-patterns のパターン集
  - `scripts/analyze-structure.mjs`: structureを分析するスクリプト
  - `scripts/analyze-structure.sh`: structureを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/resource-structure.md`: resource-structure のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling documentation architecture tasks.
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

# Documentation Architecture

## 概要

ドキュメント構造設計、リソース分割、階層設計を専門とするスキル。
500行制約に基づく適切なファイル分割とトピックベース組織化により、
保守性と発見可能性の高いドキュメントアーキテクチャを実現します。

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
- SKILL.mdが500行を超える可能性がある時
- リソースファイルの分割戦略を決定する時
- ドキュメントの階層構造を設計する時
- 情報の発見可能性を向上させる時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/documentation-architecture/resources/Level1_basics.md
cat .claude/skills/documentation-architecture/resources/Level2_intermediate.md
cat .claude/skills/documentation-architecture/resources/Level3_advanced.md
cat .claude/skills/documentation-architecture/resources/Level4_expert.md
cat .claude/skills/documentation-architecture/resources/directory-organization.md
cat .claude/skills/documentation-architecture/resources/hierarchy-design.md
cat .claude/skills/documentation-architecture/resources/legacy-skill.md
cat .claude/skills/documentation-architecture/resources/naming-conventions.md
cat .claude/skills/documentation-architecture/resources/splitting-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs --help
.claude/skills/documentation-architecture/scripts/analyze-structure.sh
node .claude/skills/documentation-architecture/scripts/log_usage.mjs --help
node .claude/skills/documentation-architecture/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/documentation-architecture/templates/resource-structure.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
