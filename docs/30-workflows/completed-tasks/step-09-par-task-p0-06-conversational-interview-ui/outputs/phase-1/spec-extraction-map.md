# Spec Extraction Map — TASK-P0-06

## System Spec → Code Anchor 対応表

| AC    | System Spec 要件                | Code Anchor                                                     | 状態                |
| ----- | ------------------------------- | --------------------------------------------------------------- | ------------------- |
| AC-1  | チャット風 UI で会話フロー動作  | `SkillLifecyclePanel.tsx` question-host セクション (L1322-1415) | 刷新対象            |
| AC-2  | 全 UserInputKind 対応           | `skillCreator.ts` L409-413 — `SkillCreatorUserInputKind`        | multi_select 未定義 |
| AC-3  | 進捗インジケーター              | 未実装                                                          | 新規                |
| AC-4  | undo/back 操作                  | 未実装                                                          | 新規                |
| AC-5  | 熟練度適応                      | 未実装                                                          | 新規                |
| AC-6  | 一時状態保持                    | `sessionEntries` (L419-427) — ローカル state                    | 拡張対象            |
| AC-7  | SkillCreatorWorkflowEngine 連携 | `handleSubmitWorkflowInput` (L598-639) + IPC                    | 維持                |
| AC-8  | single_select ラジオ/チップ     | `SkillLifecyclePanel.tsx` L1337-1356                            | 刷新対象            |
| AC-9  | multi_select チェックボックス   | 未実装                                                          | 新規                |
| AC-10 | confirm Yes/No CTA              | `SkillLifecyclePanel.tsx` L1378-1395                            | 刷新対象            |
| AC-11 | free_text インライン入力        | `SkillLifecyclePanel.tsx` L1358-1366                            | 刷新対象            |
| AC-12 | secret マスク入力 + 表示切替    | `SkillLifecyclePanel.tsx` L1368-1376 — 切替なし                 | 拡張対象            |
| AC-13 | キーボード + マウス操作         | 部分的（click のみ、keyboard 未対応）                           | 拡張対象            |

## IPC Boundary

| レイヤー | ファイル                        | 責務                      |
| -------- | ------------------------------- | ------------------------- |
| Renderer | `SkillLifecyclePanel.tsx`       | 表示・入力・一時状態保持  |
| Preload  | `skill-creator-api.ts`          | IPC surface (safeInvoke)  |
| Main     | `RuntimeSkillCreatorFacade.ts`  | オーケストレーション      |
| Main     | `SkillCreatorWorkflowEngine.ts` | 質問生成・フロー制御      |
| Shared   | `skillCreator.ts`               | 型定義 (UserInputKind 等) |
