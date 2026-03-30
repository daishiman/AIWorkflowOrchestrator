# TASK-P0-04: 設計書

## 設計方針

- 新しい path 解決ロジックは `constants.ts` に閉じる
- 既存の `getSkillCreatorRootCandidates()` を再利用する
- `RuntimeSkillCreatorFacade` の責務は増やさない

## 解決戦略

1. `explicitRoot` がある場合は即時 `path.join(explicitRoot, SKILL_CREATOR_MANIFEST_PATH)` を返す
2. 未指定時は `getSkillCreatorRootCandidates()` の `env -> home -> repo` 候補を順に調べる
3. 最初に見つかった `workflow-manifest.json` を返す
4. どこにもない場合だけ日本語エラーを throw する

## エレガンス判断

- 既存候補列挙を再利用するため、新規設定面を増やさない
- facade 側へ半端な default startup を入れないため、TASK-P0-05 との責務境界を壊さない
- テストは helper 単位と production manifest 読み込み単位に絞る
