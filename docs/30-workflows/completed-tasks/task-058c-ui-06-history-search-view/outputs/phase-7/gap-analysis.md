# Phase 7 gap analysis

## 未検証が薄い箇所

| 対象                         | ギャップ                                      | 補完先                            |
| ---------------------------- | --------------------------------------------- | --------------------------------- |
| `historySearchHandlers.ts`   | エラー分岐と sender/validation 分岐が一部薄い | 追加 unit test 候補               |
| `InfiniteScrollSentinel.tsx` | component 単体の rendering 分岐が薄い         | View 経由 / 必要なら単体 test     |
| `SkillHistoryCard.tsx`       | metadata 欠損 branch が薄い                   | View test 追加候補                |
| `ChatHistoryCard.tsx`        | 一部分岐が branch coverage 未達               | manual visual と future unit test |

## 補完不要と判断したもの

- sticky header の見た目
- accordion 展開時の視線移動のしやすさ
- mobile 狭幅での日付ヘッダー重なり

上記はコード coverage ではなく Phase 11 の視覚検証で扱う。
