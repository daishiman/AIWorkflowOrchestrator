# Phase 4: 既存テスト修正計画

## タスク: TASK-FIX-10-1-VITEST-ERROR-HANDLING

## 修正カテゴリ

### カテゴリ1: @repo/shared サブパスエイリアス不足 (約150テスト)

**根本原因**: `apps/desktop/vitest.config.ts` の `resolve.alias` に `@repo/shared` の多くのサブパスが登録されていなかった。ビルド済み `dist/` からではなくソースファイルから直接解決する必要がある。

**修正方針**: vitest.config.ts に不足しているエイリアスを追加する。

**追加するエイリアス一覧**:

| エイリアスキー                                    | 解決先ソースファイル                                        |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `@repo/shared`                                    | `packages/shared/index.ts`                                  |
| `@repo/shared/types`                              | `packages/shared/src/types/index.ts`                        |
| `@repo/shared/types/auth`                         | `packages/shared/types/auth.ts`                             |
| `@repo/shared/types/api-keys`                     | `packages/shared/types/api-keys.ts`                         |
| `@repo/shared/types/agent`                        | `packages/shared/src/types/agent.ts`                        |
| `@repo/shared/types/skill`                        | `packages/shared/src/types/skill.ts`                        |
| `@repo/shared/types/llm/schemas`                  | `packages/shared/src/types/llm/schemas/index.ts`            |
| `@repo/shared/types/llm`                          | `packages/shared/src/types/llm/schemas/index.ts`            |
| `@repo/shared/types/rag`                          | `packages/shared/src/types/rag/index.ts`                    |
| `@repo/shared/types/rag/result`                   | `packages/shared/src/types/rag/result.ts`                   |
| `@repo/shared/types/replace`                      | `packages/shared/src/types/replace.ts`                      |
| `@repo/shared/infrastructure/auth`                | `packages/shared/infrastructure/auth/index.ts`              |
| `@repo/shared/infrastructure/ai/apiKeyValidator`  | `packages/shared/infrastructure/ai/apiKeyValidator.ts`      |
| `@repo/shared/repositories`                       | `packages/shared/src/repositories/index.ts`                 |
| `@repo/shared/services/history/types`             | `packages/shared/src/services/history/types.ts`             |
| `@repo/shared/services/history/history-service`   | `packages/shared/src/services/history/history-service.ts`   |
| `@repo/shared/services/logging/types`             | `packages/shared/src/services/logging/types.ts`             |
| `@repo/shared/services/logging/conversion-logger` | `packages/shared/src/services/logging/conversion-logger.ts` |

### カテゴリ2: chat-history 非同期クリーンアップ不備 (約30テスト)

**根本原因**: テスト設計の分析の結果、chat-history テストの失敗は `@repo/shared` のモジュール解決エラーが原因の連鎖的失敗であることが判明。`@repo/shared` のエイリアス追加でモジュール解決が成功すれば、chat-history テストも正常に動作する。

**修正方針**: カテゴリ1のエイリアス追加により自動的に解決される。追加の非同期クリーンアップ修正は不要と判断。

### カテゴリ3: Worker 予期せぬ終了 (1件)

**根本原因**: P22 既知問題。tinypool の Worker プロセスがメモリ消費やタイムアウトで予期せず終了する。

**修正方針**: このタスクのスコープ外。テスト自体は全てパスしており、Worker の終了は Vitest のインフラ問題。テスト結果の信頼性には影響しない。
