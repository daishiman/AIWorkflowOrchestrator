# OpenAPI セキュリティスキーム設計

## セキュリティスキームタイプ

### 1. API Key認証

```yaml
components:
  securitySchemes:
    # ヘッダー方式
    ApiKeyHeader:
      type: apiKey
      in: header
      name: X-API-Key
      description: |
        APIキー認証。リクエストヘッダーに含めてください。

        例: `X-API-Key: your-api-key-here`

    # クエリパラメータ方式
    ApiKeyQuery:
      type: apiKey
      in: query
      name: api_key
      description: |
        APIキー認証（URLパラメータ）。
        セキュリティ上、ヘッダー方式を推奨します。

    # Cookie方式
    ApiKeyCookie:
      type: apiKey
      in: cookie
      name: api_session
      description: Cookieベースのセッション認証
```

### 2. HTTP認証

```yaml
components:
  securitySchemes:
    # Bearer認証（JWT）
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT Bearer認証。

        ヘッダー形式:
        `Authorization: Bearer <jwt-token>`

        トークン取得: POST /auth/login
        トークン更新: POST /auth/refresh

    # Basic認証
    BasicAuth:
      type: http
      scheme: basic
      description: |
        HTTP Basic認証。

        ヘッダー形式:
        `Authorization: Basic <base64(username:password)>`

        ⚠️ 開発環境のみ使用を推奨

    # Digest認証
    DigestAuth:
      type: http
      scheme: digest
      description: HTTP Digest認証
```

### 3. OAuth 2.0

```yaml
components:
  securitySchemes:
    # Authorization Code Flow（推奨）
    OAuth2AuthCode:
      type: oauth2
      description: |
        OAuth 2.0 Authorization Code Flow。
        Webアプリケーション向けの標準的なフロー。
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/authorize
          tokenUrl: https://auth.example.com/token
          refreshUrl: https://auth.example.com/refresh
          scopes:
            read:users: ユーザー情報の読み取り
            write:users: ユーザー情報の書き込み
            read:workflows: ワークフローの読み取り
            write:workflows: ワークフローの書き込み
            admin: 管理者権限

    # Authorization Code + PKCE（SPAモバイル向け）
    OAuth2PKCE:
      type: oauth2
      description: |
        OAuth 2.0 Authorization Code Flow with PKCE。
        SPA・モバイルアプリケーション向け。
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/authorize
          tokenUrl: https://auth.example.com/token
          scopes:
            read: リソースの読み取り
            write: リソースの書き込み
      x-pkce-required: true

    # Client Credentials（M2M向け）
    OAuth2ClientCredentials:
      type: oauth2
      description: |
        OAuth 2.0 Client Credentials Flow。
        サーバー間通信（M2M）向け。
      flows:
        clientCredentials:
          tokenUrl: https://auth.example.com/token
          scopes:
            service: サービス間通信

    # Implicit Flow（非推奨）
    OAuth2Implicit:
      type: oauth2
      description: |
        ⚠️ 非推奨: セキュリティ上の理由により、
        PKCEを使用したAuthorization Code Flowを推奨します。
      flows:
        implicit:
          authorizationUrl: https://auth.example.com/authorize
          scopes:
            read: リソースの読み取り
      deprecated: true
```

### 4. OpenID Connect

```yaml
components:
  securitySchemes:
    OpenIdConnect:
      type: openIdConnect
      openIdConnectUrl: https://auth.example.com/.well-known/openid-configuration
      description: |
        OpenID Connect認証。
        Discovery URLから自動的に設定を取得します。
```

---

## セキュリティ適用パターン

### グローバル適用

```yaml
# すべてのエンドポイントに適用
security:
  - BearerAuth: []
```

### エンドポイント別適用

```yaml
paths:
  # 認証不要（公開エンドポイント）
  /health:
    get:
      security: []  # グローバル設定をオーバーライド
      responses:
        '200':
          description: OK

  # 特定スコープ必須
  /admin/users:
    get:
      security:
        - OAuth2AuthCode:
            - admin
            - read:users
      responses:
        '200':
          description: ユーザー一覧

  # 複数の認証方式（OR条件）
  /api/data:
    get:
      security:
        - BearerAuth: []
        - ApiKeyHeader: []
      responses:
        '200':
          description: データ

  # 複数の認証方式（AND条件）
  /secure/critical:
    post:
      security:
        - BearerAuth: []
          ApiKeyHeader: []  # 同じ配列内 = AND
      responses:
        '200':
          description: 両方の認証が必要
```

---

## スコープ設計

### 命名規則

```yaml
# リソース:アクション 形式
scopes:
  # 読み取り権限
  read:users: ユーザー情報の読み取り
  read:workflows: ワークフローの読み取り
  read:files: ファイルの読み取り

  # 書き込み権限
  write:users: ユーザー情報の作成・更新
  write:workflows: ワークフローの作成・更新
  write:files: ファイルのアップロード・更新

  # 削除権限
  delete:users: ユーザーの削除
  delete:workflows: ワークフローの削除

  # 特権
  admin: 管理者権限（すべてのリソースへのフルアクセス）
  sudo: スーパーユーザー権限
```

### 階層的スコープ

```yaml
scopes:
  # 粒度の細かいスコープ
  users:read: ユーザー読み取り
  users:write: ユーザー書き込み
  users:delete: ユーザー削除
  users:admin: ユーザー管理（read + write + delete）

  # 包括的スコープ
  all:read: すべてのリソースの読み取り
  all:write: すべてのリソースの書き込み
  all: すべてのリソースへのフルアクセス
```

---

## セキュリティ関連ヘッダー

### リクエストヘッダー

```yaml
components:
  parameters:
    AuthorizationHeader:
      name: Authorization
      in: header
      required: true
      schema:
        type: string
        pattern: '^Bearer .+$'
      description: Bearer トークン

    ApiKeyHeader:
      name: X-API-Key
      in: header
      required: true
      schema:
        type: string
        minLength: 32
        maxLength: 64
      description: APIキー

    RequestIdHeader:
      name: X-Request-ID
      in: header
      required: false
      schema:
        type: string
        format: uuid
      description: リクエスト追跡ID
```

### レスポンスヘッダー

```yaml
components:
  headers:
    X-Rate-Limit-Limit:
      description: レート制限の上限
      schema:
        type: integer

    X-Rate-Limit-Remaining:
      description: 残りリクエスト数
      schema:
        type: integer

    X-Rate-Limit-Reset:
      description: リセット時刻（Unix timestamp）
      schema:
        type: integer

    Retry-After:
      description: 再試行までの待機秒数
      schema:
        type: integer
```

---

## エラーレスポンス

### 認証エラー（401）

```yaml
components:
  responses:
    Unauthorized:
      description: 認証が必要です
      headers:
        WWW-Authenticate:
          schema:
            type: string
          description: 認証方式
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            missing_token:
              summary: トークンなし
              value:
                success: false
                error:
                  code: "AUTH_TOKEN_MISSING"
                  message: "認証トークンが必要です"
                  retryable: false
            invalid_token:
              summary: 無効なトークン
              value:
                success: false
                error:
                  code: "AUTH_TOKEN_INVALID"
                  message: "認証トークンが無効です"
                  retryable: false
            expired_token:
              summary: 期限切れトークン
              value:
                success: false
                error:
                  code: "AUTH_TOKEN_EXPIRED"
                  message: "認証トークンの有効期限が切れています"
                  retryable: true
                  details:
                    action: "POST /auth/refresh でトークンを更新してください"
```

### 認可エラー（403）

```yaml
components:
  responses:
    Forbidden:
      description: アクセス権限がありません
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            insufficient_scope:
              summary: スコープ不足
              value:
                success: false
                error:
                  code: "AUTH_INSUFFICIENT_SCOPE"
                  message: "このリソースへのアクセス権限がありません"
                  details:
                    required_scopes:
                      - "write:users"
                    current_scopes:
                      - "read:users"
                  retryable: false
            ip_restricted:
              summary: IP制限
              value:
                success: false
                error:
                  code: "AUTH_IP_RESTRICTED"
                  message: "このIPアドレスからのアクセスは許可されていません"
                  retryable: false
```

---

## ベストプラクティス

### 推奨事項

1. **HTTPS必須**: すべての認証エンドポイントはHTTPSを使用
2. **短いトークン有効期限**: アクセストークンは15分〜1時間
3. **リフレッシュトークン**: 長期セッションはリフレッシュトークンで
4. **スコープ最小化**: 必要最小限のスコープのみ付与
5. **ログ記録**: 認証イベントのログを記録

### 避けるべき事項

1. **Implicit Flow**: セキュリティ上非推奨、PKCEを使用
2. **URLパラメータでのトークン送信**: ログに残るため危険
3. **長期有効トークン**: 漏洩時のリスクが高い
4. **過剰なスコープ**: 必要以上の権限を付与しない
