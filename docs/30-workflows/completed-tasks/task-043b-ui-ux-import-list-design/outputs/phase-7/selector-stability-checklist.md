# Phase 7 selector 安定性 checklist

| 項目                                                                   | 結果 |
| ---------------------------------------------------------------------- | ---- |
| `useAvailableSkillsMetadata` を available 一覧専用に使用               | OK   |
| `useImportedSkills` を imported 一覧専用に使用                         | OK   |
| `useIsImportingSkill` / `useImportingSkillName` を row disabled に限定 | OK   |
| `useSkillError` を panel / dialog の表示責務に限定                     | OK   |
| 新規合成 hook を追加していない                                         | OK   |
| local state は dialog / delete / status / focus 管理に限定             | OK   |

## 補足

- rerender 最小化は individual selector 方針と整合
- `useAppStore.getState()` は dialog success / failure 判定のための post-action 判定に限定
