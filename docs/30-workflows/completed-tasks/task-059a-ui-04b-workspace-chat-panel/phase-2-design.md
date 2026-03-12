# Phase 2: 設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 2                          |
| Phase名    | 設計                       |
| カテゴリ   | UI実装                     |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 1                    |
| 後続Phase  | Phase 3                    |

## 目的

Phase 1 の要件を、コンポーネント構成、状態配置、IPC / conversation データフロー、interaction state、a11y、テスト入力へ変換する。

## 実行タスク

- コンポーネント設計: 04B の view 内構成とファイル配置を確定する
- 状態設計: local state、既存 store、既存 hook の責務境界を固定する
- データフロー設計: `file:read`、`llm.streamChat`、`conversationAPI` の実行順を固定する
- UI状態設計: zero state、loading、streaming、error、mention open、mobile の表示条件を固定する
- a11y 設計: role、keyboard、focus order、announcement を定義する

## 参照資料

| 参照資料         | パス                                                                                                | 説明           |
| ---------------- | --------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                                                        | Phase 1 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                                                            | Phase 1 成果物 |
| スコープ定義     | `outputs/phase-1/scope-definition.md`                                                               | Phase 1 成果物 |
| SubAgent責務表   | `outputs/phase-1/subagent-ownership.md`                                                             | Phase 1 成果物 |
| system spec 抽出 | `outputs/phase-1/aiworkflow-spec-extraction.md`                                                     | Phase 1 成果物 |
| 04A 設計         | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-2-design.md` | 04A の前提     |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                            | 内容                                           |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| 機能別 UI           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 04A との UI 境界                               |
| Panel 指針          | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`             | panel 統合と `aria-live`                       |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | global / local state 境界                      |
| Workspace Chat Edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`  | file context 契約                              |
| 会話履歴            | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | `conversationAPI` の request / response        |
| IPC セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | preload allowlist、subscribe 境界              |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | stream / conversation / file read error の分類 |

## 実行手順

### ステップ1: コンポーネント構成を固定する

| 種別     | ファイル                                                               | 責務                                     |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| organism | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | 04B 統合 root                            |
| organism | `WorkspaceChatMessageList.tsx`                                         | user / assistant / system message 表示   |
| molecule | `WorkspaceChatInput.tsx`                                               | textarea、send button、error surface     |
| molecule | `WorkspaceSuggestionBubbles.tsx`                                       | zero state bubble 3 件                   |
| molecule | `WorkspaceFileContextChips.tsx`                                        | 添付 chip 一覧と remove                  |
| molecule | `WorkspaceMentionDropdown.tsx`                                         | `@mention` 候補一覧                      |
| hook     | `useWorkspaceChatController.ts`                                        | send / stream / persistence / chip state |
| hook     | `useWorkspaceMentionQuery.ts`                                          | `@` クエリ解析と候補選択                 |

### ステップ2: 状態境界を固定する

| 状態                                                          | 保持場所                                             | 理由                                  |
| ------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| workspace 内 file tree / selected file path                   | `workspaceSlice`                                     | 04A で正本化済み                      |
| 添付済み file chip 一覧                                       | `fileSelectionSlice` を再利用                        | 04A からの共有導線                    |
| 入力テキスト / mention open / highlighted index / local error | `useWorkspaceChatController` の local state          | 04B 画面固有                          |
| 現在会話 ID / message list / assistant stream buffer          | `useWorkspaceChatController` 内部 state + 既存 hooks | cross-view 共有要件がない             |
| file context 取得ロジック                                     | `workspace-chat-edit` 既存 utility / hook を流用     | size / workspacePath 契約を再利用する |

### ステップ3: 送信データフローを固定する

| 手順 | 処理                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 1    | 未入力なら送信を中止する                                                       |
| 2    | `currentConversationId` が無い場合は `conversation:create` を実行する          |
| 3    | user message を `conversation:addMessage` で保存する                           |
| 4    | base prompt + file contexts + user input から LLM request を構築する           |
| 5    | `window.electronAPI.llm.streamChat` を開始し、chunk を local buffer に追記する |
| 6    | stream end 後に assistant content を `conversation:addMessage` で保存する      |
| 7    | error 発生時は local error state を更新し、未保存 assistant message を破棄する |

### ステップ4: UI状態マトリクスを固定する

| 状態          | 表示条件                          | 必須表示                                                |
| ------------- | --------------------------------- | ------------------------------------------------------- |
| zero state    | message 0 件、入力フォーカス前    | bubble 3 件、主役 input、補助説明                       |
| file attached | chip 1 件以上                     | chip list、`+N件` 集約                                  |
| mention open  | 入力内 cursor 前方に `@query`     | dropdown、active row、keyboard hint                     |
| streaming     | stream 開始後、end 前             | assistant typing row、cancel 導線、send disabled        |
| error         | file / stream / conversation 失敗 | inline error surface、retry 文言                        |
| compact       | mobile / narrow width             | chips wrap、message area 優先、dropdown max height 制限 |

### ステップ5: a11y と keyboard を固定する

| 対象              | 契約                                                   |
| ----------------- | ------------------------------------------------------ |
| message area      | `role="log"`、`aria-live="polite"` を付与する          |
| stream status     | `role="status"` を付与する                             |
| suggestion bubble | button とし、Enter / Space で入力欄へ反映する          |
| mention dropdown  | `role="listbox"` / `role="option"`、矢印キーで移動する |
| chip remove       | `aria-label="ファイル背景情報を削除"` を付与する       |

## 統合テスト連携

| 観点       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| controller | send / stream / save の順序を integration test で固定する         |
| mention    | query、selection、preview 導線を integration test で固定する      |
| responsive | compact 状態の UI 分岐を component test と manual test に接続する |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                                 | 仕様参照先                                                                      |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| UI/UX              | zero / mention / streaming / compact の状態行列を設計する             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` |
| アーキテクチャ     | controller / view / hook / shared utility の依存方向を固定する        | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`      |
| API設計            | `conversationAPI` / `llm.streamChat` / `file:read` の呼び順を固定する | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  |
| エラーハンドリング | retryable / non-retryable を UI state にどう反映するか固定する        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           |

## 成果物

| 成果物                  | パス                                          | 説明                                       |
| ----------------------- | --------------------------------------------- | ------------------------------------------ |
| アーキテクチャ設計      | `outputs/phase-2/architecture-design.md`      | 04B 全体構造                               |
| コンポーネント設計      | `outputs/phase-2/component-design.md`         | ファイル構成と責務                         |
| 状態 / データフロー設計 | `outputs/phase-2/state-dataflow-design.md`    | store / local / conversation / stream 境界 |
| IPC / conversation 設計 | `outputs/phase-2/ipc-conversation-design.md`  | API 呼び出し順序                           |
| UI 状態マトリクス       | `outputs/phase-2/interaction-state-matrix.md` | zero / mention / error / mobile            |

## 完了条件

- [x] 04B のファイル配置とコンポーネント責務を定義している
- [x] state 境界と再利用対象を定義している
- [x] `file:read` / `llm.streamChat` / `conversationAPI` の順序を定義している
- [x] UI 状態マトリクスと a11y 契約を定義している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. コンポーネント配置の定義
2. state / dataflow 境界の定義
3. IPC / conversation 順序の定義
4. UI 状態と a11y 契約の定義
5. 成果物と完了条件の確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-2/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 3: 設計レビューゲート](./phase-3-design-review.md)
