# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- **カバレッジ分析**: テストカバレッジの測定と不足領域の特定
- **統合テスト拡充**: コンポーネント間連携テストの追加
- **エッジケーステスト**: 境界条件・異常系テストの追加
- **パフォーマンステスト**: 大量データ時の性能テスト

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPCチャンネル                | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント（SQLite）   | 100% |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                      | 目標 |
| ------------------ | --------------------------------------------- | ---- |
| IPC接続テスト      | conversation:\*チャンネル疎通・レスポンス形式 | 100% |
| データフローテスト | Renderer→IPC→Repository→SQLite→往復           | 100% |
| エラーハンドリング | DB接続エラー・制約違反時のエラーレスポンス    | 80%+ |
| データ整合性テスト | トランザクション・messageCount整合性          | 100% |
| 永続化テスト       | 会話作成→DB再接続→復元                        | 100% |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### ステップ2: ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### ステップ3: 追加テスト作成

#### Repository追加テスト

```typescript
describe("ConversationRepository - Edge Cases", () => {
  describe("Concurrent Operations", () => {
    it("should handle concurrent message additions", () => {});
    it("should maintain messageIndex uniqueness", () => {});
  });

  describe("Transaction Handling", () => {
    it("should rollback on error during createConversation", () => {});
    it("should rollback on error during addMessage", () => {});
  });

  describe("Soft Delete", () => {
    it("should not include soft-deleted in list", () => {});
    it("should return null for soft-deleted getConversation", () => {});
    it("should cascade messages on hard delete", () => {});
  });

  describe("Search Edge Cases", () => {
    it("should handle special characters in query", () => {});
    it("should handle empty query", () => {});
    it("should handle very long query", () => {});
  });
});
```

#### IPC追加テスト

```typescript
describe("Conversation IPC - Error Handling", () => {
  describe("Validation Errors", () => {
    it("should return error for invalid userId format", () => {});
    it("should return error for missing required fields", () => {});
  });

  describe("Database Errors", () => {
    it("should handle connection timeout", () => {});
    it("should handle disk full error", () => {});
    it("should handle corrupted database", () => {});
  });

  describe("Concurrency Errors", () => {
    it("should handle optimistic locking conflict", () => {});
  });
});
```

#### 統合テスト追加

```typescript
describe("Conversation Integration - Extended", () => {
  describe("Full Lifecycle", () => {
    it("should handle create → update → addMessages → delete flow", () => {});
    it("should handle rapid sequential operations", () => {});
  });

  describe("Data Persistence", () => {
    it("should persist after process restart (simulated)", () => {});
    it("should recover from incomplete transactions", () => {});
  });

  describe("Performance", () => {
    it("should list 100 conversations in under 100ms", () => {});
    it("should add 100 messages in under 1 second", () => {});
  });
});
```

### ステップ4: 統合テスト再実行

```bash
pnpm --filter @repo/desktop test:integration
```

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 統合テスト実行結果 |
| テストファイル     | `apps/desktop/src/**/*.test.ts`       | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している
- [ ] エッジケーステストが追加されている
- [ ] パフォーマンステストが追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
