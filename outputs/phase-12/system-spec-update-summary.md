# Phase 12 成果物: システム仕様更新サマリー

## タスクID: TASK-SW-STREAM-001

## 1. 更新対象

| 項目                              | 更新内容                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `SkillCreatorService.createSkill` | `createSkill(options, onProgress?)` に変更                                    |
| progress 契約                     | `SkillCreatorProgressData` を導入                                             |
| progress 段階                     | `planning` / `generating-skill` / `generating-agents` / `validating` / `done` |
| 例外挙動                          | `onProgress` の例外は伝播する                                                 |
| 既存呼び出し                      | `onProgress` 省略時も従来通り成功する                                         |

## 2. 正規フロー

```text
createSkill(options, onProgress?)
  -> planning
  -> run*Workflow
  -> generating-skill
  -> generating-agents
  -> validating
  -> done
```

## 3. 仕様上の注意

- `SkillCreatorProgressData` は現状 `SkillCreatorService.ts` の local 型。
- `onProgress` を try/catch で包んでいないため、コールバックの失敗は呼び出し元に見える。
- `SkillCreatorService` は main process 内部 API なので、renderer 側の変更はこのタスクでは不要。

## 4. TASK-SW-STREAM-002 との境界

- 本タスクは「callback を出す」まで。
- 次タスクは `skillCreatorHandlers.ts` で callback を受け取り IPC に流す。
- `sendSkillCreatorProgress(mainWindow, progress)` との接続は次タスクで実施。

## 5. 影響ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`
