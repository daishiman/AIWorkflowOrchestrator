---
name: graceful-shutdown-patterns
description: |
  Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。
  Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、
  リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。

  専門分野:
  - シャットダウンシーケンス: 新規リクエスト拒否→完了待機→リソース解放
  - リソースクリーンアップ: DB接続、キャッシュ、ファイルハンドル、タイマー
  - 接続ドレイン: HTTPサーバー、WebSocket、キュー接続の優雅な終了
  - タイムアウト処理: 強制終了までの猶予時間と段階的終了
  - PM2連携: kill_timeout、wait_ready設定との統合

  使用タイミング:
  - アプリケーションの終了処理を設計する時
  - リソースリークを防ぐクリーンアップを実装する時
  - ゼロダウンタイムデプロイを実現する時
  - PM2でのgraceful reload設定時

  Use proactively when designing shutdown sequences, implementing
  resource cleanup, or configuring zero-downtime deployments.
version: 1.0.0
---

# Graceful Shutdown Patterns

## 概要

Graceful Shutdownは、進行中の処理を安全に完了させ、リソースを適切に解放して
プロセスを終了するパターンです。Twelve-Factor Appの「廃棄容易性」原則に基づきます。

**主要な価値**:
- データ損失の防止
- 接続の適切な終了
- ゼロダウンタイムデプロイ
- リソースリークの防止

## リソース構造

```
graceful-shutdown-patterns/
├── SKILL.md
├── resources/
│   ├── shutdown-sequence.md
│   ├── resource-cleanup.md
│   └── connection-draining.md
├── scripts/
│   └── test-graceful-shutdown.mjs
└── templates/
    └── graceful-shutdown.template.ts
```

## コマンドリファレンス

### リソース読み取り

```bash
# シャットダウンシーケンスガイド
cat .claude/skills/graceful-shutdown-patterns/resources/shutdown-sequence.md

# リソースクリーンアップガイド
cat .claude/skills/graceful-shutdown-patterns/resources/resource-cleanup.md

# 接続ドレインガイド
cat .claude/skills/graceful-shutdown-patterns/resources/connection-draining.md
```

### スクリプト実行

```bash
# Graceful Shutdownテスト
node .claude/skills/graceful-shutdown-patterns/scripts/test-graceful-shutdown.mjs <pid>
```

### テンプレート参照

```bash
# Graceful Shutdownテンプレート
cat .claude/skills/graceful-shutdown-patterns/templates/graceful-shutdown.template.ts
```

## ワークフロー

### Phase 1: シグナル受信

**対応シグナル**:
| シグナル | トリガー | 対応 |
|---------|---------|------|
| SIGTERM | PM2 stop/restart, kill | Graceful Shutdown開始 |
| SIGINT | Ctrl+C | Graceful Shutdown開始 |
| SIGKILL | kill -9 | 即座終了（捕捉不可） |

**シグナルハンドラー設計**:
```javascript
let isShuttingDown = false;

process.on('SIGTERM', () => {
  if (isShuttingDown) return;  // 二重実行防止
  isShuttingDown = true;
  gracefulShutdown();
});
```

**リソース**: `resources/shutdown-sequence.md`

### Phase 2: 新規リクエスト拒否

**HTTPサーバー**:
```javascript
// 新規接続を受け付けない
server.close(() => {
  console.log('HTTP server closed');
});
```

**ヘルスチェックエンドポイント**:
```javascript
app.get('/health', (req, res) => {
  if (isShuttingDown) {
    res.status(503).json({ status: 'shutting_down' });
  } else {
    res.json({ status: 'healthy' });
  }
});
```

**判断基準**:
- [ ] ヘルスチェックはシャットダウン状態を反映するか？
- [ ] ロードバランサーへの通知は考慮されているか？

### Phase 3: 進行中処理の完了待機

**リクエストカウンター**:
```javascript
let activeRequests = 0;

app.use((req, res, next) => {
  activeRequests++;
  res.on('finish', () => activeRequests--);
  next();
});

async function waitForRequests(timeout = 30000) {
  const start = Date.now();
  while (activeRequests > 0) {
    if (Date.now() - start > timeout) {
      console.warn(`Timeout: ${activeRequests} requests still active`);
      break;
    }
    await sleep(100);
  }
}
```

**タイムアウト設定**:
- 短時間リクエスト: 10-15秒
- DB処理あり: 30秒
- 長時間処理: 60秒以上

### Phase 4: リソースクリーンアップ

**クリーンアップ優先順位**:
1. HTTPサーバー（新規接続停止）
2. 外部サービス接続（API、キュー）
3. キャッシュ接続（Redis、Memcached）
4. データベース接続（コネクションプール）
5. ファイルハンドル
6. タイマー・インターバル

**クリーンアップパターン**:
```javascript
const cleanupFunctions = [];

function registerCleanup(name, fn) {
  cleanupFunctions.push({ name, fn });
}

async function cleanup() {
  for (const { name, fn } of cleanupFunctions.reverse()) {
    try {
      await fn();
      console.log(`Cleanup completed: ${name}`);
    } catch (error) {
      console.error(`Cleanup failed: ${name}`, error);
    }
  }
}
```

**リソース**: `resources/resource-cleanup.md`

### Phase 5: プロセス終了

**終了コード設定**:
```javascript
process.exit(0);  // 正常終了
process.exit(1);  // エラー終了
```

**タイムアウト強制終了**:
```javascript
const timeout = setTimeout(() => {
  console.error('Graceful shutdown timeout, forcing exit');
  process.exit(1);
}, 30000);

// クリーンアップ完了後
clearTimeout(timeout);
process.exit(0);
```

## PM2との統合

### kill_timeout設定

```javascript
// ecosystem.config.js
{
  kill_timeout: 5000  // SIGTERMからSIGKILLまでの待機時間
}
```

**推奨値**:
| シナリオ | kill_timeout |
|---------|-------------|
| 軽量API | 3000-5000ms |
| DB処理あり | 10000-15000ms |
| 長時間処理 | 30000ms以上 |

### Graceful Reload

```bash
# ゼロダウンタイム再起動
pm2 reload ecosystem.config.js
```

**動作**:
1. 新プロセス起動
2. 新プロセスがreadyになるまで待機
3. 旧プロセスにSIGINT送信
4. 旧プロセス終了後に完了

### wait_ready設定

```javascript
// ecosystem.config.js
{
  wait_ready: true,
  listen_timeout: 10000
}

// アプリケーション側
server.listen(PORT, () => {
  process.send && process.send('ready');
});
```

## ベストプラクティス

### すべきこと

1. **べき等なシャットダウン**: 二重実行を防止
2. **タイムアウト設定**: 無限待機を避ける
3. **ログ出力**: 各フェーズの開始・終了をログ
4. **優先順位付け**: 重要なリソースから順にクリーンアップ

### 避けるべきこと

1. **同期ブロッキング**: 終了処理での同期I/O
2. **無限待機**: タイムアウトなしの完了待機
3. **例外無視**: クリーンアップエラーの握りつぶし
4. **リソース未解放**: 接続やハンドルの放置

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 |

## 関連スキル

- **process-lifecycle-management** (`.claude/skills/process-lifecycle-management/SKILL.md`)
- **pm2-ecosystem-config** (`.claude/skills/pm2-ecosystem-config/SKILL.md`)
- **memory-monitoring-strategies** (`.claude/skills/memory-monitoring-strategies/SKILL.md`)
