# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| Phase名    | カバレッジ確認                    |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 6: テスト拡充               |
| 次Phase    | Phase 8: リファクタリング         |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

移行後のコンポーネントのテストカバレッジが基準を満たしていることを確認する。

## 実行タスク

- 2コンポーネントのカバレッジを個別に確認する
- 全体カバレッジを確認する
- 旧経路参照ゼロを再確認する

## 参照資料

| 資料名  | パス                        | 説明       |
| ------- | --------------------------- | ---------- |
| Phase 6 | `phase-6-test-expansion.md` | テスト拡充 |
| Phase 5 | `phase-5-implementation.md` | 実装参照   |
| Phase 4 | `phase-4-test-creation.md`  | テスト設計 |

## 実行手順

```bash
# ImprovementProposalPanel のカバレッジ確認
pnpm --filter @repo/desktop test --coverage -- ImprovementProposalPanel

# GovernanceSummaryPanel のカバレッジ確認
pnpm --filter @repo/desktop test --coverage -- GovernanceSummaryPanel

# 全体カバレッジ確認
pnpm --filter @repo/desktop test --coverage -- --run
```

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 統合テスト連携

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                 | 説明     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果 |

## 完了条件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] 旧経路参照ゼロ（grep で再確認）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
