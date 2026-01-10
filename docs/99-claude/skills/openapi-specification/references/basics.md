# OpenAPI Specification 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: OpenAPI Specification (Linux Foundation)

---

## OpenAPIとは

OpenAPI Specification（OAS）は、RESTful APIを記述するための言語非依存の仕様。以前はSwagger Specificationと呼ばれていた。

**主なバージョン**:

- OpenAPI 3.0.x: 現在の主流
- OpenAPI 3.1.x: JSON Schema完全互換

---

## 基本構造

```yaml
openapi: 3.0.3
info:
  title: API名
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /users:
    get:
      summary: ユーザー一覧取得
      responses:
        "200":
          description: 成功
components:
  schemas:
    User:
      type: object
```

---

## 主要セクション

| セクション | 必須 | 説明                             |
| ---------- | ---- | -------------------------------- |
| openapi    | ○    | OASバージョン                    |
| info       | ○    | APIメタ情報                      |
| servers    |      | APIサーバーURL                   |
| paths      | ○    | エンドポイント定義               |
| components |      | 再利用可能なスキーマ・パラメータ |
| security   |      | グローバルセキュリティ要件       |
| tags       |      | 操作のグループ化                 |

---

## HTTPメソッドと用途

| メソッド | 用途             | 冪等性 | 安全性 |
| -------- | ---------------- | ------ | ------ |
| GET      | リソース取得     | ○      | ○      |
| POST     | リソース作成     | ×      | ×      |
| PUT      | リソース置換     | ○      | ×      |
| PATCH    | リソース部分更新 | ×      | ×      |
| DELETE   | リソース削除     | ○      | ×      |

---

## データ型

| 型      | format    | 説明           |
| ------- | --------- | -------------- |
| string  | -         | 文字列         |
| string  | date      | YYYY-MM-DD     |
| string  | date-time | ISO 8601       |
| string  | email     | メールアドレス |
| string  | uuid      | UUID           |
| integer | int32     | 32bit整数      |
| integer | int64     | 64bit整数      |
| number  | float     | 浮動小数点     |
| boolean | -         | 真偽値         |
| array   | -         | 配列           |
| object  | -         | オブジェクト   |

---

## パラメータの種類

| in     | 説明               | 例               |
| ------ | ------------------ | ---------------- |
| path   | パス内のパラメータ | /users/{id}      |
| query  | クエリ文字列       | ?page=1&limit=10 |
| header | HTTPヘッダー       | Authorization    |
| cookie | Cookie             | session_id       |

---

## レスポンス定義

```yaml
responses:
  "200":
    description: 成功
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/User"
  "404":
    description: リソースが見つからない
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Error"
```

---

## 関連リソース

- **構造詳細**: See [openapi-structure.md](openapi-structure.md)
- **スキーマパターン**: See [schema-design-patterns.md](schema-design-patterns.md)
- **セキュリティ**: See [security-schemes.md](security-schemes.md)
