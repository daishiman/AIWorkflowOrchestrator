# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 4                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

04A の UI と hook を Red から固定するテストを先に作成し、Phase 5 の実装を最小の変更で前進させる。

## 実行タスク

- コンポーネントテスト作成: toggle bar、file browser、context menu、resize handle、status bar を Red で固定する
- Hookテスト作成: layout、resize、watcher の仕様を Red で固定する
- 統合観点テスト作成: WorkspaceView と store / IPC 連携を Red で固定する
- テスト補助作成: localStorage 初期化、watcher flag reset、selector mock を整備する

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| SubAgent責務表     | `outputs/phase-1/subagent-ownership.md`      | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | Phase 2 成果物 |
| 状態設計           | `outputs/phase-2/state-design.md`            | Phase 2 成果物 |
| IPC watcher設計    | `outputs/phase-2/ipc-watcher-design.md`      | Phase 2 成果物 |
| レビュー結果       | `outputs/phase-3/design-review-result.md`    | Phase 3 成果物 |
| 指摘一覧           | `outputs/phase-3/open-items.md`              | Phase 3 成果物 |
| ゲート記録         | `outputs/phase-3/review-gate.md`             | Phase 3 成果物 |

## 実行手順

### ステップ1: コンポーネントテストの作成対象を固定

| テストファイル                | 対象                              |
| ----------------------------- | --------------------------------- |
| `WorkspaceView.test.tsx`      | 4 モード切替と zero state         |
| `PanelToggleBar.test.tsx`     | file / preview toggle             |
| `FileBrowserPanel.test.tsx`   | tree 表示、zero state、folder add |
| `FileTreeNode.test.tsx`       | keyboard nav、selected 表示       |
| `FileContextMenu.test.tsx`    | 右クリック、menu close            |
| `PanelResizeHandle.test.tsx`  | min / max、dblclick reset         |
| `WorkspaceStatusBar.test.tsx` | file info 表示、未選択表示        |

### ステップ2: Hook テストの作成対象を固定

| テストファイル               | 対象                                    |
| ---------------------------- | --------------------------------------- |
| `useWorkspaceLayout.test.ts` | mode 計算、persist、breakpoint          |
| `usePanelResize.test.ts`     | width 制約、drag lifecycle              |
| `useFileWatcher.test.ts`     | start / stop、P5 ガード、300ms debounce |

### ステップ3: テスト規約を固定

| 項目         | 規約                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| DOM イベント | `fireEvent` を使う                                                       |
| Store access | `useStore((s) => s.xxx)` 前提の mock にする                              |
| 実行場所     | `cd apps/desktop && pnpm vitest run`                                     |
| localStorage | `workspace-layout-mode`, `workspace-panel-sizes` を各 test で reset する |

## 統合テスト連携

| 観点             | 具体項目                                                    |
| ---------------- | ----------------------------------------------------------- |
| Workspace 初期化 | `loadWorkspace()` 実行後に tree / zero state が切り替わる   |
| File 選択        | file node click で selected file と status bar が更新される |
| Resize           | `3-pane` でのみ drag が有効になる                           |
| Watcher          | file 変更イベントが preview 更新トリガを起こす              |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                                                  | 仕様参照先                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX              | toggle、tree、status bar、overlay の操作を test に落とせているか確認する               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |
| 状態管理           | selector mock と local state 初期値が設計と一致するか確認する                          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |
| IPC / セキュリティ | watcher start / stop と file read の mock 境界が既存チャネルに限定されているか確認する | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                    |
| 品質               | happy-dom、`fireEvent`、TDD-Red の入口が品質要件と整合するか確認する                   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## 成果物

| 成果物           | パス                                         | 説明                         |
| ---------------- | -------------------------------------------- | ---------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`      | テスト戦略                   |
| テストケース一覧 | `outputs/phase-4/test-cases.md`              | 失敗ケース一覧               |
| 統合テスト設計   | `outputs/phase-4/integration-test-design.md` | UI と store / IPC の接続観点 |

## 完了条件

- [ ] component テスト対象を列挙している
- [ ] hook テスト対象を列挙している
- [ ] P31 / P39 / P40 の test 規約を明記している
- [ ] integration test の観点を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. component test ケース設計
2. hook / watcher / persist test 設計
3. 統合テスト観点の定義
4. 成果物更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-4/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
