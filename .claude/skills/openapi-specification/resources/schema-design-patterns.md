# OpenAPI スキーマ設計パターン

## パターン1: 継承と合成

### allOf（継承）

```yaml
components:
  schemas:
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

    User:
      allOf:
        - $ref: "#/components/schemas/BaseEntity"
        - type: object
          required:
            - email
            - name
          properties:
            email:
              type: string
              format: email
            name:
              type: string
```

### oneOf（排他的選択）

```yaml
components:
  schemas:
    Notification:
      oneOf:
        - $ref: "#/components/schemas/EmailNotification"
        - $ref: "#/components/schemas/SlackNotification"
        - $ref: "#/components/schemas/WebhookNotification"
      discriminator:
        propertyName: type
        mapping:
          email: "#/components/schemas/EmailNotification"
          slack: "#/components/schemas/SlackNotification"
          webhook: "#/components/schemas/WebhookNotification"

    EmailNotification:
      type: object
      required:
        - type
        - recipient
      properties:
        type:
          type: string
          enum: [email]
        recipient:
          type: string
          format: email

    SlackNotification:
      type: object
      required:
        - type
        - channel
      properties:
        type:
          type: string
          enum: [slack]
        channel:
          type: string
```

### anyOf（非排他的選択）

```yaml
components:
  schemas:
    Filter:
      anyOf:
        - $ref: "#/components/schemas/DateFilter"
        - $ref: "#/components/schemas/StatusFilter"
        - $ref: "#/components/schemas/TagFilter"
```

---

## パターン2: 入出力分離

### 読み取り専用と書き込み専用

```yaml
components:
  schemas:
    # 入力用スキーマ
    UserInput:
      type: object
      required:
        - email
        - name
        - password
      properties:
        email:
          type: string
          format: email
        name:
          type: string
        password:
          type: string
          format: password
          writeOnly: true

    # 出力用スキーマ
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
        createdAt:
          type: string
          format: date-time
          readOnly: true
```

### 更新用スキーマ（部分更新）

```yaml
components:
  schemas:
    UserUpdate:
      type: object
      minProperties: 1 # 少なくとも1つのプロパティ必須
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, user, guest]
```

---

## パターン3: ページネーション

### オフセットベース

```yaml
components:
  schemas:
    PaginatedResponse:
      type: object
      required:
        - data
        - pagination
      properties:
        data:
          type: array
          items: {} # 具体的な型は継承先で定義
        pagination:
          $ref: "#/components/schemas/OffsetPagination"

    OffsetPagination:
      type: object
      required:
        - total
        - limit
        - offset
        - hasMore
      properties:
        total:
          type: integer
          description: 総件数
        limit:
          type: integer
          description: 1ページあたりの件数
        offset:
          type: integer
          description: 現在のオフセット
        hasMore:
          type: boolean
          description: 次のページが存在するか

    UserListResponse:
      allOf:
        - $ref: "#/components/schemas/PaginatedResponse"
        - type: object
          properties:
            data:
              type: array
              items:
                $ref: "#/components/schemas/User"
```

### カーソルベース

```yaml
components:
  schemas:
    CursorPagination:
      type: object
      required:
        - hasNext
        - hasPrevious
      properties:
        nextCursor:
          type: string
          nullable: true
          description: 次ページのカーソル
        previousCursor:
          type: string
          nullable: true
          description: 前ページのカーソル
        hasNext:
          type: boolean
        hasPrevious:
          type: boolean
```

---

## パターン4: 列挙型

### 単純列挙

```yaml
components:
  schemas:
    WorkflowStatus:
      type: string
      enum:
        - draft
        - active
        - paused
        - completed
        - failed
      description: |
        ワークフロー状態:
        * `draft` - 下書き
        * `active` - 実行中
        * `paused` - 一時停止
        * `completed` - 完了
        * `failed` - 失敗
```

### 拡張列挙（x-enum-descriptions）

```yaml
components:
  schemas:
    Priority:
      type: string
      enum:
        - low
        - medium
        - high
        - critical
      x-enum-descriptions:
        - 低優先度 - 時間があれば対応
        - 中優先度 - 通常対応
        - 高優先度 - 優先的に対応
        - 緊急 - 即時対応必須
```

---

## パターン5: ネストされたオブジェクト

### 適切なネスト深度

```yaml
components:
  schemas:
    # 良い例：フラットな構造
    WorkflowExecution:
      type: object
      properties:
        id:
          type: string
        workflowId:
          type: string
        status:
          type: string
        startedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
          nullable: true
        # 関連オブジェクトは参照で
        steps:
          type: array
          items:
            $ref: "#/components/schemas/ExecutionStep"

    ExecutionStep:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        status:
          type: string
        duration:
          type: integer
          description: 実行時間（ミリ秒）
```

### additionalPropertiesの活用

```yaml
components:
  schemas:
    # 固定キー + 動的キー
    ConfigObject:
      type: object
      required:
        - version
      properties:
        version:
          type: string
      additionalProperties:
        type: string
        description: 追加設定値

    # 動的キーのみ
    Metadata:
      type: object
      additionalProperties:
        oneOf:
          - type: string
          - type: number
          - type: boolean
```

---

## パターン6: 日付と時刻

### 推奨フォーマット

```yaml
components:
  schemas:
    DateTimeFields:
      type: object
      properties:
        # ISO 8601 日付のみ
        birthDate:
          type: string
          format: date
          example: "2025-01-15"
          description: YYYY-MM-DD形式

        # ISO 8601 日時（UTC）
        createdAt:
          type: string
          format: date-time
          example: "2025-01-15T09:30:00Z"
          description: ISO 8601形式（UTC）

        # 期間（ISO 8601 Duration）
        duration:
          type: string
          pattern: '^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$'
          example: "PT1H30M"
          description: ISO 8601 Duration形式
```

---

## パターン7: ファイルアップロード

### マルチパート

```yaml
paths:
  /files:
    post:
      summary: ファイルアップロード
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - file
              properties:
                file:
                  type: string
                  format: binary
                  description: アップロードファイル
                description:
                  type: string
                  description: ファイル説明
            encoding:
              file:
                contentType: application/octet-stream
```

### Base64エンコード

```yaml
components:
  schemas:
    FileUpload:
      type: object
      required:
        - filename
        - content
        - contentType
      properties:
        filename:
          type: string
        content:
          type: string
          format: byte
          description: Base64エンコードされたファイル内容
        contentType:
          type: string
          example: "application/pdf"
```

---

## アンチパターン

### 避けるべき設計

```yaml
# ❌ 悪い例：過度にネストされた構造
BadlyNested:
  type: object
  properties:
    level1:
      type: object
      properties:
        level2:
          type: object
          properties:
            level3:
              type: object
              properties:
                actualData:
                  type: string

# ✅ 良い例：フラットな構造
WellDesigned:
  type: object
  properties:
    data:
      type: string
    category:
      type: string
    subcategory:
      type: string

# ❌ 悪い例：汎用的すぎる型
TooGeneric:
  type: object
  additionalProperties: true # 何でも入る

# ✅ 良い例：明確な型定義
WellTyped:
  type: object
  properties:
    name:
      type: string
    value:
      type: integer
  additionalProperties: false
```
