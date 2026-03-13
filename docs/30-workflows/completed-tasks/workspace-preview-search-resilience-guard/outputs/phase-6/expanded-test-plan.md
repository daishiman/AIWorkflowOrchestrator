# Phase 6 Output: Expanded Test Plan

## 実行結果

- ステータス: completed
- 追加した edge case: stable sort、empty state、transport retry exhausted、structured parse fallback、render crash reset

## 追加テスト

| 追加対象       | テストファイル                      | 追加観点                                                   |
| -------------- | ----------------------------------- | ---------------------------------------------------------- |
| search utility | `quickFileSearchResilience.test.ts` | fuzzy no-match の完全排除、idle / results / no-match state |
| search UI      | `QuickFileSearch.test.tsx`          | empty state testid と click/highlight の明示検証           |
| preview helper | `previewResilience.test.ts`         | timeout / read failure / helper text                       |
| preview UI     | `PreviewPanel.test.tsx`             | structured fallback alert、transport taxonomy alert        |
| integration    | `WorkspaceView.test.tsx`            | timeout message の status bar 反映                         |

## 結論

- Phase 4 の testcase を unit / component / integration の三層へ展開できた
- 04C で苦戦した 3 難所はすべて独立テストへ固定できた
