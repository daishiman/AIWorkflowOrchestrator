# Phase 1 成果物: 失敗テストリスト

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| Phase      | 1                                   |
| 作成日     | 2026-02-19                          |
| ステータス | 完了                                |

---

## サマリー

| 指標             | 値  |
| ---------------- | --- |
| 失敗テスト総数   | 252 |
| 失敗ファイル総数 | 32  |
| カテゴリ数       | 3   |

---

## カテゴリ C-1: @repo/shared サブパスエイリアス不足（25 ファイル, ~220 テスト）

### 根本原因

`apps/desktop/vitest.config.ts` の `resolve.alias` に以下のサブパスが未登録のため、モジュール解決に失敗する:

- `@repo/shared/types/auth`
- `@repo/shared/types/api-keys`
- `@repo/shared/types/agent`
- `@repo/shared/types/skill`
- `@repo/shared/infrastructure/auth`

### 直接影響ファイル（サブパスを直接 import）

| #   | ファイルパス                                           | 失敗テスト数 | 未登録サブパス                |
| --- | ------------------------------------------------------ | ------------ | ----------------------------- |
| 1   | `src/main/__tests__/auth-callback.edge-cases.test.ts`  | -            | `@repo/shared/types/auth`     |
| 2   | `src/main/__tests__/auth-callback.test.ts`             | 6            | `@repo/shared/types/auth`     |
| 3   | `src/main/__tests__/auth-flow.integration.test.ts`     | -            | `@repo/shared/types/auth`     |
| 4   | `src/main/auth/__tests__/auth-ipc-integration.test.ts` | -            | `@repo/shared/types/auth`     |
| 5   | `src/main/auth/__tests__/authFlowOrchestrator.test.ts` | -            | `@repo/shared/types/auth`     |
| 6   | `src/main/infrastructure/apiKeyStorage.test.ts`        | -            | `@repo/shared/types/api-keys` |
| 7   | `src/main/ipc/apiKeyHandlers.test.ts`                  | 27           | `@repo/shared/types/api-keys` |
| 8   | `src/main/ipc/authHandlers.test.ts`                    | 53           | `@repo/shared/types/auth`     |
| 9   | `src/main/ipc/profileHandlers.extended.test.ts`        | 28           | `@repo/shared/types/auth`     |
| 10  | `src/main/ipc/profileHandlers.test.ts`                 | 34           | `@repo/shared/types/auth`     |

### 連鎖影響ファイル（IPC ハンドラ・サービスの依存で連鎖的に失敗）

| #   | ファイルパス                                                                                   | 失敗テスト数 | 連鎖元                                                   |
| --- | ---------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------- |
| 11  | `src/main/claude-cli/__tests__/ipc-handler.test.ts`                                            | 38           | `@repo/shared/types/auth`, `@repo/shared/types/api-keys` |
| 12  | `src/main/ipc/__tests__/agentHandlers.test.ts`                                                 | 15           | `@repo/shared/types/agent`                               |
| 13  | `src/main/services/agent/__tests__/AgentExecutor.test.ts`                                      | -            | `@repo/shared/types/agent`                               |
| 14  | `src/main/services/agent/__tests__/ExecutionManager.test.ts`                                   | -            | `@repo/shared/types/agent`                               |
| 15  | `src/main/services/agent/__tests__/HooksFactory.test.ts`                                       | -            | `@repo/shared/types/agent`                               |
| 16  | `src/main/services/agent/__tests__/integration.test.ts`                                        | 8            | `@repo/shared/types/agent`                               |
| 17  | `src/main/services/session/__tests__/session-ipc.integration.test.ts`                          | 20           | `@repo/shared/types/auth`                                |
| 18  | `src/main/services/session/__tests__/SessionPersistenceService.test.ts`                        | 20           | `@repo/shared/types/auth`                                |
| 19  | `src/main/slide/__tests__/slide-integration.test.ts`                                           | -            | `@repo/shared/types/skill`                               |
| 20  | `src/main/slide/__tests__/sync-manager.test.ts`                                                | -            | `@repo/shared/types/skill`                               |
| 21  | `src/renderer/components/molecules/SkillCard/__tests__/SkillCard.test.tsx`                     | -            | `@repo/shared/types/skill`                               |
| 22  | `src/renderer/components/molecules/SkillCategoryFilter/__tests__/SkillCategoryFilter.test.tsx` | -            | `@repo/shared/types/skill`                               |
| 23  | `src/renderer/components/organisms/SkillList/__tests__/SkillList.test.tsx`                     | -            | `@repo/shared/types/skill`                               |
| 24  | `src/renderer/views/AgentView/__tests__/AgentView.test.tsx`                                    | -            | `@repo/shared/types/agent`, `@repo/shared/types/skill`   |
| 25  | `src/renderer/views/AgentView/__tests__/SkillManagement.integration.test.tsx`                  | -            | `@repo/shared/types/skill`                               |

> **注記**: 失敗テスト数が `-` のファイルは、ファイル全体が読み込み失敗により全テスト失敗となるが、個別テスト数は分析結果に含まれていない。C-1 カテゴリ全体で推定 ~220 テストが失敗。

---

## カテゴリ C-2: chat-history 非同期クリーンアップ不備（6 ファイル, ~30 テスト）

### 根本原因

happy-dom 環境の AsyncTaskManager が破壊された後にスクリプト実行が継続し、テスト teardown での非同期処理クリーンアップが不完全。結果として未処理の Promise 拒否が発生する。

### 該当ファイル一覧

| #   | ファイルパス                                                              | 推定失敗テスト数 | 症状                                        |
| --- | ------------------------------------------------------------------------- | ---------------- | ------------------------------------------- |
| 1   | `src/features/chat-history/__tests__/AppIntegration.test.tsx`             | ~5               | AsyncTaskManager 破壊後のスクリプト実行継続 |
| 2   | `src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`     | ~5               | 非同期処理のクリーンアップ未完了            |
| 3   | `src/features/chat-history/__tests__/ErrorHandling.test.tsx`              | ~5               | エラーハンドリングテストでの未処理拒否      |
| 4   | `src/features/chat-history/__tests__/ExpandedTests.test.tsx`              | ~5               | 拡張テストでの非同期処理残留                |
| 5   | `src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx` | ~5               | Context テストでの teardown 不備            |
| 6   | `src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`        | ~5               | Hook テストでの非同期クリーンアップ漏れ     |

---

## カテゴリ C-3: Worker 予期せぬ終了（1 件, ~2 テスト）

### 根本原因

P22 既知問題。大規模テスト実行時（9,876 テスト）に Vitest Worker がメモリ圧迫またはタイムアウトにより予期せず終了する。

### 対処方針

- コード修正不要
- テスト実行時にリトライ（最大 3 回）で対処
- 根本解決は別タスクとして管理

---

## 修正方針別集計

| 修正方針                               | ファイル数 | 推定テスト数 |
| -------------------------------------- | ---------- | ------------ |
| vitest.config.ts エイリアス追加のみ    | 25         | ~220         |
| テストコード修正（クリーンアップ追加） | 6          | ~30          |
| 対処不要（リトライで対処）             | 1          | ~2           |
| **合計**                               | **32**     | **~252**     |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-19 | 初版作成 |
