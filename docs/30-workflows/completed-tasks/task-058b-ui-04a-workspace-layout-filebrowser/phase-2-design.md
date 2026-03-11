# Phase 2: 設計

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 2                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

Phase 1 の要件を、コンポーネント構成、状態管理、IPC 利用、レスポンシブ、アクセシビリティ、テスト対象に分解し、Phase 4 以降が迷わず実行できる設計書へ変換する。

## 実行タスク

- レイアウト設計: `chat-only`, `chat+files`, `chat+preview`, `3-pane` の遷移条件を固定する
- コンポーネント設計: 04A 配下の view / component / hook を定義する
- 状態管理設計: store と local state の責務境界を固定する
- IPC設計: `workspace:*` と `file:*` の既存チャネル利用手順を固定する
- 監視設計: P5 ガードを含む file watcher 契約を固定する

## 参照資料

| 参照資料       | パス                                         | 説明           |
| -------------- | -------------------------------------------- | -------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| SubAgent責務表 | `outputs/phase-1/subagent-ownership.md`      | Phase 1 成果物 |

## 実行手順

### ステップ1: レイアウトモード設計

| モード         | 条件                                      | DOM 構成                   |
| -------------- | ----------------------------------------- | -------------------------- |
| `chat-only`    | 初期状態、panel 両方 OFF                  | Chat panel 領域のみ        |
| `chat+files`   | file ON、preview OFF                      | file panel + chat panel    |
| `chat+preview` | file OFF、preview ON                      | chat panel + preview panel |
| `3-pane`       | file ON、preview ON、window width >= 1440 | file + chat + preview      |

### ステップ2: コンポーネント設計

| 種別     | ファイル                                                  | 責務                                           |
| -------- | --------------------------------------------------------- | ---------------------------------------------- |
| view     | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` | 04A の統合 view                                |
| organism | `WorkspaceShell.tsx`                                      | panel layout の骨格                            |
| organism | `FileBrowserPanel.tsx`                                    | file tree と zero state                        |
| molecule | `PanelToggleBar.tsx`                                      | 上部 toggle bar                                |
| molecule | `FileTreeNode.tsx`                                        | 再帰 tree node                                 |
| molecule | `FileContextMenu.tsx`                                     | 右クリック / 長押しメニュー                    |
| molecule | `WorkspaceStatusBar.tsx`                                  | ファイル情報表示                               |
| atom     | `PanelResizeHandle.tsx`                                   | 3-pane resize                                  |
| hook     | `useWorkspaceLayout.ts`                                   | layout mode、panel open、window width、persist |
| hook     | `usePanelResize.ts`                                       | width 制約、dblclick reset                     |
| hook     | `useFileWatcher.ts`                                       | watch start / stop、選択ファイル再取得         |
| hook     | `useFileContextMenu.ts`                                   | menu open / close と座標管理                   |

### ステップ3: 状態管理設計

| state                                                                               | 保持場所                   | 理由                          |
| ----------------------------------------------------------------------------------- | -------------------------- | ----------------------------- |
| `workspace`, `folderFileTrees`, `workspaceIsLoading`, `workspaceError`              | `workspaceSlice`           | 既存資産を再利用する          |
| `selectedFiles`                                                                     | `fileSelectionSlice`       | file context 連携で再利用する |
| `isFilePanelOpen`, `isPreviewOpen`, `layoutMode`, `selectedFilePath`, `previewMode` | local state / reducer      | 04A の view 固有状態          |
| `filePanelWidth`, `previewPanelWidth`                                               | local state + localStorage | UI 専用数値のため             |
| `contextMenuState`                                                                  | local state                | UI transient state のため     |

### ステップ4: IPC 設計

| チャネル                   | 用途                          | 04A での使い方                             |
| -------------------------- | ----------------------------- | ------------------------------------------ |
| `workspace:load`           | 永続化済み workspace 読み込み | 初期化時                                   |
| `workspace:add-folder`     | フォルダ追加                  | zero state から起動                        |
| `workspace:validate-paths` | path 検証                     | load 後の有効 path 反映                    |
| `file:get-tree`            | file tree 取得                | `loadWorkspace` と `loadFolderTree` で使用 |
| `file:read`                | ファイル内容取得              | 選択ファイル更新と watcher 再取得          |
| `file:watch-start`         | 監視開始                      | 選択ファイル or 対象 folder 設定時         |
| `file:watch-stop`          | 監視停止                      | unmount と切替時                           |

### ステップ5: 監視設計

| 項目         | 設計                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 二重登録防止 | hook 内の登録前に前回 watch を解除し、module scope flag で重複を防ぐ |
| 更新契約     | 選択中ファイルに一致した変更のみ `file:read` を再実行する            |
| デバウンス   | 300ms 固定                                                           |
| テスト支援   | `resetFileWatcherFlag()` を test 用に export する                    |

## 統合テスト連携

| 観点           | 具体項目                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| ViewType 導線  | `workspace` 遷移後に stub ではなく新レイアウトが表示される               |
| Store 連携     | `loadWorkspace()` 結果が file panel zero state / tree state に反映される |
| IPC 連携       | `file:read` と `file:watch-*` の利用順が壊れていない                     |
| 04B / 04C 連携 | props / context boundary が固定され、後続 task が独立実装できる          |

## 多角的チェック観点

| 観点           | このPhaseでの確認内容                                                              | 仕様参照先                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX          | breakpoint、overlay、resize、focus ring の設計が共通原則と整合するか確認する       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`   |
| アーキテクチャ | view / component / hook / store / IPC の責務が層をまたいで混ざっていないか確認する | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`    |
| セキュリティ   | file watcher 導線が既存 IPC 契約と sender 検証前提を維持するか確認する             | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                              |
| 品質           | selector 粒度、local state 化、Phase 11 の screenshot 設計入力が十分か確認する     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 成果物

| 成果物             | パス                                     | 説明                        |
| ------------------ | ---------------------------------------- | --------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 04A 全体構造                |
| コンポーネント設計 | `outputs/phase-2/component-design.md`    | ファイル構成と責務          |
| 状態設計           | `outputs/phase-2/state-design.md`        | store と local state の境界 |
| IPC / watcher 設計 | `outputs/phase-2/ipc-watcher-design.md`  | 既存チャネル利用手順        |

## 完了条件

- [ ] 4 つのレイアウトモードの遷移条件を固定している
- [ ] 04A 配下の view / component / hook の責務を定義している
- [ ] store と local state の責務境界を定義している
- [ ] 既存 IPC チャネルのみで構成する方針を定義している
- [ ] file watcher の P5 ガード設計を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. レイアウトモード設計
2. コンポーネント / hook / state 境界の定義
3. IPC / watcher 契約の整理
4. 統合テスト入力の明文化
5. 成果物更新と validator 確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-2/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 3: 設計レビューゲート](./phase-3-design-review.md)
