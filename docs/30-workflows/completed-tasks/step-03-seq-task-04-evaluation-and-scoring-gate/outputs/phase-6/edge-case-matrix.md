# Phase 6: Edge Case Matrix

## score 境界値

| ケース | 根拠         | 実装 / テスト           |
| ------ | ------------ | ----------------------- |
| 0      | error 下限   | `ScoreDisplay.test.tsx` |
| 59     | error 上限   | `ScoreDisplay.test.tsx` |
| 60     | warning 下限 | `ScoreDisplay.test.tsx` |
| 79     | warning 上限 | `ScoreDisplay.test.tsx` |
| 80     | ready 下限   | `ScoreDisplay.test.tsx` |
| 100    | success 上限 | `ScoreDisplay.test.tsx` |

## gate / hard block

| ケース                       | 期待            | 根拠                               |
| ---------------------------- | --------------- | ---------------------------------- |
| prompt security 69           | revise_required | `skillEvaluation.ts` / helper test |
| critical risk あり           | revise_required | `skillEvaluationSlice.test.ts`     |
| permissionSafety 69          | revise_required | `detectLifecycleHardBlocks()`      |
| reliability / retry 根拠不足 | revise_required | `detectLifecycleHardBlocks()`      |
| delta > 0 & total >= 80      | recommended     | `skillEvaluationSlice.test.ts`     |
| delta = 0 after re-evaluate  | use_ready       | Phase11 TC-11-06                   |

## UI edge case

| ケース                  | 根拠                                                |
| ----------------------- | --------------------------------------------------- |
| score 表示文字列重複    | `SkillAnalysisView.test.tsx` の selector 是正で吸収 |
| categories 空配列       | `SkillAnalysisView.test.tsx`                        |
| risks 空配列            | `SkillAnalysisView.test.tsx`                        |
| re-evaluate 中 disabled | `SkillEvaluationPanel` props + store flag           |

## cross-task edge case

| ケース                                        | 根拠                                 |
| --------------------------------------------- | ------------------------------------ |
| Task03 -> Task05 で latest gate を再利用      | `SkillCenterView.test.tsx`, TC-11-06 |
| improve 後に SkillCenter で delta が 0 に戻る | `TC-11-06-task05-re-evaluate.png`    |
