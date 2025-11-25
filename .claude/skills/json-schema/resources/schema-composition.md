# スキーマ合成

## 概要

JSON Schemaの合成キーワード（allOf, oneOf, anyOf, not）を使った
複雑なスキーマの構築方法を解説します。

## allOf（すべて満たす）

### 基本的な使用法

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "name": { "type": "string" }
      },
      "required": ["name"]
    },
    {
      "type": "object",
      "properties": {
        "email": { "type": "string", "format": "email" }
      },
      "required": ["email"]
    }
  ]
}

// 有効なデータ
{ "name": "John", "email": "john@example.com" }

// 無効なデータ（nameが不足）
{ "email": "john@example.com" }
```

### 継承パターン

```json
{
  "$defs": {
    "BaseEntity": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" }
      },
      "required": ["id", "createdAt", "updatedAt"]
    },
    "Auditable": {
      "type": "object",
      "properties": {
        "createdBy": { "type": "string" },
        "updatedBy": { "type": "string" }
      }
    }
  },
  "allOf": [
    { "$ref": "#/$defs/BaseEntity" },
    { "$ref": "#/$defs/Auditable" },
    {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "content": { "type": "string" }
      },
      "required": ["title"]
    }
  ]
}
```

### プロパティのマージ

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    {
      "type": "object",
      "properties": {
        "name": {
          "maxLength": 100
        }
      }
    }
  ]
}

// 結果: nameは minLength: 1 かつ maxLength: 100 を満たす必要がある
```

## oneOf（1つだけ満たす）

### 排他的な選択

```json
{
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "type": { "const": "email" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["type", "email"]
    },
    {
      "type": "object",
      "properties": {
        "type": { "const": "phone" },
        "phone": { "type": "string", "pattern": "^\\d{10,}$" }
      },
      "required": ["type", "phone"]
    }
  ]
}

// 有効
{ "type": "email", "email": "user@example.com" }
{ "type": "phone", "phone": "0901234567" }

// 無効（両方満たす / どちらも満たさない）
{ "type": "email", "email": "user@example.com", "phone": "0901234567" }
{ "type": "fax" }
```

### discriminatorパターン

```json
{
  "$defs": {
    "Dog": {
      "type": "object",
      "properties": {
        "petType": { "const": "dog" },
        "breed": { "type": "string" },
        "barkVolume": { "type": "integer" }
      },
      "required": ["petType", "breed"]
    },
    "Cat": {
      "type": "object",
      "properties": {
        "petType": { "const": "cat" },
        "breed": { "type": "string" },
        "meowPitch": { "type": "integer" }
      },
      "required": ["petType", "breed"]
    }
  },
  "oneOf": [
    { "$ref": "#/$defs/Dog" },
    { "$ref": "#/$defs/Cat" }
  ]
}
```

### 条件付き必須フィールド

```json
{
  "type": "object",
  "properties": {
    "deliveryMethod": {
      "type": "string",
      "enum": ["pickup", "shipping"]
    },
    "storeId": { "type": "string" },
    "shippingAddress": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  },
  "required": ["deliveryMethod"],
  "oneOf": [
    {
      "properties": {
        "deliveryMethod": { "const": "pickup" }
      },
      "required": ["storeId"]
    },
    {
      "properties": {
        "deliveryMethod": { "const": "shipping" }
      },
      "required": ["shippingAddress"]
    }
  ]
}
```

## anyOf（いずれか1つ以上満たす）

### 柔軟な選択

```json
{
  "anyOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}

// 有効
"hello"
42
```

### 複数の形式を許可

```json
{
  "type": "object",
  "properties": {
    "contact": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "email": { "type": "string", "format": "email" }
          },
          "required": ["email"]
        },
        {
          "type": "object",
          "properties": {
            "phone": { "type": "string" }
          },
          "required": ["phone"]
        }
      ]
    }
  }
}

// 有効（email のみ）
{ "contact": { "email": "user@example.com" } }

// 有効（phone のみ）
{ "contact": { "phone": "090-1234-5678" } }

// 有効（両方）
{ "contact": { "email": "user@example.com", "phone": "090-1234-5678" } }
```

## not（否定）

### 特定の値を除外

```json
{
  "not": {
    "type": "null"
  }
}

// 有効
"hello"
42
{}
[]

// 無効
null
```

### 特定のパターンを除外

```json
{
  "type": "string",
  "not": {
    "pattern": "^admin"
  }
}

// 有効
"user123"
"guest"

// 無効
"admin"
"adminUser"
```

### 複合否定

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string" }
  },
  "not": {
    "properties": {
      "status": { "const": "deleted" }
    },
    "required": ["status"]
  }
}
```

## 条件付きスキーマ（if/then/else）

### 基本構文

```json
{
  "type": "object",
  "properties": {
    "country": { "type": "string" },
    "postalCode": { "type": "string" }
  },
  "if": {
    "properties": {
      "country": { "const": "Japan" }
    },
    "required": ["country"]
  },
  "then": {
    "properties": {
      "postalCode": { "pattern": "^\\d{3}-\\d{4}$" }
    }
  },
  "else": {
    "properties": {
      "postalCode": { "pattern": "^[A-Z0-9\\- ]+$" }
    }
  }
}
```

### 複数条件

```json
{
  "type": "object",
  "properties": {
    "type": { "enum": ["personal", "business", "government"] },
    "taxId": { "type": "string" },
    "duns": { "type": "string" }
  },
  "allOf": [
    {
      "if": {
        "properties": { "type": { "const": "business" } }
      },
      "then": {
        "required": ["taxId"]
      }
    },
    {
      "if": {
        "properties": { "type": { "const": "government" } }
      },
      "then": {
        "required": ["duns"]
      }
    }
  ]
}
```

## 依存スキーマ

### dependentSchemas

```json
{
  "type": "object",
  "properties": {
    "creditCard": { "type": "string" },
    "billingAddress": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  },
  "dependentSchemas": {
    "creditCard": {
      "required": ["billingAddress"],
      "properties": {
        "billingAddress": {
          "required": ["street", "city"]
        }
      }
    }
  }
}
```

### dependentRequired

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "creditCard": { "type": "string" },
    "billingAddress": { "type": "string" }
  },
  "dependentRequired": {
    "creditCard": ["billingAddress"]
  }
}

// creditCard があれば billingAddress も必要
```

## 実践パターン

### 状態に応じたバリデーション

```json
{
  "$defs": {
    "Draft": {
      "type": "object",
      "properties": {
        "status": { "const": "draft" },
        "title": { "type": "string" }
      },
      "required": ["status"]
    },
    "Published": {
      "type": "object",
      "properties": {
        "status": { "const": "published" },
        "title": { "type": "string", "minLength": 1 },
        "content": { "type": "string", "minLength": 100 },
        "publishedAt": { "type": "string", "format": "date-time" }
      },
      "required": ["status", "title", "content", "publishedAt"]
    }
  },
  "oneOf": [
    { "$ref": "#/$defs/Draft" },
    { "$ref": "#/$defs/Published" }
  ]
}
```

### バージョン管理されたスキーマ

```json
{
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "version": { "const": "1.0" },
        "data": { "$ref": "#/$defs/v1Data" }
      },
      "required": ["version", "data"]
    },
    {
      "type": "object",
      "properties": {
        "version": { "const": "2.0" },
        "data": { "$ref": "#/$defs/v2Data" }
      },
      "required": ["version", "data"]
    }
  ],
  "$defs": {
    "v1Data": { },
    "v2Data": { }
  }
}
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
