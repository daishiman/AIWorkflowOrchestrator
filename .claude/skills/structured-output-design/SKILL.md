---
name: .claude/skills/structured-output-design/SKILL.md
description: |
  AIからの構造化出力設計を専門とするスキル。JSON Schema、Zod、
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/function-calling-guide.md`: Function Calling Guideリソース
  - `references/json-schema-patterns.md`: Json Schema Patternsリソース
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/zod-integration.md`: Zod Integrationリソース
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-schema.mjs`: Validate Schemaスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/json-schema-template.json`: Json Schemaテンプレート
  - `assets/zod-schema-template.ts`: Zod Schemaテンプレート
  
  Use proactively when handling structured output design tasks.
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

# Structured Output Design

## 概要

AIからの構造化出力設計を専門とするスキル。JSON Schema、Zod、

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/structured-output-design/references/Level1_basics.md
cat .claude/skills/structured-output-design/references/Level2_intermediate.md
cat .claude/skills/structured-output-design/references/Level3_advanced.md
cat .claude/skills/structured-output-design/references/Level4_expert.md
cat .claude/skills/structured-output-design/references/function-calling-guide.md
cat .claude/skills/structured-output-design/references/json-schema-patterns.md
cat .claude/skills/structured-output-design/references/legacy-skill.md
cat .claude/skills/structured-output-design/references/zod-integration.md
```

### スクリプト実行
```bash
node .claude/skills/structured-output-design/scripts/log_usage.mjs --help
node .claude/skills/structured-output-design/scripts/validate-schema.mjs --help
node .claude/skills/structured-output-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/structured-output-design/assets/json-schema-template.json
cat .claude/skills/structured-output-design/assets/zod-schema-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
