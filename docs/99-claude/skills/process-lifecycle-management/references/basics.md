# プロセスライフサイクル管理 - 基本概念

## 概要

Node.jsプロセスのライフサイクル管理における基本的な概念と用語を整理します。

## プロセスライフサイクルの概念

### ライフサイクルの段階

```
Created → Starting → Running → Stopping → Stopped
   ↓         ↓          ↓         ↓          ↓
 生成      起動中     実行中    停止中      終了
```

**各段階の役割**:

| 段階     | 説明                       | 主な処理                         |
| -------- | -------------------------- | -------------------------------- |
| Created  | プロセスが生成された状態   | PID割り当て、環境変数継承        |
| Starting | 起動処理を実行中           | 設定読み込み、リソース初期化     |
| Running  | 通常動作中                 | リクエスト処理、監視             |
| Stopping | シャットダウン処理を実行中 | リソース解放、クリーンアップ     |
| Stopped  | プロセスが終了した状態     | 終了コード返却、リソース完全解放 |

## Graceful Shutdownとは

### 定義

プロセスを安全に終了させるための手順。進行中の処理を完了させ、リソースを適切に解放してから終了する。

### Graceful Shutdownの必要性

1. **データ整合性の維持**: 処理中のトランザクションを完了させる
2. **リソースリークの防止**: DB接続、ファイルハンドル等を確実に解放
3. **クライアントへの影響最小化**: 進行中のリクエストを完了させる
4. **再起動の安全性**: 次回起動時の不整合を防ぐ

### Graceful Shutdownの手順

```javascript
// 1. 新規接続の拒否
server.close();

// 2. 進行中の処理完了を待機
await waitForPendingRequests();

// 3. リソースのクリーンアップ（後入れ先出し）
await cleanupDatabase();
await cleanupCache();

// 4. プロセス終了
process.exit(0);
```

## シグナルの基本

### 主要なシグナル

| シグナル | 番号 | 用途                       | 捕捉可能 |
| -------- | ---- | -------------------------- | -------- |
| SIGTERM  | 15   | 正常終了要求（PM2 stop等） | ✓        |
| SIGINT   | 2    | 割り込み（Ctrl+C）         | ✓        |
| SIGHUP   | 1    | 設定再読み込み             | ✓        |
| SIGKILL  | 9    | 強制終了                   | ✗        |

**重要**: SIGKILLは捕捉不可能なため、ハンドラー登録できません。

### シグナルハンドラの基本形

```javascript
process.on("SIGTERM", async () => {
  console.log("SIGTERM received");
  await gracefulShutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received (Ctrl+C)");
  await gracefulShutdown();
  process.exit(0);
});
```

## PM2との連携

### PM2の役割

PM2はNode.jsプロセスマネージャーとして、以下を提供します：

- プロセスの監視と自動再起動
- クラスタモードでの負荷分散
- ログ管理
- Graceful Reload機能

### PM2のシグナル送信

| PM2コマンド | 送信シグナル | タイムアウト後の動作     |
| ----------- | ------------ | ------------------------ |
| pm2 stop    | SIGINT       | kill_timeout後にSIGKILL  |
| pm2 restart | SIGINT       | kill_timeout後にSIGKILL  |
| pm2 reload  | SIGINT       | 新プロセス起動後に旧終了 |
| pm2 delete  | SIGINT       | 即座にSIGKILL            |

### PM2 ready通知

```javascript
// アプリケーション起動完了をPM2に通知
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

  if (typeof process.send === "function") {
    process.send("ready");
  }
});
```

**ecosystem.config.js**:

```javascript
{
  wait_ready: true,
  listen_timeout: 10000,  // ready通知待機時間
  kill_timeout: 5000      // SIGKILL送信までの猶予
}
```

## タイムアウト設定

### シャットダウンタイムアウトの必要性

クリーンアップ処理が永遠に完了しない場合に備え、強制終了するタイムアウトを設定します。

```javascript
const SHUTDOWN_TIMEOUT = 30000; // 30秒

const timeout = setTimeout(() => {
  console.error("Shutdown timeout, forcing exit");
  process.exit(1);
}, SHUTDOWN_TIMEOUT);

try {
  await gracefulShutdown();
  clearTimeout(timeout);
  process.exit(0);
} catch (error) {
  console.error("Shutdown error:", error);
  process.exit(1);
}
```

### 推奨タイムアウト値

| 処理内容         | 推奨値           |
| ---------------- | ---------------- |
| 短時間処理のみ   | 3,000～5,000ms   |
| DB処理あり       | 10,000～15,000ms |
| 長時間処理あり   | 30,000ms以上     |
| PM2 kill_timeout | 5,000～10,000ms  |

## クリーンアップの順序

### 後入れ先出し（LIFO）の原則

リソースは登録順の逆順でクリーンアップします。

```javascript
// 登録順序
signalHandler.registerCleanup("database", cleanupDB); // 3番目に登録
signalHandler.registerCleanup("http-server", cleanupHTTP); // 2番目に登録
signalHandler.registerCleanup("logging", cleanupLog); // 1番目に登録

// 実行順序（逆順）
// 1. cleanupDB     ← 最後に登録したものが最初に実行
// 2. cleanupHTTP
// 3. cleanupLog    ← 最初に登録したものが最後に実行
```

**理由**: HTTPサーバーをクローズする前にDB接続を切ると、進行中のリクエストがエラーになるため。

## ベストプラクティス

### すべきこと

1. **二重実行防止**: シャットダウン処理の二重実行を防ぐフラグを設ける
2. **タイムアウト設定**: すべてのシャットダウン処理にタイムアウトを設定
3. **適切なログ**: シャットダウンの各ステップでログを出力
4. **エラー時も終了**: クリーンアップでエラーが発生しても終了処理を継続

### 避けるべきこと

1. **シグナルの無視**: ハンドラーを登録したのに何もしない
2. **同期ブロッキング**: シグナルハンドラー内で同期処理を実行
3. **無限待機**: タイムアウトなしのクリーンアップ処理
4. **SIGKILLハンドリング**: 捕捉不可能なシグナルへのハンドラー登録

## 用語集

| 用語              | 説明                                             |
| ----------------- | ------------------------------------------------ |
| Graceful Shutdown | 進行中の処理を完了させてから安全に終了すること   |
| Signal Handler    | シグナルを受信したときに実行される関数           |
| LIFO              | Last In First Out（後入れ先出し）の略            |
| PM2               | Node.jsプロセスマネージャー                      |
| kill_timeout      | PM2がSIGKILLを送信するまでの猶予時間             |
| Zombie Process    | 終了したが親プロセスに回収されていない子プロセス |
| IPC               | Inter-Process Communication（プロセス間通信）    |

## 参考文献

- Node.js Process Documentation: https://nodejs.org/api/process.html
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
- The Pragmatic Programmer（Andrew Hunt, David Thomas）
- Linux Kernel Process Management

## 関連リソース

詳細な実装パターンと手順は以下を参照してください：

- See [signal-handling.md](signal-handling.md) - シグナル処理の詳細
- See [process-states.md](process-states.md) - プロセス状態遷移の詳細
- See [child-process-patterns.md](child-process-patterns.md) - 子プロセス管理パターン
- See [patterns.md](patterns.md) - 実装パターンのナビゲーション
