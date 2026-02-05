# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 3                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

実装開始前にTokenRefreshSchedulerの設計・IPC連携フロー・状態管理設計の妥当性を検証する。

## 判定基準

| 判定  | 条件             | 対応                         |
| ----- | ---------------- | ---------------------------- |
| PASS  | 全観点で問題なし | Phase 4へ進行                |
| MINOR | 軽微な指摘あり   | 指摘対応後Phase 4へ進行      |
| MAJOR | 重大な問題あり   | 影響範囲に応じて戻り先を決定 |

## 参照資料

| 資料名               | パス                                                                           | 説明                     |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                   | Phase 1成果物            |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1成果物            |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`                                       | Phase 2成果物            |
| インターフェース定義 | `outputs/phase-2/interface-definition.md`                                      | Phase 2成果物            |
| シーケンス図         | `outputs/phase-2/sequence-diagrams.md`                                         | Phase 2成果物            |
| レビューゲート基準   | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準・戻り先ロジック |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                              |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | OAuth 2.0 PKCE、トークン暗号化、safeStorage設計   |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 層分離設計、IPC通信パターン、Zustand状態管理      |
| APIエンドポイント    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | auth:refresh IPCチャネル仕様                      |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | AuthSession、AuthState型定義                      |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | リトライ戦略、エラーコード分類                    |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC通信パターン、Callback DI、safeStorageパターン |

## レビュー観点

### 1. セキュリティレビュー

| チェック項目                                     | 期待結果                             | 判定 |
| ------------------------------------------------ | ------------------------------------ | ---- |
| トークンがRendererプロセスに露出しないこと       | sessionExpiresAtのみ。トークン非送信 |      |
| IPC通信がwithValidation()で保護されていること    | auth:refreshハンドラーに適用         |      |
| SecureStorageによる暗号化保存が維持されること    | safeStorage.encryptString()使用      |      |
| リフレッシュ結果のログにトークンが含まれないこと | expiresAtのみログ出力                |      |

### 2. アーキテクチャレビュー

| チェック項目                                     | 期待結果                             | 判定 |
| ------------------------------------------------ | ------------------------------------ | ---- |
| Main/Renderer責務分離が適切であること            | スケジューラーはRenderer、実行はMain |      |
| 既存のauthHandlers/authSliceとの互換性           | 既存フローを壊さない                 |      |
| コールバックDIパターンによるテスタビリティ       | モック可能な設計                     |      |
| アプリ終了時のクリーンアップが設計されていること | dispose()メソッド                    |      |

### 3. IPC設計レビュー

| チェック項目                         | 期待結果                 | 判定 |
| ------------------------------------ | ------------------------ | ---- |
| 既存`auth:refresh`チャネルの活用     | 新規チャネル不要         |      |
| リクエスト/レスポンス型が仕様に準拠  | IPCResponse<AuthSession> |      |
| AUTH_STATE_CHANGEDイベントとの整合性 | 既存リスナーと競合しない |      |

### 4. エラーハンドリングレビュー

| チェック項目                                     | 期待結果                      | 判定 |
| ------------------------------------------------ | ----------------------------- | ---- |
| リトライロジックが設計されていること             | 最大3回、5秒間隔              |      |
| 全リトライ失敗時のフォールバックが明確であること | ログアウト → ログイン画面遷移 |      |
| expiresAtが過去の値の場合の処理                  | 即座にリフレッシュ実行        |      |

## 統合テスト連携【必須】

| レビュー観点       | 確認項目                                                  |
| ------------------ | --------------------------------------------------------- |
| API設計            | auth:refresh IPCチャネルの仕様準拠                        |
| データフロー       | Renderer → Main → Supabase → Main → Renderer のフロー設計 |
| エラーハンドリング | ネットワークエラー・トークン期限切れ時のフロー            |
| 認証連携           | Supabase refreshSession() APIの利用方法                   |

### 仕様参照チェック

タスクの性質に応じて、以下の仕様を参照して整合性を確認する：

| 観点               | 参照先（aiworkflow-requirements）                                     | 確認ポイント                                    |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------------------- |
| セキュリティ       | `security-principles.md`                                              | トークン非露出、暗号化保存、IPC保護設計         |
| アーキテクチャ     | `architecture-overview.md`, `architecture-implementation-patterns.md` | Main/Renderer分離、Callback DIパターン適用      |
| API設計            | `api-endpoints.md`                                                    | auth:refreshチャネルのリクエスト/レスポンス仕様 |
| インターフェース   | `interfaces-auth.md`, `interfaces-core.md`                            | AuthSession型、Result型の使用                   |
| エラーハンドリング | `error-handling.md`                                                   | リトライ戦略、SESSION_EXPIREDエラーコード       |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果 |

## 完了条件

- [ ] セキュリティレビュー完了（4項目）
- [ ] アーキテクチャレビュー完了（4項目）
- [ ] IPC設計レビュー完了（3項目）
- [ ] エラーハンドリングレビュー完了（3項目）
- [ ] 統合テスト観点のレビューが完了している
- [ ] 判定結果が記録されている
- [ ] **本Phase内のレビュー作業を100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1-2成果物、システム仕様）
2. 要件との整合性レビュー
3. セキュリティ観点レビュー
4. アーキテクチャ観点レビュー
5. IPC設計観点レビュー
6. エラーハンドリング観点レビュー
7. 判定結果の記録
8. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）
