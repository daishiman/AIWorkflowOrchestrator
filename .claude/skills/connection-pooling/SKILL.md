---
name: connection-pooling
description: |
  データベース接続プール設計と運用を支援するスキル。
  サーバーレス環境やTursoの接続制約を踏まえたサイジングと検証手順を整理する。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）/ 適用: 実践的改善 / 目的: 接続管理の品質維持

  Trigger:
  Use when designing connection pools, sizing database connections, or troubleshooting serverless connection limits.
  connection pooling, database connections, pool sizing, serverless connections, Turso
---
# connection-pooling

## 概要

データベース接続プールを設計し、負荷と制約に応じた接続管理を行う。

## ワークフロー

### Phase 1: 要件整理

**目的**: 目的・負荷・制約を明確化する。

**アクション**:

1. 想定トラフィックと同時実行を整理する。
2. 接続上限と制約を整理する。
3. 成功条件と監視指標を整理する。

**Task**: `agents/analyze-pooling-requirements.md` を参照

### Phase 2: 制約分析

**目的**: サーバーレス/Tursoの制約を整理する。

**アクション**:

1. サーバーレス制約と運用前提を確認する。
2. 監視項目と警戒値を整理する。
3. リスクと回避策を整理する。

**Task**: `agents/analyze-turso-constraints.md` を参照

### Phase 3: 設計

**目的**: 接続プール構成と検証方針を定義する。

**アクション**:

1. プール構成とサイズを設計する。
2. タイムアウトとリトライ方針を設計する。
3. 検証手順と監視項目を整理する。

**Task**: `agents/design-pooling-configuration.md` を参照

### Phase 4: 検証と記録

**目的**: 設定を検証し記録を更新する。

**アクション**:

1. `scripts/validate-skill.mjs` で構造を検証する。
2. `scripts/check-connections.mjs` で設定を検証する。
3. `scripts/log_usage.mjs` で記録を更新する。

**Task**: `agents/validate-pooling-setup.md` を参照

## Task仕様ナビ

| Task | 起動タイミング | 入力 | 出力 |
| --- | --- | --- | --- |
| analyze-pooling-requirements | Phase 1開始時 | 目的/負荷 | 要件整理メモ、成功条件一覧 |
| analyze-turso-constraints | Phase 2開始時 | 制約/環境 | 制約整理メモ、回避策一覧 |
| design-pooling-configuration | Phase 3開始時 | 要件整理メモ | 接続プール設計書、検証ガイド |
| validate-pooling-setup | Phase 4開始時 | 接続プール設計書 | 検証レポート、ログ更新内容 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項 | 理由 |
| --- | --- |
| 負荷前提を明文化する | サイジング根拠を残すため |
| サーバーレス制約を整理する | 接続枯渇を防ぐため |
| エラーハンドリングを設計する | 障害時の復旧を容易にするため |
| テンプレートを参照する | 設定漏れを防ぐため |

### 避けるべきこと

| 禁止事項 | 問題点 |
| --- | --- |
| 制約を無視した設定 | 接続枯渇が発生する |
| 監視なしで運用する | 異常検知が遅れる |
| タイムアウトを省略する | 復旧が遅れる |

## リソース参照

### scripts/（決定論的処理）

| スクリプト | 機能 |
| --- | --- |
| `scripts/check-connections.mjs` | 接続設定の検証 |
| `scripts/validate-skill.mjs` | スキル構造の検証 |
| `scripts/log_usage.mjs` | 使用記録と評価メトリクス更新 |

### references/（詳細知識）

| リソース | パス | 読込条件 |
| --- | --- | --- |
| レベル1 基礎 | [references/Level1_basics.md](references/Level1_basics.md) | 初回整理時 |
| レベル2 実務 | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 設計時 |
| レベル3 応用 | [references/Level3_advanced.md](references/Level3_advanced.md) | 詳細設計時 |
| レベル4 専門 | [references/Level4_expert.md](references/Level4_expert.md) | 改善ループ時 |
| エラーハンドリング | [references/error-handling.md](references/error-handling.md) | 障害対策時 |
| サイジングガイド | [references/pool-sizing-guide.md](references/pool-sizing-guide.md) | サイジング時 |
| サーバーレス接続 | [references/serverless-connections.md](references/serverless-connections.md) | サーバーレス運用時 |
| 旧スキル | [references/legacy-skill.md](references/legacy-skill.md) | 互換確認時 |
| 要件索引 | [references/requirements-index.md](references/requirements-index.md) | 要件整理時 |

### assets/（テンプレート・素材）

| アセット | 用途 |
| --- | --- |
| `assets/drizzle-config-template.ts` | 接続プール設定テンプレート |

### 運用ファイル

| ファイル | 目的 |
| --- | --- |
| `EVALS.json` | レベル評価・メトリクス管理 |
| `LOGS.md` | 実行ログの蓄積 |
| `CHANGELOG.md` | 改善履歴の記録 |
