---
name: .claude/skills/query-optimization/SKILL.md
description: |
  Vlad MihaltseaとMarkus Winandの教えに基づくクエリ最適化を専門とするスキル。
  N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などの
  データベースパフォーマンス最適化手法を提供します。
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/execution-plan-analysis.md`: EXPLAIN QUERY PLANの読み方、スキャン方法、JOIN方法、問題パターン検出
  - `resources/explain-analyze-guide.md`: EXPLAIN QUERY PLAN 完全ガイド
  - `resources/fetch-strategies.md`: Eager/Lazy/明示的フェッチの使い分けとSELECT句最適化手法
  - `resources/index-strategies.md`: インデックス設計戦略
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/n-plus-one-patterns.md`: N+1問題パターンと解決策
  - `scripts/detect-n-plus-one.mjs`: N+1問題検出スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/optimization-checklist.md`: クエリ最適化チェックリスト
  - `templates/query-optimization-checklist.md`: クエリ最適化チェックリスト
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling query optimization tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "High Performance Browser Networking"
    author: "Ilya Grigorik"
    concepts:
      - "パフォーマンス測定"
      - "最適化"
---

# Query Optimization

## 概要

Vlad MihaltseaとMarkus Winandの教えに基づくクエリ最適化を専門とするスキル。
N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などの
データベースパフォーマンス最適化手法を提供します。

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
- クエリパフォーマンスが低下している時
- N+1問題を検出・解消する時
- 複雑なJOINクエリを最適化する時
- インデックス設計を検討する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/query-optimization/resources/Level1_basics.md
cat .claude/skills/query-optimization/resources/Level2_intermediate.md
cat .claude/skills/query-optimization/resources/Level3_advanced.md
cat .claude/skills/query-optimization/resources/Level4_expert.md
cat .claude/skills/query-optimization/resources/execution-plan-analysis.md
cat .claude/skills/query-optimization/resources/explain-analyze-guide.md
cat .claude/skills/query-optimization/resources/fetch-strategies.md
cat .claude/skills/query-optimization/resources/index-strategies.md
cat .claude/skills/query-optimization/resources/legacy-skill.md
cat .claude/skills/query-optimization/resources/n-plus-one-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/query-optimization/scripts/detect-n-plus-one.mjs --help
node .claude/skills/query-optimization/scripts/log_usage.mjs --help
node .claude/skills/query-optimization/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/query-optimization/templates/optimization-checklist.md
cat .claude/skills/query-optimization/templates/query-optimization-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
