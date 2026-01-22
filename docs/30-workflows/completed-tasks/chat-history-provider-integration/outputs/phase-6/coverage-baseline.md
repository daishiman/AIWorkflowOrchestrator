# Phase 6: カバレッジベースライン

## メタ情報

| 項目   | 内容                              |
| ------ | --------------------------------- |
| Phase  | 6                                 |
| 作成日 | 2026-01-22                        |
| 機能名 | chat-history-provider-integration |
| 作成者 | Claude Code                       |

---

## 現状テストサマリー

### テストファイル一覧

| テストファイル                                  | テスト数 | 結果 |
| ----------------------------------------------- | -------- | ---- |
| `context/__tests__/ChatHistoryContext.test.tsx` | 32       | PASS |
| `__tests__/ChatHistoryIntegration.test.tsx`     | 12       | PASS |
| `hooks/__tests__/useChatHistory.test.ts`        | 20       | PASS |
| `__tests__/AppIntegration.test.tsx`             | 5        | PASS |
| `__tests__/ErrorHandling.test.tsx`              | 6        | PASS |
| `repositories/__tests__/index.test.ts`          | 8        | PASS |
| **合計**                                        | **83**   | PASS |

---

## カバレッジ対象ファイル

### カバレッジ計測対象

| ファイル                                        | 状態     | 備考               |
| ----------------------------------------------- | -------- | ------------------ |
| `context/ChatHistoryContext.tsx`                | 計測対象 | Context定義        |
| `context/ChatHistoryProvider.tsx`               | 計測対象 | Provider実装       |
| `hooks/useChatHistory.ts`                       | 計測対象 | Hook実装           |
| `context/__mocks__/MockChatHistoryProvider.tsx` | 計測対象 | モックプロバイダー |

### カバレッジ計測除外（vitest.config.ts設定）

| ファイル                | 除外理由               |
| ----------------------- | ---------------------- |
| `repositories/index.ts` | `**/index.ts` 除外設定 |
| `context/index.ts`      | `**/index.ts` 除外設定 |
| `hooks/index.ts`        | `**/index.ts` 除外設定 |

**注記**: vitest.config.tsで `**/index.ts` がカバレッジ計測から除外されているため、リポジトリファクトリーは除外される。テストは存在し正常に動作するが、カバレッジレポートには含まれない。

---

## 現状カバレッジ分析

### ChatHistoryProvider.tsx

- **関数カバレッジ**: 2/2 (100%)
  - `createUseCases`: 31回呼び出し
  - `ChatHistoryProvider`: テストで網羅

### useChatHistory.ts

- **関数カバレッジ**: 1/1 (100%)
  - `useChatHistory`: 118回呼び出し

### ChatHistoryContext.tsx

- **行カバレッジ**: 網羅済み
  - Context定義行が全て実行

---

## カバレッジ不足箇所

### 1. 異常系テスト

| 観点                 | 現状   | 改善必要 |
| -------------------- | ------ | -------- |
| Repository初期化失敗 | △ 部分 | 追加     |
| DB接続エラー時       | × なし | 追加     |
| Use Case実行失敗時   | △ 部分 | 追加     |

### 2. 境界条件テスト

| 観点                 | 現状   | 改善必要 |
| -------------------- | ------ | -------- |
| 空のセッションリスト | × なし | 追加     |
| 大量セッション時     | × なし | 追加     |
| 同時アクセス時       | × なし | 追加     |

### 3. エッジケーステスト

| 観点               | 現状   | 改善必要 |
| ------------------ | ------ | -------- |
| Provider再マウント | ○ あり | -        |
| Context値変更検知  | ○ あり | -        |
| 複数Provider入れ子 | × なし | 追加     |

---

## 次のタスクでの改善目標

1. **異常系テスト追加**: Repository/Use Case実行失敗時のテスト
2. **境界条件テスト追加**: 空リスト、大量データのテスト
3. **エッジケーステスト追加**: 複数Provider入れ子時の動作テスト
