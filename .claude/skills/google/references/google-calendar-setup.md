# Google Calendar API セットアップガイド

Google Calendar API を使用するには、Google Cloud Console で認証情報を設定する必要があります。
**サービスアカウント方式（推奨）** または **OAuth 2.0 方式** のいずれかを選択してください。

---

## 方式A: サービスアカウント（推奨・自動化向け）

### 1. Google Cloud プロジェクトの作成（既存があればスキップ）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成、または既存を選択

### 2. Google Calendar API の有効化

```
APIとサービス → ライブラリ → "Google Calendar API" を検索 → 有効にする
```

### 3. サービスアカウントの作成

```
IAMと管理 → サービスアカウント → サービスアカウントを作成
  名前: calendar-reader
  ロール: （プロジェクトロールは不要）
  → 作成して続行
```

### 4. JSON キーのダウンロード

```
作成したサービスアカウント → キー → 鍵を追加 → 新しい鍵を作成 → JSON
```

ダウンロードした JSON ファイルを安全な場所に保存します（例: `~/.secrets/calendar-key.json`）。

### 5. カレンダーの共有設定

Google Calendar を開き、対象カレンダーの設定で：

```
設定と共有 → 特定のユーザーとの共有 → ユーザーを追加
  → サービスアカウントのメールアドレス（xxx@yyy.iam.gserviceaccount.com）
  → 権限: 「予定の詳細を見る（閲覧者）」
```

### 6. 環境変数の設定

```bash
# ~/.zshrc または ~/.bashrc に追記
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.secrets/calendar-key.json"
export GOOGLE_CALENDAR_ID="your-email@gmail.com"  # または "primary"

# または Base64 エンコード（CI/CD 環境向け）
export GOOGLE_SERVICE_ACCOUNT_JSON=$(base64 -i ~/.secrets/calendar-key.json)
```

---

## 方式B: OAuth 2.0（個人アカウント向け）

### 1. OAuth クライアント ID の作成

```
APIとサービス → 認証情報 → 認証情報を作成 → OAuth クライアント ID
  アプリケーションの種類: デスクトップアプリ
  名前: calendar-slack-skill
```

クライアント ID とクライアントシークレットを記録します。

### 2. リフレッシュトークンの取得

```bash
# 以下の URL をブラウザで開く（client_id を置き換え）
https://accounts.google.com/o/oauth2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=urn:ietf:wg:oauth:2.0:oob&
  scope=https://www.googleapis.com/auth/calendar.readonly&
  response_type=code&
  access_type=offline

# 認証コードを取得後、以下で refresh_token を取得
curl -X POST https://oauth2.googleapis.com/token \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
  -d "grant_type=authorization_code"
```

### 3. 環境変数の設定

```bash
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REFRESH_TOKEN="your-refresh-token"
export GOOGLE_CALENDAR_ID="primary"
```

---

## カレンダー ID の確認方法

Google Calendar → 設定 → 対象カレンダー → 「カレンダーの統合」セクション
→ **カレンダー ID** をコピー（例: `abc123@group.calendar.google.com`）

個人カレンダーの場合は `primary` が使えます。

---

## トラブルシューティング

| エラー | 原因 | 対処 |
|---|---|---|
| `UNAUTHENTICATED` | JSON キーが無効 | キーファイルのパスと内容を確認 |
| `notFound` | カレンダー ID が存在しない | カレンダー ID を再確認 |
| `forbidden` | アクセス権がない | カレンダーにサービスアカウントを共有 |
| `invalid_grant` | リフレッシュトークンが期限切れ | 再認証して新しいトークンを取得 |
