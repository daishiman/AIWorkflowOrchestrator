# Phase 2 境界変換設計

## Renderer境界

- `SkillImportDialog`
  - `selectedIds: Set<SkillId>`
  - `importedSkillIds: SkillId[]`
  - `onImport: (skillNames: SkillName[]) => void`
- 変換式
  - `availableSkills.filter((s) => selectedIds.has(s.id)).map((s) => s.name)`

## Store境界

- `agentSlice.importSkill(skillName: SkillName)`
- `agentSlice.removeSkill(skillName: SkillName)`
- `agentSlice.importedSkillIds: SkillId[]`

## Preload/Main境界

- `skillAPI.import(skillName: SkillName)`
- `skillAPI.remove(skillName: SkillName)`
- `skillHandlers(skill:import/remove)` の受信型を `SkillName` に揃える。

## 非対象境界

- `skill:execute` のIDベース実行系（既存仕様維持、今回の主対象外）。
