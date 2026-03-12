# Design Review Findings

| ID    | 重要度 | finding                                                                                   | 対応                                         |
| ----- | ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| DR-01 | 中     | general chat はまだ `conversationAPI` 非接続で、transport 一本化は未完了                  | follow-up 未タスク化                         |
| DR-02 | 低     | Phase 11 harness は renderer mock 前提で、実 Electron navigation を置き換えるものではない | manual-test 結果に明記                       |
| DR-03 | 低     | shared title truncation は helper 依存のため、固定長テストは brittle になりやすい         | shared test を prefix + maxLength 判定へ変更 |
