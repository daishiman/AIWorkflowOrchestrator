# Phase 4 Test Matrix

## 対象

- `RuntimeSkillCreatorFacade.execute()` の正規化結果
- `SkillExecutor.execute()` の raw SDK message 捕捉
- `SkillCreatorWorkflowEngine.recordExecuteResult()` の artifact 反映

## ケース一覧

| ID    | ケース                 | 入力                                                 | 期待値                                       |
| ----- | ---------------------- | ---------------------------------------------------- | -------------------------------------------- |
| P4-01 | init 正規化            | `type=system, subtype=init, session_id=...`          | `eventType=init` と `sessionId` を保持       |
| P4-02 | assistant 正規化       | `type=assistant, message.content[].text`             | `eventType=assistant` と text を保持         |
| P4-03 | result 正規化          | `type=result, subtype=success, stop_reason=end_turn` | `resultSubtype` / `stopReason` を保持        |
| P4-04 | permission denial 集約 | `permission_denials=[...]`                           | execute result の `permissionDenials` に集約 |
| P4-05 | source provenance 継承 | resource root あり                                   | 全正規化 event に `sourceProvenance` を付与  |
| P4-06 | SDK event 欠損         | `sdkMessages=[]`                                     | fallback error event を生成                  |
| P4-07 | execute 失敗           | executor error                                       | review 戻し + error event/summary を保持     |
| P4-08 | terminal handoff       | `decision.type=terminal_handoff`                     | 既存 handoff 契約を維持                      |
