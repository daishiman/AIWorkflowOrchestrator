# プロセスライフサイクル管理 - 実装パターン

## 概要

プロセスライフサイクル管理における実装パターンのナビゲーションガイド。
各トピックの詳細は対応するreferencesファイルを参照してください。

## パターンカテゴリ

### 1. シグナル処理パターン

**トピック**:

- シグナルハンドラーの実装
- SIGTERM、SIGINT、SIGHUPの処理
- PM2との連携
- エラーハンドリング（uncaughtException、unhandledRejection）

**詳細**: See [signal-handling.md](signal-handling.md)

**主要パターン**:

- Graceful Shutdown Handler
- PM2 Message Handler
- Timeout-based Force Exit
- Error Recovery Handler

**適用場面**:

- Webサーバーアプリケーションの終了処理
- バッチ処理の安全な中断
- PM2管理下でのプロセス再起動
- クラスタモードでのworker管理

---

### 2. プロセス状態管理パターン

**トピック**:

- プロセスライフサイクルの状態遷移
- PM2状態管理
- ヘルスモニタリング
- 起動・終了シーケンス

**詳細**: See [process-states.md](process-states.md)

**主要パターン**:

- State Machine Pattern
- Health Check Pattern
- Startup Sequence Pattern
- Shutdown Sequence Pattern

**適用場面**:

- アプリケーション起動時の初期化
- プロセスヘルスチェック実装
- PM2との状態同期
- トラブルシューティング

---

### 3. 子プロセス管理パターン

**トピック**:

- spawn、fork、execの使い分け
- 子プロセス間通信（IPC）
- ゾンビプロセス回避
- ワーカープール実装

**詳細**: See [child-process-patterns.md](child-process-patterns.md)

**主要パターン**:

- Worker Pool Pattern
- Process Tracking Pattern
- IPC Communication Pattern
- Zombie Prevention Pattern

**適用場面**:

- バックグラウンドタスクの並列処理
- 外部コマンドの実行
- CPU集約的処理の分散
- マルチプロセスアーキテクチャ

---

## パターン選択フローチャート

### シグナル処理が必要か？

```
シグナル処理が必要？
├─ YES → See [signal-handling.md](signal-handling.md)
│   ├─ PM2使用？
│   │   ├─ YES → PM2 Message Handler + ready通知
│   │   └─ NO  → 標準 Signal Handler
│   └─ タイムアウト必要？
│       ├─ YES → Timeout-based Force Exit
│       └─ NO  → Basic Graceful Shutdown
└─ NO → 次の質問へ
```

### プロセス状態監視が必要か？

```
プロセス状態監視が必要？
├─ YES → See [process-states.md](process-states.md)
│   ├─ PM2使用？
│   │   ├─ YES → PM2 State Management
│   │   └─ NO  → Custom Health Check
│   └─ メトリクス収集必要？
│       ├─ YES → Health Check Pattern
│       └─ NO  → State Machine Pattern
└─ NO → 次の質問へ
```

### 子プロセス管理が必要か？

```
子プロセス管理が必要？
├─ YES → See [child-process-patterns.md](child-process-patterns.md)
│   ├─ Node.jsプロセス間通信？
│   │   ├─ YES → fork + IPC
│   │   └─ NO  → 次へ
│   ├─ ストリーム処理？
│   │   ├─ YES → spawn
│   │   └─ NO  → 次へ
│   └─ 短時間コマンド実行？
│       ├─ YES → exec
│       └─ NO  → spawn
└─ NO → 基本パターンのみ
```

---

## 組み合わせパターン

### パターン1: PM2管理下のWebサーバー

**必要なパターン**:

1. Signal Handling: Graceful Shutdown Handler
2. Process States: Startup Sequence + PM2 State Management
3. Child Process: 不要（PM2がクラスタ管理）

**参照順序**:

1. See [signal-handling.md](signal-handling.md) - PM2連携セクション
2. See [process-states.md](process-states.md) - PM2状態管理セクション

---

### パターン2: ワーカープールを持つバッチ処理

**必要なパターン**:

1. Signal Handling: Graceful Shutdown Handler
2. Process States: State Machine Pattern
3. Child Process: Worker Pool Pattern + Zombie Prevention

**参照順序**:

1. See [child-process-patterns.md](child-process-patterns.md) - ワーカープール実装
2. See [signal-handling.md](signal-handling.md) - 子プロセス終了処理
3. See [process-states.md](process-states.md) - シャットダウンシーケンス

---

### パターン3: スタンドアロンCLIツール

**必要なパターン**:

1. Signal Handling: Basic Signal Handler
2. Process States: Shutdown Sequence Pattern
3. Child Process: exec/spawn（必要に応じて）

**参照順序**:

1. See [signal-handling.md](signal-handling.md) - 基本的なハンドラー
2. See [child-process-patterns.md](child-process-patterns.md) - exec使用例（必要時）

---

## 実装の優先順位

### Phase 1: 必須実装

1. **シグナルハンドラー**: SIGTERM、SIGINTの処理
2. **Graceful Shutdown**: 基本的なクリーンアップ処理
3. **タイムアウト**: 強制終了の仕組み

### Phase 2: PM2連携（PM2使用時）

4. **PM2 ready通知**: プロセス起動完了の通知
5. **PM2メッセージ処理**: shutdown_with_message対応
6. **kill_timeout設定**: ecosystem.config.js調整

### Phase 3: 高度な機能

7. **ヘルスチェック**: プロセス状態監視
8. **子プロセス管理**: ワーカープールやバックグラウンドタスク
9. **メトリクス収集**: パフォーマンス監視

---

## アンチパターンと対策

### アンチパターン1: シグナル無視

**問題**:

```javascript
// ❌ シグナルを受け取っても何もしない
process.on("SIGTERM", () => {});
```

**対策**: See [signal-handling.md](signal-handling.md) - ベストプラクティスセクション

---

### アンチパターン2: タイムアウトなしのクリーンアップ

**問題**:

```javascript
// ❌ タイムアウトなしで永遠に待つ可能性
process.on("SIGTERM", async () => {
  await waitForever(); // 終わらないかも
  process.exit(0);
});
```

**対策**: See [signal-handling.md](signal-handling.md) - タイムアウト処理セクション

---

### アンチパターン3: ゾンビプロセスの放置

**問題**:

```javascript
// ❌ 子プロセスのexitイベントを処理しない
const child = spawn("command");
// exitイベントを登録していない
```

**対策**: See [child-process-patterns.md](child-process-patterns.md) - ゾンビプロセス回避セクション

---

## クイックリファレンス

### よくある質問

| 質問                                | 参照先                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| SIGTERMとSIGINTの違いは？           | See [signal-handling.md](signal-handling.md) - シグナル一覧             |
| PM2のkill_timeoutはいくつにすべき？ | See [process-states.md](process-states.md) - タイムアウト設定           |
| 子プロセスをいつ使うべき？          | See [child-process-patterns.md](child-process-patterns.md) - API比較    |
| Graceful Shutdownの手順は？         | See [basics.md](basics.md) - Graceful Shutdownセクション                |
| ゾンビプロセスを防ぐには？          | See [child-process-patterns.md](child-process-patterns.md) - ゾンビ回避 |

### テンプレート

| テンプレート名             | 用途                   | 参照先                                                                           |
| -------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| signal-handler.template.ts | シグナルハンドラー実装 | See [../assets/signal-handler.template.ts](../assets/signal-handler.template.ts) |

### スクリプト

| スクリプト名             | 用途                   | 使用方法                                      |
| ------------------------ | ---------------------- | --------------------------------------------- |
| check-process-health.mjs | プロセスヘルスチェック | `node scripts/check-process-health.mjs <pid>` |

---

## 参考文献

- See [basics.md](basics.md) - 基本概念の理解
- See [signal-handling.md](signal-handling.md) - シグナル処理の詳細
- See [process-states.md](process-states.md) - プロセス状態管理の詳細
- See [child-process-patterns.md](child-process-patterns.md) - 子プロセス管理の詳細

---

## 更新履歴

| Version | Date       | Changes                          |
| ------- | ---------- | -------------------------------- |
| 1.0.0   | 2026-01-02 | 18-skills.md仕様準拠版として作成 |
