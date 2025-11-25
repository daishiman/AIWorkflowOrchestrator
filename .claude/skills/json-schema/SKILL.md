---
name: json-schema
description: |
  JSON Schema仕様に基づくスキーマ設計を専門とするスキル。
  API仕様の定義、OpenAPI連携、バリデーションルールの標準化を通じて、
  相互運用性の高いデータ構造を設計します。

  専門分野:
  - JSON Schema: Draft 2020-12準拠、バリデーションキーワード
  - OpenAPI連携: Swagger/OpenAPI 3.x統合
  - スキーマ参照: $ref、$defs、外部スキーマ
  - 高度な機能: conditionals、compositions、formats

  使用タイミング:
  - OpenAPI/Swagger仕様でAPI定義を行う際
  - 外部システムとのデータ交換フォーマット定義時
  - 言語非依存のバリデーションルール定義時
  - ドキュメント生成のためのスキーマ定義時

  Use proactively when defining OpenAPI specifications,
  external data exchange formats, or language-agnostic validation rules.
version: 1.0.0
---

# JSON Schema

## 概要

このスキルは、JSON Schema仕様に基づくスキーマ設計のベストプラクティスを提供します。
OpenAPI連携、スキーマの再利用、高度なバリデーションパターンを通じて、
相互運用性の高いデータ構造を設計します。

**主要な価値**:
- 言語非依存のスキーマ定義
- OpenAPI/Swagger連携
- ドキュメント自動生成の基盤
- 相互運用性の確保

**対象ユーザー**:
- スキーマ定義を行うエージェント（@schema-def）
- API設計者
- システム間連携を担当するエンジニア

## リソース構造

```
json-schema/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── json-schema-basics.md                  # JSON Schema基礎
│   ├── openapi-integration.md                 # OpenAPI連携
│   ├── schema-composition.md                  # スキーマ合成
│   └── validation-keywords.md                 # バリデーションキーワード
├── scripts/
│   └── validate-json-schema.mjs               # スキーマ検証スクリプト
└── templates/
    └── api-schema-template.json               # APIスキーマテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# JSON Schema基礎
cat .claude/skills/json-schema/resources/json-schema-basics.md

# OpenAPI連携
cat .claude/skills/json-schema/resources/openapi-integration.md

# スキーマ合成
cat .claude/skills/json-schema/resources/schema-composition.md

# バリデーションキーワード
cat .claude/skills/json-schema/resources/validation-keywords.md
```

### スクリプト実行

```bash
# JSON Schemaの検証
node .claude/skills/json-schema/scripts/validate-json-schema.mjs <schema.json>
```

### テンプレート参照

```bash
# APIスキーマテンプレート
cat .claude/skills/json-schema/templates/api-schema-template.json
```

## いつ使うか

### シナリオ1: OpenAPI仕様の定義
**状況**: RESTful APIの仕様をOpenAPI形式で定義する

**適用条件**:
- [ ] API仕様書を作成する必要がある
- [ ] Swaggerドキュメントを生成したい
- [ ] クライアントコードを自動生成したい

**期待される成果**: 完全なOpenAPI仕様書

### シナリオ2: 外部システム連携
**状況**: 外部システムとのデータ交換フォーマットを定義する

**適用条件**:
- [ ] 異なる言語/プラットフォーム間でデータをやり取りする
- [ ] 標準化されたフォーマットが必要
- [ ] バリデーションルールを共有したい

**期待される成果**: 相互運用可能なJSON Schema

### シナリオ3: 設定ファイルスキーマ
**状況**: アプリケーションの設定ファイルのスキーマを定義する

**適用条件**:
- [ ] 設定ファイルのバリデーションが必要
- [ ] IDEでの補完機能を提供したい
- [ ] ドキュメントを自動生成したい

**期待される成果**: 設定ファイル用JSON Schema

## 基本概念

### JSON Schemaの構造

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/user",
  "title": "User",
  "description": "ユーザー情報を表すスキーマ",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "ユーザーID"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "メールアドレス"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "ユーザー名"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150,
      "description": "年齢"
    }
  },
  "required": ["id", "email", "name"],
  "additionalProperties": false
}
```

### 型システム

```json
{
  "type": "string"   // 文字列
  "type": "number"   // 数値（浮動小数点）
  "type": "integer"  // 整数
  "type": "boolean"  // 真偽値
  "type": "array"    // 配列
  "type": "object"   // オブジェクト
  "type": "null"     // null
  "type": ["string", "null"]  // 複数の型（Nullable）
}
```

### スキーマ参照

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/order",
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["street", "city", "country"]
    }
  },
  "type": "object",
  "properties": {
    "shippingAddress": { "$ref": "#/$defs/address" },
    "billingAddress": { "$ref": "#/$defs/address" }
  }
}
```

### スキーマ合成

```json
{
  "allOf": [
    { "$ref": "#/$defs/baseEntity" },
    { "$ref": "#/$defs/timestamps" },
    {
      "properties": {
        "customField": { "type": "string" }
      }
    }
  ],

  "oneOf": [
    { "$ref": "#/$defs/creditCard" },
    { "$ref": "#/$defs/bankTransfer" },
    { "$ref": "#/$defs/paypal" }
  ],

  "anyOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}
```

### 条件付きスキーマ

```json
{
  "type": "object",
  "properties": {
    "type": { "enum": ["personal", "business"] },
    "taxId": { "type": "string" }
  },
  "if": {
    "properties": { "type": { "const": "business" } }
  },
  "then": {
    "required": ["taxId"]
  },
  "else": {
    "properties": { "taxId": false }
  }
}
```

## 判断基準チェックリスト

### スキーマ設計時
- [ ] $schemaと$idを指定しているか？
- [ ] titleとdescriptionを記載しているか？
- [ ] requiredを適切に指定しているか？
- [ ] additionalPropertiesを考慮しているか？

### 再利用性確保時
- [ ] 共通の定義を$defsにまとめているか？
- [ ] 適切な粒度で分割しているか？
- [ ] 外部参照は相対パスか絶対URIか？

### OpenAPI連携時
- [ ] componentsセクションに配置しているか？
- [ ] nullable vs type: ["...", "null"]の選択は適切か？
- [ ] discriminatorを使用すべきか？

## JSON Schema vs Zod

| 観点 | JSON Schema | Zod |
|-----|-------------|-----|
| 言語 | 言語非依存 | TypeScript |
| 実行時 | バリデーションのみ | バリデーション + 変換 |
| 型推論 | 外部ツール必要 | 自動 |
| OpenAPI | ネイティブサポート | zod-to-openapi必要 |
| ユースケース | API仕様、設定ファイル | TypeScriptアプリ |

## 関連スキル

- `.claude/skills/zod-validation/SKILL.md` - Zodバリデーション
- `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン
- `.claude/skills/error-message-design/SKILL.md` - エラーメッセージ設計

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース - JSON Schema設計の基本を網羅 |
