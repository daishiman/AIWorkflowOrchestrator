# Test Matrix

| テストID | 層     | 対象                    | 期待結果                                            |
| -------- | ------ | ----------------------- | --------------------------------------------------- |
| TC-04-01 | facade | execute reject          | failure snapshot が保存される                       |
| TC-04-02 | facade | execute `success:false` | `verify/pending` へ進まない                         |
| TC-04-03 | engine | verify review           | `awaitingUserInput.reason` が `verification_review` |
| TC-04-04 | engine | invalid transition      | reject または明示エラーを返す                       |
| TC-04-05 | engine | repeated failure        | artifact が append される                           |
