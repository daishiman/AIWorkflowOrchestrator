# セキュリティ設計 - TASK-9H-SKILL-DEBUG

## 式評価サンドボックス

### 実装方針

Node.js `vm` モジュールを使用:

- `vm.createContext()` でセッション variables のみのスコープ作成
- `vm.runInContext()` でタイムアウト付き実行（5秒）
- グローバルオブジェクト (process, require, fs, **dirname, **filename) を除外

### 禁止操作

| カテゴリ     | 禁止対象               | 検出方法                   |
| ------------ | ---------------------- | -------------------------- |
| プロセス     | process, child_process | サンドボックススコープ制限 |
| ファイル     | fs, path               | サンドボックススコープ制限 |
| ネットワーク | http, https, net       | サンドボックススコープ制限 |
| モジュール   | require, import        | サンドボックススコープ制限 |
| 動的コード   | eval, Function         | サンドボックススコープ制限 |

### タイムアウト防止

```typescript
vm.runInContext(expression, context, { timeout: 5000 });
// → timeout 超過時に Error をスロー
```

## IPCセキュリティ

### 送信元検証

全7ハンドラで `validateIpcSender` を実行:

- 送信元ウィンドウが mainWindow であることを検証
- 不正な送信元はエラーをスロー

### 引数バリデーション

P42準拠3段バリデーション:

1. 型チェック: `typeof arg !== "string"`
2. 空文字列: `arg === ""`
3. トリム空文字列: `arg.trim() === ""`

### エラーサニタイズ

- Error.message のみ返却（スタックトレース除外）
- 内部サービス名・パスを含めない
- `electron-log` でサーバーサイドログ記録

## イベントデータサニタイズ

デバッグイベントの variables フィールドには以下を含めない:

- API キー（パターン: `*key*`, `*token*`, `*secret*`）
- パスワード（パターン: `*password*`, `*passwd*`）
- PII（パターン: `*email*`, `*phone*`）
