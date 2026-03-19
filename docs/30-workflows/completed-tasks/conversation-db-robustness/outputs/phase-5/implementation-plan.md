# Phase 5: 実装計画

## 実装完了ファイル

| ファイル                                                 | 変更種別 | 内容                                                                 |
| -------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `apps/desktop/src/main/database/conversationDatabase.ts` | 新規     | Factory 関数パターン DB 初期化（5関数 + 型 + スキーマ）              |
| `apps/desktop/src/main/ipc/index.ts`                     | 変更     | CONVERSATION_DB_SCHEMA 削除 + DI シグネチャ変更 + Section 13 2分岐化 |
| `apps/desktop/src/main/index.ts`                         | 変更     | DB初期化 + DI注入 + will-quit + activate DB再利用                    |

## テスト結果

- conversationDatabase.test.ts: 15件 PASS
- register-conversation-handlers.test.ts: 22件 PASS
- 合計: 37件 PASS

## 設計判断の記録

| 判断                   | 選択                                | 理由                                   |
| ---------------------- | ----------------------------------- | -------------------------------------- |
| M-01対応               | 2分岐（`!= null` vs fallback）      | 3分岐を避けてシンプルに                |
| CONVERSATION_DB_SCHEMA | import from conversationDatabase.ts | 後方互換パスで内部初期化時に必要       |
| Database型のimport     | `import type Database` （型のみ）   | ランタイム依存を回避                   |
| will-quitの配置        | app.whenReady()の外                 | ライフサイクル管理はアプリ全体スコープ |
