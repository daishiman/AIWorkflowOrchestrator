# Phase 2 Parent-Child Responsibility Matrix

## matrix

| 領域        | parent reference workflow                                                | child workflow                                             |
| ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 04A         | block 関係、canonical path、入口説明、Phase 11 evidence inheritance 参照 | `WorkspaceView` layout / file browser / watcher 実装と検証 |
| 04B         | 04A 完了後の並列開始条件、canonical path、入口説明                       | chat panel / mention / stream / conversation 実装と検証    |
| 04C         | 04A 完了後の並列開始条件、canonical path、入口説明                       | preview panel / quick search / timeout / retry 実装と検証  |
| system spec | update target の定義、同期順序、ledger                                   | feature detail と lessons の保持                           |
| manual test | child evidence 継承、docs-only N/A 理由                                  | 実画面 screenshot と Apple HIG 検証                        |

## 設計判断

- 親は feature を説明するが再定義しない。
- child の status は親が複製せず canonical path へ送客する。
- 親の value は「探索コストを下げること」に限定する。
