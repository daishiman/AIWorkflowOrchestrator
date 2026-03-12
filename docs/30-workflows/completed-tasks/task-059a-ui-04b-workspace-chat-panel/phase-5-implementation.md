# Phase 5: 実装

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 5                          |
| Phase名    | 実装                       |
| カテゴリ   | TDD-Green                  |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 4                    |
| 後続Phase  | Phase 6                    |

## 目的

Phase 4 のテストを通す最小実装として、WorkspaceView の placeholder を 04B 本体へ置き換え、conversation / streaming / file context / mention を結線する。

## 実行タスク

- UI 実装: `WorkspaceChatPanel` と子コンポーネントを追加する
- 接続実装: `conversationAPI`、`llm.streamChat`、`file:read` を controller に接続する
- 04A 統合: `WorkspaceView` の仮置き chat 領域を差し替える
- preview / mention 連携: mention 選択から preview 側導線を接続する

## 参照資料

| 参照資料                | パス                                         | 説明           |
| ----------------------- | -------------------------------------------- | -------------- |
| テスト仕様書            | `outputs/phase-4/test-specification.md`      | Phase 4 成果物 |
| テストケース一覧        | `outputs/phase-4/test-cases.md`              | Phase 4 成果物 |
| 統合テスト設計          | `outputs/phase-4/integration-test-design.md` | Phase 4 成果物 |
| コンポーネント設計      | `outputs/phase-2/component-design.md`        | Phase 2 成果物 |
| IPC / conversation 設計 | `outputs/phase-2/ipc-conversation-design.md` | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                           | 内容                              |
| ------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| state management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state ownership 正本              |
| workspace chat edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | file context / workspacePath 契約 |
| chat history        | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | conversation 契約                 |
| security            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | preload / sender 正本             |

## 実行手順

### ステップ1: 変更ファイル群を確定する

| 種別 | 想定ファイル                                              |
| ---- | --------------------------------------------------------- |
| 追加 | `views/WorkspaceView/WorkspaceChatPanel.tsx`              |
| 追加 | `views/WorkspaceView/WorkspaceChatInput.tsx`              |
| 追加 | `views/WorkspaceView/WorkspaceChatMessageList.tsx`        |
| 追加 | `views/WorkspaceView/WorkspaceSuggestionBubbles.tsx`      |
| 追加 | `views/WorkspaceView/WorkspaceFileContextChips.tsx`       |
| 追加 | `views/WorkspaceView/WorkspaceMentionDropdown.tsx`        |
| 追加 | `views/WorkspaceView/hooks/useWorkspaceChatController.ts` |
| 追加 | `views/WorkspaceView/hooks/useWorkspaceMentionQuery.ts`   |
| 修正 | `views/WorkspaceView/index.tsx`                           |

### ステップ2: 接続順序を実装する

1. `workspaceSlice` から selected file 情報を取得する
2. `fileSelectionSlice` に chip データを同期する
3. 送信時に conversation を確保する
4. user message を保存する
5. streaming を開始する
6. end 時に assistant message を保存する

### ステップ3: UI を実装する

| UI 要素    | 実装内容                                                 |
| ---------- | -------------------------------------------------------- |
| input      | accent border、44px send button、disabled / sending 反映 |
| zero state | suggestion bubble 3 件、input への即時反映               |
| chip       | remove、`+N件`、補助説明                                 |
| mention    | fuzzy 候補、keyboard、preview 導線                       |
| message    | user / assistant row、streaming row、error row           |

## 統合テスト連携

| 観点        | 内容                                                        |
| ----------- | ----------------------------------------------------------- |
| component   | Phase 4 の UI ケースを Green にする                         |
| integration | conversation / stream / file context の順序を Green にする  |
| regression  | 04A layout shell を壊していないことを smoke test で確認する |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                        | 仕様参照先                                                                      |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| UI/UX              | 主役 input、bubble、chip、message の visual hierarchy を守る | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  |
| アーキテクチャ     | placeholder 置換が 04A / 04C 境界を壊さないか確認する        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` |
| セキュリティ       | preload 公開 API のみを使っているか確認する                  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    |
| エラーハンドリング | retryable / non-retryable 表示を UI へ反映する               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           |

## 成果物

| 成果物           | パス                                        | 説明                      |
| ---------------- | ------------------------------------------- | ------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装方針と完了項目        |
| 変更ファイル計画 | `outputs/phase-5/changed-file-plan.md`      | 変更対象一覧              |
| 仕様同期候補     | `outputs/phase-5/spec-update-targets.md`    | Phase 12 で触る spec 候補 |

## 完了条件

- [x] placeholder chat を 04B 本体に差し替える計画を定義している
- [x] conversation / stream / file context の接続手順を定義している
- [x] mention と preview 導線を定義している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. UI 実装
2. controller / hook 実装
3. conversation / streaming / file context 接続
4. 04A 統合確認
5. 成果物と完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-5/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
