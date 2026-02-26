# Phase 5 型適用マップ

## SkillId 文脈

- `Skill.id`
- `SkillImportConfig.importedSkillIds`
- `SkillImportDialog.importedSkillIds`
- `SkillImportDialog.selectedIds`
- `agentSlice.importedSkillIds`
- `ExecutionInfo.skillId`
- `ExecutionContext.skillId`

## SkillName 文脈

- `Skill.name`
- `SkillMetadata.name`
- `SkillExecutionRequest.skillName`
- `SkillImportDialog.onImport` 引数
- `AgentView.handleImport` 引数
- `agentSlice.importSkill/removeSkill/selectSkillByName`
- `preload skillAPI.import/remove`
- `main skillHandlers skill:import/remove`

## 変換関数適用点

- `toSkillId`: `SkillParser.generateId`
- `toSkillName`: `SkillParser.parse`（frontmatter.name または slug）

## 検出可能になった誤用

- `SkillId` を `SkillName` パラメータへ直接渡す誤用
- `SkillName` を `SkillId` パラメータへ直接渡す誤用
