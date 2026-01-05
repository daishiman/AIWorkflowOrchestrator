#!/bin/bash
# OAuth 2.0 フロー図を Mermaid 形式で生成するスクリプト

set -e

show_help() {
  echo "OAuth 2.0 フロー図生成"
  echo ""
  echo "Usage: generate-auth-flow-diagram.sh <フロータイプ> [出力ファイル]"
  echo ""
  echo "フロータイプ:"
  echo "  - authorization-code    : Authorization Code Flow"
  echo "  - pkce                  : Authorization Code Flow + PKCE"
  echo "  - client-credentials    : Client Credentials Flow"
  echo "  - device-code           : Device Code Flow"
  echo "  - refresh-token         : Refresh Token Flow"
  echo ""
  echo "例: generate-auth-flow-diagram.sh pkce auth-flow.md"
}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_help
  exit 0
fi

if [ $# -lt 1 ]; then
  show_help
  exit 2
fi

FLOW_TYPE=$1
OUTPUT_FILE=${2:-"auth-flow-${FLOW_TYPE}.md"}

echo "📝 ${FLOW_TYPE} フロー図を生成します"
echo "📄 出力ファイル: ${OUTPUT_FILE}"
echo ""

# フロータイプに応じた Mermaid 図を生成
case $FLOW_TYPE in
  "authorization-code")
    cat > "$OUTPUT_FILE" << 'DOC'
# Authorization Code Flow

## フロー図

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Client as クライアントアプリ
    participant AuthServer as 認可サーバー
    participant ResourceServer as リソースサーバー

    User->>Client: 1. ログインボタンクリック
    Client->>AuthServer: 2. GET /authorize<br/>?response_type=code<br/>&client_id=XXX<br/>&redirect_uri=XXX<br/>&scope=read
    AuthServer->>User: 3. ログイン画面表示
    User->>AuthServer: 4. 認証情報入力
    AuthServer->>User: 5. 同意画面表示
    User->>AuthServer: 6. 許可
    AuthServer->>Client: 7. リダイレクト<br/>redirect_uri?code=AUTH_CODE
    Client->>AuthServer: 8. POST /token<br/>(code + client_secret)
    AuthServer->>Client: 9. access_token + refresh_token
    Client->>ResourceServer: 10. GET /api/resource<br/>Authorization: Bearer token
    ResourceServer->>Client: 11. リソースデータ
```

## ステップ解説

### 1-6: 認可コード取得
ユーザーが認証・許可を行い、認可コードを取得します。

### 7-8: トークン交換
クライアントは認可コードをアクセストークンと交換します。

**セキュリティポイント:**
- client_secret は必ずサーバーサイドで保管
- 認可コードは1回のみ使用可能
- redirect_uri は事前登録が必須

### 9-11: リソースアクセス
取得したアクセストークンでAPIにアクセスします。

## 実装例

### 1. 認可リクエスト

```http
GET /authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://your-app.com/callback&scope=read+write HTTP/1.1
Host: auth.example.com
```

### 2. トークンリクエスト

```bash
curl -X POST "https://auth.example.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://your-app.com/callback"
```

### 3. レスポンス

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200..."
}
```
DOC
    ;;

  "pkce")
    cat > "$OUTPUT_FILE" << 'DOC'
# Authorization Code Flow + PKCE

## フロー図

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Client as クライアント<br/>(SPA/Mobile)
    participant AuthServer as 認可サーバー

    User->>Client: 1. ログイン開始
    Client->>Client: 2. code_verifier 生成
    Client->>Client: 3. code_challenge 作成
    Client->>AuthServer: 4. /authorize (code_challenge)
    AuthServer->>User: 5. 認証画面
    User->>AuthServer: 6. ログイン
    AuthServer->>Client: 7. リダイレクト (code)
    Client->>AuthServer: 8. /token (code + code_verifier)
    AuthServer->>Client: 9. access_token + refresh_token
```

## セキュリティポイント

- code_verifier はクライアント側で保持
- code_challenge は SHA-256 で生成
- 公開クライアントで client_secret を使わない
DOC
    ;;

  "client-credentials")
    cat > "$OUTPUT_FILE" << 'DOC'
# Client Credentials Flow

## フロー図

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant AuthServer as 認可サーバー
    participant ResourceServer as リソースサーバー

    Client->>AuthServer: 1. /token (client_id + client_secret)
    AuthServer->>Client: 2. access_token
    Client->>ResourceServer: 3. APIリクエスト (Bearer)
    ResourceServer->>Client: 4. レスポンス
```

## セキュリティポイント

- client_secret の管理を厳格に行う
- トークンの有効期限を短く設定
DOC
    ;;

  "device-code")
    cat > "$OUTPUT_FILE" << 'DOC'
# Device Code Flow

## フロー図

```mermaid
sequenceDiagram
    participant Device as デバイス
    participant User as ユーザー
    participant AuthServer as 認可サーバー

    Device->>AuthServer: 1. デバイスコード要求
    AuthServer->>Device: 2. device_code + user_code
    Device->>User: 3. user_code を提示
    User->>AuthServer: 4. ブラウザで認証
    Device->>AuthServer: 5. トークンポーリング
    AuthServer->>Device: 6. access_token
```

## セキュリティポイント

- user_code の有効期限を短くする
- ポーリング間隔を適切に設定
DOC
    ;;

  "refresh-token")
    cat > "$OUTPUT_FILE" << 'DOC'
# Refresh Token Flow

## フロー図

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant AuthServer as 認可サーバー

    Client->>AuthServer: 1. /token (refresh_token)
    AuthServer->>Client: 2. 新しい access_token
```

## セキュリティポイント

- refresh_token のローテーションを行う
- 盗難検知時は即時失効
DOC
    ;;

  *)
    echo "❌ 不明なフロータイプ: $FLOW_TYPE"
    show_help
    exit 2
    ;;
esac

echo "✅ フロー図を生成しました: ${OUTPUT_FILE}"
