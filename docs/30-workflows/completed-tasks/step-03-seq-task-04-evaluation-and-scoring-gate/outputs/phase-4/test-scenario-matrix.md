# Phase 4: テストシナリオ一覧

## 自動テスト

| ID        | レイヤー         | 対象                             | 根拠ファイル                   | Manual TC 対応 |
| --------- | ---------------- | -------------------------------- | ------------------------------ | -------------- |
| UT-04-01  | unit             | execution quality 完了系         | `skillEvaluationSlice.test.ts` | TC-11-03       |
| UT-04-02  | unit             | critical risk -> revise_required | `skillEvaluationSlice.test.ts` | TC-11-04       |
| UT-04-03  | unit             | 欠損軸正規化                     | `skillEvaluationSlice.test.ts` | TC-11-05       |
| ST-04-01  | store            | draft 保存                       | `skillEvaluationSlice.test.ts` | TC-11-01       |
| ST-04-02  | store            | post_create warning              | `skillEvaluationSlice.test.ts` | TC-11-02       |
| ST-04-03  | store            | post_execute use_ready           | `skillEvaluationSlice.test.ts` | TC-11-03       |
| ST-04-04  | store            | post_improve recommended         | `skillEvaluationSlice.test.ts` | TC-11-05       |
| UI-04-01  | component        | lifecycle panel の gate 表示     | `SkillLifecyclePanel.test.tsx` | TC-11-01〜03   |
| UI-04-02  | component        | analysis view の re-evaluate     | `SkillAnalysisView.test.tsx`   | TC-11-05       |
| UI-04-03  | component        | score display badge / delta      | `ScoreDisplay.test.tsx`        | TC-11-02 / 05  |
| UI-04-04  | component        | Task05 banner                    | `SkillCenterView.test.tsx`     | TC-11-06       |
| IPC-04-01 | preload          | `evaluatePrompt()` unwrap        | `skill-api.test.ts`            | なし           |
| IPC-04-02 | preload contract | `skill.evaluatePrompt` 型契約    | `skill-api.contract.test.ts`   | なし           |

## 手動テスト

| TC       | 目的              | 期待                          |
| -------- | ----------------- | ----------------------------- |
| TC-11-01 | revise_required   | 改善必須 badge                |
| TC-11-02 | save_with_warning | 保存可・警告あり badge        |
| TC-11-03 | use_ready         | 利用可 badge                  |
| TC-11-04 | hard block        | critical risk 文言            |
| TC-11-05 | recommended       | 推奨 badge + positive delta   |
| TC-11-06 | Task05 再評価     | 利用前品質ゲート + 再評価完了 |
