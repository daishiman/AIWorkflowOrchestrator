# Skill Creator IPC チャネル一覧

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 1 - 要件定義

## チャネル一覧（全16チャネル）

| #   | チャネル名                      | 定数名                        | 登録先ファイル          | 種別   | 用途             |
| --- | ------------------------------- | ----------------------------- | ----------------------- | ------ | ---------------- |
| 1   | `skill-creator:detect-mode`     | SKILL_CREATOR_DETECT_MODE     | skillCreatorHandlers.ts | invoke | モード検出       |
| 2   | `skill-creator:create`          | SKILL_CREATOR_CREATE          | skillCreatorHandlers.ts | invoke | スキル作成       |
| 3   | `skill-creator:execute-tasks`   | SKILL_CREATOR_EXECUTE_TASKS   | skillCreatorHandlers.ts | invoke | タスク実行       |
| 4   | `skill-creator:validate`        | SKILL_CREATOR_VALIDATE        | skillCreatorHandlers.ts | invoke | スキル検証       |
| 5   | `skill-creator:validate-schema` | SKILL_CREATOR_VALIDATE_SCHEMA | skillCreatorHandlers.ts | invoke | スキーマ検証     |
| 6   | `skill-creator:improve`         | SKILL_CREATOR_IMPROVE         | skillCreatorHandlers.ts | invoke | スキル改善       |
| 7   | `skill-creator:fork`            | SKILL_CREATOR_FORK            | skillCreatorHandlers.ts | invoke | フォーク         |
| 8   | `skill-creator:share`           | SKILL_CREATOR_SHARE           | skillCreatorHandlers.ts | invoke | 共有             |
| 9   | `skill-creator:schedule`        | SKILL_CREATOR_SCHEDULE        | skillCreatorHandlers.ts | invoke | スケジュール     |
| 10  | `skill-creator:debug`           | SKILL_CREATOR_DEBUG           | skillCreatorHandlers.ts | invoke | デバッグ         |
| 11  | `skill-creator:generate-docs`   | SKILL_CREATOR_GENERATE_DOCS   | skillCreatorHandlers.ts | invoke | ドキュメント生成 |
| 12  | `skill-creator:stats`           | SKILL_CREATOR_STATS           | skillCreatorHandlers.ts | invoke | 統計取得         |
| 13  | `skill-creator:plan`            | SKILL_CREATOR_PLAN            | creatorHandlers.ts      | invoke | Runtime plan     |
| 14  | `skill-creator:execute-plan`    | SKILL_CREATOR_EXECUTE_PLAN    | creatorHandlers.ts      | invoke | Runtime execute  |
| 15  | `skill-creator:improve-skill`   | SKILL_CREATOR_IMPROVE_SKILL   | creatorHandlers.ts      | invoke | Runtime improve  |
| 16  | `skill-creator:progress`        | SKILL_CREATOR_PROGRESS        | skillCreatorHandlers.ts | on     | 進捗通知         |

## namespace 統一状況

- 全16チャネルが `skill-creator:` prefix に統一済み
- 旧 `creator:*` namespace（P65 dead-end）は完全除去済み

## 登録先ファイル別集計

| ファイル                | チャネル数 | 責務                                         |
| ----------------------- | ---------- | -------------------------------------------- |
| skillCreatorHandlers.ts | 13         | 既存 Skill Creator 操作 + 進捗通知           |
| creatorHandlers.ts      | 3          | Runtime Skill Creator (plan/execute/improve) |
