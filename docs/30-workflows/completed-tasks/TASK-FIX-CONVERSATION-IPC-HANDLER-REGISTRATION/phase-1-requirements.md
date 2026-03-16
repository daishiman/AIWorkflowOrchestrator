# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 1                                              |
| Phase名    | 要件定義                                       |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | なし                                           |
| 後続Phase  | Phase 2（設計）                                |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

`registerConversationHandlers()` が `registerAllIpcHandlers()` から呼ばれていないため、
Renderer から `conversation:*` チャンネルを呼び出すと
`"No handler registered for 'conversation:create'"` エラーが発生する問題を修正する。

本 Phase では問題の根本原因を定義し、修正に必要な要件と受入基準を確立する。

## 実行タスク

- P50チェック: 既実装状態の調査（何が存在し、何が欠けているかの把握）
- エラーの再現手順と影響範囲の明確化
- 機能要件の定義
- 非機能要件の定義
- 受入基準の定義（検証可能な形式）

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| database-schema                      | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | SQLiteスキーマ定義                       |
| database-implementation              | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | DB初期化パターン                         |
| database-implementation-core         | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`         | better-sqlite3初期化の詳細               |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル               | パス                                                                          | 備考                                                      |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| IPC登録ハブ            | `apps/desktop/src/main/ipc/index.ts`                                          | `registerAllIpcHandlers()` / `unregisterAllIpcHandlers()` |
| Conversationハンドラ   | `apps/desktop/src/main/ipc/conversationHandlers.ts`                           | `registerConversationHandlers()` 実装済み                 |
| Conversationリポジトリ | `apps/desktop/src/main/repositories/conversationRepository.ts`                | `ConversationRepository` 実装済み                         |
| チャンネル定数         | `apps/desktop/src/preload/channels.ts`                                        | L276-282: `CONVERSATION_*` 定数定義済み                   |
| Preload API            | `apps/desktop/src/preload/index.ts`                                           | L600: `conversationAPI` contextBridge公開済み             |
| ハンドラテスト         | `apps/desktop/src/main/ipc/__tests__/conversationHandlers.test.ts`            | 既存テスト                                                |
| リポジトリテスト       | `apps/desktop/src/main/repositories/__tests__/conversationRepository.test.ts` | 既存テスト                                                |

## 実行手順

### Step 1: P50チェック（既実装状態の調査）

P50 ルール（既実装防御の発見による Phase 転換）に従い、現在の実装状態を調査する。

#### 1-1. 存在するもの（実装済み）

| コンポーネント                   | ファイル                                                | 状態                              |
| -------------------------------- | ------------------------------------------------------- | --------------------------------- |
| `registerConversationHandlers()` | `conversationHandlers.ts`                               | ✅ 実装済み（7チャンネル対応）    |
| `ConversationRepository`         | `repositories/conversationRepository.ts`                | ✅ 実装済み（better-sqlite3依存） |
| `CONVERSATION_*` チャンネル定数  | `preload/channels.ts` L276-282                          | ✅ 定義済み                       |
| `conversationAPI` Preload公開    | `preload/index.ts` L600                                 | ✅ 公開済み                       |
| conversationHandlers テスト      | `__tests__/conversationHandlers.test.ts`                | ✅ 存在                           |
| conversationRepository テスト    | `repositories/__tests__/conversationRepository.test.ts` | ✅ 存在                           |

#### 1-2. 欠けているもの（未実装）

| コンポーネント                            | 状態                                              | 影響                                               |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| `registerConversationHandlers` の呼び出し | ❌ `ipc/index.ts` に未記載                        | Rendererから呼び出すとNo handler registered エラー |
| better-sqlite3 DBインスタンス生成         | ❌ Main Processにconversation用DB初期化処理なし   | `ConversationRepository` をインスタンス化できない  |
| 会話DBファイル初期化（DDL実行）           | ❌ `chat_sessions`/`chat_messages` テーブル未作成 | DBが空状態のまま                                   |

### Step 2: エラー再現手順

1. アプリを起動
2. Renderer から `window.conversationAPI.create({ title: "テスト会話" })` を呼び出す
3. 期待されるエラー:
   ```
   Error occurred in handler for 'conversation:create':
   No handler registered for 'conversation:create'
   ```
4. `conversation:list` / `conversation:get` / `conversation:update` / `conversation:delete` /
   `conversation:addMessage` / `conversation:search` でも同様のエラーが発生する

### Step 3: 影響範囲

| 影響対象                     | 内容                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- |
| 直接影響                     | `conversation:*` 全7チャンネルが無効（会話履歴機能が完全に動作しない） |
| 間接影響                     | Renderer の conversationAPI 呼び出し元コンポーネント全て               |
| 既存テストへの影響           | `conversationHandlers.test.ts` は独立テストのため影響なし              |
| Preload テスト               | `conversationAPI.test.ts` は影響なし                                   |
| `unregisterAllIpcHandlers()` | `IPC_CHANNELS` 全値走査のため、チャンネルが定義済みであれば自動対応    |

## 機能要件

### FR-01: DB初期化

- `registerConversationHandlers()` 呼び出し前に `ConversationRepository` のための better-sqlite3 DBインスタンスを生成する
- DBファイルパスは `~/.claude/conversations.db`（`HOME` 環境変数を使用）
- DBには `chat_sessions` テーブルと `chat_messages` テーブルを DDL で作成する（既存時はスキップ `CREATE TABLE IF NOT EXISTS`）
- WALモード（`PRAGMA journal_mode = WAL`）を設定して並行読み取りを最適化する

### FR-02: ハンドラ登録

- `registerAllIpcHandlers()` 内の適切なセクションに `registerConversationHandlers(repository)` の呼び出しを追加する
- 既存の `safeRegister` + `track` パターンに従う
- セクション番号は連続番号（既存の `--- 12. ---` の次 `--- 13. ---`）とする

### FR-03: 解除の自動対応

- `unregisterAllIpcHandlers()` は `Object.values(IPC_CHANNELS)` を走査するため、`CONVERSATION_*` チャンネルが `IPC_CHANNELS` に含まれていれば追加対応不要
- チャンネル定数 `CONVERSATION_*` は `channels.ts` L276-282 に定義済みであることを確認する

### FR-04: Graceful Degradation（DB初期化失敗時）

- better-sqlite3 のロード失敗、またはDBファイル生成失敗時は、フォールバックハンドラを登録する
- フォールバックハンドラは `{ success: false, error: { code: "DB_NOT_AVAILABLE", message: "..." } }` を返す
- 7チャンネル全てにフォールバックハンドラを登録する

## 非機能要件

### NFR-01: 既存パターンとの整合性

- `ipc/index.ts` の既存 `safeRegister` + `track` パターンを遵守する（P54対応: safeRegister は戻り値不要なハンドラに使用）
- DB初期化失敗時の Graceful Degradation は S30 パターンに従う

### NFR-02: 二重登録防止（P5対応）

- `registerConversationHandlers()` は `track()` 経由で1回だけ呼ばれる
- `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` の再登録フローで二重登録が発生しないことを確認する

### NFR-03: 引数バリデーション（P42対応）

- 既存の `conversationHandlers.ts` には P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装済みであることを確認する
- 新規追加のフォールバックハンドラは引数バリデーション不要（即座に固定エラーを返す）

### NFR-04: パフォーマンス

- DB初期化は `registerAllIpcHandlers()` 内で同期的に完了する（起動時ブロックはやむを得ない）
- WALモードにより読み取りの並列化を保証する

### NFR-05: セキュリティ

- DBファイルパスはユーザーホームディレクトリ配下のみ許可
- エラーメッセージにはファイルパス等の内部情報を含めない（`sanitizeRegistrationErrorMessage` を活用）

## 受入基準

| ID    | 基準                                                                                                                                                                         | 検証方法                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| AC-01 | `registerAllIpcHandlers()` 呼び出し後、`conversation:create` ハンドラが登録されている                                                                                        | `ipcMain.handle` 呼び出し確認（ユニットテスト）                              |
| AC-02 | `conversation:list` / `conversation:get` / `conversation:update` / `conversation:delete` / `conversation:addMessage` / `conversation:search` の全7チャンネルが登録されている | 各チャンネルのhandler呼び出し確認（ユニットテスト）                          |
| AC-03 | `ConversationRepository` が better-sqlite3 インスタンスで初期化されており、`chat_sessions` テーブルが存在する                                                                | DBマイグレーション後のテーブル存在確認                                       |
| AC-04 | better-sqlite3 のロード失敗時、全7チャンネルにフォールバックハンドラが登録される                                                                                             | `DB_NOT_AVAILABLE` エラーレスポンス確認（ユニットテスト）                    |
| AC-05 | `unregisterAllIpcHandlers()` が `conversation:*` チャンネルを正しく解除する                                                                                                  | 解除後のhandler呼び出しで「No handler registered」エラーが発生することを確認 |
| AC-06 | `registerAllIpcHandlers()` → `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` で二重登録エラーが発生しない                                                          | 再登録テスト（P5対応）                                                       |
| AC-07 | 既存の `conversationHandlers.test.ts` と `conversationRepository.test.ts` が全PASS                                                                                           | `pnpm --filter @repo/desktop test` 実行                                      |
| AC-08 | TypeScript 型チェックがエラーなしで通過する                                                                                                                                  | `pnpm typecheck` 実行                                                        |

## 統合テスト連携

本修正後、以下の統合テストが通過することを確認する:

- `apps/desktop/src/main/ipc/__tests__/conversationHandlers.test.ts`: 全テストPASS
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`: 二重登録防止テストにconversationが含まれている場合はPASS
- `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`: Graceful Degradationテストが存在する場合はPASS

## 成果物

| 成果物         | パス                                                                                       | 内容           |
| -------------- | ------------------------------------------------------------------------------------------ | -------------- |
| Phase 1 仕様書 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] P50チェック（既実装状態の調査）が完了している
- [ ] エラー再現手順と影響範囲が明確に記述されている
- [ ] 機能要件（FR-01〜FR-04）が定義されている
- [ ] 非機能要件（NFR-01〜NFR-05）が定義されている
- [ ] 受入基準（AC-01〜AC-08）が検証可能な形式で定義されている
- [ ] 参照資料（システム仕様テーブル含む）が記載されている

## 次のPhase

Phase 2（設計）へ進む。設計では以下を決定する:

1. better-sqlite3 DBインスタンス生成の具体的な実装方法（パス、WALモード設定）
2. `registerAllIpcHandlers()` への追加箇所（セクション番号）
3. DB初期化失敗時のフォールバックハンドラ設計
4. 依存関係図の作成
