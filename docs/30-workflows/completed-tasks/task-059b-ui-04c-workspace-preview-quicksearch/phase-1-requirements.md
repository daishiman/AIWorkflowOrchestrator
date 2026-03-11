# Phase 1: 要件定義

## メタ情報

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                       |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch      |
| Phase        | 1                                                   |
| ステータス   | completed                                           |
| 作成日       | 2026-03-11                                          |
| 担当SubAgent | SubAgent-A（UI要件） / SubAgent-B（state・IPC要件） |

## 目的

`WorkspaceView` の PreviewPanel と QuickFileSearch（Cmd+P）を、実装可能な要件へ分解する。04A が提供したレイアウト基盤と責務衝突を起こさず、04B の chat 本体とも独立に進められる境界を確定する。

## 実行タスク

- P50調査: 現行 `WorkspaceView` と 04A 成果物の実装状態を確認する
- 機能要件抽出: PreviewPanel と QuickFileSearch の機能要件を FR として固定する
- 非機能要件抽出: セキュリティ、a11y、性能、品質要件を NFR として固定する
- 受け入れ基準定義: Phase 11 で観測できる検証項目へ変換する
- 責務境界定義: 04A / 04B / 04C の境界と依存を明文化する
- SubAgent分担定義: Atent Team 想定の担当境界を仕様へ反映する

## 参照資料

| 資料名             | パス                                                                                                                                          | 説明                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 元タスク仕様       | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059b-ui-04c-workspace-preview-quicksearch.md` | 04C 正本要件                  |
| 04A workflow       | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`                                                            | レイアウト基盤と watcher 契約 |
| 04B 元タスク       | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md`          | chat 側の責務境界             |
| 現行 WorkspaceView | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                                                                     | 04C 組み込み先                |
| preload channels   | `apps/desktop/src/preload/channels.ts`                                                                                                        | IPC チャネル定義              |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 本Phaseで使う理由                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| UI機能仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Workspace 04A との接続境界を継承するため                             |
| UI語彙仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Task 5D の表示語彙を固定するため                                     |
| 状態管理         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | `workspaceSlice` 再利用契約と preview panel state 境界を固定するため |
| IPC API          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | `file:read` / watch lifecycle 契約を逸脱しないため                   |
| desktop state    | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                    | Renderer→Main の `file:*` 利用範囲を確認するため                     |
| 検索UI           | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                   | Cmd+P のショートカット契約を合わせるため                             |
| アクセシビリティ | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | dialog / keyboard / live region の検証要件を定義するため             |
| テスト規約       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | happy-dom + fireEvent 前提を固定するため                             |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Phase 7 の coverage gate と性能目標を固定するため                    |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | watch cleanup と sender 境界を守るため                               |
| 入力検証         | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | sanitize/URL検証の防御境界を固定するため                             |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | timeout / permission エラー表示方針を統一するため                    |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31/P39/P40 再発防止観点を要件化するため                          |

## 実行手順

### ステップ1: P50調査

- `WorkspaceView` の 04A 実装で file panel / status bar / watcher の土台が存在することを確認する
- PreviewPanel 本体と QuickFileSearch 本体が未実装であることを確認する
- `file:read` が既存 IPC で利用可能であることを確認する

### ステップ2: 機能要件（FR）を固定

| 要件ID | 要件                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| FR-01  | PreviewPanel は `Source` と `Preview` の2モードを持つ                            |
| FR-02  | Source モードで拡張子に応じたシンタックス表示を行う                              |
| FR-03  | HTML は iframe sandbox で表示し、script 実行を禁止する                           |
| FR-04  | Markdown は HTML 変換後に表示し、危険タグを除去する                              |
| FR-05  | 画像は `fit-contain` 表示とメタ情報表示を切り替え可能にする                      |
| FR-06  | Preview 不可拡張子では Preview タブを disabled 表示にする                        |
| FR-07  | Cmd+P で QuickFileSearch を開閉する                                              |
| FR-08  | QuickFileSearch はファジーマッチで上位10件を表示する                             |
| FR-09  | ArrowUp / ArrowDown / Enter / Escape のキーボード操作を提供する                  |
| FR-10  | 選択確定時に `setSelectedFilePath(path)` で PreviewPanel へ反映する              |
| FR-11  | JSON/YAML は Source 表示に加え、Preview モードで整形表示（ツリー表示）を提供する |
| FR-12  | PreviewToolbar に Refresh と Wrap トグルを提供する                               |
| FR-13  | SourceView は read-only とし、ダブルクリックで EditorView 遷移導線を提供する     |
| FR-14  | SourceView は行番号表示（40px ガター）を提供する                                 |

### ステップ3: 非機能要件（NFR）を固定

| 要件ID | 要件                                                                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | iframe `sandbox="allow-same-origin"` と CSP で script 実行を禁止する                                                                                                         |
| NFR-02 | HTML/Markdown はサニタイズ関数を経由して描画する                                                                                                                             |
| NFR-03 | PreviewPanel のエラー表示は `role="alert"` を付与する                                                                                                                        |
| NFR-04 | QuickFileSearch モーダルは `role="dialog"` とフォーカストラップを持つ                                                                                                        |
| NFR-05 | キーボードだけで検索、選択、閉じる操作を完結できる                                                                                                                           |
| NFR-06 | テストは happy-dom + `fireEvent` で実装する                                                                                                                                  |
| NFR-07 | Store 参照は個別セレクタを使い、合成 selector を作らない                                                                                                                     |
| NFR-08 | テスト実行コマンドは `cd apps/desktop && pnpm vitest run` で統一する                                                                                                         |
| NFR-09 | watcher 通知由来の再読込は 300ms デバウンスで実行し、04A `useFileWatcher` を再利用して二重登録を防止する                                                                     |
| NFR-10 | `file:read` timeout は 5 秒で判定し、1 秒間隔で 3 回まで再試行して失敗時は復帰導線付きエラー表示へ遷移する                                                                   |
| NFR-11 | UIテキストは Task 5D の語彙（「プレビュー」「コード表示」「ファイルをすばやく探す」）へ一致させる                                                                            |
| NFR-12 | HTML preview の CSP は `default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; script-src 'none'; object-src 'none'; frame-src 'none'` を満たす |
| NFR-13 | rendering error は ErrorBoundary で捕捉し、reset 操作で復帰できること。iframe crash は親UIへ波及しないこと                                                                   |

### ステップ4: スコープ境界を固定

| 区分        | 含む範囲                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------- |
| 04Cで実施   | PreviewPanel UI、QuickFileSearch モーダル、検索 hook、Preview toolbar、CSP/サニタイズ契約 |
| 04Aから利用 | layout mode、panel open state、file watch lifecycle、selected file の基盤 state           |
| 04Bに委譲   | chat 入力、@mention、file context 添付 UI、streaming UI                                   |
| 対象外      | 新規 Main IPC チャネル追加、Editor 本体編集機能、RAG 検索機能追加                         |

### ステップ5: SubAgent責務を固定

| SubAgent   | 関心                   | 主担当成果物                                 |
| ---------- | ---------------------- | -------------------------------------------- |
| SubAgent-A | PreviewPanel UI / UX   | `outputs/phase-1/requirements-definition.md` |
| SubAgent-B | state / IPC / security | `outputs/phase-1/scope-definition.md`        |
| SubAgent-C | test / quality         | `outputs/phase-1/acceptance-criteria.md`     |
| SubAgent-D | docs / workflow同期    | `outputs/phase-1/subagent-ownership.md`      |

## 統合テスト連携

| 観点           | このPhaseで固定する内容                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| Renderer→Store | `selectedFilePath` 変更で PreviewPanel 表示対象が変わること                       |
| Renderer→IPC   | `file:read` 結果を Source/Preview に反映すること                                  |
| watch連携      | 04A watcher からの更新通知を 300ms デバウンスで再読込し、二重登録を起こさないこと |
| Editor導線     | SourceView のダブルクリックで EditorView 遷移導線が動作すること                   |
| keyboard導線   | Cmd+P と Arrow/Enter/Escape が App 全体ショートカットと衝突しないこと             |
| エラー導線     | timeout / read error / sanitize failure を UI へ表示すること                      |

## 多角的チェック観点

| 観点         | このPhaseでの確認内容                                      |
| ------------ | ---------------------------------------------------------- |
| UI/UX        | 04A の 4モードに 04C を接続しても視覚構造が崩れないこと    |
| セキュリティ | iframe / sanitize / IPC allowlist の境界を破らないこと     |
| 状態管理     | `workspaceSlice` 再利用で足りること                        |
| 品質         | P5 / P31 / P39 / P40 を Phase 4 に渡せる粒度で定義すること |

## 成果物

| 成果物         | パス                                         | 説明             |
| -------------- | -------------------------------------------- | ---------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧       |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | AC一覧           |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | in/out scope     |
| SubAgent責務表 | `outputs/phase-1/subagent-ownership.md`      | Concern 分離定義 |

## 完了条件

- [ ] FR-01 から FR-14 を定義している
- [ ] NFR-01 から NFR-13 を定義している
- [ ] 04A / 04B / 04C の責務境界を定義している
- [ ] SubAgent-A から D の責務境界を定義している
- [ ] Phase 2 が参照できる成果物パスを固定している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. P50調査と既存境界の確認
2. FR/NFR と受け入れ基準の定義
3. 04A/04B/04C の責務境界定義
4. SubAgent 分担と成果物パスの固定
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-1/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 2: 設計](./phase-2-design.md)
