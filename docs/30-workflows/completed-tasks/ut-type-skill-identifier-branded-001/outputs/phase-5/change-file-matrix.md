# Phase 5 変更ファイル表

| ファイル                                                                     | 変更内容                                                  | 理由                                         |
| ---------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `packages/shared/src/types/skill.ts`                                         | Branded Type定義追加、主要Skill型へ適用                   | ID/Name 取り違えを型で検出するため           |
| `packages/shared/index.ts`                                                   | `SkillId`/`SkillName` と `toSkillId`/`toSkillName` を公開 | shared正本として再利用可能にするため         |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` | `SkillId[]`/`SkillName[]` シグネチャ適用                  | selectedIds と onImport の境界を固定するため |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                        | `handleImport(skillNames: SkillName[])` 化                | UI->Store引数契約を一致させるため            |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                       | `SkillId`/`SkillName` 型適用                              | Store境界でのID/Name文脈固定                 |
| `apps/desktop/src/preload/skill-api.ts`                                      | `import/remove` の引数型を `SkillName` 化                 | Renderer->Main IPC契約整合                   |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                 | `skill:import/remove` 引数を `SkillName` 化               | IPC受け口で型文脈を固定                      |
| `apps/desktop/src/main/services/skill/SkillParser.ts`                        | `toSkillId`/`toSkillName` 適用                            | Skill生成時点で型文脈を付与                  |
| `apps/desktop/src/main/services/skill/SkillService.ts`                       | ID/Nameシグネチャ型適用                                   | service層の境界整合                          |
