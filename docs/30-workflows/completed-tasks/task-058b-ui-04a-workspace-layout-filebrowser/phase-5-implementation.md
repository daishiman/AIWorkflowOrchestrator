# Phase 5: 実装

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 5                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

Phase 4 の Red を Green へ進める最小実装を行い、stub の `WorkspaceView` を 04A 基盤へ差し替える。

## 実行タスク

- View実装: `WorkspaceView` を 4 モード対応の shell に置き換える
- Component実装: 04A 対象 component を追加する
- Hook実装: layout、resize、watcher、context menu の hook を追加する
- Store接続: `workspaceSlice` と `fileSelectionSlice` の個別セレクタ接続を行う
- IPC接続: `workspace:*` と `file:*` の既存チャネルを呼び出す

## 参照資料

| 資料名       | パス                                                                                                 | 説明              |
| ------------ | ---------------------------------------------------------------------------------------------------- | ----------------- |
| Phase 4      | `phase-4-test-creation.md`                                                                           | Red テスト        |
| Phase 2      | `phase-2-design.md`                                                                                  | 実装設計          |
| Phase 1      | `phase-1-requirements.md`                                                                            | 受け入れ基準      |
| 元タスク仕様 | `../skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md` | 実装対象一覧      |
| UI機能仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                      | UI パターン       |
| 状態管理仕様 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                         | selector パターン |

## 実行手順

### ステップ1: 実装順序

1. `WorkspaceView` に local state と selector 接続を入れる
2. `useWorkspaceLayout` と `PanelToggleBar` を実装する
3. `FileBrowserPanel`、`FileTreeNode`、`WorkspaceStatusBar` を実装する
4. `usePanelResize` と `PanelResizeHandle` を 3-pane のみ有効で実装する
5. `useFileWatcher` を P5 ガード付きで実装する

### ステップ2: 変更対象ファイル

| 区分 | パス                                                                        |
| ---- | --------------------------------------------------------------------------- |
| 更新 | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                   |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceShell.tsx`          |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/FileBrowserPanel.tsx`        |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/FileTreeNode.tsx`            |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/FileContextMenu.tsx`         |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/PanelToggleBar.tsx`          |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/PanelResizeHandle.tsx`       |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceStatusBar.tsx`      |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceLayout.ts` |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/hooks/usePanelResize.ts`     |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileWatcher.ts`     |
| 追加 | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileContextMenu.ts` |

## 統合テスト連携

| 観点             | 具体項目                                                    |
| ---------------- | ----------------------------------------------------------- |
| Store            | `loadWorkspace` と `addFolder` が UI アクションから呼ばれる |
| File context     | file selection が 04B 側へ渡せるイベントに接続される        |
| Preview boundary | selected file と preview open state が 04C 側へ渡せる       |
| Watcher          | watcher cleanup が unmount と file change で動作する        |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                                       | 仕様参照先                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX              | shell、tree、status bar、overlay の責務が view 階層へ正しく落ちるか確認する | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` |
| 状態管理           | store selector と local state の責務が混ざっていないか確認する              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                             |
| IPC / セキュリティ | 新規チャネルを作らず watcher cleanup と sender 前提を守れているか確認する   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                             |
| 品質               | Red で固定した契約に対して最小実装になっているか確認する                    | `phase-4-test-creation.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                  |

## 成果物

| 成果物           | パス                                        | 説明              |
| ---------------- | ------------------------------------------- | ----------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容まとめ    |
| 変更ファイル計画 | `outputs/phase-5/changed-file-plan.md`      | touched file 一覧 |
| 仕様同期候補     | `outputs/phase-5/spec-update-targets.md`    | Phase 12 更新候補 |

## 完了条件

- [ ] `WorkspaceView` stub を 04A shell に置き換える計画を定義している
- [ ] component / hook の追加対象を列挙している
- [ ] store / IPC 接続方針を列挙している
- [ ] watcher cleanup と P5 ガードの実装順を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. view / layout 実装
2. component 実装
3. hook / watcher / resize 実装
4. store / IPC 接続
5. 成果物更新と validator 確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-5/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
