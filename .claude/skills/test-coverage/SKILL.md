---
name: test-coverage
description: |
  テストカバレッジ分析と改善戦略の設計スキル。
  カバレッジメトリクスの収集・分析・ギャップ特定・優先順位付け・改善計画を体系的に実施します。

  Anchors:
  • Working Effectively with Legacy Code (Michael Feathers) / 適用: レガシーコードへのテスト追加戦略 / 目的: リスクベーステスト設計
  • xUnit Test Patterns (Gerard Meszaros) / 適用: テスト設計パターン / 目的: 効果的なテストケース作成
  • Test-Driven Development (Kent Beck) / 適用: TDDサイクル / 目的: カバレッジを自然に高める開発手法

  Trigger:
  Use when analyzing test coverage, improving test suites, identifying coverage gaps, or planning coverage improvement strategies.
  test coverage, coverage report, code coverage, branch coverage, line coverage, statement coverage, path coverage, coverage analysis, coverage gap, untested code, test improvement
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# test-coverage

## 概要

テストカバレッジ分析と改善戦略の設計スキル。
カバレッジメトリクスの収集・分析・ギャップ特定・優先順位付け・改善計画を体系的に実施する。

---

## ワークフロー

### Phase 1: カバレッジ収集と分析

**目的**: 現状のテストカバレッジを測定し、メトリクスを可視化

**アクション**:

1. テストランナー（Vitest/Jest/Pytest等）でカバレッジレポート生成
2. `scripts/analyze-coverage.mjs` で詳細分析
3. カバレッジ種別（Line/Branch/Function/Statement）別の状況確認
4. 必要なリソースレベル（Level 1-4）を判定

**Task**: `agents/analyze-coverage.md` を参照

### Phase 2: ギャップ特定と優先順位付け

**目的**: カバレッジギャップを特定し、リスクベースで優先順位を決定

**アクション**:

1. 未カバー領域の洗い出し
2. `references/risk-assessment.md` でリスク評価
3. ビジネスインパクト・変更頻度・複雑度でスコアリング
4. 優先度マトリクスの作成

**Task**: `agents/identify-gaps.md` を参照

### Phase 3: 改善計画と実装

**目的**: カバレッジ改善計画を策定し、効果的なテストを追加

**アクション**:

1. `assets/coverage-improvement-plan.md` を使用
2. `references/test-design-patterns.md` でパターン選択
3. 段階的改善ロードマップ作成
4. `scripts/validate-coverage-improvement.mjs` で進捗確認
5. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/improve-coverage.md` を参照

---

## Task仕様ナビ

| Task             | 起動タイミング | 入力                   | 出力                   |
| ---------------- | -------------- | ---------------------- | ---------------------- |
| analyze-coverage | Phase 1開始時  | カバレッジレポート     | カバレッジ分析結果     |
| identify-gaps    | Phase 2開始時  | カバレッジ分析結果     | 優先順位付きギャップ表 |
| improve-coverage | Phase 3開始時  | 優先順位付きギャップ表 | 改善計画と実装         |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                     | 理由                                       |
| ---------------------------- | ------------------------------------------ |
| リスクベースでの優先順位付け | ビジネスインパクトの高い領域から改善       |
| 複数カバレッジメトリクス確認 | Line/Branch/Path等、多角的な視点で評価     |
| 段階的改善                   | 一度に100%を目指さず、着実に向上           |
| カバレッジとテスト品質の両立 | 数値目標だけでなく、意味のあるテストを作成 |
| 継続的モニタリング           | CI/CDパイプラインでカバレッジを追跡        |

### 避けるべきこと

| 禁止事項                 | 問題点                                   |
| ------------------------ | ---------------------------------------- |
| カバレッジ100%を目標化   | コストパフォーマンスが悪化               |
| カバレッジのみに注目     | テストの品質（有効性）を無視             |
| 自動生成テストへの依存   | メンテナンス困難なテストが量産される     |
| レガシーコード全域の改善 | リスク評価なしに手を広げると破綻         |
| カバレッジ低下の放置     | 技術的負債が蓄積し、後の改善が困難になる |

---

## リソース参照

### references/（詳細知識）

| リソース                 | パス                                                                     | 読込条件                   |
| ------------------------ | ------------------------------------------------------------------------ | -------------------------- |
| 基礎概念                 | [references/Level1_basics.md](references/Level1_basics.md)               | 初回利用時                 |
| 実務パターン             | [references/Level2_intermediate.md](references/Level2_intermediate.md)   | 実務適用時                 |
| 応用技法                 | [references/Level3_advanced.md](references/Level3_advanced.md)           | 複雑なプロジェクト時       |
| ベストプラクティス       | [references/Level4_expert.md](references/Level4_expert.md)               | アンチパターン回避         |
| リスク評価ガイド         | [references/risk-assessment.md](references/risk-assessment.md)           | Phase 2実行時              |
| テスト設計パターン       | [references/test-design-patterns.md](references/test-design-patterns.md) | Phase 3実行時              |
| カバレッジメトリクス解説 | [references/coverage-metrics.md](references/coverage-metrics.md)         | Phase 1実行時              |
| レガシーコード対応戦略   | [references/legacy-code-strategy.md](references/legacy-code-strategy.md) | レガシーコードテスト追加時 |

### scripts/（決定論的処理）

| スクリプト                                  | 機能                       |
| ------------------------------------------- | -------------------------- |
| `scripts/analyze-coverage.mjs`              | カバレッジレポート詳細分析 |
| `scripts/validate-coverage-improvement.mjs` | 改善進捗検証               |
| `scripts/generate-coverage-report.mjs`      | 統合カバレッジレポート生成 |
| `scripts/log_usage.mjs`                     | フィードバック記録         |

### assets/（テンプレート）

| アセット                              | 用途                     |
| ------------------------------------- | ------------------------ |
| `assets/coverage-improvement-plan.md` | 改善計画テンプレート     |
| `assets/coverage-analysis-report.md`  | 分析レポートテンプレート |
| `assets/priority-matrix.md`           | 優先順位マトリクス雛形   |

---

## 変更履歴

| Version | Date       | Changes                                   |
| ------- | ---------- | ----------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md準拠版。agents/追加、構造刷新 |
