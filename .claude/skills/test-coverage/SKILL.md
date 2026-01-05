---
name: test-coverage
description: |
  テストカバレッジの計測、ギャップ分析、改善計画の策定を行うスキル。
  リスクベースで優先順位を決め、実行可能な改善ステップに落とし込む。

  Anchors:
  • Working Effectively with Legacy Code / 適用: リスク評価 / 目的: 重点領域の特定
  • xUnit Test Patterns / 適用: テスト設計 / 目的: 有効なテスト追加
  • Test-Driven Development: By Example / 適用: テスト追加 / 目的: 品質改善

  Trigger:
  Use when analyzing test coverage, prioritizing coverage gaps, or planning coverage improvements.
  test coverage, coverage report, coverage gap, risk-based testing, improvement plan
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# test-coverage

## 概要

カバレッジ指標を分析し、ギャップを優先順位付けして改善計画に落とし込むスキル。

---

## ワークフロー

### Phase 1: カバレッジ分析

**目的**: 現状のカバレッジ指標を整理し、ギャップを抽出する。

**アクション**:

1. カバレッジレポートを取得する
2. 指標を整理しギャップを抽出する
3. 初期評価を記録する

**Task**: `agents/analyze-coverage.md` を参照

### Phase 2: ギャップ優先順位付け

**目的**: 影響度と頻度をもとに優先順位を決定する。

**アクション**:

1. リスク評価を行う
2. 優先順位表を作成する
3. 重点領域を特定する

**Task**: `agents/prioritize-gaps.md` を参照

### Phase 3: 改善計画の策定

**目的**: 改善施策と検証方法を定義する。

**アクション**:

1. 施策と目標値を決める
2. 段階的な実施手順を作る
3. 検証方法を明記する

**Task**: `agents/plan-improvements.md` を参照

---

## Task仕様ナビ

| Task             | 起動タイミング | 入力                   | 出力                   |
| ---------------- | -------------- | ---------------------- | ---------------------- |
| analyze-coverage | Phase 1開始時  | カバレッジレポート     | カバレッジ分析結果     |
| prioritize-gaps  | Phase 2開始時  | カバレッジ分析結果     | 優先度付きギャップ表   |
| plan-improvements| Phase 3開始時  | 優先度付きギャップ表   | 改善計画               |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                         | 理由                               |
| -------------------------------- | ---------------------------------- |
| リスクベースで優先順位を決める   | 影響度の高い改善から着手できる     |
| 複数の指標を確認する             | 偏った評価を避ける                 |
| 段階的な改善計画にする           | 実行可能性が高まる                 |

### 避けるべきこと

| 禁止事項                     | 問題点                             |
| ---------------------------- | ---------------------------------- |
| 数値目標だけを追う           | テスト品質が低下する               |
| 低優先度領域に集中する       | リスク低減につながらない           |
| 計測を省略する               | 改善効果が測れない                 |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト                               | 機能                         |
| ---------------------------------------- | ---------------------------- |
| `scripts/analyze-coverage-report.mjs`    | カバレッジレポート解析       |
| `scripts/validate-coverage-plan.mjs`     | 改善計画テンプレート検証     |
| `scripts/log_usage.mjs`                  | 使用記録をLOGS.mdに記録する  |

### references/（詳細知識）

| リソース          | パス                                                     | 読込条件     |
| ----------------- | -------------------------------------------------------- | ------------ |
| 基礎              | [references/Level1_basics.md](references/Level1_basics.md) | 初回利用時   |
| ギャップ分析      | [references/Level2_intermediate.md](references/Level2_intermediate.md) | Phase 2 |
| 高度計測          | [references/Level3_advanced.md](references/Level3_advanced.md) | 高難度対応 |
| 継続運用          | [references/Level4_expert.md](references/Level4_expert.md) | 運用時 |
| リスク評価        | [references/risk-assessment.md](references/risk-assessment.md) | Phase 2 |
| メトリクス定義    | [references/coverage-metrics.md](references/coverage-metrics.md) | Phase 1 |

### assets/（テンプレート）

| アセット                                 | 用途                       |
| ---------------------------------------- | -------------------------- |
| `assets/coverage-analysis-template.md`   | カバレッジ分析テンプレート |
| `assets/coverage-improvement-plan.md`    | 改善計画テンプレート       |

