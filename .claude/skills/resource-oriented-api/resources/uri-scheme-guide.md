# URIスキーム設計ガイド

## 1. URI構造

### 標準フォーマット

```
scheme://[authority]/path[?query][#fragment]

構成要素:
- scheme: プロトコル識別子（必須）
- authority: ホスト/ソース識別子（オプション）
- path: リソースパス（必須）
- query: パラメータ（オプション）
- fragment: サブリソース識別子（オプション）
```

### MCP推奨スキーム

```yaml
ファイルシステム:
  scheme: "file"
  format: "file:///absolute/path/to/resource"
  例:
    - "file:///home/user/document.md"
    - "file:///C:/Users/name/file.txt"  # Windows

データベース:
  scheme: "db"
  format: "db://type/database/table[/id]"
  例:
    - "db://postgres/mydb/users"
    - "db://postgres/mydb/users/123"
    - "db://sqlite/data.db/records"

Git リポジトリ:
  scheme: "git"
  format: "git://repo/branch/path"
  例:
    - "git://origin/main/src/index.ts"
    - "git://upstream/develop/README.md"

メモリ/セッション:
  scheme: "memory"
  format: "memory://scope/key"
  例:
    - "memory://session/context"
    - "memory://global/config"

HTTP API:
  scheme: "http" または "https"
  format: 標準URL形式
  例:
    - "https://api.github.com/repos/owner/repo"
    - "https://api.slack.com/channels/C12345"

カスタム:
  scheme: "custom"
  format: "custom://provider/resource-type/id"
  例:
    - "custom://notion/pages/abc123"
    - "custom://jira/issues/PROJ-123"
```

## 2. パス設計原則

### 階層構造

```
良い設計:
  /users/123/posts/456/comments
  /projects/web-app/src/components
  /config/production/database

悪い設計:
  /getUserPostComment?user=123&post=456&comment=789
  /projectWebAppSrcComponents
  /config_production_database
```

### 命名規則

```yaml
推奨:
  - ケバブケース: "my-resource-name"
  - 小文字: すべて小文字を使用
  - 複数形: コレクションは複数形 ("/users", "/posts")
  - 単数形: 個別リソースは単数形 ("/users/123")

避けるべき:
  - キャメルケース: "myResourceName"
  - アンダースコア: "my_resource_name"
  - 大文字: "MY-RESOURCE"
  - 動詞: "/getUser", "/createPost"
```

### パス深度

```
推奨: 最大4レベル
  /collection/id/sub-collection/id

例:
  ✅ /repos/owner/name/issues/123
  ✅ /users/123/posts/456
  ❌ /org/team/project/repo/branch/dir/file/line  # 深すぎる
```

## 3. クエリパラメータ

### 用途別設計

```yaml
フィルタリング:
  ?status=active
  ?type=issue&state=open
  ?created_after=2025-01-01

ソート:
  ?sort=created_at&order=desc
  ?sort=-updated_at  # マイナス記号で降順

ページネーション:
  ?page=1&per_page=20
  ?offset=0&limit=20
  ?cursor=eyJpZCI6MTIzfQ==

フィールド選択:
  ?fields=id,name,email
  ?include=author,comments
  ?exclude=password,secret

検索:
  ?q=search+term
  ?search=keyword
```

### 命名規約

```
推奨:
  - スネークケース: "created_at", "per_page"
  - 略語は避ける: "page" not "pg", "limit" not "lmt"
  - 一貫性: プロジェクト全体で統一

例:
  ✅ ?per_page=20&sort_by=created_at
  ❌ ?perPage=20&sortBy=createdAt  # 不統一
```

## 4. フラグメント識別子

### 用途

```yaml
サブリソース参照:
  "file:///doc.md#section-2"
  "db://postgres/users/123#email"

行番号指定:
  "file:///src/main.ts#L10"
  "file:///src/main.ts#L10-L20"

JSON ポインタ:
  "file:///config.json#/database/host"
  "memory://context#/user/preferences"
```

### 設計指針

```
1. フラグメントはクライアント側解釈
   - サーバーはフラグメントを受け取らない
   - クライアントがコンテンツ内位置を特定

2. 一意性
   - 同一リソース内で一意
   - 予測可能なパターン

3. エンコーディング
   - 特殊文字はパーセントエンコード
   - スペースは%20
```

## 5. エンコーディング規則

### パーセントエンコーディング

```yaml
必須エンコード文字:
  スペース: %20
  #: %23
  %: %25
  ?: %3F
  &: %26
  =: %3D

パス内の特殊文字:
  /: パス区切り（エンコードしない）
  .: 拡張子区切り（エンコードしない）

クエリ内の特殊文字:
  =: 値区切り（エンコードしない）
  &: パラメータ区切り（エンコードしない）
```

### 国際化対応

```javascript
// 正しいエンコーディング
const uri = `file:///docs/${encodeURIComponent('日本語ファイル')}.md`;
// 結果: "file:///docs/%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB.md"

// デコーディング
const decoded = decodeURIComponent('%E6%97%A5%E6%9C%AC%E8%AA%9E');
// 結果: "日本語"
```

## 6. URI正規化

### 正規化ステップ

```
1. スキームを小文字に変換
   HTTP://Example.com → http://example.com

2. ホストを小文字に変換
   http://EXAMPLE.COM → http://example.com

3. デフォルトポートを除去
   http://example.com:80 → http://example.com

4. パスを正規化
   /a/b/../c → /a/c
   /a/./b → /a/b

5. 末尾スラッシュを統一
   /path/ → /path （推奨: なし）

6. クエリパラメータをソート
   ?b=2&a=1 → ?a=1&b=2

7. 空のクエリパラメータを除去
   ?a=&b=2 → ?b=2
```

### 実装例

```javascript
function normalizeUri(uri) {
  const url = new URL(uri);

  // スキームとホストは自動的に小文字
  let normalized = `${url.protocol}//${url.host}`;

  // パス正規化
  const path = url.pathname
    .replace(/\/+/g, '/')      // 重複スラッシュ
    .replace(/\/\.\//g, '/')   // /./
    .replace(/\/[^/]+\/\.\.\//g, '/') // /../
    .replace(/\/+$/, '');       // 末尾スラッシュ

  normalized += path || '/';

  // クエリパラメータソート
  if (url.search) {
    const params = new URLSearchParams(url.search);
    const sorted = [...params.entries()]
      .filter(([_, v]) => v !== '')
      .sort(([a], [b]) => a.localeCompare(b));

    if (sorted.length > 0) {
      normalized += '?' + new URLSearchParams(sorted).toString();
    }
  }

  return normalized;
}
```

## 7. セキュリティ考慮事項

### パストラバーサル防止

```javascript
function validatePath(basePath, userPath) {
  const resolved = path.resolve(basePath, userPath);

  // ベースパス外へのアクセスを禁止
  if (!resolved.startsWith(basePath)) {
    throw new Error('Path traversal detected');
  }

  return resolved;
}
```

### 許可されたスキームの制限

```javascript
const ALLOWED_SCHEMES = ['file', 'db', 'memory', 'git'];

function validateScheme(uri) {
  const url = new URL(uri);
  const scheme = url.protocol.replace(':', '');

  if (!ALLOWED_SCHEMES.includes(scheme)) {
    throw new Error(`Scheme not allowed: ${scheme}`);
  }

  return true;
}
```

### URLインジェクション防止

```javascript
// 悪い例: ユーザー入力を直接結合
const badUri = `db://postgres/users/${userId}`; // userId = "../admin"

// 良い例: 適切なバリデーションとエンコーディング
function buildResourceUri(table, id) {
  // IDのバリデーション
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error('Invalid ID format');
  }

  return `db://postgres/${encodeURIComponent(table)}/${encodeURIComponent(id)}`;
}
```

## 8. 設計チェックリスト

### URI設計レビュー

- [ ] スキームは明確で一貫している？
- [ ] パスは階層的で直感的？
- [ ] 命名規則は統一されている？
- [ ] 特殊文字は適切にエンコード？
- [ ] セキュリティリスクは考慮済み？

### 実装チェック

- [ ] 正規化ロジックは実装済み？
- [ ] エラーハンドリングは適切？
- [ ] パストラバーサル対策は実装済み？
- [ ] 許可スキームの制限は実装済み？
