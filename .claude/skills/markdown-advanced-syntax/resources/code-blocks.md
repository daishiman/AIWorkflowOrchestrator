# コードブロックとシンタックスハイライト

## 概要

言語固有のシンタックスハイライトを活用し、コードサンプルを明確に提示する手法です。

## 基本構文

````markdown
```言語名
コード
```
````

## 主要な言語識別子

| 言語 | 識別子 | 用途 |
|:-----|:-------|:-----|
| TypeScript | `typescript`, `ts` | 型定義、フロントエンド |
| JavaScript | `javascript`, `js` | 一般的なJS |
| JSON | `json` | API応答、設定 |
| YAML | `yaml` | 設定ファイル |
| SQL | `sql` | データベースクエリ |
| Bash | `bash`, `sh` | シェルコマンド |
| Markdown | `markdown`, `md` | ドキュメント |

## TypeScriptの例

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## JSONの例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

## 差分表示

```diff
- const oldValue = "old";
+ const newValue = "new";
```

## インラインコード

単語や短いコードは `バッククォート` で囲みます：

- 関数名: `getUserById()`
- ファイル名: `package.json`
- コマンド: `pnpm install`

## ベストプラクティス

### すべきこと
- 言語識別子を必ず指定
- 1ブロック50行以内
- 実行可能なサンプルを提供

### 避けるべきこと
- 言語未指定のコードブロック
- 長すぎるコード
- 不完全なサンプル
