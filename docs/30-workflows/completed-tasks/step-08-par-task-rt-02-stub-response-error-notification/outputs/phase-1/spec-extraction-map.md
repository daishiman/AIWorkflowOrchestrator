# Phase 1: 要件抽出マップ

## AC と実装ポイントの対応

| AC   | 実装ポイント                                         | ファイル                                           | 行範囲                                     |
| ---- | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| AC-1 | `plan()` stub success → explicit error               | `RuntimeSkillCreatorFacade.ts`                     | L308-328                                   |
| AC-2 | execute 抑止（renderer 側）                          | `SkillLifecyclePanel.tsx`                          | L731-738, `SkillCreateWizard.tsx` L188-195 |
| AC-3 | `improve()` stub `{suggestions:[]}` → explicit error | `RuntimeSkillCreatorFacade.ts`                     | L560-567                                   |
| AC-4 | `error.code` + `error.message`                       | `skillCreator.ts` 新型定義                         |                                            |
| AC-5 | IPC outer=transport, inner=logical                   | `creatorHandlers.ts`                               | L141 (plan), L321 (improve)                |
| AC-6 | renderer error 表示 + 再試行導線                     | `SkillLifecyclePanel.tsx`, `SkillCreateWizard.tsx` |                                            |
| AC-7 | 正常系 / terminal handoff 非破壊                     | 全ファイル                                         |                                            |

## false-success 発火点

| メソッド    | 条件                                                                  | 現行動作                                      | 修正後                                    |
| ----------- | --------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| `plan()`    | `!llmAdapter \|\| (!resourceLoader && !hasDynamicResourcePipeline())` | stub `{planId, skillName:"", agents:[], ...}` | `RuntimeSkillCreatorPlanErrorResponse`    |
| `improve()` | 同上                                                                  | `{improveId, suggestions:[]}`                 | `RuntimeSkillCreatorImproveErrorResponse` |
| `execute()` | なし（degraded stub 不在）                                            | 変更なし（renderer 側で抑止）                 | 変更なし                                  |

## 責務整理

| 層          | 責務                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Facade      | reason code 決定、error union 返却                                                               |
| IPC handler | transport/validation error → `success:false`、logical error → `success:true, data:<error union>` |
| renderer    | logical error 検出、error 表示、execute CTA 無効化                                               |
