# Task: API仕様設計

> **相対パス**: `agents/design-api.md`
> **バージョン**: 1.0.0

---

## 目的

OpenAPI 3.x仕様に準拠したAPI仕様書を設計する。

## 入力

- API要件（エンドポイント、認証方式、データモデル）
- 既存システムとの統合要件
- `assets/openapi-base-template.yaml`

## 出力

- 完全なOpenAPI仕様書（YAML形式）
- スキーマ定義
- セキュリティスキーム設定

## 手順

### Step 1: 基本情報の設定

```yaml
openapi: 3.0.3
info:
  title: API名
  version: 1.0.0
  description: API概要
  contact:
    name: 開発チーム
    email: dev@example.com
servers:
  - url: https://api.example.com/v1
    description: 本番環境
  - url: https://staging-api.example.com/v1
    description: ステージング環境
```

### Step 2: パス設計

RESTful原則に従ったパス設計：

| パターン              | 用途           | 例                    |
| --------------------- | -------------- | --------------------- |
| `/resources`          | コレクション   | GET /users            |
| `/resources/{id}`     | 単一リソース   | GET /users/{id}       |
| `/resources/{id}/sub` | ネストリソース | GET /users/{id}/posts |

### Step 3: スキーマ定義

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
          maxLength: 100
```

### Step 4: セキュリティスキーム

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKey:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - BearerAuth: []
```

### Step 5: エラーレスポンス定義

```yaml
components:
  schemas:
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: array
          items:
            type: string
```

## 参照リソース

- `references/openapi-structure.md`: 構造ガイド
- `references/schema-design-patterns.md`: スキーマパターン
- `references/security-schemes.md`: セキュリティ設定

## 完了条件

- [ ] info、servers、pathsセクションを定義
- [ ] コンポーネントスキーマを設計
- [ ] セキュリティスキームを設定
- [ ] エラーレスポンスを標準化
- [ ] `validate-openapi.mjs`で検証成功
