---
name: query-optimization
description: |
  データベースクエリ最適化の専門スキル。
  N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などの
  パフォーマンス最適化手法を提供します。

  Anchors:
  • 『High Performance MySQL』（Baron Schwartz）/ 適用: クエリ最適化 / 目的: パフォーマンス向上

  Trigger:
  クエリ最適化時、実行計画分析時、データベースパフォーマンス改善時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Query Optimization

## 概要

Vlad MihaltseaとMarkus Winandの教えに基づくクエリ最適化を専門とするスキル。
N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などの
データベースパフォーマンス最適化手法を提供します。

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

- クエリパフォーマンスが低下している時
- N+1問題を検出・解消する時
- 複雑なJOINクエリを最適化する時
- インデックス設計を検討する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/query-optimization/references/Level1_basics.md
cat .claude/skills/query-optimization/references/Level2_intermediate.md
cat .claude/skills/query-optimization/references/Level3_advanced.md
cat .claude/skills/query-optimization/references/Level4_expert.md
cat .claude/skills/query-optimization/references/execution-plan-analysis.md
cat .claude/skills/query-optimization/references/explain-analyze-guide.md
cat .claude/skills/query-optimization/references/fetch-strategies.md
cat .claude/skills/query-optimization/references/index-strategies.md
cat .claude/skills/query-optimization/references/legacy-skill.md
cat .claude/skills/query-optimization/references/n-plus-one-patterns.md
```

### スクリプト実行

```bash
node .claude/skills/query-optimization/scripts/detect-n-plus-one.mjs --help
node .claude/skills/query-optimization/scripts/log_usage.mjs --help
node .claude/skills/query-optimization/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/query-optimization/assets/optimization-checklist.md
cat .claude/skills/query-optimization/assets/query-optimization-checklist.md
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
