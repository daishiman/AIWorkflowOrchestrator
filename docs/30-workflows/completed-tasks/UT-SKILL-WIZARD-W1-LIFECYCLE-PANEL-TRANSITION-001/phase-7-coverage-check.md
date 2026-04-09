# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 7                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 6                                                    |
| 後続Phase  | Phase 8                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

変更コンポーネント（`SkillLifecyclePanel.tsx`）のテストカバレッジが目標値を達成しているかを確認し、  
未到達の場合は Phase 6 へ戻ってテストを追加する。

## 参照資料

- `outputs/phase-6/regression-test-result.md`
- `outputs/phase-6/expanded-test-cases.md`
- `outputs/phase-1/acceptance-criteria.md`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

---

## 実行タスク

- **カバレッジ計測**: 変更コンポーネントのカバレッジを計測する
- **目標値との照合**: Line/Branch/Function の各カバレッジが目標値を満たすか確認
- **未到達分析**: カバレッジ未達の場合、未到達箇所を特定する
- **トレーサビリティ確認**: 受け入れ基準（AC）とテストケースの対応を確認する

---

## カバレッジ目標値

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 実行手順

### ステップ 1: カバレッジ計測

```bash
# SkillLifecyclePanel のカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  src/renderer/components/skill/__tests__/

# カバレッジレポート確認
cat coverage/lcov-report/index.html
```

### ステップ 2: 目標値との照合

計測結果を目標値と照合する:

| 指標              | 計測値 | 最低基準 | 判定 |
| ----------------- | ------ | -------- | ---- |
| Line Coverage     | TBD    | 80%      | TBD  |
| Branch Coverage   | TBD    | 60%      | TBD  |
| Function Coverage | TBD    | 80%      | TBD  |

### ステップ 3: トレーサビリティ確認

| AC 番号 | 対応テストケース             | カバレッジ確認 |
| ------- | ---------------------------- | -------------- |
| AC-1    | TC-03（textarea 削除確認）   | TBD            |
| AC-2    | TC-04（textarea 削除確認）   | TBD            |
| AC-3    | TC-01（ウィザードボタン）    | TBD            |
| AC-4    | TC-01, TC-02（state 削除）   | TBD            |
| AC-5    | TC-05〜TC-09（6 本更新確認） | TBD            |

---

## 統合テスト連携

- 変更コンポーネントの統合テストを再実行し、全 PASS を確認する
- カバレッジ未達の場合は Phase 6 へ戻りテストを追加する

---

## 成果物

| 成果物                 | パス                                              | 説明                           |
| ---------------------- | ------------------------------------------------- | ------------------------------ |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | カバレッジ目標と計測方法       |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC とテストの対応確認          |
| 未到達分析計画         | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達箇所の分析（未達時のみ） |

---

## 完了条件

- [ ] Line Coverage が 80% 以上であることを確認した
- [ ] Branch Coverage が 60% 以上であることを確認した
- [ ] Function Coverage が 80% 以上であることを確認した
- [ ] AC-1〜AC-5 の全受け入れ基準が対応テストでカバーされていることを確認した
- [ ] カバレッジ未達の場合は Phase 6 へ戻った
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] カバレッジ計測結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 7
```

---

## 次のPhase

Phase 8: リファクタリング
