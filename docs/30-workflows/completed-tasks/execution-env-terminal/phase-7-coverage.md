# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 7                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

Phase 4-6 で作成したテストのカバレッジを測定し、品質基準の充足を確認する。

## 実行タスク

### Task 1: カバレッジ測定

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/llmConfigProvider.ts \
  src/renderer/components/organisms/ExecutionEnvironment/index.tsx
```

### Task 2: カバレッジ基準判定

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                   |
| ----------------- | -------- | -------- | ------------------------------ |
| Line Coverage     | 80%      | 90%      | llmConfigProvider.ts           |
| Branch Coverage   | 60%      | 70%      | llmConfigProvider.ts           |
| Function Coverage | 80%      | 90%      | llmConfigProvider.ts           |
| Line Coverage     | 80%      | 90%      | ExecutionEnvironment/index.tsx |
| Branch Coverage   | 60%      | 70%      | ExecutionEnvironment/index.tsx |
| Function Coverage | 80%      | 90%      | ExecutionEnvironment/index.tsx |

### Task 3: 未達時の対応

カバレッジ基準未達の場合は Phase 6 に戻り、不足箇所のテストを追加する。

## 統合テスト連携

| 判定項目                | 基準 | 結果       |
| ----------------------- | ---- | ---------- |
| ユニットテスト Line     | 80%+ | {{RESULT}} |
| ユニットテスト Branch   | 60%+ | {{RESULT}} |
| ユニットテスト Function | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                                                          | 説明     |
| ------------------ | ----------------------------------------------------------------------------- | -------- |
| カバレッジレポート | `docs/30-workflows/execution-env-terminal/outputs/phase-7/coverage-report.md` | 測定結果 |

## 完了条件

- [ ] カバレッジ測定が完了している
- [ ] Line Coverage 80% 以上を達成
- [ ] Branch Coverage 60% 以上を達成
- [ ] Function Coverage 80% 以上を達成
- [ ] カバレッジレポートが出力されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 8: リファクタリング
