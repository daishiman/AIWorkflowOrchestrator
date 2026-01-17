---
name: error-handling-patterns
description: |
  エラーハンドリングの設計・実装パターンスキル。
  エラー分類、リトライ戦略、サーキットブレーカー、ユーザー向けメッセージ設計を提供。

  Anchors:
  - Release It! (Michael Nygard) / 適用: 本番環境の安定性パターン / 目的: リトライ・サーキットブレーカー設計
  - Designing Data-Intensive Applications (Kleppmann) / 適用: 分散システムのエラー処理 / 目的: 冪等性・一貫性保証

  Trigger:
  Use when implementing error handling, retry logic, circuit breaker, error messages, error classification, or resilience patterns.
  error handling, retry, circuit breaker, resilience, fault tolerance, error codes, error messages
allowed-tools:
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - Bash
  - Task
---

# Error Handling Patterns

## 概要

エラーハンドリングの設計・実装パターンスキル。
エラー分類、リトライ戦略、サーキットブレーカー、ユーザー向けメッセージ設計を提供し、本番環境での堅牢性を確保する。

## ワークフロー

### Phase 1: エラーシナリオ分析

**目的**: エラー発生箇所とエラー種別を特定する

**アクション**:

1. システムのエラー発生ポイントを洗い出す
2. エラーを分類（Validation/Business/External/Infrastructure/Internal）
3. リトライ可否を判定
4. 必要なリソースを特定

**Task**: `agents/analyze-errors.md` を参照

### Phase 2: エラーハンドリング実装

**目的**: 適切なエラーハンドリングパターンを実装する

**アクション**:

1. エラーコードとメッセージを定義
2. リトライロジックを実装
3. サーキットブレーカーを設定（必要時）
4. ユーザー向けメッセージを作成

**Task**: `agents/implement-error-handling.md` を参照

### Phase 3: 検証と記録

**目的**: エラーハンドリングの動作確認と使用記録の保存

**アクション**:

1. エラーシナリオのテストを実施
2. `scripts/validate-error-handling.mjs` で検証
3. `scripts/log_usage.mjs` で記録を保存

**Task**: `agents/validate-error-handling.md` を参照

## Task仕様ナビ

| Task                     | 起動タイミング | 入力                   | 出力                   |
| ------------------------ | -------------- | ---------------------- | ---------------------- |
| analyze-errors           | Phase 1開始時  | システム仕様・要件     | エラーシナリオ分析     |
| implement-error-handling | Phase 2開始時  | エラーシナリオ分析     | エラーハンドリング実装 |
| validate-error-handling  | Phase 3開始時  | エラーハンドリング実装 | 検証結果レポート       |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

- エラーを明確に分類（リトライ可否・ログレベル判断が容易に）
- エラーコードを標準化（一貫性のあるハンドリング）
- 原因エラーを保持（cause）でデバッグ向上
- リトライに指数バックオフとジッターを適用
- ユーザー向けメッセージと技術的メッセージを分離
- サーキットブレーカーで連鎖的障害を防止

### 避けるべきこと

- すべてのエラーをリトライ（クライアントエラーは修正が必要）
- エラーを握りつぶす（問題の特定が困難に）
- 機密情報をエラーメッセージに含める
- スタックトレースを常にユーザーに表示
- 無限リトライ（リソース枯渇）

## エラー分類早見表

| カテゴリ       | エラーコード | リトライ | HTTPステータス |
| -------------- | ------------ | -------- | -------------- |
| Validation     | 1000-1999    | 不可     | 400/422        |
| Business       | 2000-2999    | 不可     | 403/404/409    |
| External       | 3000-3999    | 可能     | 502/503/504    |
| Infrastructure | 4000-4999    | 可能     | 500/503        |
| Internal       | 5000-5999    | 不可     | 500            |

## リソース参照

### agents/（Task仕様書）

| Task       | パス                                                                         | 用途                   |
| ---------- | ---------------------------------------------------------------------------- | ---------------------- |
| エラー分析 | See [agents/analyze-errors.md](agents/analyze-errors.md)                     | エラーシナリオ分析     |
| 実装       | See [agents/implement-error-handling.md](agents/implement-error-handling.md) | エラーハンドリング実装 |
| 検証       | See [agents/validate-error-handling.md](agents/validate-error-handling.md)   | 動作検証               |

### references/（詳細知識）

| リソース             | パス                                                                         | 用途                     |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| エラー分類           | See [references/error-classification.md](references/error-classification.md) | エラーカテゴリと判定     |
| リトライ戦略         | See [references/retry-strategies.md](references/retry-strategies.md)         | 指数バックオフ・ジッター |
| サーキットブレーカー | See [references/circuit-breaker.md](references/circuit-breaker.md)           | 状態遷移・設定           |
| メッセージ設計       | See [references/error-messages.md](references/error-messages.md)             | ユーザー向けメッセージ   |

### scripts/（決定論的処理）

| スクリプト                    | 用途                   | 使用例                                        |
| ----------------------------- | ---------------------- | --------------------------------------------- |
| `validate-error-handling.mjs` | エラーハンドリング検証 | `node scripts/validate-error-handling.mjs`    |
| `log_usage.mjs`               | フィードバック記録     | `node scripts/log_usage.mjs --result success` |

### assets/（テンプレート）

| テンプレート                  | 用途                     |
| ----------------------------- | ------------------------ |
| `error-handler-template.ts`   | エラーハンドラー実装     |
| `retry-policy-template.ts`    | リトライポリシー設定     |
| `circuit-breaker-template.ts` | サーキットブレーカー設定 |
| `error-response-template.ts`  | エラーレスポンス形式     |

## 変更履歴

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 2.0.0   | 2026-01-01 | references統合、assets追加、18-skills.md仕様完全準拠 |
| 1.0.0   | 2025-12-31 | 初版作成                                             |
