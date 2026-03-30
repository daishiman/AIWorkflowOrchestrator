# TASK-P0-04: ManifestLoader デフォルト起動パス基盤 - 要件サマリー

## タスク分類

`コード実装タスク`（UI変更なし、NON_VISUAL）

## current fact

- 実装差分は `apps/desktop/src/main/services/skill/constants.ts` と `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` の2ファイル
- `RuntimeSkillCreatorFacade.loadWorkflowManifest()` は未変更
- したがって本タスクで完了したのは「default manifest path 解決 helper と検証」であり、「runtime pipeline 自動起動統合」ではない

## スコープ

### 対象

1. `SKILL_CREATOR_MANIFEST_PATH` の追加
2. `resolveDefaultManifestPath(explicitRoot?)` の追加
3. production manifest テストの正常系・異常系拡充

### 対象外

- `RuntimeSkillCreatorFacade` のデフォルト起動統合
- Electron 起動順序変更
- manifest 内容変更
- runtime pipeline フル統合（TASK-P0-05）

## 受入基準

| AC   | 内容                                                                         | 根拠           |
| ---- | ---------------------------------------------------------------------------- | -------------- |
| AC-1 | `SKILL_CREATOR_MANIFEST_PATH` が定義されている                               | `constants.ts` |
| AC-2 | `resolveDefaultManifestPath()` が `explicitRoot` を優先する                  | TC-14          |
| AC-3 | `resolveDefaultManifestPath()` が env/home/repo 候補から manifest を解決する | TC-11, TC-12   |
| AC-4 | manifest 不在時に説明的な日本語エラーを返す                                  | EC-11          |
| AC-5 | 破損 JSON を `ManifestLoader` が reject する                                 | EC-12          |
| AC-6 | production manifest テスト群が Green である                                  | 25 tests       |
| AC-7 | downstream runtime hookup を本タスク完了として主張しない                     | scope定義      |

## 現行コードアンカー

| ファイル                                                                                      | 役割                                   |
| --------------------------------------------------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/main/services/skill/constants.ts`                                           | skill-creator root 候補解決の正本      |
| `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | production manifest 読み込み検証       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                         | 本タスクでは未変更の downstream 接続先 |
