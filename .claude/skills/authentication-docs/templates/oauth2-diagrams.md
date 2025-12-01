# OAuth 2.0 フロー図テンプレート

## Authorization Code Flow

```mermaid
sequenceDiagram
    participant User
    participant Client as Client App
    participant AuthServer as Authorization Server
    participant ResourceServer as Resource Server

    User->>Client: 1. ログインボタンクリック
    Client->>AuthServer: 2. GET /authorize?response_type=code&client_id=...
    AuthServer->>User: 3. ログイン画面表示
    User->>AuthServer: 4. ログイン情報入力
    AuthServer->>User: 5. 同意画面表示
    User->>AuthServer: 6. 許可
    AuthServer->>Client: 7. redirect_uri?code=AUTH_CODE
    Client->>AuthServer: 8. POST /token (code + client_secret)
    AuthServer->>Client: 9. access_token + refresh_token
    Client->>ResourceServer: 10. GET /api/resource (Bearer token)
    ResourceServer->>Client: 11. リソースデータ
```

---

## Authorization Code Flow + PKCE

```mermaid
sequenceDiagram
    participant User
    participant Client as Client (SPA/Mobile)
    participant AuthServer as Authorization Server

    Client->>Client: 1. code_verifier生成
    Client->>Client: 2. code_challenge = SHA256(code_verifier)
    Client->>AuthServer: 3. GET /authorize + code_challenge
    AuthServer->>User: 4. ログイン・同意
    User->>AuthServer: 5. 許可
    AuthServer->>Client: 6. redirect_uri?code=AUTH_CODE
    Client->>AuthServer: 7. POST /token (code + code_verifier)
    AuthServer->>AuthServer: 8. SHA256(code_verifier) == code_challenge?
    AuthServer->>Client: 9. access_token
```

---

## Client Credentials Flow

```mermaid
sequenceDiagram
    participant Client as Client (Server)
    participant AuthServer as Authorization Server
    participant ResourceServer as Resource Server

    Client->>AuthServer: 1. POST /token (client_id + client_secret)
    AuthServer->>Client: 2. access_token
    Client->>ResourceServer: 3. GET /api/resource (Bearer token)
    ResourceServer->>Client: 4. リソースデータ
```

---

## Device Code Flow

```mermaid
sequenceDiagram
    participant Device as Device (CLI/TV)
    participant AuthServer as Authorization Server
    participant User as User (Browser)

    Device->>AuthServer: 1. POST /device/code
    AuthServer->>Device: 2. device_code + user_code + verification_uri
    Device->>User: 3. 「URLにアクセスしてコード入力」
    User->>AuthServer: 4. verification_uriにアクセス
    User->>AuthServer: 5. user_code入力 + ログイン

    loop ポーリング
        Device->>AuthServer: 6. POST /token (device_code)
        alt 認証待ち
            AuthServer->>Device: authorization_pending
        else 認証完了
            AuthServer->>Device: access_token
        end
    end
```

---

## Refresh Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthServer as Authorization Server
    participant ResourceServer as Resource Server

    Client->>ResourceServer: 1. GET /api/resource (期限切れトークン)
    ResourceServer->>Client: 2. 401 Unauthorized
    Client->>AuthServer: 3. POST /token (refresh_token)
    AuthServer->>Client: 4. 新しい access_token
    Client->>ResourceServer: 5. GET /api/resource (新トークン)
    ResourceServer->>Client: 6. リソースデータ
```

---

## Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> AuthorizationRequest: ログイン開始
    AuthorizationRequest --> AuthorizationGrant: 認可コード取得
    AuthorizationGrant --> TokenRequest: トークンリクエスト
    TokenRequest --> AccessTokenActive: アクセストークン取得

    AccessTokenActive --> ResourceAccess: API呼び出し
    ResourceAccess --> AccessTokenActive: 成功

    AccessTokenActive --> AccessTokenExpired: 有効期限切れ
    AccessTokenExpired --> RefreshRequest: リフレッシュ
    RefreshRequest --> AccessTokenActive: 新トークン取得
    RefreshRequest --> [*]: リフレッシュトークン期限切れ

    AccessTokenActive --> TokenRevoked: ログアウト/無効化
    TokenRevoked --> [*]
```

---

## スコープ階層図

```mermaid
graph TD
    admin[admin] --> users_write[users:write]
    admin --> orders_write[orders:write]
    admin --> settings_write[settings:write]

    users_write --> users_read[users:read]
    orders_write --> orders_read[orders:read]
    settings_write --> settings_read[settings:read]

    read[read] --> users_read
    read --> orders_read
    read --> settings_read

    write[write] --> users_write
    write --> orders_write
```

---

## 認証エンドポイント構成

```mermaid
graph LR
    subgraph "Authorization Server"
        authorize[/authorize]
        token[/token]
        revoke[/revoke]
        userinfo[/userinfo]
        jwks[/.well-known/jwks.json]
        config[/.well-known/openid-configuration]
    end

    subgraph "Client"
        login[ログイン]
        callback[コールバック]
        api_call[API呼び出し]
    end

    subgraph "Resource Server"
        api[/api/...]
    end

    login --> authorize
    authorize --> callback
    callback --> token
    token --> api_call
    api_call --> api
```

---

## エラーハンドリングフロー

```mermaid
flowchart TD
    A[APIリクエスト] --> B{ステータスコード}

    B -->|200-299| C[成功処理]
    B -->|401| D{エラー種別}
    B -->|403| E[権限不足エラー表示]
    B -->|429| F[レート制限待機]
    B -->|500-599| G[リトライ処理]

    D -->|token_expired| H[リフレッシュ試行]
    D -->|invalid_token| I[再ログイン]

    H -->|成功| A
    H -->|失敗| I

    F -->|待機後| A
    G -->|リトライ| A
    G -->|最大回数超過| J[エラー表示]
```

---

## 使用方法

### Mermaidの埋め込み

**Markdown:**

````markdown
```mermaid
sequenceDiagram
    ...
```
````

**HTML:**

```html
<div class="mermaid">
sequenceDiagram
    ...
</div>
<script src="https://cdn.jsdelivr.net/pnpm/mermaid/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:true});</script>
```

### カスタマイズ

```javascript
mermaid.initialize({
  theme: 'default',  // default, forest, dark, neutral
  securityLevel: 'loose',
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65
  }
});
```
