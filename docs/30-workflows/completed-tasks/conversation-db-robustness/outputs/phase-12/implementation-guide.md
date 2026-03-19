# Conversation DB 初期化堅牢化 - 実装ガイド

- タスク: TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001
- 対象ファイル: `apps/desktop/src/main/database/conversationDatabase.ts`
- 作成日: 2026-03-19
- Phase: 12（ドキュメント）

---

## Part 1: 中学生レベルの概念説明

### この機能は何をしているの？

アプリの「チャット履歴を記録するデータベース（DB）」を、起動・使用・終了のそれぞれの場面で安全に扱うための仕組みを整備しました。

---

### 概念1: DB初期化 = 「新しいノートを最初に使う前に、名前を書いて目次ページを作ること」

チャット履歴を記録するためのファイル（SQLiteのDBファイル）は、最初は存在しません。アプリが起動したとき、そのファイルを「新しくノートを開く」ように準備する作業が「DB初期化」です。

具体的には以下のことをします：

1. ノート（DBファイル）を保存する棚（ディレクトリ）が存在しなければ作る
2. ノートを開く（DBファイルを作成・接続する）
3. ノートに「書き方のルール」を設定する（WALモードなどのpragma設定）
4. 目次ページを作る（テーブルとインデックスをDDLで作成する）

このノートはアプリが動いている間はずっと使い続け、アプリを閉じるときに正しく閉じます。

---

### 概念2: Factory関数 = 「工場の入口で、注文に応じて適切な部品を作る窓口」

今回は5つの「窓口」（Factory関数）を用意しました。それぞれの役割は：

| 窓口の名前                            | 役割                                     |
| ------------------------------------- | ---------------------------------------- |
| `initializeConversationDatabase()`    | 注文を受けてノートを新しく開く（初期化） |
| `getConversationDatabase()`           | 開いているノートを受け取る               |
| `isConversationDatabaseInitialized()` | ノートが開いているか確認する             |
| `closeConversationDatabase()`         | ノートを安全に閉じる                     |
| `_resetForTesting()`                  | テスト用：ノートを強制的にリセットする   |

窓口が一箇所に集まっているので、DBの状態を外から管理しやすくなっています。

---

### 概念3: DI（依存性注入）= 「お弁当を自分で作るか、外から持ってくるか選べる仕組み」

以前は `ipc/index.ts` の中で「自分でDB接続を作って自分でハンドラに渡す」という構造でした（お弁当を自分で作る方式）。

今回の変更で、DB接続は外部（`main/index.ts`）で事前に作っておき、`registerAllIpcHandlers(mainWindow, db)` という形で「外から持ち込む」方式に変わりました。

これにより：

- DBの作り方とハンドラの登録が分離できる
- テストのときに「偽のDB（モック）」を簡単に差し込める
- DB初期化が失敗しても `null` を渡すことで「フォールバックモード」に切り替えられる

---

### 概念4: ライフサイクル管理 = 「部屋を出るときに電気を消す習慣」

アプリが閉じるとき、開いていたDBファイルを適切に閉じないとデータが壊れる可能性があります（電気をつけっぱなしにする状態）。

今回は `app.on('will-quit')` イベントに「DBを安全に閉じる処理」を登録しました。具体的には：

1. WALチェックポイント（書き込みの完了確認）を実行する
2. DBファイルを閉じる
3. 内部の参照をクリアする

これは「部屋を出る前に電気を消し、ガスを確認し、鍵をかける」のと同じ習慣です。

---

## Part 2: 開発者向け技術詳細

### 実装概要

`apps/desktop/src/main/database/conversationDatabase.ts` を新規作成し、以下を実現した：

1. DB初期化ロジックを `ipc/index.ts` のインライン匿名関数から Factory 関数群に分離
2. `registerAllIpcHandlers` の第2引数として `Database.Database | null` を受け取るDIパターンに変更
3. `app.on('will-quit')` でのライフサイクル管理
4. macOSの `activate` イベントで既存インスタンスを再利用（P5対策）

### TypeScript型定義

```typescript
export interface ConversationDatabaseConfig {
  /** デフォルト: app.getPath('userData') + '/conversations.db' */
  dbPath?: string;
  /** デフォルト: true */
  enableWAL?: boolean;
  /** デフォルト: 5000ms */
  busyTimeout?: number;
  /** デフォルト: true */
  foreignKeys?: boolean;
}
```

### API シグネチャ（5つのFactory関数）

```typescript
/**
 * DB初期化（冪等: 既存インスタンスがあれば再利用）
 * @throws Error - dbPathが空文字またはスペースのみの場合
 */
function initializeConversationDatabase(
  config?: ConversationDatabaseConfig,
): Database.Database;

/**
 * 初期化済みDBインスタンスを返す
 * @throws Error - 未初期化の場合
 */
function getConversationDatabase(): Database.Database;

/**
 * DBが初期化済みかどうかを返す
 */
function isConversationDatabaseInitialized(): boolean;

/**
 * DBを安全にクローズ（WALチェックポイント後にclose）
 * 未初期化の場合は何もしない
 */
function closeConversationDatabase(): void;

/**
 * テスト用: モジュールレベルの状態をリセット
 * @internal プロダクションコードでは使用禁止（P9対策）
 */
function _resetForTesting(): void;
```

### pragma設定の意味

| pragma         | 値       | 目的                                                                            |
| -------------- | -------- | ------------------------------------------------------------------------------- |
| `journal_mode` | `WAL`    | Write-Ahead Logging: 読み書き並行性向上、クラッシュ復旧力向上                   |
| `foreign_keys` | `ON`     | `chat_messages.session_id → chat_sessions.id` の参照整合性を強制                |
| `busy_timeout` | `5000`   | 別プロセスがロック中の場合、最大5秒待機してからエラー（SQLite公式推奨の一般値） |
| `synchronous`  | `NORMAL` | WALモードでの推奨値。FULLより高速で安全性は十分                                 |

### 使用例（main/index.ts での利用）

```typescript
import {
  initializeConversationDatabase,
  closeConversationDatabase,
  getConversationDatabase,
} from "./database/conversationDatabase";

app.whenReady().then(async () => {
  // DB初期化（失敗してもクラッシュしない: Graceful Degradation S30パターン）
  let conversationDb: Database.Database | null = null;
  try {
    conversationDb = initializeConversationDatabase();
  } catch (err) {
    // ログ記録後、null のまま続行 → フォールバックハンドラが登録される
    console.error("DB initialization failed:", err);
  }

  const mainWindow = createWindow();

  // DIパターン: DBインスタンスを引数で注入
  registerAllIpcHandlers(mainWindow, conversationDb);
});

// ライフサイクル管理: アプリ終了時にDBを安全にクローズ
app.on("will-quit", () => {
  closeConversationDatabase();
});

// macOS activate: 既存DBインスタンスを再利用（P5対策）
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers();
    const mainWindow = createWindow();
    // getConversationDatabase() で既存インスタンスを再利用（再初期化しない）
    const db = isConversationDatabaseInitialized()
      ? getConversationDatabase()
      : null;
    registerAllIpcHandlers(mainWindow, db);
  }
});
```

### エラーハンドリング

| エラーケース              | 原因                       | 結果                                               |
| ------------------------- | -------------------------- | -------------------------------------------------- |
| `dbPath` が空文字         | P42準拠バリデーション      | Error をthrow                                      |
| `dbPath` がスペースのみ   | P42準拠3段バリデーション   | Error をthrow                                      |
| ディレクトリ作成失敗      | 権限不足・ディスク容量不足 | Error をthrow（呼び出し元がcatchしてnullを渡す）   |
| DB接続失敗（ABI不一致等） | better-sqlite3の問題       | Error をthrow（呼び出し元がcatchしてnullをDB渡す） |
| 未初期化でget呼び出し     | 初期化順序の誤り           | Error をthrow                                      |
| 未初期化でclose呼び出し   | 早期終了等                 | 何もしない（安全）                                 |
| WALチェックポイント失敗   | DBが壊れている等           | catch して無視（closeは続行）                      |

DB初期化が失敗した場合、`registerAllIpcHandlers(mainWindow, null)` が呼ばれ、`registerConversationFallbackHandlers()` が7チャンネル全てに `ERR_4006 (DB_NOT_AVAILABLE)` を返すフォールバックハンドラを登録する（S30: Graceful Degradationパターン）。

### DI後の ipc/index.ts シグネチャ変更

```typescript
// 変更前
export function registerAllIpcHandlers(mainWindow: BrowserWindow): void;

// 変更後
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  conversationDb: Database.Database | null,
): void;
```

### テスト用リセット

テストファイルでは `beforeEach` で `_resetForTesting()` を呼ぶことで、モジュールレベルのシングルトン状態をリセットする（P9: モジュールスコープ変数のテスト間リーク対策）。

```typescript
import { _resetForTesting } from "../conversationDatabase";

beforeEach(() => {
  _resetForTesting();
});
```

### カバレッジ実績

| 指標               | 計測値 | 推奨基準 |
| ------------------ | ------ | -------- |
| Line Coverage      | 91.89% | 90%      |
| Branch Coverage    | 81.81% | 70%      |
| Function Coverage  | 100%   | 90%      |
| Statement Coverage | 91.89% | 90%      |

未カバーの3箇所（L175-176, L183, L204）はいずれも防御的 catch ブロックであり、テスト追加の優先度は低い。
