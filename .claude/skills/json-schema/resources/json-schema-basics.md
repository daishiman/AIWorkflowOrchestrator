# JSON Schema 基礎

## 概要

JSON Schema（Draft 2020-12）の基本的な構文と使用方法を解説します。

## スキーマのメタデータ

### 必須メタデータ

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/user.json"
}
```

### オプションメタデータ

```json
{
  "title": "User",
  "description": "システムのユーザーを表すスキーマ",
  "$comment": "このスキーマはv2.0で更新予定",
  "examples": [
    {
      "id": "123",
      "name": "山田太郎",
      "email": "taro@example.com"
    }
  ],
  "default": {},
  "deprecated": false,
  "readOnly": false,
  "writeOnly": false
}
```

## 基本型

### 文字列型

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 100,
  "pattern": "^[a-zA-Z0-9]+$"
}
```

### 数値型

```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "exclusiveMinimum": 0,
  "exclusiveMaximum": 100,
  "multipleOf": 0.01
}

{
  "type": "integer",
  "minimum": 1,
  "maximum": 1000
}
```

### 真偽値型

```json
{
  "type": "boolean"
}
```

### Null型

```json
{
  "type": "null"
}
```

### 複数型（Nullable）

```json
{
  "type": ["string", "null"]
}
```

## オブジェクト型

### 基本構造

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" }
  },
  "required": ["name"],
  "additionalProperties": false
}
```

### プロパティ制約

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" }
  },
  "minProperties": 1,
  "maxProperties": 10,
  "propertyNames": {
    "pattern": "^[a-z][a-zA-Z0-9]*$"
  }
}
```

### パターンプロパティ

```json
{
  "type": "object",
  "patternProperties": {
    "^S_": { "type": "string" },
    "^I_": { "type": "integer" }
  },
  "additionalProperties": false
}
```

### 依存関係

```json
{
  "type": "object",
  "properties": {
    "creditCard": { "type": "string" },
    "billingAddress": { "type": "string" }
  },
  "dependentRequired": {
    "creditCard": ["billingAddress"]
  }
}
```

## 配列型

### 基本配列

```json
{
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "maxItems": 10,
  "uniqueItems": true
}
```

### タプル（位置指定）

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string", "description": "名前" },
    { "type": "integer", "description": "年齢" }
  ],
  "items": false
}
```

### 含有チェック

```json
{
  "type": "array",
  "contains": {
    "type": "object",
    "properties": {
      "type": { "const": "admin" }
    }
  },
  "minContains": 1,
  "maxContains": 3
}
```

## 列挙型

### 基本的なenum

```json
{
  "enum": ["pending", "active", "suspended", "deleted"]
}
```

### 定数値

```json
{
  "const": "fixed-value"
}
```

## 文字列フォーマット

### 組み込みフォーマット

```json
{
  "date-time": "2024-01-15T10:30:00Z",
  "date": "2024-01-15",
  "time": "10:30:00",
  "duration": "P1D",
  "email": "user@example.com",
  "idn-email": "日本語@example.com",
  "hostname": "example.com",
  "idn-hostname": "日本語.jp",
  "ipv4": "192.168.1.1",
  "ipv6": "2001:db8::1",
  "uri": "https://example.com/path",
  "uri-reference": "/path/to/resource",
  "uri-template": "/users/{id}",
  "json-pointer": "/foo/bar/0",
  "regex": "^[a-z]+$",
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}

{
  "type": "string",
  "format": "email"
}
```

## スキーマ参照（$ref）

### ローカル参照

```json
{
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  },
  "type": "object",
  "properties": {
    "home": { "$ref": "#/$defs/address" },
    "work": { "$ref": "#/$defs/address" }
  }
}
```

### 外部参照

```json
{
  "type": "object",
  "properties": {
    "user": { "$ref": "https://example.com/schemas/user.json" },
    "address": { "$ref": "./address.json#/$defs/postal" }
  }
}
```

### 動的参照

```json
{
  "$dynamicAnchor": "node",
  "type": "object",
  "properties": {
    "value": { "type": "string" },
    "children": {
      "type": "array",
      "items": { "$dynamicRef": "#node" }
    }
  }
}
```

## アノテーション

### 説明的アノテーション

```json
{
  "title": "ユーザー名",
  "description": "システム内で一意なユーザー識別名",
  "examples": ["john_doe", "jane_smith"],
  "default": "anonymous"
}
```

### 読み書きアノテーション

```json
{
  "id": {
    "type": "string",
    "readOnly": true,
    "description": "システム生成のID（編集不可）"
  },
  "password": {
    "type": "string",
    "writeOnly": true,
    "description": "パスワード（レスポンスには含まれない）"
  }
}
```

## 完全な例

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/user.json",
  "title": "User",
  "description": "ユーザー情報スキーマ",
  "type": "object",
  "$defs": {
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 254
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    }
  },
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "readOnly": true
    },
    "email": {
      "$ref": "#/$defs/email"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "role": {
      "type": "string",
      "enum": ["user", "admin", "moderator"],
      "default": "user"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true,
      "default": []
    },
    "createdAt": {
      "$ref": "#/$defs/timestamp",
      "readOnly": true
    },
    "updatedAt": {
      "$ref": "#/$defs/timestamp",
      "readOnly": true
    }
  },
  "required": ["email", "name"],
  "additionalProperties": false
}
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
