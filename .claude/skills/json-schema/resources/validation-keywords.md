# バリデーションキーワード

## 概要

JSON Schemaの各種バリデーションキーワードのリファレンスです。
Draft 2020-12に準拠しています。

## 型キーワード

### type

```json
// 単一型
{ "type": "string" }
{ "type": "number" }
{ "type": "integer" }
{ "type": "boolean" }
{ "type": "array" }
{ "type": "object" }
{ "type": "null" }

// 複数型（Nullable）
{ "type": ["string", "null"] }

// 任意の型を許可
{ }  // type を省略
```

### enum / const

```json
// 列挙型
{
  "enum": ["pending", "active", "suspended"]
}

// 定数
{
  "const": "fixed-value"
}

// 列挙型の型指定
{
  "type": "string",
  "enum": ["small", "medium", "large"]
}
```

## 文字列キーワード

### 長さ制約

```json
{
  "type": "string",
  "minLength": 1,      // 最小長（含む）
  "maxLength": 100     // 最大長（含む）
}
```

### パターン

```json
{
  "type": "string",
  "pattern": "^[a-zA-Z0-9_]+$"
}

// 一般的なパターン
{ "pattern": "^[a-z]+$" }           // 小文字英字のみ
{ "pattern": "^\\d{3}-\\d{4}$" }    // 郵便番号
{ "pattern": "^[A-Z]{2}\\d{6}$" }   // パスポート番号風
```

### フォーマット

```json
// 日時
{ "format": "date-time" }    // 2024-01-15T10:30:00Z
{ "format": "date" }         // 2024-01-15
{ "format": "time" }         // 10:30:00
{ "format": "duration" }     // P1DT12H

// ネットワーク
{ "format": "email" }        // user@example.com
{ "format": "idn-email" }    // 日本語@example.com
{ "format": "hostname" }     // example.com
{ "format": "idn-hostname" } // 日本語.jp
{ "format": "ipv4" }         // 192.168.1.1
{ "format": "ipv6" }         // 2001:db8::1

// URI
{ "format": "uri" }          // https://example.com/path
{ "format": "uri-reference" }// /path/to/resource
{ "format": "iri" }          // 国際化URI
{ "format": "iri-reference" }// 国際化URI参照
{ "format": "uri-template" } // /users/{id}

// その他
{ "format": "uuid" }         // 550e8400-e29b-41d4-a716-446655440000
{ "format": "json-pointer" } // /foo/bar/0
{ "format": "relative-json-pointer" } // 1/foo
{ "format": "regex" }        // ^[a-z]+$
```

### コンテンツ

```json
{
  "type": "string",
  "contentMediaType": "application/json",
  "contentEncoding": "base64"
}
```

## 数値キーワード

### 範囲制約

```json
{
  "type": "number",
  "minimum": 0,           // 最小値（含む）
  "maximum": 100,         // 最大値（含む）
  "exclusiveMinimum": 0,  // 最小値（含まない）
  "exclusiveMaximum": 100 // 最大値（含まない）
}

// 例: 0より大きく100未満
{
  "type": "number",
  "exclusiveMinimum": 0,
  "exclusiveMaximum": 100
}
```

### 倍数

```json
{
  "type": "number",
  "multipleOf": 0.01    // 小数点2桁
}

{
  "type": "integer",
  "multipleOf": 5       // 5の倍数
}
```

## 配列キーワード

### 要素制約

```json
{
  "type": "array",
  "items": { "type": "string" },   // 全要素の型
  "minItems": 1,                    // 最小要素数
  "maxItems": 10,                   // 最大要素数
  "uniqueItems": true               // 重複禁止
}
```

### タプル（位置指定）

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },   // 1番目の要素
    { "type": "integer" },  // 2番目の要素
    { "type": "boolean" }   // 3番目の要素
  ],
  "items": false            // 追加要素を禁止
}

// 追加要素を許可
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "integer" }
  ],
  "items": { "type": "string" }  // 3番目以降はstring
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
  "minContains": 1,    // 最低1つ含む
  "maxContains": 3     // 最大3つまで
}
```

### 未評価要素

```json
{
  "allOf": [
    {
      "type": "array",
      "prefixItems": [{ "type": "string" }]
    }
  ],
  "unevaluatedItems": false  // allOf で評価されなかった追加要素を禁止
}
```

## オブジェクトキーワード

### プロパティ制約

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer" }
  },
  "required": ["name"],           // 必須プロパティ
  "additionalProperties": false   // 追加プロパティを禁止
}
```

### プロパティ数制約

```json
{
  "type": "object",
  "minProperties": 1,   // 最小プロパティ数
  "maxProperties": 10   // 最大プロパティ数
}
```

### プロパティ名制約

```json
{
  "type": "object",
  "propertyNames": {
    "pattern": "^[a-z][a-zA-Z0-9]*$"  // camelCaseのみ許可
  }
}
```

### パターンプロパティ

```json
{
  "type": "object",
  "patternProperties": {
    "^S_": { "type": "string" },    // S_で始まるプロパティはstring
    "^I_": { "type": "integer" },   // I_で始まるプロパティはinteger
    "^B_": { "type": "boolean" }    // B_で始まるプロパティはboolean
  },
  "additionalProperties": false
}
```

### 追加プロパティ制御

```json
// 追加プロパティを禁止
{ "additionalProperties": false }

// 追加プロパティの型を指定
{ "additionalProperties": { "type": "string" } }

// 追加プロパティを許可（デフォルト）
{ "additionalProperties": true }
```

### 未評価プロパティ

```json
{
  "allOf": [
    {
      "type": "object",
      "properties": {
        "name": { "type": "string" }
      }
    }
  ],
  "unevaluatedProperties": false  // allOf で評価されなかった追加プロパティを禁止
}
```

### 依存関係

```json
// 必須依存
{
  "type": "object",
  "dependentRequired": {
    "creditCard": ["billingAddress"]  // creditCardがあればbillingAddressも必須
  }
}

// スキーマ依存
{
  "type": "object",
  "dependentSchemas": {
    "creditCard": {
      "properties": {
        "billingAddress": {
          "type": "object",
          "required": ["street", "city"]
        }
      },
      "required": ["billingAddress"]
    }
  }
}
```

## 条件キーワード

### if / then / else

```json
{
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

## 合成キーワード

### allOf

```json
{
  "allOf": [
    { "$ref": "#/$defs/base" },
    { "$ref": "#/$defs/extension" }
  ]
}
```

### oneOf

```json
{
  "oneOf": [
    { "$ref": "#/$defs/typeA" },
    { "$ref": "#/$defs/typeB" }
  ]
}
```

### anyOf

```json
{
  "anyOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}
```

### not

```json
{
  "not": { "type": "null" }
}
```

## アノテーションキーワード

```json
{
  "title": "ユーザー名",
  "description": "システム内で一意なユーザー識別名",
  "default": "anonymous",
  "examples": ["john_doe", "jane_smith"],
  "deprecated": false,
  "readOnly": false,
  "writeOnly": false,
  "$comment": "内部メモ：このフィールドはv2.0で削除予定"
}
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
