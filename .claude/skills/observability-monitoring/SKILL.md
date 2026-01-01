---
name: observability-monitoring
description: |
  Observability and monitoring system design expertise based on modern SRE practices.
  Provides comprehensive guidance for implementing metrics, logs, traces, and dashboards following Google SRE principles and industry best practices.

  Anchors:
  • Google SRE Book / 適用: Observability architecture and SLI/SLO design / 目的: Production-ready monitoring systems
  • Observability Engineering (Honeycomb) / 適用: Modern observability patterns and distributed tracing / 目的: High-cardinality observability implementation
  • The Art of Monitoring (James Turnbull) / 適用: Practical monitoring implementation / 目的: End-to-end monitoring workflows

  Triggers:
  Use when designing observability systems, implementing metrics collection, setting up distributed tracing, creating dashboards, defining SLIs/SLOs, establishing logging strategies, or migrating to modern observability platforms.
  Keywords: observability, monitoring, metrics, traces, logs, SLI, SLO, SLA, dashboards, Prometheus, Grafana, OpenTelemetry, distributed tracing, cardinality

allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
tags:
  - observability
  - monitoring
  - sre
  - metrics
  - tracing
  - logging
---

# Observability Monitoring - Modern Observability System Design

## 概要

Observability and monitoring system design expertise based on modern SRE practices. This skill provides comprehensive guidance for implementing the three pillars of observability (metrics, logs, traces) and dashboards following Google SRE principles, Observability Engineering patterns, and industry best practices.

このスキルは以下の領域をカバーします:

- **Metrics Collection**: Counter, Gauge, Histogram, Summary patterns with Prometheus/OpenTelemetry
- **Distributed Tracing**: Request flow visualization across microservices
- **Structured Logging**: High-cardinality, queryable log aggregation
- **Dashboard Design**: Effective visualization and alerting integration
- **SLI/SLO/SLA Definition**: Service level objectives and error budgets
- **Observability Strategy**: Platform selection, instrumentation patterns, cost optimization

## ワークフロー

### Phase 1: Requirements and Context Analysis

**目的**: Understand monitoring requirements and existing infrastructure

**アクション**:

1. Identify monitoring objectives (latency, error rate, saturation, traffic)
2. Review existing infrastructure and constraints
3. Determine observability maturity level (basic metrics → full distributed tracing)
4. Consult `references/Level1_basics.md` for foundational concepts

**Task**: `agents/analyze-observability-requirements.md` を参照

### Phase 2: Architecture Design

**目的**: Design comprehensive observability architecture

**アクション**:

1. Select appropriate tools (Prometheus, Grafana, Jaeger, OpenTelemetry, etc.)
2. Design metrics taxonomy and naming conventions
3. Plan distributed tracing strategy and sampling rates
4. Define structured logging schema and retention policies
5. Reference `references/Level2_intermediate.md` for implementation patterns
6. Reference `references/metrics-design-patterns.md` for metric design
7. Reference `references/distributed-tracing-guide.md` for tracing setup

**Task**: `agents/design-observability-architecture.md` を参照

### Phase 3: Implementation and Instrumentation

**目的**: Implement observability components

**アクション**:

1. Instrument application code with metrics, traces, logs
2. Configure collection pipelines (Prometheus scraping, OTLP exporters, log shippers)
3. Set up storage backends (Prometheus TSDB, Jaeger, Elasticsearch/Loki)
4. Create dashboards using `assets/dashboard-template.json`
5. Define SLIs/SLOs using `assets/sli-slo-template.yaml`
6. Reference `references/Level3_advanced.md` for advanced patterns

**Task**: `agents/implement-observability-stack.md` を参照

### Phase 4: Validation and Optimization

**目的**: Validate observability implementation and optimize

**アクション**:

1. Run `scripts/validate-skill.mjs` to verify skill structure
2. Run `scripts/validate-metrics-cardinality.mjs` to check metric explosion
3. Test dashboard queries and alert rules
4. Verify trace sampling and completeness
5. Optimize storage costs and retention policies
6. Reference `references/Level4_expert.md` for optimization techniques
7. Execute `scripts/log_usage.mjs` to record usage

**Task**: `agents/validate-observability-implementation.md` を参照

## Task仕様ナビ

| タスクタイプ                     | 説明                                            | 参照リソース                                         | テンプレート                 | 検証スクリプト                   |
| -------------------------------- | ----------------------------------------------- | ---------------------------------------------------- | ---------------------------- | -------------------------------- |
| Metrics Design                   | メトリクスの命名規則とラベル設計                | Level2_intermediate.md, metrics-design-patterns.md   | metrics-config-template.yaml | validate-metrics-cardinality.mjs |
| Distributed Tracing Setup        | 分散トレーシングの実装とサンプリング戦略        | Level3_advanced.md, distributed-tracing-guide.md     | tracing-config-template.yaml | validate-skill.mjs               |
| Dashboard Creation               | 効果的なダッシュボードの設計と実装              | Level2_intermediate.md, dashboard-design-patterns.md | dashboard-template.json      | validate-skill.mjs               |
| SLI/SLO Definition               | サービスレベル指標と目標の定義                  | Level3_advanced.md, sli-slo-design-guide.md          | sli-slo-template.yaml        | validate-skill.mjs               |
| Structured Logging               | 構造化ログの設計と集約パイプライン構築          | Level2_intermediate.md, logging-strategy-guide.md    | log-schema-template.json     | validate-skill.mjs               |
| Observability Platform Migration | 既存監視システムから現代的なObservabilityへ移行 | Level4_expert.md, migration-strategies.md            | migration-plan-template.md   | validate-skill.mjs               |
| Cost Optimization                | ストレージコストとカーディナリティの最適化      | Level4_expert.md, cost-optimization-strategies.md    | -                            | validate-metrics-cardinality.mjs |

## ベストプラクティス

### すべきこと

- **Four Golden Signals**: Latency, Traffic, Errors, Saturation を必ず監視
- **High Cardinality**: ラベルとタグで柔軟なクエリを可能にする（ただしカーディナリティ爆発に注意）
- **Sampling Strategy**: 分散トレースは適切なサンプリングレートを設定（head-based/tail-based）
- **Structured Logs**: JSON等の構造化形式で検索性を向上
- **SLI-driven**: ユーザー体験に基づいたSLIを定義し、SLOでビジネス目標を設定
- **Correlation IDs**: ログ、メトリクス、トレースを関連付けるIDを使用
- **Retention Policy**: コストと法的要件のバランスで保持期間を決定
- **Documentation**: メトリクス、ダッシュボード、アラートの意図を文書化

### 避けるべきこと

- **Metric Explosion**: 無制限なラベル値によるカーディナリティ爆発
- **Logging Everything**: 過度なログ出力によるコストとノイズの増大
- **100% Sampling**: すべてのトレースを記録するとパフォーマンスとコストに影響
- **Vanity Metrics**: ビジネス価値のない見栄えだけのメトリクス
- **Dashboard Overload**: 情報過多で読み取れないダッシュボード
- **SLO without Error Budget**: エラーバジェットなしのSLOは実効性がない
- **Vendor Lock-in**: OpenTelemetryなどのオープン標準を優先
- **Missing Context**: トレースやログに十分なコンテキスト情報がない

## リソース参照

### レベル別ガイド

- **Level 1 (基礎)**: `references/Level1_basics.md` - Observabilityの基本概念とThree Pillars
- **Level 2 (実務)**: `references/Level2_intermediate.md` - 実装パターンとツール選定
- **Level 3 (応用)**: `references/Level3_advanced.md` - 分散システムでの高度な設計
- **Level 4 (専門)**: `references/Level4_expert.md` - スケーラビリティとコスト最適化

### 領域別リソース

- **メトリクス設計**: `references/metrics-design-patterns.md`
- **分散トレーシング**: `references/distributed-tracing-guide.md`
- **ダッシュボード設計**: `references/dashboard-design-patterns.md`
- **SLI/SLO設計**: `references/sli-slo-design-guide.md`
- **ロギング戦略**: `references/logging-strategy-guide.md`
- **マイグレーション**: `references/migration-strategies.md`
- **コスト最適化**: `references/cost-optimization-strategies.md`

### スクリプト

```bash
# スキル構造の検証
node .claude/skills/observability-monitoring/scripts/validate-skill.mjs

# メトリクスカーディナリティの検証
node .claude/skills/observability-monitoring/scripts/validate-metrics-cardinality.mjs

# 使用記録の保存
node .claude/skills/observability-monitoring/scripts/log_usage.mjs \
  --result success \
  --phase "implementation" \
  --agent "observability-engineer"
```

### テンプレート

- **メトリクス設定**: `assets/metrics-config-template.yaml`
- **トレーシング設定**: `assets/tracing-config-template.yaml`
- **ダッシュボード**: `assets/dashboard-template.json`
- **SLI/SLO定義**: `assets/sli-slo-template.yaml`
- **ログスキーマ**: `assets/log-schema-template.json`
- **マイグレーション計画**: `assets/migration-plan-template.md`

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 初期実装。18-skills.md仕様に準拠した完全な構造実装 |
