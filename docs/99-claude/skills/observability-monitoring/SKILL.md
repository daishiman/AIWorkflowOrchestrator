---
name: observability-monitoring
description: |
  現代的なSREプラクティスに基づくObservabilityと監視システム設計の専門知識。
  メトリクス、ログ、トレースの3本柱とダッシュボード設計、SLI/SLO定義を提供。

  Anchors:
  • Google SRE Book / 適用: Observabilityアーキテクチャ・SLI/SLO設計 / 目的: 本番環境対応の監視システム
  • Observability Engineering (Honeycomb) / 適用: モダンObservabilityパターン / 目的: 高カーディナリティObservability実装
  • The Art of Monitoring (James Turnbull) / 適用: 実践的な監視実装 / 目的: エンドツーエンドの監視ワークフロー

  Trigger:
  Use when designing observability systems, implementing metrics collection, setting up distributed tracing, creating dashboards, defining SLIs/SLOs, or establishing logging strategies.
  observability, monitoring, metrics, traces, logs, SLI, SLO, Prometheus, Grafana, OpenTelemetry
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Observability Monitoring

## 概要

現代的なSREプラクティスに基づくObservabilityと監視システム設計の専門知識を提供。
3本柱（メトリクス、ログ、トレース）の実装とSLI/SLO設計を支援する。

## ワークフロー

### Phase 1: 要件分析

**目的**: 監視要件と既存インフラストラクチャを理解

**アクション**:

1. 監視目標を特定（レイテンシ、エラー率、飽和度、トラフィック）
2. 既存インフラと制約を確認
3. Observability成熟度を判定

**Task**: `agents/analyze-observability-requirements.md` を参照

### Phase 2: アーキテクチャ設計

**目的**: 包括的なObservabilityアーキテクチャを設計

**アクション**:

1. 適切なツールを選定（Prometheus、Grafana、Jaeger、OpenTelemetry等）
2. メトリクス分類と命名規則を設計
3. 分散トレーシング戦略とサンプリングレートを計画
4. 構造化ログスキーマと保持ポリシーを定義

**Task**: `agents/design-observability-architecture.md` を参照

### Phase 3: 実装

**目的**: Observabilityコンポーネントを実装

**アクション**:

1. アプリケーションコードにメトリクス、トレース、ログを実装
2. 収集パイプラインを設定
3. ストレージバックエンドを設定
4. ダッシュボードを作成
5. SLI/SLOを定義

**Task**: `agents/implement-observability-stack.md` を参照

### Phase 4: 検証と最適化

**目的**: 実装を検証し最適化

**アクション**:

1. ダッシュボードクエリとアラートルールをテスト
2. トレースサンプリングと完全性を検証
3. ストレージコストと保持ポリシーを最適化

**Task**: `agents/validate-observability-implementation.md` を参照

## Task仕様（ナビゲーション）

| Task                                  | 起動タイミング | 入力         | 出力               |
| ------------------------------------- | -------------- | ------------ | ------------------ |
| analyze-observability-requirements    | Phase 1開始時  | 監視要件     | 要件分析結果       |
| design-observability-architecture     | Phase 2開始時  | 要件分析結果 | アーキテクチャ設計 |
| implement-observability-stack         | Phase 3開始時  | 設計書       | 実装済みスタック   |
| validate-observability-implementation | Phase 4開始時  | 実装成果物   | 検証済みシステム   |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## Four Golden Signals

| Signal     | 説明                 | 典型的なメトリクス                  |
| ---------- | -------------------- | ----------------------------------- |
| Latency    | リクエスト処理時間   | `http_request_duration_seconds`     |
| Traffic    | リクエスト量         | `http_requests_total`               |
| Errors     | 失敗したリクエスト率 | `http_requests_total{status="5xx"}` |
| Saturation | リソース使用率       | `container_memory_usage_bytes`      |

## ベストプラクティス

### すべきこと

- Four Golden Signals（Latency、Traffic、Errors、Saturation）を必ず監視
- 高カーディナリティ: ラベルで柔軟なクエリを可能に（爆発に注意）
- 適切なサンプリングレートを設定（head-based/tail-based）
- 構造化ログ: JSONで検索性を向上
- SLI駆動: ユーザー体験に基づいたSLIを定義
- Correlation ID: ログ・メトリクス・トレースを関連付け

### 避けるべきこと

- Metric Explosion: 無制限なラベル値によるカーディナリティ爆発
- 過度なログ出力: コストとノイズの増大
- 100% Sampling: パフォーマンスとコストへの影響
- Vanity Metrics: ビジネス価値のない見栄えだけのメトリクス
- Dashboard Overload: 情報過多で読み取れないダッシュボード

## リソース参照

### references/（詳細知識）

| リソース   | パス                                                 | 用途                  |
| ---------- | ---------------------------------------------------- | --------------------- |
| 基礎知識   | See [references/basics.md](references/basics.md)     | Observability基本概念 |
| パターン集 | See [references/patterns.md](references/patterns.md) | 実装パターン          |

## 変更履歴

| Version | Date       | Changes                    |
| ------- | ---------- | -------------------------- |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様に完全準拠 |
| 1.0.0   | 2025-12-31 | 初期実装                   |
