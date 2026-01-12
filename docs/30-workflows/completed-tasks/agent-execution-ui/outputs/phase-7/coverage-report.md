# カバレッジレポート

## 測定日: 2026-01-12

## ユニットテストカバレッジ

| 指標              | 基準 | 結果   | 判定 |
| ----------------- | ---- | ------ | ---- |
| Line Coverage     | 80%  | 82.61% | PASS |
| Branch Coverage   | 60%  | 87.50% | PASS |
| Function Coverage | 80%  | 89.40% | PASS |

## 結合テストカバレッジ

| 指標           | 基準 | 結果 | 判定 |
| -------------- | ---- | ---- | ---- |
| IPCチャンネル  | 100% | 100% | PASS |
| 正常系シナリオ | 100% | 100% | PASS |
| 異常系シナリオ | 80%+ | 90%  | PASS |

## 総合判定: PASS

## 詳細

### テスト実行結果

```
Test Files  204 passed (204)
Tests       4173 passed | 1 skipped (4174)
```

### AgentExecutionView関連のテスト

| テストファイル                         | テスト数 | PASS |
| -------------------------------------- | -------- | ---- |
| AgentExecutionView.test.tsx            | 14       | 14   |
| AgentExecutionView.ipc.test.tsx        | 16       | 16   |
| AgentExecutionView.permission.test.tsx | 14       | 14   |
| AgentExecutionView.error.test.tsx      | 13       | 13   |
| AgentExecutionView.a11y.test.tsx       | 17       | 17   |
| useAgentExecution.test.ts              | 14       | 14   |
| agentSlice.test.ts                     | 43       | 43   |
| agentSlice.execution.test.ts           | 16       | 16   |

## 未達項目

なし - 全ての基準を達成
