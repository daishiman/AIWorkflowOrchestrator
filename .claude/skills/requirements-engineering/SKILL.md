---
name: requirements-engineering
description: |
  カール・ウィーガーズの要求工学理論に基づく体系的な要件定義スキル。
  ステークホルダーニーズを正確に把握し、曖昧性のない要件書を作成するための完全なワークフローを提供します。

  Anchors:
  • 『Software Requirements』（Karl Wiegers）/ 適用: 要件工学 / 目的: 品質要件
  • 『Don't Make Me Think』（Steve Krug）/ 適用: ユーザビリティ / 目的: 情報設計

  Trigger:
  要件エンジニアリング、要件分析プロセス、システム要件定義、ユーザーニーズ分析、ステークホルダーヒアリング時に使用
version: 1.0.0
level: 1
last_updated: 2025-12-31
allowed-tools:
  - mcp__claude-in-chrome__read_page
  - mcp__claude-in-chrome__find
  - Read
  - Glob
  - Grep
  - Bash
---

# 要件エンジニアリング

## 概要

カール・ウィーガーズの要求工学理論に基づく体系的な要件定義スキル。ステークホルダーニーズを正確に把握し、曖昧性のない要件書を作成するための完全なワークフローを提供します。

- **要件分析**: ステークホルダーから潜在的なニーズを引き出す
- **完全性検証**: 要件の漏れや矛盾を検出
- **品質保証**: 曖昧性排除と優先度付けを実施

詳細な手順や背景は`references/Level1_basics.md`と`references/Level2_intermediate.md`を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスク要件と適用範囲を明確にする

**アクション**:

1. ステークホルダーの一覧と期待値を整理
2. プロジェクト制約（予算、スケジュール、リソース）を把握
3. 既存の類似プロジェクト文書を参照

### Phase 2: 要件定義と検証

**目的**: 体系的に要件を抽出し、完全性と品質を検証する

**アクション**:

1. ステークホルダーヒアリングを実施
2. `references/quality-criteria.md`で完全性をチェック
3. `references/ambiguity-detection.md`で曖昧性を検出
4. `assets/requirements-document.md`に基づいて要件書を作成

### Phase 3: 検証と記録

**目的**: 成果物の品質を確認し、実行記録を保存

**アクション**:

1. `scripts/validate-requirements.mjs`で要件書を検証
2. ステークホルダーによるレビューと承認取得
3. `scripts/log_usage.mjs`で使用記録を記録

## Task仕様ナビ

| Task                   | 説明                                       | リソース                              | コマンド                                        |
| ---------------------- | ------------------------------------------ | ------------------------------------- | ----------------------------------------------- |
| **基礎学習**           | 要件エンジニアリングの基本原理と手法を習得 | `references/Level1_basics.md`          | `Read references/Level1_basics.md`               |
| **実務手順**           | 実プロジェクトでの要件抽出・検証手順       | `references/Level2_intermediate.md`    | `Read references/Level2_intermediate.md`         |
| **応用技法**           | 複雑な要件のモデリングと最適化             | `references/Level3_advanced.md`        | `Read references/Level3_advanced.md`             |
| **専門知識**           | エキスパートレベルの戦略と設計パターン     | `references/Level4_expert.md`          | `Read references/Level4_expert.md`               |
| **曖昧性検出**         | 要件内の曖昧性を体系的に検出               | `references/ambiguity-detection.md`    | `Read references/ambiguity-detection.md`         |
| **完全性検証**         | 要件の漏れと矛盾を検出するチェックリスト   | `references/completeness-checklist.md` | `Read references/completeness-checklist.md`      |
| **品質基準**           | 要件書の品質評価基準                       | `references/quality-criteria.md`       | `Read references/quality-criteria.md`            |
| **トリアージ**         | 要件の優先度付けと分類フレームワーク       | `references/triage-framework.md`       | `Read references/triage-framework.md`            |
| **要件テンプレート**   | 要件書の標準テンプレート                   | `assets/requirements-document.md`  | `Read assets/requirements-document.md`       |
| **要件検証スクリプト** | 要件書の自動検証                           | `scripts/validate-requirements.mjs`   | `node scripts/validate-requirements.mjs <file>` |
| **スキル検証**         | スキル構造の整合性確認                     | `scripts/validate-skill.mjs`          | `node scripts/validate-skill.mjs`               |
| **使用記録**           | タスク実行の記録と評価                     | `scripts/log_usage.mjs`               | `node scripts/log_usage.mjs --help`             |

## ベストプラクティス

### すべきこと

- 要件を抽出する前に、ステークホルダーの役割と期待値を明確に整理する
- `references/Level1_basics.md`で基礎知識を確認してから実務に進む
- `references/quality-criteria.md`を参考に、要件書の品質を定期的に検証する
- 曖昧な用語や定義については、`references/ambiguity-detection.md`のパターンで検出する
- `references/completeness-checklist.md`を使用して、要件の漏れをチェックする
- ステークホルダーレビューを必ず実施し、承認を記録する

### 避けるべきこと

- 要件の抽出を急いで、完全性検証をスキップする
- 単一のステークホルダーの意見のみに基づいて要件を決定する
- 矛盾した要件を許容したまま進める
- 曖昧性を検出しても解決せずに放置する
- 優先度なしに全ての要件を同等に扱う
- テンプレートを参考にしない自由形式の要件書を作成する

## リソース参照

### レベル別ガイド

- **`references/Level1_basics.md`**: 要件エンジニアリングの基礎理論、FURPS+モデル、ユースケース分析の入門
- **`references/Level2_intermediate.md`**: ステークホルダー調査、要件抽出テクニック、実務手順の詳細
- **`references/Level3_advanced.md`**: 複雑な要件のモデリング、要件のトレーサビリティ、リスク分析
- **`references/Level4_expert.md`**: エキスパートレベルの戦略、組織横断的な要件管理、進化的要件開発

### 特化リソース

- **`references/ambiguity-detection.md`**: 曖昧な表現パターン、検出方法、解決アプローチ
- **`references/completeness-checklist.md`**: 要件の完全性を確保するチェックリスト
- **`references/quality-criteria.md`**: 要件書の品質評価基準とメトリクス
- **`references/triage-framework.md`**: 要件の優先度付けと分類の標準フレームワーク
- **`references/requirements-index.md`**: 要求仕様の索引（docs/00-requirements と同期）
- **`references/legacy-skill.md`**: 旧SKILL.mdの全文

### テンプレート

- **`assets/requirements-document.md`**: 要件書の標準テンプレート

### スクリプト

- **`scripts/validate-requirements.mjs`**: 要件書の自動検証ツール
- **`scripts/validate-skill.mjs`**: スキル構造の整合性確認
- **`scripts/log_usage.mjs`**: タスク実行記録と自動評価

## 変更履歴

| Version | Date       | Changes                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づいた完全改定、Task仕様ナビの追加、Anchors/Triggerの統合 |
