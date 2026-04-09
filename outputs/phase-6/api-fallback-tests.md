# Phase 6 タスク3: API 未接続フォールバックテスト

## 追加テストケース一覧

| テストID | 説明                                                                      | 結果    |
| -------- | ------------------------------------------------------------------------- | ------- |
| F-2      | planSkill が undefined のとき setGenerationError が呼ばれる               | ✅ PASS |
| F-3      | executePlan が undefined のとき setGenerationError が呼ばれる（新規追加） | ✅ PASS |

## 実装メモ

- F-2: 既存 `.skip` を除去して有効化
- F-3: Phase 6 新規追加。planSkill が成功した後 executePlan が存在しない場合に graceful degradation することを確認
- getSkillCreatorApi() の `!api.planSkill` / `!api.executePlan` ガードが正常動作
