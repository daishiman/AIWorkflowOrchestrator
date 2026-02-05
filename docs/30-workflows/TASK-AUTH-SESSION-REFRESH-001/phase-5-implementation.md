# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 5                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。TokenRefreshScheduler、authSlice統合、authHandlers修正を実装する。

## 実行タスク

- TokenRefreshScheduler実装: スケジューラークラスの実装
- authSlice修正: 自動リフレッシュスケジューラー連携の追加
- authHandlers修正: リフレッシュハンドラーの改善（ログ出力追加）
- エラーハンドリング実装: リトライ・フォールバック処理の実装

## 参照資料

| 資料名                      | パス                                                           | 説明          |
| --------------------------- | -------------------------------------------------------------- | ------------- |
| アーキテクチャ設計書        | `outputs/phase-2/architecture-design.md`                       | Phase 2成果物 |
| インターフェース定義        | `outputs/phase-2/interface-definition.md`                      | Phase 2成果物 |
| テスト仕様書                | `outputs/phase-4/test-specification.md`                        | Phase 4成果物 |
| TokenRefreshSchedulerテスト | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` | テストコード  |
| 既存authHandlers            | `apps/desktop/src/main/ipc/authHandlers.ts`                    | 修正対象      |
| 既存authSlice               | `apps/desktop/src/renderer/store/slices/authSlice.ts`          | 修正対象      |

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

## 実行手順

### ステップ1: TokenRefreshScheduler実装

**ファイル**: `apps/desktop/src/main/services/tokenRefreshScheduler.ts`

実装要件:

1. `TokenRefreshSchedulerConfig`インターフェースに基づくコンストラクタ
2. `start(expiresAt, callbacks)`: setTimeoutで有効期限5分前にリフレッシュをスケジュール
3. `stop()`: clearTimeoutでタイマーをクリア
4. `reset(newExpiresAt)`: stop() → 新しいexpiresAtでstart()
5. `isRunning()`: タイマー稼働状態を返す
6. `dispose()`: 全リソースの解放
7. リトライロジック: 失敗時に最大3回、指数バックオフ（1s→2s→4s + ジッター）でリトライ
8. 排他制御: `_isRefreshing`フラグで二重リフレッシュを防止
9. 単位変換: Supabaseの`expires_at`（秒）を受け取り、`* 1000`でミリ秒に変換してスケジューリング

**設計ポイント:**

- `setTimeout`の戻り値（`NodeJS.Timeout`）をインスタンス変数に保持
- リフレッシュ実行時間の計算: `Math.max(0, expiresAtMs - Date.now() - refreshBeforeExpiryMs)`（expiresAtMsはミリ秒単位）
- リトライカウンターの管理
- console.log/console.errorでのデバッグログ出力

### ステップ2: authSlice修正

**ファイル**: `apps/desktop/src/renderer/store/slices/authSlice.ts`

修正要件:

1. `isRefreshing`状態の追加（Main ProcessからのAUTH_STATE_CHANGEDイベントで更新）
2. `sessionExpiresAt`の更新ロジック（リフレッシュ成功時にMain Processから通知）
3. 既存の`onAuthStateChanged`リスナーでの状態反映

**注意: スケジューラーはMain Process側で管理**

- authSlice側ではスケジューラーを直接操作しない（Main Process完結型アーキテクチャ）
- Renderer側の役割は、AUTH_STATE_CHANGEDイベントを受けて`sessionExpiresAt`と`isRefreshing`を更新すること
- 二重登録防止の`listenerRegistered`フラグと共存

### ステップ3: authHandlers修正（必要に応じて）

**ファイル**: `apps/desktop/src/main/ipc/authHandlers.ts`

修正要件:

1. TokenRefreshSchedulerインスタンスの生成・管理をauthHandlers初期化時に追加
2. ログイン成功時（`auth:login`ハンドラー内）にスケジューラーstart()を呼び出し
3. ログアウト時（`auth:logout`ハンドラー内）にスケジューラーstop()を呼び出し
4. `auth:refresh`ハンドラーにログ出力追加（`Token refreshed automatically`）
5. リフレッシュ成功時の`expiresAt`計算: `expires_at * 1000`（秒→ミリ秒変換）
6. Refresh Token更新時のSecureStorage書き込み確認
7. `supabaseClient.ts`の`autoRefreshToken: true`→`false`に変更
8. `app.on('before-quit')`でスケジューラーdispose()を呼び出し

## 統合テスト連携【必須】

| 実装項目           | 内容                                                      |
| ------------------ | --------------------------------------------------------- |
| IPC接続            | auth:refreshチャネル経由のリフレッシュ実行                |
| エラーハンドリング | リトライ3回 → 全失敗時ログアウト                          |
| 状態同期           | リフレッシュ成功後のauthSlice状態更新（sessionExpiresAt） |

## アーキテクチャ層別実装

| 層               | 実装ファイル                                              | 仕様参照先                      |
| ---------------- | --------------------------------------------------------- | ------------------------------- |
| Main Process     | `apps/desktop/src/main/services/tokenRefreshScheduler.ts` | `architecture-*.md` §5.9        |
| Renderer Process | `apps/desktop/src/renderer/store/slices/authSlice.ts`     | `ui-ux-*.md`, `interfaces-*.md` |
| IPC通信          | `apps/desktop/src/main/ipc/authHandlers.ts`               | `api-*.md` §8.11                |

## 成果物

| 成果物                | パス                                                      | 説明                             |
| --------------------- | --------------------------------------------------------- | -------------------------------- |
| TokenRefreshScheduler | `apps/desktop/src/main/services/tokenRefreshScheduler.ts` | スケジューラー実装               |
| authSlice修正         | `apps/desktop/src/renderer/store/slices/authSlice.ts`     | 自動リフレッシュ統合             |
| authHandlers修正      | `apps/desktop/src/main/ipc/authHandlers.ts`               | スケジューラー統合・ログ出力追加 |
| supabaseClient修正    | `apps/desktop/src/main/infrastructure/supabaseClient.ts`  | autoRefreshToken: false          |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`               | 変更内容のサマリー               |

## 完了条件

- [ ] TokenRefreshSchedulerが実装され、全ユニットテストが成功（Green）
- [ ] authSliceにスケジューラー連携が追加されている
- [ ] ログイン成功時にスケジューラーが開始される
- [ ] ログアウト時にスケジューラーが停止される
- [ ] リフレッシュ成功時にスケジューラーがリセットされる
- [ ] リトライロジックが実装されている
- [ ] ESLint/TypeScriptエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run tokenRefreshScheduler.test.ts

# 全テスト実行
pnpm --filter @repo/desktop test:run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

1. 参照資料の確認（Phase 2設計書、Phase 4テストケース）
2. TokenRefreshScheduler実装
3. authSlice修正（スケジューラー連携追加）
4. authHandlers修正（ログ出力追加）
5. Green状態の確認（全テスト成功）
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 5
```

## 次のPhase

Phase 6: テスト拡充
