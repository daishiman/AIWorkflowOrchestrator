# Phase 1 成果物: 受け入れ基準

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| Phase    | 1                                   |
| 機能名   | auth-session-refresh                |
| タスクID | TASK-AUTH-SESSION-REFRESH-001       |
| 作成日   | 2026-02-06                          |
| 文書種別 | 受け入れ基準（Acceptance Criteria） |

---

## 受け入れ基準一覧

| AC-ID  | 対応FR | 受け入れ基準                                                                 |
| ------ | ------ | ---------------------------------------------------------------------------- |
| AC-001 | FR-001 | ログイン成功後、TokenRefreshSchedulerが自動的にstart()される                 |
| AC-002 | FR-002 | 有効期限5分前にonRefreshコールバックが実行される                             |
| AC-003 | FR-003 | リフレッシュ成功時、新しいアクセストークンとリフレッシュトークンが更新される |
| AC-004 | FR-004 | リフレッシュ失敗時、1s→2s→4sの指数バックオフで最大3回リトライ                |
| AC-005 | FR-005 | 全リトライ失敗後、onFailureコールバックが実行される                          |
| AC-006 | FR-006 | ログアウト時、スケジューラーがstop()される                                   |
| AC-007 | FR-007 | アプリ終了時、スケジューラーがdispose()される                                |
| AC-008 | FR-008 | isRefreshing()フラグで二重リフレッシュが防止される                           |
| AC-009 | FR-009 | リフレッシュトークンがSecureStorageに暗号化保存される                        |
| AC-010 | FR-010 | sessionExpiresAtがRenderer側authSliceで管理される                            |
| AC-011 | FR-011 | supabaseClientのautoRefreshToken: falseに変更される                          |

---

## 受け入れ基準 詳細

### AC-001: ログイン成功後のスケジューラー自動起動

**対応要件**: FR-001（ログイン成功後にセッション自動リフレッシュのスケジューリングが開始されること）

**前提条件**:

- ユーザーがOAuth認証でログインに成功し、Supabaseからセッション情報（`expires_at`を含む）を取得済みであること
- TokenRefreshSchedulerインスタンスがMain Processで生成されていること

**検証手順**:

1. `auth:login` IPCハンドラーでSupabase認証が成功する
2. `expires_at`（秒）が`expiresAt`（ミリ秒）に変換される（`expires_at * 1000`）
3. `TokenRefreshScheduler.start(expiresAt, callbacks)`が呼び出される
4. `scheduler.isRunning()`が`true`を返すことを確認する

**期待結果**:

- ログイン成功後、追加のユーザー操作なしにスケジューラーが自動的に開始される
- 内部タイマーが設定され、スケジューラーが稼働状態になる
- `expiresAt`のミリ秒変換が正しく行われる

---

### AC-002: 有効期限5分前のリフレッシュ実行

**対応要件**: FR-002（アクセストークンの有効期限5分前にリフレッシュが実行されること）

**前提条件**:

- スケジューラーが稼働中であること
- `refreshBeforeExpiryMs`がデフォルト値300,000ミリ秒（5分）であること

**検証手順**:

1. expiresAtを`Date.now() + 360_000`（6分後）に設定してスケジューラーを開始する
2. 1分後（expiresAtの5分前）にonRefreshコールバックが実行されることを確認する
3. テストでは`vi.useFakeTimers()`と`vi.advanceTimersByTime()`でタイマーを進めて検証する

**期待結果**:

- リフレッシュタイミング = `expiresAt - refreshBeforeExpiryMs - Date.now()`
- Access Token有効期限1時間（3,600,000ms）の場合、ログインから約55分後にリフレッシュが実行される
- expiresAtが残り5分未満の場合、即座にリフレッシュが実行される（delay = 0）

**エッジケース**:

- expiresAtが過去の値の場合: `delay = Math.max(0, calculated)` → 即座にリフレッシュ実行

---

### AC-003: リフレッシュ成功時のトークン更新

**対応要件**: FR-003（リフレッシュ成功時にアクセストークンとリフレッシュトークンが更新されること）

**前提条件**:

- onRefreshコールバックが`supabase.auth.refreshSession()`を呼び出し成功すること

**検証手順**:

1. onRefreshコールバックが実行され、Supabase APIからnewSessionが返される
2. 新しいAccess TokenがSupabase SDKセッションに反映される
3. 新しいRefresh Tokenが`storeRefreshToken()`でSecureStorageに保存される
4. 新しいexpiresAt（`session.expires_at * 1000`）が返される
5. スケジューラーが`reset(newExpiresAt)`で次回リフレッシュを再スケジュールする
6. `AUTH_STATE_CHANGED`イベントでRendererに通知される

**期待結果**:

- アクセストークンとリフレッシュトークンの両方が新しい値に更新される
- SecureStorageの暗号化保存が更新される
- Renderer側のsessionExpiresAtが新しい値に更新される
- onSuccessコールバックが呼ばれる（設定されている場合）

---

### AC-004: リフレッシュ失敗時の指数バックオフリトライ

**対応要件**: FR-004（リフレッシュ失敗時に最大3回のリトライが実行されること）

**前提条件**:

- onRefreshコールバックが失敗する（`null`を返すまたはエラーをスロー）
- エラーがリトライ対象であること（External Service Error: ネットワークエラー、タイムアウト）

**検証手順**:

1. onRefreshが1回目に失敗する → 1秒（+ ジッター0〜500ms）後にリトライ
2. onRefreshが2回目に失敗する → 2秒（+ ジッター0〜500ms）後にリトライ
3. onRefreshが3回目に失敗する → 4秒（+ ジッター0〜500ms）後にリトライ
4. 各リトライの間隔が指数バックオフに従うことを検証する

**期待結果**:

- リトライ遅延計算式: `retryBaseIntervalMs * (2 ** retryCount) + Math.random() * 500`
- リトライ中も`isRefreshing()`が`true`を返す
- テストでは`vi.advanceTimersByTime()`でリトライ間隔を検証する

**エッジケース**:

- 2回目のリトライで成功した場合: 3回目のリトライは実行されず、正常フロー（reset）に進む
- Refresh Token期限切れエラーの場合: リトライせず即座にonFailureが呼ばれる（Business Error）

---

### AC-005: 全リトライ失敗後のonFailureコールバック実行

**対応要件**: FR-005（全リトライ失敗後にユーザーに通知し、ログイン画面に遷移すること）

**前提条件**:

- リトライが3回全て失敗した状態、またはリトライ不要なエラー（Refresh Token期限切れ）

**検証手順**:

1. onRefreshが3回連続で失敗する（またはリトライ不要エラーが発生する）
2. onFailureコールバックにErrorオブジェクトが渡されることを確認する
3. スケジューラーが`stop()`されることを確認する
4. SecureStorageからトークンがクリアされることを確認する（`clearTokens()`）
5. `AUTH_STATE_CHANGED(null)`イベントがRendererに送信されることを確認する
6. Renderer側でclearAuth()が呼ばれ、ログイン画面に遷移することを確認する

**期待結果**:

- onFailureコールバックが呼ばれ、エラー情報が渡される
- 以降のリフレッシュスケジュールは実行されない（スケジューラー停止済み）
- ユーザーはログイン画面に遷移し、再ログインが可能な状態になる

---

### AC-006: ログアウト時のスケジューラー停止

**対応要件**: FR-006（ログアウト時にスケジューラーが停止されること）

**前提条件**:

- スケジューラーが稼働中であること

**検証手順**:

1. `auth:logout` IPCハンドラーが呼ばれる
2. ハンドラー内で`scheduler.stop()`が呼ばれることを確認する
3. `scheduler.isRunning()`が`false`を返すことを確認する
4. `clearTimeout()`でタイマーがクリアされていることを確認する

**期待結果**:

- ログアウト処理の一環としてスケジューラーが確実に停止する
- ログアウト後にリフレッシュタイマーが発火しない
- ログアウト後の`stop()`呼び出しでもエラーが発生しない

---

### AC-007: アプリ終了時のスケジューラーdispose

**対応要件**: FR-007（アプリ終了時にスケジューラーのリソースが解放されること）

**前提条件**:

- アプリが稼働中であること（スケジューラーが稼働中/停止中のどちらでも対応可能）

**検証手順**:

1. `app.on('before-quit')`イベントが発火する
2. `scheduler.dispose()`が呼ばれることを確認する
3. 内部タイマーがクリアされていることを確認する（`_timerId = null`）
4. コールバック参照が解放されていることを確認する（`_callbacks = null`）
5. dispose後にstart/resetを呼び出しても何も起きないことを確認する

**期待結果**:

- アプリ終了時にメモリリークが発生しない
- タイマーが確実にクリアされる
- GC対象となるようコールバック参照が解放される

---

### AC-008: 二重リフレッシュ防止

**対応要件**: FR-008（リフレッシュ中の二重実行が防止されること）

**前提条件**:

- リフレッシュ処理が実行中であること

**検証手順**:

1. `_executeRefresh()`が開始され、`_isRefreshing = true`に設定される
2. リフレッシュ処理中に再度`_executeRefresh()`が呼ばれる
3. `_isRefreshing === true`を検出し、新規リフレッシュが無視されることを確認する
4. 元のリフレッシュ処理が完了後、`_isRefreshing = false`に戻ることを確認する
5. その後のリフレッシュリクエストは正常に受け付けられることを確認する

**期待結果**:

- `isRefreshing()`が排他制御のゲートとして機能する
- 二重リフレッシュによるトークン競合が発生しない
- 排他制御時にエラーは発生せず、ログ出力（warn）のみ行われる

---

### AC-009: SecureStorageへの暗号化保存

**対応要件**: FR-009（リフレッシュされたトークンがSecureStorageに暗号化保存されること）

**前提条件**:

- `electron.safeStorage`が利用可能であること
- リフレッシュが成功し、新しいRefresh Tokenが取得されていること

**検証手順**:

1. リフレッシュ成功後、`storeRefreshToken(newRefreshToken)`が呼ばれることを確認する
2. `electron.safeStorage.encryptString()`で暗号化されることを確認する
3. 平文のトークンがディスクに保存されないことを確認する

**期待結果**:

- 新しいRefresh Tokenが暗号化されてSecureStorageに保存される
- 既存の暗号化フロー（`safeStorage.encryptString()`）が使用される
- 古いRefresh Tokenが新しいもので上書きされる

---

### AC-010: Renderer側authSliceでのsessionExpiresAt管理

**対応要件**: FR-010（セッション有効期限がRenderer側で表示可能であること）

**前提条件**:

- authSliceに`sessionExpiresAt`フィールドが定義されていること

**検証手順**:

1. ログイン成功時にsessionExpiresAtがauthSliceに設定される
2. リフレッシュ成功時に`AUTH_STATE_CHANGED`イベント経由で新しいsessionExpiresAtが設定される
3. Rendererコンポーネントから`useAppStore((s) => s.sessionExpiresAt)`でアクセスできることを確認する
4. Rendererに送信されるデータにアクセストークン/リフレッシュトークンが含まれないことを確認する

**期待結果**:

- sessionExpiresAtがRenderer側で常に最新の値に維持される
- トークン文字列はRendererに露出しない（expiresAtとuser情報のみ）
- UIコンポーネントからセッション有効期限を参照可能

---

### AC-011: autoRefreshToken: false設定

**対応要件**: FR-011（Supabase SDKの自動リフレッシュとの競合が防止されること）

**前提条件**:

- `supabaseClient.ts`にSupabase Client初期化コードが存在すること

**検証手順**:

1. `supabaseClient.ts`で`createClient()`の`auth.autoRefreshToken`が`false`に設定されていることを確認する
2. Supabase SDKの自動リフレッシュが動作しないことを確認する
3. カスタムTokenRefreshSchedulerのみがリフレッシュを実行することを確認する

**期待結果**:

- `autoRefreshToken: false`が設定されている
- リフレッシュ処理がTokenRefreshSchedulerからのみ実行される
- SDKの自動リフレッシュとカスタムスケジューラーの二重リフレッシュが発生しない
- SDKのAPI呼び出し時にトークン期限切れが検出されても、SDK側からリフレッシュが発行されない
