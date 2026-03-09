# 状態管理パターン（Desktop Renderer）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v3.13.1    | 2026-03-09 | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 再監査追補: `ChatPanel` の現行実装が `useIsSkillExecuting()` 個別セレクタへ移行済みであることを仕様へ是正。あわせて execute 側ガード実装時の苦戦箇所（CLI drift / Router 二重化 / workflow 本文 stale）と 5分解決カードへの導線を追加し、残未タスクは `UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001` の 1 件へ整理 |
| v3.13.0    | 2026-03-09 | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 反映: `executeSkill` に `isExecuting` 同期ガード（FR-01）を追加。`get().isExecuting` チェックを async 操作前に配置し、microtask 境界を跨がない同期的ガードで二重実行を防止。Store層ガード + 既存UIガード（ExecuteButton null render / AgentExecutionView disabled / ChatPanel toggle disabled）の二重防御アーキテクチャを確立。テスト9件（T-01〜T-05, T-09〜T-12）全PASS、Line Coverage 95.37% |
| v3.12.1    | 2026-03-09 | TASK-10A-F Phase 12 再同期を追補。current workflow に実スクリーンショット11件、validator 準拠 `manual-test-result.md`、Part 1/2 完備 `implementation-guide.md` を再配置した実装内容と、P53 placeholder 除去・implementation-guide literal 見出し・unassigned legacy baseline 分離報告の苦戦箇所を追加 |
| v3.12.0    | 2026-03-08 | TASK-043D テスト品質ゲート設計反映: agentSlice責務境界拡張テスト8ファイル（boundary/combination/edge-cases/error-cases/extension/import-lifecycle/p31-regression/selectors）追加。customStorage 3段ガードパターンのテスト新規作成（184行）。navigationSlice に viewHistory 破損時の iterable hardening テスト追加。SkillAnalysisView/SkillCreateWizard の Store統合テスト追加。store/index.ts に新規セレクタエクスポート63行追加 |
| v3.11.0    | 2026-03-08 | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 反映: `customStorage` の getItem/setItem に iterable guard（DD-01/DD-02）を追加。`expandedFolders` の `Array.isArray` + `typeof === "string"` フィルタリング、非配列入力時の `Set<string>()` フォールバック、`setItem` での `Set`/`Array` 二重対応を persist 復旧契約として明文化。`useCanGoBack` に `Array.isArray(state.viewHistory)` ガードを追加。branch横断 Phase 12 再監査で workflow 10/11/12 の Phase 12 不足を検出し未タスク3件へ分離 |
| v3.11.0    | 2026-03-07 | TASK-10A-F 反映: useSkillAnalysis.ts の直接IPC呼び出し3箇所（analyze/applyImprovements/autoImprove）をStore個別セレクタ経由に移行。ローカルstate（analysis/isAnalyzing/isImproving/error）をStore参照に置換し、selectedSuggestions/improvementResult はローカル維持（Case B方式）。isMountedRef パターン廃止 |
| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v3.10.1    | 2026-03-07 | TASK-10A-F 反映: Skill lifecycle UI の direct IPC 排除を仕様同期。`useSkillAnalysis` の Store個別セレクタ利用、Phase 11 screenshot 11件、TASK-10A-D/E-C/F の責務境界を追記                                                                                                                                   |
| v3.9.0     | 2026-03-06 | TASK-10A-E-C 反映: import lifecycle の store 駆動設計を同期。`useAvailableSkillsForImport` / `useFilteredAvailableSkills` と `useShallow` 適用条件、`importSkill` の状態遷移（`isImporting`/`importingSkillName`/`skillError`）および TASK-10A-F 境界を追記                                                  |
| v3.8.9     | 2026-03-06 | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 反映: AuthMode の現行 selector 実装（`store/index.ts` 正本、`useEffect([initializeAuthMode])`、`AuthModeStatus` 表示契約）へ更新し、旧 `useRef` ガード前提と削除済み hook path を是正                                                                              |
| v3.8.8     | 2026-03-06 | TASK-043B 再監査を反映: `importSkill` の non-throw failure 契約に追従する post-condition 成功判定、dialog open 中の error surface 一元化、`SkillImportDialog.test.tsx` の `useAppStore.getState()` モック契約を追加                                                                                          |
| v3.10.0    | 2026-03-07 | TASK-UI-03 反映: agentSlice拡張（2状態: recentExecutions/isAdvancedSettingsOpen + 3アクション: addExecutionToHistory/clearExecutionHistory/setAdvancedSettingsOpen + 5個別セレクタ）を状態定義・アクション定義テーブルへ追記。ExecutionSummary型を追加                                                       |
| v3.9.1     | 2026-03-06 | TASK-UI-02 追補: `navigationSlice` / `uiSlice` / `useNavShortcuts` の責務境界、mobile More close、rollback 共存時の state ownership に関する苦戦箇所と再利用手順を追加                                                                                                                                       |
| v3.9.0     | 2026-03-06 | TASK-UI-02-GLOBAL-NAV-CORE 反映: `uiSlice` に `isNavExpanded` / `isMobileMoreOpen` を追加し、`AppLayout` / `GlobalNavStrip` / `MobileNavBar` の状態同期と rollback feature flag を記録。`Cmd/Ctrl+[` 戻る導線、tablet collapsed 固定、Phase 11 手動検証証跡を追記                                            |
| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v3.11.0    | 2026-03-07 | TASK-10A-F 反映: useSkillAnalysis.ts の直接IPC呼び出し3箇所（analyze/applyImprovements/autoImprove）をStore個別セレクタ経由に移行。ローカルstate（analysis/isAnalyzing/isImproving/error）をStore参照に置換し、selectedSuggestions/improvementResult はローカル維持（Case B方式）。isMountedRef パターン廃止 |
| v3.9.0     | 2026-03-06 | TASK-10A-E-C 反映: import lifecycle の store 駆動設計を同期。`useAvailableSkillsForImport` / `useFilteredAvailableSkills` と `useShallow` 適用条件、`importSkill` の状態遷移（`isImporting`/`importingSkillName`/`skillError`）および TASK-10A-F 境界を追記                                                  |
| v3.8.9     | 2026-03-06 | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 反映: AuthMode の現行 selector 実装（`store/index.ts` 正本、`useEffect([initializeAuthMode])`、`AuthModeStatus` 表示契約）へ更新し、旧 `useRef` ガード前提と削除済み hook path を是正                                                                              |
| v3.8.8     | 2026-03-06 | TASK-043B 再監査を反映: `importSkill` の non-throw failure 契約に追従する post-condition 成功判定、dialog open 中の error surface 一元化、`SkillImportDialog.test.tsx` の `useAppStore.getState()` モック契約を追加                                                                                          |
| v3.10.0    | 2026-03-07 | TASK-UI-03 反映: agentSlice拡張（2状態: recentExecutions/isAdvancedSettingsOpen + 3アクション: addExecutionToHistory/clearExecutionHistory/setAdvancedSettingsOpen + 5個別セレクタ）を状態定義・アクション定義テーブルへ追記。ExecutionSummary型を追加                                                       |
| v3.9.1     | 2026-03-06 | TASK-UI-02 追補: `navigationSlice` / `uiSlice` / `useNavShortcuts` の責務境界、mobile More close、rollback 共存時の state ownership に関する苦戦箇所と再利用手順を追加                                                                                                                                       |
| v3.9.0     | 2026-03-06 | TASK-UI-02-GLOBAL-NAV-CORE 反映: `uiSlice` に `isNavExpanded` / `isMobileMoreOpen` を追加し、`AppLayout` / `GlobalNavStrip` / `MobileNavBar` の状態同期と rollback feature flag を記録。`Cmd/Ctrl+[` 戻る導線、tablet collapsed 固定、Phase 11 手動検証証跡を追記                                            |

| v3.8.7     | 2026-03-05 | TASK-UI-01-D 追補: ViewType導線の実装要点と苦戦箇所（契約二重管理、編集要素誤発火、再撮影運用ギャップ）を再発条件付きで追加。`Port 5177` preflight を含む 5 ステップ手順を明文化 |
| v3.8.6     | 2026-03-05 | TASK-UI-01-D-VIEWTYPE-ROUTING-NAV 反映: `App.tsx` の ViewType ルーティング網羅、`navigation/navContract.ts` による AppDock 契約一元化、Cmd/Ctrl ショートカット解決ロジック、Phase 11 画面証跡（5件）を同期。関連タスクを完了へ更新 |
| v3.8.5     | 2026-03-05 | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 反映: `notificationSlice` / `historySearchSlice` 実装を同期。通知100件保持ルール、history検索状態、Main/Preload連携契約、テスト37件PASSを追記し、関連タスクステータスを完了へ更新 |
| v3.8.4     | 2026-03-05 | TASK-UI-01-A-STORE-SLICE-BASELINE 反映: `store/types.ts` の baseline 型定義と `store/sliceBaseline.ts` の棚卸し定数（16行 inventory / 境界マトリクス / セレクタ規約）を追加。Notification/HistorySearch/SkillCenter/ViewType の責務境界を仕様化し、Phase 11 TC証跡（3件）と整合する検証手順を追記 |
| v3.8.3     | 2026-03-04 | TASK-UI-00-DESIGN-FOUNDATION 反映: UI基盤8コンポーネントの状態管理方針を追記。共有Storeを新設せず、ローカル state + コールバック注入で責務分離する設計を明文化 |
| v3.8.2     | 2026-03-04 | TASK-FIX-SKILL-IMPORT 三連続是正を反映。`agentSlice.importSkill` に既存インポート時の IPC 呼び出しスキップ（idempotency guard）を追加し、`importedSkills` 重複追加を防止。SkillCenter 系 Hook の nullish 防御（`available/imported` の空配列フォールバック、`normalizeSearchText`）を状態管理契約として追記 |
| v3.8.1     | 2026-03-03 | TASK-10A-D教訓反映: 個別セレクタの命名規約（ドメインサフィックス必須ルール）を追加。`useIsAnalyzingSkill()` vs `useIsAnalyzing()` の命名判断基準を明文化 |
| v3.8.0     | 2026-03-03 | TASK-10A-D反映: agentSlice拡張（3状態: currentAnalysis/isAnalyzing/isImproving + 5アクション: analyzeSkill/applySkillImprovements/autoImproveSkill/createSkill/clearAnalysis + 8個別セレクタ）を状態定義・アクション定義テーブルへ追記 |
| v3.7.2     | 2026-03-02 | TASK-UI-05B 追補: SubAgent-D 観点の苦戦箇所（責務分離の記述漏れ、監査結果の current/baseline 誤読）と5ステップ再利用手順を追加 |
| v3.7.1     | 2026-03-02 | TASK-UI-05B 実装完了同期: Skill Advanced Views の状態を `completed` に更新。4ビュー（Chain/Schedule/Debug/Analytics）の Hook 実装・導線追加・テスト完了を反映 |
| v3.7.0     | 2026-03-01 | TASK-UI-05B spec_created を反映: Skill Advanced Views（4ビュー）の状態管理方針を追加。新規Zustand Sliceなし、useStateベースカスタムHook + agentSlice個別セレクタの設計を記録 |
| v1.18.0    | 2026-03-01 | TASK-UI-05反映: SkillCenterView の状態管理パターンを追記（agentSlice個別セレクタ利用、UI一時状態を `useSkillCenter` に局所化、Store型とのカテゴリ境界を未タスク化） |
| v1.17.0    | 2026-02-12 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 追補: 実装時の苦戦箇所と再発防止策を追加（単体テスト再実行コマンド標準化、未タスク参照の物理ファイル検証、性能テスト揺らぎ時の再現確認手順） |
| v1.16.0    | 2026-02-12 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了: AgentViewを個別セレクタHookに移行（15セレクタ追加）、ローカルfetchSkills/useCallback削除、P31適用範囲をAgentViewまで拡張 |
| v1.15.0    | 2026-02-12 | UT-STORE-HOOKS-TEST-REFACTOR-001完了: Store Hooksテスト実装ガイドセクション追加（renderHookパターン6種、テスト環境要件、実績テーブル） |
| v1.14.0    | 2026-02-12 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001完了: P31対策セクションに個別セレクタ実装完了記録追加、関連タスクステータス更新（UT-STORE-HOOKS-REFACTOR-001、UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 → 完了）。71テスト全PASS |
| v1.13.0    | 2026-02-12 | UT-STORE-HOOKS-REFACTOR-001完了: 53個の個別セレクタ追加（AuthMode 12個, LLM 16個, Agent 25個）、合成Hook非推奨化、Phase 12課題追記 |
| v1.12.0    | 2026-02-10 | P31対策実装詳細追加: SettingsView/SkillSelector変更箇所、実装時の4課題と解決策、開発者向けチェックリスト |
| v1.11.0    | 2026-02-10 | P31対策セクション追加: Store Hooks無限ループ防止パターン（useRefガード、依存配列設計、個別セレクタ再設計） |
| v1.10.0    | 2026-02-10 | TASK-UT-AUTH-MODE-UI-INTEGRATION完了: 未タスク2件追加（UT-STORE-HOOKS-REFACTOR-001, UT-FIX-APP-INITAUTH-CHECK-001）、TASK-FIX-6-1-STATE-CENTRALIZATION完了: skillSliceをagentSliceに統合、executionId事前生成によるrace condition対策 |
| v1.9.0     | 2026-02-06 | TASK-AUTH-SESSION-REFRESH-001完了: authSliceにsessionExpiresAt/isRefreshing追加、セキュリティ考慮事項・関連タスク記載 |
| v1.8.0     | 2026-02-02 | 両ブランチ統合: task-imp-permission-date-filter完了+TASK-8B完了 |
| v1.7.0     | 2026-02-02 | 実装詳細拡充: dateFilterUtils.ts実装ファイル追加、テストファイル2件追加、フィルタリングパイプライン仕様追加、品質メトリクス72テスト反映 |
| v1.6.0     | 2026-02-02 | task-imp-permission-date-filter完了: DateRangeFilter/DatePreset型追加、TASK-8Bコンポーネントテスト（280テスト）追加 |
| v1.5.0     | 2026-02-01 | task-imp-permission-history-001完了: permissionHistorySlice追加、関連タスク更新 |
| v1.4.0     | 2026-01-30 | task-imp-permission-readable-ui-001完了: 関連タスクテーブル更新                 |
| v1.3.0     | 2026-01-30 | TASK-7A完了: SkillSelectorステータス更新                                        |
| v1.2.0     | 2026-01-28 | TASK-6-1完了: skillSliceセクション追加                                          |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式に変換                               |
| v1.0.0     | 2026-01-23 | 初版作成                                                                        |

---

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
| TASK-UI-01-A-STORE-SLICE-BASELINE | Store境界の基準化 | **完了**（2026-03-05） |
| TASK-UI-01-B-IPC-CONTRACT-SECURITY | IPC契約とセキュリティ同期 | 後続 |
| TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN | Notification/HistorySearch実装 | **完了**（2026-03-05） |
| TASK-UI-01-D-VIEWTYPE-ROUTING-NAV | ViewType/導線実装 | **完了**（2026-03-05） |

---

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

## ViewType/ナビ導線 実装同期（TASK-UI-01-D-VIEWTYPE-ROUTING-NAV）

### 変更点（状態管理観点）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| ViewType導線 | `workspace` / `skillCenter` / `historySearch` の導線を `renderView()` で網羅 | `apps/desktop/src/renderer/App.tsx` |
| 契約一元化 | AppDock ナビ項目を `navContract.ts` へ集約し、重複定義を除去 | `apps/desktop/src/renderer/navigation/navContract.ts` |
| ショートカット | `Cmd` / `Ctrl` 両対応。`alt` / `shift` 併用時・編集要素上は無効化 | `apps/desktop/src/renderer/navigation/navContract.ts`, `apps/desktop/src/renderer/App.tsx` |
| AppDock連携 | `APP_DOCK_NAV_ITEMS` を参照し、表示順と ViewType 契約を固定 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest run src/renderer/navigation/navContract.test.ts src/renderer/components/organisms/AppDock/AppDock.test.tsx src/renderer/__tests__/integration/navigation.integration.test.ts` | PASS（49 tests） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| `validate-phase11-screenshot-coverage --workflow docs/30-workflows/task-056d-viewtype-routing-nav` | PASS（expected=5 / covered=5） |

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

## Zustand Sliceパターン

### 概要

デスクトップアプリ（Electron）では、Zustandを使用した状態管理を採用。
機能単位でSliceを分離し、型安全性と保守性を確保する。

**実装場所**: `apps/desktop/src/renderer/store/slices/`

### Sliceの基本構造

各SliceはStateCreator型を使用して定義し、状態とアクションを分離する。

**必須ファイル構成**:

| ファイル                        | 役割                         |
| ------------------------------- | ---------------------------- |
| `{name}Slice.ts`                | Slice定義（状態+アクション） |
| `__tests__/{name}Slice.test.ts` | ユニットテスト               |

**Slice定義パターン**:

| 要素                 | 説明                         |
| -------------------- | ---------------------------- |
| `{Name}State`        | 状態のインターフェース       |
| `{Name}Actions`      | アクションのインターフェース |
| `{Name}Slice`        | State + Actions の統合型     |
| `initial{Name}State` | 初期状態オブジェクト         |
| `create{Name}Slice`  | StateCreator関数             |

### 既存Slice一覧

| Slice名                  | 責務                     | 実装ファイル                             | タスク                          |
| ------------------------ | ------------------------ | ---------------------------------------- | ------------------------------- |
| `uiSlice`                | UI状態（currentView等）  | `store/slices/uiSlice.ts`                | -                               |
| `authSlice`              | 認証状態                 | `store/slices/authSlice.ts`              | -                               |
| `chatSlice`              | チャット状態             | `store/slices/chatSlice.ts`              | -                               |
| `agentSlice`             | エージェント・スキル管理 | `store/slices/agentSlice.ts`             | AGENT-002                       |
| `skillSlice`             | **統合済み→agentSlice** | ~~`store/slices/skillSlice.ts`~~（削除済み）  | TASK-FIX-6-1（統合完了） |
| `permissionHistorySlice` | 権限要求履歴管理         | `store/slices/permissionHistorySlice.ts` | task-imp-permission-history-001 |
| `notificationSlice`      | 通知履歴/未読管理        | `store/slices/notificationSlice.ts`      | TASK-UI-01-C（完了）            |
| `historySearchSlice`     | 履歴検索状態管理         | `store/slices/historySearchSlice.ts`     | TASK-UI-01-C（完了）            |

### authSlice詳細（TASK-AUTH-SESSION-REFRESH-001更新）

**実装ファイル**: `apps/desktop/src/renderer/store/slices/authSlice.ts`

**状態定義**:

| プロパティ         | 型                  | 初期値  | 説明                                         |
| ------------------ | ------------------- | ------- | -------------------------------------------- |
| `isAuthenticated`  | `boolean`           | `false` | 認証状態                                     |
| `isLoading`        | `boolean`           | `false` | ローディング中                               |
| `authUser`         | `AuthUser \| null`  | `null`  | 認証済みユーザー情報                         |
| `sessionExpiresAt` | `number \| null`    | `null`  | セッション有効期限（UNIXタイムスタンプ秒）   |
| `isRefreshing`     | `boolean`           | `false` | トークンリフレッシュ中フラグ                 |
| `linkedProviders`  | `LinkedProvider[]`  | `[]`    | 連携済みプロバイダー一覧                     |
| `error`            | `string \| null`    | `null`  | エラーメッセージ                             |

**セキュリティ考慮事項**:
- トークン情報はRenderer側の状態に保存しない（Main Processのみで管理）
- Rendererには `sessionExpiresAt`（有効期限のみ）と `isRefreshing`（更新状態のみ）を公開
- リスナー二重登録防止: モジュールスコープ `authListenerRegistered` フラグでガード

**関連タスク**:

| タスクID                         | 内容                         | ステータス |
| -------------------------------- | ---------------------------- | ---------- |
| TASK-FIX-GOOGLE-LOGIN-001       | Googleログイン修正           | **完了**   |
| AUTH-UI-001                      | 認証UI改善                   | **完了**   |
| TASK-AUTH-SESSION-REFRESH-001    | セッション自動リフレッシュ   | **完了**   |
| TASK-UT-AUTH-MODE-UI-INTEGRATION | AuthMode UI統合              | **完了**   |
| UT-STORE-HOOKS-REFACTOR-001      | Store Hooks個別セレクタ再設計 | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施） |
| UT-STORE-HOOKS-REFACTOR-002      | 状態セレクタのJSDoc追加       | 未実施     |
| UT-STORE-HOOKS-REFACTOR-003      | 合成Hook移行                  | 未実施     |
| UT-FIX-APP-INITAUTH-CHECK-001    | App.tsx initializeAuth確認    | 未実施     |

### agentSlice詳細

**状態定義**:

| プロパティ           | 型                     | 説明               |
| -------------------- | ---------------------- | ------------------ |
| `skills`             | `Skill[]`              | スキル一覧         |
| `selectedSkill`      | `Skill \| null`        | 選択中のスキル     |
| `skillFilter`        | `string`               | フィルター文字列   |
| `skillCategory`      | `string \| null`       | カテゴリフィルター |
| `executionStatus`    | `AgentExecutionStatus` | 実行状態           |
| `currentExecutionId` | `string \| null`       | 実行ID             |
| `executionOutput`    | `string[]`             | 実行出力           |
| `isLoading`          | `boolean`              | ローディング状態   |
| `error`              | `string \| null`       | エラーメッセージ   |
| `currentAnalysis`    | `SkillAnalysis \| null` | 分析結果（TASK-10A-D追加） |
| `isAnalyzing`        | `boolean`               | 分析中フラグ（TASK-10A-D追加） |
| `isImproving`        | `boolean`               | 改善中フラグ（TASK-10A-D追加） |
| `recentExecutions`       | `ExecutionSummary[]`    | 実行履歴（最大10件、`MAX_EXECUTION_HISTORY`定数）（TASK-UI-03追加） |
| `isAdvancedSettingsOpen`  | `boolean`               | 詳細設定パネル開閉状態（TASK-UI-03追加） |

**アクション定義**:

| アクション           | 引数                           | 説明           |
| -------------------- | ------------------------------ | -------------- |
| `setSkills`          | `skills: Skill[]`              | スキル一覧設定 |
| `selectSkill`        | `skill: Skill \| null`         | スキル選択     |
| `setSkillFilter`     | `filter: string`               | フィルター設定 |
| `setSkillCategory`   | `category: string \| null`     | カテゴリ設定   |
| `setExecutionStatus` | `status: AgentExecutionStatus` | 実行状態設定   |
| `appendOutput`       | `output: string`               | 出力追加       |
| `clearExecution`     | -                              | 実行クリア     |
| `resetAgentState`    | -                              | 状態リセット   |
| `analyzeSkill`           | `skillName: string`                                  | 分析実行（TASK-10A-D追加）     |
| `applySkillImprovements` | `skillName: string, suggestions: Suggestion[]`       | 改善提案適用（TASK-10A-D追加） |
| `autoImproveSkill`       | `skillName: string`                                  | 全自動改善（TASK-10A-D追加）   |
| `createSkill`            | `description: string, options: CreateOptions`         | スキル作成（TASK-10A-D追加）   |
| `clearAnalysis`          | -                                                     | 分析結果クリア（TASK-10A-D追加） |
| `addExecutionToHistory`      | `summary: ExecutionSummary`                           | 実行履歴に先頭追加、10件超で末尾削除（TASK-UI-03追加） |
| `clearExecutionHistory`      | -                                                     | 実行履歴全クリア（TASK-UI-03追加） |
| `setAdvancedSettingsOpen`    | `isOpen: boolean`                                     | 詳細設定パネル開閉制御（TASK-UI-03追加） |

**ExecutionSummary型（TASK-UI-03追加）**:

| プロパティ         | 型                                                      | 説明                   |
| ------------------ | ------------------------------------------------------- | ---------------------- |
| `executionId`      | `string`                                                | 実行ID                 |
| `skillName`        | `string`                                                | スキル名               |
| `skillDisplayName` | `string`                                                | スキル表示名           |
| `status`           | `"completed" \| "failed" \| "executing" \| "cancelled"` | 実行ステータス         |
| `startedAt`        | `Date`                                                  | 開始日時               |
| `completedAt`      | `Date \| null`                                          | 完了日時（未完了はnull） |
| `duration`         | `number \| null`                                        | 実行時間（ミリ秒、未完了はnull） |

**個別セレクタ一覧（TASK-UI-03追加）**:

| セレクタ                        | 種別     | 返却型                                          |
| ------------------------------- | -------- | ----------------------------------------------- |
| `useRecentExecutions()`         | 状態     | `ExecutionSummary[]`                             |
| `useAddExecutionToHistory()`    | アクション | `(summary: ExecutionSummary) => void`           |
| `useIsAdvancedSettingsOpen()`   | 状態     | `boolean`                                        |
| `useSetAdvancedSettingsOpen()`  | アクション | `(isOpen: boolean) => void`                     |
| `useClearExecutionHistory()`    | アクション | `() => void`                                    |

### 新規Slice追加手順

**ステップ1: Slice定義**

- `store/slices/{name}Slice.ts` を作成
- State、Actions、Slice インターフェースを定義
- initialStateとcreateSlice関数を実装

**ステップ2: Store統合**

- `store/index.ts` でSliceをimport
- createStoreのcombine関数にSliceを追加

**ステップ3: View追加（必要な場合）**

- `views/{Name}View/index.tsx` を作成
- `App.tsx` のrenderView関数にcaseを追加
- `navigation/navContract.ts` の契約へ追加し、`components/organisms/AppDock/index.tsx` から参照

**ステップ4: テスト作成**

- `store/slices/__tests__/{name}Slice.test.ts` を作成
- 全アクションのテストを実装

---

## P31対策: Store Hooks無限ループ防止パターン

> 参照: [06-known-pitfalls.md#P31](../../../rules/06-known-pitfalls.md#p31-zustand-store-hooks無限ループ)

### 問題の概要

合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する。

### 症状

- 設定画面がぐるぐる回り続ける
- LLM/スキル選択が無限実行される
- DevToolsでStateの更新が連続発生

### 対象コンポーネント

| コンポーネント     | ファイルパス                                                              | 影響するHook         |
| ------------------ | ------------------------------------------------------------------------- | -------------------- |
| `SettingsView`     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                  | `useInitializeAuthMode()`（現行は個別セレクタへ移行済み） |
| `LLMSelectorPanel` | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`           | `useFetchProviders()` / `useCheckLLMHealth()`（個別セレクタ） |
| `SkillSelector`    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`            | `useRescanSkills()`（個別セレクタ） |
| `AgentView`        | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | `useAppStore()` のインラインセレクタ + ローカル `fetchSkills` |
| `SkillCenterView`  | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | `useAvailableSkillsMetadata()` など個別セレクタ + `useSkillCenter` ローカル状態 |

### 歴史的な短期回避策: useRefガードパターン

初期リリースでは useRef ガードを一時的に採用したが、現在の標準実装は個別セレクタ + 安定参照の依存配列である。

**アンチパターン（無限ループ発生）**:

```typescript
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 毎回新しい関数参照 → 無限ループ
```

**旧パターン（現在は非推奨）**:

```typescript
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []); // 依存配列は空
```

### 依存配列設計のベストプラクティス

| ケース                         | 依存配列                     | 備考                                   |
| ------------------------------ | ---------------------------- | -------------------------------------- |
| 初期化処理（一度だけ実行）     | `[stableAction]`             | 個別セレクタの安定参照を前提とする     |
| プリミティブ値の変化で再実行   | `[primitiveValue]`           | 安全                                   |
| 合成Hookから取り出した関数     | 使用禁止                     | 毎回新しい参照となり無限ループの原因   |
| 外部から受け取ったコールバック | `[callback]`                 | useCallbackでメモ化されていれば安全    |

### 個別セレクタHookパターン（推奨）

> **P31対策として確立** (UT-STORE-HOOKS-COMPONENT-MIGRATION-001)

合成Hook（`useLLMStore()`等）の代わりに、個別セレクタHookを使用する。

**推奨パターン**:

```typescript
// ✅ 推奨: 個別セレクタ
const providers = useLLMProviders();
const fetchProviders = useLLMFetchProviders();

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 参照安定 → 安全

// ❌ 非推奨: 合成Hook
const { providers, fetchProviders } = useLLMStore();

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 毎回新参照 → 無限ループ
```

**個別セレクタの定義パターン**:

```typescript
// State セレクタ（値を返す）
export const useLLMProviders = () => useAppStore((state) => state.providers);

// Action セレクタ（関数を返す - 参照安定）
export const useLLMFetchProviders = () => useAppStore((state) => state.fetchProviders);
```

**個別セレクタの命名規約**:

| ルール | 命名パターン | 例 |
| --- | --- | --- |
| 状態セレクタ | `use` + 状態名 + 機能ドメインサフィックス | `useIsAnalyzingSkill()` (`useIsAnalyzing()` は不可) |
| アクションセレクタ | `use` + 動詞 + 対象 + 機能ドメインサフィックス | `useAnalyzeSkill()`, `useApplySkillImprovements()` |
| 汎用名の回避 | 複数Sliceで同名になりうる場合はドメインを明示 | `useSkillError()` (`useError()` は不可) |

> **TASK-10A-D教訓**: agentSlice に `isAnalyzing` / `isImproving` を追加した際、LLMSlice の `useIsLLMLoading()` と類似する汎用名になるリスクがあった。ドメインサフィックス（`Skill`）を付与して衝突を防止。

**現行 AuthMode セレクタ**: `apps/desktop/src/renderer/store/index.ts` に状態 7 個 + アクション 10 個を配置し、`useAuthModeStore()` は互換用 deprecated helper として残す。
（UT-FIX-AGENTVIEW-INFINITE-LOOP-001でAgentView向け個別セレクタも追加し、P31適用範囲を拡張）
**提供済み個別セレクタ**: LLM系12個、Skill系15個、AuthMode系3個、AgentView Enhancement系5個（計35個）
（UT-FIX-AGENTVIEW-INFINITE-LOOP-001でAgentView向け15個を追加し、P31適用範囲を拡張）
（TASK-UI-03で実行履歴・詳細設定パネル向け5個を追加: `useRecentExecutions`, `useAddExecutionToHistory`, `useIsAdvancedSettingsOpen`, `useSetAdvancedSettingsOpen`, `useClearExecutionHistory`）


### 長期解決策: 個別セレクタベースの再設計

> **✅ 実装完了** (2026-02-12): UT-STORE-HOOKS-COMPONENT-MIGRATION-001 にて個別セレクタパターンを実装。LLM系12個・Skill系15個・AuthMode系3個の計30個の個別セレクタHookを `store/index.ts` に追加。LLMSelectorPanel、SkillSelector、SettingsView の3コンポーネントを移行し、useRefガードを削除。71テスト全PASS。

Store Hookを分解し、個別セレクタを提供することで、関数の参照安定性を確保する。

| 現行パターン                                         | 推奨パターン                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `const { authMode, setAuthMode } = useAuthModeStore()` | `const authMode = useAuthMode()`<br>`const setAuthMode = useSetAuthMode()`     |
| オブジェクト全体を返す                               | 個別の値/関数を返す                                                              |
| 毎回新しい参照                                       | 安定した参照（shallow比較可能）                                                  |

### AgentView適用拡張（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

> **✅ 実装完了** (2026-02-12): AgentViewでP31パターンを適用。`useAppStore((state) => ...)` のインラインセレクタ群を `store/index.ts` の個別セレクタHookへ移行し、ローカル `fetchSkills` の `useCallback` を廃止。

| 項目 | 変更内容 |
| ---- | -------- |
| 状態取得 | `skills/error/isLoading` 系を `useImportedSkills/useSkillError/useIsLoadingSkills` へ移行 |
| アクション | `selectSkill/setSkillFilter/openImportDialog` 等を個別セレクタHook経由へ統一 |
| 取得処理 | コンポーネント内の独自 `fetchSkills` 実装を削除し、Sliceの `useFetchSkills` に統一 |
| 品質 | デバッグ `console.log` を削除し、再レンダリング安定性テストを追加 |

#### 実装時の苦戦箇所と再発防止（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

| 苦戦箇所 | 原因 | 再発防止 |
| --- | --- | --- |
| 単体テスト対象を指定したつもりが広範囲テスト実行に拡大 | `pnpm --filter @repo/desktop run test:run -- <file>` が環境依存で全体実行に流れるケースがある | 単体再検証は `pnpm --filter @repo/desktop exec vitest run <file>` を標準化 |
| 未タスクID参照に対して指示書実体が欠落しやすい | `task-workflow.md` 更新と `unassigned-task/` 実ファイル配置の同期漏れ | Phase 12で「参照パスの物理ファイル存在確認」を必須化（`ls docs/30-workflows/unassigned-task/<file>.md`） |
| 長時間テストで性能閾値テストが一時的に不安定化 | 高負荷時にミリ秒閾値テストが揺らぐ | 失敗検知後に対象ファイル単体で再実行し、再現性を確認してから判断する |

**推奨実装パターン**:

```typescript
// store/index.ts
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);

// コンポーネント側
const authMode = useAuthMode();
const authModeStatus = useAuthModeStatus();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 安定した参照のため無限ループしない
```

### 実装済み個別セレクタ一覧（UT-STORE-HOOKS-REFACTOR-001）

個別セレクタは `apps/desktop/src/renderer/store/index.ts` を正本とする。

**AuthMode Store（現行 17 + 互換 helper 1）**: `apps/desktop/src/renderer/store/index.ts`

| カテゴリ | セレクタ名 | 戻り値型 |
| -------- | ---------- | -------- |
| 状態 | `useAuthMode` | `AuthMode` |
| 状態 | `useAuthModeStatus` | `AuthModeStatus \| null` |
| 状態 | `useAuthModeLoading` | `boolean` |
| 状態 | `useAuthModeError` | `string \| null` |
| 派生 | `useIsAuthModeValid` | `boolean` |
| 状態 | `useIsConfirmDialogOpen` | `boolean` |
| 状態 | `usePendingMode` | `AuthMode \| null` |
| アクション | `useSetAuthMode` | `(mode: AuthMode) => Promise<void>` |
| アクション | `useInitializeAuthMode` | `() => Promise<void>` |
| アクション | `useFetchAuthMode` | `() => Promise<void>` |
| アクション | `useFetchAuthModeStatus` | `() => Promise<void>` |
| アクション | `useValidateAuthMode` | `(mode?: AuthMode) => Promise<AuthModeStatus>` |
| アクション | `useOpenConfirmDialog` | `(targetMode: AuthMode) => void` |
| アクション | `useCloseConfirmDialog` | `() => void` |
| アクション | `useConfirmModeChange` | `() => Promise<void>` |
| アクション | `useClearAuthModeError` | `() => void` |
| アクション | `useResetAuthMode` | `() => void` |
| 非推奨 | `useAuthModeStore` | 合成オブジェクト（**非推奨**） |

**LLM Store（16個）**: `apps/desktop/src/renderer/store/hooks/useLLMStore.ts`

| カテゴリ | セレクタ名 | 戻り値型 |
| -------- | ---------- | -------- |
| 状態 | `useSelectedLLM` | `LLMProvider \| null` |
| 状態 | `useAvailableLLMs` | `LLMProvider[]` |
| 状態 | `useIsLLMLoading` | `boolean` |
| 状態 | `useLLMError` | `string \| null` |
| 状態 | `useIsLLMInitialized` | `boolean` |
| アクション | `useSelectLLM` | `(llm: LLMProvider \| null) => void` |
| アクション | `useSetAvailableLLMs` | `(llms: LLMProvider[]) => void` |
| アクション | `useSetLLMLoading` | `(loading: boolean) => void` |
| アクション | `useSetLLMError` | `(error: string \| null) => void` |
| アクション | `useClearLLMError` | `() => void` |
| アクション | `useInitializeLLMs` | `() => Promise<void>` |
| アクション | `useSetLLMInitialized` | `(initialized: boolean) => void` |
| アクション | `useRefreshLLMs` | `() => Promise<void>` |
| 派生 | `useHasValidLLMSelection` | `boolean` |
| 派生 | `useLLMDisplayName` | `string` |
| 非推奨 | `useLLMStore` | 合成オブジェクト（**非推奨**） |

**Agent Store（25個）**: `apps/desktop/src/renderer/store/hooks/useAgentStore.ts`

| カテゴリ | セレクタ名 | 戻り値型 |
| -------- | ---------- | -------- |
| スキル状態 | `useSkills` | `Skill[]` |
| スキル状態 | `useSelectedSkill` | `Skill \| null` |
| スキル状態 | `useSkillFilter` | `string` |
| スキル状態 | `useSkillCategory` | `string \| null` |
| スキル状態 | `useIsLoadingSkills` | `boolean` |
| スキル状態 | `useSkillError` | `string \| null` |
| 実行状態 | `useIsExecuting` | `boolean` |
| 実行状態 | `useExecutionStatus` | `AgentExecutionStatus` |
| 実行状態 | `useCurrentExecutionId` | `string \| null` |
| 実行状態 | `useExecutionOutput` | `string[]` |
| 権限状態 | `usePendingPermission` | `SkillPermissionRequest \| null` |
| スキルアクション | `useSetSkills` | `(skills: Skill[]) => void` |
| スキルアクション | `useSelectSkill` | `(skill: Skill \| null) => void` |
| スキルアクション | `useSetSkillFilter` | `(filter: string) => void` |
| スキルアクション | `useSetSkillCategory` | `(category: string \| null) => void` |
| スキルアクション | `useFetchSkills` | `() => Promise<void>` |
| スキルアクション | `useRescanSkills` | `() => Promise<void>` |
| スキルアクション | `useClearSkillError` | `() => void` |
| 実行アクション | `useExecuteSkill` | `(prompt: string) => Promise<void>` |
| 実行アクション | `useAbortExecution` | `() => void` |
| 実行アクション | `useClearExecution` | `() => void` |
| 権限アクション | `useRespondToPermission` | `(approved: boolean, remember?: boolean) => void` |
| 内部ハンドラ | `useHandleStreamMessage` | `(msg: SkillStreamMessage) => void` |
| 内部ハンドラ | `useHandleComplete` | `(executionId: string) => void` |
| 非推奨 | `useSkillStore` | 合成オブジェクト（**非推奨**） |

### 合成Hook非推奨化（@deprecated）

以下の合成Hookは非推奨となりました。個別セレクタへの移行を推奨します。

| 非推奨Hook | 移行先 | 理由 |
| ---------- | ------ | ---- |
| `useAuthModeStore()` | `useAuthMode()`, `useSetAuthMode()` 等 | 毎回新しいオブジェクトを返し無限ループの原因となる |
| `useLLMStore()` | `useSelectedLLM()`, `useSelectLLM()` 等 | 同上 |
| `useSkillStore()` | `useSkills()`, `useSelectSkill()` 等 | 同上 |

**移行パターン**:

```typescript
// 非推奨（無限ループのリスク）
const { authMode, setAuthMode, initializeAuthMode } = useAuthModeStore();

// 推奨（安定した参照）
const authMode = useAuthMode();
const setAuthMode = useSetAuthMode();
const initializeAuthMode = useInitializeAuthMode();
```

### 関連タスク

| タスクID                             | 内容                          | ステータス |
| ------------------------------------ | ----------------------------- | ---------- |
| UT-STORE-HOOKS-REFACTOR-001          | Store Hooks個別セレクタ再設計 | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施、2026-02-12） |
| UT-STORE-HOOKS-REFACTOR-002          | 状態セレクタのJSDoc追加       | 未実施     |
| UT-STORE-HOOKS-REFACTOR-003          | 合成Hook移行                  | 未実施     |
| UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 | 無限ループ根本対策            | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で根本対策実施、2026-02-12） |
| UT-STORE-HOOKS-TEST-REFACTOR-001         | Store HooksテストのrenderHookパターン移行 | **完了**（agentSlice 114テスト移行、2026-02-12） |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | AgentView無限ループ修正 | **完了**（個別セレクタ15個追加、2026-02-12） |
| task-imp-store-hooks-remaining-migration | 残コンポーネントの個別セレクタ移行 | 未実施（[指示書](../../../docs/30-workflows/unassigned-task/task-imp-store-hooks-remaining-migration.md)） |
| task-ref-store-hooks-deprecate-composite | 合成Store Hookの非推奨化       | 未実施（[指示書](../../../docs/30-workflows/unassigned-task/task-ref-store-hooks-deprecate-composite.md)） |

### 実装詳細（TASK-UT-AUTH-MODE-UI-INTEGRATION）

当初は useRef ガードで暫定回避したが、現行実装では個別セレクタ + 安定参照の依存配列へ移行済みである。

#### SettingsView

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/index.tsx`

**変更内容**:

| 観点 | 現行実装 |
| ---- | -------- |
| 状態取得 | `useAuthMode()`, `useAuthModeStatus()`, `useAuthModeLoading()` |
| アクション取得 | `useSetAuthMode()`, `useInitializeAuthMode()` |
| 初期化 | `useEffect(() => { initializeAuthMode(); }, [initializeAuthMode])` |
| 表示契約 | `status.message`, `status.errorCode`, `status.guidance` をそのまま描画 |

**適用パターン**:

```typescript
const authMode = useAuthMode();
const authModeStatus = useAuthModeStatus();
const authModeLoading = useAuthModeLoading();
const setAuthMode = useSetAuthMode();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

#### SkillSelector

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

**変更内容**:

| 観点 | 現行実装 |
| ---- | -------- |
| 状態取得 | `useAvailableSkillsMetadata()` など個別セレクタ |
| 再読込 | `useRescanSkills()` |
| 依存配列 | `useCallback(..., [rescanSkills])` を維持可能（参照安定） |

**適用パターン**:

```typescript
const handleRescan = useCallback(() => {
  rescanSkills();
}, [rescanSkills]);
```

### 実装時の課題と解決策

#### 課題1: ESLintキャッシュによる誤検出

**症状**: `react-hooks/exhaustive-deps` ルールが未定義として扱われ、eslint-disable コメントが認識されない

**原因**: ESLintのキャッシュが古い設定を参照していた

**解決策**:

```bash
# ESLintキャッシュをクリア
pnpm --filter @repo/desktop lint -- --cache-location node_modules/.cache/eslint
# または
rm -rf node_modules/.cache/eslint
```

**教訓**: ESLint設定変更後はキャッシュクリアが必要な場合がある

#### 課題2: Zustand合成Hookの参照不安定性

**症状**: `useAuthModeStore()` や `useSkillStore()` から取得した関数を依存配列に含めると無限ループが発生

**原因**: 合成Hookが毎回新しいオブジェクトを生成し、その中の関数参照も毎回変わる

**根本原因分析**:

| Hook種別                     | 参照安定性 | 依存配列に含めた場合 |
| ---------------------------- | ---------- | -------------------- |
| プリミティブ値セレクタ       | 安定       | 安全                 |
| 個別関数セレクタ             | 安定       | 安全                 |
| オブジェクト全体返却（現行） | 不安定     | 無限ループ発生       |

**旧短期解決策**: useRefガード + 空の依存配列（現在は新規採用しない）

**長期解決策**: 個別セレクタベースの再設計（UT-STORE-HOOKS-REFACTOR-001）

#### 課題3: コメントフォーマットの統一

**症状**: P31対策コメントの書式がファイル間で不統一

**解決策**: 以下のコメントフォーマットを標準化

```typescript
// P31対策: [理由の説明]
// 意図的に空の依存配列: [関数名]は1回だけ実行（P31対策）
```

#### 課題4: useEffect依存配列の設計判断

**症状**: ESLint `react-hooks/exhaustive-deps` ルールとP31対策が競合

**判断基準**:

| ケース                               | 推奨対応                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| 初期化処理（マウント時1回のみ）      | 個別セレクタを使い、安定した action を依存配列に含める      |
| 合成Hookから取り出した関数を使用中   | まず個別セレクタへ移行。移行完了までのみ暫定ガードを検討    |
| プリミティブ値の変化で再実行が必要   | 通常どおり依存配列に含める                                  |

**eslint-disableコメントの書き方**:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps -- P31対策: initializeAuthModeは1回のみ実行
```

#### 課題5: Phase 12ドキュメント更新漏れ（UT-STORE-HOOKS-REFACTOR-001）

**症状**: タスク完了後のシステム仕様書更新が不完全だった

**発生した漏れ**:

| 漏れ項目 | 対象ファイル | 影響 |
| -------- | ------------ | ---- |
| SKILL.md 2ファイル更新 | `aiworkflow-requirements/SKILL.md`, `task-specification-creator/SKILL.md` | 変更履歴の不整合 |
| topic-map.md 再生成 | `references/topic-map.md` | インデックスの古い状態 |

**根本原因**: Phase 12チェックリストの確認が不十分だった

**解決策**:

1. Phase 12仕様書のチェックリストを**全項目逐次確認**してから完了とする
2. 特に以下の2点は必ず確認:
   - LOGS.md は `aiworkflow-requirements/` と `task-specification-creator/` の **2ファイル両方**を更新
   - 仕様書に変更があれば `node generate-index.js` で topic-map.md を**必ず再生成**

**教訓**: Phase 12は漏れが最も発生しやすい Phase。チェックリストを「完了」と記載する前に全項目を確認する。

> 参照: [05-task-execution.md#Phase 12 必須チェックリスト](../../../rules/05-task-execution.md#phase-12-必須チェックリスト)

### Store Hooks テスト実装ガイド

> **UT-STORE-HOOKS-TEST-REFACTOR-001 で確立**（2026-02-12）

個別セレクタHookのテストは `@testing-library/react` の `renderHook` パターンを使用する。

#### テストパターン一覧

| テスト対象 | パターン | 検証例 |
|---|---|---|
| 状態セレクタ初期値 | `renderHook(() => useField())` | `expect(result.current).toEqual([])` |
| 状態変更検証 | `act(() => useAppStore.setState({...}))` | setState後のresult.current検証 |
| アクション実行 | `await act(async () => { ... })` | 非同期アクションのact()ラップ |
| 関数参照安定性 | `rerender()` 後の `toBe()` | Zustandアクション参照不変性の確認 |
| 無限ループ防止 | `useEffect + useRef + renderHook` | P31対策テスト（レンダー回数5未満を検証） |
| 再レンダー最適化 | 無関係setState後の値不変確認 | 個別セレクタの分離検証（`toBe()` で参照同一性確認） |

#### テスト環境要件

| 要件 | 設定値 |
|---|---|
| テスト環境 | `@vitest-environment happy-dom` |
| localStorage | ポリフィル設定必須 |
| electronAPI | `window.electronAPI` 完全モック（authMode + llm + skill セクション） |
| ストア | `useAppStore` 統合ストア使用 |
| beforeEach | `vi.clearAllMocks()` + electronAPI設定 + `resetStore()` |
| afterEach | `cleanup()` + `vi.restoreAllMocks()` |

#### テスト実績

| テストファイル | テスト数 | パターン | 関連タスク |
|---|---|---|---|
| `authModeSlice.selectors.test.ts` | 70+ | renderHook | UT-STORE-HOOKS-REFACTOR-001 |
| `llmSlice.selectors.test.ts` | 60+ | renderHook | UT-STORE-HOOKS-REFACTOR-001 |
| `agentSlice.selectors.test.ts` | 114 | renderHook | UT-STORE-HOOKS-TEST-REFACTOR-001（移行完了） |
| `agentSlice.boundary.test.ts` | 203行 | 境界値テスト | TASK-043D |
| `agentSlice.combination.test.ts` | 321行 | 組み合わせテスト | TASK-043D |
| `agentSlice.edge-cases.test.ts` | 305行 | エッジケーステスト | TASK-043D |
| `agentSlice.error-cases.test.ts` | 283行 | エラーケーステスト | TASK-043D |
| `agentSlice.extension.test.ts` | 188行 | 拡張テスト | TASK-043D |
| `agentSlice.import-lifecycle.test.ts` | 283行 | インポートライフサイクルテスト | TASK-043D |
| `agentSlice.p31-regression.test.ts` | 303行 | P31回帰テスト | TASK-043D |
| `customStorage.test.ts` | 184行 | persist復旧3段ガードテスト | TASK-043D |
| `navigationSlice.test.ts`（iterable hardening追加分） | 57行追加 | viewHistory破損時ガードテスト | TASK-043D |
| `SkillAnalysisView.store-integration.test.tsx` | 221行 | Store統合テスト（hook+Store+IPC分離） | TASK-043D |
| `SkillCreateWizard.store-integration.test.tsx` | 171行 | Store統合テスト（hook+Store+IPC分離） | TASK-043D |

**関連タスク**: UT-STORE-HOOKS-TEST-REFACTOR-001（agentSliceテスト移行）, UT-STORE-HOOKS-REFACTOR-001（個別セレクタ設計）, TASK-043D（テスト品質ゲート設計）

### 将来の開発者向けガイダンス

#### P31問題発生時のチェックリスト

1. **症状の確認**
   - [ ] 画面がローディング状態のまま止まらない
   - [ ] DevToolsでStateの更新が連続している
   - [ ] コンソールに大量のログが出力されている

2. **原因の特定**
   - [ ] `useEffect` の依存配列にStore関数が含まれているか確認
   - [ ] 合成Hook（`useXxxStore()`）を使用しているか確認
   - [ ] 依存配列の関数が毎回新しい参照になっていないか確認

3. **修正の適用**
   - [ ] useRefガードパターンを適用
   - [ ] 依存配列を空にする
   - [ ] P31対策コメントを追加
   - [ ] eslint-disable コメントを追加（必要な場合）

4. **検証**
   - [ ] 無限ループが解消されたか確認
   - [ ] 初期化処理が1回だけ実行されているか確認
   - [ ] DevToolsでState更新が落ち着いているか確認

#### コードレビュー時の確認項目

| 確認項目                                              | 判定基準                                             |
| ----------------------------------------------------- | ---------------------------------------------------- |
| 合成HookからのStore関数を依存配列に含めていないか     | 空の依存配列 + useRefガード、またはeslint-disable   |
| P31対策コメントが追加されているか                     | `// P31対策:` または `// 意図的に空の依存配列`       |
| 初期化処理が1回のみ実行されることが保証されているか   | useRefガード or モジュールスコープフラグ             |

---

## chatEditSlice（Workspace Chat Edit状態管理）

### 概要

AIによるコード編集機能の状態管理Slice。ファイルコンテキスト、LLM生成結果、差分プレビューのUI状態を管理する。

**実装場所**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/`

### 状態定義

| プロパティ          | 型                  | 説明                       |
| ------------------- | ------------------- | -------------------------- |
| `fileContexts`      | `FileContext[]`     | 添付ファイル一覧           |
| `activeContextId`   | `string \| null`    | アクティブなコンテキストID |
| `generatedResults`  | `GeneratedResult[]` | 生成結果一覧               |
| `currentResultId`   | `string \| null`    | 現在表示中の結果ID         |
| `isLoading`         | `boolean`           | ローディング中             |
| `isDiffPreviewOpen` | `boolean`           | 差分プレビュー表示中       |
| `error`             | `string \| null`    | エラーメッセージ           |
| `isDragging`        | `boolean`           | ドラッグ中                 |

### アクション定義

| アクション           | 引数                                 | 説明                     |
| -------------------- | ------------------------------------ | ------------------------ |
| `addFileContext`     | `Omit<FileContext, 'id'\|'addedAt'>` | ファイルコンテキスト追加 |
| `removeFileContext`  | `id: string`                         | コンテキスト削除         |
| `clearAllContexts`   | -                                    | 全クリア                 |
| `setActiveContext`   | `id: string \| null`                 | アクティブ設定           |
| `setGeneratedResult` | `result: GeneratedResult`            | 生成結果設定             |
| `approveResult`      | `resultId: string`                   | 適用                     |
| `rejectResult`       | `resultId: string`                   | 却下                     |
| `clearResults`       | -                                    | 結果クリア               |
| `openDiffPreview`    | `resultId: string`                   | プレビュー表示           |
| `closeDiffPreview`   | -                                    | プレビュー非表示         |
| `setLoading`         | `loading: boolean`                   | ローディング設定         |
| `setError`           | `error: string \| null`              | エラー設定               |
| `setDragging`        | `dragging: boolean`                  | ドラッグ状態設定         |
| `reset`              | -                                    | 状態リセット             |

### 関連Hooks

| Hook名           | 責務                     |
| ---------------- | ------------------------ |
| `useFileContext` | ファイルコンテキスト管理 |
| `useDiffApply`   | 差分計算・適用ロジック   |

### 実装パターン

- **Helper関数分離**: 複雑なロジックをSlice外部に分離（`computeLCS`, `generateDiffHunks`等）
- **バリデーション内蔵**: `addFileContext`で`MAX_FILE_CONTEXTS`, `MAX_FILE_SIZE`チェック
- **Optional Chainingによる安全性**: `state.chatEdit?.fileContexts ?? []`パターン

### Store統合（予定）

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

**必要なimport**:

| インポート対象        | インポート元                              |
| --------------------- | ----------------------------------------- |
| `createChatEditSlice` | `@/renderer/features/workspace-chat-edit` |
| `ChatEditSlice`       | `@/renderer/features/workspace-chat-edit` |

**Store統合手順**:

1. `AppStore`インターフェースに`ChatEditSlice`をextends追加
2. `create`関数内でスプレッド構文により`createChatEditSlice(set, get)`を展開
3. 他のSliceと同様のパターンで統合

**統合パターン**:

| 要素               | 説明                                         |
| ------------------ | -------------------------------------------- |
| `AppStore`         | 全Sliceを統合したストア型定義                |
| `create<AppStore>` | Zustandのcreate関数で型付きストア生成        |
| `set, get`         | StateCreator関数に渡すコールバック           |
| スプレッド展開     | 各Sliceを`...createXxxSlice(set, get)`で統合 |

### 品質メトリクス

- テストカバレッジ: Line 69.23%, Branch 89.74%, Function 95%
- 全122件の自動テスト成功

### 関連タスク

- workspace-chat-edit（2026-01-23完了：コアロジック）

---

## skillSlice（統合済み - TASK-FIX-6-1-STATE-CENTRALIZATION）

> **注記**: このSliceは TASK-FIX-6-1-STATE-CENTRALIZATION（2026-02-10）で agentSlice に統合されました。
> 以下は統合前の仕様を参考情報として保持しています。

### 統合先

**agentSlice** に以下の状態・アクションが統合されています:

| 項目 | 統合後の位置 |
| ---- | ------------ |
| 状態（14プロパティ） | agentSlice内にそのまま移行 |
| アクション（10メソッド） | agentSlice内にそのまま移行 |
| 内部ハンドラー（4メソッド） | agentSlice内の`_handle*`メソッド |
| IPCリスナー設定 | setupSkillListeners.ts（agentSlice参照） |

### race condition対策（TASK-FIX-6-1で追加）

| 項目 | 説明 |
| ---- | ---- |
| executionId事前生成 | executeSkill()開始時にUUID生成、IPC呼び出し前にState設定 |
| フィルタリング | _handleStreamMessage等でexecutionIdを検証 |
| 目的 | ストリームイベント到着時の状態不整合を防止 |

### 並行実行ガードパターン（Concurrency Guard）（TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001で追加）

`executeSkill` アクション内で `get().isExecuting` による同期的チェックを行い、実行中の再呼び出しを早期リターンでブロックする。

#### 設計原則

| 項目 | 内容 |
|------|------|
| ガード方式 | 同期的 `get().isExecuting` チェック（async 操作前に配置） |
| 配置位置 | `executeSkill` 関数冒頭、`selectedSkillName` チェック直後 |
| 防御層 | Store層ガード（FR-01）+ UIガード面3箇所の二重防御 |
| 状態復元 | `_handleComplete` / `_handleError` で `isExecuting: false` に復元 |
| `get()` の安全性 | Zustand `get()` は React レンダーサイクル非依存の同期取得のため、ミリ秒単位の連打でも確実にガード |
| P31対策 | UI層では個別セレクタ `useIsSkillExecuting()` を使用（ChatPanel も移行済み） |
| Phase 11証跡 | `TC-11-01..03` の screenshot で AgentView / AgentExecutionView / ChatPanel の実行中状態を確認 |

#### 実装コード

```typescript
executeSkill: async (prompt) => {
  const { selectedSkillName, isExecuting } = get();
  if (!selectedSkillName) return;

  // 並行実行ガード: 既に実行中の場合は即座に拒否（FR-01）
  if (isExecuting) return;

  // ここから先は isExecuting = true に設定してから async 操作
  set({ isExecuting: true, skillExecutionStatus: "running", ... });
  // ...
};
```

#### UIガード面（既存・回帰確認済み）

| コンポーネント | ファイル | ガード方式 | P31安全性 |
|----------------|----------|------------|-----------|
| ExecuteButton | `components/organisms/AgentView/ExecuteButton.tsx` | `if (isExecuting) return null` — null render | Props経由（安全） |
| AgentExecutionView | `views/AgentExecutionView/AgentExecutionView.tsx` | `disabled={isExecuting}` on AgentMessageInput | ローカル派生（安全） |
| ChatPanel | `components/chat/ChatPanel.tsx` | `useIsSkillExecuting()` で toggle disabled を制御 | 個別セレクタ（P31安全） |

#### ガード保証テスト

| テストID | 検証内容 | AC |
|----------|----------|-----|
| T-01 | isExecuting=false で正常実行 | AC-01 |
| T-02 | isExecuting=true で即座に return | AC-01 |
| T-03 | ガード拒否時 streamingMessages 不変 | AC-02 |
| T-04 | ガード拒否時 executionId 不変 | AC-03 |
| T-05 | 連続2回呼び出しで2回目がガード | AC-01 |
| T-09 | エラー後 isExecuting=false に復元 | - |
| T-10 | 完了後に再実行可能 | - |
| T-11 | selectedSkillName 未設定で早期 return | - |
| T-12 | 3回連続で2回目・3回目がガード | AC-01 |

**関連未タスク**:
- UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001: `abortExecution` にも同様のガードが必要な可能性（`docs/30-workflows/completed-tasks/unassigned-task/task-fix-cancel-skill-concurrency-guard-001.md`）
- UT-IMP-AGENTSLICE-TEST-CREATESTORE-PATTERN-STANDARDIZATION-001: `createStore` / `mockElectronAPI` / `flushMicrotasks` の共通ヘルパー抽出（`docs/30-workflows/unassigned-task/task-imp-agentslice-test-createstore-pattern-standardization-001.md`）
- UT-FIX-AGENTSLICE-EXISTING-TEST-ENV-DEPENDENCY-001: agentSlice 既存テスト13ファイルの環境依存エラー修復（`docs/30-workflows/unassigned-task/task-fix-agentslice-existing-test-env-dependency-001.md`）
- UT-IMP-PHASE4-MONOREPO-TEST-DIRECTORY-GUARD-001: Phase 4 テンプレートへのモノレポテスト実行ディレクトリガード追加（`docs/30-workflows/unassigned-task/task-imp-phase4-monorepo-test-directory-guard-001.md`）

#### 実装時の苦戦箇所と短縮手順

| 苦戦箇所 | 再発条件 | 標準対処 |
|----------|----------|----------|
| `validate-phase-output --phase` の誤案内 | template / system spec / workflow 本文の例が実スクリプトより古い | `validate-phase-output.js <workflow-dir>` を正本とし、関連 docs を同一ターンで修正する |
| BrowserRouter 配下の harness に `MemoryRouter` を重ねる | screenshot review 用 route を急いで作るとき | 既存 Router の descendant route として描画し、harness 内で Router を再生成しない |
| Phase 11/12 成果物だけ更新し workflow 本文や index を置き去りにする | validator PASS 後に文書同期を後回しにするとき | `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同ターンで更新する |

#### 同種課題の5分解決カード

1. Store の async action 冒頭に同期 guard を置く。
2. UI 側は既存 selector を流用し、Store guard を最終防衛線にする。
3. review harness は既存 Router 配下で描画し、二重 Router を避ける。
4. `validate-phase-output` / `validate-phase12-implementation-guide` / `verify-all-specs` を連続実行する。
5. 成果物、workflow 本文、system spec、未タスク台帳を同一ターンで同期する。

---

<details>
<summary>統合前の仕様（参考情報）</summary>

> 注記: 以下は統合前の履歴情報。UT-TYPE-SKILL-IDENTIFIER-BRANDED-001（2026-02-25）以降、実装側は `SkillId` / `SkillName` のBranded Typeを使用する。

### 概要

スキル機能の状態管理Slice。スキルのスキャン・インポート・選択・実行・権限確認の状態を一元管理する。IPCイベントを介してMain Processと連携し、ストリーミング応答や権限リクエストを処理する。

**実装ファイル**:

| ファイル                 | パス                                                     | 行数 | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---- | ---------------------------- |
| `skillSlice.ts`          | `apps/desktop/src/renderer/store/slices/skillSlice.ts`   | 347  | Slice定義（状態+アクション） |
| `setupSkillListeners.ts` | `apps/desktop/src/renderer/store/setupSkillListeners.ts` | 49   | IPCイベントリスナー設定      |

**テストファイル**:

| ファイル                              | テスト数 | カテゴリ     |
| ------------------------------------- | -------- | ------------ |
| `skillSlice.test.ts`                  | 59       | 基本機能     |
| `skillSlice.edge-cases.test.ts`       | 16       | エッジケース |
| `skillSlice.state-transition.test.ts` | 17       | 状態遷移     |
| `skillSlice.ipc.test.ts`              | 14       | IPC連携      |
| `skillSlice.integration.test.ts`      | 7        | 統合テスト   |

### 状態定義（14プロパティ）

| プロパティ           | 型                               | 初期値  | 説明                     |
| -------------------- | -------------------------------- | ------- | ------------------------ |
| `availableSkills`    | `SkillMetadata[]`                | `[]`    | 利用可能なスキル一覧     |
| `importedSkills`     | `ImportedSkill[]`                | `[]`    | インポート済みスキル一覧 |
| `selectedSkillName`  | `string \| null`                 | `null`  | 選択中のスキル名         |
| `isExecuting`        | `boolean`                        | `false` | 実行中フラグ             |
| `executionId`        | `string \| null`                 | `null`  | 現在の実行ID             |
| `executionStatus`    | `SkillExecutionStatus \| null`   | `null`  | 実行ステータス           |
| `streamingMessages`  | `SkillStreamMessage[]`           | `[]`    | ストリーミングメッセージ |
| `pendingPermission`  | `SkillPermissionRequest \| null` | `null`  | 保留中の権限リクエスト   |
| `skillError`         | `string \| null`                 | `null`  | エラー情報               |
| `isLoadingSkills`    | `boolean`                        | `false` | スキル一覧読み込み中     |
| `isScanning`         | `boolean`                        | `false` | スキルスキャン中         |
| `isImporting`        | `boolean`                        | `false` | スキルインポート中       |
| `importingSkillName` | `string \| null`                 | `null`  | インポート中のスキル名   |

### アクション定義（10メソッド）

| アクション               | シグネチャ                                        | 説明                           |
| ------------------------ | ------------------------------------------------- | ------------------------------ |
| `fetchSkills`            | `() => Promise<void>`                             | スキル一覧取得                 |
| `rescanSkills`           | `() => Promise<void>`                             | スキル再スキャン               |
| `importSkill`            | `(skillName: string) => Promise<void>`            | スキルインポート               |
| `removeSkill`            | `(skillName: string) => Promise<void>`            | スキル削除                     |
| `selectSkill`            | `(skillName: string \| null) => void`             | スキル選択                     |
| `executeSkill`           | `(prompt: string) => Promise<void>`               | スキル実行（並行実行ガード付き: `isExecuting` 同期チェック、FR-01） |
| `abortExecution`         | `() => void`                                      | 実行中断                       |
| `respondToPermission`    | `(approved: boolean, remember?: boolean) => void` | 権限リクエスト応答             |
| `clearError`             | `() => void`                                      | エラークリア                   |
| `clearStreamingMessages` | `() => void`                                      | ストリーミングメッセージクリア |

### 内部ハンドラー（4メソッド）

IPCイベントを受信して状態を更新する内部ハンドラー。`setupSkillListeners.ts`から呼び出される。

| ハンドラー                 | シグネチャ                                     | トリガーIPC                |
| -------------------------- | ---------------------------------------------- | -------------------------- |
| `_handleStreamMessage`     | `(msg: SkillStreamMessage) => void`            | `skill:stream`             |
| `_handleComplete`          | `(executionId: string) => void`                | `skill:complete`           |
| `_handleError`             | `(executionId: string, error: string) => void` | `skill:error`              |
| `_handlePermissionRequest` | `(req: SkillPermissionRequest) => void`        | `skill:permission-request` |

### IPCリスナー設定パターン

`setupSkillListeners.ts`はアプリ初期化時に一度だけ呼び出し、クリーンアップ関数を返す。

**設定タイミング**: App.tsxの`useEffect`内

**クリーンアップ**: アンマウント時にリスナーを解除

| リスナー              | IPCチャネル                | 対応ハンドラー             |
| --------------------- | -------------------------- | -------------------------- |
| `onStream`            | `skill:stream`             | `_handleStreamMessage`     |
| `onComplete`          | `skill:complete`           | `_handleComplete`          |
| `onError`             | `skill:error`              | `_handleError`             |
| `onPermissionRequest` | `skill:permission-request` | `_handlePermissionRequest` |

### Store統合

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

**セレクター**: `useSkillStore`

| インポート対象     | インポート元          |
| ------------------ | --------------------- |
| `createSkillSlice` | `./slices/skillSlice` |
| `SkillSlice`       | `./slices/skillSlice` |

**統合パターン**:

| 要素               | 説明                                            |
| ------------------ | ----------------------------------------------- |
| `AppStore`         | 全Sliceを統合したストア型定義にSkillSliceを追加 |
| `create<AppStore>` | Zustandのcreate関数でskillSliceを展開           |
| `useSkillStore`    | skillSlice専用セレクター（shallow比較）         |

### 品質メトリクス

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 113    |
| Line Coverage     | 100%   |
| Branch Coverage   | 98.21% |
| Function Coverage | 100%   |
| TypeScript strict | PASS   |
| ESLint            | PASS   |

### 関連タスク

| タスクID                            | 内容                           | ステータス                                                                                               |
| ----------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| TASK-6-1                            | SkillSlice実装（Zustand）      | **完了**                                                                                                 |
| TASK-7A                             | SkillSelector                  | **完了**                                                                                                 |
| TASK-7B                             | SkillImportDialog              | **完了**                                                                                                 |
| TASK-7C                             | PermissionDialog               | **完了**                                                                                                 |
| task-imp-permission-readable-ui-001 | PermissionDialog人間可読UI改善 | **完了**                                                                                                 |
| TASK-7D                             | ChatPanel統合                  | **完了**（[指示書](../../../docs/30-workflows/unassigned-task/task-imp-chatpanel-agent-integration.md)） |
| task-imp-permission-history-001     | Permission履歴トラッキングUI   | **完了**                                                                                                 |
| TASK-8B                             | コンポーネントテスト（全4コンポーネント+3ユーティリティ、280テスト） | **完了**                                                                                                 |

</details>

---

## permissionHistorySlice（権限要求履歴管理）

### 概要

権限要求の履歴をトラッキングするSlice。PermissionDialog での判断結果（approved/denied/approved_once）を時系列で記録し、フィルタリング・クリア機能を提供する。skillSlice.respondToSkillPermission から cross-slice アクセスで自動記録される。

**実装場所**: `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts`

**実装ファイル**:

| ファイル                    | パス                                                               | 行数 | 説明                                      |
| --------------------------- | ------------------------------------------------------------------ | ---- | ----------------------------------------- |
| `permissionHistorySlice.ts` | `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts` | 60+  | Slice定義（状態+アクション）              |
| `permissionHistory.ts`      | `apps/desktop/src/renderer/components/skill/permissionHistory.ts`  | 116  | データモデル・型定義・ヘルパー関数        |
| `dateFilterUtils.ts`        | `apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts` | 107 | 期間フィルタヘルパー（getDateRangeStartDate, filterByDateRange） |

**テストファイル**:

| ファイル                              | テスト数 | カテゴリ               |
| ------------------------------------- | -------- | ---------------------- |
| `permissionHistorySlice.test.ts`      | 16       | Store操作              |
| `permissionHistory.test.ts`           | 21       | データモデル           |
| `dateFilterUtils.test.ts`             | 22       | 期間フィルタロジック   |
| `PermissionHistoryFilter.test.tsx`    | 8        | フィルタUIコンポーネント |

### 状態定義（2プロパティ）

| プロパティ          | 型                         | 初期値 | 説明                                       |
| ------------------- | -------------------------- | ------ | ------------------------------------------ |
| `permissionHistory` | `PermissionHistoryEntry[]` | `[]`   | 履歴エントリ一覧（最新が先頭、最大1000件） |
| `historyFilter`     | `PermissionHistoryFilter`  | `{}`   | フィルタ条件（非永続化）                   |

### アクション定義（3メソッド）

| アクション         | シグネチャ                                                           | 説明                                 |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| `addHistoryEntry`  | `(entry: Omit<PermissionHistoryEntry, "id" \| "timestamp">) => void` | 履歴追加（1000件上限で自動切り捨て） |
| `clearHistory`     | `() => void`                                                         | 全履歴クリア                         |
| `setHistoryFilter` | `(filter: PermissionHistoryFilter) => void`                          | フィルタ条件設定                     |

### データモデル

| 型名                      | 説明                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `PermissionDecision`      | `"approved" \| "denied" \| "approved_once"`                 |
| `PermissionHistoryEntry`  | id, timestamp, toolName, argsSnapshot, decision, sessionId? |
| `PermissionHistoryFilter` | toolName?, decision?, dateRange? によるフィルタ条件         |
| `DateRangeFilter`         | preset, start?, end? による期間フィルタ条件                 |
| `DatePreset`              | `"all" \| "today" \| "week" \| "month" \| "custom"`        |

### 定数

| 定数名                           | 値   | 説明               |
| -------------------------------- | ---- | ------------------ |
| `PERMISSION_HISTORY_MAX_ENTRIES` | 1000 | 履歴最大保持件数   |
| `ARGS_SNAPSHOT_MAX_LENGTH`       | 200  | 引数要約最大文字数 |

### セキュリティ: safeArgsSnapshot()

引数を安全な文字列に変換するヘルパー関数。

| ステップ | 処理                               |
| -------- | ---------------------------------- |
| 1        | JSON.stringify（循環参照時は"{}"） |
| 2        | HTMLタグ除去（XSS防止）            |
| 3        | 制御文字除去                       |
| 4        | 200文字制限（超過時は"..."付加）   |

### Store統合

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

| インポート対象                 | インポート元                      |
| ------------------------------ | --------------------------------- |
| `createPermissionHistorySlice` | `./slices/permissionHistorySlice` |
| `PermissionHistorySlice`       | `./slices/permissionHistorySlice` |

**永続化**: Zustand persist middleware の`partialize`設定に`permissionHistory`を追加。ストレージキー: `knowledge-studio-store`（localStorage）。`historyFilter`は非永続化。

### Cross-Sliceアクセス

`skillSlice.respondToSkillPermission`内で`(get() as unknown as PermissionHistorySlice).addHistoryEntry()`パターンで自動記録。権限応答時に以下のマッピングで判断結果を記録:

| 条件                    | decision          |
| ----------------------- | ----------------- |
| `!approved`             | `"denied"`        |
| `approved && remember`  | `"approved"`      |
| `approved && !remember` | `"approved_once"` |

### フィルタリングパイプライン

`PermissionHistoryPanel`内の`useMemo`で3段階の順次フィルタを適用:

| 順序 | フィルタ     | 条件                       | 関数                                    |
| ---- | ------------ | -------------------------- | --------------------------------------- |
| 1    | ツール名     | `toolName`が定義されている | `entry.toolName === filter.toolName`    |
| 2    | 判断結果     | `decision`が定義されている | `entry.decision === filter.decision`    |
| 3    | 期間         | `dateRange`が定義されている | `filterByDateRange(entries, dateRange)` |

**filterByDateRange処理フロー**:

| プリセット | 処理                                                     |
| ---------- | -------------------------------------------------------- |
| `all`      | 全エントリ返却（フィルタなし）                          |
| `today`    | `getDateRangeStartDate("today")`で本日0時を算出→比較    |
| `week`     | `getDateRangeStartDate("week")`で7日前0時を算出→比較    |
| `month`    | `getDateRangeStartDate("month")`で30日前0時を算出→比較  |
| `custom`   | `start?`/`end?`をISO8601変換し範囲フィルタ（境界含む）  |

### 品質メトリクス

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 72     |
| Line Coverage     | 98.50% |
| Branch Coverage   | 87.82% |
| Function Coverage | 100%   |
| TypeScript strict | PASS   |
| ESLint            | PASS   |

### 関連タスク

| タスクID                        | 内容                         | ステータス |
| ------------------------------- | ---------------------------- | ---------- |
| task-imp-permission-history-001 | Permission履歴トラッキングUI | **完了**   |
| task-imp-permission-date-filter | 期間別フィルタリング         | **完了**   |

---

## Skill Advanced Views 状態管理設計（TASK-UI-05B / completed）

> ステータス: **completed**（実装・テスト・導線同期完了）

TASK-UI-05B の4ビュー（3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard）は、ビュー間で状態を共有しない設計のため、新規 Zustand Slice は作成しない。

### 状態配置方針

| 状態 | 管理方法 | 理由 |
| --- | --- | --- |
| チェーン一覧 | `useChainList` (useState) | ビュー固有データ、他ビューと共有不要 |
| チェーン編集中状態 | `useChainEditor` (useState) | エディター内でのみ使用 |
| スケジュール一覧 | `useScheduleList` (useState) | ビュー固有データ |
| デバッグセッション | `useDebugSession` (useState) | セッション状態はビュー内完結 |
| ブレークポイント | `useBreakpoints` (useState) | デバッグビュー内でのみ使用 |
| 分析サマリー | `useAnalyticsSummary` (useState) | ビュー固有データ |
| トレンドデータ | `useUsageTrend` (useState) | ビュー固有データ |
| 利用可能スキル一覧 | `agentSlice` 個別セレクタ | 既存 Store を再利用（P31対策で個別セレクタ） |

### 設計根拠

- **P31対策**: `agentSlice` の合成Store Hook を使わず、個別セレクタ（`useXxx()`）で必要なフィールドのみ取得
- **関心の分離**: 4ビューが互いに依存しない設計により、将来の1ビュー単独リファクタリングが容易
- **IPC中心**: 永続状態はMain Process側で管理し、Rendererはカスタム Hook 内でIPC経由取得

### 実装時の苦戦箇所（SubAgent-D）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| 状態責務分離は実装済みでも仕様文に残し漏れる | Hook実装完了後に状態管理仕様の同期を後回しにする | `arch-state-management.md` に 4ビューの状態配置表を固定し、`task-workflow.md` へ同時同期 | 状態管理変更時はコードと仕様を同一ターンで更新する |
| 未タスク監査の判定軸が揺れる | `current` と `baseline` を分離せず報告する | `currentViolations=0` を合否基準として明記し、baselineは別管理化 | 監査結果は `current/baseline` を必ず併記する |

### 同種課題の簡潔解決手順（5ステップ）

1. ビューごとの状態責務（useState / selector / IPC）を表にして先に固定する。  
2. `verify-all-specs` と `validate-phase-output` で仕様整合を先に確認する。  
3. 状態管理仕様を `task-workflow.md` と同一ターンで更新する。  
4. `audit --diff-from HEAD` は `current` を合否、`baseline` を改善課題として分離する。  
5. 苦戦箇所を `lessons-learned.md` へ転記し、再発条件付きでルール化する。  

### 参照
- [TASK-UI-05B Phase 2 状態管理設計](../../../../docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/phase-2-design.md)

---

## Skill Import / SkillCenter 防御状態管理（2026-03-04）

`TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001` / `TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` / `TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` を状態管理視点で同期した追補仕様。

### agentSlice.importSkill の冪等ガード

| 観点 | 契約 |
| --- | --- |
| 事前判定 | `importedSkills.some((s) => s.name === skillName)` が真なら IPC を呼ばずに早期 return |
| 事前同期 | 既存インポート時でも `availableSkillsMetadata` から該当 `skillName` を除外し、一覧表示を整合 |
| 追加時の重複防止 | import 成功後も `importedSkills` へ push 前に同名存在チェックを実施 |
| エラー状態 | 冪等早期終了時は `skillError: null` を維持し、擬似失敗を記録しない |

### SkillCenter 系 Hook の nullish 防御

| 対象 | 防御契約 |
| --- | --- |
| `useSkillCenter` | `useAvailableSkillsMetadata() ?? []` / `useImportedSkills() ?? []` で Store 読み出し時の nullish を吸収 |
| `useSkillCenter.handleAddSkill` | `addingSkills.has(skillName)` を先頭ガードにし、追加中の同一スキル再実行を抑止 |
| `useSkillCenter.handleAddSkill` | 既存インポート済み時は `importSkill` 同期のみ実施し、成功アニメーション状態（`addingSkills`）を開始しない |
| 検索/カテゴリ判定 | `normalizeSearchText(value)` で `description` 欠損時にも `.toLowerCase()` 例外を回避 |
| Featured 計算 | `useFeaturedSkills` で `allSkills=[]`, `importedSkillNames=[]` を既定値化し、計算関数の前提を固定 |

### TASK-043B: import dialog の成功判定とエラー面の単一化

| 観点 | 契約 |
| --- | --- |
| action failure 契約 | `importSkill(skillName)` は failure 時でも resolve しうる。UI は `catch` の有無ではなく、`await` 後の Store 状態で成否を判定する |
| post-condition 判定 | 成功条件は `importedSkills.some((s) => s.name === skillName)` が真で、かつ `skillError` が未残置であること。件数差分や throw だけで判定しない |
| 既存インポート済み | import 前から対象 skill が存在する場合は close 可否を `wasImportedBefore` と `skillError` で判定し、偽失敗を出さない |
| error surface 調停 | dialog open 中は panel 側の共有 alert を抑止し、失敗理由は dialog 内 `role="alert"` に集約する |
| テストモック契約 | `SkillImportDialog` 系テストは selector モックに加え `useAppStore.getState()` を必ず提供し、post-condition 更新を再現する |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | PASS（既存インポート時 IPC スキップと重複防止を確認） |
| `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts` | PASS（追加中再実行抑止 + 既存インポート時アニメーション抑止を確認） |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` | PASS（31 tests、`追加する` / `追加中...` copy と `getState()` 依存成功判定を確認） |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/` | TC-01〜TC-04 の画面証跡で冪等状態遷移（追加済み/追加中/追加後/詳細表示）を確認 |
| `docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots/` | TC-01〜TC-04 の画面証跡で欠損メタデータ時のクラッシュ非発生を確認 |

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [UIコンポーネントパターン](./arch-ui-components.md)
- [スキル関連インターフェース](./interfaces-agent-sdk-skill.md)
- [既知の落とし穴 P31: Store Hooks無限ループ](../../../rules/06-known-pitfalls.md#p31-zustand-store-hooks無限ループ)
- [実装パターン総合ガイド: Zustand Slice設計原則](./architecture-implementation-patterns.md#zustand-slice設計原則)
- [Store Hooks コンポーネント移行 実装ガイド](../../../../docs/30-workflows/completed-tasks/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/outputs/phase-12/implementation-guide.md)
- [AgentView無限ループ修正 実装ガイド](../../../../docs/30-workflows/completed-tasks/UT-FIX-AGENTVIEW-INFINITE-LOOP-001/outputs/phase-12/implementation-guide.md)

## TASK-10A-E-C: Store駆動ライフサイクル統合（2026-03-06）

### 追加セレクタ契約

| セレクタ | 目的 | 比較戦略 |
| --- | --- | --- |
| `useAvailableSkillsForImport` | `availableSkillsMetadata` から `importedSkills` を除外した追加候補を導出 | `useShallow`（`.filter()` 派生） |
| `useFilteredAvailableSkills` | 追加候補に `skillFilter` を適用して表示候補を導出 | `useShallow`（`.filter()` + `trim().toLowerCase()`） |

### action 状態遷移契約（importSkill）

| フェーズ | 状態更新 | 要件 |
| --- | --- | --- |
| 開始 | `isImporting=true`, `importingSkillName=<target>` | UIボタンを即時 disable する |
| 成功 | `importedSkills` 追加 + `availableSkillsMetadata` 除外 + `isImporting=false` + `importingSkillName=null` | 1トランザクション更新で表示整合を維持 |
| 失敗 | `skillError` 設定 + `isImporting=false` + `importingSkillName=null` | throw ではなく state でエラー表示する |

### 境界契約（TASK-10A-F との責務分離）

- import lifecycle は `isImporting` / `importingSkillName` / `skillError` だけを変更し、`isAnalyzing` / `isImproving` / `currentAnalysis` を変更しない。
- create/analyze 導線は TASK-10A-F 管轄とし、TASK-10A-E-C では責務境界のみを固定する。

### 実装時の苦戦箇所（TASK-10A-E-C）

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| `.filter()` 派生 selector が毎回新規配列参照を返し、再描画が不安定化 | 派生 selector を `useAppStore` でそのまま返す | `useShallow` で shallow 比較に切替 |
| Phase 12 で「更新予定のみ」記述が残り、実更新の証跡と乖離 | `spec-update-summary.md` だけ更新して changelog/台帳を同期しない | Step 1-A〜1-D の実行結果を `documentation-changelog.md` に固定 |
| 未タスク指示書を最小記述で作成し、フォーマット監査に失敗 | 9見出しテンプレートを満たさない | `unassigned-task-template.md` 準拠で 1-9 を必須化 |

### 同種課題の5分解決カード（TASK-10A-E-C）

1. `rg` で inline selector / direct IPC の残存箇所を棚卸しする。
2. `.filter()` / `.map()` 派生 selector は `useShallow` 適用を先に固定する。
3. Phase 11 を `TC-ID + 証跡` 形式へ整え、coverage validator を先に通す。
4. Phase 12 は Step 1-A〜1-D を実行し、`LOGS/SKILL/task-workflow/topic-map` を同時同期する。
5. 未タスクは `docs/30-workflows/unassigned-task/` にテンプレート準拠で作成し、台帳リンクまで同ターンで閉じる。

## TASK-10A-F: Store駆動ライフサイクルUI統合（selector migration / renderer direct IPC removal, 2026-03-07）

**検索キーワード**: `TASK-10A-F`, `store-driven lifecycle`, `selector migration`, `renderer direct IPC removal`

### 責務境界の最終同期

| タスク       | 責務                                                 |
| ------------ | ---------------------------------------------------- |
| TASK-10A-D   | agentSlice へ lifecycle state/action を追加する      |
| TASK-10A-E-C | import lifecycle（`isImporting` 系）を安定化する     |
| TASK-10A-F   | Renderer 直接IPCを排除し Store action 経由へ統一する |

### UI側契約

- `useSkillAnalysis` は `useCurrentAnalysis` / `useIsAnalyzingSkill` / `useIsImprovingSkill` / `useSkillError` と action selector を使用する。
- `SkillCreateWizard` は `useCreateSkill()` を使用し、UIから `window.electronAPI.skill.create` を直接呼ばない。
- 画面検証は `docs/30-workflows/store-driven-lifecycle-ui/outputs/phase-11/screenshots/` の 11証跡で確認する。

### Phase 12 再同期追補（2026-03-09）

| 区分 | 今回反映した内容 |
| --- | --- |
| current workflow 証跡 | `TC-11-01`〜`TC-11-08` を満たす実スクリーンショット11件へ再同期し、`manual-test-result.md` を validator 互換の `テストケース / 証跡` 形式へ更新 |
| 実装ガイド | `implementation-guide.md` を `## Part 1` / `## Part 2` と `型定義` / `APIシグネチャ` / `使用例` / `エラーハンドリング` / `エッジケース` / `設定項目と定数一覧` を持つ構造へ再編 |
| 状態設計の維持 | `analysis` / `isAnalyzing` / `isImproving` / `skillError` は Store、`selectedSuggestions` / `improvementResult` / `wizardStep` はローカル、という Case B 判断を再確認 |
| 後続境界 | `SkillEditor.tsx` に残る file operation 系 direct IPC は TASK-10A-G の受け皿を維持し、新規未タスクは追加しない |

### 再同期で苦戦した箇所（2026-03-09）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| Phase 11 placeholder の残置 | `P53` / `代替` / `スクリーンショット不可` を current workflow に残したまま validator だけ再実行する | 実スクリーンショット取得後に placeholder 文言を除去し、`TC-ID ↔ png` へ置換 | screenshot 必須タスクでは placeholder を成果物へ残さない |
| implementation-guide の literal 見出し不足 | Part 1/2 はあるが validator が要求する見出し語が欠ける | テンプレートと実成果物の両方に `APIシグネチャ` / `エラーハンドリング` / `設定項目と定数一覧` を明示 | Phase 12 はテンプレート段階で validator 必須語を先置きする |
| unassigned-task の directory 全体と今回差分の混同 | `currentViolations=0` のみ見て「指定ディレクトリは完全準拠」と書いてしまう | `current` と `baseline` を分離し、legacy 正規化タスクを参照して報告 | 未タスク確認は「今回差分」「legacy baseline」の2軸で書く |
### 苦戦箇所と再利用手順
| 課題                                  | 再発条件                                                       | 解決策                                                                                              |
| ------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Store移行後のテストmockパターン不統一 | Store個別セレクタをmockする際、vi.mockの戻り値構造が不一致     | `vi.mock("../../../store", () => ({ useSelectorName: () => mockValue }))` パターンを標準化          |
| handleAnalyze の try/catch 欠落       | Store action が例外をthrowした場合、Unhandled Rejection が発生 | 全ハンドラに try/catch を追加（Store側でerror処理済みでも、UIクラッシュ防止のため必須）             |
| improvementResult のStore化見送り     | applySkillImprovements の戻り値がStore stateに含まれていない   | 設計判断（Case B）として明文化。将来必要になれば agentSlice に `lastImprovementResult` state を追加 |
### 検証証跡
| 検証        | 結果                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| テスト      | 52テスト全PASS（SkillCreateWizard: 19, SkillAnalysisView: 33）                                                    |
| カバレッジ  | SkillCreateWizard: Line 97.18%, Branch 90.9%, Func 100% / useSkillAnalysis: Line 98.85%, Branch 86.95%, Func 100% |
| 直接IPC残存 | 実行コード内 0件（grep検証済み）                                                                                  |
| TypeScript  | `tsc --noEmit` PASS                                                                                               |
### 関連タスク
| タスクID     | 内容                                          | ステータス             |
| ------------ | --------------------------------------------- | ---------------------- |
| TASK-10A-D   | agentSlice スキルライフサイクルアクション追加 | **完了**（2026-03-03） |
| TASK-10A-E-C | import lifecycle の Store 駆動設計            | **完了**（2026-03-06） |
| TASK-10A-F   | スキルライフサイクルUI Store移行（本タスク）  | **完了**（2026-03-07） |
| TASK-10A-G   | スキルライフサイクル統合テスト強化             | **完了**（2026-03-09） |

### 統合検証結果

| 検証項目 | 結果 |
| --- | --- |
| skill テスト（24ファイル） | 479/479 PASS |
| agentSlice テスト（17ファイル） | 441/441 PASS |
| 合計 | 920/920 PASS |
| ESLint | エラー 0件 |
| TypeScript 型チェック | エラー 0件 |
| 直接 IPC 呼び出し（実コード） | 0件 |
| non-null assertion（実コード） | 0件 |
| `useAgentStore` 直接使用 | 0件（P31準拠） |

### 個別セレクタ使用一覧（P31/P48準拠）

| ファイル | 使用セレクタ | 種別 |
| --- | --- | --- |
| `useSkillAnalysis.ts` | `useCurrentAnalysis` | State |
| `useSkillAnalysis.ts` | `useIsAnalyzingSkill` | State |
| `useSkillAnalysis.ts` | `useIsImprovingSkill` | State |
| `useSkillAnalysis.ts` | `useSkillError` | State |
| `useSkillAnalysis.ts` | `useAnalyzeSkill` | Action |
| `useSkillAnalysis.ts` | `useApplySkillImprovements` | Action |
| `useSkillAnalysis.ts` | `useAutoImproveSkill` | Action |
| `SkillCreateWizard.tsx` | `useCreateSkill` | Action |
| `SkillManagementPanel.tsx` | `useAvailableSkillsMetadata` | State (useShallow) |
| `SkillManagementPanel.tsx` | `useClearSkillError` | Action |
| `SkillManagementPanel.tsx` | `useFetchSkills` | Action |
| `SkillManagementPanel.tsx` | `useImportedSkills` | State (useShallow) |
| `SkillManagementPanel.tsx` | `useImportingSkillName` | State |
| `SkillManagementPanel.tsx` | `useIsImportingSkill` | State |
| `SkillManagementPanel.tsx` | `useIsLoadingSkills` | State |
| `SkillManagementPanel.tsx` | `useRemoveSkill` | Action |
| `SkillManagementPanel.tsx` | `useSkillError` | State |

### Store / ローカル状態の分類基準（Case B方式）

| 状態 | 配置先 | 理由 |
| --- | --- | --- |
| `currentAnalysis` | Store (`agentSlice`) | 複数画面で共有可能 |
| `isAnalyzing` / `isImproving` | Store (`agentSlice`) | Store action 内で管理 |
| `skillError` | Store (`agentSlice`) | エラー状態を一元管理 |
| `selectedSuggestions` | ローカル (`useState`) | UI固有の選択状態 |
| `improvementResult` | ローカル (`useState`) | Store action の戻り値として利用、将来 Store 化も可 |
| `wizardStep` | ローカル (`useState`) | Wizard 固有の UI 遷移状態 |

### 実装時の苦戦箇所サマリ

| # | 苦戦箇所 | 根本原因 | 解決策 |
| --- | --- | --- | --- |
| 1 | テスト mock パターン不統一 | State用/Action用の戻り値構造差異 | State: `() => value`、Action: `() => fn` で統一 |
| 2 | try/catch 欠落 | Store action 委譲で防御コード省略 | Store action 呼び出しは常に try/catch で包む |
| 3 | improvementResult の Store 化見送り | Store action が void 返却 | Case B（ローカル維持）を設計判断として記録 |
| 4 | 2workflow 間の stale 化 | current が completed 参照のみ | current 側 outputs を実体として維持 |
| 5 | screenshot harness のUI文言依存 | Store が内部例外を汎用文言に変換 | `data-testid` を ready 条件の正本に |

詳細: `lessons-learned.md` の TASK-10A-F セクション参照


## Persist Iterable Hardening（TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001）

### 目的

`expandedFolders` / `viewHistory` の永続化破損で `object is not iterable` が発生する経路を遮断する。

### 契約

| 対象 | 入力検証 | フォールバック |
| --- | --- | --- |
| `expandedFolders` hydrate | `Array.isArray(raw)` | `new Set<string>()` |
| `expandedFolders` persist | `instanceof Set` or `Array.isArray` | `[]` |
| `viewHistory` setCurrentView | `Array.isArray(state.viewHistory)` | `[view]` |
| `viewHistory` goBack/canGoBack | `Array.isArray(history)` | return / `false` |

### persist 復旧契約（DD-01〜DD-05）

`customStorage`（`apps/desktop/src/renderer/store/index.ts`）は Zustand `persist` ミドルウェアのカスタムストレージ実装であり、`localStorage` からの復元時に破損データを安全に処理する。

| ID | 対象 | ガード内容 |
| --- | --- | --- |
| DD-01 | `getItem` / `expandedFolders` | `Array.isArray(raw)` → `raw.filter(v => typeof v === "string")` → `new Set(...)`. 非配列は `new Set<string>()` にフォールバック |
| DD-02 | `setItem` / `expandedFolders` | `instanceof Set` → `Array.from()`、`Array.isArray` → `.filter(string)` の二段対応。それ以外は空配列 |
| DD-03 | `useCanGoBack` | `Array.isArray(state.viewHistory)` を前提条件に追加（破損時は `false` 返却） |

#### 設計原則

- persist 復元時は「型検証→フィルタ→安全既定値」の3段を必須化する
- `console.warn` で破損検出をロギング（`process.env.NODE_ENV !== 'test'` でガード不要、persist 問題は全環境で可視化すべき）
- テストでは破損値5パターン以上（`null`, `undefined`, `number`, `object`, `string[]` with non-string elements）を固定

### 実装ガイドライン

- 永続化復元点では型検証を最優先し、異常値を直接spread/iterateしない。
- フォールバック時は診断可能な warning を出し、アプリ継続を優先する。
- 破損入力テスト（`null`/`undefined`/`number`/`string`/`object`）を標準テストセットに含める。

### 追加した防御契約

| 対象                             | 契約                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `navigationSlice.setCurrentView` | `viewHistory` は `Array.isArray` で検証し、非配列は `[]` にフォールバックしてから push する |
| `navigationSlice.goBack`         | `viewHistory` が非配列なら `[]` 扱いで早期 return する                                      |
| `navigationSlice.canGoBack`      | `Array.isArray(history) && history.length > 1` のみ true                                    |
| `customStorage.getItem`          | `expandedFolders` は `string[]` のみ `Set<string>` に復元し、それ以外は空 Set               |
| `customStorage.setItem`          | `expandedFolders` が Set/配列以外なら `[]` で永続化                                         |

### 検証証跡

- `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`: 破損入力の回帰テストを追加
- `docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001/outputs/phase-11/screenshots/`: TC-11-01〜03 の画面証跡

---

## TASK-043D: テスト品質ゲート設計（2026-03-08）

### 概要

agentSlice / navigationSlice / customStorage / Store統合テストの品質ゲートとして、責務境界テスト・P31回帰テスト・persist復旧テストを体系的に追加した。

### agentSlice 責務境界テスト拡張

agentSlice の責務範囲（import lifecycle、アクション組み合わせ、境界値、エッジケース、エラーケース、P31回帰）を網羅するテストファイル群を新規追加。

| テストファイル | 行数 | テスト観点 |
| --- | --- | --- |
| `agentSlice.boundary.test.ts` | 203 | 境界値（配列上限、文字列長、数値境界） |
| `agentSlice.combination.test.ts` | 321 | アクション組み合わせ（状態遷移の順序依存性） |
| `agentSlice.edge-cases.test.ts` | 305 | エッジケース（同時操作、状態矛盾、再入防止） |
| `agentSlice.error-cases.test.ts` | 283 | エラーケース（IPC失敗、タイムアウト、不正入力） |
| `agentSlice.extension.test.ts` | 188 | 拡張テスト（TASK-UI-03追加分: recentExecutions/isAdvancedSettingsOpen） |
| `agentSlice.import-lifecycle.test.ts` | 283 | インポートライフサイクル（isImporting/importingSkillName/skillError の遷移） |
| `agentSlice.p31-regression.test.ts` | 303 | P31回帰テスト（個別セレクタの参照安定性、useEffect無限ループ非発生） |

**実装場所**: `apps/desktop/src/renderer/store/slices/__tests__/`

### navigationSlice のページ状態管理 iterable hardening

`navigationSlice` の `setCurrentView` / `goBack` / `canGoBack` に `Array.isArray(state.viewHistory)` ガードを追加し、persist 復旧時に `viewHistory` が破損（`null`/`undefined`/`number`/`string`/`object`）していても crash しないように強化。

| メソッド | ガード内容 |
| --- | --- |
| `setCurrentView` | `Array.isArray(state.viewHistory)` が偽なら `[view]` にフォールバック |
| `goBack` | `!Array.isArray(history)` なら即座に return（currentView を維持） |
| `canGoBack` | `Array.isArray(history) && history.length > 1` で安全判定 |

テストは `navigationSlice.test.ts` に `iterable hardening` describe ブロック（57行）として追加。5パターンの破損値（`null`/`undefined`/`number`/`string`/`object`）を `it.each` で網羅。

### customStorage 3段ガードパターンのテスト正式化

`apps/desktop/src/renderer/store/__tests__/customStorage.test.ts`（184行）を新規作成し、DD-01〜DD-03 の persist 復旧契約をテストで固定。

| テスト対象 | 検証内容 |
| --- | --- |
| DD-01: `getItem` / `expandedFolders` | 正常配列→Set変換、非string要素フィルタ、非配列（null/undefined/number/object/string）→空Setフォールバック |
| DD-02: `setItem` / `expandedFolders` | Set→Array変換、Array→stringフィルタ、非Set非Array→空配列フォールバック |
| DD-03: `useCanGoBack` | `Array.isArray(state.viewHistory)` ガードによる破損時 `false` 返却 |

### Store統合テストパターン（hook + Store + IPC 分離）

SkillAnalysisView / SkillCreateWizard の Store統合テストを追加し、「hook → Store action → IPC 呼び出し」の3層を分離してテストする戦略を確立。

| テストファイル | 行数 | テスト対象 |
| --- | --- | --- |
| `SkillAnalysisView.store-integration.test.tsx` | 221 | `useSkillAnalysis` hook が Store 個別セレクタ経由で `analyzeSkill`/`autoImproveSkill`/`applySkillImprovements` を呼び出す統合テスト |
| `SkillCreateWizard.store-integration.test.tsx` | 171 | `useCreateSkill` hook が Store action 経由で `createSkill` を呼び出す統合テスト |

**実装場所**: `apps/desktop/src/renderer/components/skill/__tests__/`

**テスト設計原則**:
- hook のテストは `renderHook` で Store 操作のみを検証（UI レンダリング不要）
- IPC モック（`window.electronAPI`）は `beforeEach` で設定し、テスト間で状態を共有しない
- Store の状態変化を `useAppStore.getState()` で直接検証し、セレクタの正確性を確認

### store/index.ts セレクタエクスポート拡張

`apps/desktop/src/renderer/store/index.ts` に63行を追加し、新規個別セレクタのエクスポートを追加。`useCanGoBack` セレクタに `Array.isArray` ガードを適用（DD-03対応）。
