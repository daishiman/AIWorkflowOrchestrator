# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 4                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

production 統合の統合テストを TDD Red フェーズとして作成する。
handler 登録確認・Preload API 公開確認・Push 通知・revokeAll() の各シナリオをカバーする。

## 実行タスク

- Phase 1 の命名規則と既存テスト構成を照合し、追加テスト名と配置先を先に固定する
- handler 登録、preload 公開、push 通知、revokeAll の4観点で Red テストを作成する
- mock 境界を Main / Preload / Renderer ごとに分離し、チャンネル名と payload 形式を固定する
- Phase 5 実装前に失敗理由が未実装由来であることを確認する

### 0. 命名規則の確認（TDD Red 前に実施）

Phase 1-3 で確認した命名規則との整合を確認する:

```bash
# 既存テストファイルの命名パターン確認
ls apps/desktop/src/main/ipc/__tests__/
ls apps/desktop/src/preload/__tests__/

# 既存テストの import パターン確認
head -20 apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts 2>/dev/null || \
  find apps/desktop/src -name "*.test.ts" | head -3 | xargs head -5
```

### 1. IPC Handler 登録テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`

```typescript
// テスト対象: registerAllIpcHandlers が3ハンドラを登録するか
describe("registerAllIpcHandlers - safety governance handlers", () => {
  it("should register registerApprovalHandlers", () => {
    // mock BrowserWindow
    // mock DefaultApprovalGate
    // registerAllIpcHandlers を呼び出し
    // ipcMain.handle が APPROVAL_RESPOND チャンネルで登録されているか確認
  });

  it("should register registerDisclosureHandlers", () => {
    // EXECUTION_GET_DISCLOSURE_INFO チャンネルが登録されているか確認
  });

  it("should register registerAdvancedConsoleHandlers", () => {
    // EXECUTION_GET_TERMINAL_LOG, EXECUTION_GET_COPY_COMMAND が登録されているか確認
  });

  it("should inject DefaultApprovalGate into registerApprovalHandlers", () => {
    // approvalGate が null/undefined でないこと
    // registerApprovalHandlers の第2引数に approvalGate が渡されているか確認
  });
});
```

### 2. Preload execution API テスト

**ファイル**: `apps/desktop/src/preload/__tests__/index.execution.test.ts`

```typescript
describe("electronAPI.execution", () => {
  it("should expose getDisclosureInfo via safeInvoke", () => {
    // safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO) が呼ばれること
  });

  it("should expose getTerminalLog via safeInvoke", () => {
    // safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId) が呼ばれること
  });

  it("should expose getCopyCommand via safeInvoke", () => {
    // safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId) が呼ばれること
  });

  it("should expose respondApproval via safeInvoke", () => {
    // safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request) が呼ばれること
  });

  it("should expose onApprovalRequest via safeOn", () => {
    // safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback) が呼ばれること
    // unsubscribe 関数が返ること
  });
});
```

### 3. Push 通知テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts`

```typescript
describe("approval:request push notification", () => {
  it("should send approval:request to renderer when triggered", () => {
    // mock BrowserWindow.webContents.send
    // approval request を発生させる
    // webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload) が呼ばれること
  });

  it("should not send if webContents is destroyed", () => {
    // webContents.isDestroyed() が true の場合に send が呼ばれないこと
  });
});
```

### 4. revokeAll() セッション終了テスト

**ファイル**: 既存のセッション管理テストに追加 or 新規作成

```typescript
describe("ApprovalGate revokeAll on session end", () => {
  it("should call revokeAll when session transitions to done", () => {
    // mock approvalGate
    // セッション done 遷移を発生させる
    // approvalGate.revokeAll(sessionId) が呼ばれること
  });

  it("should call revokeAll when session transitions to aborted", () => {
    // セッション aborted 遷移を発生させる
    // approvalGate.revokeAll(sessionId) が呼ばれること
  });
});
```

### 5. TDD Red 確認

テスト作成後、実装前に全テストが fail することを確認する:

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose \
  apps/desktop/src/main/ipc/__tests__/index.integration.test.ts \
  apps/desktop/src/preload/__tests__/index.execution.test.ts
```

期待結果: 新規テストが fail（既存85テストは pass を維持）

## 参照資料

| 参照資料                     | パス                                   |
| ---------------------------- | -------------------------------------- |
| 既存 approvalHandlers テスト | `apps/desktop/src/main/ipc/__tests__/` |
| Phase 2 設計書               | `outputs/phase-2/design.md`            |
| Phase 3 ゲート判定           | `outputs/phase-3/gate-decision.md`     |

## 統合テスト連携【必須】

| 判定項目               | 基準              | 結果（実行時に記録） |
| ---------------------- | ----------------- | -------------------- |
| 新規テストが Red       | 全新規テスト fail | -                    |
| 既存 85 テストが Green | 全 pass           | -                    |

## 成果物

| 成果物     | パス                           | 説明                     |
| ---------- | ------------------------------ | ------------------------ |
| テスト計画 | `outputs/phase-4/test-plan.md` | テストシナリオ一覧と結果 |

## 完了条件

- [ ] IPC handler 登録テストが作成されている（4テスト以上）
- [ ] Preload execution API テストが作成されている（5テスト以上）
- [ ] Push 通知テストが作成されている（2テスト以上）
- [ ] revokeAll() テストが作成されている（2テスト以上）
- [ ] 新規テストが TDD Red（fail）であることを確認した
- [ ] 既存 85 テストが引き続き pass であることを確認した
- [ ] `outputs/phase-4/test-plan.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
