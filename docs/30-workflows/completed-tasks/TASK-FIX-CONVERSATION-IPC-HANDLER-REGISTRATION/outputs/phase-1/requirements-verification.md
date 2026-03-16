# Phase 1 成果物: 要件定義検証記録

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスク ID  | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION       |
| Phase      | 1 - 要件定義                                         |
| 成果物種別 | P50チェック（既実装状態調査）結果 + 要件定義検証記録 |
| 作成日     | 2026-03-16                                           |
| ステータス | 完了                                                 |

---

## 1. P50チェック: 既実装状態調査

> P50の教訓: Phase 4開始前に対象ファイルの `git log` と現在のコードを確認し、既実装かどうかを判定する。

### 1-1. conversationHandlers.ts

- **ファイルパス**: `apps/desktop/src/main/ipc/handlers/conversationHandlers.ts`
- **実装状態**: 実装済み
- **内容**:
  - 7チャンネルのハンドラが実装されている
  - P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラに適用済み
  - `ConversationRepository` を依存注入として受け取る設計

### 1-2. ConversationRepository

- **実装状態**: 実装済み
- **依存**: `better-sqlite3`（`Database` 型）
- **コンストラクタ**: `constructor(db: Database.Database)`
- **備考**: DB インスタンスは外部から注入される設計（DI パターン準拠）

### 1-3. channels.ts: CONVERSATION\_\* チャンネル定数

- **ファイルパス**: `apps/desktop/src/main/ipc/channels.ts`
- **定義箇所**: L276-282
- **実装状態**: 定義済み
- **対象チャンネル**: `CONVERSATION_*` プレフィックスの定数が7件定義済み

### 1-4. preload/index.ts: conversationAPI

- **ファイルパス**: `apps/desktop/src/preload/index.ts`
- **実装状態**: `conversationAPI` として `contextBridge` に公開済み
- **備考**: Preload 層の契約は完成している

### 1-5. ipc/index.ts: ハンドラ登録 (修正対象)

- **ファイルパス**: `apps/desktop/src/main/ipc/index.ts`
- **実装状態**: **Section 13 (Conversation) が `registerAllIpcHandlers()` に未接続** ← これが修正対象
- **現状**: ハンドラ実装は存在するが、メインプロセスの登録処理に組み込まれていない
- **影響**: Renderer から `conversationAPI` を呼び出しても IPC ハンドラが存在しないためエラーになる

### 1-6. DB初期化処理

- **実装状態**: **未実装**
- **影響**: `ConversationRepository` に渡すべき `Database` インスタンスを生成するコードが存在しない

---

## 2. 調査サマリー

| 調査対象                                | 状態       | 備考                            |
| --------------------------------------- | ---------- | ------------------------------- |
| conversationHandlers.ts（ハンドラ実装） | 実装済み   | P42準拠バリデーション済み       |
| ConversationRepository                  | 実装済み   | DI パターン、DB注入待ち         |
| channels.ts（チャンネル定数）           | 定義済み   | 7チャンネル L276-282            |
| preload/index.ts（conversationAPI公開） | 公開済み   | Preload 契約完成                |
| ipc/index.ts（ハンドラ登録）            | **未接続** | Section 13 未登録 ← 修正対象    |
| DB 初期化処理                           | **未実装** | better-sqlite3 DB生成コードなし |

**結論**: ハンドラ実装・Preload 公開は完成しているが、Main Process の登録処理（`registerAllIpcHandlers()`）への接続と DB 初期化が欠如している。これがバグの根本原因。

---

## 3. 要件定義

### 機能要件 (FR)

#### FR-01: DB初期化

- better-sqlite3 を使用して `conversations.db` を初期化する
- WAL（Write-Ahead Logging）モードを有効化する
- `chat_sessions` テーブルおよび `chat_messages` テーブルを DDL で作成する
- インデックスを4件作成する
- DB ファイルパス: `path.join(homeDir, ".claude", "conversations.db")`

#### FR-02: ハンドラ登録

- `safeRegister` + `track` パターンを使用してハンドラを登録する
- `registerAllIpcHandlers()` の Section 13 として組み込む
- 挿入位置: Section 12（Chat Edit、L853-867）の直後、サマリーログ（L869）の直前

#### FR-03: 解除の自動対応

- `unregisterAllIpcHandlers()` は `IPC_CHANNELS` を走査して自動解除する設計のため、追加対応不要
- CONVERSATION\_\* チャンネルは既に `IPC_CHANNELS` に含まれている

#### FR-04: Graceful Degradation（フォールバックハンドラ）

- DB 初期化が失敗した場合、フォールバックハンドラを登録する
- フォールバックハンドラは7チャンネル全てに対して `DB_NOT_AVAILABLE` エラーを返す
- S30 パターン（Graceful Degradation）に準拠する

### 受入基準 (AC)

| ID    | 基準                                                                           | 検証方法       |
| ----- | ------------------------------------------------------------------------------ | -------------- |
| AC-01 | `registerAllIpcHandlers()` 呼び出し後、CONVERSATION\_\* 全チャンネルが応答する | 統合テスト     |
| AC-02 | DB 初期化成功時、ConversationRepository 経由でデータ永続化が行われる           | 統合テスト     |
| AC-03 | DB 初期化失敗時、全チャンネルで `DB_NOT_AVAILABLE` エラーが返る                | ユニットテスト |
| AC-04 | P42準拠の3段バリデーションが全ハンドラで機能する                               | ユニットテスト |
| AC-05 | `unregisterAllIpcHandlers()` 後、CONVERSATION\_\* チャンネルが応答しない       | ユニットテスト |
| AC-06 | WAL モードが有効化されている                                                   | 統合テスト     |
| AC-07 | `chat_sessions` / `chat_messages` テーブルが正しく作成される                   | 統合テスト     |
| AC-08 | 既存ハンドラ（Section 1-12）の動作に影響しない                                 | 回帰テスト     |

---

## 4. 参照資料

- `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/rules/06-known-pitfalls.md` - P42, P50, P54, P55 参照
- `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/rules/04-electron-security.md` - IPC セキュリティ原則
- `apps/desktop/src/main/ipc/handlers/conversationHandlers.ts` - 既実装ハンドラ
- `apps/desktop/src/main/ipc/index.ts` - 修正対象ファイル
- `apps/desktop/src/main/ipc/channels.ts` - チャンネル定数定義
