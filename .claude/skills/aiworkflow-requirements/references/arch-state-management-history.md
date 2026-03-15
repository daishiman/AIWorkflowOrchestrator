# 状態管理パターン（Desktop Renderer） / history bundle

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: history bundle

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v3.14.7    | 2026-03-15 | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 反映: `agentSlice` に `handoffGuidance` 状態契約を追加し、`skill:execute` / `agent:start` handoff 応答時の state 遷移（set/dismiss/reset）と `TerminalHandoffCard` 表示条件（個別セレクタ）を追記 |
| v3.14.6    | 2026-03-11 | TASK-UI-04C-WORKSPACE-PREVIEW を反映: `WorkspaceView` は 04A の `workspaceSlice` / `fileSelectionSlice` を維持したまま、preview content/loading/error と quick search query/dialog state を view-local に保持する契約、`score=0` 除外の fuzzy search、renderer timeout/retry を追記 |
| v3.14.5    | 2026-03-11 | TASK-UI-04B-WORKSPACE-CHAT を反映: `WorkspaceChatPanel` の state ownership（`useWorkspaceChatController` 局所 state + `workspaceSlice` / `fileSelectionSlice` 再利用）を追加。stream race 回避の `streamContentRef` / `isStreamingRef` 即時同期、conversation 保存フロー、04B 対象テスト14件/Phase11 screenshot 8件を追記 |
| v3.14.4    | 2026-03-11 | TASK-UI-08-NOTIFICATION-CENTER を反映: `notificationSlice` の `setNotificationHistory()` dedupe、`deleteNotification()` の `expandedNotificationId` reset、058e の `NotificationCenter` 再整備（`お知らせ` / relative time / delete UI）を追記 |
| v3.14.4    | 2026-03-11 | TASK-SKILL-LIFECYCLE-01 完了同期: `App.tsx` が `normalizeSkillLifecycleView()` で legacy `skill-center` を canonical `skillCenter` に正規化してから view 分岐する契約を追加し、Skill Center を lifecycle 一次導線入口として扱う ownership note を追記 |
| v3.14.3    | 2026-03-10 | TASK-UI-04A-WORKSPACE-LAYOUT を反映: `WorkspaceView` は新規 slice を作らず `workspaceSlice` / `fileSelectionSlice` を再利用する契約、`workspace-layout-mode` / `workspace-panel-sizes` persist key、`useFileWatcher` の module scope guard、preview panel reverse resize と light theme contrast 是正を追加 |
| v3.14.2    | 2026-03-10 | TASK-UI-06-HISTORY-SEARCH-VIEW を反映。`historySearchSlice` の `hasFetchedHistory` / `isHistoryLoadingMore` / append dedupe 契約、`EditorSlice.pendingOpenFilePath` による file deep-open、timeline grouping / sentinel loading 分離、task-scope coverage 88.42 / 80.00 / 90.00 を追記 |
| v3.14.1    | 2026-03-10 | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査追補: `shouldResetUnauthenticatedView` / `PUBLIC_UNAUTHENTICATED_VIEWS` 相当の公開ビュー境界を追加し、未認証時 `settings` を reset 対象外にする契約を明文化 |
| v3.14.0    | 2026-03-09 | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 反映: useAuthState に AUTH_TIMEOUT_MS = 10,000ms タイムアウト機構追加。AuthState 型に "timed-out" 状態追加。getAuthState 純粋関数で isTimedOut 判定。Settings bypass で currentView === "settings" 時は AuthGuard 外レンダリング |
| v3.13.2    | 2026-03-09 | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 を反映。App shell mount 時の debug-only `localStorage.clear()` / `window.location.reload()` を persist 契約違反として明文化し、DD-04/DD-05（shared shell 副作用禁止 / bug path検証と screenshot path 分離）を追加。Phase 11 は通常ルート metadata 確認 + dedicated harness screenshot の二段構成を標準化 |
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

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [UIコンポーネントパターン](./arch-ui-components.md)
- [スキル関連インターフェース](./interfaces-agent-sdk-skill.md)
- [既知の落とし穴 P31: Store Hooks無限ループ](../../../rules/06-known-pitfalls.md#p31-zustand-store-hooks無限ループ)
- [実装パターン総合ガイド: Zustand Slice設計原則](./architecture-implementation-patterns.md#zustand-slice設計原則)
- [Store Hooks コンポーネント移行 実装ガイド](../../../../docs/30-workflows/completed-tasks/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/outputs/phase-12/implementation-guide.md)
- [AgentView無限ループ修正 実装ガイド](../../../../docs/30-workflows/completed-tasks/UT-FIX-AGENTVIEW-INFINITE-LOOP-001/outputs/phase-12/implementation-guide.md)
