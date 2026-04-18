# TASK-SW-STREAM-FUP-03 手動テストチェックリスト

## メタ情報

| 項目               | 内容                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| タスクID           | TASK-SW-STREAM-FUP-03                                                                  |
| タスク種別         | NON_VISUAL                                                                             |
| 対象               | `SkillCreatorService` の進捗通知フロー                                                 |
| 実施方針           | 実地 UI 操作なし。自動テストログを証跡として整理                                       |
| 証跡の主ソース     | `SkillCreatorService.progress.test.ts` / `TASK-SW-STREAM-FUP-03-manual-test-report.md` |
| スクリーンショット | 不要                                                                                   |
| TC件数             | 25件                                                                                   |
| 集計               | 39 passed (39)                                                                         |

## 証跡A: progress フロー確認

| TC    | 確認内容                                                      | 証跡           | 結果 |
| ----- | ------------------------------------------------------------- | -------------- | ---- |
| TC-01 | collaborative で最初に `interview` が通知される               | 自動テストログ | PASS |
| TC-02 | collaborative で `consensus` が `interview` の後に通知される  | 自動テストログ | PASS |
| TC-03 | collaborative の `percentage` が単調増加する                  | 自動テストログ | PASS |
| TC-04 | collaborative で `done(100%)` が最後に通知される              | 自動テストログ | PASS |
| TC-05 | orchestrate で最初に `engine-selection` が通知される          | 自動テストログ | PASS |
| TC-06 | orchestrate の `percentage` が単調増加する                    | 自動テストログ | PASS |
| TC-07 | orchestrate で `done(100%)` が最後に通知される                | 自動テストログ | PASS |
| TC-08 | update で最初に `loading-skill` が通知される                  | 自動テストログ | PASS |
| TC-09 | update で `analyzing` が `loading-skill` の後に通知される     | 自動テストログ | PASS |
| TC-10 | update で `done(100%)` が最後に通知される                     | 自動テストログ | PASS |
| TC-11 | improve-prompt で最初に `loading-skill` が通知される          | 自動テストログ | PASS |
| TC-12 | improve-prompt で `improving` が `analyzing` の後に通知される | 自動テストログ | PASS |
| TC-13 | improve-prompt で `done(100%)` が最後に通知される             | 自動テストログ | PASS |
| TC-14 | create の 5 段階フロー（planning → done）が維持される         | 自動テストログ | PASS |

## 証跡B: `onProgress` 未指定時の安全動作

| TC    | 確認内容                                                  | 証跡           | 結果 |
| ----- | --------------------------------------------------------- | -------------- | ---- |
| TC-15 | collaborative で `onProgress` 未指定でもエラーにならない  | 自動テストログ | PASS |
| TC-16 | orchestrate で `onProgress` 未指定でもエラーにならない    | 自動テストログ | PASS |
| TC-17 | update で `onProgress` 未指定でもエラーにならない         | 自動テストログ | PASS |
| TC-18 | improve-prompt で `onProgress` 未指定でもエラーにならない | 自動テストログ | PASS |

## 証跡C: `percentage` 単調増加確認

| TC    | 確認内容                                      | 証跡           | 結果 |
| ----- | --------------------------------------------- | -------------- | ---- |
| TC-19 | orchestrate の `percentage` が単調増加する    | 自動テストログ | PASS |
| TC-20 | update の `percentage` が単調増加する         | 自動テストログ | PASS |
| TC-21 | improve-prompt の `percentage` が単調増加する | 自動テストログ | PASS |

## 証跡D: `done` 最終通知確認

| TC    | 確認内容                                          | 証跡           | 結果 |
| ----- | ------------------------------------------------- | -------------- | ---- |
| TC-22 | collaborative で最後の通知が `done(100%)` である  | 自動テストログ | PASS |
| TC-23 | orchestrate で最後の通知が `done(100%)` である    | 自動テストログ | PASS |
| TC-24 | update で最後の通知が `done(100%)` である         | 自動テストログ | PASS |
| TC-25 | improve-prompt で最後の通知が `done(100%)` である | 自動テストログ | PASS |

## 総合判定

- TC-01〜TC-25: 全件 PASS
- 非視覚タスクのため、UI 操作証跡は不要
