# Phase 2: 設計サマリー

## 設計概要

Conversation DB の初期化ロジックを `ipc/index.ts` のインライン匿名関数から独立した Factory 関数群に分離し、DI パターンで `registerAllIpcHandlers` に注入する。

## 設計判断

| 判断項目                | 選択                        | 理由                                                             |
| ----------------------- | --------------------------- | ---------------------------------------------------------------- |
| パターン                | module-level Factory 関数   | 既存 electron-store パターンに合わせたシンプルな設計             |
| クラス vs 関数          | 関数                        | 状態が少なく(db: Database \| null のみ)、クラスは過剰            |
| DB パス                 | `app.getPath('userData')`   | Electron 標準。プラットフォーム間でパスが統一される              |
| DI 方式                 | 引数注入（明示的 null）     | `Database.Database \| null` 型で失敗を明示                       |
| ライフサイクル          | `will-quit` イベント        | `before-quit` はキャンセル可能で DB クローズが保証されない       |
| activate での DB 再利用 | `getConversationDatabase()` | 既存インスタンス再利用で二重初期化防止（P5対策）                 |
| テスト容易性            | `_resetForTesting()`        | P9対策: module-level 状態のテスト間リーク防止                    |
| Graceful Degradation    | S30パターン維持             | DB初期化失敗時は null を返し、フォールバックハンドラが登録される |

## アーキテクチャフロー図

### 正常起動フロー

```
app.whenReady()
  |
  v
initializeConversationDatabase()
  |-- fs.mkdirSync(dir, { recursive: true })    // ディレクトリ事前作成
  |-- new Database(dbPath)                       // better-sqlite3
  |-- pragma: journal_mode=WAL                   // WAL モード
  |-- pragma: foreign_keys=ON                    // 外部キー制約
  |-- pragma: busy_timeout=5000                  // ビジーリトライ
  |-- pragma: synchronous=NORMAL                 // WAL推奨同期レベル
  |-- db.exec(CONVERSATION_DB_SCHEMA)            // DDL 実行
  |-- module-level db = instance                 // Singleton 保持
  |
  v (成功: Database | 失敗: 例外をキャッチ → null)
createWindow()
  |
  v
registerAllIpcHandlers(mainWindow, db)
  |-- db != null → registerConversationHandlers(new ConversationRepository(db))
  |-- db == null → registerConversationFallbackHandlers()  // ERR_4006
  |
  v
app.on('will-quit', () => closeConversationDatabase())
  |-- db.pragma("wal_checkpoint(TRUNCATE)")      // WAL チェックポイント
  |-- db.close()                                  // 安全なクローズ
  |-- module-level db = null                      // 参照解放
```

### activate イベントフロー (macOS)

```
app.on('activate')
  |
  v (BrowserWindow.getAllWindows().length === 0 の場合のみ)
unregisterAllIpcHandlers()           // P5対策: 全チャンネル解除
  |
  v
mainWindowRef = createWindow()       // 新しいウィンドウ作成
  |
  v
registerAllIpcHandlers(mainWindowRef, getConversationDatabase())
  // 既存 DB インスタンスを再利用（再初期化しない）
```

## DB パス設計

```typescript
// デフォルトパス
const defaultDbPath = path.join(app.getPath("userData"), "conversations.db");
// macOS: ~/Library/Application Support/<app-name>/conversations.db
// Windows: %APPDATA%/<app-name>/conversations.db
// Linux: ~/.config/<app-name>/conversations.db
```

## pragma 設計

| pragma       | 値     | 理由                                                     |
| ------------ | ------ | -------------------------------------------------------- |
| journal_mode | WAL    | 読み書き並行性向上、クラッシュ復旧力向上                 |
| foreign_keys | ON     | データ整合性（chat_messages.session_id → chat_sessions） |
| busy_timeout | 5000   | 同時アクセス時のロック待機（SQLite 公式推奨の一般値）    |
| synchronous  | NORMAL | WAL モードでの推奨値（Full より高速、安全性は十分）      |

## テスト影響範囲

| 影響テストファイル                       | 影響理由                              | 対応方針                |
| ---------------------------------------- | ------------------------------------- | ----------------------- |
| `register-conversation-handlers.test.ts` | registerAllIpcHandlers シグネチャ変更 | 第2引数にモック DB 追加 |
| `conversationDatabase.test.ts`（新規）   | Factory 関数群の単体テスト            | 新規作成                |
| `ipc-index-di.test.ts`（新規）           | DI 統合テスト                         | 新規作成                |
