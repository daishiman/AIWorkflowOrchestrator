# Google OAuth 設定手順

ElectronアプリでGoogle OAuth認証を有効にするための設定手順です。

## 前提条件

- Supabaseプロジェクトが作成済み
- Google Cloud Consoleへのアクセス権限

## 1. Google Cloud Console での設定

### 1.1 OAuth 同意画面の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. **APIs & Services** → **OAuth consent screen** に移動
4. User Type を選択:
   - **External**: 一般ユーザー向け（本番環境）
   - **Internal**: Google Workspace組織内のみ（開発/テスト）
5. アプリ情報を入力:
   - App name: `AIWorkflowOrchestrator`
   - User support email: 自分のメールアドレス
   - Developer contact email: 自分のメールアドレス
6. スコープを追加:
   - `email`
   - `profile`
   - `openid`

### 1.2 OAuth クライアントIDの作成

1. **APIs & Services** → **Credentials** に移動
2. **+ CREATE CREDENTIALS** → **OAuth client ID** をクリック
3. Application type: **Web application**
4. Name: `AIWorkflowOrchestrator Desktop`
5. **Authorized redirect URIs** に以下を追加:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   例: `https://sfofowcpbaehxzroqswx.supabase.co/auth/v1/callback`
6. **CREATE** をクリック
7. **Client ID** と **Client Secret** をコピー

## 2. Supabase Dashboard での設定

### 2.1 Google Provider の有効化

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. **Authentication** → **Providers** に移動
4. **Google** を有効化
5. 以下を入力:
   - **Client ID**: Google Cloud Consoleでコピーした Client ID
   - **Client Secret**: Google Cloud Consoleでコピーした Client Secret
6. **Save** をクリック

### 2.2 Redirect URLs の設定

1. **Authentication** → **URL Configuration** に移動
2. **Site URL** を設定:
   ```
   aiworkflow://auth/callback
   ```
3. **Redirect URLs** に以下を追加:
   ```
   aiworkflow://auth/callback
   ```
4. **Save** をクリック

## 3. 環境変数の確認

`.env` ファイルに以下が設定されていることを確認:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_AUTH_REDIRECT_URL=aiworkflow://auth/callback
```

## 4. 動作確認

1. アプリを起動: `pnpm dev`
2. 設定画面からGoogleログインボタンをクリック
3. ブラウザでGoogle認証画面が開く
4. 認証後、アプリに自動的にリダイレクトされる

## トラブルシューティング

### エラー: `redirect_uri_mismatch`

**原因**: Google Cloud ConsoleのAuthorized redirect URIsにSupabaseのコールバックURLが登録されていない

**解決方法**:

1. Google Cloud Console → Credentials → OAuth 2.0 Client IDs
2. 該当のクライアントを編集
3. Authorized redirect URIs に追加:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

### エラー: `access_denied`

**原因**: OAuth同意画面がテストモードで、テストユーザーとして登録されていない

**解決方法**:

1. Google Cloud Console → OAuth consent screen
2. **Test users** セクションでメールアドレスを追加
3. または **PUBLISH APP** で本番モードに変更

### アプリにリダイレクトされない

**原因**: カスタムプロトコル `aiworkflow://` がOSに登録されていない

**解決方法**:

- 開発環境: アプリを一度完全に終了して再起動
- 本番環境: アプリをインストーラーから再インストール

## 関連ドキュメント

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
