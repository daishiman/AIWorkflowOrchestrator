---
name: json-schema
description: |
  JSON Schema仕様に基づくスキーマ設計を専門とするスキル。
  API仕様の定義、OpenAPI連携、バリデーションルールの標準化を通じて、
  相互運用性の高いデータ構造を設計します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/json-schema/resources/json-schema-basics.md`: Draft 2020-12準拠の型システム、$ref参照、required/additionalProperties基礎
  - `.claude/skills/json-schema/resources/openapi-integration.md`: OpenAPI 3.0/3.1のJSON Schema互換性、components定義、リクエスト/レスポンス分離
  - `.claude/skills/json-schema/resources/schema-composition.md`: allOf/oneOf/anyOfによるスキーマ継承と多態性実装パターン
  - `.claude/skills/json-schema/resources/validation-keywords.md`: 型別バリデーションキーワード（minLength/pattern/minimum/format等）リファレンス
  - `.claude/skills/json-schema/scripts/validate-json-schema.mjs`: JSON Schemaの構文検証とDraft仕様準拠チェック
  - `.claude/skills/json-schema/templates/api-schema-template.json`: OpenAPI components/schemasセクション作成テンプレート

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
version: 1.0.0
---

# JSON Schema

## 概要

このスキルは、JSON Schema 仕様に基づくスキーマ設計のベストプラクティスを提供します。
OpenAPI 連携、スキーマの再利用、高度なバリデーションパターンを通じて、
相互運用性の高いデータ構造を設計します。

**主要な価値**:

- 言語非依存のスキーマ定義
- OpenAPI/Swagger 連携
- ドキュメント自動生成の基盤
- 相互運用性の確保

**対象ユーザー**:

- スキーマ定義を行うエージェント（@schema-def）
- API 設計者
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

### シナリオ 1: OpenAPI 仕様の定義

**状況**: RESTful API の仕様を OpenAPI 形式で定義する

**適用条件**:

- [ ] API 仕様書を作成する必要がある
- [ ] Swagger ドキュメントを生成したい
- [ ] クライアントコードを自動生成したい

**期待される成果**: 完全な OpenAPI 仕様書

### シナリオ 2: 外部システム連携

**状況**: 外部システムとのデータ交換フォーマットを定義する

**適用条件**:

- [ ] 異なる言語/プラットフォーム間でデータをやり取りする
- [ ] 標準化されたフォーマットが必要
- [ ] バリデーションルールを共有したい

**期待される成果**: 相互運用可能な JSON Schema

### シナリオ 3: 設定ファイルスキーマ

**状況**: アプリケーションの設定ファイルのスキーマを定義する

**適用条件**:

- [ ] 設定ファイルのバリデーションが必要
- [ ] IDE での補完機能を提供したい
- [ ] ドキュメントを自動生成したい

**期待される成果**: 設定ファイル用 JSON Schema

## 基本概念

### JSON Schema の構造

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

  "anyOf": [{ "type": "string" }, { "type": "number" }]
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

- [ ] $schemaと$id を指定しているか？
- [ ] title と description を記載しているか？
- [ ] required を適切に指定しているか？
- [ ] additionalProperties を考慮しているか？

### 再利用性確保時

- [ ] 共通の定義を$defs にまとめているか？
- [ ] 適切な粒度で分割しているか？
- [ ] 外部参照は相対パスか絶対 URI か？

### OpenAPI 連携時

- [ ] components セクションに配置しているか？
- [ ] nullable vs type: ["...", "null"]の選択は適切か？
- [ ] discriminator を使用すべきか？

## JSON Schema vs Zod

| 観点         | JSON Schema            | Zod                   |
| ------------ | ---------------------- | --------------------- |
| 言語         | 言語非依存             | TypeScript            |
| 実行時       | バリデーションのみ     | バリデーション + 変換 |
| 型推論       | 外部ツール必要         | 自動                  |
| OpenAPI      | ネイティブサポート     | zod-to-openapi 必要   |
| ユースケース | API 仕様、設定ファイル | TypeScript アプリ     |

## 関連スキル

- `.claude/skills/zod-validation/SKILL.md` - Zod バリデーション
- `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン
- `.claude/skills/error-message-design/SKILL.md` - エラーメッセージ設計

## 変更履歴

| バージョン | 日付       | 変更内容                                    |
| ---------- | ---------- | ------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - JSON Schema 設計の基本を網羅 |
