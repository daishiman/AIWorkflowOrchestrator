# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 1                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

`WorkspaceView` レイアウト基盤の機能要件、非機能要件、受け入れ基準、P50 判定を確定する。対象は 04A の責務に限定し、04B の chat panel 本体と 04C の preview / quick search 本体は境界外とする。

## 実行タスク

- P50調査: `WorkspaceView` の現状実装、`workspaceSlice`、`fileSelectionSlice`、`SlideInPanel` の実体を確認する
- 要件抽出: 元タスク文書からレイアウト、ファイルパネル、StatusBar、監視の要件を抽出する
- 受け入れ基準定義: Phase 11 で検証できる条件へ変換する
- スコープ固定: 04A に含む責務と 04B / 04C に委譲する責務を分離する
- SubAgent責務定義: UI、状態管理、テスト、文書同期の担当境界を固定する

## 参照資料

| 資料名                  | パス                                                                                                 | 説明                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 元タスク仕様            | `../skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md` | 04A の正本要件                       |
| master 設計             | `.claude/skills/aiworkflow-requirements/references/master-design.md`                                 | `WorkspaceView` の位置付け           |
| architecture overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                         | Renderer / Main / Preload の依存方向 |
| 既存 WorkspaceView      | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                            | 現状は stub                          |
| 既存 workspaceSlice     | `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`                                           | 既存状態管理資産                     |
| 既存 fileSelectionSlice | `apps/desktop/src/renderer/store/slices/fileSelectionSlice.ts`                                       | 既存選択資産                         |
| 既存 SlideInPanel       | `apps/desktop/src/renderer/components/molecules/SlideInPanel/index.tsx`                              | モバイルサイドパネルの基盤           |
| UI共通仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                              | 共通 component 契約                  |
| UI機能仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                      | UI 責務、共通要件                    |
| UI設計原則              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                       | Apple HIG / WCAG / responsive 基準   |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                         | Store 境界と個別セレクタ             |
| 配置仕様                | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`                           | ディレクトリ配置規約                 |
| desktop state           | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                             | Main / Preload / Renderer の責務     |
| ナビ仕様                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                              | `workspace` ViewType 契約            |
| IPC セキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                         | IPC ライフサイクル観点               |
| テスト仕様              | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                    | component / hook テスト規約          |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                          | TDD と品質下限                       |
| Workflow運用仕様        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                 | Phase 11 / 12 の運用ガード           |

## 実行手順

### ステップ1: P50調査

- [WorkspaceView](./phase-2-design.md) は stub 表示のみで、04A のレイアウト機能は未実装
- `workspaceSlice` はフォルダ追加、ツリー読み込み、選択ファイル保持、永続化を実装済み
- `fileSelectionSlice` は選択済みファイル一覧、順序変更、フィルタ、エラー状態を実装済み
- `SlideInPanel` は overlay、focus trap、Escape close を実装済み

### ステップ2: スコープ確定

- 04A に含む: chat-only / chat+files / chat+preview / 3-pane、file browser、toggle bar、resize、status bar、file watcher、ゼロステート
- 04A に含まない: ChatPanel 本体 UI、PreviewPanel 本体 UI、Quick Search 本体 UI
- 04A から 04B / 04C へ渡す契約: selected file path、layout mode、panel open state、file context attachment trigger

### ステップ3: 要件定義

| 要件ID | 要件                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| FR-01  | 初期表示は `chat-only` で、チャット入力領域の導線のみを前面に出す                           |
| FR-02  | 上部トグルで file panel と preview panel を独立して開閉できる                               |
| FR-03  | 1440px 以上かつ両トグル ON の場合に `3-pane` へ遷移する                                     |
| FR-04  | 1024px 未満では sidebar を overlay 表示し、`SlideInPanel` 契約へ寄せる                      |
| FR-05  | file panel は `workspaceSlice.folderFileTrees` を使って再帰描画する                         |
| FR-06  | ファイル選択時に status bar 表示と file context 連携トリガを更新する                        |
| FR-07  | file watcher は `file:watch-start` / `file:watch-stop` を使って選択中ファイル更新へ接続する |
| FR-08  | panel size は `workspace-panel-sizes`、layout mode は `workspace-layout-mode` に永続化する  |
| FR-09  | 新規 slice は追加せず、画面固有 state は local state に閉じる                               |
| FR-10  | 04A 完了後に 04B / 04C が並列実装できる境界を残す                                           |

### ステップ4: 非機能要件定義

| 要件ID | 要件                                                                      |
| ------ | ------------------------------------------------------------------------- |
| NFR-01 | tree, toggle, context menu, status bar は WCAG 2.1 AA を満たす            |
| NFR-02 | Zustand 利用は個別セレクタのみとし、P31 を回避する                        |
| NFR-03 | file watcher は module scope flag か同等の登録ガードを持ち、P5 を回避する |
| NFR-04 | component / hook テストは happy-dom 前提で `fireEvent` を使う             |
| NFR-05 | 3-pane の resize は min / max 幅制約を数値で固定する                      |

## 統合テスト連携

| 観点             | 定義                                                           |
| ---------------- | -------------------------------------------------------------- |
| Renderer → Store | `workspaceSlice` の読み込み結果が `WorkspaceView` に反映される |
| Renderer → IPC   | `workspace:*` と `file:*` の既存チャネルのみで 04A を構成する  |
| Renderer → 04B   | ファイル選択結果が chat input 側の context attachment へ渡る   |
| Renderer → 04C   | selected file と preview open state が preview pane 側へ渡る   |
| Resilience       | file watcher 再登録、権限エラー、空 workspace で UI が壊れない |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                                                    | 仕様参照先                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX              | 4 モード、zero state、StatusBar の受け入れ基準が Apple HIG / WCAG に矛盾しないか確認する | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |
| アーキテクチャ     | 04A が Renderer に閉じ、Main / Preload へ新規責務を漏らしていないか確認する              | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`          |
| IPC / セキュリティ | watcher と file read の既存チャネル再利用で足りるか、sender 境界を壊さないか確認する     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                    |
| 品質               | P50、P31、P5 を要件段階で再発防止できる形になっているか確認する                          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`             |

## 成果物

| 成果物         | パス                                         | 説明                        |
| -------------- | -------------------------------------------- | --------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | FR / NFR 一覧               |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Phase 11 用チェック項目     |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | 04A と 04B / 04C の責務分離 |
| SubAgent責務表 | `outputs/phase-1/subagent-ownership.md`      | 関心分離表                  |

## 完了条件

- [ ] `WorkspaceView` stub、`workspaceSlice`、`fileSelectionSlice`、`SlideInPanel` の現状を記録している
- [ ] FR-01 から FR-10 を列挙している
- [ ] NFR-01 から NFR-05 を列挙している
- [ ] 04A と 04B / 04C の境界を明記している
- [ ] SubAgent-A から D の責務境界を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. P50 調査と既存資産棚卸し
2. FR / NFR / 受け入れ基準の定義
3. 04A と 04B / 04C の責務境界整理
4. 成果物と台帳の更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-1/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 2: 設計](./phase-2-design.md)
