# Phase 7: トレーサビリティ網羅率

## タスクID: TASK-RALLY-001

## AC-テスト対応表

| AC    | 説明                              | 検証方法        | Phase   | 結果    |
| ----- | --------------------------------- | --------------- | ------- | ------- |
| AC-1  | `_handleSubmitWorkflowInput` 削除 | grep（0件確認） | Phase 5 | ✅ PASS |
| AC-2  | state宣言4行削除                  | grep（0件確認） | Phase 5 | ✅ PASS |
| AC-2b | companion useEffect削除           | grep（0件確認） | Phase 5 | ✅ PASS |
| AC-3  | typecheck通過                     | tsc --noEmit    | Phase 5 | ✅ PASS |
| AC-4  | lint通過                          | eslint          | Phase 5 | ✅ PASS |
| AC-5  | 全ソース参照0件                   | grep -rn        | Phase 5 | ✅ PASS |

## カバレッジ改善

- 削除前: `_handleSubmitWorkflowInput` がカバレッジ未達（FNDA:0）
- 削除後: 関数自体が存在しないためカバレッジ計算から除外 → 実質向上
