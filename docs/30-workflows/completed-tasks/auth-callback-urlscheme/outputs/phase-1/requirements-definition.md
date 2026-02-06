# Phase 1: 要件定義書

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | TASK-AUTH-CALLBACK-001          |
| Phase    | 1                               |
| 作成日   | 2026-02-06                      |
| 目的     | OAuth認証コールバックの要件定義 |

---

## 機能要件

### FR-001: Authorization Code Flow + PKCE によるOAuth開始

- Supabase OAuthをAuthorization Code Flow + PKCEで開始する
- `flowType: 'pkce'` オプションを指定してSupabase Auth APIを呼び出す
- 対応プロバイダー: Google, GitHub, Discord

### FR-002: PKCE code_verifier/code_challenge 生成

- `crypto.randomBytes(32)` でcode_verifierを生成する
- code_verifierはBase64URL エンコード（43-128文字、RFC 7636 Section 4.1準拠）
- code_challengeはcode_verifierのSHA-256ハッシュをBase64URLエンコードして算出
- `code_challenge_method: 'S256'` を使用

### FR-003: State parameter 生成・保存

- OAuth開始時に`crypto.randomBytes(32)`で32バイト以上のランダム文字列を生成
- Base64URLエンコードしてstate parameterとする
- Main ProcessのMap（メモリ内）に保存し、5分間のTTLを設定

### FR-004: ローカルHTTPサーバー起動

- `http.createServer()` で127.0.0.1の動的ポートでHTTPサーバーを起動
- `server.listen(0, '127.0.0.1')` で空きポートを自動割当
- 外部ネットワークからアクセス不可（localhost限定）

### FR-005: HTTPサーバーでのコールバック受信

- HTTPサーバーの`/auth/callback`エンドポイントでauthorization_codeとstateを受信
- Query parameter（`?code=xxx&state=yyy`）からパラメータを抽出

### FR-006: State parameter 検証

- 受信したstateを保存済みの値と照合
- 不一致時は認証を拒否し、エラーHTMLレスポンスを返却
- 検証後、使用済みstateを即座にMapから削除（リプレイ攻撃防止）

### FR-007: トークン交換

- authorization_codeとcode_verifierでSupabase Token Endpointにリクエスト
- `supabase.auth.exchangeCodeForSession(code)` を使用
- トークン交換はMain Processで実行（Renderer非露出）

### FR-008: セッション確立

- トークン交換成功後、`supabase.auth.setSession()` でセッションを確立
- ユーザー情報を取得し、AUTH_STATE_CHANGED IPCイベントでRendererに通知

### FR-009: Refresh Token 暗号化保存

- `electron.safeStorage.encryptString()` でRefresh Tokenを暗号化
- 暗号化不可環境では警告ログを出力し、平文保存にフォールバック

### FR-010: HTTPサーバー停止

- コールバック受信後（成功・失敗問わず）にHTTPサーバーを停止
- `server.close()` を呼び出し、ポートを解放
- タイムアウト（30秒）でも自動停止

### FR-011: 認証完了HTMLレスポンス

- 認証成功時: 「認証が完了しました。このタブを閉じてアプリケーションに戻ってください」HTMLを返却
- 認証失敗時: エラー内容を含むHTMLを返却
- HTMLにはJavaScriptで自動的にウィンドウ閉鎖を試みるスクリプトを含む

### FR-012: Electronウィンドウフォアグラウンド表示

- 認証完了後、`mainWindow.show()` + `mainWindow.focus()` でアプリをフォアグラウンドに
- macOS: `app.dock.bounce('critical')` でDockアイコンをバウンス

### FR-013: カスタムURLスキーム登録

- `aiworkflow://` をOSに登録（パッケージ版UX向上用）
- macOS: `CFBundleURLTypes` で登録（既存electron-builder.ymlに設定済み）
- Windows: NSISインストーラーで自動登録
- Linux: `mimeTypes` で `x-scheme-handler/aiworkflow` を登録
- 開発ビルドでは `app.setAsDefaultProtocolClient('aiworkflow')` で動的登録

### FR-014: IPC経由エラー通知

- 認証エラー時、`webContents.send(AUTH_STATE_CHANGED, { error })` でRendererに通知
- エラーメッセージはサニタイズ（パスワード・トークン・DB情報除去）
- 既存の `sanitizeErrorMessage()` を再利用

### FR-015: 全OAuthプロバイダーサポート

- Google, GitHub, Discord の3プロバイダーを全てサポート
- 各プロバイダーで同一のPKCEフローを使用
- プロバイダー固有のスコープ設定を維持

### FR-016: devMockAuth.ts 復元

- `isDevMode()` 内の `return true;` 一時修正を削除
- 本来のロジック（E2E環境フラグ、localStorage、URLパラメータによる判定）を復元
- 開発環境でも実際のOAuth認証フローが使用される

### FR-017: HTTPサーバーポート通知

- HTTPサーバー起動後、割り当てられたポート番号をRendererに通知
- RendererがOAuth URLの`redirect_uri`パラメータにポート番号を含められるようにする
- IPC経由（`auth:callback-server-port`）で通知

---

## 非機能要件

### NFR-001: 処理時間（コールバック→セッション確立）

- 基準値: 500ms以内
- 測定範囲: HTTPサーバーがリクエスト受信してからセッション確立完了まで
- ネットワーク遅延（Supabaseトークン交換）は除外

### NFR-002: HTTPサーバー起動時間

- 基準値: 200ms以内
- 測定範囲: `server.listen()` 呼び出しからポート割当完了まで

### NFR-003: クロスプラットフォーム対応

- macOS 12+
- Windows 10+
- Ubuntu 22.04+
- 各プラットフォームで認証フローが正常完了すること

### NFR-004: 開発ビルド動作

- `pnpm --filter @repo/desktop dev` で認証フローが動作
- パッケージ化不要で開発者がOAuth認証をテスト可能

### NFR-005: PKCE code_verifier 仕様

- 43-128文字のBase64URL文字列
- RFC 7636 Section 4.1準拠
- 文字セット: `[A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"`

### NFR-006: State parameter エントロピー

- 32バイト以上のランダム文字列
- `crypto.randomBytes()` による暗号学的に安全な乱数
- CSRF対策として十分なエントロピー（256ビット以上）

### NFR-007: HTTPサーバー自動停止

- 認証完了後30秒以内にHTTPサーバーを停止
- リソースリーク防止のためのタイムアウト機構

### NFR-008: 暗号化不可環境フォールバック

- `electron.safeStorage.isEncryptionAvailable()` がfalseの場合
- 警告をログに出力しつつ、認証自体は継続可能
- セキュリティレベルの低下をユーザーに通知

---

## 技術的負債解消

| DEBT ID      | 内容                          | 対応     | 解消方法                            |
| ------------ | ----------------------------- | -------- | ----------------------------------- |
| DEBT-SEC-001 | State parameter検証未実装     | 本タスク | FR-003, FR-006 で実装               |
| DEBT-SEC-002 | PKCE未実装                    | 本タスク | FR-001, FR-002, FR-007 で実装       |
| DEBT-SEC-003 | カスタムプロトコルURL詳細検証 | 本タスク | FR-013 + HTTPサーバー方式で根本解決 |
