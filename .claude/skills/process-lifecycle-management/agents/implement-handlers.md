# Task仕様書：シグナルハンドラ実装

## 1. メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| 名前     | Software Engineer       |
| 専門領域 | Node.jsシグナル処理実装 |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Node.jsのprocess APIとシグナル処理の詳細を理解し、テンプレートベースで保守性の高いシグナルハンドラを実装する。TypeScriptの型安全性を活用し、実行時エラーを最小化する。

### 2.2 目的

ライフサイクル設計書に基づき、Graceful Shutdownとシグナル処理を確実に実装する。

### 2.3 責務

| 責務                        | 成果物                    |
| --------------------------- | ------------------------- |
| SignalHandlerクラス実装     | TypeScript実装ファイル    |
| クリーンアップ関数登録      | リソース管理コード        |
| シグナルハンドラー設定      | process.on()実装          |
| タイムアウト処理実装        | 強制終了機構              |
| PM2連携実装（該当する場合） | ready通知・メッセージ処理 |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント             | 適用方法                             |
| ----------------------------- | ------------------------------------ |
| Node.js Process Documentation | process.on()、process.exit()の使用法 |
| PM2 Advanced Documentation    | PM2メッセージハンドリングとready通知 |
| TypeScript Handbook           | 型安全なインターフェース設計         |

> 詳細は `references/signal-handling.md` と `assets/signal-handler.template.ts` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                                        |
| -------- | ----------------------------------------------------------------- |
| 1        | `assets/signal-handler.template.ts` をベースとして採用            |
| 2        | ライフサイクル設計書からクリーンアップ対象リソースを抽出          |
| 3        | 各リソースに対応するクリーンアップ関数を実装                      |
| 4        | SignalHandlerにクリーンアップ関数を登録（逆順実行を考慮）         |
| 5        | タイムアウト値を設定書の値で上書き                                |
| 6        | PM2連携が必要な場合、ready通知とメッセージハンドラを実装          |
| 7        | エラーハンドリング（uncaughtException、unhandledRejection）を実装 |

### 4.2 チェックリスト

| 項目                   | 基準                                                   |
| ---------------------- | ------------------------------------------------------ |
| テンプレート使用       | `signal-handler.template.ts` を基礎としている          |
| クリーンアップ登録順序 | 後入れ先出し（LIFO）で実行されるよう登録されている     |
| タイムアウト設定       | 設計書の値が正しく反映されている                       |
| 二重実行防止           | `isShuttingDown` フラグで二重実行を防止している        |
| PM2 ready通知          | PM2使用時に `process.send('ready')` を実装している     |
| エラーハンドリング     | uncaughtException と unhandledRejection を捕捉している |
| 型安全性               | TypeScriptの型定義が適切に使用されている               |
| ログ出力               | シャットダウンの各ステップでログが出力されている       |

### 4.3 ビジネスルール（制約）

| 制約                 | 説明                                                  |
| -------------------- | ----------------------------------------------------- |
| クリーンアップ順序   | 登録順の逆順（後入れ先出し）で実行する                |
| タイムアウト強制終了 | タイムアウト超過時は `process.exit(1)` で強制終了する |
| エラー時も終了       | クリーンアップでエラーが発生しても終了処理を継続する  |
| PM2メッセージ型      | PM2メッセージは文字列 `"shutdown"` で判定する         |
| シグナルリスナー重複 | 同じシグナルに複数のリスナーを登録しない              |

---

## 5. インターフェース

### 5.1 入力

| データ名             | 提供元                 | 検証ルール                                   | 欠損時処理                 |
| -------------------- | ---------------------- | -------------------------------------------- | -------------------------- |
| ライフサイクル設計書 | analyze-lifecycle Task | クリーンアップリストとタイムアウトが定義     | テンプレートのデフォルト値 |
| リソースインスタンス | アプリケーションコード | server、db等のクリーンアップ可能オブジェクト | エラーログを出力           |

### 5.2 出力

| 成果物名             | 受領先                 | 内容                 |
| -------------------- | ---------------------- | -------------------- |
| シグナルハンドラ実装 | validate-shutdown Task | 検証可能な実装コード |

#### 実装パターン

```typescript
// 1. SignalHandler のインポート
import { SignalHandler } from './signal-handler';

// 2. アプリケーションリソースの初期化
const server = createServer(...);
const db = await connectDatabase(...);

// 3. SignalHandler インスタンス作成
const signalHandler = new SignalHandler({
  shutdownTimeout: 30000, // 設計書の値
  logger: console,
  watchPM2Messages: true, // PM2使用時
});

// 4. クリーンアップ関数を逆順で登録
// 最後に登録したものが最初に実行される
signalHandler.registerCleanup('database', async () => {
  await db.disconnect();
});

signalHandler.registerCleanup('http-server', () => {
  return new Promise<void>((resolve) => {
    server.close(() => {
      console.log('HTTP server closed');
      resolve();
    });
  });
});

// 5. ハンドラーをセットアップ
signalHandler.setup();

// 6. アプリケーション起動
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

  // PM2にready通知
  if (typeof process.send === 'function') {
    process.send('ready');
  }
});
```

---

## 6. 実装例

### 入力（ライフサイクル設計書からの抽出）

```markdown
## クリーンアップ対象リソース

優先順位（逆順実行）:

1. PostgreSQL接続プール
2. Expressサーバー（server.close()）
3. ロギングストリーム

## タイムアウト設定

- シャットダウンタイムアウト: 30000ms
```

### 出力（実装コード）

```typescript
import express from "express";
import { Pool } from "pg";
import { SignalHandler } from "./signal-handler";

// アプリケーションリソース
const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// SignalHandler初期化
const signalHandler = new SignalHandler({
  shutdownTimeout: 30000,
  logger: console,
  watchPM2Messages: true,
});

// クリーンアップ登録（逆順実行を考慮して登録順を調整）
// 1. PostgreSQL接続プール（最初に実行したい → 最後に登録）
signalHandler.registerCleanup("postgresql-pool", async () => {
  console.log("Closing PostgreSQL connection pool...");
  await pool.end();
  console.log("PostgreSQL pool closed");
});

// 2. Expressサーバー（2番目に実行したい → 2番目に登録）
let server: ReturnType<typeof app.listen>;
signalHandler.registerCleanup("express-server", () => {
  return new Promise<void>((resolve, reject) => {
    console.log("Closing Express server...");
    server.close((err) => {
      if (err) {
        console.error("Error closing server:", err);
        reject(err);
      } else {
        console.log("Express server closed");
        resolve();
      }
    });
  });
});

// 3. ロギングストリーム（最後に実行したい → 最初に登録）
signalHandler.registerCleanup("logging-stream", async () => {
  console.log("Flushing logs...");
  // ロギングライブラリのflush処理
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("Logs flushed");
});

// ハンドラーセットアップ
signalHandler.setup();

// アプリケーション起動
const PORT = process.env.PORT || 3000;
server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

  // PM2にready通知
  if (typeof process.send === "function") {
    process.send("ready");
  }
});

// ヘルスチェック機能（シャットダウン中は503を返す）
app.get("/health", (req, res) => {
  if (signalHandler.isInShutdown()) {
    return res.status(503).json({ status: "shutting down" });
  }
  res.json({ status: "ok" });
});
```

---

## 7. アンチパターンと対策

### アンチパターン1: クリーンアップ登録順序の誤り

```typescript
// ❌ 悪い例：実行順序を考慮していない
signalHandler.registerCleanup("db", () => db.close());
signalHandler.registerCleanup("server", () => server.close());
// → サーバーが先にクローズされ、進行中リクエストのDB接続が切れる
```

```typescript
// ✅ 良い例：逆順実行を考慮
signalHandler.registerCleanup("server", () => server.close()); // 2番目に実行
signalHandler.registerCleanup("db", () => db.close()); // 1番目に実行
```

### アンチパターン2: SIGKILLのハンドリング試行

```typescript
// ❌ 悪い例：SIGKILLは捕捉不可能
process.on("SIGKILL", () => {
  // このコードは実行されない
});
```

```typescript
// ✅ 良い例：SIGTERM/SIGINTのみ
const shutdownSignals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
```

### アンチパターン3: タイムアウトなし

```typescript
// ❌ 悪い例：タイムアウトなしでハングする可能性
signalHandler.registerCleanup("slow-operation", async () => {
  await verySlowOperation(); // 永遠に終わらないかも
});
```

```typescript
// ✅ 良い例：SignalHandlerのタイムアウト機構を活用
const signalHandler = new SignalHandler({
  shutdownTimeout: 30000, // 30秒でタイムアウト
});
```
