# ブランチ差分カバレッジ

## 新規作成ファイル

| ファイル                                               | requirements | design | test | docs |
| ------------------------------------------------------ | ------------ | ------ | ---- | ---- |
| `embedding/late-chunking/late-chunking-types.ts`       | FR-001〜005  | ✓      | ✓    | ✓    |
| `embedding/late-chunking/late-chunking-interfaces.ts`  | FR-001〜005  | ✓      | ✓    | ✓    |
| `embedding/late-chunking/token-boundary-calculator.ts` | FR-002       | ✓      | ✓    | ✓    |
| `embedding/late-chunking/hidden-state-pooler.ts`       | FR-003       | ✓      | ✓    | ✓    |
| `embedding/late-chunking/window-splitter.ts`           | FR-004       | ✓      | ✓    | ✓    |
| `embedding/late-chunking/late-chunking-service.ts`     | FR-001       | ✓      | ✓    | ✓    |
| `embedding/late-chunking/index.ts`                     | FR-001〜005  | ✓      | -    | ✓    |

## 修正ファイル

| ファイル                         | requirements | design | test | docs |
| -------------------------------- | ------------ | ------ | ---- | ---- |
| `embedding/embedding-service.ts` | FR-005       | ✓      | ✓    | ✓    |

## テストファイル

| ファイル                                                    | 対象   |
| ----------------------------------------------------------- | ------ |
| `__tests__/late-chunking/token-boundary-calculator.test.ts` | FR-002 |
| `__tests__/late-chunking/hidden-state-pooler.test.ts`       | FR-003 |
| `__tests__/late-chunking/window-splitter.test.ts`           | FR-004 |
| `__tests__/late-chunking/late-chunking-service.test.ts`     | FR-001 |
| `__tests__/late-chunking/late-chunking-edge.test.ts`        | AC-004 |
