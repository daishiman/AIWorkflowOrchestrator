# Phase 6: Regression Plan

## 継続監視対象

| 対象                   | 回帰リスク                                                | 監視方法                              |
| ---------------------- | --------------------------------------------------------- | ------------------------------------- |
| `SkillLifecyclePanel`  | create / execute / improve のどこかで gate が更新されない | targeted test + TC-11-01〜05          |
| `SkillAnalysisView`    | score 文字列重複でテストが壊れる                          | `getOverallScoreElement()` に固定     |
| `SkillCenterView`      | Task05 受け側で banner が出ない                           | `SkillCenterView.test.tsx` + TC-11-06 |
| `skillEvaluation.ts`   | 閾値 drift / summary drift                                | pure helper test                      |
| `skillEvaluationSlice` | previous snapshot 参照ミス                                | `skillEvaluationSlice.test.ts`        |

## 実施結果

| コマンド                         | 結果             |
| -------------------------------- | ---------------- |
| targeted vitest 7 files          | PASS (228 tests) |
| SkillCenterView 追加回帰 5 files | PASS (69 tests)  |
| typecheck (`shared`, `desktop`)  | PASS             |
| Phase11 screenshot 6件           | PASS             |

## Manual bridge

| Manual TC | 自動テスト補完          |
| --------- | ----------------------- |
| TC-11-01  | draft / revise_required |
| TC-11-02  | post_create warning     |
| TC-11-03  | post_execute use_ready  |
| TC-11-04  | hard block              |
| TC-11-05  | recommended             |
| TC-11-06  | Task05 再利用           |
