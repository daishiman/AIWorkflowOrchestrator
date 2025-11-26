---
name: process-lifecycle-management
description: |
  Node.jsプロセスのライフサイクル管理を専門とするスキル。
  Linuxカーネルのプロセス管理思想に基づき、プロセスの生成、実行、
  監視、終了までの完全な制御と、シグナル処理、ゾンビプロセス回避を設計します。

  専門分野:
  - プロセス状態管理: 起動、実行、待機、終了の各フェーズ
  - シグナル処理: SIGTERM、SIGINT、SIGKILL、SIGHUPの適切なハンドリング
  - 子プロセス管理: spawn、fork、execのパターンとリソース回収
  - ゾンビプロセス回避: 適切なプロセス終了と回収メカニズム
  - PM2連携: PM2によるプロセスライフサイクルの外部管理

  使用タイミング:
  - Node.jsプロセスの起動・終了フローを設計する時
  - シグナルハンドラーを実装する時
  - 子プロセスの管理戦略を決定する時
  - PM2でプロセスを管理する設定を行う時

  Use proactively when designing process startup/shutdown flows,
  implementing signal handlers, or managing child processes.
version: 1.0.0
---

# Process Lifecycle Management

## 概要

プロセスライフサイクル管理は、Node.jsアプリケーションの起動から終了までの
全フェーズを制御し、システムリソースの適切な利用と安定稼働を保証します。

**主要な価値**:
- 予測可能なプロセス動作
- シグナルによる優雅な制御
- リソースリークの防止
- 高可用性の実現

## リソース構造

```
process-lifecycle-management/
├── SKILL.md
├── resources/
│   ├── process-states.md
│   ├── signal-handling.md
│   └── child-process-patterns.md
├── scripts/
│   └── check-process-health.mjs
└── templates/
    └── signal-handler.template.ts
```

## コマンドリファレンス

### リソース読み取り

```bash
# プロセス状態ガイド
cat .claude/skills/process-lifecycle-management/resources/process-states.md

# シグナル処理ガイド
cat .claude/skills/process-lifecycle-management/resources/signal-handling.md

# 子プロセスパターン
cat .claude/skills/process-lifecycle-management/resources/child-process-patterns.md
```

### スクリプト実行

```bash
# プロセスヘルスチェック
node .claude/skills/process-lifecycle-management/scripts/check-process-health.mjs <pid>
```

### テンプレート参照

```bash
# シグナルハンドラーテンプレート
cat .claude/skills/process-lifecycle-management/templates/signal-handler.template.ts
```

## ワークフロー

### Phase 1: プロセス起動

**起動シーケンス**:
1. 環境変数の読み込み
2. 設定ファイルの解析
3. 依存サービスへの接続確認
4. ポートのバインド（必要に応じて）
5. ready状態の通知

**PM2との連携**:
```javascript
// PM2にready状態を通知
process.send && process.send('ready');
```

**判断基準**:
- [ ] 必須環境変数は設定されているか？
- [ ] 依存サービスへの接続は成功するか？
- [ ] 起動タイムアウトは適切か？

**リソース**: `resources/process-states.md`

### Phase 2: プロセス実行

**実行中の監視項目**:
- メモリ使用量
- CPU使用率
- イベントループの遅延
- アクティブな接続数

**ヘルスチェック設計**:
```javascript
// シンプルなヘルスチェック
const healthCheck = () => ({
  status: 'healthy',
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  pid: process.pid
});
```

**判断基準**:
- [ ] 定期的なヘルスチェックを実施しているか？
- [ ] メモリリークの兆候はないか？
- [ ] イベントループは正常か？

### Phase 3: シグナル処理

**対応すべきシグナル**:

| シグナル | 動作 | 用途 |
|---------|------|------|
| SIGTERM | Graceful Shutdown | PM2 stop/restart |
| SIGINT | Graceful Shutdown | Ctrl+C |
| SIGHUP | 設定再読み込み | ログローテーション |
| SIGUSR2 | カスタム動作 | デバッグ情報出力 |

**シグナルハンドラー設計**:
```javascript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});
```

**リソース**: `resources/signal-handling.md`

### Phase 4: プロセス終了

**終了シーケンス**:
1. 新規リクエストの受付停止
2. 進行中リクエストの完了待機
3. データベース接続のクローズ
4. キャッシュのフラッシュ
5. ログのフラッシュ
6. プロセス終了（exit code 0）

**終了コード規約**:
| コード | 意味 | 用途 |
|-------|------|------|
| 0 | 正常終了 | 意図した終了 |
| 1 | 一般エラー | 予期しないエラー |
| 2 | 設定エラー | 環境変数・設定不備 |
| 130 | SIGINT | Ctrl+C |
| 143 | SIGTERM | kill/PM2 stop |

**判断基準**:
- [ ] 終了コードは適切に設定されているか？
- [ ] すべてのリソースは解放されているか？
- [ ] 終了ログは出力されているか？

### Phase 5: 子プロセス管理

**子プロセスパターン**:
- **spawn**: 長時間実行、ストリーム処理
- **fork**: Node.jsプロセス間通信
- **exec**: 短時間コマンド実行

**ゾンビプロセス回避**:
```javascript
const child = spawn('command', ['args']);
child.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});
// 必ずexitイベントを処理
```

**リソース**: `resources/child-process-patterns.md`

## ベストプラクティス

### すべきこと

1. **シグナルハンドラー実装**: SIGTERM/SIGINTは必須
2. **タイムアウト設定**: 無限待機を避ける
3. **終了コード設定**: 意味のあるexit code
4. **ログ出力**: 起動・終了時のログ

### 避けるべきこと

1. **シグナル無視**: `process.on('SIGTERM', () => {})` は危険
2. **同期ブロッキング**: 終了処理での同期I/O
3. **ゾンビ放置**: 子プロセスの未回収
4. **リソース未解放**: DB接続、ファイルハンドルの放置

## PM2との統合

### wait_readyモード

```javascript
// アプリケーション側
const server = app.listen(port, () => {
  process.send && process.send('ready');
});

// ecosystem.config.js
{
  wait_ready: true,
  listen_timeout: 10000
}
```

### Graceful Shutdown連携

```javascript
// PM2からのSIGINTを処理
process.on('SIGINT', async () => {
  await closeConnections();
  process.exit(0);
});
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 |

## 関連スキル

- **pm2-ecosystem-config** (`.claude/skills/pm2-ecosystem-config/SKILL.md`)
- **graceful-shutdown-patterns** (`.claude/skills/graceful-shutdown-patterns/SKILL.md`)
- **memory-monitoring-strategies** (`.claude/skills/memory-monitoring-strategies/SKILL.md`)
