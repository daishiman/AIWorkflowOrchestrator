---
name: graceful-shutdown
description: |
  アプリケーションの安全な終了処理を実装するスキル。シグナルハンドリング、リソースクリーンアップ、リクエストドレイニングを含む完全な終了フローを設計。

  Anchors:
  • Release It! (Michael T. Nygard) / 適用: リソース管理・障害対応 / 目的: プロダクション環境での安全なシャットダウン
  • Node.js Design Patterns (Mario Casciaro) / 適用: 非同期処理の終了 / 目的: Promise/Stream/Workerの適切な終了

  Trigger:
  Use when implementing shutdown handlers, signal processing, resource cleanup, request draining, or application lifecycle management.
  graceful shutdown, SIGTERM, SIGINT, cleanup, resource draining, process exit, signal handler
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# graceful-shutdown

## 概要

アプリケーションの安全な終了処理を実装するスキル。シグナルハンドリング、リソースクリーンアップ、リクエストドレイニングを通じて、データ損失やリソースリークを防止する。

## ワークフロー

### Phase 1: 終了要件分析

**目的**: アプリケーションの特性から必要な終了処理を特定

**アクション**:

1. アプリケーションタイプ（Web/Worker/CLI/Desktop）を確認
2. 管理中のリソース（DB接続、ファイル、ネットワーク）を洗い出し
3. 実行中のタスク（リクエスト、ジョブ、処理）を特定
4. タイムアウト要件を定義

**Task**: `agents/analyze-shutdown-requirements.md` を参照

### Phase 2: シャットダウンフロー設計

**目的**: 適切な順序での終了処理シーケンスを設計

**アクション**:

1. `references/shutdown-patterns.md` で適用パターンを選択
2. シグナルハンドラーの実装方針を決定
3. リソースクリーンアップの優先順位を定義
4. タイムアウト処理とフォールバックを設計

**Task**: `agents/design-shutdown-flow.md` を参照

### Phase 3: 実装と検証

**目的**: 終了処理の実装と動作検証

**アクション**:

1. シグナルハンドラーを実装
2. リソースクリーンアップロジックを実装
3. テスト用スクリプトで動作確認
4. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/implement-validate.md` を参照

## Task仕様ナビ

| Task                          | 起動タイミング | 入力                 | 出力                       |
| ----------------------------- | -------------- | -------------------- | -------------------------- |
| analyze-shutdown-requirements | Phase 1開始時  | アプリケーション仕様 | 終了要件定義               |
| design-shutdown-flow          | Phase 2開始時  | 終了要件定義         | シャットダウンフロー設計書 |
| implement-validate            | Phase 3開始時  | 設計書               | 実装コードと検証結果       |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- 複数シグナルをハンドル（SIGTERM/SIGINT両方に対応）
- べき等なクリーンアップ（複数回呼ばれても安全）
- タイムアウト設定（推奨: 30秒）
- エラーをログに記録
- プロセス終了コード明示（正常0、エラー1）
- リソース解放の順序制御（接続→ファイル→キャッシュ）
- 新規リクエスト拒否（シャットダウン開始後は503を返す）

### 避けるべきこと

- process.exit() 直接呼び出し（クリーンアップが実行されない）
- 同期的な無限待機（デッドロックの原因）
- シグナルハンドラー内の重い処理（タイムアウトでKILLされる）
- エラー時の即座終了（部分的なクリーンアップで状態が不整合に）
- Promise未解決のまま終了（データ損失の原因）

## リソース参照

### references/（詳細知識）

| リソース     | パス                                                                         | 内容            |
| ------------ | ---------------------------------------------------------------------------- | --------------- |
| 基礎知識     | See [references/basics.md](references/basics.md)                             | 概念とシグナル  |
| パターン集   | See [references/shutdown-patterns.md](references/shutdown-patterns.md)       | 終了パターン4種 |
| 環境別実装   | See [references/environment-specific.md](references/environment-specific.md) | Node/Docker/k8s |
| テストガイド | See [references/testing-guide.md](references/testing-guide.md)               | テスト手法      |

### scripts/（決定論的処理）

| スクリプト              | 用途               | 使用例                                               |
| ----------------------- | ------------------ | ---------------------------------------------------- |
| `validate-shutdown.mjs` | 実装検証           | `node scripts/validate-shutdown.mjs src/shutdown.ts` |
| `log_usage.mjs`         | フィードバック記録 | `node scripts/log_usage.mjs --result success`        |

### assets/（テンプレート）

| テンプレート          | 用途                           |
| --------------------- | ------------------------------ |
| `shutdown-handler.ts` | Node.js/TypeScript用ハンドラー |

## 変更履歴

| Version | Date       | Changes                              |
| ------- | ---------- | ------------------------------------ |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様完全準拠、構造再編成 |
| 1.0.0   | 2025-12-31 | 初版                                 |
