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
| messages / input / streamContent / error | `useWorkspaceChatController` | chat固有の一時状態で view 内に閉じる |
| selected context files | `fileSelectionSlice` | 04A/04B で共有される背景情報 |
| selected workspace file | `workspaceSlice` | file browser / preview / chat attach で共通利用 |
| selected provider/model | `llmSlice`（selector） | 既存 LLM 設定を再利用 |
| conversationId | `useWorkspaceChatController` | workspace chat session の局所管理 |

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

## AgentView -> SkillAnalysis handoff 状態契約（TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001）

### 状態配置

| 状態 | 所有者 | 理由 |
| --- | --- | --- |
| `selectedSkillName` | Agent 実行系 store selector | Agent surface 上の選択スキルと実行対象を既存責務のまま再利用するため |
| `skillExecutionStatus` / `isExecuting` | Agent 実行系 store selector | CTA 表示条件を既存実行状態から導出し、新規 slice を増やさないため |
| `currentSkillName` | Navigation / skill lifecycle 共有 state | `skillAnalysis` 到達時の対象スキル名を surface 間で引き継ぐため |
| `viewHistory` | Navigation slice | Agent 起点の戻り導線判定を renderer shell で一元化するため |
| `onNavigateBack` / `onNavigateToAgent` | `App.tsx` render layer の派生 props | store に余分な UI state を持たず、遷移文脈だけを派生値で注入するため |

### 境界ルール

| 項目 | 契約 |
| --- | --- |
| CTA 表示 | `canOfferAnalysis = selectedSkillName && skillExecutionStatus === "completed" && !isExecuting` の派生値で判定し、永続 state に保存しない |
| handoff 順序 | `selectedSkillName` を trim して `setCurrentSkillName()` した後に `setCurrentView("skillAnalysis")` を実行する |
| optional props | `SkillAnalysisView` の `onNavigateBack` / `onNavigateToAgent` は `previousView === "agent"` の場合だけ渡す |
| close との分離 | `onClose` は常に `skillCenter` へ戻る既存契約を維持し、Agent round-trip は optional props 側で扱う |
| slice 方針 | Task04 でも新規 Zustand slice は追加しない。既存 Agent / Navigation / lifecycle state の組み合わせで解く |

### follow-up note

- `viewHistory` の伸長制御は Task04 の follow-up `UT-FIX-VIEWHISTORY-ACCUMULATION-001` で formalize し、本タスクでは既存履歴モデルを壊さない範囲に留める。

### 個別セレクタ追加（2026-03-20）

| セレクタ名 | 戻り値型 | 用途 |
| --- | --- | --- |
| `useSetCurrentView` | `(view: ViewType) => void` | View 遷移アクション。AgentView CTA / round-trip callback で使用 |
| `useSetCurrentSkillName` | `(name: string \| null) => void` | スキル名共有 state 更新。handoff payload 設定で使用 |

- 追加理由: `AgentView` / `SkillAnalysisView` の handoff / round-trip callback で、合成 Hook を経由せず安定した参照を取得するため（P31 対策）
- 影響: 既存テスト（`AgentView.test.tsx`, `AgentView.layout.test.tsx`）の `vi.mock` にモック追加が必要（P21/P35 パターン）

> 詳細な実装ログ・セレクタ一覧・各タスクの検証証跡は [arch-state-management-reference-selectors.md](arch-state-management-reference-selectors.md) を参照。

```
[*] --> idle
idle --> ready: capability ok (API key configured)
idle --> blocked: no capability (API key missing)
ready --> streaming: user sends message
streaming --> completed: done signal
streaming --> error: error signal
streaming --> cancelled: user cancels
completed --> ready: reset for next message
cancelled --> ready: reset for next message
error --> ready: user dismisses / retry
blocked --> ready: API key configured
ready --> handoff: terminal-handoff button clicked
handoff --> ready: return from terminal
```

### 設計判断

- 新規 Slice: **不要**。既存 `chatSlice` を拡張する方針とする
- Store 統一: `useStreamingChat` 内の `useStore()` を `useAppStore()` に統一する
- P62 対策: Provider/Model 未選択時は `blocked` 状態に遷移し、暗黙 fallback を行わない
- silent fallback 禁止: capability 不足時は `HandoffBlock` + `ErrorGuidance` で明示的にユーザーに通知する

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | ChatPanel の実 AI チャット配線（設計） | **spec_created**（2026-03-18） |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 | Main Chat/Settings AI runtime 同期 | **完了**（2026-03-17） |
---
## AccessCapability の shared パッケージ移動（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 / Task01）

> 詳細仕様は [arch-execution-capability-contract.md](arch-execution-capability-contract.md) を参照。

完了日: 2026-03-20。`AccessCapability` 型を `chatSlice.ts`（Renderer ローカル）から `packages/shared/src/types/execution-capability.ts` へ移動。`chatSlice.ts` は re-export パターンで後方互換性を維持する。

---
## 公開・配布状態管理設計（TASK-SKILL-LIFECYCLE-08 / spec_created）

TASK-SKILL-LIFECYCLE-08 では publish/distribution 領域の store 責務を設計済み（実装未着手）。

### publishingSlice 境界

| 状態 | 所有者 | 補足 |
| --- | --- | --- |
| `visibilityFilter` | `publishingSlice` | `"all" | SkillVisibility` で一覧フィルタを制御 |
| `publishReadiness` | `publishingSlice` | `auto-approved` 等の公開判定結果を保持 |
| `compatibilityResult` | `publishingSlice` | version 更新時の互換性評価結果を保持 |
| `publishDialogState` | `publishingSlice` | register/check/confirm の3ステップ進行状態 |

### state 不変条件

- `visibilityFilter` の初期値は `"all"`。
- `publishReadiness.status === "blocked"` のとき confirm アクションを禁止する。
- `compatibilityResult.level === "breaking"` かつ major バンプなしは confirm 不可。

### 実装移行の未タスク
- `UT-SKILL-LIFECYCLE-08-TYPE-IMPL`
- `UT-SKILL-LIFECYCLE-08-UI-IMPL`
