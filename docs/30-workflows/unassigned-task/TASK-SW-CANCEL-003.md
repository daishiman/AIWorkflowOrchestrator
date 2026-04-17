# TASK-SW-CANCEL-003: skill-creator-cancel-main-handler

## メタ情報

| 項目     | 値                                                       |
| -------- | -------------------------------------------------------- |
| タスクID | TASK-SW-CANCEL-003                                       |
| タスク名 | skill-creator-cancel-main-handler                        |
| 検出元   | TASK-SW-CANCEL-001 Phase 12 未タスク検出                 |
| 優先度   | HIGH                                                     |
| 影響     | cancel invoke を受けても Main プロセスの処理が止まらない |
| 検出日   | 2026-04-15                                               |

## 概要

Preload 層から `skill-creator:cancel` IPC が invoke されても、Main プロセス側にハンドラーが存在しないため LLM 処理が継続し続ける。`SkillCreatorService` に `AbortController` 管理とキャンセルメソッドを追加し、`skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` チャンネルのハンドラーを登録する必要がある。

## 依存関係

| 種別       | タスクID           | 状態   |
| ---------- | ------------------ | ------ |
| 依存タスク | TASK-SW-CANCEL-002 | 未着手 |
| 後続タスク | TASK-SW-CANCEL-004 | 未着手 |

## 詳細仕様書

`docs/30-workflows/skill-create-flow-gaps/p03-seq-CANCEL-003/index.md`

## 対象ファイル

| ファイルパス                                                  | 変更内容                                              |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | currentAbortController・cancelCurrentOperation() 追加 |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | SKILL_CREATOR_CANCEL ハンドラー追加                   |

## 完了条件

- [ ] `SkillCreatorService` に `private currentAbortController: AbortController | null = null` プロパティが存在する
- [ ] `cancelCurrentOperation()` が `currentAbortController?.abort()` を呼び出し、フラグをリセットする
- [ ] `skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` チャンネルの `ipcMain.handle()` が登録されている
- [ ] `unregisterSkillCreatorHandlers()` に `SKILL_CREATOR_CANCEL` の `ipcMain.removeHandler()` が追加されている
- [ ] `pnpm typecheck` が PASS する

## 関連

- 依存タスク: TASK-SW-CANCEL-002
- 後続タスク: TASK-SW-CANCEL-004
- 対象ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`, `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
