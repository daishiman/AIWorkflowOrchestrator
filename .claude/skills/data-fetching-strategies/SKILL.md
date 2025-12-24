---
name: .claude/skills/data-fetching-strategies/SKILL.md
description: |
  Reactにおけるデータフェッチとキャッシュのベストプラクティスを専門とするスキル。
  SWR、React Queryを活用した効率的なサーバー状態管理を提供します。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/caching-patterns.md`: caching-patterns のパターン集
  - `resources/error-loading-states.md`: error-loading-states の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/library-comparison.md`: library-comparison の詳細ガイド
  - `resources/optimistic-updates.md`: optimistic-updates の詳細ガイド
  - `scripts/analyze-data-fetching.mjs`: datafetchingを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/react-query-hook-template.md`: react-query-hook-template のテンプレート
  - `templates/swr-hook-template.md`: swr-hook-template のテンプレート
  
  Use proactively when handling data fetching strategies tasks.
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

# Data Fetching Strategies

## 概要

Reactにおけるデータフェッチとキャッシュのベストプラクティスを専門とするスキル。
SWR、React Queryを活用した効率的なサーバー状態管理を提供します。
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
- データフェッチライブラリを選定する時
- キャッシュ戦略を設計する時
- 楽観的更新を実装する時
- サーバー状態とクライアント状態を分離する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/data-fetching-strategies/resources/Level1_basics.md
cat .claude/skills/data-fetching-strategies/resources/Level2_intermediate.md
cat .claude/skills/data-fetching-strategies/resources/Level3_advanced.md
cat .claude/skills/data-fetching-strategies/resources/Level4_expert.md
cat .claude/skills/data-fetching-strategies/resources/caching-patterns.md
cat .claude/skills/data-fetching-strategies/resources/error-loading-states.md
cat .claude/skills/data-fetching-strategies/resources/legacy-skill.md
cat .claude/skills/data-fetching-strategies/resources/library-comparison.md
cat .claude/skills/data-fetching-strategies/resources/optimistic-updates.md
```

### スクリプト実行
```bash
node .claude/skills/data-fetching-strategies/scripts/analyze-data-fetching.mjs --help
node .claude/skills/data-fetching-strategies/scripts/log_usage.mjs --help
node .claude/skills/data-fetching-strategies/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/data-fetching-strategies/templates/react-query-hook-template.md
cat .claude/skills/data-fetching-strategies/templates/swr-hook-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
