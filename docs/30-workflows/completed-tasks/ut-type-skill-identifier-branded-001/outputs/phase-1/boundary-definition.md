# Phase 1 変換境界定義

## 境界ルール

- ルール1: 永続化/比較キーは `SkillId` 文脈（`importedSkillIds`、ID照合）。
- ルール2: IPC `skill:import` / `skill:remove` / 実行要求は `SkillName` 文脈。
- ルール3: UI選択状態は `Set<SkillId>`、import実行直前に `SkillName[]` へ変換する。
- ルール4: `Skill` 構造体外の生文字列は `toSkillId` / `toSkillName` で明示変換する。

## Renderer -> IPC 変換境界

1. `SkillImportDialog` で `selectedIds: Set<SkillId>` を保持。
2. `availableSkills` を参照し `selectedIds.has(skill.id)` で抽出。
3. `map(skill.name)` で `SkillName[]` を生成。
4. `AgentView` -> `agentSlice.importSkill(skillName: SkillName)` -> `window.electronAPI.skill.import(skillName)` を呼び出す。

## Main 境界

- `skillHandlers` の `skill:import` 受信引数は `SkillName`。
- 実行時は `typeof === "string" && trim() !== ""` を維持。

## 禁止事項

- `skill.id` をIPC import/remove引数として渡すこと。
- `as unknown as SkillName` による無差別キャストの常用。
