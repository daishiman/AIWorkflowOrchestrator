---
name: graceful-shutdown
description: |
  アプリケーションの安全な終了処理を実装するスキル。
  シグナルハンドリング、リソースクリーンアップ、リクエストドレイニングを含む完全な終了フローを設計します。

  Anchors:
  • Release It! (Michael T. Nygard) / 適用: リソース管理・障害対応 / 目的: プロダクション環境での安全なシャットダウン
  • Node.js Design Patterns (Mario Casciaro) / 適用: 非同期処理の終了 / 目的: Promise/Stream/Workerの適切な終了

  Trigger:
  Use when implementing shutdown handlers, signal processing, or application lifecycle management.
  graceful shutdown, SIGTERM, SIGINT, cleanup, resource draining, process exit, signal handler
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# graceful-shutdown

## 概要

アプリケーションの安全な終了処理を実装するスキル。
シグナルハンドリング、リソースクリーンアップ、リクエストドレイニングを通じて、データ損失やリソースリークを防止する。

---

## ワークフロー

### Phase 1: 終了要件分析

**目的**: アプリケーションの特性から必要な終了処理を特定

**アクション**:

1. アプリケーションタイプ（Web/Worker/CLI/Desktop）を確認
2. 管理中のリソース（DB接続、ファイル、ネットワーク）を洗い出し
3. 実行中のタスク（リクエスト、ジョブ、処理）を特定
4. タイムアウト要件を定義
5. 必要なリソースレベル（Level 1-4）を判定

**Task**: `agents/analyze-shutdown-requirements.md` を参照

### Phase 2: シャットダウンフロー設計

**目的**: 適切な順序での終了処理シーケンスを設計

**アクション**:

1. `references/shutdown-patterns.md` で適用パターンを選択
2. シグナルハンドラーの実装方針を決定
3. リソースクリーンアップの優先順位を定義
4. タイムアウト処理とフォールバックを設計
5. `assets/shutdown-handler-template.ts` をベースに実装

**Task**: `agents/design-shutdown-flow.md` を参照

### Phase 3: 実装と検証

**目的**: 終了処理の実装と動作検証

**アクション**:

1. シグナルハンドラーを実装
2. リソースクリーンアップロジックを実装
3. `scripts/validate-shutdown.mjs` で検証
4. `scripts/test-shutdown-signals.sh` で動作確認
5. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/implement-validate.md` を参照

---

## Task仕様ナビ

| Task                          | 起動タイミング | 入力                       | 出力                       |
| ----------------------------- | -------------- | -------------------------- | -------------------------- |
| analyze-shutdown-requirements | Phase 1開始時  | アプリケーション仕様       | 終了要件定義               |
| design-shutdown-flow          | Phase 2開始時  | 終了要件定義               | シャットダウンフロー設計書 |
| implement-validate            | Phase 3開始時  | シャットダウンフロー設計書 | 実装コードと検証結果       |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項               | 理由                                        |
| ---------------------- | ------------------------------------------- |
| 複数シグナルをハンドル | SIGTERM/SIGINT両方に対応（Ctrl+Cとk8s対応） |
| べき等なクリーンアップ | 複数回呼ばれても安全                        |
| タイムアウト設定       | 無限待機を防ぐ（推奨: 30秒）                |
| エラーをログに記録     | 終了時のエラーを見逃さない                  |
| プロセス終了コード明示 | 正常終了0、エラー終了1                      |
| リソース解放の順序制御 | 依存関係を考慮（接続→ファイル→キャッシュ）  |
| 新規リクエスト拒否     | シャットダウン開始後は503を返す             |

### 避けるべきこと

| 回避事項                       | 理由                                   |
| ------------------------------ | -------------------------------------- |
| process.exit() 直接呼び出し    | クリーンアップが実行されない           |
| 同期的な無限待機               | デッドロックの原因                     |
| シグナルハンドラー内の重い処理 | タイムアウトでKILLされる               |
| エラー時の即座終了             | 部分的なクリーンアップで状態が不整合に |
| Promise未解決のまま終了        | データ損失の原因                       |

---

## リソース参照

### 知識階層（Progressive Disclosure）

実装に必要な深さに応じて参照：

| レベル          | 対象者                     | 参照ファイル                        |
| --------------- | -------------------------- | ----------------------------------- |
| Level 1: 基礎   | 初めて実装する開発者       | `references/Level1_basics.md`       |
| Level 2: 中級   | 基本実装済み、改善を検討   | `references/Level2_intermediate.md` |
| Level 3: 上級   | 複雑なシステムでの実装     | `references/Level3_advanced.md`     |
| Level 4: 専門家 | 分散システム・高可用性対応 | `references/Level4_expert.md`       |

### パターンとガイド

- **シャットダウンパターン**: [references/shutdown-patterns.md](references/shutdown-patterns.md)
  - Simple Shutdown（単純終了）
  - Graceful Drain（段階的排出）
  - Resource Cascade（リソースカスケード）
  - Timeout Fallback（タイムアウトフォールバック）

- **環境別実装**: [references/environment-specific.md](references/environment-specific.md)
  - Node.js/Deno/Bun
  - Docker/Kubernetes
  - Electron/Tauri
  - Systemd/PM2

- **テスト戦略**: [references/testing-guide.md](references/testing-guide.md)
  - シグナル送信テスト
  - タイムアウト検証
  - リソースリーク検出

---

## スクリプト

### 検証スクリプト

- `scripts/validate-shutdown.mjs`: シャットダウン実装の静的解析
  - 必須要素の存在確認
  - タイムアウト設定チェック
  - べき等性検証

- `scripts/test-shutdown-signals.sh`: シグナルハンドリングのE2Eテスト
  - SIGTERM/SIGINT送信
  - タイムアウト動作確認
  - リソースクリーンアップ検証

### 使用記録

- `scripts/log_usage.mjs`: 標準使用ログスクリプト
  ```bash
  node .claude/skills/graceful-shutdown/scripts/log_usage.mjs \
    --result success \
    --phase "Phase 3" \
    --agent "implement-validate"
  ```

---

## アセット

### テンプレート

- `assets/shutdown-handler-template.ts`: Node.js/TypeScript用シャットダウンハンドラー
- `assets/shutdown-handler-python.py`: Python用シャットダウンハンドラー
- `assets/docker-shutdown-script.sh`: Dockerエントリーポイント用

### チェックリスト

- `assets/shutdown-checklist.md`: 実装確認チェックリスト

---

## 依存関係

このスキルは独立して使用可能。以下のスキルと組み合わせると効果的：

- `error-handling`: エラー処理との統合
- `logging-observability`: 終了ログの設計
- `health-check-implementation`: ヘルスチェックとの連携

---

## メトリクス目標

Level 1到達条件（EVALS.json参照）:

- 基本的なシグナルハンドリング実装: 3回成功
- リソースクリーンアップ実装: 3回成功
- 成功率: 80%以上

---

## バージョン

- 作成日: 2025-12-31
- バージョン: 1.0.0
- 最終更新: 2025-12-31
