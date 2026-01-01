---
name: retry-strategies
description: |
  Design and implement retry mechanisms, circuit breakers, and resilience patterns for external API calls and distributed systems. Covers exponential backoff, bulkhead patterns, timeout strategies, and failure handling.

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: エラーハンドリング設計・実用的な回復戦略 / 目的: 実践的な改善アプローチの適用
  • Resilience patterns from distributed systems / 適用: Circuit Breaker・Bulkhead・Timeout設計 / 目的: システムの耐障害性確保

  Trigger:
  Use when implementing retry logic, circuit breakers, API resilience patterns, handling transient failures, designing timeout strategies, or preventing cascading failures in distributed systems.
  Keywords: retry, backoff, circuit breaker, bulkhead, timeout, resilience, failure handling, API errors, transient failures, rate limiting
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Retry Strategies

## 概要

Design and implement resilient retry mechanisms and failure handling patterns for distributed systems. This skill provides expertise in circuit breakers, exponential backoff, bulkhead patterns, and timeout strategies to handle transient failures in external API calls.

## ワークフロー

本スキルは3つのTaskで構成されます。各Taskは独立したコンテキストで実行され、入出力を明確に定義します。

### Phase 1: Requirements Analysis

**Task**: `agents/analyze-requirements.md`

**目的**: Analyze the system context and determine appropriate resilience patterns

**入力**:

- System architecture description
- API dependencies and SLAs
- Current failure patterns (if any)
- Performance requirements

**出力**:

- Recommended resilience patterns
- Configuration parameters (retry counts, timeouts, thresholds)
- Risk assessment and trade-offs

**実行タイミング**: プロジェクト開始時、既存システムの改善時

### Phase 2: Strategy Implementation

**Task**: `agents/implement-strategy.md`

**目的**: Implement the selected resilience patterns with proper configuration

**入力**:

- Phase 1の推奨パターンと設定
- Target codebase and technology stack
- Integration points

**出力**:

- Implementation code (retry logic, circuit breaker, etc.)
- Configuration files
- Unit test cases

**実行タイミング**: 要件分析完了後

### Phase 3: Validation and Monitoring

**Task**: `agents/validate-results.md`

**目的**: Validate implementation and establish monitoring

**入力**:

- Phase 2の実装コード
- Test scenarios
- Production metrics requirements

**出力**:

- Test results and validation report
- Monitoring setup recommendations
- Usage log entry

**実行タイミング**: 実装完了後、本番デプロイ前

## ベストプラクティス

### すべきこと

- 適切なパターンを選択する前に `references/Level1_basics.md` で基礎を確認
- 実装前に `references/Level2_intermediate.md` で実務手順を整理
- Exponential backoffを使用し、固定間隔リトライを避ける
- Circuit breakerで障害の連鎖を防ぐ
- タイムアウト値は測定に基づいて設定する

### 避けるべきこと

- 無限リトライの実装（必ず上限を設ける）
- 即座のリトライ（バックオフなし）
- エラーの種類を区別しない一律のリトライ
- モニタリングなしでの本番投入

## リソース

### Knowledge References

Progressive Disclosureに従い、必要時のみ参照してください。

**基礎知識** (Phase 1で参照):

- **Level 1 Basics**: See [references/Level1_basics.md](references/Level1_basics.md) - スキルの適用範囲と基本概念
- **Level 2 Intermediate**: See [references/Level2_intermediate.md](references/Level2_intermediate.md) - 実務手順と判断基準

**詳細知識** (Phase 2で必要に応じて参照):

- **Exponential Backoff**: See [references/exponential-backoff.md](references/exponential-backoff.md) - バックオフアルゴリズムの実装詳細
- **Circuit Breaker**: See [references/circuit-breaker.md](references/circuit-breaker.md) - 状態遷移としきい値設定
- **Bulkhead Pattern**: See [references/bulkhead-pattern.md](references/bulkhead-pattern.md) - リソース分離パターン
- **Timeout Strategies**: See [references/timeout-strategies.md](references/timeout-strategies.md) - タイムアウト設計ガイド

**高度な知識** (複雑なケースで参照):

- **Level 3 Advanced**: See [references/Level3_advanced.md](references/Level3_advanced.md) - 応用パターンと組み合わせ
- **Level 4 Expert**: See [references/Level4_expert.md](references/Level4_expert.md) - エッジケースと最適化

### Scripts

- `scripts/analyze-retry-config.mjs`: Analyze retry configuration for issues and recommendations
- `scripts/validate-skill.mjs`: Validate skill structure compliance
- `scripts/log_usage.mjs`: Record skill usage and update metrics

### Assets

- `assets/circuit-breaker-template.ts`: TypeScript circuit breaker implementation template
- `assets/retry-wrapper-template.ts`: Reusable retry wrapper with exponential backoff

## 変更履歴

| Version | Date       | Changes                                             |
| ------- | ---------- | --------------------------------------------------- |
| 1.1.0   | 2025-12-31 | Updated to 18-skills.md spec with agents/ and EVALS |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added         |
