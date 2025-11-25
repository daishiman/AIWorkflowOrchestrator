# OpenAPI 3.x詳細ガイド

## 概要

OpenAPI Specification (OAS) は、RESTful APIを記述するための標準フォーマットです。言語に依存せず、人間とマシンの両方が読める形式でAPIを定義します。

## 基本構造

```yaml
openapi: 3.0.3
info:
  title: Sample API
  version: 1.0.0
  description: APIの説明

servers:
  - url: https://api.example.com/v1
    description: Production

paths:
  /users:
    get:
      summary: ユーザー一覧取得
      responses:
        '200':
          description: 成功

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
```

## 主要セクション

### info（API情報）

```yaml
info:
  title: My API
  version: 1.0.0
  description: |
    APIの詳細な説明。
    Markdownが使用可能。
  contact:
    name: API Support
    email: support@example.com
  license:
    name: MIT
```

### servers（サーバー定義）

```yaml
servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Development
```

### paths（エンドポイント）

```yaml
paths:
  /users/{userId}:
    get:
      summary: ユーザー取得
      operationId: getUserById
      tags:
        - Users
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: Not Found
```

### components（再利用コンポーネント）

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 100
        email:
          type: string
          format: email

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## データ型

| 型 | format | 説明 |
|:---|:-------|:-----|
| string | - | 文字列 |
| string | date | ISO 8601日付 |
| string | date-time | ISO 8601日時 |
| string | uuid | UUID |
| string | email | メールアドレス |
| integer | int32 | 32ビット整数 |
| integer | int64 | 64ビット整数 |
| number | float | 浮動小数点 |
| boolean | - | 真偽値 |
| array | - | 配列 |
| object | - | オブジェクト |

## 認証定義

### Bearer Token

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

### API Key

```yaml
components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
```

## ベストプラクティス

- operationIdは一意で説明的に
- tagsでエンドポイントをグループ化
- exampleを積極的に使用
- $refでスキーマを再利用
- descriptionsは詳細に
