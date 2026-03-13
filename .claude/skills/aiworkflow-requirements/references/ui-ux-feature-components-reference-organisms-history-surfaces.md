# 機能別 UI コンポーネント / reference bundle

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: reference bundle

## Organisms Foundation（TASK-UI-00-ORGANISMS / completed）

TASK-UI-00-ORGANISMS で、Renderer横断で再利用する Organisms 3コンポーネントを実装した。
対象は `CardGrid`、`MasterDetailLayout`、`SearchFilterList`。

### コンポーネント構成

| コンポーネント | 種類 | 責務 | 実装パス |
| --- | --- | --- | --- |
| CardGrid | organisms | 一覧カードのレスポンシブ配置、Arrowキー移動、loading/empty表示 | `apps/desktop/src/renderer/components/organisms/CardGrid/` |
| MasterDetailLayout | organisms | 一覧+詳細の2ペイン表示、モバイル時のSlideInPanel切替 | `apps/desktop/src/renderer/components/organisms/MasterDetailLayout/` |
| SearchFilterList | organisms | 検索・複数フィルタ・件数表示・list/grid切替 | `apps/desktop/src/renderer/components/organisms/SearchFilterList/` |

### 品質実測

| 指標 | 値 | 根拠 |
| --- | --- | --- |
| テスト | 3 files / 41 tests PASS | `outputs/phase-9/qa-test-summary.md` |
| カバレッジ | Stmts 97.26 / Branch 92.00 / Func 94.73 / Lines 97.26 | `outputs/phase-8/refactor-validation.md` |
| 手動検証 | TC-01〜TC-06 PASS | `outputs/phase-11/manual-test-result.md` |

### 実装時の苦戦箇所（TASK-UI-00-ORGANISMS）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| 再撮影後の時刻同期漏れ | スクリーンショット更新と文書更新を別ターンで実施する | `stat` で `TC-01..TC-06` の実時刻を取得し、`manual-test-result.md` と仕様台帳へ同値反映 | UI再撮影は「再撮影→時刻同期→coverage検証→台帳更新」を1セットで固定 |
| 未タスク監査値の誤読 | `audit --diff-from HEAD` の baseline を今回差分違反として扱う | 合否判定を `currentViolations=0` に固定し、`baselineViolations` を監視値へ分離 | 監査結果は current/baseline の二軸で記録する |
| Step 1-A で台帳/教訓の片側更新 | UI仕様だけ更新して完了判定する | `task-workflow.md` と `lessons-learned.md` を同一ターンで更新 | Phase 12 完了判定は「仕様同期 + 台帳同期 + 教訓同期」の3点同時成立に限定 |

### 同種課題の最短解決テンプレート（5分）

1. `verify-all-specs` と `validate-phase-output` で構造合否を先に確定する。  
2. UI再撮影を実行し、`validate-phase11-screenshot-coverage` をPASSさせる。  
3. `stat` 時刻を `manual-test-result.md` と仕様書へ同期する。  
4. `verify-unassigned-links` と `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合否に使う。  
5. `task-workflow.md` / `lessons-learned.md` へ実装内容・苦戦箇所・検証値を同時転記する。  

### 関連未タスク（2026-03-04 追補）

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001 | TASK-UI-00-ORGANISMS の Phase 12 証跡・台帳同期ガード（時刻同期/`current`判定固定/Step 1-A 同時更新） | 中 | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/unassigned-task/task-imp-task-ui-00-organisms-phase12-sync-guard-001.md` |

### 画面証跡

| 証跡 | ファイル |
| --- | --- |
| default dark desktop | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-01-organisms-default-dark-desktop.png` |
| search+filter dark desktop | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-02-search-filter-active-dark-desktop.png` |
| cardgrid loading | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-03-cardgrid-loading-dark-desktop.png` |
| cardgrid empty light | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-04-cardgrid-empty-light-desktop.png` |
| master-detail mobile | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-05-master-detail-mobile-dialog-dark.png` |
| search grid mobile | `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots/TC-06-search-grid-mobile-dark.png` |

---

## Foundation Reflection Audit（TASK-UI-00-FOUNDATION-REFLECTION-AUDIT / completed）

UI基盤反映監査タスクで、Task 5D語彙具体例と Task 5B適用境界、および正本導線を再監査・是正した。

| 観点 | 反映内容 | 根拠 |
| --- | --- | --- |
| 正本導線（FND-055-001） | `00-1-design-tokens.md` の正本リンクを completed-tasks 正本へ修正 | `validate-foundation-findings.mjs` PASS |
| 5D語彙具体例（FND-055-002） | `task-059a` に Before/After の具体例テーブルを追加 | 同上 PASS（rows=4） |
| Task 5B適用境界（FND-055-003） | `task-061` に `error/offline` の対象/対象外基準を追加 | 同上 PASS |
| 実装品質 | 検証スクリプトと単体テストを追加（Node test） | `tools/__tests__/validate-foundation-findings.test.mjs` PASS |
| 画面再検証 | Phase 11 スクリーンショット再取得（2026-03-05 11:43 JST / 最終 11:51 JST）と再検証 | `validate-phase11-screenshot-coverage` PASS（TC 6/6, warning 0） |

### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-UI-055-001 | EmptyState（light）境界線コントラスト改善 | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-055-empty-state-contrast-improvement.md` |
| UT-IMP-TASK-UI-055-FIVE-MINUTE-CARD-SYNC-GUARD-001 | TASK-055 の5分解決カードを3仕様書（task-workflow/lessons/ui-ux-feature）で同一同期する運用ガード | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-ui-055-five-minute-card-sync-guard-001.md` |

### 同種課題の5分解決カード（TASK-055）

| 手順 | 実行内容 | 合格条件 |
| --- | --- | --- |
| 1. 実体固定 | `which` + `rg` で検証スクリプト実体を確定 | グローバルCLI依存ゼロ |
| 2. 仕様是正 | 正本リンク / Task 5D具体例 / Task 5B境界を同時反映 | 仕様根拠3点が揃う |
| 3. 画面証跡 | 再撮影 + coverage validator 実行 | TC 6/6 PASS |
| 4. 未タスク監査 | `verify-unassigned-links` + `audit` 2種 | `currentViolations=0` |
| 5. 台帳同期 | `task-workflow` / `lessons` / `ui-ux-*` を同時更新 | 検証値・時刻の整合が取れる |

---

## Notification / History Domain（TASK-UI-01-C / completed）

`TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN` では、通知履歴ポップオーバーと履歴検索ビューを実装し、Store + IPC + UI を同時接続した。

### 実装内容（要点）

| 観点 | 実装内容 | 主なファイル |
| --- | --- | --- |
| Notification UI | ヘッダー右上に `NotificationCenter` を追加。未読バッジ、既読化、全件既読、全件削除、詳細展開を実装 | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`, `apps/desktop/src/renderer/App.tsx` |
| 履歴同期 | 初期 `notification:get-history` 同期 + `notification:new` push 購読を追加し、購読解除を実装 | `apps/desktop/src/preload/api/notification-api.ts`, `apps/desktop/src/main/ipc/notificationHandlers.ts` |
| 履歴検索 UI | `HistorySearchView` を本実装。query/filter、統計カード、結果一覧、load more を実装 | `apps/desktop/src/renderer/views/HistorySearchView/index.tsx` |
| 状態管理 | `historySearchFilter` / `historySearchStats` / `historySearchStatsError` を追加。`notificationSlice` に履歴同期/重複排除を追加 | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`, `apps/desktop/src/renderer/store/slices/notificationSlice.ts` |
| 回帰テスト | Notification handler / notificationSlice / historySearchSlice / HistorySearchView を拡張 | `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts`, `apps/desktop/src/renderer/store/slices/*.test.ts`, `apps/desktop/src/renderer/views/HistorySearchView/HistorySearchView.test.tsx` |

### TASK-UI-08 追補（2026-03-11）

`TASK-UI-08-NOTIFICATION-CENTER` では、既存の NotificationCenter を 058e 正本へ寄せるための UX 再整備を行った。HistorySearch 側の責務は維持しつつ、Bell から開く通知体験だけを重点的に更新した。

| 観点 | 058e 追補内容 | 主なファイル |
| --- | --- | --- |
| 文言/操作 | タイトルを `お知らせ` に統一し、`すべて削除` UI を撤去。`すべて既読` と個別削除に絞った | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx` |
| 視覚階層 | relative time、未読ドット、expanded detail inset を整理し、desktop/tablet/mobile の3レイアウトを調整 | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx` |
| Portal/a11y | popover を `document.body` へ portal 描画し、Escape、outside click、focus return、Tab wrap を追加 | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx` |
| 個別削除契約 | `notification:delete` を shared/preload/main に追加し、UI 削除導線を Main persistence と接続 | `packages/shared/src/ipc/channels.ts`, `apps/desktop/src/preload/types.ts`, `apps/desktop/src/main/ipc/notificationHandlers.ts` |
| 回帰テスト | component/store/ipc/preload の targeted tests 59件と coverage gate を通過 | `apps/desktop/src/renderer/components/organisms/NotificationCenter/NotificationCenter.test.tsx`, `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`, `apps/desktop/src/main/ipc/notificationHandlers.test.ts`, `apps/desktop/src/preload/channels.test.ts` |

### 画面証跡（2026-03-11）

| 証跡 | ファイル |
| --- | --- |
| desktop popover open | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-02-desktop-popover-open.png` |
| desktop item expanded | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-03-desktop-item-expanded.png` |
| mobile overlay | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-05-mobile-overlay-open.png` |
| empty state | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/TC-11-06-empty-state.png` |

### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| 通知 push のタイムスタンプ不正値で表示順が乱れる | Main 側で push payload を無検証送信する | `emitNotificationNew` と `notificationSlice` で ISO 正規化を重ね、並び順を固定 | Push payload は Main/Renderer 両境界で正規化する |
| 初期履歴同期と push の競合で通知が重複する | getHistory 直後に同一IDの push を受信する | `ingestNotification` に ID 重複排除を実装 | 履歴同期 + push の組み合わせは dedupe を必須化する |
| filter 変更後の追加読込で条件が外れる | `loadMore` が既存 filter を参照しない | `historySearchFilter` を slice に保持し `loadMoreHistory` へ引き継ぎ | 検索系 state は query/filter/pagination を同一スライスで一元管理する |

### 画面証跡（2026-03-05）

| 証跡 | ファイル |
| --- | --- |
| Notification popover | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-11/screenshots/TC-01-notification-popover.png` |
| History result | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-11/screenshots/TC-02-history-search-result.png` |
| History stats | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-11/screenshots/TC-03-history-stats-panel.png` |

### 関連未タスク（2026-03-05 追補）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-TASK-UI-01C-NOTIFICATION-HISTORY-BOUNDARY-GUARD-001 | Notification/History ドメイン境界の回帰ガード強化（push正規化/dedupe/filter継承） | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/unassigned-task/task-imp-task-ui-01c-notification-history-boundary-guard-001.md` |

---

## History Timeline Refresh（TASK-UI-06-HISTORY-SEARCH-VIEW / completed）

`TASK-UI-06-HISTORY-SEARCH-VIEW` では、既存 `HistorySearchView` を「query/filter/stats の検索画面」から「最近の流れを自然に読める timeline」へ再設計した。

### 実装内容（要点）

| 観点 | 実装内容 | 主なファイル |
| --- | --- | --- |
| Timeline UI | `きょう` / `きのう` / `今週` / `先週` / `{n}月` の日付グループと sticky header を追加 | `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`, `apps/desktop/src/renderer/views/HistorySearchView/hooks/useTimelineGroups.ts`, `apps/desktop/src/renderer/views/HistorySearchView/components/TimelineGroupHeader.tsx` |
| 検索体験 | 300ms debounce、検索空/初期空/error state、結果総数補助表示へ整理 | `apps/desktop/src/renderer/views/HistorySearchView/components/HistorySearchBar.tsx`, `apps/desktop/src/renderer/views/HistorySearchView/components/HistoryEmptyState.tsx` |
| 追加読込 | observer sentinel による自動追補と loadingMore 分離 | `apps/desktop/src/renderer/views/HistorySearchView/hooks/useInfiniteScroll.ts`, `apps/desktop/src/renderer/views/HistorySearchView/components/InfiniteScrollSentinel.tsx` |
| 状態管理 | `historySearchSlice` に `hasFetchedHistory` / `isHistoryLoadingMore` / append dedupe を追加 | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` |
| 導線統合 | file card から editor へ deep-open する `pendingOpenFilePath` を追加 | `apps/desktop/src/renderer/store/slices/editorSlice.ts`, `apps/desktop/src/renderer/views/EditorView/index.tsx` |
| IPC | `history:search` の trim / filter / pagination guard を整理 | `apps/desktop/src/main/ipc/historySearchHandlers.ts`, `apps/desktop/src/preload/types.ts` |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest`（5 files / 26 tests） | PASS |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| task-scope coverage | Lines 88.42 / Branches 80.00 / Functions 90.00 |
| Phase 11 screenshot | 6件取得、`validate-phase11-screenshot-coverage` PASS |

### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| worktree の rollup native optional module 欠落 | UI検証前に依存整合を確認しない | `pnpm install --frozen-lockfile` を preflight に追加 | worktree の screenshot / vitest 前に optional dependency を補完する |
| screenshot script の locator が broad で strict mode violation になる | summary/detail が同一文字列を共有する | 一意な detail 側 text へ待機条件を変更 | capture script は一意 text または `data-testid` を正本にする |
| `.claude` と `.agents` の skill root drift | workflow / outputs が mirror 側を参照する | `.claude` 正本へ再同期し、systemic 課題は未タスクへ分離 | system spec 更新先は `.claude/skills/...` を canonical として扱う |

### 同種課題の5分解決カード

1. 画面の主目的を「検索画面」ではなく「読む timeline」として先に固定する。  
2. `hasFetchedHistory` と `isHistoryLoadingMore` を分け、初回/追補/空状態を混同しない。  
3. cross-view 導線は `pending payload + view 遷移` の二段構成にする。  
4. screenshot script は一意 selector または `data-testid` を ready condition にする。  
5. `.claude` 正本、workflow outputs、未タスク、skill docs を同一ターンで同期する。  

### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001 | `.claude` 正本と `.agents` mirror の drift を機械検知し、Phase 12 で canonical root を固定する | 中 | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/unassigned-task/task-imp-skill-root-canonical-sync-guard-001.md` |

---

### Dashboard Home Enhancement（TASK-UI-07 / completed）

TASK-UI-07 は、既存の統計中心 `DashboardView` を、挨拶・次の一手・最近の動きがすぐ分かるホーム画面へ置き換えた UI エンハンスメントタスクである。内部 `ViewType` は `dashboard` を維持しつつ、画面内文言と情報階層だけをホーム体験へ変換した。

### 実装内容（要点）

| 観点 | 内容 |
| --- | --- |
| 画面の主目的 | 挨拶・サジェスチョン・最近の動きから、次に取る行動を即決できるホーム画面 |
| 変更範囲 | `DashboardView` / view-local components / `dashboardContent.ts` / screenshot harness |
| 実装した要点 | `GreetingHeader`、`DashboardSuggestionSection`、`RecentTimeline` を追加し、旧統計カード主体の構成を置き換えた |
| 契約上の要点 | 表示名は `ホーム` へ変更したが、内部 `ViewType` は `dashboard` を維持して nav/store 契約を崩していない |
| 視覚検証 | Phase 11 screenshot TC-11-01〜05、Apple UI/UX engineer 観点レビュー |
| 完了根拠 | 22 tests PASS、typecheck PASS、`verify-all-specs` PASS、`validate-phase11-screenshot-coverage` PASS |

### 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| 表示名 `ホーム` と内部 `dashboard` 契約が混線する | UI文言変更をそのまま内部 ID 変更として扱う | copy と internal ID を分離し、内部契約は維持した | UI名称変更では文言と内部契約 ID を別 concern として扱う |
| view-local component と shared component の境界が曖昧になる | 再利用前提がない UI を shared 配下へ早期抽出する | `GreetingHeader` などは `DashboardView/components/` に閉じた | view 固有ロジックは reusable 要件が出るまで local に留める |
| dual skill-root repository で mirror 側が stale になる | canonical root を決めずに Phase 12 を完了扱いにする | `.claude` を正本に固定し、mirror sync と diff 検証を追加した | dual root repo では canonical root 固定 + mirror sync + root 間 diff を完了条件にする |

### 同種課題の5分解決カード

1. UI copy と内部契約 ID を最初に分離する。
2. view-local component と shared component を利用範囲で切り分ける。
3. screenshot harness で representative state を固定する。
4. completed workflow は outputs と workflow 本文を同時に同期する。
5. canonical root / mirror root / `diff -qr` を Phase 12 完了条件へ含める。

### 関連未タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001 | Phase 12 dual skill-root mirror sync ガード（canonical root 固定 + mirror sync + root間diff検証） | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md` |

---

## 仕様書作成済みタスク（spec_created）

### SkillEditorView UI（TASK-UI-05A / 統合未完了）

TASK-UI-05A-SKILL-EDITOR-VIEW は、SkillEditorView の Phase 1-13 仕様書作成まで完了している。`views/SkillEditorView` の実装ファイルは存在するが、ナビゲーション導線と `skill:getFileTree` IPC連携が未完了のため、統合状態は未完了。
既存の `EditorView` と `SkillEditor` とは責務が異なり、専用ビューとしては未配線の状態。

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ 作成済み | `docs/30-workflows/skill-editor-view/` |
| 実装コード（`views/SkillEditorView`） | ⚠️ 実装済み（統合未完了） | `apps/desktop/src/renderer/views/SkillEditorView/` |
| ナビゲーション導線（`ViewType` / `GlobalNavStrip` / `MobileNavBar`） | ❌ 未配線 | `apps/desktop/src/renderer/store/slices/uiSlice.ts`, `apps/desktop/src/renderer/navigation/navContract.ts`, `App.tsx` |
| 画面検証証跡 | ✅ 取得済み | `docs/30-workflows/skill-editor-view/outputs/phase-11/` |
| `skill:getFileTree` IPCチャネル | ❌ 未実装 | UT-UI-05A-GETFILETREE-001 で対応予定。`api-ipc-agent.md` に仕様追加済み |
| 実装残課題の統合管理 | ✅ 正式登録済み | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-editor-view-implementation-closure.md` |
| `useFileTree` 契約整合 | ✅ 正式登録済み | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-spec-consistency-filetree-contract.md` |

### 画面検証証跡

| 証跡 | ファイル |
| --- | --- |
| 現行 Dashboard 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-01-current-dashboard.png` |
| 現行 Editor 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-02-current-editor-view.png` |
| 再監査 Dashboard 画面（2026-03-02） | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-03-current-dashboard-20260302.png` |
| 再監査 Editor 画面（2026-03-02） | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-04-current-editor-20260302.png` |
| 手動検証結果 | `docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md` |
| 発見課題 | `docs/30-workflows/skill-editor-view/outputs/phase-11/discovered-issues.md` |

---

## 仕様書作成済みタスク（spec_created）

現時点で本ドキュメント内に `spec_created` 状態の UI タスクはなし（TASK-UI-05B は 2026-03-02 時点で completed へ移行）。

---

