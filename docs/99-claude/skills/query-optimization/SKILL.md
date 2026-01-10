---
name: query-optimization
description: |
  データベースクエリ最適化を専門とするスキル。N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用を通じてパフォーマンスを向上させます。

  Anchors:
  • High Performance MySQL (Baron Schwartz) / 適用: クエリ最適化原則 / 目的: パフォーマンス向上の体系的アプローチ
  • SQL Performance Explained (Markus Winand) / 適用: インデックス設計とアクセスパターン / 目的: 実行計画の最適化
  • High-Performance Java Persistence (Vlad Mihalcea) / 適用: ORM最適化とN+1問題解決 / 目的: アプリケーションレベルの最適化

  Trigger:
  Use when optimizing query performance, analyzing execution plans, resolving N+1 problems, designing fetch strategies, improving database performance, or tuning ORM queries.
  Keywords: query optimization, N+1 problem, execution plan, index design, fetch strategy, database performance, ORM optimization
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

Vlad MihaltseaとMarkus Winandの教えに基づくクエリ最適化を専門とするスキル。N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などのデータベースパフォーマンス最適化手法を提供します。

## ワークフロー

### Phase 1: パフォーマンス分析

**目的**: クエリパフォーマンスのボトルネックを特定する

**Task**: `agents/analysis.md`

**入力**:

- 問題となっているクエリ
- パフォーマンス要件
- データベーススキーマ

**出力**:

- ボトルネック診断レポート
- 実行計画分析結果
- N+1問題の検出結果
- 最適化優先度リスト

**実行タイミング**: パフォーマンス問題の調査時、新規クエリのレビュー時

### Phase 2: 最適化実施

**目的**: インデックス設計、フェッチ戦略、クエリリライトを実施する

**Task**: `agents/optimization.md`

**入力**:

- Phase 1の分析結果
- データベーススキーマ
- 現在のコード

**出力**:

- 最適化されたクエリ/コード
- インデックス設計案（DDL）
- フェッチ戦略の推奨事項
- パフォーマンス測定結果

**実行タイミング**: 分析完了後、最適化施策の決定時

### Phase 3: 効果検証

**目的**: 最適化効果を測定し、本番適用の可否を判断する

**Task**: `agents/validation.md`

**入力**:

- 最適化前後のクエリ/コード
- インデックス定義
- ベンチマーク条件

**出力**:

- パフォーマンス比較レポート
- 副作用確認結果
- デプロイ推奨判断
- 残存課題リスト

**実行タイミング**: 最適化実施後、本番デプロイ前

## Task仕様

| Task         | 起動タイミング | 入力               | 出力               |
| ------------ | -------------- | ------------------ | ------------------ |
| analysis     | Phase 1開始時  | クエリ・スキーマ   | ボトルネック診断   |
| optimization | Phase 2開始時  | 分析結果・コード   | 最適化実装         |
| validation   | Phase 3開始時  | 最適化前後の成果物 | 検証・デプロイ判断 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

- [agents/analysis.md](agents/analysis.md)
- [agents/optimization.md](agents/optimization.md)
- [agents/validation.md](agents/validation.md)

## ベストプラクティス

### すべきこと

- 測定から始める（推測による最適化を避ける）
- EXPLAIN で実行計画を必ず確認
- N+1問題を早期に検出して解決
- インデックス追加前にクエリパターンを分析
- 最適化効果を数値で検証
- 既存テストで副作用がないことを確認

### 避けるべきこと

- 測定なしの盲目的なインデックス追加
- 実行計画を見ずにクエリを変更
- 過度なインデックス（書き込み性能の劣化）
- 単一クエリのみの最適化（全体像を見失う）
- 副作用確認なしの本番デプロイ

## リソース参照

### references/（詳細知識）

| リソース                   | パス                                                                           | 内容             |
| -------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 基礎知識                   | [references/Level1_basics.md](references/Level1_basics.md)                     | 基礎概念と用語   |
| 実務パターン               | [references/Level2_intermediate.md](references/Level2_intermediate.md)         | 実務での適用     |
| 高度な最適化               | [references/Level3_advanced.md](references/Level3_advanced.md)                 | 高度な最適化技法 |
| 専門トラブルシューティング | [references/Level4_expert.md](references/Level4_expert.md)                     | 専門的な問題解決 |
| 実行計画分析               | [references/execution-plan-analysis.md](references/execution-plan-analysis.md) | EXPLAIN解析手法  |
| インデックス戦略           | [references/index-strategies.md](references/index-strategies.md)               | インデックス設計 |
| N+1パターン                | [references/n-plus-one-patterns.md](references/n-plus-one-patterns.md)         | N+1問題と解決策  |
| フェッチ戦略               | [references/fetch-strategies.md](references/fetch-strategies.md)               | フェッチ最適化   |

### scripts/（決定論的処理）

| スクリプト              | 用途         | 使用例                                                         |
| ----------------------- | ------------ | -------------------------------------------------------------- |
| `detect-n-plus-one.mjs` | N+1問題検出  | `node scripts/detect-n-plus-one.mjs --log query.log`           |
| `log_usage.mjs`         | 使用履歴記録 | `node scripts/log_usage.mjs --result success --phase analysis` |
| `validate-skill.mjs`    | 構造検証     | `node scripts/validate-skill.mjs`                              |

### assets/（テンプレート）

| テンプレート                | 用途                 |
| --------------------------- | -------------------- |
| `optimization-checklist.md` | 最適化チェックリスト |

## 変更履歴

| Version | Date       | Changes                                                    |
| ------- | ---------- | ---------------------------------------------------------- |
| 3.0.0   | 2026-01-02 | 18-skills.md仕様完全準拠: validation agent追加、整合性修正 |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様準拠: Trigger英語化、Anchors追加           |
| 1.0.0   | 2025-12-24 | 初版: 基本構造とリソース整備                               |
