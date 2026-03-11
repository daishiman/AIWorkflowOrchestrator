# Phase 6 エッジケース試験表

| ID    | ケース            | 期待結果                                 | 状況                                |
| ----- | ----------------- | ---------------------------------------- | ----------------------------------- |
| EC-01 | invalid timestamp | `日付不明` に退避しクラッシュしない      | `useTimelineGroups.test.tsx` で確認 |
| EC-02 | duplicate append  | 同一 id が 1 件だけ残る                  | `historySearchSlice.test.ts` で確認 |
| EC-03 | 空白 query        | trim 後に検索される                      | slice / IPC test で確認             |
| EC-04 | metadata 欠損     | card が fallback copy で表示される       | View test で確認                    |
| EC-05 | observer 再接続   | loading / hasMore guard で二重発火しない | `useInfiniteScroll.test.tsx` で確認 |
| EC-06 | handler trim      | service に未 trim query を流さない       | IPC test で確認                     |

## 不安定化対策

- observer は mock を使って deterministic に検証
- group 化は固定 timestamp で検証
- screenshot script は strict locator collision を避ける待機に修正済み
