# IPC・永続化パターン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

## 変更履歴

| バージョン | 日付       | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| v1.2.0     | 2026-02-12 | TASK-9B-H-SKILL-CREATOR-IPC完了: registerAllIpcHandlersにSkillCreatorService追加記録。registerSkillCreatorHandlers呼び出し（Pattern 3準拠） |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（準拠化） |
| v1.0.0     | -          | 初版                                         |

---

## IPC Handler Registration Pattern（Desktop Main Process）

### 概要

Electron IPCハンドラーはメインプロセスで一元的に登録される。
全てのIPCハンドラーは `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers` 関数から呼び出される必要がある。

**実装場所**: `apps/desktop/src/main/ipc/index.ts`

### 登録パターン

IPCハンドラーの登録には3つのパターンがある:

| パターン                        | 引数                    | 使用例                                           |
| ------------------------------- | ----------------------- | ------------------------------------------------ |
| Pattern 1: mainWindow + store   | `mainWindow`, `store`   | `registerChatHandlers`, `registerAuthHandlers`   |
| Pattern 2: storeのみ            | `store`                 | `registerSlideHandlers`                          |
| Pattern 3: mainWindow + service | `mainWindow`, `service` | `registerSkillHandlers`, `registerAgentHandlers` |

### SkillHandlers登録例（Pattern 3）

**実装ファイル**: `apps/desktop/src/main/ipc/index.ts`

#### 必要なインポート

| インポート元              | インポート対象                                                 |
| ------------------------- | -------------------------------------------------------------- |
| `./skillHandlers`         | `registerSkillHandlers`                                        |
| `../services/skill`       | `SkillScanner`, `SkillParser`, `SkillImportManager`, `SkillService` |
| `electron-store`          | `Store`                                                        |
| `path`                    | `path`                                                         |
| `electron`                | `app`                                                          |

#### 登録手順（registerAllIpcHandlers関数内）

`registerAllIpcHandlers`関数は`mainWindow`（BrowserWindow型）と`store`（Store型）を引数に取り、以下の手順でSkillHandlersを登録する。

| 手順 | 処理内容                   | 詳細                                                               |
| ---- | -------------------------- | ------------------------------------------------------------------ |
| 1    | skillBasePathの設定        | `app.getPath("userData")`に`.claude/skills`を結合したパスを使用    |
| 2    | skillStoreの作成           | `electron-store`で`skills`という名前のStoreをインスタンス化        |
| 3    | SkillScannerの作成         | skillBasePathを引数にインスタンス化                                |
| 4    | SkillParserの作成          | 引数なしでインスタンス化                                           |
| 5    | SkillImportManagerの作成   | skillStoreを引数にインスタンス化                                   |
| 6    | SkillServiceの作成         | skillScanner, skillParser, skillImportManagerを引数にインスタンス化 |
| 7    | registerSkillHandlers呼出  | mainWindowとskillServiceを引数に呼び出し                           |

**関連タスク識別子**: SKILL-IPC-001

### 新規IPCハンドラー追加手順

1. **ハンドラーファイル作成**: `apps/desktop/src/main/ipc/{name}Handlers.ts`
2. **サービス作成（必要な場合）**: `apps/desktop/src/main/services/{name}/`
3. **index.tsに登録追加**: `registerAllIpcHandlers` 関数内で呼び出し
4. **テスト作成**: ハンドラーとサービスのユニットテスト

### セキュリティ要件

全てのIPCハンドラーは `validateIpcSender` を使用してsender検証を行うこと。

#### sender検証の実装方法

| 項目               | 内容                                            |
| ------------------ | ----------------------------------------------- |
| インポート元       | `../security/ipcSecurity`                       |
| 使用関数           | `validateIpcSender`                             |
| 呼び出しタイミング | `ipcMain.handle`のハンドラー関数の先頭          |
| 引数               | `event`（IPCイベント）と`mainWindow`            |
| 目的               | リクエスト送信元が正規のRendererプロセスか検証  |

各IPCハンドラーは、ハンドラー関数の最初に`validateIpcSender(event, mainWindow)`を呼び出し、その後にビジネスロジックを実行する構成とする。

### 関連タスク

- **SKILL-IPC-001**: `registerSkillHandlers` が `registerAllIpcHandlers` から呼び出されていなかったバグを修正（2026-01-16完了）

---

## 会話履歴永続化パターン（Desktop Main Process）

### 概要

会話履歴永続化はElectronのMain Processで動作し、SQLite（better-sqlite3）を使用して会話・メッセージをローカルに保存する。Repository Patternを採用し、IPC Handlersを通じてRenderer Processからのアクセスを提供する。

**実装場所**: `apps/desktop/src/main/repositories/conversationRepository.ts`

### コンポーネント構成

会話履歴永続化はMain Process（Electron）上で2つの主要コンポーネントで構成される。

#### ConversationRepository（Repository層 - データアクセス）

| メソッド     | 機能                   |
| ------------ | ---------------------- |
| create       | 会話作成               |
| findById     | ID検索                 |
| findAll      | 一覧取得・ページネーション |
| update       | 更新                   |
| delete       | 削除・カスケード       |
| addMessage   | メッセージ追加         |
| search       | キーワード検索         |

#### IPC Handlers（Renderer通信）

| ファイル                   | 役割                                       |
| -------------------------- | ------------------------------------------ |
| conversationHandlers.ts    | Renderer ProcessからのIPC要求を受け付ける |

### ファイル構成

| ファイル                    | 責務                    |
| --------------------------- | ----------------------- |
| `conversationRepository.ts` | Repository実装（457行） |
| `conversationHandlers.ts`   | IPCハンドラ（243行）    |
| `conversation.ts`（shared） | 型定義（234行）         |
| `channels.ts`（preload）    | IPCチャンネル定義       |

### 型定義

| 型名                       | 定義場所                       | 説明                   |
| -------------------------- | ------------------------------ | ---------------------- |
| `Conversation`             | `shared/types/conversation.ts` | 会話エンティティ       |
| `ConversationSummary`      | `shared/types/conversation.ts` | 一覧表示用サマリー     |
| `Message`                  | `shared/types/conversation.ts` | メッセージエンティティ |
| `CreateConversationInput`  | `shared/types/conversation.ts` | 会話作成入力           |
| `UpdateConversationInput`  | `shared/types/conversation.ts` | 会話更新入力           |
| `AddMessageInput`          | `shared/types/conversation.ts` | メッセージ追加入力     |
| `ListConversationsOptions` | `shared/types/conversation.ts` | 一覧取得オプション     |
| `PaginatedResult<T>`       | `shared/types/conversation.ts` | ページネーション結果   |

### IPC APIチャンネル

| チャンネル                | 引数                          | 戻り値                                 | 説明           |
| ------------------------- | ----------------------------- | -------------------------------------- | -------------- |
| `conversation:create`     | `CreateConversationInput`     | `Conversation`                         | 会話作成       |
| `conversation:get`        | `id: string`                  | `Conversation \| null`                 | 会話取得       |
| `conversation:list`       | `ListConversationsOptions`    | `PaginatedResult<ConversationSummary>` | 一覧取得       |
| `conversation:update`     | `id, UpdateConversationInput` | `Conversation`                         | 会話更新       |
| `conversation:delete`     | `id: string`                  | `void`                                 | 会話削除       |
| `conversation:addMessage` | `id, AddMessageInput`         | `Message`                              | メッセージ追加 |
| `conversation:search`     | `query: string, options`      | `PaginatedResult<ConversationSummary>` | 検索           |

### データフロー

会話データはRenderer ProcessからMain Processを経由してSQLiteに永続化される。以下に各レイヤー間のデータフローを示す。

| 順序 | 送信元                   | 経路・処理                | 送信先                 |
| ---- | ------------------------ | ------------------------- | ---------------------- |
| 1    | Renderer Process         | IPC Channel               | Main Process           |
| 2    | Main Process             | conversationHandlers      | ConversationRepository |
| 3    | ConversationRepository   | better-sqlite3            | SQLite                 |
| 4    | SQLite                   | 結果をIPC Channelで返却   | Renderer Process       |

### ConversationRepository API

| メソッド     | 引数                              | 戻り値                                 | 説明           |
| ------------ | --------------------------------- | -------------------------------------- | -------------- |
| `create`     | `CreateConversationInput`         | `Conversation`                         | 会話作成       |
| `findById`   | `id: string`                      | `Conversation \| null`                 | ID検索         |
| `findAll`    | `ListConversationsOptions`        | `PaginatedResult<ConversationSummary>` | 一覧取得       |
| `update`     | `id, UpdateConversationInput`     | `Conversation`                         | 更新           |
| `delete`     | `id: string`                      | `void`                                 | 削除           |
| `addMessage` | `conversationId, AddMessageInput` | `Message`                              | メッセージ追加 |
| `search`     | `query: string, options`          | `PaginatedResult<ConversationSummary>` | 検索           |

### セキュリティ対策

- **IPC sender検証**: `validateIpcSender(event, mainWindow)`による送信元検証
- **ホワイトリストチャンネル**: 許可されたチャンネルのみ処理
- **SQLインジェクション防止**: パラメータバインディング使用

### 品質メトリクス

| 項目                   | 値   |
| ---------------------- | ---- |
| テスト総数             | 114  |
| カバレッジ（Line）     | 100% |
| カバレッジ（Branch）   | 100% |
| カバレッジ（Function） | 100% |

### DB 初期化パターン（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001）

DB初期化ロジックを `registerAllIpcHandlers` から分離し、Factory 関数パターンで管理する方式に変更された。

#### `registerAllIpcHandlers` シグネチャ

```
registerAllIpcHandlers(mainWindow: BrowserWindow, conversationDb?: Database.Database | null): void
```

第2引数 `conversationDb` は省略可能（DI パターン）。省略時は内部で `getConversationDatabase()` を呼び出す。

#### DB パス

| 旧パス | 新パス |
|--------|--------|
| `~/.claude/conversations.db` | `app.getPath('userData')/conversations.db` |

`app.getPath('userData')` を使用することで、OS 標準のユーザーデータディレクトリに保存される（macOS: `~/Library/Application Support/<appName>/`）。

#### ライフサイクル管理

| イベント | 処理 |
|----------|------|
| `app.whenReady()` | `initializeConversationDatabase()` 呼び出し |
| `app.on('will-quit')` | `closeConversationDatabase()`（WALチェックポイント後にクローズ） |
| `app.on('activate')` | `getConversationDatabase()` で既存インスタンス再利用（二重初期化防止） |

詳細: [database-implementation-core.md#Conversation DB 初期化パターン](./database-implementation-core.md)

### 関連タスク

- **UT-LLM-HISTORY-001**: 会話履歴永続化バックエンド実装（2026-01-24完了）
- **TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001**: Conversation DB 初期化堅牢化（2026-03-19完了）

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [Electronサービス](./arch-electron-services.md)
- [Claude CLI連携](./arch-claude-cli.md)
