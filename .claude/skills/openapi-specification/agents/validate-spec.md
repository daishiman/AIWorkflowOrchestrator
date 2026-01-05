# Task: OpenAPI仕様検証

> **相対パス**: `agents/validate-spec.md`
> **バージョン**: 1.0.0

---

## 目的

OpenAPI仕様書の構文・整合性を検証し、問題を修正する。

## 入力

- 検証対象のOpenAPI仕様書（YAML/JSON）
- バリデーションスクリプト

## 出力

- 検証結果レポート
- 修正済み仕様書（エラーがあった場合）

## 手順

### Step 1: 構文検証

```bash
# validate-openapi.mjsを使用
node scripts/validate-openapi.mjs path/to/openapi.yaml
```

**チェック項目**:

- YAML構文エラー
- OpenAPI仕様バージョン（3.0.x/3.1.x）
- 必須フィールドの存在

### Step 2: スキーマ整合性

**チェック項目**:

- $ref参照の解決
- 循環参照の検出
- 未使用コンポーネントの検出

```bash
# 参照の検証
grep -n '\$ref' openapi.yaml | while read line; do
  # 参照先が存在するか確認
done
```

### Step 3: セキュリティ検証

**チェック項目**:

- 全エンドポイントにsecurityが設定されているか
- securitySchemes定義の整合性
- 認証が不要なエンドポイントの明示

### Step 4: ベストプラクティス検証

| チェック項目 | 推奨             |
| ------------ | ---------------- |
| operationId  | 全操作に一意のID |
| description  | 全パスに説明     |
| example      | スキーマに例     |
| tags         | 操作をグループ化 |

### Step 5: エラー修正

検出されたエラーを優先度順に修正：

1. **Critical**: 構文エラー、必須フィールド欠損
2. **Error**: 参照エラー、型不整合
3. **Warning**: ベストプラクティス違反
4. **Info**: 推奨事項

## 一般的なエラーと解決策

| エラー                 | 原因               | 解決策         |
| ---------------------- | ------------------ | -------------- |
| Invalid $ref           | 参照パスが不正     | パスを修正     |
| Missing required field | 必須フィールド欠損 | フィールド追加 |
| Duplicate operationId  | ID重複             | 一意のIDに変更 |
| Invalid schema type    | 型名が不正         | 正しい型に修正 |

## 完了条件

- [ ] 構文検証に成功
- [ ] 全参照が解決
- [ ] セキュリティ設定を確認
- [ ] ベストプラクティスを確認
- [ ] 検証結果をドキュメント化
