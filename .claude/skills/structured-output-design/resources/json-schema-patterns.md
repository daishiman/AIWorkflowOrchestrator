# JSON Schema 設計パターン

## 基本パターン

### 1. シンプルオブジェクト

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "name": { "type": "string", "minLength": 1, "maxLength": 100 },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "name"],
  "additionalProperties": false
}
```

### 2. ネストオブジェクト

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "profile": {
          "type": "object",
          "properties": {
            "displayName": { "type": "string" }
          }
        }
      }
    }
  }
}
```

### 3. 配列

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "value": { "type": "number" }
        },
        "required": ["id", "value"]
      },
      "minItems": 1,
      "maxItems": 100
    }
  }
}
```

## 制約パターン

### 文字列制約

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 255,
  "pattern": "^[a-zA-Z0-9_-]+$"
}
```

**利用可能なformat**:
- `date`: YYYY-MM-DD
- `date-time`: ISO 8601
- `email`: メールアドレス
- `uri`: URI形式
- `uuid`: UUID形式

### 数値制約

```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "multipleOf": 0.01
}
```

### Enum制約

```json
{
  "type": "string",
  "enum": ["pending", "processing", "completed", "failed"]
}
```

## AI出力向けパターン

### 分析結果スキーマ

```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "分析結果の要約（100文字以内）",
      "maxLength": 100
    },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "category": { "type": "string", "enum": ["issue", "suggestion", "info"] },
          "description": { "type": "string" },
          "severity": { "type": "string", "enum": ["high", "medium", "low"] },
          "location": { "type": "string" }
        },
        "required": ["category", "description", "severity"]
      },
      "maxItems": 20
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "分析の信頼度（0-1）"
    }
  },
  "required": ["summary", "findings", "confidence"],
  "additionalProperties": false
}
```

### 生成コンテンツスキーマ

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string", "maxLength": 100 },
    "content": { "type": "string", "maxLength": 5000 },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 10,
      "uniqueItems": true
    },
    "metadata": {
      "type": "object",
      "properties": {
        "wordCount": { "type": "integer", "minimum": 0 },
        "readingTime": { "type": "integer", "minimum": 0 }
      }
    }
  },
  "required": ["title", "content"]
}
```

## アンチパターン

### ❌ 避けるべき: 過度に柔軟なスキーマ

```json
{
  "type": "object",
  "additionalProperties": true
}
```

### ✅ 推奨: 厳密なスキーマ

```json
{
  "type": "object",
  "properties": {
    "knownField": { "type": "string" }
  },
  "additionalProperties": false
}
```

### ❌ 避けるべき: 深いネスト

```json
{
  "level1": {
    "level2": {
      "level3": {
        "level4": {
          "level5": { "type": "string" }
        }
      }
    }
  }
}
```

### ✅ 推奨: フラットな構造

```json
{
  "type": "object",
  "properties": {
    "parentId": { "type": "string" },
    "childData": { "type": "string" },
    "metadata": { "type": "object" }
  }
}
```

## バリデーションエラーハンドリング

### エラーメッセージの設計

```typescript
interface ValidationError {
  path: string;       // エラーが発生したフィールドのパス
  code: string;       // エラーコード
  message: string;    // 人間が読めるメッセージ
  expected?: unknown; // 期待される値
  received?: unknown; // 実際の値
}
```

### エラー処理パターン

```typescript
try {
  const result = schema.parse(aiOutput);
} catch (error) {
  if (error instanceof ZodError) {
    // バリデーションエラー → 再試行
    return retryWithFeedback(error.issues);
  }
  throw error;
}
```
