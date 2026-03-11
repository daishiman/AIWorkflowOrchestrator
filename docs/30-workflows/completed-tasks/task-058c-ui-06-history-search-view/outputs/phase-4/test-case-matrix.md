# Phase 4 テストケース一覧

## 自動テストマトリクス

| ID          | 層         | ケース                                                 | 期待結果                                         | 実装先                          |
| ----------- | ---------- | ------------------------------------------------------ | ------------------------------------------------ | ------------------------------- |
| AT-UI-01    | View       | 初期表示で `あなたの記録` と timeline group を表示する | stats/filter が出ず、日付グループが見える        | `HistorySearchView.test.tsx`    |
| AT-UI-02    | View       | 検索入力後に結果が絞り込まれる                         | 300ms 後に search action が走る                  | `HistorySearchView.test.tsx`    |
| AT-UI-03    | View       | accordion を開閉できる                                 | `aria-expanded` と詳細領域が同期する             | `HistorySearchView.test.tsx`    |
| AT-UI-04    | View       | 初期空 / 検索空 / error が分かれる                     | copy と CTA が状態別に変わる                     | `HistorySearchView.test.tsx`    |
| AT-INT-01   | View+Store | file card 導線で pending file path を積む              | `EditorView` が deep-open できる                 | `HistorySearchView.test.tsx`    |
| AT-HOOK-01  | Hook       | `useTimelineGroups` が同日 item を束ねる               | 降順グループ化、invalid timestamp は `日付不明`  | `useTimelineGroups.test.tsx`    |
| AT-HOOK-02  | Hook       | `useInfiniteScroll` が observer 発火時のみ load more   | `threshold:0.1` / `rootMargin:0px 0px 200px 0px` | `useInfiniteScroll.test.tsx`    |
| AT-STORE-01 | Slice      | search 開始で state が reset される                    | `offset=0`、error clear、初回取得待ち            | `historySearchSlice.test.ts`    |
| AT-STORE-02 | Slice      | append 時に dedupe する                                | 同一 id は 1 件だけ残る                          | `historySearchSlice.test.ts`    |
| AT-STORE-03 | Slice      | query trim を保持する                                  | request builder が前後空白を落とす               | `historySearchSlice.test.ts`    |
| AT-IPC-01   | IPC        | handler が trim 済み query を service へ渡す           | `"  abc  "` -> `"abc"`                           | `historySearchHandlers.test.ts` |
| AT-IPC-02   | IPC        | envelope failure を surface する                       | error message が renderer に返る                 | `historySearchHandlers.test.ts` |

## 手動試験へ移送したケース

| TC-ID    | 理由                                       | 移送先   |
| -------- | ------------------------------------------ | -------- |
| TC-11-01 | 情報階層とタイトルの視覚確認が必要         | Phase 11 |
| TC-11-02 | 検索バー密度と結果切替の体感確認が必要     | Phase 11 |
| TC-11-03 | accordion 展開後の可読性確認が必要         | Phase 11 |
| TC-11-04 | Chat / File 導線の実画面統合確認が必要     | Phase 11 |
| TC-11-11 | error の copy と再試行 CTA を目視確認する  | Phase 11 |
| TC-11-12 | zero state の copy を目視確認する          | Phase 11 |
| TC-11-21 | mobile sticky の視覚確認が自動テストで不足 | Phase 11 |
| TC-11-22 | keyboard / aria の手動確認が必要           | Phase 11 |
