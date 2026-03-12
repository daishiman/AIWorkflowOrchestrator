# Phase 2: 設計

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 2                                                      |
| Phase名    | 設計                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                |
| タスク名   | 会話基盤・セッション統合                               |
| 機能名     | chat-platform-unification                              |
| 前提Phase  | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 後続Phase  | [phase-3-design-review.md](./phase-3-design-review.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-11                                             |

## 目的

共通チャットセッション、ストリーミング制御、履歴永続化、文脈注入、UI mode 切替の設計を確定する。

## 設計方針

- UI は mode 差分、基盤は共有とする
- `chatSlice` と `useStreamingChat` は統合または役割再配置する
- 会話 ID、メッセージ永続化、ストリーム制御は一貫したセッションモデルに統合する
- 文脈注入は mode ごとの adapter で吸収する
- Task03 が別基盤を持たずに `skill-lifecycle` mode を再利用できる境界を優先する

## SubAgent Team 編成

| 役割       | 担当           | 責務                                               |
| ---------- | -------------- | -------------------------------------------------- |
| Lead       | Design Lead    | 設計全体整合、採用案決定                           |
| SubAgent-A | Domain Agent   | session / message / stream entity の設計           |
| SubAgent-B | Adapter Agent  | general / workspace / skill-lifecycle adapter 設計 |
| SubAgent-C | State Agent    | store / hook / persistence の責務分離              |
| SubAgent-D | Contract Agent | Task03 再利用 API と forbidden boundary の設計     |

## 実行タスク

- ドメインモデル設計: 共通チャットドメインモデルを設計する
- mode 遷移設計: `general | workspace | skill-lifecycle` の状態遷移を設計する
- 責務分離設計: ストリーミングと履歴永続化の責務分離を設計する
- 文脈注入設計: Workspace 文脈注入と通常会話の prompt 境界を設計する
- Task03 契約設計: `skill-lifecycle` mode の再利用契約を設計する
- 仕様抽出設計: aiworkflow-requirements から読む順序と検索語を再利用可能な形で定義する

## 参照資料

| 参照資料           | パス                                                                                                               | 内容                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 要件       | `outputs/phase-1/requirements-definition.md`                                                                       | 共通要件                   |
| Phase 1 mode差分表 | `outputs/phase-1/mode-difference-table.md`                                                                         | 3 mode 比較                |
| Task01 設計        | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md`                      | 一次導線と画面責務         |
| Task01 抽出マップ  | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/spec-extraction-map.md` | 仕様抽出順序               |
| 現行 hook          | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                              | hook 再利用可能性          |
| 現行 slice         | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                              | 状態統合方針               |
| ChatView           | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                               | message list / entry UI    |
| WorkspaceView      | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                                          | workspace mode UI anchor   |
| Task03 設計要求    | `../step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md`                               | 後続タスクが必要とする契約 |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容                                  |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| interfaces-llm            | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`            | LLM 呼び出し契約                      |
| llm-ipc-types             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`             | request / response / conversationId   |
| llm-streaming             | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`             | stream lifecycle                      |
| interfaces-chat-history   | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | session / message persistence         |
| architecture-chat-history | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | history architecture                  |
| api-chat-history          | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | session / message use case            |
| llm-workspace-chat-edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`   | workspace context adapter             |
| api-ipc-agent             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`             | Agent IPC との境界                    |
| arch-state-management     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | store 責務分離                        |
| ui-ux-feature-components  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`  | Workspace / Agent / Skill Center 連携 |
| ui-ux-navigation          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`          | Task01 導線との接合位置               |
| interfaces-agent-sdk-ui   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`   | Task03 handoff UI                     |
| ui-ux-agent-execution     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`     | execution surface / streaming UX      |

## 実行手順

1. Phase 1 成果物から共通要件・mode差分・Task03 依存契約を入力として固定する。
2. SubAgent-A/B/C/D が domain / adapter / state / contract を並列設計する。
3. Lead が 4 案を統合し、`session` `stream` `history` `context adapter` の責務境界を 1 枚の設計へまとめる。
4. `ChatView` `WorkspaceView` `skill-lifecycle` の UI mode と、共通基盤の API / state / persistence を分離定義する。
5. aiworkflow-requirements の読む順番と検索語を `spec-extraction-map.md` に固定し、broad query (`session` `history`) を避ける。

## 統合テスト連携

| 観点            | 連携内容                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| domain 契約     | session / message / streaming event を contract test 対象にする          |
| adapter 契約    | workspace 文脈注入と skill-lifecycle mode 差分を統合テスト条件にする     |
| state ownership | store / hook / local state の責務分離を selector テストへ引き継ぐ        |
| Task03 再利用   | `skill-lifecycle` mode の public contract を Task03 契約テストへ引き継ぐ |

## 多角的チェック観点

| 観点           | 適用内容                                                     |
| -------------- | ------------------------------------------------------------ |
| アーキテクチャ | shared domain と mode adapter の依存方向                     |
| API/IPC契約    | stream / history / context の API が Task03 から再利用可能か |
| UI/UX          | UI から見える差分が mode のみで、基盤差分が露出しないこと    |
| データ整合性   | session / message / partial response の永続化一貫性          |
| テスタビリティ | domain / adapter / store / IPC が独立検証できること          |

## 成果物

| 成果物                          | パス                                                 | 説明                             |
| ------------------------------- | ---------------------------------------------------- | -------------------------------- |
| 共通チャットドメインモデル      | `outputs/phase-2/common-chat-domain-model.md`        | session / message / event 定義   |
| mode 遷移設計                   | `outputs/phase-2/mode-state-transition.md`           | 3 mode の開始 / 中断 / 完了      |
| session / stream / history 境界 | `outputs/phase-2/session-stream-history-boundary.md` | 責務分離                         |
| context adapter 設計            | `outputs/phase-2/context-adapter-design.md`          | workspace / skill-lifecycle 差分 |
| 仕様抽出マップ                  | `outputs/phase-2/spec-extraction-map.md`             | 読む順番と検索語                 |

## 完了条件

- [x] mode 差分が明確
- [x] セッション契約が 1 つに定義されている
- [x] stream / history / adapter の責務境界が定義されている
- [x] Task03 から再利用可能な `skill-lifecycle` mode 契約がある
- [x] aiworkflow-requirements の抽出順序が再利用可能な形で記録されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-1-requirements.md](./phase-1-requirements.md)
- 後続: [phase-3-design-review.md](./phase-3-design-review.md)

## サブタスク管理

- [x] 参照資料確認
- [x] Domain Agent 設計
- [x] Adapter Agent 設計
- [x] State Agent 設計
- [x] Contract Agent 設計
- [x] Lead 統合
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] Task03 が参照する public contract が成果物に含まれている
- [x] current branch の Task01 導線制約が設計へ反映されている

## 次のPhase

Phase 3: [phase-3-design-review.md](./phase-3-design-review.md)
