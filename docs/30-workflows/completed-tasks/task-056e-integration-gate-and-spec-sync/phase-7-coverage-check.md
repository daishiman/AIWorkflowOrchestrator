# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 7                                        |
| Phase名      | テストカバレッジ確認                     |
| 前提Phase    | Phase 5, Phase 6                         |
| 後続Phase    | Phase 8                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E4                              |

## 目的

統合ゲート、仕様同期区分、引き渡し条件の全項目がテスト対象に含まれていることを定量的に確認する。

## 実行タスク

- カバレッジ集計: 判定軸、更新区分、下流解除条件の網羅率を集計する。
- ギャップ分析: 未カバー項目を一覧化し、戻り先を決定する。
- 判定作成: カバレッジ合否を文書化する。

## 参照資料

| 参照資料       | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| Phase 5実装    | `phase-5-implementation.md`              | カバレッジ母集団 |
| Phase 6拡充    | `phase-6-test-expansion.md`              | 拡充ケース入力   |
| 仕様同期台帳   | `outputs/phase-5/spec-sync-targets.md`   | カバレッジ対象   |
| レビューゲート | `outputs/phase-5/review-gate.md`         | カバレッジ対象   |
| テスト拡充計画 | `outputs/phase-6/test-expansion-plan.md` | Phase 6 成果物   |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`   | Phase 6 成果物   |

## システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                         | 内容                 |
| -------------- | ---------------------------------------------------------------------------- | -------------------- |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | カバレッジ判定基準   |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 最低基準と戻り先判定 |
| タスク台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 台帳同期観点         |

## 実行手順

### ステップ1: 母集団確定

判定軸5件、更新区分3件、下流解除条件3件を母集団として確定する。

### ステップ2: カバレッジ計算

各母集団に対応するテストケース数を集計し、網羅率を算出する。

### ステップ3: 合否判定

`coverage-standards.md` の戻り先基準に従い、未カバー項目が1件以上ある場合は FAIL とし、戻り先を記録する。

## 統合テスト連携

| 観点     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| 判定軸   | state / ipc / security / navigation / documentation の5軸を確認する |
| 更新区分 | 常時更新、条件付き更新、更新不要の3区分を確認する                   |
| 下流条件 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` の3件を確認する         |

## 成果物

| 成果物                 | パス                                        | 内容             |
| ---------------------- | ------------------------------------------- | ---------------- |
| カバレッジ目標レポート | `outputs/phase-7/coverage-target-report.md` | 母集団と網羅率   |
| カバレッジ判定結果     | `outputs/phase-7/coverage-gate-result.md`   | PASS / FAIL 判定 |

## 完了条件

- [x] 判定軸5件の網羅率が集計されている
- [x] 更新区分3件の網羅率が集計されている
- [x] 下流解除条件3件の網羅率が集計されている
- [x] `coverage-standards.md` に基づく FAIL 戻り先判定が記録されている
- [x] 未カバー項目があれば戻り先が記録されている
- [x] カバレッジ判定結果が PASS / FAIL で記録されている

## 次のPhase

Phase 8: リファクタリング

## 多角的チェック観点（AIが判断）

| 観点       | 適用判断                                       | 仕様参照先                                                                                                                       |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| カバレッジ | 判定軸と更新区分の網羅率を測るため適用         | `aiworkflow-requirements: quality-requirements.md`, `.claude/skills/task-specification-creator/references/coverage-standards.md` |
| 設計整合   | 母集団が設計と一致するか確認するため適用       | `phase-2-design.md`                                                                                                              |
| 実装整合   | 母集団が実装成果物と一致するか確認するため適用 | `phase-5-implementation.md`                                                                                                      |
| 台帳整合   | 下流解除条件が欠落していないか確認するため適用 | `aiworkflow-requirements: task-workflow.md`                                                                                      |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 母集団確定
2. カバレッジ計算
3. ギャップ分析
4. 合否判定
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 母集団と網羅率を成果物へ反映
- [x] ギャップ分析と合否判定を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 7
```
