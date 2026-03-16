# HistorySearchView UI仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: `.claude/skills/aiworkflow-requirements/`
>
> **親ドキュメント**: [ui-ux-feature-components.md](./ui-ux-feature-components.md)

---

## 概要

`HistorySearchView` は Desktop Renderer 上で「あなたの記録」を時系列に振り返るための activity timeline である。チャット・ファイル・スキルの3種を単一画面へ統合し、検索よりも「最近の流れを自然に追えること」を優先する。

### 対象タスク

| 項目 | 内容 |
| --- | --- |
| タスクID | `TASK-UI-06-HISTORY-SEARCH-VIEW` |
| 完了日 | 2026-03-10 |
| 成果物 | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/` |
| ユーザー向け名称 | `あなたの記録` |

---

## 実装内容（要点）

| 観点 | 内容 |
| --- | --- |
| 変更範囲 | Renderer `HistorySearchView` / hooks / components、Store `historySearchSlice` / `editorSlice`、Main `historySearchHandlers`、Preload types |
| 実装した要点 | timeline grouping、sticky header、300ms debounce、empty/error/search-empty 分離、infinite scroll、自動 append、file deep-open 導線を実装 |
| 契約上の要点 | `hasFetchedHistory` と `isHistoryLoadingMore` を分離し、`searchHistory(query, offset)` は trim 後に append/search を切り替える。`history:search` は query 空文字許容、filter/limit/offset を guard する |
| 視覚検証 | Phase 11 screenshot 6件を取得し、desktop search / accordion / error / empty / mobile sticky を確認 |
| 完了根拠 | task-scope tests 26 PASS、`pnpm --filter @repo/desktop typecheck` PASS、coverage 88.42 / 80.00 / 90.00、`verify-all-specs` PASS |

---

## UI責務

| 観点 | 仕様 |
| --- | --- |
| 主目的 | 検索専用画面ではなく、最近の活動を時系列で振り返る timeline を提供する |
| 情報源 | `HistoryItem` (`chat` / `file` / `skill`) を単一リストへ統合する |
| 第一階層 | 画面タイトル、補助説明、検索バー |
| 第二階層 | 日付グループ（`きょう` / `きのう` / `今週` / `先週` / `{n}月`） |
| 第三階層 | type別カード (`ChatHistoryCard` / `FileHistoryCard` / `SkillHistoryCard`) |
| 補助導線 | file card から `EditorView` deep-open、empty state から `chat` 導線 |

---

## コンポーネント構成

| ファイル | 役割 | 備考 |
| --- | --- | --- |
| `views/HistorySearchView/index.tsx` | 画面全体の orchestration | 初回読込、debounce、state mode 判定 |
| `components/HistorySearchBar.tsx` | 300ms debounce 前提の入力UI | clear action あり |
| `components/TimelineGroup.tsx` | 日付グループ描画 | type別 card dispatch |
| `components/TimelineGroupHeader.tsx` | sticky 日付ヘッダー | mobile で `top-0`、gradient + blur |
| `components/HistoryEmptyState.tsx` | `empty` / `search` / `error` を統一 | CTA 文言を文脈で切替 |
| `components/InfiniteScrollSentinel.tsx` | IntersectionObserver sentinel | `hasMore` と loading を表示 |
| `hooks/useDebouncedValue.ts` | 検索入力の debounce | `300ms` 固定 |
| `hooks/useTimelineGroups.ts` | timeline label grouping | timestamp 不正時は `日付不明` |
| `hooks/useInfiniteScroll.ts` | observer 管理 | `rootMargin` / `threshold` を定数化 |

---

## 状態・導線契約

### Store契約

| 状態/Action | 仕様 |
| --- | --- |
| `historySearchQuery` | 入力欄の現在値。debounce 前の生値を保持する |
| `historySearchResults` | timeline 表示対象の `HistoryItem[]` |
| `historySearchTotalCount` | 検索結果総数。header 補助表示に使う |
| `historySearchHasMore` | sentinel の追加読込判定 |
| `hasFetchedHistory` | 初回取得済みかどうか。初期 loading と empty を分離する |
| `isHistorySearching` | 初回/再検索の in-flight 状態 |
| `isHistoryLoadingMore` | append 読込中。初回 loading と分離する |
| `expandedItemId` | accordion で同時展開する card を1件に制限する |
| `searchHistory(query, offset, filter)` | `query.trim()` 後に検索。`offset > 0` は append モード |
| `loadMoreHistory()` | `hasMore=false` / searching中 / loadingMore中 は no-op |
| `requestOpenFile(filePath)` | `editorSlice.pendingOpenFilePath` へ deep-open 対象を渡す |

### 状態遷移

| mode | 条件 | 表示 |
| --- | --- | --- |
| `loading` | `!hasFetchedHistory && isHistorySearching` | skeleton 5件 |
| `error` | `historySearchError !== null` | retry CTA |
| `results` | `results.length > 0` | timeline + sentinel |
| `search-empty` | `query.trim() !== \"\" && results.length === 0` | clear CTA |
| `empty` | 初回取得後に結果0件 | chat 導線 |

### Editor deep-open 契約

| 項目 | 仕様 |
| --- | --- |
| 起点 | `FileHistoryCard` の open action |
| 中継 | `requestOpenFile(filePath)` |
| 遷移 | `setCurrentView(\"editor\")` |
| 消費側 | `EditorView` が `pendingOpenFilePath` を監視して実ファイルを開く |

---

## IPC契約

| チャネル | 入力 | 出力 | 実装要点 |
| --- | --- | --- | --- |
| `history:search` | `HistorySearchRequest` | `HistorySearchResponse` | `query` は空文字許容、空白のみは trim 後 `\"\"` に正規化 |
| `history:get-stats` | なし | `HistorySearchStatsResponse` | summary card ではなく補助集計用途 |

### バリデーション

| 項目 | 仕様 |
| --- | --- |
| sender検証 | `validateIpcSender` または injected validator を必須化 |
| filter | `all` / `chat` / `file` / `skill` のみ許可 |
| limit | 数値・有限・整数・0以上のみ採用。invalid は `30` へ fallback |
| offset | 数値・有限・整数・0以上のみ採用。invalid は `0` へ fallback |
| error surface | transport では `success/error` を返し、Renderer で message を表示する |

---

## テスト・画面検証

| 検証 | 結果 |
| --- | --- |
| `HistorySearchView.test.tsx` | PASS |
| `useTimelineGroups.test.tsx` | PASS |
| `useInfiniteScroll.test.tsx` | PASS |
| `historySearchSlice.test.ts` | PASS |
| `historySearchHandlers.test.ts` | PASS |
| task-scope coverage | Lines 88.42 / Branches 80.00 / Functions 90.00 |
| Phase 11 screenshot | 6件取得、`validate-phase11-screenshot-coverage` PASS |

### 画面証跡

| TC | ファイル |
| --- | --- |
| `TC-11-01` | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/phase-11/screenshots/TC-11-01-initial.png` |
| `TC-11-02` | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/phase-11/screenshots/TC-11-02-search.png` |
| `TC-11-03` | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/phase-11/screenshots/TC-11-03-accordion.png` |
| `TC-11-11` | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/phase-11/screenshots/TC-11-11-error.png` |
| `TC-11-12` | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/phase-11/screenshots/TC-11-12-empty.png` |
| `TC-11-21` | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/phase-11/screenshots/TC-11-21-mobile-sticky.png` |

---

## 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| worktree で Rollup native optional module が欠ける | `vitest` 起動前に `@rollup/rollup-darwin-x64` が未展開 | `pnpm install --frozen-lockfile` を preflight にした | worktree の UI検証前に依存整合を先に通す |
| screenshot script の待機条件が broad で strict mode violation になる | summary/detail に同じ文字列が2回出る | 一意な detail text へ待機条件を絞った | capture script は一意 selector または `data-testid` を優先する |
| `.claude` 正本と `.agents` mirror の更新先が混線する | workflow / outputs / skill docs が `.agents` 側を参照する | `.claude` を正本と明示し、mirror drift は未タスクへ分離した | system spec の更新先は常に `.claude/skills/...` を正本にする |

### 同種課題の5分解決カード

1. 画面仕様を「検索画面」ではなく「timeline 読み物」として再定義する。  
2. `hasFetchedHistory` と `isHistoryLoadingMore` を分け、初回/追補/空状態を混同しない。  
3. screenshot script の待機条件は一意 selector に固定する。  
4. file deep-open がある場合は `pendingOpenFilePath` のような橋渡し state を設ける。  
5. Phase 12 は `.claude` 正本、workflow outputs、未タスク、skill docs を同一ターンで同期する。  

---

## ライフサイクルタイムライン観測項目（TASK-SKILL-LIFECYCLE-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| ステータス | `spec_created`（設計タスク） |

### スコア推移グラフ

Task07 の `ScoreDataPoint[]`（`{ timestamp, score, eventType }`）を時系列で可視化する。HistorySearchView の timeline とは独立したライフサイクル専用ビューとして設計される。

### 集約ビュー表示

`SkillAggregateView` の最新値（成功率・トレンド方向・推薦スコア）をスキル詳細パネルのサマリー領域に表示する。

### 参照リンク

- Task07 設計: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`
- Task07 要件: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-1-requirements.md`

---

## 関連ドキュメント

- [ui-ux-feature-components.md](./ui-ux-feature-components.md)
- [arch-state-management.md](./arch-state-management.md)
- [api-ipc-system.md](./api-ipc-system.md)
- [task-workflow.md](./task-workflow.md)
- [lessons-learned.md](./lessons-learned.md)

---

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| v1.0.1 | 2026-03-10 | `実装内容（要点）` ブロックを追加し、変更範囲・契約要点・視覚検証・完了根拠をテンプレート準拠で明文化 |
| v1.0.0 | 2026-03-10 | TASK-UI-06-HISTORY-SEARCH-VIEW の system spec を新規作成。timeline UI、state/IPC 契約、画面証跡、苦戦箇所、5分解決カードを統合 |
