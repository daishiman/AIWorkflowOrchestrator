# Level 2: 実務パターン

## 目的

実務で頻出するフォーマットパターンと形式別のベストプラクティスを習得する。

---

## 1. Markdownパターン

### 1.1 技術ドキュメント構造

````markdown
# プロジェクト名

## 概要

簡潔な説明（2-3文）

## 前提条件

- Node.js 18+
- pnpm

## インストール

\```bash
pnpm install
\```

## 使用方法

### 基本例

\```typescript
// コード例
\```

## API リファレンス

### 関数名

**パラメータ**:

- `param1` (string): 説明
- `param2` (number): 説明

**戻り値**: 型と説明

## トラブルシューティング

| 問題 | 解決策 |
| ---- | ------ |
|      |        |
````

### 1.2 レポート構造

```markdown
# レポートタイトル

**日付**: 2025-12-31
**作成者**: Name

---

## サマリー

主要な発見事項（箇条書き）

## 詳細分析

### セクション1

内容...

### セクション2

内容...

## 結論

要約と推奨事項

## 付録

参考資料、データテーブル
```

---

## 2. JSONパターン

### 2.1 API レスポンス

```json
{
  "status": "success",
  "data": {
    "id": "123",
    "attributes": {
      "name": "Example",
      "createdAt": "2025-12-31T00:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-12-31T00:00:00Z",
    "version": "1.0"
  }
}
```

### 2.2 設定ファイル

```json
{
  "name": "project-name",
  "version": "1.0.0",
  "settings": {
    "debug": false,
    "timeout": 5000,
    "retries": 3
  },
  "features": {
    "feature1": {
      "enabled": true,
      "config": {}
    }
  }
}
```

---

## 3. YAMLパターン

### 3.1 CI/CD設定

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup
        run: npm install
      - name: Test
        run: npm test
```

### 3.2 アプリケーション設定

```yaml
app:
  name: MyApp
  version: 1.0.0
  environment: production

database:
  host: localhost
  port: 5432
  credentials:
    user: ${DB_USER}
    password: ${DB_PASSWORD}

features:
  - name: feature1
    enabled: true
  - name: feature2
    enabled: false
```

---

## 4. テーブルパターン

### 4.1 データ比較表

```markdown
| 項目           | オプションA | オプションB | オプションC |
| -------------- | ----------- | ----------- | ----------- |
| パフォーマンス | 高          | 中          | 低          |
| コスト         | 低          | 中          | 高          |
| 保守性         | 中          | 高          | 中          |
| **総合評価**   | ★★★         | ★★★★        | ★★          |
```

### 4.2 ステータス一覧

```markdown
| ID  | ステータス | 最終更新   | 担当者 |
| --- | ---------- | ---------- | ------ |
| #1  | 完了       | 2025-12-31 | Alice  |
| #2  | 進行中     | 2025-12-30 | Bob    |
| #3  | 保留       | 2025-12-29 | Carol  |
```

---

## 5. 命名規則

### 5.1 形式別推奨

| 形式     | 規則       | 例           |
| -------- | ---------- | ------------ |
| JSON     | camelCase  | `firstName`  |
| YAML     | snake_case | `first_name` |
| Markdown | 自然言語   | `First Name` |
| CSV      | snake_case | `first_name` |

### 5.2 避けるべき命名

- 略語のみ（`fn` → `firstName`）
- 型を含む（`stringName` → `name`）
- ハンガリアン記法（`strName` → `name`）

---

## 6. インデントとスペーシング

### 6.1 推奨ルール

| 形式     | インデント | 改行             |
| -------- | ---------- | ---------------- |
| JSON     | 2スペース  | 各要素後         |
| YAML     | 2スペース  | リスト項目間なし |
| Markdown | なし       | セクション間2行  |

### 6.2 一貫性の重要性

同一ファイル内では必ず同じルールを適用する。

---

## 7. エラー処理パターン

### 7.1 JSON エラー

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "issue": "Invalid format"
      }
    ]
  }
}
```

### 7.2 Markdown エラー表示

```markdown
## エラー: VALIDATION_ERROR

**メッセージ**: Invalid input

**詳細**:

- フィールド: `email`
- 問題: Invalid format
```

---

## 次のステップ

Level 3では応用技法と複雑なフォーマット設計を学びます。
