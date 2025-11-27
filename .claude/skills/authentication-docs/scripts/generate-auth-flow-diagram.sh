#!/bin/bash
# OAuth 2.0 フロー図を Mermaid 形式で生成するスクリプト

set -e

echo "🎨 OAuth 2.0 フロー図生成スクリプト"
echo ""

# 引数チェック
if [ $# -lt 1 ]; then
  echo "使用方法: generate-auth-flow-diagram.sh <フロータイプ> [出力ファイル]"
  echo ""
  echo "フロータイプ:"
  echo "  - authorization-code    : Authorization Code Flow"
  echo "  - pkce                  : Authorization Code Flow + PKCE"
  echo "  - client-credentials    : Client Credentials Flow"
  echo "  - device-code           : Device Code Flow"
  echo "  - refresh-token         : Refresh Token Flow"
  echo ""
  echo "例: generate-auth-flow-diagram.sh pkce auth-flow.md"
  exit 1
fi

FLOW_TYPE=$1
OUTPUT_FILE=${2:-"auth-flow-${FLOW_TYPE}.md"}

echo "📝 ${FLOW_TYPE} フロー図を生成します"
echo "📄 出力ファイル: ${OUTPUT_FILE}"
echo ""

# フロータイプに応じた Mermaid 図を生成
case $FLOW_TYPE in
  "authorization-code")
    cat > "$OUTPUT_FILE" << 'EOF'
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

\`\`\`http
GET /authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://your-app.com/callback&scope=read+write HTTP/1.1
Host: auth.example.com
\`\`\`

### 2. トークンリクエスト

\`\`\`bash
curl -X POST "https://auth.example.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://your-app.com/callback"
\`\`\`

### 3. レスポンス

\`\`\`json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200..."
}
\`\`\`
EOF
    ;;

  "pkce")
    cat > "$OUTPUT_FILE" << 'EOF'
# Authorization Code Flow + PKCE

## フロー図

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Client as クライアント<br/>(SPA/Mobile)
    participant AuthServer as 認可サーバー

    Client->>Client: 1. code_verifier生成<br/>(ランダム文字列)
    Client->>Client: 2. code_challenge生成<br/>SHA256(code_verifier)
    Client->>AuthServer: 3. GET /authorize<br/>+ code_challenge
    AuthServer->>User: 4. ログイン・同意画面
    User->>AuthServer: 5. 認証・許可
    AuthServer->>Client: 6. リダイレクト<br/>redirect_uri?code=AUTH_CODE
    Client->>AuthServer: 7. POST /token<br/>(code + code_verifier)
    AuthServer->>AuthServer: 8. 検証<br/>SHA256(code_verifier) == code_challenge?
    AuthServer->>Client: 9. access_token + refresh_token
```

## PKCE のメリット

### セキュリティ強化
- **client_secret 不要**: SPA や Mobile アプリでも安全
- **認可コード横取り防止**: code_verifier がないとトークン取得不可
- **推奨**: すべての OAuth 2.0 クライアントで PKCE を使用

## 実装例

### 1. code_verifier と code_challenge の生成

\`\`\`javascript
// code_verifier: ランダム文字列 (43-128文字)
const code_verifier = generateRandomString(128);

// code_challenge: code_verifier の SHA256 ハッシュ (Base64 URL エンコード)
const code_challenge = base64UrlEncode(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code_verifier))
);

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
\`\`\`

### 2. 認可リクエスト

\`\`\`http
GET /authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://your-app.com/callback&code_challenge=CHALLENGE&code_challenge_method=S256&scope=read HTTP/1.1
Host: auth.example.com
\`\`\`

### 3. トークンリクエスト

\`\`\`bash
curl -X POST "https://auth.example.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "code_verifier=VERIFIER" \
  -d "redirect_uri=https://your-app.com/callback"
\`\`\`
EOF
    ;;

  "client-credentials")
    cat > "$OUTPUT_FILE" << 'EOF'
# Client Credentials Flow

## フロー図

```mermaid
sequenceDiagram
    participant Client as クライアント<br/>(サーバー)
    participant AuthServer as 認可サーバー
    participant ResourceServer as リソースサーバー

    Client->>AuthServer: 1. POST /token<br/>(client_id + client_secret)
    AuthServer->>Client: 2. access_token
    Client->>ResourceServer: 3. GET /api/resource<br/>Authorization: Bearer token
    ResourceServer->>Client: 4. リソースデータ
```

## 用途

### Machine-to-Machine (M2M) 通信
- **バックエンドサービス間**: マイクロサービス通信
- **バッチ処理**: Cron ジョブ、データ同期
- **CI/CD パイプライン**: 自動デプロイ

### 特徴
- ✅ ユーザー不要
- ✅ シンプルなフロー
- ⚠️  クライアント認証が必須

## 実装例

### トークンリクエスト

\`\`\`bash
curl -X POST "https://auth.example.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=api:read api:write"
\`\`\`

### レスポンス

\`\`\`json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api:read api:write"
}
\`\`\`
EOF
    ;;

  "device-code")
    cat > "$OUTPUT_FILE" << 'EOF'
# Device Code Flow

## フロー図

```mermaid
sequenceDiagram
    participant Device as デバイス<br/>(CLI/TV)
    participant AuthServer as 認可サーバー
    participant User as ユーザー<br/>(Browser)

    Device->>AuthServer: 1. POST /device/code
    AuthServer->>Device: 2. device_code +<br/>user_code +<br/>verification_uri
    Device->>User: 3. 画面表示<br/>「URLにアクセスして<br/>コード入力」
    User->>AuthServer: 4. verification_uri<br/>にアクセス
    User->>AuthServer: 5. user_code入力<br/>+ ログイン
    loop ポーリング (5秒間隔)
        Device->>AuthServer: 6. POST /token<br/>(device_code)
        alt 認証待ち
            AuthServer->>Device: authorization_pending
        else 認証完了
            AuthServer->>Device: access_token
        end
    end
```

## 用途

### 入力制約のあるデバイス
- **スマートTV**: リモコンでの入力が困難
- **IoTデバイス**: キーボードなし
- **CLIツール**: ターミナルからブラウザに切り替え

## 実装例

### 1. デバイスコードリクエスト

\`\`\`bash
curl -X POST "https://auth.example.com/device/code" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "scope=read"
\`\`\`

### 2. レスポンス

\`\`\`json
{
  "device_code": "NGU5OWFiNjQ5YmQwNG",
  "user_code": "WDJB-MJHT",
  "verification_uri": "https://auth.example.com/device",
  "expires_in": 1800,
  "interval": 5
}
\`\`\`

### 3. トークンポーリング

\`\`\`bash
curl -X POST "https://auth.example.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "device_code=NGU5OWFiNjQ5YmQwNG"
\`\`\`
EOF
    ;;

  "refresh-token")
    cat > "$OUTPUT_FILE" << 'EOF'
# Refresh Token Flow

## フロー図

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant AuthServer as 認可サーバー
    participant ResourceServer as リソースサーバー

    Client->>ResourceServer: 1. GET /api/resource<br/>(期限切れトークン)
    ResourceServer->>Client: 2. 401 Unauthorized
    Client->>AuthServer: 3. POST /token<br/>(refresh_token)
    AuthServer->>Client: 4. 新しい access_token<br/>(+ 新しい refresh_token)
    Client->>ResourceServer: 5. GET /api/resource<br/>(新トークン)
    ResourceServer->>Client: 6. リソースデータ
```

## トークンのライフサイクル

| トークン種類 | 有効期限 | 保存場所 | 用途 |
|------------|---------|---------|------|
| **Access Token** | 短い (15分-1時間) | メモリ | API アクセス |
| **Refresh Token** | 長い (数日-数ヶ月) | Secure Storage | トークン更新 |

## 実装例

### トークンリフレッシュ

\`\`\`bash
curl -X POST "https://auth.example.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
\`\`\`

### レスポンス

\`\`\`json
{
  "access_token": "NEW_ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "NEW_REFRESH_TOKEN"
}
\`\`\`

## セキュリティベストプラクティス

1. **Refresh Token Rotation**: リフレッシュ時に新しい refresh_token を発行
2. **Secure Storage**: refresh_token は暗号化して保存
3. **Revocation**: 不正検知時に refresh_token を無効化
EOF
    ;;

  *)
    echo "❌ 不明なフロータイプ: $FLOW_TYPE"
    echo ""
    echo "有効なフロータイプ:"
    echo "  - authorization-code"
    echo "  - pkce"
    echo "  - client-credentials"
    echo "  - device-code"
    echo "  - refresh-token"
    exit 1
    ;;
esac

echo "✅ フロー図を生成しました: ${OUTPUT_FILE}"
echo ""
echo "📝 次のステップ:"
echo "   1. ${OUTPUT_FILE} をレビュー"
echo "   2. Mermaid 対応のエディタ/ツールで確認"
echo "   3. ドキュメントに埋め込み"
