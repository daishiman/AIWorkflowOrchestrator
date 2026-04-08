# Phase 4 成果物: テストマトリクス

## TC-01〜TC-14（Phase 4 TDD Red 対象）

| TC    | 対象                     | 入力・条件                                     | 期待出力 / 動作                                              |
| ----- | ------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| TC-01 | `buildInitialAnswers()`  | `SmartDefaultResult` 全フィールドに値あり      | 各 `selectedOption` に semantic default を正規化した値が入る |
| TC-02 | `buildInitialAnswers()`  | `SmartDefaultResult` の `tool` が `null`       | `q5.selectedOption` が `null`                                |
| TC-03 | `buildInitialAnswers()`  | `SmartDefaultResult` 全フィールド `null`       | 全 `selectedOption: null` / `freeText: ""`                   |
| TC-04 | 初期表示（ページ 1）     | `smartDefaults` を渡してレンダリング           | Q1〜Q3 が表示され Q4〜Q6 は非表示                            |
| TC-05 | 進捗インジケーター       | ページ 1 表示時                                | 「質問1/6」「質問2/6」「質問3/6」が表示される                |
| TC-06 | プリフィル表示           | `smartDefaults.who = "自分だけ"` の場合        | Q1 の「自分のみ」chip が `aria-checked="true"`               |
| TC-07 | null プリフィル表示      | `smartDefaults.tool = null` の場合             | Q5 の全 chip が `aria-checked="false"`                       |
| TC-08 | ページ遷移（→ ページ 2） | ページ 1 の「次へ」ボタン押下                  | Q4〜Q6 が表示され Q1〜Q3 は非表示                            |
| TC-09 | 進捗インジケーター       | ページ 2 表示時                                | 「質問4/6」「質問5/6」「質問6/6」が表示される                |
| TC-10 | 完了コールバック         | ページ 2 の「完了」ボタン押下                  | `onComplete` が呼ばれ `ConversationAnswers` 型引数が渡される |
| TC-11 | 回答更新                 | Q1 の選択肢変更（「チームメンバー」を選択）    | `onComplete` の引数 `q1.selectedOption === "チームメンバー"` |
| TC-12 | 自由入力更新             | Q2 の `freeText` に入力                        | `onComplete` の引数 `q2.freeText` に入力値が含まれる         |
| TC-13 | 戻るコールバック         | ページ 1 の「戻る」ボタン押下（`onBack` あり） | `onBack` が呼ばれる                                          |
| TC-14 | 戻るボタン非表示         | `onBack` を渡さなかった場合                    | 「戻る」ボタンが表示されない                                 |

## buildInitialAnswers export 方針

`export function buildInitialAnswers(...)` として公開。private method キャスト不要でテスト可能。semantic default の正規化もこの関数で担う。
