# DRY原則の文書適用

## 概要

DRY（Don't Repeat Yourself）原則は、『達人プログラマー』でアンドリュー・ハントが提唱した原則です。すべての知識は単一の権威ある場所に存在すべきという考え方をドキュメントにも適用します。

## DRY原則の本質

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."
> — Andrew Hunt, David Thomas

## DRY違反のパターン

### パターン1: 同じ説明の重複

**悪い例**:
```markdown
# API仕様A
認証: Bearer トークンをAuthorizationヘッダーに含める

# API仕様B
認証: Bearer トークンをAuthorizationヘッダーに含める
```

**良い例**:
```markdown
# 共通仕様 (common/authentication.md)
## Bearer Token認証
すべてのAPIは `Authorization: Bearer <token>` ヘッダーを必要とする。

# API仕様A
認証: [共通仕様の認証方式](../common/authentication.md#bearer-token)を参照

# API仕様B
認証: [共通仕様の認証方式](../common/authentication.md#bearer-token)を参照
```

### パターン2: データ型定義の重複

**悪い例**:
複数の仕様書で同じ型定義を記述

**良い例**:
```markdown
# 共通定義 (common/data-types.md)
## UUID型
- 形式: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- 例: `550e8400-e29b-41d4-a716-446655440000`

# 各仕様書
`id`: [UUID型](../common/data-types.md#uuid型)
```

## 共通化すべき要素

| 要素 | 配置先 | 例 |
|:-----|:-------|:---|
| データ型定義 | `common/data-types.md` | UUID, ISO 8601日時 |
| 認証方式 | `common/authentication.md` | Bearer Token, API Key |
| エラーコード | `common/error-codes.md` | VALIDATION_ERROR |
| ステータス定義 | `common/status.md` | active, inactive |
| 用語集 | `common/glossary.md` | 専門用語の定義 |

## 参照方式

### Markdownリンク
```markdown
詳細は[認証方式](../common/authentication.md)を参照してください。
```

### アンカーリンク
```markdown
[Bearer Token認証](../common/authentication.md#bearer-token)
```

## DRY違反の検出

### 手動チェック
```bash
# 同じフレーズの重複検出
grep -r "Bearer Token" docs/20-specifications/*.md | wc -l
```

### 自動チェック
`scripts/check-dry-violations.mjs` を使用

## 変更時のメリット

### DRY遵守時
- 認証方式変更 → 1箇所のみ修正
- 全ドキュメントに自動反映

### DRY違反時
- 認証方式変更 → 複数箇所を手動修正
- 修正漏れのリスク

## チェックリスト

- [ ] 同じ情報が2箇所以上に記述されていないか
- [ ] 共通定義ファイルが作成されているか
- [ ] 参照リンクは正確か
- [ ] 変更時に1箇所の修正で済むか
