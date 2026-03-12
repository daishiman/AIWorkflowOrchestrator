# Coverage Gaps

1. general chat の `conversationAPI` 統合後を前提にした E2E は未存在。
2. Electron 実 shell での Workspace -> ChatView -> reload の end-to-end は harness で代替している。
3. repo-wide coverage command はこのターンで再実行していない。

## 取り扱い

- 1 は `UT-IMP-CHAT-PLATFORM-TRANSPORT-UNIFICATION-001` で追う。
- 2 は既存 `UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001` の対象とする。
