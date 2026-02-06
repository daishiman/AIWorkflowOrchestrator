---
id: DEBT-SEC-001
tier: 1
title: State parameter検証実装（CSRF対策）
phase: 0
depends_on: []
parallel_with: [DEBT-SEC-002, DEBT-SEC-003]
blocks: []
status: pending
priority: medium
estimated_complexity: small
tags: [security, auth, oauth, csrf, electron, main-process]
issue_number: 279
created_at: 2026-02-05
---

# DEBT-SEC-001: State parameter検証実装（CSRF対策） - メインタスク仕様書

## 概要

OAuth認証フローにState parameter検証を実装し、CSRF攻撃を防止する。RFC 6749推奨のセキュリティベストプラクティスに準拠し、認証開始時にランダムなstateパラメータを生成、コールバック受信時にそれを検証することで、偽の認証コールバックによる不正ログインを防ぐ。

## 目的

- OAuth認証開始時にランダムなstateパラメータを生成し、メモリに一時保存
- コールバック受信時にstateパラメータを検証し、不正な場合はトークンを拒否
- ユーザーに分かりやすいエラーメッセージを表示
- RFC 6749 Section 10.12のCSRF対策に準拠

## 背景

ログイン機能復旧プロジェクト（2025-12-22完了）の最終レビューゲート（Phase 7）で、`.claude/agents/sec-auditor.md`と`.claude/agents/electron-security.md`がCSRF攻撃対策としてState parameter検証が未実装であることを指摘した。

### 現在の実装状態

| 項目                    | 状態        | 説明                                                |
| ----------------------- | ----------- | --------------------------------------------------- |
| カスタムプロトコル      | ✅ 実装済み | `aiworkflow://auth/callback` で認証コールバック受信 |
| Refresh Token暗号化     | ✅ 実装済み | safeStorage.encryptString()で暗号化後保存           |
| Access Tokenメモリ保持  | ✅ 実装済み | Zustand storeでメモリ上のみ保持                     |
| **State parameter検証** | ❌ 未実装   | **CSRF攻撃リスクが残存**                            |

### 攻撃シナリオ

1. 攻撃者が偽の認証コールバックURLを生成: `aiworkflow://auth/callback#access_token=malicious_token`
2. ソーシャルエンジニアリングでユーザーを誘導してそのURLを開かせる
3. アプリが検証なしでトークンを受け入れる
4. 攻撃者のアカウントでログインしてしまう（CSRF攻撃成功）

## スコープ

### 対象

- StateManagerモジュールの新規作成（state生成・保存・検証ロジック）
- authHandlers.ts修正（OAuth認証開始時のstate生成・送信）
- index.ts修正（コールバック受信時のstate検証）
- ユニットテスト追加（StateManager）
- 手動テスト（実際のOAuth認証で検証）
- セキュリティガイドライン更新

### 対象外

- PKCE実装（DEBT-SEC-002として別タスク）
- カスタムプロトコルURL詳細検証（DEBT-SEC-003として別タスク）
- セッション管理の改善（別タスク）

---

## Phase構成

| Phase | 名称                 | 目的                             | ステータス | ドキュメント                                               |
| ----- | -------------------- | -------------------------------- | ---------- | ---------------------------------------------------------- |
| 1     | 要件定義             | 目的・スコープ・受け入れ基準定義 | 未着手     | [phase-01-requirements.md](./phase-01-requirements.md)     |
| 2     | 設計                 | アーキテクチャ・詳細設計         | 未着手     | [phase-02-design.md](./phase-02-design.md)                 |
| 3     | 設計レビューゲート   | 要件・設計の妥当性検証           | 未着手     | [phase-03-design-review.md](./phase-03-design-review.md)   |
| 4     | テスト作成           | TDD: Red（失敗するテスト作成）   | 未着手     | [phase-04-test-creation.md](./phase-04-test-creation.md)   |
| 5     | 実装                 | TDD: Green（テストを通す実装）   | 未着手     | [phase-05-implementation.md](./phase-05-implementation.md) |
| 6     | テスト拡充           | カバレッジ目標達成               | 未着手     | [phase-06-test-expansion.md](./phase-06-test-expansion.md) |
| 7     | テストカバレッジ確認 | カバレッジ目標検証               | 未着手     | [phase-07-coverage.md](./phase-07-coverage.md)             |
| 8     | リファクタリング     | TDD: Refactor（品質改善）        | 未着手     | [phase-08-refactoring.md](./phase-08-refactoring.md)       |
| 9     | 品質保証             | 静的解析・セキュリティ           | 未着手     | [phase-09-quality.md](./phase-09-quality.md)               |
| 10    | 最終レビューゲート   | 全体品質・整合性検証             | 未着手     | [phase-10-final-review.md](./phase-10-final-review.md)     |
| 11    | 手動テスト検証       | 実環境動作確認                   | 未着手     | [phase-11-manual-test.md](./phase-11-manual-test.md)       |
| 12    | ドキュメント更新     | ドキュメント更新・仕様反映       | 未着手     | [phase-12-documentation.md](./phase-12-documentation.md)   |
| 13    | PR作成               | コミット・PR・CI確認             | 未着手     | [phase-13-pr-creation.md](./phase-13-pr-creation.md)       |

---

## 成果物一覧

| 成果物                                                      | Phase | 説明                         | ステータス |
| ----------------------------------------------------------- | ----- | ---------------------------- | ---------- |
| `apps/desktop/src/main/infrastructure/stateManager.ts`      | 5     | StateManagerモジュール       | 未着手     |
| `apps/desktop/src/main/infrastructure/stateManager.test.ts` | 4, 6  | StateManager単体テスト       | 未着手     |
| `apps/desktop/src/main/ipc/authHandlers.ts`                 | 5     | state生成追加                | 未着手     |
| `apps/desktop/src/main/index.ts`                            | 5     | state検証追加                | 未着手     |
| `docs/00-requirements/17-security-guidelines.md`            | 12    | セキュリティガイドライン更新 | 未着手     |
| `outputs/phase-11/manual-test-result.md`                    | 11    | 手動テスト結果               | 未着手     |
| `outputs/phase-12/implementation-guide.md`                  | 12    | 実装ガイド                   | 未着手     |
| `outputs/phase-12/documentation-changelog.md`               | 12    | ドキュメント更新履歴         | 未着手     |
| `outputs/phase-12/unassigned-task-detection.md`             | 12    | 未タスク検出レポート         | 未着手     |

---

## 依存関係

### 前提タスク

| タスクID | タイトル           | 依存内容         | ステータス |
| -------- | ------------------ | ---------------- | ---------- |
| T-04-1   | AuthGuard実装      | 認証基盤         | 完了       |
| T-06-1   | 品質保証           | テスト基盤       | 完了       |
| T-07-1   | 最終レビューゲート | セキュリティ指摘 | 完了       |

### 同時実施可能タスク

| タスクID      | タイトル    |
| ------------- | ----------- |
| DEBT-SEC-002  | PKCE実装    |
| DEBT-SEC-003  | URL詳細検証 |
| DEBT-CODE-001 | 構造化ログ  |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                              | 内容                           |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| 認証アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | Supabase + Electron認証設計    |
| セキュリティ設計原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | OAuth/CSRF対策設計原則         |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Electron IPC・プロトコル安全性 |
| セキュリティ運用     | `.claude/skills/aiworkflow-requirements/references/security-operations.md`        | ログ・監査・チェックリスト     |
| 入力バリデーション   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`  | バリデーション原則             |
| IPC認証チャネル      | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | 認証IPC通信仕様                |

### 関連ファイル

| ファイル                                            | 説明                             |
| --------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`         | 認証IPCハンドラー                |
| `apps/desktop/src/main/index.ts`                    | カスタムプロトコル・コールバック |
| `apps/desktop/src/main/infrastructure/`             | インフラモジュール群             |
| `apps/desktop/src/main/auth/oauth-error-handler.ts` | OAuthエラーハンドラー            |

### 実装課題と解決策（TASK-FIX-GOOGLE-LOGIN-001からの学び）

| 課題                                    | 原因                                                        | 解決策                                                                              |
| --------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| URLフラグメントからのパラメータ抽出失敗 | OAuth Implicit Flowでは`?`ではなく`#`でパラメータが返される | `url.hash`から`URLSearchParams`でパース（`new URLSearchParams(url.hash.slice(1))`） |
| Zustandリスナーの二重登録               | React StrictModeでuseEffectが2回実行される                  | モジュールスコープの`let authListenerRegistered = false`フラグでガード              |
| IPC経由でエラー情報がRenderer届かない   | AUTH_STATE_CHANGEDペイロードにerror情報が含まれていなかった | ペイロードに`error`, `errorCode`フィールドを追加                                    |

---

## 完了条件（全Phase完了時）

### 機能要件

- [ ] StateManager実装完了（state生成・検証・有効期限・ワンタイムユース）
- [ ] OAuth認証開始時にstateパラメータが生成される
- [ ] コールバック受信時にstateパラメータが検証される
- [ ] 不正なstate時にエラーメッセージが表示される

### 品質要件

- [ ] 全ユニットテスト成功（6テストケース以上）
- [ ] テストカバレッジ80%以上（StateManager）
- [ ] 全手動テスト成功（5テストケース）
- [ ] TypeScriptエラーゼロ
- [ ] ESLintエラーゼロ

### ドキュメント要件

- [ ] セキュリティガイドライン更新完了
- [ ] 実装ガイド（Part 1/Part 2）作成完了
- [ ] 未タスク検出レポート出力完了

---

## リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                   |
| ----------------------------------- | ------ | -------- | -------------------------------------- |
| Supabaseがstate送信をサポートしない | High   | Low      | ドキュメント確認、必要に応じて代替実装 |
| コールバックURLにstateが含まれない  | Medium | Low      | Supabaseの実装確認、手動テストで検証   |
| プロバイダー判定ロジックが不正確    | Low    | Medium   | detectProvider()の精度向上             |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-05 | 初版作成 |
