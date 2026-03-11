# Phase 4 テスト仕様書

## 目的

058c の再設計要件を UI、hook、slice、IPC の失敗条件へ落とし込み、Phase 5 の実装前に「何が壊れたら失敗か」を固定した。

## SubAgent 分担

| SubAgent   | 担当                         | 出力                                           |
| ---------- | ---------------------------- | ---------------------------------------------- |
| SubAgent-B | UI / a11y / manual test 草案 | timeline、accordion、zero state、sticky header |
| SubAgent-C | slice / IPC 契約             | trim、append dedupe、preload 型整合            |

## テスト対象

| 層          | 対象ファイル                                                             | 目的                                         |
| ----------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| View        | `src/renderer/views/HistorySearchView/index.tsx`                         | `あなたの記録`、検索、タイムライン、状態分岐 |
| Hook        | `useDebouncedValue.ts` / `useTimelineGroups.ts` / `useInfiniteScroll.ts` | 300ms、日付グループ、observer 条件           |
| Store       | `historySearchSlice.ts`                                                  | 初回取得、追補、重複除去、展開状態           |
| IPC         | `historySearchHandlers.ts` / `preload/types.ts`                          | trim、invoke 契約、型ドリフト是正            |
| Integration | `EditorView/index.tsx` / `editorSlice.ts`                                | file card から editor deep-open              |

## Red 条件

1. タイトルが `履歴検索` のまま、または stats/filter UI が残る
2. 300ms デバウンス前に search が走る、または Enter 依存のまま
3. タイムラインが日付グループ化されない
4. accordion 展開時に chat / file / skill の詳細差分が出ない
5. `load more` ボタン依存のままで observer 追補に置換されない
6. `historySearchSlice` が初回取得状態を保持できない
7. append 時に duplicate item が混入する
8. IPC に空白 query がそのまま渡る
9. file card の導線で editor が開かない
10. 初期空、検索空、error の 3 状態が分離されない

## 実装前に固定したコマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/HistorySearchView/HistorySearchView.test.tsx \
  src/renderer/views/HistorySearchView/hooks/useTimelineGroups.test.tsx \
  src/renderer/views/HistorySearchView/hooks/useInfiniteScroll.test.tsx \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/__tests__/historySearchHandlers.test.ts
```

## 実行結果

- 2026-03-10 時点で上記 5 ファイル 26 tests が PASS
- Red 条件はすべてテスト観点へ変換済み
- `preload/types.ts` の契約ドリフトは test というより設計差分として Phase 5 で修正対象へ移送

## 次Phaseへの入力

- `test-case-matrix.md` を Phase 5 の変更順序の基準にする
- `manual-test-draft.md` の TC-ID を Phase 11 の正本に引き継ぐ
