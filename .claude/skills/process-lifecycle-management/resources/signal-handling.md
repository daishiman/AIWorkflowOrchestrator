# シグナル処理ガイド

## Unix/Linuxシグナル一覧

### プロセス制御シグナル

| シグナル | 番号 | デフォルト動作 | 用途 |
|---------|-----|---------------|------|
| SIGTERM | 15 | 終了 | 正常終了要求（PM2 stop） |
| SIGINT | 2 | 終了 | 割り込み（Ctrl+C） |
| SIGKILL | 9 | 強制終了 | 強制停止（捕捉不可） |
| SIGQUIT | 3 | コアダンプ | 終了 + コアダンプ |
| SIGHUP | 1 | 終了 | 端末切断、設定再読み込み |

### ユーザー定義シグナル

| シグナル | 番号 | デフォルト動作 | 推奨用途 |
|---------|-----|---------------|---------|
| SIGUSR1 | 10 | 終了 | デバッグ情報出力 |
| SIGUSR2 | 12 | 終了 | ログローテーション |

## Node.jsでのシグナル処理

### 基本的なハンドラー

```javascript
// SIGTERM: PM2 stop/restart、kill
process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  await gracefulShutdown();
  process.exit(0);
});

// SIGINT: Ctrl+C
process.on('SIGINT', async () => {
  console.log('SIGINT received');
  await gracefulShutdown();
  process.exit(0);
});

// SIGHUP: 設定再読み込み
process.on('SIGHUP', () => {
  console.log('SIGHUP received, reloading config...');
  reloadConfig();
});
```

### 完全なシグナルハンドラー実装

```javascript
class SignalHandler {
  constructor(options = {}) {
    this.isShuttingDown = false;
    this.shutdownTimeout = options.shutdownTimeout || 30000;
    this.cleanupFns = [];
  }

  // クリーンアップ関数を登録
  registerCleanup(fn) {
    this.cleanupFns.push(fn);
  }

  // シグナルハンドラーを設定
  setup() {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach(signal => {
      process.on(signal, () => this.handleShutdown(signal));
    });

    // uncaughtException
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.handleShutdown('uncaughtException');
    });

    // unhandledRejection
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection:', reason);
      // ログのみ、終了しない
    });
  }

  async handleShutdown(signal) {
    if (this.isShuttingDown) {
      console.log('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    console.log(`${signal} received, starting shutdown...`);

    // タイムアウト設定
    const timeout = setTimeout(() => {
      console.error('Shutdown timeout, forcing exit');
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      // 登録されたクリーンアップを順次実行
      for (const fn of this.cleanupFns) {
        await fn();
      }

      clearTimeout(timeout);
      console.log('Shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Shutdown error:', error);
      process.exit(1);
    }
  }
}

// 使用例
const signalHandler = new SignalHandler({ shutdownTimeout: 30000 });

signalHandler.registerCleanup(async () => {
  console.log('Closing HTTP server...');
  await server.close();
});

signalHandler.registerCleanup(async () => {
  console.log('Closing database...');
  await db.close();
});

signalHandler.setup();
```

## PM2とのシグナル連携

### PM2のシグナル送信タイミング

| PM2コマンド | 送信シグナル | タイムアウト後 |
|------------|-------------|---------------|
| pm2 stop | SIGINT | kill_timeout後にSIGKILL |
| pm2 restart | SIGINT | kill_timeout後にSIGKILL |
| pm2 reload | SIGINT | 新プロセス起動後 |
| pm2 delete | SIGINT | 即座にSIGKILL |

### kill_timeout設定

```javascript
// ecosystem.config.js
{
  kill_timeout: 5000  // 5秒後にSIGKILL
}
```

**推奨値**:
- 短時間処理: 3000-5000ms
- DB処理あり: 10000-15000ms
- 長時間処理: 30000ms以上

### shutdown_with_message

```javascript
// ecosystem.config.js
{
  shutdown_with_message: true
}
```

```javascript
// アプリケーション側
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    gracefulShutdown();
  }
});
```

## シグナル処理のベストプラクティス

### ✅ すべきこと

1. **べき等な終了処理**:
   ```javascript
   let isShuttingDown = false;

   process.on('SIGTERM', () => {
     if (isShuttingDown) return;  // 二重実行防止
     isShuttingDown = true;
     gracefulShutdown();
   });
   ```

2. **タイムアウト設定**:
   ```javascript
   const timeout = setTimeout(() => {
     process.exit(1);
   }, 30000);
   ```

3. **適切なログ出力**:
   ```javascript
   console.log(`[${new Date().toISOString()}] SIGTERM received`);
   ```

### ❌ 避けるべきこと

1. **シグナルの無視**:
   ```javascript
   // 危険！PM2がSIGKILLを送信するまで終了しない
   process.on('SIGTERM', () => {});
   ```

2. **同期ブロッキング**:
   ```javascript
   // 危険！他の処理がブロックされる
   process.on('SIGTERM', () => {
     fs.writeFileSync('/tmp/state', state);  // 非同期を使う
   });
   ```

3. **無限待機**:
   ```javascript
   // 危険！タイムアウトがない
   process.on('SIGTERM', async () => {
     await waitForAllRequests();  // 永遠に待つ可能性
   });
   ```

## プラットフォーム差異

### Windowsでの注意点

```javascript
// WindowsではSIGTERM/SIGINTの動作が異なる
if (process.platform === 'win32') {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}
```

### Dockerでの注意点

```dockerfile
# PID 1問題を避ける
# dumb-initまたはtiniを使用
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
```

## デバッグ

### シグナル送信テスト

```bash
# SIGTERM送信
kill -SIGTERM <pid>

# SIGINT送信
kill -SIGINT <pid>

# SIGUSR1送信
kill -SIGUSR1 <pid>
```

### PM2でのシグナルテスト

```bash
# プロセスID確認
pm2 pid <app-name>

# シグナル送信
pm2 sendSignal SIGUSR1 <app-name>
```
