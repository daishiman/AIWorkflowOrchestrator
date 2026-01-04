---
name: rate-limiting
description: |
  Rate Limitingとクォータ管理のベストプラクティスを提供するスキル。
  サーバー側のAPI保護とクライアント側の429対応の両方をカバーし、
  Token Bucket、Sliding Window等のアルゴリズム選定から実装までを支援。

  Anchors:
  • 『Designing Data-Intensive Applications』（Kleppmann）/ 適用: 分散システムのRate Limiting / 目的: スケーラブルな設計
  • 『API Design Patterns』（Geewax）/ 適用: API保護 / 目的: RESTful APIのベストプラクティス
  • RFC 6585 / 適用: 429 Too Many Requests / 目的: 標準準拠のレスポンス設計

  Trigger:
  Use when designing API rate limiting, implementing DoS protection, handling external API rate limits, or managing quota systems.
  rate limiting, rate limiter, throttling, 429, token bucket, sliding window, quota, api protection

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Rate Limiting

## 概要

Rate Limitingとクォータ管理のベストプラクティスを提供するスキル。サーバー側のAPI保護（DoS対策）とクライアント側の外部API対応の両面から、適切なアルゴリズム選定と実装パターンを支援します。

## ワークフロー

### Phase 1: 要件分析

**目的**: Rate Limitingの要件と適用範囲を明確化する

**アクション**:

1. 保護対象（API、エンドポイント、ユーザー種別）を特定
2. サーバー側保護かクライアント側対応かを判断
3. 制限粒度（IP、ユーザー、API Key）を決定

**Task**: `agents/analyze-requirements.md` を参照

### Phase 2: アルゴリズム選定

**目的**: 要件に適したRate Limitingアルゴリズムを選定する

**アクション**:

1. Token Bucket、Leaky Bucket、Sliding Window等を比較
2. バースト許容度、分散環境対応を考慮
3. ストレージ要件（Redis、メモリ）を検討

**Task**: `agents/select-algorithm.md` を参照

### Phase 3: 実装

**目的**: 選定したアルゴリズムを実装する

**アクション**:

1. Rate Limiterミドルウェアを実装
2. 適切なHTTPヘッダー（X-RateLimit-\*、Retry-After）を設定
3. クライアント側の429対応とExponential Backoffを実装

**Task**: `agents/implement-limiter.md` を参照

### Phase 4: 検証とモニタリング

**目的**: Rate Limitingの効果を検証しモニタリングを設定する

**アクション**:

1. 負荷テストでRate Limitingの動作を確認
2. レート制限のメトリクスを収集
3. アラート閾値を設定

**Task**: `agents/validate-limiter.md` を参照

## Task仕様ナビ

| Task                 | 起動タイミング | 入力               | 出力               |
| -------------------- | -------------- | ------------------ | ------------------ |
| analyze-requirements | Phase 1開始時  | システム要件       | 要件定義書         |
| select-algorithm     | Phase 2開始時  | 要件定義書         | アルゴリズム選定書 |
| implement-limiter    | Phase 3開始時  | アルゴリズム選定書 | Rate Limiter実装   |
| validate-limiter     | Phase 4開始時  | Rate Limiter実装   | 検証レポート       |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                             | 理由                               |
| ------------------------------------ | ---------------------------------- |
| X-RateLimit-\* ヘッダーを返す        | クライアントが残り回数を把握可能   |
| Retry-Afterヘッダーを429に含める     | クライアントが適切に待機可能       |
| Token BucketでバーストをGraceful許容 | 一時的なスパイクに柔軟対応         |
| Redisで分散環境のカウンターを共有    | 複数インスタンス間で一貫性確保     |
| Exponential Backoffで429をリトライ   | サーバー負荷を軽減しつつ成功率向上 |

### 避けるべきこと

| 禁止事項                         | 問題点                      |
| -------------------------------- | --------------------------- |
| 429エラーを即座にリトライ        | サーバー負荷増大、Ban対象に |
| Rate Limitヘッダーを無視         | 無駄なリクエストで制限到達  |
| 固定間隔でのリトライ             | サンダリングハード問題発生  |
| メモリ内カウンターのみ           | サーバー再起動でリセット    |
| エンドユーザーにレート制限を隠す | UX悪化、問い合わせ増加      |

## リソース参照

### references/（詳細知識）

| リソース         | パス                                                                       | 読込条件               |
| ---------------- | -------------------------------------------------------------------------- | ---------------------- |
| アルゴリズム比較 | [references/algorithms.md](references/algorithms.md)                       | アルゴリズム選定時     |
| サーバー実装     | [references/server-implementation.md](references/server-implementation.md) | サーバー側実装時       |
| クライアント対応 | [references/client-handling.md](references/client-handling.md)             | クライアント側実装時   |
| クォータ管理     | [references/quota-management.md](references/quota-management.md)           | クォータシステム設計時 |

### scripts/（決定論的処理）

| スクリプト                        | 機能                          |
| --------------------------------- | ----------------------------- |
| `scripts/simulate-rate-limit.mjs` | Rate Limitingシミュレーション |
| `scripts/log_usage.mjs`           | スキル使用履歴の記録          |

### assets/（テンプレート）

| アセット                          | 用途                         |
| --------------------------------- | ---------------------------- |
| `assets/rate-limiter-template.ts` | Rate Limiterミドルウェア雛形 |

## 変更履歴

| Version | Date       | Changes                                    |
| ------- | ---------- | ------------------------------------------ |
| 3.1.0   | 2026-01-02 | agents/追加（4エージェント体制確立）       |
| 3.0.0   | 2026-01-02 | 18-skills.md仕様完全準拠、Task仕様ナビ追加 |
| 1.1.0   | 2025-12-24 | 仕様整合                                   |
