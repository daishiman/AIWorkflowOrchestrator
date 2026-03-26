# Manual Test Checklist

| ID       | 確認項目                    | 手順                                                                                                       | 結果 |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- | ---- |
| MT-11-01 | executor reject             | facade test の reject case で snapshot の `currentPhase` / `verifyResult` / `awaitingUserInput` を確認する | PASS |
| MT-11-02 | `success:false` review 戻し | engine / facade 両方の failure case で `review` へ戻ることを確認する                                       | PASS |
| MT-11-03 | verify review prompt        | verify fail review case で `reason=verification_review` を確認する                                         | PASS |
