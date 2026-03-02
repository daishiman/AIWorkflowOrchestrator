# Phase 7 統合テスト結果

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase    | 7                                    |
| 完了日   | 2026-03-01                           |

## テスト実行結果サマリー

| テスト種別     | テストケース数 | PASS | FAIL | 実行環境 |
| -------------- | -------------- | ---- | ---- | -------- |
| ユニットテスト | 52             | 52   | 0    | ローカル |
| E2E テスト     | 16             | -    | -    | CI予定   |
| **合計**       | **68**         | 52   | 0    |          |

## ユニットテスト詳細結果

```
✓ src/main/utils/__tests__/worktree-protocol-flow.test.ts (6 tests) 14ms
✓ src/main/utils/__tests__/deferred-tests-parser.test.ts (13 tests) 6ms
✓ src/main/utils/__tests__/test-layer-classifier.test.ts (22 tests) 5ms
✓ src/main/utils/__tests__/worktree-detector.test.ts (11 tests) 16ms

Test Files  4 passed (4)
     Tests  52 passed (52)
  Duration  4.17s
```

## カバレッジ達成状況

| ファイル                   | Line | Branch | Function | 判定 |
| -------------------------- | ---- | ------ | -------- | ---- |
| `worktree-detector.ts`     | 100% | 80%    | 100%     | PASS |
| `deferred-tests-parser.ts` | 100% | 100%   | 100%     | PASS |
| `test-layer-classifier.ts` | 100% | 100%   | 100%     | PASS |

## 次のアクション

Phase 7 ゲート判定: **PASS** → Phase 8（リファクタリング）へ進む。
