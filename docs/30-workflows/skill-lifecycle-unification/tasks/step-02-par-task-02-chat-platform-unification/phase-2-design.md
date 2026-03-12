# Phase 2: 設計 - タスク仕様書

## 目的

共通チャットセッション、ストリーミング制御、履歴永続化、文脈注入、UI モード切替の設計を確定する。

## 実行タスク

1. 共通チャットドメインモデルを設計する
2. `mode = general | workspace | skill-lifecycle` の状態遷移を設計する
3. ストリーミングと履歴永続化の責務分離を設計する
4. Workspace 文脈注入と通常会話の prompt 境界を設計する
5. Task03 が再利用する `skill-lifecycle` モードの契約を設計する

## 設計方針

- UI はモード差分、基盤は共有とする
- `chatSlice` と `useStreamingChat` は統合または役割再配置する
- 会話 ID、メッセージ永続化、ストリーム制御は一貫したセッションモデルに統合する
- 文脈注入は mode ごとの adapter で吸収する

## 参照資料

| 参照資料    | パス                                                                                          | 説明               |
| ----------- | --------------------------------------------------------------------------------------------- | ------------------ |
| Task01 設計 | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md` | 一次導線と画面責務 |
| 現行 hook   | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                         | hook 再利用可能性  |
| 現行 slice  | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                         | 状態統合方針       |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                         | 内容               |
| --------------------- | ---------------------------------------------------------------------------- | ------------------ |
| interfaces-llm        | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | LLM 呼び出し契約   |
| api-ipc-agent         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | Agent IPC との境界 |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | store 責務分離     |

## 成果物

- `共通チャットドメインモデル`
- `モード遷移設計`
- `セッション/ストリーム/履歴責務分離設計`

## 完了条件

- [ ] mode 差分が明確
- [ ] セッション契約が 1 つに定義されている
- [ ] Task03 から再利用可能な `skill-lifecycle` モード契約がある
