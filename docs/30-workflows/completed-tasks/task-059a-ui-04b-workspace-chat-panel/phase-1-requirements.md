# Phase 1: 要件定義

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| カテゴリ   | UI実装                     |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | なし                       |
| 後続Phase  | Phase 2                    |

## 目的

元タスク仕様、04A の完成状態、既存 chat / file context / conversation / streaming 資産を突き合わせ、04B の実装境界と受け入れ基準を確定する。

## 実行タスク

- 要件抽出: 画面要件、データ要件、操作要件、非機能要件を整理する
- 境界定義: 04A、04B、04C、既存 `workspace-chat-edit`、既存 `ChatPanel` の責務境界を確定する
- 受け入れ基準作成: UI、state、IPC、a11y、manual test の検証条件を明文化する
- SubAgent 役割定義: Phase 4 以降の並列実行単位を確定する

## 参照資料

| 参照資料          | パス                                                                                                                                 | 説明                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 元タスク仕様      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md` | 04B の原要求                     |
| 先行 workflow     | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`                                                   | 04A の正本 workflow              |
| 現状 view         | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                                                            | placeholder chat と 04A 実装状態 |
| 既存 chat         | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                                            | 既存 ChatPanel の再利用境界確認  |
| file context hook | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts`                                                     | file context 既存ロジック        |
| streaming hook    | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                                                | stream 契約確認                  |
| message hook      | `apps/desktop/src/renderer/hooks/useMessages.ts`                                                                                     | message 永続化確認               |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                              | 内容                                 |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| 機能別 UI           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Workspace / feature component の正本 |
| Panel 指針          | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`               | panel 統合と a11y                    |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | store 境界と個別セレクタ規約         |
| LLM 統合            | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM / streaming の入口               |
| Workspace Chat Edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | file context と main 契約            |
| 会話履歴            | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`    | `conversationAPI` 契約               |
| IPC セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | preload allowlist と sender 境界     |
| テスト指針          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | renderer test パターン               |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時の error surface と retry 判断 |

## 実行手順

### ステップ1: 現状資産の P50 判定

| 観点                | 現状                                                             | 判定           |
| ------------------- | ---------------------------------------------------------------- | -------------- |
| `WorkspaceView`     | placeholder chat と attach ボタンが存在                          | 既存資産あり   |
| file context        | `workspace-chat-edit` に既存 hook / store / component がある     | 再利用候補あり |
| conversation 永続化 | preload / hooks が存在                                           | 再利用候補あり |
| streaming           | preload / hook が存在                                            | 再利用候補あり |
| 04B 専用 UI         | zero state、mention picker、workspace 向け message list が未実装 | 新規実装       |

04B は blank slate ではない。Phase 2 以降は「既存資産の再利用優先」を原則に進める。

### ステップ2: 機能要件の確定

| ID    | 要件                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------- |
| FR-01 | 初期表示で suggestion bubble 3 件と主役入力欄を表示する                                            |
| FR-02 | ワークスペースで選択したファイルを background context に追加できる                                 |
| FR-03 | file context chip を入力欄上部に表示し、個別削除できる                                             |
| FR-04 | 送信時に `conversation:create` と `conversation:addMessage` を用いて会話を永続化する               |
| FR-05 | assistant 応答は `llm.streamChat` の chunk を逐次表示し、完了後に assistant message として保存する |
| FR-06 | 入力中の `@` で workspace 内ファイル候補を表示し、矢印キーと Enter / Tab で選択できる              |
| FR-07 | mention 選択で file context に追加し、preview 側に連携できる導線を持つ                             |
| FR-08 | stream error / file read error / conversation error を入力付近に明示表示する                       |

### ステップ3: 非機能要件の確定

| ID     | 要件                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| NFR-01 | `workspaceSlice` / `fileSelectionSlice` を再利用し、4B 専用の新規グローバル slice を作らない |
| NFR-02 | 送信ボタン、chip remove、mention dropdown、message feed は keyboard 操作可能とする           |
| NFR-03 | light / dark 両テーマで contrast ratio と focus visibility を維持する                        |
| NFR-04 | preload API 以外から FS / IPC へ直接アクセスしない                                           |
| NFR-05 | 04A の layout / resize / watcher 契約を変更しない                                            |

### ステップ4: スコープ境界の確定

| 含む                                                                 | 含まない                               |
| -------------------------------------------------------------------- | -------------------------------------- |
| Workspace 用 ChatPanel と関連 hook / component                       | 04C の preview / quick search 本体実装 |
| file context chip、suggestion bubble、message list、mention dropdown | main process の LLM adapter 実装変更   |
| `conversationAPI` / `llm` / `file:read` を用いた接続                 | 新規 DB schema 追加                    |
| renderer test、manual screenshot plan、Phase 12 spec 同期            | 既存汎用 ChatView の全面置換           |

## 統合テスト連携

| 観点     | 内容                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| API 接続 | `file:read`、`conversation:create/addMessage/get`、`llm.streamChat` を Phase 4 以降で固定する |
| 状態連携 | `workspaceSlice` と `fileSelectionSlice` の state 反映を Phase 4 以降で固定する               |
| 画面連携 | 04A の layout shell と 04B の chat 本体の接続を Phase 4 以降で固定する                        |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                          | 仕様参照先                                                                     |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| UI/UX              | `Tap & Discover` 体験、主役入力欄、bubble 初期導線を要件化する | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |
| アーキテクチャ     | 04A / 04B / 04C / shared utility の責務境界を固定する          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   |
| エラーハンドリング | file / stream / conversation の失敗面を要件として定義する      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          |
| アクセシビリティ   | keyboard と screen reader 要件を先に固定する                   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   |

## 成果物

| 成果物           | パス                                            | 説明                       |
| ---------------- | ----------------------------------------------- | -------------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`    | FR / NFR / dependency 整理 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`        | AC 一覧                    |
| スコープ定義     | `outputs/phase-1/scope-definition.md`           | 含む / 含まない / 並列条件 |
| SubAgent責務表   | `outputs/phase-1/subagent-ownership.md`         | 関心分離と担当 Phase       |
| system spec 抽出 | `outputs/phase-1/aiworkflow-spec-extraction.md` | 正本仕様引用の抜粋         |

## 完了条件

- [x] FR-01 から FR-08 を文章化している
- [x] NFR-01 から NFR-05 を文章化している
- [x] 04A / 04B / 04C / 既存資産の責務境界を定義している
- [x] 受け入れ基準と SubAgent 分担を定義している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 元タスクと 04A / 既存資産の読み込み
2. FR / NFR / 受け入れ基準の定義
3. 境界定義と並列条件の整理
4. system spec 抽出の整理
5. 成果物と完了条件の確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-1/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 2: 設計](./phase-2-design.md)
