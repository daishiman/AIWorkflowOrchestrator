# Phase 1 要件定義

## 目的

- 通常会話、Workspace 会話、Skill Lifecycle 会話を 1 つの会話基盤で扱う。
- Task03 が独自 chat 実装を増やさず、この基盤を利用できる public contract を先に固定する。

## スコープ

- 対象: `chatSlice`、`useStreamingChat`、`ChatView`、`WorkspaceView`、`SkillCenterView`、永続化 selector。
- 非対象: ChatHistoryView の REST 履歴統合、Task03 固有 UI 実装、PR 作成。

## 機能要件

- FR-01: mode は `general` / `workspace` / `skill-lifecycle` の 3 種を保持する。
- FR-02: session は mode ごとに再利用でき、recent session rail で復帰できる。
- FR-03: streaming は送信、partial update、abort、retry、error を共通契約で扱う。
- FR-04: Workspace から選択ファイルと workspacePath を会話 context に handoff できる。
- FR-05: Skill Center から lifecycle job と handoffLabel を会話 context に handoff できる。
- FR-06: chat state は persist 復元時に Date を revive し、active session を再構築できる。

## 非機能要件

- NFR-01: mode 差分は adapter/context に閉じ込め、streaming 本体は共通化する。
- NFR-02: renderer で internal planner/subagent 都合を UI/Prompt に漏らさない。
- NFR-03: light theme でも会話 UI が読めるコントラストを保つ。
- NFR-04: 既存 App shell / navigation contract を壊さない。

## 受入基準対応

| AC   | 要件化内容                                   | 実装結果                                         |
| ---- | -------------------------------------------- | ------------------------------------------------ |
| AC-1 | 3 mode を共通 session model で表現           | `ChatMode` / `ChatSessionRecord` で達成          |
| AC-2 | stream/history/abort/retry/context 注入契約  | `chatSlice` に集約                               |
| AC-3 | `chatSlice` と `useStreamingChat` の責務整理 | hook を facade 化                                |
| AC-4 | Workspace 文脈と永続化の整合                 | persist revive + context merge で達成            |
| AC-5 | Task03 用の skill-lifecycle contract         | `activateChatMode("skill-lifecycle")` 契約で固定 |

## 並列ワークストリーム

- Domain/State: session model、streaming state、persist。
- Surface/Handoff: Chat、Workspace、Skill Center。
- Quality: unit/view test、typecheck/build、Phase 11 screenshot。

## 決定

- `useStreamingChat` は新しい stream state を包む薄い facade とする。
- Workspace/Skill Center は chat UI を埋め込まず、共通 ChatView へ handoff する。
