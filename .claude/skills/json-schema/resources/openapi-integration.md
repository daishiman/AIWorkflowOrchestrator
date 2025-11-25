# OpenAPI連携

## 概要

JSON SchemaとOpenAPI 3.xの統合方法を解説します。
API仕様の定義、コンポーネントの再利用、差異の理解を網羅します。

## OpenAPIとJSON Schemaの関係

### バージョン対応

| OpenAPI | JSON Schema |
|---------|-------------|
| 3.0.x | Draft 5 (Wright) ベース |
| 3.1.x | Draft 2020-12 完全互換 |

### OpenAPI 3.0での制限

```yaml
# OpenAPI 3.0でサポートされないJSON Schema機能
# - $id
# - $anchor
# - $dynamicRef
# - if/then/else
# - dependentSchemas
# - prefixItems
# - contentMediaType/contentEncoding
```

## OpenAPI 3.1での完全互換

```yaml
openapi: "3.1.0"
info:
  title: User API
  version: "1.0.0"

components:
  schemas:
    User:
      $schema: "https://json-schema.org/draft/2020-12/schema"
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
```

## コンポーネントの定義

### 基本的なスキーマ定義

```yaml
components:
  schemas:
    # 基本エンティティ
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          readOnly: true
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 100
        createdAt:
          type: string
          format: date-time
          readOnly: true
      required:
        - email
        - name

    # リスト用ラッパー
    UserList:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/User'
        total:
          type: integer
          minimum: 0
        page:
          type: integer
          minimum: 1
        pageSize:
          type: integer
          minimum: 1
          maximum: 100
      required:
        - items
        - total
        - page
        - pageSize
```

### リクエスト/レスポンスの分離

```yaml
components:
  schemas:
    # 作成リクエスト
    UserCreate:
      type: object
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
        password:
          type: string
          minLength: 8
          writeOnly: true
      required:
        - email
        - name
        - password

    # 更新リクエスト（部分更新）
    UserUpdate:
      type: object
      properties:
        name:
          type: string
          minLength: 1
        email:
          type: string
          format: email

    # レスポンス
    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required:
        - id
        - email
        - name
        - createdAt
        - updatedAt
```

## スキーマの再利用

### allOf による継承

```yaml
components:
  schemas:
    # 基本フィールド
    BaseEntity:
      type: object
      properties:
        id:
          type: string
          format: uuid
          readOnly: true
        createdAt:
          type: string
          format: date-time
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          readOnly: true
      required:
        - id
        - createdAt
        - updatedAt

    # 継承
    User:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          properties:
            email:
              type: string
              format: email
            name:
              type: string
          required:
            - email
            - name

    Product:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          properties:
            title:
              type: string
            price:
              type: number
          required:
            - title
            - price
```

### oneOf による多態性

```yaml
components:
  schemas:
    Payment:
      oneOf:
        - $ref: '#/components/schemas/CreditCardPayment'
        - $ref: '#/components/schemas/BankTransferPayment'
        - $ref: '#/components/schemas/PayPalPayment'
      discriminator:
        propertyName: type
        mapping:
          credit_card: '#/components/schemas/CreditCardPayment'
          bank_transfer: '#/components/schemas/BankTransferPayment'
          paypal: '#/components/schemas/PayPalPayment'

    CreditCardPayment:
      type: object
      properties:
        type:
          type: string
          const: credit_card
        cardNumber:
          type: string
          pattern: '^\d{16}$'
        expiryDate:
          type: string
          pattern: '^\d{2}/\d{2}$'
      required:
        - type
        - cardNumber
        - expiryDate

    BankTransferPayment:
      type: object
      properties:
        type:
          type: string
          const: bank_transfer
        bankCode:
          type: string
        accountNumber:
          type: string
      required:
        - type
        - bankCode
        - accountNumber

    PayPalPayment:
      type: object
      properties:
        type:
          type: string
          const: paypal
        paypalEmail:
          type: string
          format: email
      required:
        - type
        - paypalEmail
```

## エラーレスポンス

### RFC 7807準拠

```yaml
components:
  schemas:
    ProblemDetails:
      type: object
      properties:
        type:
          type: string
          format: uri
          description: エラータイプのURI
        title:
          type: string
          description: 人間可読なタイトル
        status:
          type: integer
          description: HTTPステータスコード
        detail:
          type: string
          description: 詳細な説明
        instance:
          type: string
          format: uri
          description: エラー発生のURI
      required:
        - type
        - title
        - status

    ValidationError:
      allOf:
        - $ref: '#/components/schemas/ProblemDetails'
        - type: object
          properties:
            errors:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
                  code:
                    type: string
                required:
                  - field
                  - message

  responses:
    BadRequest:
      description: 不正なリクエスト
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ValidationError'

    NotFound:
      description: リソースが見つからない
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'

    InternalError:
      description: サーバーエラー
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
```

## パス定義との統合

```yaml
paths:
  /users:
    get:
      summary: ユーザー一覧取得
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
        '500':
          $ref: '#/components/responses/InternalError'

    post:
      summary: ユーザー作成
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: 作成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          $ref: '#/components/responses/BadRequest'

  /users/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid

    get:
      summary: ユーザー取得
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '404':
          $ref: '#/components/responses/NotFound'

    patch:
      summary: ユーザー更新
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: ユーザー削除
      responses:
        '204':
          description: 削除成功
        '404':
          $ref: '#/components/responses/NotFound'
```

## TypeScriptコード生成

### openapi-typescript

```bash
npx openapi-typescript openapi.yaml -o types.ts
```

```typescript
// 生成されたtypes.tsの使用例
import type { paths, components } from './types';

type User = components['schemas']['UserResponse'];
type UserCreate = components['schemas']['UserCreate'];

// APIクライアント用の型
type GetUsersResponse = paths['/users']['get']['responses']['200']['content']['application/json'];
type CreateUserRequest = paths['/users']['post']['requestBody']['content']['application/json'];
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
