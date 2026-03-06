# Phase 11 手動テスト計画

## 目的

- 上流正本、downstream 参照先、aiworkflow 更新先、current workflow 成果物の実在を確認する。
- `review-gate.md` と `spec-sync-targets.md` に必要な文言が存在することを目視確認する。
- current branch 上の representative UI surfaces を再撮影し、Apple UI/UX 観点で integration smoke を残す。

## テストケース

| TC-ID    | 観点                  | 手順                                                       | 期待結果                                    |
| -------- | --------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| TC-11-01 | Dashboard / AppDock   | `/` を表示し、desktop AppDock と notification badge を確認 | 導線階層が一目で把握できる                  |
| TC-11-02 | NotificationCenter    | bell から popover を開き、未読表示と detail 展開を確認     | 情報の主従と操作が明確                      |
| TC-11-03 | HistorySearch desktop | `History` 導線から履歴検索画面へ遷移する                   | stats / search / results が同時に視認できる |
| TC-11-04 | Chat history route    | `/chat/history` の空状態を確認する                         | 誤操作を誘発しない空状態である              |
| TC-11-05 | Version history route | `/history/file-123` の一覧画面を確認する                   | 履歴一覧と詳細領域が分離される              |
| TC-11-06 | HistorySearch mobile  | mobile viewport で `History` を表示する                    | bottom navigation と結果一覧が過密でない    |

## 補助確認（非視覚）

| ID       | 観点           | コマンド                                                                                                             | 期待結果         |
| -------- | -------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- |
| NV-11-01 | 上流正本       | `test -f` で A/B/C/D と downstream 3件、`task-workflow.md`、`lessons-learned.md` を確認                              | すべて PASS      |
| NV-11-02 | current 成果物 | `test -f` で `review-gate.md`、`spec-sync-targets.md`、`dependency-handoff-plan.md`、`final-review-result.md` を確認 | すべて PASS      |
| NV-11-03 | 内容存在       | `rg -n` で 5軸、3区分、current workflow path を確認                                                                  | すべて検出される |
