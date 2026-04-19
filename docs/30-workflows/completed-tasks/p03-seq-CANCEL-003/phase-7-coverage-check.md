# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 6                           |
| 後続Phase  | Phase 8                           |
| 作成日     | 2026-04-15                        |
| ステータス | completed                         |

## 目的

テストカバレッジを計測し、目標基準（Line 80%+、Branch 60%+、Function 80%+）を満たしているか確認する。

## 実行手順

### 1. カバレッジ計測

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts
```

### 2. カバレッジ目標との比較

| 指標              | 最低基準 | 推奨基準 | 計測結果 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | pending  |
| Branch Coverage   | 60%      | 70%      | pending  |
| Function Coverage | 80%      | 90%      | pending  |

### 3. ゲート判定

| 判定 | 条件                         | 対応           |
| ---- | ---------------------------- | -------------- |
| PASS | 全指標が最低基準以上         | Phase 8 へ     |
| 未達 | いずれかの指標が最低基準未満 | Phase 6 に戻る |

## 実行タスク

- [ ] 対象テストの coverage を計測する
- [ ] Line / Branch / Function の各指標を比較する
- [ ] 未達時の戻り先と追加対応を判定する
- [ ] レポートへ結果を書き出す

## 参照資料

- `docs/30-workflows/p03-seq-CANCEL-003/phase-6-test-expansion.md`
- `docs/30-workflows/p03-seq-CANCEL-003/outputs/phase-6/test-expansion-log.md`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| カバレッジ計測実施     | 完了 | pending |
| Line Coverage 80%+     | 達成 | pending |
| Branch Coverage 60%+   | 達成 | pending |
| Function Coverage 80%+ | 達成 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `cancelCurrentOperation()` の全分岐（null の場合・非null の場合）がカバーされているか
- [ ] `unregisterSkillCreatorHandlers()` の追加行がカバレッジに含まれているか

## サブタスク管理

1. カバレッジ計測実行
2. 目標基準との比較
3. ゲート判定
4. 成果物の出力

## 成果物

| 成果物             | パス                                 | 説明                     |
| ------------------ | ------------------------------------ | ------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・ゲート判定記録 |

## 完了条件

- [ ] カバレッジ計測が実施済み
- [ ] 全指標が最低基準を満たしている
- [ ] ゲート判定が記録されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
