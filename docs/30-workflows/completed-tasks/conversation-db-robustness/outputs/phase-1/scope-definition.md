# Phase 1: 影響範囲分析

## 変更対象ファイル

| ファイル                                                                | 変更種別 | 変更内容                                                   |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/database/conversationDatabase.ts`                | 新規     | Factory 関数パターン DB 初期化・ライフサイクル管理         |
| `apps/desktop/src/main/database/__tests__/conversationDatabase.test.ts` | 新規     | Factory 関数群の単体テスト                                 |
| `apps/desktop/src/main/ipc/index.ts`                                    | 変更     | Section 13 DI パターン変更、CONVERSATION_DB_SCHEMA 移動    |
| `apps/desktop/src/main/ipc/__tests__/ipc-index-di.test.ts`              | 新規     | DI 統合テスト                                              |
| `apps/desktop/src/main/index.ts`                                        | 変更     | initializeConversationDatabase() 呼び出し + will-quit 統合 |

## 影響を受ける既存ファイル（変更不要だが回帰テスト対象）

| ファイル                                                                     | 影響理由                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/conversationHandlers.test.ts`           | conversationHandlers のモック構造に影響する可能性 |
| `apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts` | registerAllIpcHandlers シグネチャ変更の影響       |
| `apps/desktop/src/main/repositories/conversationRepository.ts`               | DB インスタンスの受け渡し方法が変わる             |

## スコープ外項目

| 項目                                           | 理由                           |
| ---------------------------------------------- | ------------------------------ |
| スキーマバージョニング（マイグレーション機構） | 別タスクで対応                 |
| better-sqlite3 の Electron ABI リビルド自動化  | postinstall 改善として別タスク |
| Conversation UI の改善                         | 別タスク                       |
| conversationRepository.test.ts の75件SKIP修正  | P7（ABI不一致）は別タスク      |
| IPC チャンネル追加・削除                       | 既存7チャンネルの維持のみ      |

## セキュリティ考慮事項

| 項目                         | 対策                                                      |
| ---------------------------- | --------------------------------------------------------- |
| DB パスのパストラバーサル    | `app.getPath('userData')` ベースのパスのみ許可            |
| エラーメッセージのパスマスク | `sanitizeRegistrationErrorMessage` で継続使用（P55 準拠） |
| IPC 引数バリデーション       | DB パス引数に P42 準拠3段バリデーション適用               |
