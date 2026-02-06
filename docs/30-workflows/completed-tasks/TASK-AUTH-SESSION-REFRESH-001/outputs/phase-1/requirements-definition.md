# Phase 1 成果物: 要件定義書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| 機能名   | auth-session-refresh          |
| タスクID | TASK-AUTH-SESSION-REFRESH-001 |
| 作成日   | 2026-02-06                    |
| 文書種別 | 要件定義書（FR/NFR）          |

---

## 1. 現状分析

### 1.1 既存実装の状態

| 項目                            | 現状                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Access Token 有効期限           | 1時間（3600秒）                                                                   |
| Refresh Token 有効期限          | 30日                                                                              |
| `auth:refresh` IPCチャネル      | 実装済み（手動呼び出しのみ）                                                      |
| Supabase SDK `autoRefreshToken` | `true`（有効だがAPI呼び出し時のみ検出。カスタムスケジューラーとの競合リスクあり） |
| 自動リフレッシュタイマー        | 未実装                                                                            |
| Renderer側のトークン保持        | `sessionExpiresAt`タイムスタンプのみ（トークン非露出）                            |
| expiresAt単位                   | Supabaseは`expires_at`をUnixタイムスタンプ（秒）で返す。`Date.now()`はミリ秒      |
| SecureStorage                   | `electron.safeStorage.encryptString()`でRefresh Tokenを暗号化保存                 |

### 1.2 課題

1. ユーザーが1時間以上アプリを使用するとAccess Tokenが期限切れとなり、API呼び出しが失敗する
2. 手動リフレッシュのみで自動リフレッシュ機能が存在しない
3. Supabase SDKの`autoRefreshToken: true`はAPI呼び出し時にのみ検出するため、バックグラウンドでの能動的なリフレッシュが行われない
4. カスタムスケジューラーを導入する場合、`autoRefreshToken: true`との競合リスクがある

---

## 2. 機能要件（FR）

| FR-ID  | 要件                                                                                         | 優先度 | 対応AC |
| ------ | -------------------------------------------------------------------------------------------- | ------ | ------ |
| FR-001 | ログイン成功後にセッション自動リフレッシュのスケジューリングが開始されること                 | 必須   | AC-001 |
| FR-002 | アクセストークンの有効期限5分前（300秒前）にリフレッシュが実行されること                     | 必須   | AC-002 |
| FR-003 | リフレッシュ成功時にアクセストークンとリフレッシュトークンが更新されること                   | 必須   | AC-003 |
| FR-004 | リフレッシュ失敗時に最大3回のリトライが実行されること（指数バックオフ: 1s→2s→4s + ジッター） | 必須   | AC-004 |
| FR-005 | 全リトライ失敗後にユーザーに通知し、ログイン画面に遷移すること                               | 必須   | AC-005 |
| FR-006 | ログアウト時にスケジューラーが停止されること                                                 | 必須   | AC-006 |
| FR-007 | アプリ終了時にスケジューラーのリソースが解放されること                                       | 必須   | AC-007 |
| FR-008 | リフレッシュ中の二重実行が防止されること（排他制御）                                         | 必須   | AC-008 |
| FR-009 | リフレッシュされたトークンがSecureStorageに暗号化保存されること                              | 必須   | AC-009 |
| FR-010 | セッション有効期限(sessionExpiresAt)がRenderer側で表示可能であること                         | 必須   | AC-010 |
| FR-011 | Supabase SDKの自動リフレッシュとの競合が防止されること（autoRefreshToken: false）            | 必須   | AC-011 |

### 2.1 FR詳細

#### FR-001: ログイン成功後のスケジューリング開始

- ログイン成功時、`authHandlers.ts`内でTokenRefreshSchedulerの`start()`メソッドを呼び出す
- Supabaseから取得した`expires_at`（秒単位）を`expiresAt`（ミリ秒単位）に変換してスケジューラーに渡す: `expires_at * 1000`
- スケジューラーはMain Processのモジュールスコープでシングルトンインスタンスとして管理する

#### FR-002: 有効期限5分前の自動リフレッシュ

- リフレッシュ開始タイミング: `expiresAt - refreshBeforeExpiryMs`（デフォルト: 300,000ミリ秒 = 5分）
- Access Token有効期限が1時間の場合、ログインから55分後にリフレッシュが開始される
- リフレッシュ開始タイミングが既に過去の場合（expiresAtが残り5分未満）、即座にリフレッシュを実行する（delay = 0）

#### FR-003: リフレッシュ成功時のトークン更新

- 新しいAccess TokenをSupabase SDKのセッションに反映する
- 新しいRefresh TokenをSecureStorageに`electron.safeStorage.encryptString()`で暗号化保存する
- 新しい`expiresAt`でスケジューラーをリセットする（次回のリフレッシュを再スケジュール）
- `AUTH_STATE_CHANGED`イベントでRendererに新セッション情報を通知する

#### FR-004: リフレッシュ失敗時のリトライ

- 最大リトライ回数: 3回
- 指数バックオフ: 1秒 → 2秒 → 4秒（`retryBaseIntervalMs * 2^retryCount`）
- ジッター: 各リトライ間隔に0〜500ミリ秒のランダム遅延を加算
- Refresh Token期限切れエラーの場合はリトライ不要（即座に`onFailure`）

| リトライ回数 | ベース遅延 | ジッター範囲 | 合計遅延範囲   |
| ------------ | ---------- | ------------ | -------------- |
| 0（1回目）   | 1,000ms    | 0〜500ms     | 1,000〜1,500ms |
| 1（2回目）   | 2,000ms    | 0〜500ms     | 2,000〜2,500ms |
| 2（3回目）   | 4,000ms    | 0〜500ms     | 4,000〜4,500ms |

#### FR-005: 全リトライ失敗後の通知とログイン画面遷移

- 全リトライ失敗後に`onFailure`コールバックを呼び出す
- スケジューラーを停止する
- SecureStorageからトークンをクリアする（`clearTokens()`）
- `AUTH_STATE_CHANGED(null)`イベントでRendererにログアウト状態を通知する
- Renderer側で`clearAuth()`が呼ばれ、ログイン画面に遷移する

#### FR-006: ログアウト時のスケジューラー停止

- `auth:logout` IPCハンドラー内で`scheduler.stop()`を呼び出す
- タイマーが確実にクリアされることを保証する
- ログアウト後にリフレッシュタイマーが発火しないことを保証する

#### FR-007: アプリ終了時のリソース解放

- `app.on('before-quit')`イベントで`scheduler.dispose()`を呼び出す
- 全タイマーをクリアする（`clearTimeout()`）
- コールバック参照を`null`に設定してGC対象にする
- dispose()後のstart/reset呼び出しは無視する

#### FR-008: 二重実行防止（排他制御）

- `_isRefreshing`フラグにより二重リフレッシュを防止する
- リフレッシュ処理中に新たなリフレッシュリクエストが発生した場合、新規リクエストを無視する
- フラグはリフレッシュ完了（成功/失敗/リトライ全失敗）時にリセットする

#### FR-009: SecureStorageへの暗号化保存

- リフレッシュ成功時に新しいRefresh Tokenを`electron.safeStorage.encryptString()`で暗号化する
- 既存の`storeRefreshToken()`メソッドを使用する
- トークンが平文でディスクに保存されないことを保証する

#### FR-010: Renderer側でのセッション有効期限表示

- `authSlice`に`sessionExpiresAt`フィールドを保持する
- リフレッシュ成功時に`AUTH_STATE_CHANGED`イベント経由で`sessionExpiresAt`が更新される
- Rendererに送信するデータにはトークン文字列を含めない（`expiresAt`と`user`情報のみ）

#### FR-011: Supabase autoRefreshToken無効化

- `supabaseClient.ts`の`createClient()`呼び出しで`autoRefreshToken: false`を設定する
- カスタムTokenRefreshSchedulerのみがリフレッシュを実行する
- SDKの自動リフレッシュとカスタムスケジューラーの二重実行を防止する

---

## 3. 非機能要件（NFR）

| NFR-ID  | 要件                                                   | 優先度 | カテゴリ       |
| ------- | ------------------------------------------------------ | ------ | -------------- |
| NFR-001 | リフレッシュ処理の応答時間が5秒以内                    | 必須   | パフォーマンス |
| NFR-002 | タイマー精度は±1秒以内                                 | 必須   | 信頼性         |
| NFR-003 | メモリリークなし（dispose()で完全クリーンアップ）      | 必須   | 信頼性         |
| NFR-004 | テストカバレッジ Line 80%+, Branch 60%+, Function 80%+ | 必須   | 品質           |
| NFR-005 | ESLint/TypeScriptエラー0件                             | 必須   | 品質           |
| NFR-006 | 既存テストへの影響なし（リグレッションなし）           | 必須   | 品質           |

### 3.1 NFR詳細

#### NFR-001: リフレッシュ処理の応答時間（5秒以内）

- リフレッシュ処理（`supabase.auth.refreshSession()` + SecureStorage更新 + Renderer通知）の合計処理時間が5秒以内であること
- ネットワーク遅延を含む。ただし、リトライ間の待機時間は含まない
- Renderer Processのイベントループに影響を与えず、ユーザー操作をブロックしないこと

#### NFR-002: タイマー精度（±1秒以内）

- `setTimeout`で設定したリフレッシュタイミングと実際の発火タイミングの誤差が±1秒以内であること
- Node.jsのイベントループの特性上、多少の遅延は許容するが、大幅なずれは発生しないこと
- テストでは`vi.useFakeTimers()`と`vi.advanceTimersByTime()`で精度を検証する

#### NFR-003: メモリリーク防止

- `stop()`呼び出し時に`clearTimeout()`でタイマーを確実にクリアする
- `dispose()`呼び出し時に全内部参照を解放する
  - `_timerId`: `null`に設定
  - `_callbacks`: `null`に設定してGC対象にする
  - `_currentExpiresAt`: `null`に設定
- 長時間稼働（24時間以上）でもメモリ使用量が増加しないこと

#### NFR-004: テストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

- TokenRefreshSchedulerの全パブリックメソッドにユニットテストが存在すること
- リトライロジック（成功/失敗/部分成功）のテストが存在すること
- エッジケース（expiresAtが過去の値、dispose後の操作、二重start）のテストが存在すること

#### NFR-005: ESLint/TypeScriptエラー0件

- `pnpm lint`実行時にエラーが0件であること
- `pnpm typecheck`実行時にエラーが0件であること
- `any`型の使用を避け、厳密な型定義を維持すること

#### NFR-006: リグレッションなし

- 既存の認証テスト（authHandlers.test.ts、authSlice.test.ts）が全てPASSすること
- `autoRefreshToken: false`への変更により既存のSupabase連携に影響がないこと
- 既存のIPC通信パターン（withValidation、チャネルホワイトリスト）を維持すること

---

## 4. アーキテクチャ層別要件

| 層                         | 要件                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | authSliceにsessionExpiresAt/isRefreshing状態を保持。AUTH_STATE_CHANGEDイベントで状態更新      |
| バックエンド（Main）       | TokenRefreshScheduler新規作成。setTimeoutベースのスケジューリング。コールバックDIパターン     |
| IPC通信                    | 既存`auth:refresh`チャネル活用。リフレッシュ結果はAUTH_STATE_CHANGEDイベントでRendererに通知  |
| セキュリティ               | トークンはMain Processのみ保持。withValidation()適用。safeStorage暗号化。ログにトークン非含有 |
| データ                     | SecureStorageへのRefresh Token更新。sessionExpiresAtの状態更新                                |

---

## 5. 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| API接続          | `auth:refresh` IPCチャネル（Renderer → Main）                                                  |
| 認証フロー       | ログイン成功 → スケジューラー開始 → 自動リフレッシュ → セッション更新 → スケジューラーリセット |
| データフロー     | Main Process: Supabase refreshSession() → SecureStorage更新 → Renderer: authSlice状態更新      |

---

## 6. 多角的チェック観点

| 観点               | 適用判断 | チェック項目                                       | 仕様参照先          |
| ------------------ | -------- | -------------------------------------------------- | ------------------- |
| セキュリティ       | **適用** | トークン非露出、暗号化保存、IPC保護、ログ安全性    | `security-*.md`     |
| アーキテクチャ     | **適用** | Main/Renderer分離、IPC通信パターン、コールバックDI | `architecture-*.md` |
| API設計            | **適用** | auth:refreshチャネル仕様準拠                       | `api-*.md`          |
| エラーハンドリング | **適用** | リフレッシュ失敗時のリトライ・フォールバック       | `error-handling.md` |
| UI/UX              | 部分適用 | リフレッシュ中のユーザー体験（操作ブロックなし）   | `ui-ux-*.md`        |
| パフォーマンス     | 部分適用 | タイマーのメモリリーク防止、応答時間5秒以内        | `architecture-*.md` |
