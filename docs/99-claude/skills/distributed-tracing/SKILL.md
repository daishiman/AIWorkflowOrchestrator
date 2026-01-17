---
name: distributed-tracing
description: |
  分散トレーシングの設計とOpenTelemetry導入を支援するスキル。
  トレース構造、スパン設計、検証手順を体系化する。

  Anchors:
  • Observability Engineering / 適用: 観測設計 / 目的: 可観測性の一貫性確保
  • W3C Trace Context / 適用: コンテキスト伝播 / 目的: 標準準拠
  • OpenTelemetry / 適用: 計測とエクスポート / 目的: ベンダー非依存化

  Trigger:
  Use when designing trace structures, implementing OpenTelemetry instrumentation, or validating span propagation.
  distributed tracing, opentelemetry, span, trace context, w3c
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# distributed-tracing

## 概要

分散トレーシングの設計から検証までを整理し、OpenTelemetry導入を支援する。

## ワークフロー

### Phase 1: 要件整理

**目的**: トレーシングの目的とスコープを明確化する。

**アクション**:

1. `references/Level1_basics.md` で基本概念を確認する。
2. `assets/tracing-requirements-template.md` で要件を整理する。
3. `references/requirements-index.md` で要件整合を確認する。

**Task**: `agents/analyze-tracing-requirements.md` を参照

### Phase 2: トレース設計

**目的**: トレース構造とスパン設計を定義する。

**アクション**:

1. `references/trace-structure-design.md` で構造設計を確認する。
2. `references/span-design-guide.md` でスパン設計を整理する。
3. `assets/span-naming-checklist.md` で命名観点を揃える。

**Task**: `agents/design-trace-structure.md` を参照

### Phase 3: 実装と計測準備

**目的**: 実装方針と計測設定を整備する。

**アクション**:

1. `references/w3c-trace-context.md` で伝播仕様を確認する。
2. `assets/tracing-config.ts` を参照して設定を整理する。
3. 実装方針メモを作成する。

**Task**: `agents/implement-instrumentation-plan.md` を参照

### Phase 4: 検証と運用

**目的**: トレース構造の検証と記録を行う。

**アクション**:

1. `scripts/analyze-trace.mjs` で検証する。
2. `assets/trace-evaluation-template.md` で評価を整理する。
3. `scripts/log_usage.mjs` で記録を更新する。

**Task**: `agents/validate-tracing-setup.md` を参照

## Task仕様ナビ

| Task                           | 起動タイミング | 入力      | 出力                   |
| ------------------------------ | -------------- | --------- | ---------------------- |
| analyze-tracing-requirements   | Phase 1開始時  | 目的/制約 | 要件メモ、スコープ整理 |
| design-trace-structure         | Phase 2開始時  | 要件メモ  | トレース設計、命名方針 |
| implement-instrumentation-plan | Phase 3開始時  | 設計方針  | 実装方針、計測設定     |
| validate-tracing-setup         | Phase 4開始時  | 実装方針  | 検証レポート、改善提案 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項               | 理由                 |
| ---------------------- | -------------------- |
| スパン命名を統一する   | 可視化の精度が上がる |
| 伝播仕様を明文化する   | 断絶を防ぐ           |
| サンプリングを定義する | 負荷を制御できる     |
| 検証結果を記録する     | 改善が継続する       |

### 避けるべきこと

| 禁止事項       | 問題点               |
| -------------- | -------------------- |
| 目的不明の計測 | ノイズが増える       |
| 伝播忘れ       | トレースが分断される |
| 全量収集のみ   | 本番負荷が高い       |

## リソース参照

### scripts/（決定論的処理）

| スクリプト                   | 機能                         |
| ---------------------------- | ---------------------------- |
| `scripts/analyze-trace.mjs`  | トレース構造分析             |
| `scripts/log_usage.mjs`      | 使用記録と評価メトリクス更新 |
| `scripts/validate-skill.mjs` | スキル構造の検証             |

### references/（詳細知識）

| リソース      | パス                                                                         | 読込条件     |
| ------------- | ---------------------------------------------------------------------------- | ------------ |
| レベル1 基礎  | [references/Level1_basics.md](references/Level1_basics.md)                   | 要件整理時   |
| レベル2 実務  | [references/Level2_intermediate.md](references/Level2_intermediate.md)       | 設計時       |
| レベル3 応用  | [references/Level3_advanced.md](references/Level3_advanced.md)               | 実装時       |
| レベル4 専門  | [references/Level4_expert.md](references/Level4_expert.md)                   | 改善時       |
| トレース設計  | [references/trace-structure-design.md](references/trace-structure-design.md) | 構造設計時   |
| スパン設計    | [references/span-design-guide.md](references/span-design-guide.md)           | スパン設計時 |
| Trace Context | [references/w3c-trace-context.md](references/w3c-trace-context.md)           | 伝播設計時   |
| 要求仕様索引  | [references/requirements-index.md](references/requirements-index.md)         | 仕様確認時   |
| 旧スキル      | [references/legacy-skill.md](references/legacy-skill.md)                     | 互換確認時   |

### assets/（テンプレート・素材）

| アセット                                  | 用途                 |
| ----------------------------------------- | -------------------- |
| `assets/tracing-requirements-template.md` | 要件整理テンプレート |
| `assets/span-naming-checklist.md`         | スパン命名チェック   |
| `assets/trace-evaluation-template.md`     | 検証テンプレート     |
| `assets/tracing-config.ts`                | 設定サンプル         |

### 運用ファイル

| ファイル       | 目的                       |
| -------------- | -------------------------- |
| `EVALS.json`   | レベル評価・メトリクス管理 |
| `LOGS.md`      | 実行ログの蓄積             |
| `CHANGELOG.md` | 改善履歴の記録             |
