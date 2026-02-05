# Phase 2: 設計

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 2                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

セッション自動リフレッシュの要件を実現可能な構造に落とし込む。TokenRefreshSchedulerのクラス設計、IPC連携フロー、状態管理の設計を行う。

## 実行タスク

- TokenRefreshScheduler設計: スケジューラークラスのインターフェース・メソッド設計
- IPC連携設計: Main-Renderer間のリフレッシュフロー設計
- 状態管理設計: authSliceへの自動リフレッシュ統合設計
- エラーハンドリング設計: リトライ・フォールバックフロー設計

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |

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

### ステップ1: TokenRefreshSchedulerクラス設計

```typescript
// apps/desktop/src/main/services/tokenRefreshScheduler.ts

interface TokenRefreshSchedulerConfig {
  /** リフレッシュ開始オフセット（ミリ秒）。デフォルト: 300000（5分） */
  refreshBeforeExpiryMs: number;
  /** リトライ最大回数。デフォルト: 3 */
  maxRetries: number;
  /** リトライ間隔（ミリ秒）。デフォルト: 5000（5秒） */
  retryIntervalMs: number;
}

interface TokenRefreshCallbacks {
  /** リフレッシュ実行コールバック。成功時にnewExpiresAtを返す */
  onRefresh: () => Promise<number | null>;
  /** リフレッシュ失敗コールバック（リトライ全失敗後） */
  onFailure: (error: Error) => void;
  /** リフレッシュ成功コールバック（オプション） */
  onSuccess?: (newExpiresAt: number) => void;
}

class TokenRefreshScheduler {
  constructor(config?: Partial<TokenRefreshSchedulerConfig>);

  /** スケジューラー開始。expiresAtはUnixタイムスタンプ（ミリ秒） */
  start(expiresAt: number, callbacks: TokenRefreshCallbacks): void;

  /** スケジューラー停止。タイマーをクリア */
  stop(): void;

  /** 新しいexpiresAtでスケジューラーをリセット */
  reset(newExpiresAt: number): void;

  /** スケジューラーの稼働状態を取得 */
  isRunning(): boolean;

  /** クリーンアップ（アプリ終了時） */
  dispose(): void;
}
```

**設計判断:**

- `setTimeout`ベース（`setInterval`ではなく）: 各リフレッシュ成功後にreset()で新タイマーを設定
- コールバックパターン: 依存性注入でテスタビリティを確保
- リトライロジック内蔵: 一時的なネットワークエラーに対応

### ステップ2: IPC連携フロー設計

```
[Renderer Process]                    [Main Process]
      |                                     |
  ログイン成功                              |
      |--- auth:login --->                  |
      |<--- AuthSession(expiresAt) ---      |
      |                                     |
  authSlice.startRefreshScheduler()         |
      |  (sessionExpiresAtを使って           |
      |   スケジューラー開始)               |
      |                                     |
  ... 55分経過（有効期限5分前）...           |
      |                                     |
  スケジューラーがコールバック実行           |
      |--- auth:refresh --->                |
      |                          Supabase refreshSession()
      |                          SecureStorage更新
      |<--- AuthSession(newExpiresAt) ---   |
      |                                     |
  authSlice.resetRefreshScheduler()         |
      |  (新しいexpiresAtでリセット)        |
      |                                     |
  ... ログアウト ...                        |
      |--- auth:logout --->                 |
  authSlice.stopRefreshScheduler()          |
      |                          SecureStorage.clearTokens()
```

### ステップ3: authSlice統合設計

```typescript
// authSlice.ts に追加する状態・アクション

// 新規状態
interface AuthSliceAdditions {
  isRefreshing: boolean; // リフレッシュ中フラグ
  lastRefreshAt: number | null; // 最終リフレッシュ日時
}

// 新規アクション
interface AuthSliceActions {
  startRefreshScheduler: (expiresAt: number) => void;
  stopRefreshScheduler: () => void;
  resetRefreshScheduler: (newExpiresAt: number) => void;
}
```

**設計判断:**

- スケジューラーインスタンスはモジュールスコープ変数として保持（Zustandストア外）
- `isRefreshing`フラグでUI側でのリフレッシュ状態表示が可能
- 既存の`onAuthStateChanged`リスナーと競合しないよう設計

### ステップ4: エラーハンドリング設計

| エラーケース          | 対応                                        |
| --------------------- | ------------------------------------------- |
| ネットワークエラー    | リトライ（最大3回、5秒間隔）                |
| Refresh Token期限切れ | onFailure → ログアウト処理                  |
| Supabase APIエラー    | リトライ（最大3回、5秒間隔）                |
| 全リトライ失敗        | onFailure → ユーザー通知 → ログイン画面遷移 |
| タイマー設定エラー    | console.error + スケジューラー停止          |
| expiresAtが過去の値   | 即座にリフレッシュ実行（待機なし）          |

## 統合テスト連携【必須】

| 統合ポイント                    | 契約定義                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| Renderer → Main（auth:refresh） | Request: なし / Response: `IPCResponse<AuthSession>`        |
| Main → Supabase                 | `supabase.auth.refreshSession()` → `{ data: { session } }`  |
| Main → SecureStorage            | `storeRefreshToken(token)` / `getRefreshToken()` → `string` |
| Main → Renderer（状態通知）     | `AUTH_STATE_CHANGED`イベントで新セッション情報を送信        |

## アーキテクチャ層別設計

| 層                         | 設計観点                                                | 仕様参照先                                   |
| -------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| フロントエンド（Renderer） | authSliceにスケジューラー連携追加。isRefreshing状態管理 | `aiworkflow-requirements: ui-ux-*.md`        |
| バックエンド（Main）       | TokenRefreshSchedulerサービス。コールバックDIパターン   | `aiworkflow-requirements: architecture-*.md` |
| IPC通信                    | 既存`auth:refresh`チャネル活用。新規チャネル不要        | `aiworkflow-requirements: api-*.md`          |
| Preload                    | 変更不要（既存チャネル定義で対応可能）                  | -                                            |
| データ                     | SecureStorageのRefresh Token更新（既存フロー活用）      | `aiworkflow-requirements: database-*.md`     |

## 多角的チェック観点

| 観点               | チェック項目                                                    |
| ------------------ | --------------------------------------------------------------- |
| セキュリティ       | トークンがRendererに露出しない設計。IPC経由のみ                 |
| アーキテクチャ     | Main/Renderer責務分離。スケジューラーはRenderer側で時刻監視のみ |
| エラーハンドリング | リトライロジック、全失敗時のフォールバック、ユーザー通知        |
| パフォーマンス     | setTimeoutの適切なクリーンアップ。メモリリーク防止              |

## 成果物

| 成果物               | パス                                      | 説明                           |
| -------------------- | ----------------------------------------- | ------------------------------ |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`  | クラス設計・IPC連携フロー      |
| インターフェース定義 | `outputs/phase-2/interface-definition.md` | TypeScript型・インターフェース |
| シーケンス図         | `outputs/phase-2/sequence-diagrams.md`    | リフレッシュフロー図           |

## 完了条件

- [ ] TokenRefreshSchedulerのインターフェースが定義されている
- [ ] IPC連携フロー（Renderer↔Main↔Supabase）が設計されている
- [ ] authSlice統合設計が完了している
- [ ] エラーハンドリングフロー（リトライ・フォールバック）が設計されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1成果物）
2. TokenRefreshSchedulerクラス設計
3. IPC連携フロー設計
4. authSlice統合設計
5. エラーハンドリング設計
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
