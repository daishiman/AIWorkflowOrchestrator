# 状態管理パターン（Desktop Renderer） / core specification

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: core specification

## UI Design Foundation 状態管理方針（TASK-UI-00-DESIGN-FOUNDATION）

TASK-UI-00-DESIGN-FOUNDATION で追加した Molecules / Organisms は、アプリ全体の永続状態を持たず、表示責務に限定する。そのため新規の Zustand Slice は追加しない。

### コンポーネント別の状態境界

| コンポーネント | 状態の置き場所 | 方針 |
| --- | --- | --- |
| SearchBar | 親 + `onSearch` コールバック | 入力値はローカル、検索実行は親へ委譲 |
| CodeViewer | ローカル（コピー通知など） | ドメイン状態を持たない表示専用 |
| TabSwitcher | 親（activeTab） | 制御コンポーネントとして状態を外出し |
| SlideInPanel | 親（isOpen） | 開閉状態は親で一元管理 |
| ConfirmDialog | 親（isOpen / onConfirm） | 副作用実行は親に限定 |
| CardGrid | props | 描画専用（loading/empty/data） |
| MasterDetailLayout | 親（selectedId等） | 選択状態は上位で保持 |
| SearchFilterList | 親（query/filter）+ローカル（UI補助） | 検索条件は親、UI操作は局所化 |

### 設計判断

- 新規 Slice: **不要**
- 理由: UI基盤層の再利用性を優先し、ドメイン状態への依存を避けるため
- 連携方式: props / callback / controlled component パターンを採用
---
## Store Slice Baseline（TASK-UI-01-A-STORE-SLICE-BASELINE）

### 概要

`task-056a-a-store-slice-baseline` では、後続タスク（`task-056a-b` / `task-056c` / `task-056d`）の前提として、既存Storeの責務境界を型付きで固定した。

### 追加した基準定義

| 種別 | 実装場所 | 内容 |
| --- | --- | --- |
| baseline型 | `apps/desktop/src/renderer/store/types.ts` | `StoreSliceInventoryItem` / `StoreBoundaryMatrixItem` / `StoreSelectorPolicy` などを追加 |
| baseline定数 | `apps/desktop/src/renderer/store/sliceBaseline.ts` | `STORE_SLICE_INVENTORY_BASELINE` / `STORE_BOUNDARY_MATRIX_BASELINE` / `STORE_SELECTOR_POLICY_BASELINE` |
| 再export | `apps/desktop/src/renderer/store/index.ts` | baseline定数を `store/index.ts` から参照可能に統一 |

### Inventory基準

| 項目 | 基準値 |
| --- | --- |
| 行数 | 16行（15 Slice + `ChatEditSlice`） |
| 永続化キー | `currentView`, `selectedFile`, `expandedFolders`, `userProfile`, `autoSyncEnabled`, `windowSize`, `permissionHistory` |
| 目的 | Slice責務・永続化・ownerView の判定根拠を固定し、後続タスクの判断ドリフトを防止 |

### 境界マトリクス基準

| ドメイン | 判定 | 根拠 |
| --- | --- | --- |
| Notification | `new` | 画面横断で未読/履歴を共有するため独立Slice化 |
| HistorySearch | `new` | 検索クエリ/結果/統計を一貫管理するため分離 |
| SkillCenter | `local-useState` | 詳細パネル開閉などは局所状態で完結 |
| ViewType | `extend` | `NavigationSlice` の責務を維持し型拡張で対応 |
| Workspace | `no-change` | 既存 `workspaceSlice` の責務で充足 |

### セレクタ規約基準（P31対策）

- 命名規約: `use{State}{Domain}` / `use{Verb}{Domain}`
- 禁止: 合成Hook再導入（`useLLMStore` / `useSkillStore` / `useAuthModeStore`）
- 禁止: 汎用セレクタ名（`useError` / `useLoading` / `useData`）

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest run src/renderer/store/__tests__/sliceBaseline.test.ts` | PASS（9/9） |
| `typecheck` | PASS |
| `validate-phase11-screenshot-coverage` | PASS（expected=3 / covered=3） |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-UI-04A-WORKSPACE-LAYOUT | WorkspaceView layout / file browser / watcher 基盤 | **完了**（2026-03-10） |
| TASK-UI-04B-WORKSPACE-CHAT | Workspace Chat panel / mention / stream 統合 | **完了**（2026-03-11） |
| TASK-UI-01-A-STORE-SLICE-BASELINE | Store境界の基準化 | **完了**（2026-03-05） |
| TASK-UI-01-B-IPC-CONTRACT-SECURITY | IPC契約とセキュリティ同期 | 後続 |
| TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN | Notification/HistorySearch実装 | **完了**（2026-03-05） |
| TASK-UI-08-NOTIFICATION-CENTER | NotificationCenter 058e UX 再整備 | **完了**（2026-03-11） |
| TASK-UI-01-D-VIEWTYPE-ROUTING-NAV | ViewType/導線実装 | **完了**（2026-03-05） |
---
## ChatPanel 実AIチャット配線 初期設計（廃止 → 最終設計は後述セクション参照）

> **注意**: 本セクションは初期設計メモであり、最終設計に置き換えられた。
> 最終版: 「ChatPanel Real AI Chat 配線 状態管理拡張（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created）」セクションを参照。
>
> 変更点:
> - 8 状態: idle/sending/streaming/complete/error/aborted/disabled/loading → idle/ready/streaming/cancelled/completed/error/blocked/handoff
> - AccessCapability: canSend/canAbort/canSelectModel/canViewHistory → integratedRuntime/terminalSurface/both/none
> - セレクタ: 6 個 → 12 個
---
## Workspace Layout 基盤（TASK-UI-04A-WORKSPACE-LAYOUT）

### 状態配置

| 状態 | 所有者 | 理由 |
| --- | --- | --- |
| workspace folders / tree / selected workspace file | `workspaceSlice` | 既存 workspace ドメイン責務の範囲内 |
| 添付対象 file context | `fileSelectionSlice` | 04B へ渡す背景情報コンテキストを共有するため |
| layout mode / last opened panel | `useWorkspaceLayout` | 画面固有であり global store 化不要 |
| file / preview panel width | `useWorkspaceLayout` + localStorage | UI の一時状態であり view 内に閉じる |
| context menu / expanded folders / selected file content | `WorkspaceView` local state | 04A 局所責務で完結するため |

### persist 契約

| key | 値 | 備考 |
| --- | --- | --- |
| `workspace-layout-mode` | `chat-only` / `chat+files` / `chat+preview` / `3-pane` | 表示モードを再現 |
| `workspace-panel-sizes` | `{ filePanelWidth, previewPanelWidth }` | min/max clamp 後の値を保存 |

### hook 境界

| hook | 責務 |
| --- | --- |
| `useWorkspaceLayout` | breakpoint、mode 算出、persist、overlay close |
| `usePanelResize` | min/max clamp、keyboard resize、preview reverse drag |
| `useFileWatcher` | selected file 単位 watch、debounce、module scope guard、cleanup |

### 再発防止ルール

- `WorkspaceView` では新規 Zustand slice を作らない。
- callback identity が変わっても `useFileWatcher` が watch を再登録しないよう `ref` 経由で参照する。
- 右側 preview panel は reverse drag を標準とし、操作方向と視覚結果を一致させる。

## Workspace Preview / Quick Search（TASK-UI-04C-WORKSPACE-PREVIEW）

### 状態配置

| 状態 | 所有者 | 理由 |
| --- | --- | --- |
| selected workspace file / 添付対象 file context | `workspaceSlice` / `fileSelectionSlice` | 04A / 04B との共有境界を維持するため |
| preview content / size / extension / loading / read error | `WorkspaceView` local state | file read lifecycle は preview 局所責務で完結するため |
| preview tab / wrap / structured meta 表示 | `PreviewPanel` local state | view 表示状態であり global store 化不要 |
| quick search open / query / selectedIndex | `useQuickFileSearch` local state | workspace 内 shortcut UI に閉じるため |
| watch state | `useFileWatcher` + local state | 04A の watch lifecycle を再利用し、preview 更新だけに限定するため |

### 境界ルール

| 項目 | 契約 |
| --- | --- |
| store reuse | 04C でも新規 Zustand slice は作らない |
| file read resilience | renderer 側 `Promise.race` で 5秒 timeout、1秒間隔3回 retry を行う |
| quick search ranking | `scoreFilePath()` は `score > 0` の候補だけを返し、同点は path で stable sort する |
| preview fallback | JSON/YAML parse error は recoverable として `SourceView` fallback を維持する |
| cross-task boundary | chat 実行状態や editor state を 04C local state に持ち込まない |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `WorkspaceView` task scope tests | PASS（13 files / 52 tests） |
| coverage | Statements 89.47 / Branches 79.43 / Functions 93.87 / Lines 89.47 |
| Phase 11 screenshot | PASS（11件 / current build static serve） |

## Workspace Chat Panel 統合（TASK-UI-04B-WORKSPACE-CHAT）

### 状態配置

| 状態 | 所有者 | 理由 |
| --- | --- | --- |
| messages / input / streamContent / errorMessage / streamingError | `useWorkspaceChatController` | chat固有の一時状態で view 内に閉じる。structured error は `StreamingErrorDisplay`、raw fallback は `WorkspaceChatInput` で扱う |
| selected context files | `fileSelectionSlice` | 04A/04B で共有される背景情報 |
| selected workspace file | `workspaceSlice` | file browser / preview / chat attach で共通利用 |
| selected provider/model | `llmSlice`（selector） | 既存 LLM 設定を再利用 |
| conversationId | `useWorkspaceChatController` | workspace chat session の局所管理 |

### Workspace Chat streaming error contract（TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR）

- `streamingError` は Workspace Chat の primary structured error state として `useWorkspaceChatController` が所有する
- `errorMessage` は raw message の fallback であり、`streamingError` が存在する間は重複表示しない
- `dismissStreamingError()` は `streamingError` と `errorMessage` を同時に clear する
- `retryLastMessage()` は `streamingError.retryable` と `lastUserMessageRef` の両方が揃う場合のみ再送する

### フロー契約

| フロー | 契約 |
| --- | --- |
| send | user append → conversation create/addMessage → streamChat |
| stream chunk | `streamContentRef` と `streamContent` を同時更新し race を防ぐ |
| stream end | assistant append + `conversationAPI.addMessage(role=assistant)` |
| stream error | streaming state reset + error surface |
| mention | `@` 候補選択時に context add + preview open |

### 再発防止ルール

- `isStreamingRef` は `setIsStreaming()` だけに依存させず、開始/終了時に即時同期する。
- stream buffer は state のみでなく ref でも保持し、chunk/end 同期到着で欠落させない。
- 04B では新規 global slice を追加しない（`workspaceSlice` / `fileSelectionSlice` 再利用）。

## Notification/HistorySearch 実装同期（TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN）

### 追加したSlice

| Slice | 実装ファイル | 役割 |
| --- | --- | --- |
| `notificationSlice` | `apps/desktop/src/renderer/store/slices/notificationSlice.ts` | 通知履歴・未読管理・フィルタ管理 |
| `historySearchSlice` | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | 検索条件・結果・統計・ページング管理 |

### Notification 契約

| 項目 | 内容 |
| --- | --- |
| 上限 | `MAX_NOTIFICATION_HISTORY = 100` |
| 削除戦略 | 上限超過時は既読最古を優先削除。既読が無い場合は未読最古を削除 |
| 既読管理 | `readAt: string | null` |
| 永続化 | `persist.partialize` で `notifications` を保持 |

### Notification 058e 追補（TASK-UI-08-NOTIFICATION-CENTER）

| 項目 | 内容 |
| --- | --- |
| 履歴同期 | `setNotificationHistory()` は ID 単位で dedupe し、timestamp 降順へ正規化する |
| push 取り込み | `ingestNotification()` は既存 ID を置換して二重表示を防ぐ |
| 個別削除 | `deleteNotification()` は対象通知を除去し、展開中だった場合は `expandedNotificationId = null` に戻す |
| UI state | `isPopoverOpen` と `expandedNotificationId` を局所 state と切り分けず slice で保持する |
| 互換 API | `clearAllNotifications()` は Store/互換用途に残すが、058e UI では `すべて削除` を表示しない |

### HistorySearch 契約

| 項目 | 内容 |
| --- | --- |
| フィルタ | type/date/includeArchived |
| 結果管理 | `results`, `stats`, `pagination` |
| 検索前処理 | `query.trim()` を必須化 |
| エラー管理 | `historySearchError` に明示保持 |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest`（対象5ファイル） | PASS（37 tests） |
| `typecheck` | PASS |
| coverage（task scope） | Line 87.45 / Branch 65.11 / Function 80.39 |
---
## HistorySearch timeline 再設計（TASK-UI-06-HISTORY-SEARCH-VIEW）

### 更新した Slice / state

| Slice | 追加/変更 | 目的 |
| --- | --- | --- |
| `historySearchSlice` | `hasFetchedHistory` | 初回 loading と初期 empty を分離する |
| `historySearchSlice` | `isHistoryLoadingMore` | 初回検索と append 読込を分離する |
| `historySearchSlice` | `expandedItemId` | accordion を単一展開に保つ |
| `editorSlice` | `pendingOpenFilePath` | history file card から editor への deep-open を橋渡しする |

### Action 契約

| Action | 契約 |
| --- | --- |
| `searchHistory(query, offset, filter)` | `query.trim()` を正本にする。`offset === 0` は置換、`offset > 0` は append |
| `loadMoreHistory()` | `hasMore=false` / `isHistorySearching=true` / `isHistoryLoadingMore=true` の場合は no-op |
| `mergeHistoryItems()` | `id` 重複を除外して append する |
| `requestOpenFile(filePath)` | `pendingOpenFilePath` をセットし、呼び出し元が `setCurrentView("editor")` を行う |
| `clearPendingOpenFile()` | `EditorView` 側で消費後に必ず null へ戻す |

### UI状態の分離

| UI mode | 判定 | 表示 |
| --- | --- | --- |
| loading | `!hasFetchedHistory && isHistorySearching` | skeleton |
| results | `historySearchResults.length > 0` | timeline + sentinel |
| search-empty | `query.trim() !== "" && results.length === 0` | clear CTA |
| empty | 初回取得後に結果0件 | chat 導線 |
| error | `historySearchError !== null` | retry CTA |

### 実装時の苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| 検索中と追加読込中を同一フラグで持つと empty/loading 判定が崩れる | `isHistorySearching` だけで全状態を表す | `hasFetchedHistory` / `isHistoryLoadingMore` を分離した | timeline UI は initial / append / empty を別フラグで表現する |
| file card から editor を直接開けず、View 遷移だけ先に進む | deep-open 対象 path を global state に残さない | `pendingOpenFilePath` を `editorSlice` に追加した | cross-view 導線は「遷移」と「消費する payload」を分けて保持する |
| mobile sticky header が card と視覚干渉しやすい | sticky offset が画面全体 header を前提に固定される | `top-0` + gradient + blur に寄せた | timeline の group header は local scroll container 基準で sticky を設計する |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest`（対象5ファイル） | PASS（26 tests） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| coverage（task scope） | Lines 88.42 / Branches 80.00 / Functions 90.00 |
---
## ViewType/ナビ導線 実装同期（TASK-UI-01-D-VIEWTYPE-ROUTING-NAV）

### 変更点（状態管理観点）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| ViewType導線 | `workspace` / `skillCenter` / `historySearch` の導線を `renderView()` で網羅 | `apps/desktop/src/renderer/App.tsx` |
| 契約一元化 | AppDock ナビ項目を `navContract.ts` へ集約し、重複定義を除去 | `apps/desktop/src/renderer/navigation/navContract.ts` |
| ショートカット | `Cmd` / `Ctrl` 両対応。`alt` / `shift` 併用時・編集要素上は無効化 | `apps/desktop/src/renderer/navigation/navContract.ts`, `apps/desktop/src/renderer/App.tsx` |
| AppDock連携 | `APP_DOCK_NAV_ITEMS` を参照し、表示順と ViewType 契約を固定 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |

### TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001（2026-03-17）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| ViewType 拡張 | `skillAnalysis` / `skillCreate` / `executionConsole` を `ViewType` に追加 | `apps/desktop/src/renderer/store/types.ts` |
| renderView 導線 | `skillAnalysis` は `SkillAnalysisView`、`skillCreate` は `SkillCreateWizard`、`executionConsole` は `ExecutionConsoleView` を返す | `apps/desktop/src/renderer/App.tsx` |
| close 時の状態復帰 | `SkillAnalysisView` close で `setCurrentView("skillCenter")` + `setCurrentSkillName(null)` | `apps/desktop/src/renderer/App.tsx` |
| ExecutionConsoleView | stub view。`openExecutionConsole()` shared action で遷移。session/terminal state は後続タスクに委譲（TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001） | `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx` |
| lifecycle 型境界 | `SkillLifecycleJobGuide` に `onAction?: () => void` を追加（既存 job guide 互換を維持） | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| alias 正規化 | `skill-center` は `normalizeSkillLifecycleView()` で canonical `skillCenter` へ集約 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |

### TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001（2026-03-19）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| handoff payload | destination view が読む `currentSkillName` を detail panel click 前に設定する | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| view transition | `handleEditSkill` は `skill-editor`、`handleAnalyzeSkill` は `skillAnalysis` へ遷移する | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| local UI state | destination 遷移後に `handleCloseDetail()` を実行し、detail panel 開閉 state を shell 遷移へ持ち越さない | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| store 境界 | 新規 slice は追加せず、既存 `useAppStore` の `setCurrentView` / `setCurrentSkillName` を再利用する | `apps/desktop/src/renderer/store` |
| 回帰検証 | `useSkillCenter.test.ts` が `setCurrentSkillName -> setCurrentView -> panel close` の順序を確認する | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts` |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest run src/renderer/navigation/navContract.test.ts src/renderer/components/organisms/AppDock/AppDock.test.tsx src/renderer/__tests__/integration/navigation.integration.test.ts` | PASS（49 tests） |
| `vitest run src/renderer/__tests__/App.renderView.viewtype.test.tsx src/renderer/navigation/skillLifecycleJourney.test.ts src/renderer/store/types.test.ts` | PASS（34 tests: TC-VT-01~04, TC-RV-01~08, TC-SL-01~11） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| `validate-phase11-screenshot-coverage --workflow docs/30-workflows/task-056d-viewtype-routing-nav` | PASS（expected=5 / covered=5） |

### TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 苦戦箇所（2026-03-17）

| 苦戦箇所 | 再発条件 | 解決策 | 標準化ルール |
| --- | --- | --- | --- |
| P40 再発: dynamic import の Vite alias 解決失敗 | モノレポルートから `await import("@/renderer/App")` を含むテストを実行する | `cd apps/desktop` が必須 | `pnpm --filter @repo/desktop exec vitest run` を標準とする |
| コンテキスト圧縮リカバリ | エージェント作業中にコンテキストウィンドウが圧縮される | `git diff --stat HEAD` + `Glob` で完了判定 | 中断復帰時は差分から未完了成果物を特定する |
| ViewType union 拡張パターン | `Record<ViewType, Config>` を使用すると全 case 強制で拡張時の影響が大きい | カテゴリコメント付き union 整理 + `renderView()` default fallback | union 拡張は `types.ts` + `renderView()` を同一ターンで更新する |

### 実装時の苦戦箇所（TASK-UI-01-D 追補）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| ナビ契約が二重管理になりドリフト | `AppDock` と `App.tsx` が別定義で更新される | `navContract.ts` へ契約集約し、UIは参照のみへ変更 | ViewType導線は単一契約ファイルを正本とする |
| 編集中にショートカット誤発火 | global `keydown` でターゲット種別を判定しない | `isEditableEventTarget` を導入し、入力要素上を無効化 | グローバル導線は「修飾キー条件 + 編集要素除外」を必須化 |
| 再撮影時の保存先/ポート運用が不安定 | workflow固定出力先 + strictPort競合時の分岐未記録 | 運用ガードを未タスク化し、preflight結果を成果物に記録 | `Port 5177` preflight と分岐ログを Step 2 記録に含める |

### 同種課題の簡潔解決手順（5ステップ）

1. ViewType導線契約を `navContract.ts` に集約し、Store/UI境界を固定する。  
2. `keydown` 導線へ編集要素除外を適用し、誤発火を単体テストで固定する。  
3. AppDock表示順と `NAV_SHORTCUT_TO_VIEW` の整合を同一PR単位で更新する。  
4. Phase 11 証跡（`TC-xx` + `.png`）を workflow 配下へ保存し、coverage validator を実行する。  
5. `lsof -nP -iTCP:5177 -sTCP:LISTEN` で preflight を実施し、分岐結果と未タスク化要否を `task-workflow`/`lessons` に同時記録する。
---


---

## 続き

後半コンテンツは分割ファイルを参照:
- [arch-state-management-skill-creator.md](arch-state-management-skill-creator.md) — LLMConfigProvider + SkillCreator状態管理
