# Phase 1: 要件定義

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 1                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

セッション自動リフレッシュ機能の目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー要求（UX-002）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名               | パス                                                             | 説明                           |
| -------------------- | ---------------------------------------------------------------- | ------------------------------ |
| 元タスク指示書       | `docs/30-workflows/unassigned-task/task-auth-session-refresh.md` | UX-002の元タスク仕様           |
| セキュリティガイド   | `docs/00-requirements/17-security-guidelines.md`                 | トークン管理・セキュリティ要件 |
| アーキテクチャ設計   | `docs/00-requirements/05-architecture.md`                        | 認証状態遷移・IPC設計          |
| API設計              | `docs/00-requirements/08-api-design.md`                          | auth:refresh IPCチャネル       |
| コアインターフェース | `docs/00-requirements/06-core-interfaces.md`                     | AuthSession型定義              |
| 既存authHandlers     | `apps/desktop/src/main/ipc/authHandlers.ts`                      | 現在のリフレッシュ実装         |
| 既存authSlice        | `apps/desktop/src/renderer/store/slices/authSlice.ts`            | 現在の認証状態管理             |
| 認証共有型           | `packages/shared/types/auth.ts`                                  | AuthSession/AuthUser型         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                            |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | OAuth 2.0 PKCE、セッション管理、トークン暗号化  |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 認証状態遷移、IPC設計、Electron層分離           |
| APIエンドポイント    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | auth:refresh IPCチャネル仕様                    |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | AuthSession、AuthState、AuthErrorCode型定義     |
| コアインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`                      | Result型、Logger                                |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | SESSION_EXPIRED、リトライ戦略、エラーコード分類 |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC通信パターン、safeStorage、テストパターン    |

## 実行手順

### ステップ1: 現状分析

既存の認証実装を確認し、現在のトークン管理フローを理解する:

1. `authHandlers.ts`のauth:refreshハンドラーの動作を確認
2. `authSlice.ts`のrefreshSession()の動作を確認
3. `secureStorage.ts`のRefresh Token保存・復元フローを確認
4. Supabase SDKの`autoRefreshToken: true`設定の影響範囲を確認

**現在の実装状態（確認済み）:**

- Access Token有効期限: 1時間（3600秒）
- Refresh Token有効期限: 30日
- `auth:refresh` IPCチャネル: 実装済み（手動呼び出しのみ）
- Supabase SDK `autoRefreshToken: true`: 有効だがAPI呼び出し時のみ検出（カスタムスケジューラーとの競合リスクあり）
- 自動リフレッシュタイマー: **未実装**
- Renderer側は`sessionExpiresAt`タイムスタンプのみ保持（トークン非露出）
- **expiresAt単位**: Supabaseは`expires_at`をUnixタイムスタンプ（**秒**）で返すが、JavaScriptの`Date.now()`は**ミリ秒**を返す。既存の`authHandlers.ts`は秒単位で処理している

### ステップ2: 機能要件（FR）抽出

| FR-ID  | 要件                                                                  | 優先度 |
| ------ | --------------------------------------------------------------------- | ------ |
| FR-001 | Access Token有効期限の監視                                            | 必須   |
| FR-002 | 有効期限5分前（300秒前）に自動リフレッシュ開始                        | 必須   |
| FR-003 | バックグラウンドでのトークンリフレッシュ実行                          | 必須   |
| FR-004 | リフレッシュ成功時のセッション更新                                    | 必須   |
| FR-005 | リフレッシュ失敗時のログアウト処理                                    | 必須   |
| FR-006 | スケジューラーのstart/stop/reset機能                                  | 必須   |
| FR-007 | ログアウト時のスケジューラー停止                                      | 必須   |
| FR-008 | アプリ終了時のタイマークリーンアップ                                  | 必須   |
| FR-009 | リフレッシュ失敗時のリトライ（最大3回、指数バックオフ）               | 推奨   |
| FR-010 | expiresAtタイムスタンプの単位変換（秒→ミリ秒）                        | 必須   |
| FR-011 | Supabase autoRefreshToken無効化（カスタムスケジューラーとの競合防止） | 必須   |

### ステップ3: 非機能要件（NFR）抽出

| NFR-ID  | 要件                                           | 優先度 |
| ------- | ---------------------------------------------- | ------ |
| NFR-001 | リフレッシュ処理がユーザー操作をブロックしない | 必須   |
| NFR-002 | トークンがRendererプロセスに露出しない         | 必須   |
| NFR-003 | タイマーがメモリリークを起こさない             | 必須   |
| NFR-004 | リフレッシュ処理のログ出力（デバッグ用）       | 推奨   |
| NFR-005 | withValidation()ラッパーによるIPC保護          | 必須   |
| NFR-006 | リフレッシュ処理の排他制御（二重実行防止）     | 必須   |

### ステップ4: 受け入れ基準作成

| AC-ID  | 対応FR | 受け入れ基準                                                                                                      |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| AC-001 | FR-001 | TokenRefreshSchedulerがexpiresAtタイムスタンプを受け取り監視を開始できること                                      |
| AC-002 | FR-002 | 有効期限の5分前（300秒前）にリフレッシュコールバックが実行されること                                              |
| AC-003 | FR-003 | リフレッシュ処理がMain ProcessでIPC経由で非同期実行されること                                                     |
| AC-004 | FR-004 | リフレッシュ成功後、新しいexpiresAtでスケジューラーがリセットされること                                           |
| AC-005 | FR-005 | リフレッシュ失敗時にonFailureコールバックが呼ばれログアウト処理が行われること                                     |
| AC-006 | FR-006 | start(), stop(), reset()メソッドが正しく動作すること                                                              |
| AC-007 | FR-007 | ログアウト時にスケジューラーのstop()が呼ばれること                                                                |
| AC-008 | FR-008 | アプリ終了時（app.on('before-quit')）にタイマーがクリアされること                                                 |
| AC-009 | FR-009 | リフレッシュ失敗時に最大3回リトライし（指数バックオフ: 1s→2s→4s）、全て失敗後にonFailureが呼ばれること            |
| AC-010 | FR-010 | Supabaseの`expires_at`（秒）を`expiresAt`（ミリ秒）に変換してスケジューラーに渡すこと                             |
| AC-011 | FR-011 | supabaseClient初期化時に`autoRefreshToken: false`を設定し、カスタムスケジューラーのみがリフレッシュを実行すること |

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| API接続          | `auth:refresh` IPCチャネル（Renderer → Main）                                                  |
| 認証フロー       | ログイン成功 → スケジューラー開始 → 自動リフレッシュ → セッション更新 → スケジューラーリセット |
| データフロー     | Main Process: Supabase refreshSession() → SecureStorage更新 → Renderer: authSlice状態更新      |

## アーキテクチャ層別要件

| 層                         | 要件                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| フロントエンド（Renderer） | authSliceにスケジューラー連携ロジック追加。sessionExpiresAtの監視   |
| バックエンド（Main）       | TokenRefreshScheduler新規作成。setTimeoutベースのスケジューリング   |
| IPC通信                    | `auth:refresh`チャネル活用。リフレッシュ結果のRenderer通知          |
| セキュリティ               | トークンはMain Processのみ。withValidation()適用。safeStorage暗号化 |
| データ                     | SecureStorageへのRefresh Token更新。sessionExpiresAtの状態更新      |

## 多角的チェック観点

| 観点               | 適用判断 | チェック項目                                     | 仕様参照先          |
| ------------------ | -------- | ------------------------------------------------ | ------------------- |
| セキュリティ       | **適用** | トークン非露出、暗号化保存、IPC保護              | `security-*.md`     |
| アーキテクチャ     | **適用** | Main/Renderer分離、IPC通信パターン               | `architecture-*.md` |
| API設計            | **適用** | auth:refreshチャネル仕様準拠                     | `api-*.md`          |
| エラーハンドリング | **適用** | リフレッシュ失敗時のリトライ・フォールバック     | `error-handling.md` |
| UI/UX              | 部分適用 | リフレッシュ中のユーザー体験（操作ブロックなし） | `ui-ux-*.md`        |
| パフォーマンス     | 部分適用 | タイマーのメモリリーク防止                       | `architecture-*.md` |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている（FR 11件、NFR 6件）
- [ ] 各要件に受け入れ基準がある（AC 11件）
- [ ] FR/NFRが分類されている
- [ ] 接続要件（auth:refresh IPC / Supabase Auth API）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている（Main/Renderer/IPC/セキュリティ/データ）
- [ ] セキュリティ要件が確認されている（トークン非露出、暗号化保存）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（元タスク指示書、セキュリティガイド、既存コード）
2. 現状分析の実施
3. 機能要件（FR）の抽出と文書化
4. 非機能要件（NFR）の抽出と文書化
5. 受け入れ基準の作成
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 1
```

## 次のPhase

Phase 2: 設計
