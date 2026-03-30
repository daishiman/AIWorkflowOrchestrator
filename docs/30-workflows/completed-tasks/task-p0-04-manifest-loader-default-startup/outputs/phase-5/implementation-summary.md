# TASK-P0-04: 実装サマリー

## 変更ファイル

| ファイル                                                                                      | 変更内容                                                               |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/constants.ts`                                           | `SKILL_CREATOR_MANIFEST_PATH` と `resolveDefaultManifestPath()` を追加 |
| `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | TC-10〜14、EC-10〜12 を追加                                            |

## 実装要点

1. helper は `getSkillCreatorRootCandidates()` を再利用する
2. `explicitRoot` がある場合は候補探索をしない
3. 候補探索は `workflow-manifest.json` 実在確認だけに閉じる
4. manifest の parse / schema 検証責務は `ManifestLoader` に残す

## 非対象

- `RuntimeSkillCreatorFacade.loadWorkflowManifest()` は未変更
- runtime pipeline 自動起動は未実装のまま downstream へ残す

## 実測

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`
- 結果: 25 tests PASS
