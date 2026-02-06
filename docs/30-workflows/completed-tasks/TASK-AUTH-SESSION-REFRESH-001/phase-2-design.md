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
  /** リトライ初期間隔（ミリ秒）。デフォルト: 1000（1秒）。指数バックオフで増加 */
  retryBaseIntervalMs: number;
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
  /** リフレッシュ処理中フラグ（排他制御用） */
  private _isRefreshing: boolean;

  constructor(config?: Partial<TokenRefreshSchedulerConfig>);

  /**
   * スケジューラー開始。expiresAtはUnixタイムスタンプ（ミリ秒）
   * 注意: Supabaseのexpires_atは秒単位。呼び出し側で `expires_at * 1000` に変換すること
   */
  start(expiresAt: number, callbacks: TokenRefreshCallbacks): void;

  /** スケジューラー停止。タイマーをクリア */
  stop(): void;

  /** 新しいexpiresAtでスケジューラーをリセット */
  reset(newExpiresAt: number): void;

  /** スケジューラーの稼働状態を取得 */
  isRunning(): boolean;

  /** リフレッシュ処理中かどうか（排他制御） */
  isRefreshing(): boolean;

  /** クリーンアップ（アプリ終了時） */
  dispose(): void;
}
```

**設計判断:**

- `setTimeout`ベース（`setInterval`ではなく）: 各リフレッシュ成功後にreset()で新タイマーを設定
- コールバックパターン: 依存性注入でテスタビリティを確保
- リトライロジック内蔵: 指数バックオフ（1s→2s→4s）で一時的なネットワークエラーに対応
- 排他制御: `_isRefreshing`フラグにより二重リフレッシュを防止
- **expiresAt単位**: スケジューラー内部はミリ秒統一。Supabaseの秒→ミリ秒変換は呼び出し側の責務
- **Main Process完結型**: スケジューラーはMain Processで動作し、Supabase API呼び出しも直接実行。不要なIPC往復を排除

**前提条件（supabaseClient設定変更）:**

```typescript
// apps/desktop/src/main/infrastructure/supabaseClient.ts
// autoRefreshToken: true → false に変更（カスタムスケジューラーとの競合防止）
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false },
});
```

### ステップ2: IPC連携フロー設計

```
[Renderer Process]                    [Main Process]
      |                                     |
  ログイン成功                              |
      |--- auth:login --->                  |
      |                          expires_at（秒）→ expiresAt（ミリ秒）変換
      |                          TokenRefreshScheduler.start(expiresAt * 1000)
      |<--- AuthSession(expiresAt) ---      |
      |                                     |
  authSlice: sessionExpiresAtを保持          |
      |                                     |
  ... 55分経過（有効期限5分前）...           |
      |                                     |
      |                          スケジューラーがonRefresh実行
      |                          ┌─ _isRefreshing = true（排他制御）
      |                          │  Supabase refreshSession()
      |                          │  SecureStorage更新
      |                          │  TokenRefreshScheduler.reset(newExpiresAt)
      |                          └─ _isRefreshing = false
      |<--- AUTH_STATE_CHANGED(newSession) ---|
      |                                     |
  authSlice: sessionExpiresAtを更新          |
      |                                     |
  ... ログアウト ...                        |
      |--- auth:logout --->                 |
      |                          TokenRefreshScheduler.stop()
      |                          SecureStorage.clearTokens()
```

**アーキテクチャ選択: Main Process完結型**

TokenRefreshSchedulerをMain Processに配置する理由:

1. トークン操作が全てMain Process内で完結（Renderer経由のIPC往復が不要）
2. Supabase SDK呼び出しをMain Processから直接実行できる
3. セキュリティ: リフレッシュ処理中にトークンがIPC境界を越えない
4. Renderer Process停止時もリフレッシュが継続可能

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

- **スケジューラーはMain Process側**: `authHandlers.ts`の初期化時にインスタンスを生成。Renderer側はスケジューラーを直接操作しない
- authSlice側の`isRefreshing`フラグはMain ProcessからのAUTH_STATE_CHANGEDイベントで間接的に更新
- 既存の`onAuthStateChanged`リスナーと競合しないよう設計
- `clearAuth()`呼び出し時にMain Process側でスケジューラーstop()を連動

### ステップ4: エラーハンドリング設計

| エラーケース          | 対応                                                               |
| --------------------- | ------------------------------------------------------------------ |
| ネットワークエラー    | リトライ（最大3回、指数バックオフ: 1s→2s→4s + ジッター）           |
| Refresh Token期限切れ | リトライ不要 → 即座にonFailure → ログアウト処理                    |
| Supabase APIエラー    | リトライ（最大3回、指数バックオフ: 1s→2s→4s + ジッター）           |
| 全リトライ失敗        | onFailure → ユーザー通知 → ログイン画面遷移                        |
| タイマー設定エラー    | console.error + スケジューラー停止                                 |
| expiresAtが過去の値   | 即座にリフレッシュ実行（待機なし）                                 |
| 二重リフレッシュ      | \_isRefreshingフラグで排他制御。実行中の場合は新規リクエストを無視 |

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

| 観点               | チェック項目                                                   |
| ------------------ | -------------------------------------------------------------- |
| セキュリティ       | トークンがRendererに露出しない設計。Main Process内で完結       |
| アーキテクチャ     | Main Process完結型。スケジューラー・リフレッシュ実行ともにMain |
| エラーハンドリング | リトライロジック、全失敗時のフォールバック、ユーザー通知       |
| パフォーマンス     | setTimeoutの適切なクリーンアップ。メモリリーク防止             |

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

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
