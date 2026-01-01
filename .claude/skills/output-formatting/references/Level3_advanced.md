# Level 3: 応用技法

## 目的

複雑なフォーマット設計と形式間変換、高度なパターンを習得する。

---

## 1. 複合フォーマット設計

### 1.1 Markdown + JSON 埋め込み

````markdown
# API ドキュメント

## リクエスト例

\```json
{
"method": "POST",
"endpoint": "/api/users",
"body": {
"name": "John Doe",
"email": "john@example.com"
}
}
\```

## レスポンス例

\```json
{
"status": "success",
"data": {
"id": "123",
"name": "John Doe"
}
}
\```
````

### 1.2 YAML + 複雑な構造

```yaml
workflows:
  - name: main-workflow
    triggers:
      - type: push
        branches: [main, develop]
      - type: schedule
        cron: "0 0 * * *"
    jobs:
      - name: build
        matrix:
          os: [ubuntu, windows, macos]
          node: [16, 18, 20]
        steps:
          - run: npm install
          - run: npm test
          - if: matrix.os == 'ubuntu'
            run: npm run coverage
```

---

## 2. スキーマ駆動設計

### 2.1 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    }
  }
}
```

### 2.2 スキーマ活用パターン

1. **バリデーション**: 入力データの検証
2. **ドキュメント生成**: スキーマからAPIドキュメント自動生成
3. **型生成**: TypeScript/Go等の型定義生成
4. **テストデータ**: スキーマからサンプルデータ生成

---

## 3. 形式間変換

### 3.1 JSON → Markdown

**入力（JSON）**:

```json
{
  "title": "Report",
  "sections": [
    {
      "heading": "Section 1",
      "content": "Content here"
    }
  ]
}
```

**出力（Markdown）**:

```markdown
# Report

## Section 1

Content here
```

### 3.2 YAML → JSON

**入力（YAML）**:

```yaml
config:
  debug: true
  timeout: 5000
```

**出力（JSON）**:

```json
{
  "config": {
    "debug": true,
    "timeout": 5000
  }
}
```

### 3.3 変換時の注意点

| 注意事項             | 理由                                |
| -------------------- | ----------------------------------- |
| データ型の保持       | 文字列と数値を正確に変換            |
| 特殊文字のエスケープ | 形式ごとのルールに従う              |
| コメントの扱い       | JSON は非対応、YAML/Markdown は対応 |
| 順序の保持           | 必要に応じて順序を維持              |

---

## 4. 大規模データのフォーマット

### 4.1 ストリーミング出力

```javascript
// 大量データを分割して出力
function* generateLargeJSON(items) {
  yield "[\n";
  for (let i = 0; i < items.length; i++) {
    yield `  ${JSON.stringify(items[i])}`;
    if (i < items.length - 1) yield ",\n";
  }
  yield "\n]";
}
```

### 4.2 ページネーション

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 100,
    "totalPages": 50,
    "totalItems": 5000,
    "links": {
      "first": "/api/items?page=1",
      "prev": null,
      "next": "/api/items?page=2",
      "last": "/api/items?page=50"
    }
  }
}
```

---

## 5. 動的フォーマット生成

### 5.1 テンプレートエンジン活用

```typescript
interface ReportData {
  title: string;
  sections: Array<{ heading: string; content: string }>;
}

function generateMarkdown(data: ReportData): string {
  let md = `# ${data.title}\n\n`;
  for (const section of data.sections) {
    md += `## ${section.heading}\n\n${section.content}\n\n`;
  }
  return md;
}
```

### 5.2 条件付きフォーマット

```typescript
function formatUser(user: User, format: "json" | "yaml" | "markdown"): string {
  switch (format) {
    case "json":
      return JSON.stringify(user, null, 2);
    case "yaml":
      return YAML.stringify(user);
    case "markdown":
      return `# ${user.name}\n\nEmail: ${user.email}`;
  }
}
```

---

## 6. バージョニングとマイグレーション

### 6.1 バージョン付き形式

```json
{
  "version": "2.0",
  "data": {
    "newField": "value"
  },
  "deprecated": {
    "oldField": "use newField instead"
  }
}
```

### 6.2 後方互換性

```typescript
function migrateConfig(config: any): ConfigV2 {
  if (config.version === "1.0") {
    return {
      version: "2.0",
      settings: {
        newField: config.oldField || "default",
      },
    };
  }
  return config;
}
```

---

## 7. パフォーマンス最適化

### 7.1 最適化テクニック

| テクニック             | 適用場面                     |
| ---------------------- | ---------------------------- |
| インデント削除（圧縮） | 本番環境のJSON/YAML          |
| ストリーミング         | 大容量ファイル               |
| 遅延評価               | 複雑な変換処理               |
| キャッシュ             | 頻繁に使用されるテンプレート |

### 7.2 圧縮 vs 可読性

| 環境         | 推奨                         |
| ------------ | ---------------------------- |
| 開発         | インデント有り、コメント有り |
| ステージング | インデント有り、コメント無し |
| 本番         | 圧縮、コメント無し           |

---

## 次のステップ

Level 4ではベストプラクティスと高度な設計パターンを学びます。
