---
name: openapi-specification
description: |
  OpenAPI 3.x仕様に準拠したAPI仕様書の設計と作成を専門とするスキル。

  核心知識:
  - OpenAPI 3.x標準の構造とコンポーネント
  - スキーマ定義とエンドポイント記述のベストプラクティス
  - $ref参照によるコンポーネント再利用
  - セキュリティスキームとグローバル設定

  使用タイミング:
  - 新規OpenAPI仕様書を作成する時
  - 既存OpenAPI仕様書を更新する時
  - エンドポイントやスキーマを設計する時
  - OpenAPI構文エラーを解決する時

version: 1.0.0
---

# OpenAPI Specification スキル

## 概要

OpenAPI 3.x仕様に準拠したAPI仕様書の設計と作成に関する専門知識を提供します。

## コマンドリファレンス

```bash
# リソース参照
cat .claude/skills/openapi-specification/resources/openapi-structure.md
cat .claude/skills/openapi-specification/resources/schema-design-patterns.md
cat .claude/skills/openapi-specification/resources/security-schemes.md

# テンプレート参照
cat .claude/skills/openapi-specification/templates/openapi-base-template.yaml
cat .claude/skills/openapi-specification/templates/endpoint-template.yaml

# スクリプト実行
node .claude/skills/openapi-specification/scripts/validate-openapi.mjs <openapi-file>
```

---

## 知識領域1: OpenAPI 3.x基本構造

### 仕様書の主要セクション

| セクション | 目的 | 必須 |
|-----------|------|------|
| `openapi` | バージョン指定（"3.0.x" or "3.1.x"） | ✅ |
| `info` | メタデータ（title, version, description, contact, license） | ✅ |
| `servers` | ベースURL定義（環境別） | 推奨 |
| `paths` | エンドポイント定義 | ✅ |
| `components` | 再利用可能コンポーネント | 推奨 |
| `security` | グローバル認証要件 | 推奨 |
| `tags` | エンドポイントカテゴリ分類 | 推奨 |

### バージョン選択基準

- **3.0.x**: 広範なツールサポート、既存プロジェクト
- **3.1.x**: JSON Schema完全互換、Webhook対応、新規プロジェクト

---

## 知識領域2: パス（Paths）設計

### エンドポイント構造

各エンドポイントに含めるべき要素:

| 要素 | 説明 | 必須 |
|------|------|------|
| `summary` | 1行説明（<50文字） | ✅ |
| `description` | 詳細説明（Markdown対応） | 推奨 |
| `operationId` | 一意の操作識別子 | ✅ |
| `tags` | カテゴリ分類 | 推奨 |
| `parameters` | パス/クエリ/ヘッダーパラメータ | 条件付き |
| `requestBody` | リクエストボディ | POST/PUT/PATCHで必要 |
| `responses` | ステータスコード別レスポンス | ✅ |
| `security` | 認証要件（グローバルをオーバーライド） | 条件付き |

### HTTPメソッド使用規約

| メソッド | 用途 | 冪等性 | リクエストボディ |
|---------|------|--------|------------------|
| GET | リソース取得 | ✅ | なし |
| POST | リソース作成 | ❌ | 必要 |
| PUT | リソース完全置換 | ✅ | 必要 |
| PATCH | リソース部分更新 | ✅ | 必要 |
| DELETE | リソース削除 | ✅ | なし |

---

## 知識領域3: コンポーネント（Components）設計

### 再利用可能コンポーネントタイプ

| タイプ | 用途 | 参照方法 |
|--------|------|---------|
| `schemas` | データモデル定義 | `$ref: '#/components/schemas/User'` |
| `responses` | 共通レスポンス定義 | `$ref: '#/components/responses/NotFound'` |
| `parameters` | 共通パラメータ定義 | `$ref: '#/components/parameters/PageLimit'` |
| `requestBodies` | 共通リクエストボディ | `$ref: '#/components/requestBodies/UserInput'` |
| `headers` | 共通ヘッダー定義 | `$ref: '#/components/headers/X-Rate-Limit'` |
| `securitySchemes` | 認証スキーム定義 | security設定で参照 |
| `links` | 操作間リンク | HATEOAS実装 |
| `callbacks` | Webhook定義 | 非同期操作 |

### スキーマ設計原則

1. **DRY原則**: 複数エンドポイントで使用されるスキーマは抽出
2. **必須フィールド明示**: `required`配列で必須フィールドを列挙
3. **説明追加**: 各プロパティに`description`を付与
4. **型制約**: `format`、`minLength`、`maxLength`、`pattern`を活用
5. **例示値**: `example`または`examples`を追加

---

## 知識領域4: データ型とフォーマット

### 基本型

| type | format | 用途 |
|------|--------|------|
| `string` | - | 一般文字列 |
| `string` | `date` | ISO 8601日付（YYYY-MM-DD） |
| `string` | `date-time` | ISO 8601日時 |
| `string` | `email` | メールアドレス |
| `string` | `uri` | URI形式 |
| `string` | `uuid` | UUID形式 |
| `string` | `password` | パスワード（UI非表示） |
| `integer` | `int32` | 32ビット整数 |
| `integer` | `int64` | 64ビット整数 |
| `number` | `float` | 単精度浮動小数点 |
| `number` | `double` | 倍精度浮動小数点 |
| `boolean` | - | 真偽値 |
| `array` | - | 配列（items必須） |
| `object` | - | オブジェクト |

### 制約オプション

| 制約 | 適用型 | 説明 |
|------|--------|------|
| `minLength` / `maxLength` | string | 文字列長制約 |
| `pattern` | string | 正規表現パターン |
| `minimum` / `maximum` | number/integer | 数値範囲 |
| `minItems` / `maxItems` | array | 配列長制約 |
| `uniqueItems` | array | 要素一意性 |
| `enum` | any | 列挙値制約 |
| `nullable` | any | null許可 |
| `readOnly` / `writeOnly` | any | 読み取り/書き込み専用 |

---

## 知識領域5: セキュリティスキーム

### 認証タイプ

| type | 用途 | 設定例 |
|------|------|--------|
| `apiKey` | APIキー認証 | ヘッダー/クエリ/Cookie |
| `http` | HTTP認証 | Basic、Bearer |
| `oauth2` | OAuth 2.0 | 各種フロー |
| `openIdConnect` | OpenID Connect | OIDC Discovery |

### グローバル vs エンドポイント別

```yaml
# グローバル（全エンドポイントに適用）
security:
  - BearerAuth: []

# エンドポイント別（グローバルをオーバーライド）
paths:
  /public:
    get:
      security: []  # 認証不要
```

---

## 判断基準チェックリスト

### 構造品質
- [ ] `openapi`バージョンが指定されているか？
- [ ] `info`セクションにtitle、version、descriptionがあるか？
- [ ] `servers`に環境別URLが定義されているか？

### エンドポイント品質
- [ ] すべてのエンドポイントに`summary`があるか？
- [ ] すべてのエンドポイントに一意の`operationId`があるか？
- [ ] 適切な`tags`でカテゴリ分類されているか？

### スキーマ品質
- [ ] 共通スキーマが`components/schemas`に抽出されているか？
- [ ] 必須フィールドが`required`で明示されているか？
- [ ] 各プロパティに`description`があるか？

### セキュリティ品質
- [ ] 認証が必要なエンドポイントに`security`が設定されているか？
- [ ] `securitySchemes`が適切に定義されているか？

---

## 関連スキル

- `.claude/skills/swagger-ui/SKILL.md`: インタラクティブドキュメント生成
- `.claude/skills/api-versioning/SKILL.md`: バージョニング戦略
- `.claude/skills/request-response-examples/SKILL.md`: 実例追加

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版リリース |
