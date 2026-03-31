# Phase 6-7: Test Coverage Report

**Task**: UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001
**Date**: 2026-03-31
**Phase 6**: Fail-path / Edge case tests
**Phase 7**: Coverage check

## Summary

| Metric              | Phase 4 (Before) | Phase 6-7 (After) |
| ------------------- | ---------------: | ----------------: |
| Total tests         |               45 |                72 |
| New edge case tests |                - |                27 |
| Test files          |                4 |     4 (unchanged) |
| All passing         |              Yes |               Yes |

## Coverage Report (v8)

| File                                    |   Stmts | Branch | Funcs | Lines |
| --------------------------------------- | ------: | -----: | ----: | ----: |
| `main/services/runtime/ApprovalGate.ts` |   85.7% |  86.7% | 85.7% | 85.7% |
| `preload/ipc-utils.ts`                  |    100% |   100% |  100% |  100% |
| `preload/channels.ts`                   |    100% |   100% |     - |  100% |
| `main/ipc/approvalHandlers.ts`          | 14.1%\* |   100% |   50% | 14.1% |

\*Note: `approvalHandlers.ts` のステートメントカバレッジが低いのは、`registerApprovalHandlers` が統合テストではモック化されているため。`pushApprovalRequest` 関数は直接テスト済み。`registerApprovalHandlers` のバリデーションロジックは IPC ハンドラ内部で closure として定義されており、ipcMain.handle の mock に隠れている。

## Test Case List

### 1. `index.integration.test.ts` (11 tests)

#### Phase 4: registerAllIpcHandlers 統合テスト (8 tests)

1. registerApprovalHandlers が呼ばれること
2. registerDisclosureHandlers が呼ばれること
3. registerAdvancedConsoleHandlers が呼ばれること
4. DefaultApprovalGate がインスタンス化されること
5. registerApprovalHandlers に mainWindow と ApprovalGate インスタンスが渡されること
6. registerDisclosureHandlers に mainWindow を含む deps が渡されること
7. registerAdvancedConsoleHandlers に mainWindow を含む deps が渡されること
8. 3 つの safety governance ハンドラの登録が result.successCount に含まれること

#### Phase 6: エッジケーステスト (3 tests) [NEW]

9. registerAllIpcHandlers を複数回呼んでも安全であること（二重登録なし）
10. DefaultApprovalGate が毎回新しいインスタンスで生成されること
11. registerApprovalHandlers に渡される approvalGate が IApprovalGate を満たすこと

### 2. `index.execution.test.ts` (32 tests)

#### Phase 4: IPC Channel 定義の存在確認 (5 tests)

1. APPROVAL_RESPOND チャネルが定義されていること
2. APPROVAL_REQUEST チャネルが定義されていること
3. EXECUTION_GET_DISCLOSURE_INFO チャネルが定義されていること
4. EXECUTION_GET_TERMINAL_LOG チャネルが定義されていること
5. EXECUTION_GET_COPY_COMMAND チャネルが定義されていること

#### Phase 4: Whitelist 登録確認 (5 tests)

6. APPROVAL_RESPOND が ALLOWED_INVOKE_CHANNELS に含まれること
7. EXECUTION_GET_DISCLOSURE_INFO が ALLOWED_INVOKE_CHANNELS に含まれること
8. EXECUTION_GET_TERMINAL_LOG が ALLOWED_INVOKE_CHANNELS に含まれること
9. EXECUTION_GET_COPY_COMMAND が ALLOWED_INVOKE_CHANNELS に含まれること
10. APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること

#### Phase 4: ExecutionAPI 型と execution 名前空間の存在確認 (6 tests)

11. electronAPI に execution プロパティが存在すること
12. execution.getDisclosureInfo が関数であること
13. execution.getTerminalLog が関数であること
14. execution.getCopyCommand が関数であること
15. execution.respondApproval が関数であること
16. execution.onApprovalRequest が関数であること

#### Phase 4: safeInvoke / safeOn 呼び出し確認 (5 tests)

17. getDisclosureInfo が EXECUTION_GET_DISCLOSURE_INFO チャネルで invoke すること
18. getTerminalLog が EXECUTION_GET_TERMINAL_LOG チャネルで invoke すること
19. getCopyCommand が EXECUTION_GET_COPY_COMMAND チャネルで invoke すること
20. respondApproval が APPROVAL_RESPOND チャネルで invoke すること
21. onApprovalRequest が APPROVAL_REQUEST チャネルで on リスナーを登録すること

#### Phase 4: ExecutionAPI 型定義 (1 test)

22. ExecutionAPI 型のメソッドシグネチャが正しいこと（型コンパイルテスト）

#### Phase 6: invokeWithTimeout タイムアウトハンドリング (2 tests) [NEW]

23. invokeWithTimeout がタイムアウト時にエラーメッセージを含む Error を reject すること
24. invokeWithTimeout のタイムアウトメッセージにチャネル名が含まれること

#### Phase 6: 不正チャネル拒否 (3 tests) [NEW]

25. ALLOWED_INVOKE_CHANNELS に含まれないチャネルで invoke すると reject されること
26. 空文字チャネルで invoke すると reject されること
27. ALLOWED_ON_CHANNELS に含まれないチャネルで safeOn を呼ぶとエラーログが出て no-op クリーンアップ関数が返ること

#### Phase 6: ipcRenderer エラー伝播 (3 tests) [NEW]

28. ipcRenderer.invoke がエラーを返した場合に invokeWithTimeout が reject すること
29. ipcRenderer.invoke が null を返しても正常に解決すること
30. ipcRenderer.invoke が undefined を返しても正常に解決すること

#### Phase 6: onApprovalRequest リスナー管理 (2 tests) [NEW]

31. on で登録したリスナーの cleanup 関数で removeListener が呼ばれること
32. 複数リスナーを登録して個別にクリーンアップできること

### 3. `approvalHandlers.push.test.ts` (13 tests)

#### Phase 4: APPROVAL_REQUEST プッシュ通知チャネル (2 tests)

1. APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること
2. APPROVAL_REQUEST チャネル値が 'approval:request' であること

#### Phase 4: mainWindow.webContents.send による通知 (3 tests)

3. APPROVAL_REQUEST チャネルで webContents.send が呼ばれること
4. webContents.isDestroyed() が true の場合は send しないこと
5. window.isDestroyed() が true の場合も send しないこと

#### Phase 4: pushApprovalRequest ヘルパー関数 (2 tests)

6. pushApprovalRequest 関数がモジュールから export されること
7. pushApprovalRequest が正しいペイロードで send を呼ぶこと

#### Phase 6: pushApprovalRequest エッジケース (6 tests) [NEW]

8. 空の description フィールドでも send が呼ばれること
9. 空の sessionId/operationId フィールドでも send が呼ばれること（バリデーションは Renderer 側）
10. optional な destination フィールドが含まれるペイロードで正しく send されること
11. 複数回の急速な呼び出しで各呼び出しが独立して送信されること（二重送信なし）
12. window が操作途中で破棄された場合に send されないこと
13. webContents が操作途中で破棄された場合に send されないこと

### 4. `approvalGate.revokeAll.test.ts` (16 tests)

_Note: Phase 4 originally had 8 tests but the file structure counts differently in the verbose output. Total was correctly 8 tests in Phase 4._

#### Phase 4: 基本動作 (4 tests)

1. revokeAll(sessionId) で該当セッションの全 token が無効化されること
2. revokeAll(sessionId) が他のセッションの token に影響しないこと
3. 存在しない sessionId で revokeAll を呼んでもエラーにならないこと
4. revokeAll 後に同じ sessionId で新しい approval を付与できること

#### Phase 4: Session Lifecycle Integration (4 tests)

5. セッション完了（done）時に revokeAll(sessionId) が呼ばれること
6. セッション中断（aborted）時に revokeAll(sessionId) が呼ばれること
7. revokeAll の呼び出しで grantApproval が影響を受けないこと（独立性）
8. registerAllIpcHandlers で生成された ApprovalGate の revokeAll がセッション終了コールバックに接続されること

#### Phase 6: 冪等性（同一セッションへの複数回 revokeAll） (2 tests) [NEW]

9. 同じ sessionId に対して revokeAll を2回呼んでもエラーにならないこと
10. revokeAll を3回連続で呼んでも一貫した状態が保たれること

#### Phase 6: アクティブ approval チェック中の revokeAll（レース条件安全性） (3 tests) [NEW]

11. grantApproval 直後に revokeAll を呼ぶと token が無効化されること
12. checkApproval で使用済みにした後 revokeAll を呼んでもエラーにならないこと
13. 複数操作が存在するセッションで一部使用済み・一部未使用の状態で revokeAll が全てクリアすること

#### Phase 6: 並行セッションのクリーンアップ (3 tests) [NEW]

14. 複数セッションを個別に revokeAll できること
15. 同一 operationId を持つ異なるセッションで revokeAll が正しく分離されること
16. 大量のセッション（10件）を一括クリーンアップできること

## Edge Cases Covered (Phase 6)

### approvalHandlers.ts

- Empty payload fields (description, sessionId, operationId)
- Optional destination field passthrough
- Multiple rapid calls (no double-send, each call independent)
- Window destroyed mid-operation (isDestroyed guard)
- webContents destroyed mid-operation (isDestroyed guard)

### ApprovalGate.revokeAll

- Idempotent revokeAll (same session, multiple times)
- revokeAll immediately after grantApproval (race condition)
- revokeAll after checkApproval used token (used + revoke)
- Mixed used/unused tokens in same session
- Concurrent sessions with independent cleanup
- Same operationId across different sessions (isolation)
- Bulk cleanup (10 sessions)

### Preload execution namespace

- invokeWithTimeout timeout handling (fake timers)
- Timeout error message contains channel name
- Invalid channel rejection (security)
- Empty string channel rejection
- safeOn invalid channel returns no-op cleanup
- ipcRenderer error propagation
- null/undefined response handling
- Listener registration and individual cleanup

### registerAllIpcHandlers integration

- Multiple invocations safety (double registration)
- New ApprovalGate instance per invocation
- IApprovalGate interface compliance verification

## Test Execution

```
Test Files  4 passed (4)
     Tests  72 passed (72)
  Duration  ~7s
```

## Conclusion

Phase 6 で27件のエッジケーステストを追加し、safety governance の fail-path と boundary condition を網羅した。Phase 7 のカバレッジチェックでは、テスト対象のコアモジュール（`ApprovalGate.ts`: 85.7%, `ipc-utils.ts`: 100%, `channels.ts`: 100%）が十分なカバレッジに達していることを確認した。
