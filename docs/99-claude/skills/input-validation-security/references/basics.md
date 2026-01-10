# 入力検証の基礎

> **相対パス**: `references/basics.md`
> **対応仕様**: OWASP Top 10, CWE-20

---

## 入力検証の原則

### Trust Boundary（信頼境界）

信頼境界は、データが信頼できるゾーンと信頼できないゾーンの間を移動するポイント。

| 信頼できないソース   | 検証ポイント      | 例                               |
| -------------------- | ----------------- | -------------------------------- |
| ユーザー入力         | APIエンドポイント | フォーム、クエリパラメータ       |
| 外部API              | APIクライアント   | 第三者サービスからのレスポンス   |
| ファイルアップロード | ファイル処理層    | ユーザーアップロードファイル     |
| 環境変数             | アプリ起動時      | 設定値（攻撃者が制御可能な場合） |

### 入力ベクターの分類

```
HTTPリクエスト
├── URL
│   ├── パス: /api/users/:id
│   ├── クエリ: ?search=...&page=1
│   └── フラグメント: #section
├── ヘッダー
│   ├── Cookie
│   ├── Authorization
│   └── カスタムヘッダー
├── ボディ
│   ├── JSON
│   ├── FormData
│   └── Multipart（ファイル）
└── その他
    ├── WebSocket メッセージ
    └── GraphQL クエリ
```

---

## 基本的な検証パターン

### 1. 型検証（Type Validation）

```typescript
// Good: Zodによる型安全な検証
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

// Bad: 型チェックなし
const user = req.body; // 何でも受け入れる
```

### 2. 長さ制限（Length Limits）

```typescript
// DoS防止のための制限
const inputSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(1000),
  tags: z.array(z.string()).max(10),
});
```

### 3. Allowlist（許可リスト）

```typescript
// Good: 許可された値のみ
const statusSchema = z.enum(["draft", "published", "archived"]);

// Bad: ブロックリスト
if (!["admin", "root"].includes(role)) {
  /* 危険 */
}
```

---

## 一般的な攻撃と防御

### XSS（Cross-Site Scripting）

| 攻撃タイプ | 例                                 | 防御                            |
| ---------- | ---------------------------------- | ------------------------------- |
| Reflected  | `<script>alert(1)</script>`        | HTMLエンコーディング            |
| Stored     | データベースに保存されたスクリプト | 入力検証 + 出力エンコーディング |
| DOM-based  | クライアント側でのDOM操作          | textContent使用、innerHTML禁止  |

### SQL Injection

```typescript
// Bad: 文字列連結
db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// Good: パラメータ化クエリ
db.query("SELECT * FROM users WHERE id = $1", [userId]);
```

### Command Injection

```typescript
// Bad: シェル経由
exec(`ls ${userInput}`);

// Good: execFile + 引数分離
execFile("ls", [sanitizedDir]);
```

---

## 検証失敗時の処理

### Fail-Secure原則

```typescript
try {
  const validated = schema.parse(input);
  // 検証成功: 処理を続行
} catch (error) {
  // 検証失敗: リクエストを拒否
  return res.status(400).json({ error: "Invalid input" });
}
```

### エラーメッセージのセキュリティ

| 内部ログ                                                | ユーザーへのレスポンス           |
| ------------------------------------------------------- | -------------------------------- |
| `Validation failed: email format invalid at position 5` | `Invalid input data`             |
| `SQL syntax error near 'DROP'`                          | `Request could not be processed` |

詳細なエラーは攻撃者に情報を提供するため、汎用メッセージを返す。

---

## 関連リソース

- **詳細パターン**: See [patterns.md](patterns.md)
- **XSS防止**: See [xss-prevention.md](xss-prevention.md)
- **SQLi防止**: See [sql-injection-prevention.md](sql-injection-prevention.md)
