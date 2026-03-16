# タスク実行仕様書生成ガイド / completed records (workspace)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records
> 分割元: `task-workflow-completed-workspace-chat-lifecycle-tests.md`（500行超のため分割）
> 対象タスク: TASK-UI-04A-WORKSPACE-LAYOUT, TASK-UI-04C-WORKSPACE-PREVIEW

### タスク: TASK-UI-04A-WORKSPACE-LAYOUT Workspace レイアウト基盤（2026-03-10）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-UI-04A-WORKSPACE-LAYOUT |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）** |
| タイプ | feat |
| 優先度 | P2 |
| 完了日 | 2026-03-10 |
| 対象 | `WorkspaceView` の 1-pane 起点 layout、file browser、status bar、watcher、Phase 11 harness |
| 成果物 | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/outputs/` |

#### 実施内容

- `WorkspaceView` を stub から本実装へ差し替え、`chat-only` / `chat+files` / `chat+preview` / `3-pane` の4モードを追加
- `FileBrowserPanel` / `FileTreeNode` / `PanelToggleBar` / `PanelResizeHandle` / `WorkspaceStatusBar` / `WorkspaceShell` を追加
- `useWorkspaceLayout` / `usePanelResize` / `useFileWatcher` / `useFileContextMenu` を追加
- Main `fileHandlers.ts` に `FILE_WATCH_START` / `FILE_WATCH_STOP` を実装し、`FILE_CHANGED` push を接続
- task scope 12 files / 61 tests PASS、coverage `91.64 / 81.78 / 96.36 / 91.64` を確認
- Phase 11 で screenshot 8件を current workflow 配下へ取得し、light theme contrast 是正後の画面を再確認

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| right preview panel の resize 方向が直感と逆 | 左 panel と同じ drag 計算を右 panel に流用する | `usePanelResize` に `direction: "reverse"` を追加した |
| `useFileWatcher` の callback identity 変更で watch 再登録が走る | `onFileChanged` を effect dependency に直接置く | callback を `ref` 化し、watch lifecycle dependency から外した |
| worktree の Vite dev server が別 worktree source を配信する | preview server を HMR ソース前提で使う | build 後の `out/renderer` を static server で配信し、current worktree を固定した |
| light theme の補助テキストが screenshot 上で沈む | dark 基準の濃度を light にそのまま流用する | Workspace 04A 局所の text / chip / status bar を調整して再撮影した |

#### 同種課題の5分解決カード

1. 右側 panel の resize は reverse drag かを最初に確認する。
2. watch 系 hook は callback ref を使い、lifecycle dependency を分離する。
3. worktree で preview する場合は current build 由来の asset hash を確認する。
4. screenshot で light theme のコントラストを必ず目視確認する。
5. `task-workflow.md` / `ui-ux-feature-components.md` / `arch-state-management.md` / `security-electron-ipc.md` / `lessons-learned.md` を同一ターンで更新する。

#### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 | Workspace 系 UI の screenshot 再取得で current worktree build を capture 元として固定し、reverse resize / watcher 更新 / light theme contrast の再監査手順を共通化する | 中 | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md` |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm exec vitest run ...WorkspaceView scope...` | PASS（12 files / 61 tests） |
| `cd apps/desktop && pnpm exec tsc --noEmit` | PASS |
| `cd apps/desktop && pnpm exec eslint src/renderer/views/WorkspaceView src/main/ipc/fileHandlers.ts src/main/ipc/fileHandlers.test.ts` | PASS |
| `pnpm build` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` | PASS |

### タスク: TASK-UI-04C-WORKSPACE-PREVIEW Workspace preview / quick search（2026-03-11）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-UI-04C-WORKSPACE-PREVIEW |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）** |
| タイプ | feat |
| 優先度 | P2 |
| 完了日 | 2026-03-11 |
| 対象 | `WorkspaceView` の `PreviewPanel`、`QuickFileSearch`、renderer timeout / retry、Phase 11 current build screenshot |
| 成果物 | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/outputs/` |

#### 実施内容

- `PreviewPanel` / `PreviewToolbar` / `SourceView` / `PreviewErrorBoundary` を追加し、`Source` / `Preview` 切替、structured preview、image preview を実装
- `QuickFileSearch` と `useQuickFileSearch` を追加し、`Cmd/Ctrl+P`、ArrowUp / ArrowDown / Enter / Escape、top 10 fuzzy result を実装
- `file:read` を `Promise.race` で 5秒 timeout 化し、1秒間隔で最大3回 retry する renderer 側 resilience を追加
- JSON/YAML parse error は alert banner + source fallback、render crash は error boundary reset で回復可能にした
- task scope 13 files / 52 tests PASS、coverage `89.47 / 79.43 / 93.87 / 89.47`、Phase 11 screenshot 11件を current build static serve で取得した

#### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| fuzzy search の score 補正で非一致候補が残る | subsequence 0 のケースにも boost を加える | `score > 0` 条件を明示し、no match を空配列へ戻した |
| `file:read` hang が preview loading を解除しない | renderer timeout を持たず Main 応答だけを待つ | `Promise.race` + retry を renderer 層に閉じた |
| structured preview parse error が fatal 扱いになる | parse failure と transport failure を同じ error surface に載せる | banner と source fallback を分離した |

#### 同種課題の5分解決カード

1. fuzzy search は「一致判定」と「順位補正」を別関数として確認する。
2. preview 系 `invoke` には renderer timeout と retry を先に設計する。
3. parse error は fatal ではなく recoverable fallback にできるか確認する。
4. Phase 11 は current build source を固定し、desktop / dialog / mobile を再撮影する。
5. workflow / outputs / system spec / LOGS / SKILL を同一ターンで同期する。

#### 関連未タスク

| タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | preview / search で露出した fuzzy no-match、renderer timeout+retry、error taxonomy を共通ガードへ昇格する | 中 | `docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/WorkspaceView.test.tsx src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts` | PASS（13 files / 52 tests） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| `pnpm --filter @repo/desktop build` | PASS |
| `pnpm --filter @repo/desktop run screenshot:task-059b` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` | PASS |
