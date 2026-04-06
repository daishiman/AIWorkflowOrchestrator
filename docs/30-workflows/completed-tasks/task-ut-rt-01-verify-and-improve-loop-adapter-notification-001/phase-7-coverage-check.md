# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 7                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

追加した通知コード（約5行）のカバレッジが目標値を達成していることを確認する。

## 実行タスク

- Task 7-1: カバレッジ計測
- Task 7-2: 目標値との比較
- Task 7-3: 未達の場合はPhase 6へ戻り追加テスト作成

## 参照資料

| 資料名         | パス                                                       | 説明               |
| -------------- | ---------------------------------------------------------- | ------------------ |
| Phase 6 成果物 | [phase-6-test-expansion.md](phase-6-test-expansion.md)     | 全テストの参照     |
| カバレッジ設定 | `vitest.config.ts`（または `packages/*/vitest.config.ts`） | カバレッジ設定確認 |

## 実行手順

### Step 1: Task 7-1 カバレッジ計測

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="notification"
```

### Step 2: Task 7-2 目標値との比較

**カバレッジ目標**:

対象: `verifyAndImproveLoop()` の `improve()` エラーブロック（追加箇所のみ）

| 項目                                       | 目標 |
| ------------------------------------------ | ---- |
| `improve()` エラーブロックの line coverage | 100% |
| `notify()` 呼び出しの branch coverage      | 100% |
| `notificationService` undefined 分岐       | 100% |

**全体目標**（参考）:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Step 3: Task 7-3 未達時の対応

カバレッジが目標を下回る場合:

1. 未カバーの分岐を特定する
2. [Phase 6](phase-6-test-expansion.md) へ戻り、対象分岐のテストを追加する
3. カバレッジを再計測する

## 統合テスト連携【必須】

| 連携アクション   | 内容                                                       |
| ---------------- | ---------------------------------------------------------- |
| 統合テスト再実行 | カバレッジ計測と同時に統合テストも実行し、ゲート判定を行う |

## 成果物

| 成果物             | 配置先                               |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] `improve()` エラーブロックの line coverage が 100%
- [ ] `notify()` 呼び出しの branch coverage が 100%
- [ ] `notificationService` undefined 分岐が 100%
- [ ] 全体 line coverage が 80% 以上

## タスク100%実行確認【必須】

Phase 7 完了時に以下を確認すること:

- [ ] Task 7-1（カバレッジ計測）を完全に実行した
- [ ] Task 7-2（目標値との比較）を完全に実行した
- [ ] Task 7-3（未達対応）が必要だった場合は完全に実行した

## 次Phase

→ [Phase 8: リファクタリング](phase-8-refactoring.md)

**Phase 7→8 の遷移条件**: カバレッジ目標を全て達成していること
**未達の場合**: Phase 6 へ戻り追加テスト作成後に再計測
