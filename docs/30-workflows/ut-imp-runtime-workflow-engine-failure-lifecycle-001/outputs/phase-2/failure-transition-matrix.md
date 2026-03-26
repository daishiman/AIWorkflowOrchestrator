# Failure Transition Matrix

| ケース                  | 入力条件                           | owner                  | `currentPhase`             | `awaitingUserInput`                   | `verifyResult`                | artifact                  |
| ----------------------- | ---------------------------------- | ---------------------- | -------------------------- | ------------------------------------- | ----------------------------- | ------------------------- |
| execute reject          | executor promise reject            | facade で捕捉後 engine | `execute` failure snapshot | `null`                                | failure 要約を保存            | execute attempt を append |
| execute `success:false` | executor returns fail result       | engine                 | `execute` failure snapshot | `null`                                | fail payload を保存           | execute attempt を append |
| verify review           | verify result requires user review | engine                 | `review`                   | `reason="verification_review"` を保存 | verify failure summary を保存 | verify attempt を append  |
| invalid transition      | `plan -> verify` 等                | engine                 | 変更しない                 | 変更しない                            | 変更しない                    | append しない             |
