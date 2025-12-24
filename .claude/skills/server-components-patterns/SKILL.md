---
name: .claude/skills/server-components-patterns/SKILL.md
description: |
  React Server Componentsのデータフェッチ最適化とSuspense活用を専門とするスキル。
  
  📖 参照書籍:
  - 『Don't Make Me Think』（Steve Krug）: ユーザビリティ
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/caching-strategies.md`: Caching Strategiesリソース
  - `resources/data-fetching-patterns.md`: Data Fetching Patternsリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/server-actions.md`: Server Actionsリソース
  - `resources/suspense-streaming.md`: Suspense Streamingリソース
  - `scripts/analyze-data-fetching.mjs`: Analyze Data Fetchingスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/data-fetch-template.md`: Data Fetchテンプレート
  - `templates/server-action-template.md`: Server Actionテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling server components patterns tasks.
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

# Server Components Patterns

## 概要

React Server Componentsのデータフェッチ最適化とSuspense活用を専門とするスキル。

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
cat .claude/skills/server-components-patterns/resources/Level1_basics.md
cat .claude/skills/server-components-patterns/resources/Level2_intermediate.md
cat .claude/skills/server-components-patterns/resources/Level3_advanced.md
cat .claude/skills/server-components-patterns/resources/Level4_expert.md
cat .claude/skills/server-components-patterns/resources/caching-strategies.md
cat .claude/skills/server-components-patterns/resources/data-fetching-patterns.md
cat .claude/skills/server-components-patterns/resources/legacy-skill.md
cat .claude/skills/server-components-patterns/resources/server-actions.md
cat .claude/skills/server-components-patterns/resources/suspense-streaming.md
```

### スクリプト実行
```bash
node .claude/skills/server-components-patterns/scripts/analyze-data-fetching.mjs --help
node .claude/skills/server-components-patterns/scripts/log_usage.mjs --help
node .claude/skills/server-components-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/server-components-patterns/templates/data-fetch-template.md
cat .claude/skills/server-components-patterns/templates/server-action-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
