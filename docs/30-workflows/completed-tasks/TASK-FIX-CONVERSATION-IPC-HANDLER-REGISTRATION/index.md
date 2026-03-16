# TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION - タスク実行仕様書

## ユーザーからの元の指示

```text
conversation:create 等の Conversation IPC ハンドラが registerAllIpcHandlers() から呼ばれておらず、
Renderer から conversation:* チャンネルを呼び出すと "No handler registered" エラーが発生する問題を修正する。
```

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION     |
| タスク名     | conversation-ipc-handler-registration              |
| 分類         | バグ修正（IPC配線漏れ）                            |
| 対象機能     | Conversation History Persistence（会話履歴永続化） |
| 優先度       | 高                                                 |
| 見積もり規模 | 小〜中規模                                         |
| ステータス   | spec_created                                       |
| 作成日       | 2026-03-16                                         |

## タスク概要

### 目的

`conversationHandlers.ts` に実装済みの `registerConversationHandlers()` を `ipc/index.ts` の `registerAllIpcHandlers()` に接続し、Conversation IPC チャンネル（`conversation:list`, `conversation:get`, `conversation:create`, `conversation:update`, `conversation:delete`, `conversation:addMessage`, `conversation:search`）を Main Process で正常に登録する。

### 背景

- `conversationHandlers.ts` にハンドラ実装が完成している
- `preload/index.ts` に `conversationAPI` が `contextBridge` 経由で公開済み
- `preload/channels.ts` に `CONVERSATION_*` チャンネル定数が定義済み
- テストも `conversationHandlers.test.ts` に存在する
- **しかし** `ipc/index.ts` の `registerAllIpcHandlers()` から `registerConversationHandlers` が一度も呼ばれていない
- `ConversationRepository` は `better-sqlite3` の `Database` インスタンスを必要とするが、メインプロセスにDB初期化処理が存在しない

### 最終ゴール

Renderer Process から `window.conversationAPI.create()` 等を呼び出した際に、Main Process のハンドラが正常に応答し、SQLite に会話データが永続化される状態を実現する。

### 成果物一覧

| 種別       | 成果物                  | 配置先                                                                              |
| ---------- | ----------------------- | ----------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13  | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/`                 |
| 設計成果物 | outputs/phase-\*/       | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/outputs/phase-*/` |
| コード     | DB初期化 + ハンドラ登録 | `apps/desktop/src/main/`                                                            |
| テスト     | ハンドラ登録テスト      | `apps/desktop/src/main/ipc/__tests__/`                                              |

## 参照ファイル

| 参照資料                     | パス                                                                          | 内容                                           |
| ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| conversationHandlers         | `apps/desktop/src/main/ipc/conversationHandlers.ts`                           | ハンドラ実装（registerConversationHandlers）   |
| ipc/index.ts                 | `apps/desktop/src/main/ipc/index.ts`                                          | registerAllIpcHandlers（ハンドラ登録の集約点） |
| ConversationRepository       | `apps/desktop/src/main/repositories/conversationRepository.ts`                | SQLiteリポジトリ（better-sqlite3依存）         |
| preload/index.ts             | `apps/desktop/src/preload/index.ts`                                           | conversationAPI公開（contextBridge）           |
| preload/channels.ts          | `apps/desktop/src/preload/channels.ts`                                        | CONVERSATION\_\* チャンネル定数                |
| shared/types/conversation.ts | `apps/desktop/src/shared/types/conversation.ts`                               | 会話関連型定義                                 |
| conversationHandlers.test    | `apps/desktop/src/main/ipc/__tests__/conversationHandlers.test.ts`            | 既存テスト                                     |
| conversationRepository.test  | `apps/desktop/src/main/repositories/__tests__/conversationRepository.test.ts` | リポジトリテスト                               |
| ipc-double-registration.test | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`         | 二重登録防止テスト（P5準拠）                   |
| fallback-handlers.test       | `apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts`               | フォールバックハンドラテスト                   |
| graceful-degradation.test    | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`        | Graceful Degradationテスト                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                             | パス                                                                                        | 内容                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧        |
| database-schema                      | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | SQLiteスキーマ定義                         |
| database-implementation              | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | DB初期化パターン                           |
| database-implementation-core         | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`         | better-sqlite3初期化の詳細                 |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                        |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPC契約定義                                |
| interfaces-chat-history-history      | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history-history.md`      | 会話履歴インターフェース                   |
| arch-ipc-persistence                 | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | IPC永続化アーキテクチャ                    |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン                 |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation等） |

## タスク分解サマリー

| ID   | フェーズ | サブタスク名     | 責務                                                         | 依存 |
| ---- | -------- | ---------------- | ------------------------------------------------------------ | ---- |
| T-01 | Phase 1  | 要件定義         | エラー再現条件、修正スコープ、受入基準を定義する             | -    |
| T-02 | Phase 2  | 設計             | DB初期化、ハンドラ登録、unregister対応の設計を確定する       | T-01 |
| T-03 | Phase 3  | 設計レビュー     | 既存パターン（safeRegister/track）との整合性を判定する       | T-02 |
| T-04 | Phase 4  | テスト作成       | registerAllIpcHandlersにconversationハンドラが含まれるテスト | T-03 |
| T-05 | Phase 5  | 実装             | DB初期化 + registerConversationHandlers呼び出し追加          | T-04 |
| T-06 | Phase 6  | テスト拡充       | 異常系、DB初期化失敗、二重登録防止テスト                     | T-05 |
| T-07 | Phase 7  | カバレッジ確認   | Line 80%+, Branch 60%+, Function 80%+ の達成確認             | T-06 |
| T-08 | Phase 8  | リファクタリング | コード品質改善（必要に応じて）                               | T-07 |
| T-09 | Phase 9  | 品質検証         | Lint、TypeCheck、全テスト実行                                | T-08 |
| T-10 | Phase 10 | 最終レビュー     | PASS/MINOR/MAJOR/CRITICAL判定                                | T-09 |
| T-11 | Phase 11 | 手動テスト       | DevToolsでの動作確認、IPC通信検証                            | T-10 |
| T-12 | Phase 12 | ドキュメント更新 | 実装ガイド、仕様書更新、未タスク検出                         | T-11 |
| T-13 | Phase 13 | PR作成           | ユーザー許可後にPR作成                                       | T-12 |

## 実行フロー

1. Phase 1-3 で要件、設計、レビューゲートを固める。
2. Phase 4-7 でTDD（テスト作成→実装→テスト拡充→カバレッジ確認）。
3. Phase 8-10 でリファクタリング、品質検証、最終レビュー。
4. Phase 11-13 で手動テスト、ドキュメント更新、PR作成。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- conversation:\* チャンネルのIPCハンドラ登録をregisterAllIpcHandlersに追加
- DB初期化（better-sqlite3）→ ConversationRepository生成 → ハンドラ登録の依存チェーン
- unregisterAllIpcHandlers での conversation チャンネル解除
- 既存ハンドラ（skill, auth, llm等）との共存・非干渉

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。

## 既知の落とし穴（本タスク固有）

| ID  | リスク                                 | 対策                                                       |
| --- | -------------------------------------- | ---------------------------------------------------------- |
| R1  | P5: ipcMain.handle 二重登録例外        | safeRegister + track パターンで登録（既存パターン準拠）    |
| R2  | P54: safeRegister パターン不適合       | ConversationRepositoryは戻り値不要のためsafeRegister適用可 |
| R3  | P42: .trim()バリデーション漏れ         | conversationHandlers.ts は既にtrim()実装済み（確認済み）   |
| R4  | better-sqlite3 DB初期化失敗            | Graceful Degradation（S30）でフォールバックハンドラを登録  |
| R5  | P7: ネイティブモジュールバイナリ不一致 | pnpm install --force の注意喚起をドキュメントに含める      |
