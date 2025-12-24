---
name: .claude/skills/resource-oriented-api/SKILL.md
description: |
  MCPのリソース指向API設計パターンに関する専門知識。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/caching-strategies.md`: Caching Strategiesリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/resource-transformation.md`: Resource Transformationリソース
  - `resources/uri-scheme-guide.md`: Uri Scheme Guideリソース
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-resource-definition.mjs`: Validate Resource Definitionスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-uri.mjs`: Validate Uriスクリプト
  - `templates/resource-definition-template.json`: Resource Definitionテンプレート
  - `templates/resource-provider-template.ts`: Resource Providerテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling resource oriented api tasks.
version: 1.0.1
level: 1
last_updated: 2025-12-24
references:
  - book: "RESTful Web APIs"
    author: "Leonard Richardson"
    concepts:
      - "リソース設計"
      - "HTTP設計"
---

# Resource Oriented API スキル

## 概要

MCPのリソース指向API設計パターンに関する専門知識。

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/resource-oriented-api/resources/Level1_basics.md
cat .claude/skills/resource-oriented-api/resources/Level2_intermediate.md
cat .claude/skills/resource-oriented-api/resources/Level3_advanced.md
cat .claude/skills/resource-oriented-api/resources/Level4_expert.md
cat .claude/skills/resource-oriented-api/resources/caching-strategies.md
cat .claude/skills/resource-oriented-api/resources/legacy-skill.md
cat .claude/skills/resource-oriented-api/resources/resource-transformation.md
cat .claude/skills/resource-oriented-api/resources/uri-scheme-guide.md
```

### スクリプト実行
```bash
node .claude/skills/resource-oriented-api/scripts/log_usage.mjs --help
node .claude/skills/resource-oriented-api/scripts/validate-resource-definition.mjs --help
node .claude/skills/resource-oriented-api/scripts/validate-skill.mjs --help
node .claude/skills/resource-oriented-api/scripts/validate-uri.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/resource-oriented-api/templates/resource-definition-template.json
cat .claude/skills/resource-oriented-api/templates/resource-provider-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.1 | 2025-12-24 | Spec alignment and required artifacts added |
