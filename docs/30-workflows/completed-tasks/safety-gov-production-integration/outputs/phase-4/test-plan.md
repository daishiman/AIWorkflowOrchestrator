# Phase 4: 統合テスト計画 (TDD Red)

## TASK-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001

### 概要

Safety Governance ハンドラ (approval, disclosure, advancedConsole) を production コードパス (`registerAllIpcHandlers`) に統合するための TDD Red テストを作成する。これらのテストは実装前に書かれ、意図的に失敗 (RED) 状態である。

---

## テストファイル一覧

### Test 1: `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`

**目的**: `registerAllIpcHandlers()` が 3 つの safety governance ハンドラを登録すること

| テストケース                                                             | 検証内容                                                                    | 状態             |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---------------- |
| registerApprovalHandlers が呼ばれること                                  | `vi.mock` で関数をモックし、`registerAllIpcHandlers` 実行後に呼び出しを検証 | GREEN (実装済み) |
| registerDisclosureHandlers が呼ばれること                                | 同上                                                                        | GREEN (実装済み) |
| registerAdvancedConsoleHandlers が呼ばれること                           | 同上                                                                        | GREEN (実装済み) |
| DefaultApprovalGate がインスタンス化されること                           | コンストラクタが呼ばれたことを検証                                          | GREEN (実装済み) |
| registerApprovalHandlers に正しい引数が渡されること                      | mainWindow と ApprovalGate インスタンスが渡されることを検証                 | GREEN (実装済み) |
| registerDisclosureHandlers に mainWindow を含む deps が渡されること      | deps.mainWindow の一致を検証                                                | GREEN (実装済み) |
| registerAdvancedConsoleHandlers に mainWindow を含む deps が渡されること | deps.mainWindow の一致を検証                                                | GREEN (実装済み) |
| 3 ハンドラが failures に含まれないこと                                   | result.failures に safety governance ハンドラ名が含まれないことを検証       | GREEN (実装済み) |

**Note**: `registerAllIpcHandlers` への 3 ハンドラの登録は既に実装済みのため全テスト GREEN。このテストは回帰テストとして機能する。

**Mock 戦略**: `registerAllIpcHandlers` の全依存関係を `vi.mock()` でスタブ化し、3 つの safety governance ハンドラ登録関数のみを検証対象にする。

---

### Test 2: `apps/desktop/src/preload/__tests__/index.execution.test.ts`

**目的**: `electronAPI.execution` 名前空間が 5 メソッドを正しいチャネルで公開すること

| テストケース                                           | 検証内容                                                         | 状態                     |
| ------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------ |
| IPC チャネル定義の存在確認 (5 チャネル)                | `IPC_CHANNELS` にチャネルが定義されていること                    | GREEN (既存)             |
| Whitelist 登録確認                                     | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` に含まれること | GREEN (既存)             |
| execution プロパティの存在確認                         | `electronAPI.execution` が定義されていること                     | RED                      |
| getDisclosureInfo が関数であること                     | `typeof` チェック                                                | RED                      |
| getTerminalLog が関数であること                        | 同上                                                             | RED                      |
| getCopyCommand が関数であること                        | 同上                                                             | RED                      |
| respondApproval が関数であること                       | 同上                                                             | RED                      |
| onApprovalRequest が関数であること                     | 同上                                                             | RED                      |
| safeInvoke が正しいチャネルで呼ばれること (4 メソッド) | `ipcRenderer.invoke` の引数を検証                                | GREEN (直接呼び出し検証) |
| safeOn が正しいチャネルで呼ばれること                  | `ipcRenderer.on` の引数を検証                                    | GREEN (直接呼び出し検証) |
| ExecutionAPI 型コンパイルテスト                        | 型定義の存在確認（プレースホルダー）                             | GREEN (プレースホルダー) |

**Note**: チャネル定義と whitelist は既に実装済みのため一部 GREEN。execution 名前空間の存在と型定義が RED。

---

### Test 3: `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts`

**目的**: Approval リクエストのプッシュ通知が正しく動作すること

| テストケース                                                | 検証内容                                 | 状態                 |
| ----------------------------------------------------------- | ---------------------------------------- | -------------------- |
| APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること      | whitelist 確認                           | GREEN (既存)         |
| APPROVAL_REQUEST チャネル値が正しいこと                     | 値の一致確認                             | GREEN (既存)         |
| webContents.send が APPROVAL_REQUEST チャネルで呼ばれること | send の引数検証                          | GREEN (直接呼び出し) |
| webContents.isDestroyed() が true の場合 send しないこと    | Guard チェックのシミュレーション         | GREEN (ロジック検証) |
| window.isDestroyed() が true の場合 send しないこと         | 同上                                     | GREEN (ロジック検証) |
| pushApprovalRequest 関数が export されること                | 動的 import でモジュールの export を検証 | RED                  |
| pushApprovalRequest が正しいペイロードで send を呼ぶこと    | 関数呼び出し後の send 引数検証           | RED                  |

---

### Test 4: `apps/desktop/src/main/ipc/__tests__/approvalGate.revokeAll.test.ts`

**目的**: セッション終了時に `revokeAll(sessionId)` が呼ばれトークンが無効化されること

| テストケース                                                    | 検証内容                                              | 状態                 |
| --------------------------------------------------------------- | ----------------------------------------------------- | -------------------- |
| revokeAll で該当セッションの全 token が無効化されること         | checkApproval が false を返すことを検証               | GREEN (既存実装)     |
| revokeAll が他セッションの token に影響しないこと               | 別セッションの checkApproval が true であることを検証 | GREEN (既存実装)     |
| 存在しない sessionId で revokeAll がエラーにならないこと        | 例外が投げられないことを検証                          | GREEN (既存実装)     |
| revokeAll 後に同じ sessionId で新しい approval を付与できること | grantApproval + checkApproval の検証                  | GREEN (既存実装)     |
| セッション完了 (done) 時に revokeAll が呼ばれること             | mock の呼び出し検証                                   | GREEN (直接呼び出し) |
| セッション中断 (aborted) 時に revokeAll が呼ばれること          | 同上                                                  | GREEN (直接呼び出し) |
| revokeAll と grantApproval の独立性                             | grantApproval が呼ばれていないことを検証              | GREEN                |
| production パスでの自動 revokeAll 統合                          | セッション終了コールバック接続の検証                  | RED                  |

---

## テスト結果サマリー

### 実行結果（2026-03-31 時点）

| テストファイル                 | passed | failed | 合計   |
| ------------------------------ | ------ | ------ | ------ |
| index.integration.test.ts      | 8      | 0      | 8      |
| index.execution.test.ts        | 16     | 6      | 22     |
| approvalHandlers.push.test.ts  | 5      | 2      | 7      |
| approvalGate.revokeAll.test.ts | 7      | 1      | 8      |
| **合計**                       | **36** | **9**  | **45** |

### RED テスト（Phase 5 以降で GREEN にする）

1. **index.integration.test.ts**: 全 8 テスト GREEN (`registerAllIpcHandlers` への登録が既に実装済み -- 回帰テストとして機能)
2. **index.execution.test.ts**: execution 名前空間の存在確認 6 テスト RED (`electronAPI.execution` が未定義、`ExecutionAPI` 型が未定義)
3. **approvalHandlers.push.test.ts**: `pushApprovalRequest` 関連 2 テスト RED (関数が未 export)
4. **approvalGate.revokeAll.test.ts**: production パス自動 revokeAll 統合 1 テスト RED (コールバック未接続)

---

## Phase 5 での実装ガイド

Phase 5 では以下の変更を行い、全 RED テストを GREEN にする:

1. ~~**`main/ipc/index.ts`**: `registerAllIpcHandlers` に 3 ハンドラ登録を追加~~ -- **完了済み**

2. **`preload/types.ts`**: `ExecutionAPI` 型を追加し、`ElectronAPI` に `execution` プロパティを追加

3. **`preload/index.ts`**: `electronAPI` オブジェクトに `execution` 名前空間を追加
   - `getDisclosureInfo` -> `safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO)`
   - `getTerminalLog(sessionId)` -> `safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId)`
   - `getCopyCommand(sessionId)` -> `safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId)`
   - `respondApproval(request)` -> `safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request)`
   - `onApprovalRequest(callback)` -> `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)`

4. **`main/ipc/approvalHandlers.ts`**: `pushApprovalRequest(mainWindow, payload)` 関数を export
   - `mainWindow.webContents.isDestroyed()` チェック付き
   - `mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload)`

5. **セッションライフサイクル接続**: セッション終了時に `approvalGate.revokeAll(sessionId)` を呼ぶコールバックを接続
