# Phase 2: 設計

## メタ情報

| 項目         | 値                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                                                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch                                 |
| Phase        | 2                                                                              |
| ステータス   | completed                                                                      |
| 作成日       | 2026-03-11                                                                     |
| 担当SubAgent | SubAgent-A（UI設計） / SubAgent-B（state・IPC設計） / SubAgent-C（テスト設計） |

## 目的

Phase 1 要件を、実装者がそのまま手を動かせる設計へ変換する。PreviewPanel コンポーネント構成、QuickFileSearch hook、IPC 連携、セキュリティ制約、テスト設計入力を固定する。

## 実行タスク

- コンポーネント設計: PreviewPanel 系の階層と props 契約を定義する
- 状態設計: local state と store state の責務境界を定義する
- 検索設計: QuickFileSearch の入力、スコアリング、選択状態を定義する
- セキュリティ設計: iframe CSP、DOM sanitize、error fallback を定義する
- IPC設計: `file:read` と watch 更新を使う data flow を定義する
- テスト設計入力: Phase 4 用の test target と判定軸を定義する

## 参照資料

| 参照資料       | パス                                                                                                | 説明             |
| -------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                                                        | FR/NFR           |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                                            | AC               |
| スコープ定義   | `outputs/phase-1/scope-definition.md`                                                               | 境界             |
| SubAgent責務表 | `outputs/phase-1/subagent-ownership.md`                                                             | 関心分離         |
| 04A 設計       | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/phase-2-design.md` | 既存 layout 契約 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 本Phaseで使う理由                                    |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Workspace UI 契約    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 04A の component 階層と mode 契約を維持するため      |
| UI語彙仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Task 5D の表示語彙を画面設計へ反映するため           |
| UIデザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | モーダル寸法・影・角丸の設計値を統一するため         |
| Workspace state 契約 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | preview panel state の配置を決めるため               |
| IPC 契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | `file:read` / `file:watch-*` の利用順序を守るため    |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | subscribe / cleanup の規約を守るため                 |
| 入力検証             | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | DOM sanitize と危険URL除去の設計境界を固定するため   |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31/P39/P40 の再発防止を設計へ反映するため        |
| 検索ショートカット   | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                   | Cmd+P と Escape 動作を統一するため                   |
| a11y                 | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | dialog / keyboard / live region の属性を固定するため |

## 実行手順

### ステップ1: PreviewPanel コンポーネント設計

| コンポーネント      | 役割                        | 入力                                            | 出力                                        |
| ------------------- | --------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `PreviewPanel`      | Source/Preview 切替コンテナ | `selectedFilePath`, `content`, `fileType`       | toolbar + body 描画                         |
| `PreviewToolbar`    | モード切替と操作ボタン      | `mode`, `canPreview`, `isWrap`                  | `onModeChange`, `onRefresh`, `onWrapToggle` |
| `SourceView`        | コード表示                  | `content`, `language`, `isWrap`, `onOpenEditor` | read-only 表示 + ダブルクリック導線         |
| `HtmlPreview`       | iframe sandbox 表示         | `sanitizedHtml`                                 | sandbox iframe                              |
| `MarkdownPreview`   | Markdown 表示               | `markdownText`                                  | rendered HTML                               |
| `StructuredPreview` | JSON/YAML 整形表示          | `content`, `format`                             | tree/pretty 表示                            |
| `ImagePreview`      | 画像表示                    | `src`, `meta`                                   | image + metadata                            |
| `PreviewEmptyState` | 未選択表示                  | なし                                            | guidance 表示                               |

### ステップ2: QuickFileSearch 設計

| 要素         | 設計                                                         |
| ------------ | ------------------------------------------------------------ |
| state        | `isOpen`, `query`, `results`, `selectedIndex`                |
| 入力ソース   | `workspaceSlice.folderFileTrees` から平坦化した `filePath[]` |
| 検索方式     | fileName 優先のファジースコア + path 部分一致                |
| 表示件数     | 10 件固定                                                    |
| キー操作     | `ArrowUp`, `ArrowDown`, `Enter`, `Escape`                    |
| 選択確定     | `setSelectedFilePath(path)` を実行し modal を閉じる          |
| モーダル仕様 | 幅 480px、角丸 12px、shadow `0 8px 32px rgba(0,0,0,0.12)`    |

### ステップ3: state 境界設計

| state                            | 所有者                     | 理由                       |
| -------------------------------- | -------------------------- | -------------------------- |
| workspace tree / selected file   | `workspaceSlice`           | 04A 既存責務               |
| preview mode / wrap / load state | `PreviewPanel` local state | 04C 画面局所責務           |
| quick search open/query/results  | `useQuickFileSearch`       | 04C の機能局所責務         |
| watcher event bridge             | 04A `useFileWatcher`       | 再利用して重複登録を避ける |

### ステップ4: セキュリティ・エラー設計

| 項目              | 設計                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| iframe sandbox    | `allow-same-origin` のみ許可                                                                                                                 |
| CSP               | `default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; script-src 'none'; object-src 'none'; frame-src 'none'` |
| sanitize          | script / iframe / on\* 属性を除去して `srcdoc` へ渡す                                                                                        |
| watch更新         | `useFileWatcher` 通知を 300ms デバウンスで再読込する                                                                                         |
| timeout/retry     | 5秒 timeout、1秒間隔3回 retry、失敗時は復帰導線付きエラー表示へ遷移する                                                                      |
| ErrorBoundary     | preview render error を捕捉し、reset 操作で復帰可能にする                                                                                    |
| iframe crash 隔離 | iframe crash 時も親UI（WorkspaceView）を維持する                                                                                             |
| fallback          | 変換失敗時は Source モードへフォールバック                                                                                                   |

### ステップ5: 実装ファイル設計

| 区分            | ファイル                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| view components | `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/*.tsx`              |
| modal           | `apps/desktop/src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx`             |
| hook            | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`                |
| tests           | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx`            |
| tests           | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx`         |
| tests           | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts` |

## 統合テスト連携

| 観点       | Phase 4 へ渡す設計入力                                                       |
| ---------- | ---------------------------------------------------------------------------- |
| UI連携     | file 選択→Preview 更新、モード切替、未選択ゼロステート                       |
| IPC連携    | `file:read` 成功/失敗、watch 更新での再描画                                  |
| Editor導線 | SourceView の read-only とダブルクリック遷移                                 |
| keyboard   | Cmd+P 開閉、Arrow移動、Enter確定、Escape閉じる                               |
| security   | sanitize 後 HTML の描画、script 非実行                                       |
| a11y       | dialog role、aria 属性、focus trap                                           |
| UX語彙     | Task 5D 用語（プレビュー/コード表示/ファイルをすばやく探す）を UI 文言へ固定 |

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                   |
| ------------ | ------------------------------------------------------- |
| UI/UX        | 04A の 4モードを維持したまま preview を差し込める設計か |
| 状態管理     | store 追加を避けて local state で完結する設計か         |
| IPC          | 既存チャネルのみで要求を満たす設計か                    |
| セキュリティ | sandbox / CSP / sanitize が同時に働く設計か             |
| テスト容易性 | コンポーネント単位と hook 単位で切り出せる設計か        |

## 成果物

| 成果物             | パス                                         | 説明                   |
| ------------------ | -------------------------------------------- | ---------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | 04C 全体構造           |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | PreviewPanel 階層      |
| 状態設計           | `outputs/phase-2/state-design.md`            | store/local 境界       |
| 検索設計           | `outputs/phase-2/quick-search-design.md`     | スコアリングと UI 動作 |
| セキュリティ設計   | `outputs/phase-2/preview-security-design.md` | CSP / sanitize         |

## 完了条件

- [ ] PreviewPanel と QuickFileSearch の責務を分離して定義している
- [ ] state 境界を store/local で定義している
- [ ] `file:read` / watch 再利用の data flow を定義している
- [ ] CSP / sanitize / fallback の設計を定義している
- [ ] Phase 4 へ渡す test target を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. コンポーネント設計
2. state/IPC 設計
3. セキュリティ設計
4. テスト設計入力の固定
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-2/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 3: 設計レビューゲート](./phase-3-design-review.md)
