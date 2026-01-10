# OpenAPI 3.x 構造ガイド

## 完全な仕様書構造

```yaml
openapi: 3.1.0

info:
  title: API名
  version: 1.0.0
  description: API説明（Markdown対応）
  termsOfService: https://example.com/terms
  contact:
    name: API Support
    url: https://example.com/support
    email: support@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging
  - url: http://localhost:3000/api/v1
    description: Development

tags:
  - name: Users
    description: ユーザー管理
  - name: Workflows
    description: ワークフロー操作

paths:
  /users:
    get:
      # エンドポイント定義
    post:
      # エンドポイント定義

components:
  schemas:
    # データモデル定義
  responses:
    # 共通レスポンス定義
  parameters:
    # 共通パラメータ定義
  securitySchemes:
    # 認証スキーム定義

security:
  - BearerAuth: []

externalDocs:
  description: 詳細ドキュメント
  url: https://docs.example.com
```

---

## Info セクション詳細

### 必須フィールド

| フィールド | 型     | 説明                         |
| ---------- | ------ | ---------------------------- |
| `title`    | string | API名（簡潔で説明的）        |
| `version`  | string | API バージョン（SemVer推奨） |

### 推奨フィールド

| フィールド    | 型     | 説明                     |
| ------------- | ------ | ------------------------ |
| `description` | string | 詳細説明（Markdown対応） |
| `contact`     | object | 連絡先情報               |
| `license`     | object | ライセンス情報           |

### 例

```yaml
info:
  title: AI Workflow Orchestrator API
  version: 1.0.0
  description: |
    AIワークフローオーケストレーションプラットフォームのREST API。

    ## 機能
    - ワークフロー管理
    - ファイル同期
    - 実行監視

    ## 認証
    すべてのエンドポイントはBearer認証が必要です。
  contact:
    name: API Support Team
    email: api-support@example.com
    url: https://example.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
```

---

## Servers セクション詳細

### 基本構造

```yaml
servers:
  - url: https://api.example.com/{version}
    description: Production Server
    variables:
      version:
        default: v1
        enum:
          - v1
          - v2
        description: APIバージョン
```

### 環境別サーバー定義パターン

```yaml
servers:
  # 本番環境
  - url: https://api.example.com/v1
    description: Production

  # ステージング環境
  - url: https://staging-api.example.com/v1
    description: Staging

  # 開発環境
  - url: http://localhost:3000/api/v1
    description: Local Development

  # Sandbox（外部開発者向け）
  - url: https://sandbox-api.example.com/v1
    description: Sandbox for testing
```

---

## Paths セクション詳細

### エンドポイント定義構造

```yaml
paths:
  /users:
    get:
      tags:
        - Users
      summary: ユーザー一覧を取得
      description: |
        ページネーション対応のユーザー一覧を返します。
        管理者のみアクセス可能です。
      operationId: listUsers
      parameters:
        - $ref: "#/components/parameters/PageLimit"
        - $ref: "#/components/parameters/PageOffset"
      responses:
        "200":
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"
                  pagination:
                    $ref: "#/components/schemas/Pagination"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
      security:
        - BearerAuth:
            - read:users

    post:
      tags:
        - Users
      summary: 新規ユーザーを作成
      description: 新しいユーザーアカウントを作成します。
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserInput"
            example:
              name: John Doe
              email: john@example.com
      responses:
        "201":
          description: ユーザー作成成功
          headers:
            Location:
              description: 作成されたリソースのURI
              schema:
                type: string
                format: uri
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          $ref: "#/components/responses/Conflict"
```

### パスパラメータ

```yaml
paths:
  /users/{userId}:
    parameters:
      - name: userId
        in: path
        required: true
        description: ユーザーID
        schema:
          type: string
          format: uuid
    get:
      summary: 特定ユーザーを取得
      operationId: getUserById
      # ...
```

---

## Components セクション詳細

### Schemas

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
      properties:
        id:
          type: string
          format: uuid
          description: ユーザーの一意識別子
          readOnly: true
        email:
          type: string
          format: email
          description: メールアドレス
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: 表示名
        role:
          type: string
          enum:
            - admin
            - user
            - guest
          default: user
          description: ユーザーロール
        createdAt:
          type: string
          format: date-time
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          readOnly: true

    UserInput:
      type: object
      required:
        - email
        - name
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 100
        role:
          type: string
          enum:
            - admin
            - user
            - guest
          default: user
```

### Responses

```yaml
components:
  responses:
    NotFound:
      description: リソースが見つかりません
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            success: false
            error:
              code: "RESOURCE_NOT_FOUND"
              message: "指定されたリソースが見つかりません"
              details: {}
              retryable: false

    BadRequest:
      description: リクエストが不正です
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"

    Unauthorized:
      description: 認証が必要です
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"

    Forbidden:
      description: アクセス権限がありません
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"

    Conflict:
      description: リソースが競合しています
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
```

### Parameters

```yaml
components:
  parameters:
    PageLimit:
      name: limit
      in: query
      description: 1ページあたりの件数
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

    PageOffset:
      name: offset
      in: query
      description: 開始位置
      schema:
        type: integer
        minimum: 0
        default: 0

    SortOrder:
      name: sort
      in: query
      description: ソート順
      schema:
        type: string
        enum:
          - asc
          - desc
        default: desc
```

---

## Security セクション詳細

### SecuritySchemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT Bearer認証。
        `Authorization: Bearer <token>` ヘッダーで送信。

    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: APIキー認証

    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/authorize
          tokenUrl: https://auth.example.com/token
          refreshUrl: https://auth.example.com/refresh
          scopes:
            read:users: ユーザー情報の読み取り
            write:users: ユーザー情報の書き込み
            admin: 管理者権限
```

### グローバルセキュリティ適用

```yaml
# すべてのエンドポイントにBearer認証を適用
security:
  - BearerAuth: []

# 複数の認証方式（AND条件）
security:
  - BearerAuth: []
    ApiKeyAuth: []

# 複数の認証方式（OR条件）
security:
  - BearerAuth: []
  - ApiKeyAuth: []
```

---

## エラーレスポンス標準構造

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          enum: [false]
          description: 常にfalse
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              description: エラーコード
              example: "VALIDATION_ERROR"
            message:
              type: string
              description: 人間が読めるエラーメッセージ
              example: "入力値が不正です"
            details:
              type: object
              additionalProperties: true
              description: デバッグ用詳細情報
            retryable:
              type: boolean
              description: リトライ可能かどうか
              default: false
        meta:
          type: object
          properties:
            request_id:
              type: string
              description: リクエスト追跡ID
            timestamp:
              type: string
              format: date-time
              description: エラー発生時刻
```
