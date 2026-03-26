# Failure Lifecycle Contract Table

| 経路                    | 開始 phase | 終了 snapshot                    | `awaitingUserInput`              | `verifyResult`                | artifact                |
| ----------------------- | ---------- | -------------------------------- | -------------------------------- | ----------------------------- | ----------------------- |
| execute reject          | `execute`  | `execute_failed`                 | `null`                           | error summary を保持          | failure artifact を保存 |
| execute `success:false` | `execute`  | `execute_failed` または `review` | 必要時のみ review prompt         | result summary を保持         | result artifact を保存  |
| verification review     | `verify`   | `review`                         | `reason = "verification_review"` | verify failure summary を保持 | verify artifact を保存  |
| invalid transition      | 任意       | state 不変                       | 既存値維持                       | 既存値維持                    | 追加なし                |
