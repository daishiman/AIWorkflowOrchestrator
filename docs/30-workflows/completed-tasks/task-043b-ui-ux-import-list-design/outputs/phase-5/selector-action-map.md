# Phase 5 selector / action マップ

| 種別         | 名称                         | 用途                 |
| ------------ | ---------------------------- | -------------------- |
| selector     | `useAvailableSkillsMetadata` | available 一覧       |
| selector     | `useImportedSkills`          | imported 一覧        |
| selector     | `useSkillError`              | panel / dialog error |
| selector     | `useIsLoadingSkills`         | loading state        |
| selector     | `useIsImportingSkill`        | row importing        |
| selector     | `useImportingSkillName`      | 対象 row 判定        |
| action       | `useFetchSkills`             | mount 時データ取得   |
| action       | `useRemoveSkill`             | imported 削除        |
| action       | `useClearSkillError`         | stale error クリア   |
| store action | `importSkill`                | dialog confirm 実行  |

## 明示的に使わないもの

- 新規合成 hook
- 新規 store field
- `importedCount` 単独判定
