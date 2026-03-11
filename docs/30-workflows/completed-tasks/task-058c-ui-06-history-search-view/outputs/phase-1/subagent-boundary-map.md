# Phase 1 SubAgent 分担表

| SubAgent   | 関心ごと                                                     | Phase主担当           | 並列化方針                                |
| ---------- | ------------------------------------------------------------ | --------------------- | ----------------------------------------- |
| SubAgent-A | 要件定義、トレーサビリティ、system spec 同期、doc drift 監査 | 1, 3, 10, 12          | 文書監査と validator 実行を並列化         |
| SubAgent-B | UI構造、UX、responsive、manual screenshot 計画               | 2, 4, 5, 8, 11        | component/hook 読みと UI 実装を並列化     |
| SubAgent-C | Store、IPC、preload/types、editor deep-open 契約             | 2, 4, 5, 9            | slice/handler/type の実装と test を並列化 |
| SubAgent-D | test first、coverage、QA、review gate                        | 3, 4, 6, 7, 9, 10, 11 | test matrix 生成と実行結果整理を並列化    |

## 境界ルール

- UI copy と visual hierarchy の最終判断は SubAgent-B が持つ
- `historySearch` transport / preload / IPC の整合は SubAgent-C が最終責任を持つ
- Phase 11/12 の validator 運用は SubAgent-A + D の共同責務とする
