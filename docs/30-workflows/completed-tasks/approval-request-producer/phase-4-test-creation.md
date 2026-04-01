# Phase 4: テスト作成（RED フェーズ）

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 4                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

TDD の RED フェーズとして、`HooksFactory.createPreToolUseHook()` 内の `pushApprovalRequest` 呼び出しに対するユニットテストを先に書く。実装前に失敗状態（RED）のテストを確認し、Phase 5 実装後に GREEN に変わることを目標とする。

---

## 事前確認タスク

### Step 0: 既存テストの PASS 状態確認

新規テストケース追加前に既存テストが PASS していることを確認する。

```bash
# HooksFactory 既存テストの PASS 確認
pnpm --filter @repo/desktop test -- HooksFactory.test.ts

# approvalHandlers.push 既存テストの PASS 確認
pnpm --filter @repo/desktop test -- approvalHandlers.push.test.ts

# registerAllIpcHandlers 統合テストの PASS 確認
pnpm --filter @repo/desktop test -- index.integration.test.ts
```

### Step 1: HooksFactory コンストラクタのスタブ確認

`apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts` の `beforeEach` を確認する。

```typescript
// 現在のコンストラクタ呼び出し（HooksFactory.test.ts 行 23-28）
hooksFactory = new HooksFactory(
  mockWindow,
  "test-execution-id",
  permissionResolver,
  // approvalGate と sessionId が渡されていない → 第4・第5引数の追加が必要
);
```

**確認事項**: Phase 3 残課題より、`HooksFactory.test.ts` のコンストラクタ呼び出しに `approvalGate` と `sessionId` のスタブが渡されていることを確認する。渡されていない場合は第4・第5引数にスタブを追加する（既存テストが引き続き PASS するように対処）。

---

## 作成するテストファイル

| ファイルパス                                                                   | 種別 | 内容                                      |
| ------------------------------------------------------------------------------ | ---- | ----------------------------------------- |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | 新規 | HooksFactory producer 単体テスト (7 件)   |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`          | 更新 | 新コンストラクタ引数の追従                |
| `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`         | 更新 | 新コンストラクタ引数の追従                |
| `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts`      | 更新 | `approvalGate` 引数の追従                 |
| `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`           | 更新 | `approvalGate` 注入の追従                 |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                    | 更新 | `approvalGate` 注入の追従                 |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`            | 更新 | `approvalGate` 注入の追従                 |
| `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`                | 既存 | `DefaultApprovalGate` 共有の回帰確認      |
| `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts`            | 既存 | 既存 helper / channel coverage を継続利用 |

---

## テストケース一覧

### ファイル: `HooksFactory.producer.test.ts`

| No. | テスト名                                                             | 対応 AC | RED 理由（Phase 4）                               |
| --- | -------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| 1   | 危険コマンド検出時に pushApprovalRequest が呼ばれること              | AC-1    | TODO(human) のため呼ばれない                      |
| 2   | pushApprovalRequest に正しい sessionId が渡されること                | AC-2    | 同上                                              |
| 3   | pushApprovalRequest に uuidv4() の operationId が渡されること        | AC-3    | 同上                                              |
| 4   | operationType が "dangerous_bash_command" であること                 | AC-2    | 同上                                              |
| 5   | 安全なコマンドでは pushApprovalRequest が呼ばれないこと              | AC-1    | 既存挙動（PASS 確認用）                           |
| 6   | mainWindow 破棄済み時にエラーが発生しないこと                        | FR-05   | TODO(human) のため pushApprovalRequest 未呼び出し |
| 7   | 複数パターン検出時に最初のパターンのみで発火すること（二重送信なし） | FR-07   | 同上                                              |

## テストコード骨格

### `HooksFactory.producer.test.ts`

```typescript
/**
 * HooksFactory Producer テスト
 *
 * approval-request-producer Phase 4: TDD RED フェーズ
 *
 * createPreToolUseHook() が危険コマンド検出時に
 * pushApprovalRequest を呼ぶことを検証する。
 * Phase 5 実装後に GREEN に変わる。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HooksFactory, PermissionResolver } from "../HooksFactory";
import type { BrowserWindow } from "electron";

// pushApprovalRequest をモック化
vi.mock("../../../ipc/approvalHandlers", () => ({
  pushApprovalRequest: vi.fn(),
}));

// IApprovalGate スタブ
const mockApprovalGate = {
  grantApproval: vi.fn(),
  rejectApproval: vi.fn(),
  checkApproval: vi.fn(),
  revokeAll: vi.fn(),
};

describe("HooksFactory - approval-request-producer", () => {
  let mockWindow: BrowserWindow;
  let permissionResolver: PermissionResolver;
  let hooksFactory: HooksFactory;
  let pushApprovalRequestMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetAllMocks();

    mockWindow = {
      webContents: {
        send: vi.fn(),
        isDestroyed: vi.fn().mockReturnValue(false),
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    permissionResolver = new PermissionResolver();
    hooksFactory = new HooksFactory(
      mockWindow,
      "test-execution-id",
      permissionResolver,
      mockApprovalGate,
      "test-session-id",
    );

    // モックへの参照を取得
    const mod = await import("../../../ipc/approvalHandlers");
    pushApprovalRequestMock = vi.mocked(mod.pushApprovalRequest);
  });

  describe("createPreToolUseHook - pushApprovalRequest 呼び出し", () => {
    it("危険コマンド検出時に pushApprovalRequest が呼ばれること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "rm -rf /important" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequestMock).toHaveBeenCalledTimes(1);
    });

    it("pushApprovalRequest に正しい sessionId が渡されること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo rm -rf /" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequestMock).toHaveBeenCalledWith(
        mockWindow,
        expect.objectContaining({
          sessionId: "test-session-id",
        }),
      );
    });

    it("pushApprovalRequest に uuidv4() の operationId が渡されること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "rm -rf /tmp" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );

      const calledPayload = pushApprovalRequestMock.mock.calls[0][1];
      // UUID v4 形式の確認
      expect(calledPayload.operationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("operationType が 'dangerous_bash_command' であること", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo apt-get install vim" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequestMock).toHaveBeenCalledWith(
        mockWindow,
        expect.objectContaining({
          operationType: "dangerous_bash_command",
        }),
      );
    });

    it("安全なコマンドでは pushApprovalRequest が呼ばれないこと", async () => {
      const hooks = hooksFactory.createHooks();

      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "ls -la" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );

      expect(pushApprovalRequestMock).not.toHaveBeenCalled();
    });

    it("mainWindow 破棄済み時にエラーが発生しないこと", async () => {
      const destroyedWindow = {
        webContents: {
          send: vi.fn(),
          isDestroyed: vi.fn().mockReturnValue(true),
        },
        isDestroyed: vi.fn().mockReturnValue(true),
      } as unknown as BrowserWindow;

      const factory = new HooksFactory(
        destroyedWindow,
        "test-execution-id",
        permissionResolver,
        mockApprovalGate,
        "test-session-id",
      );
      const hooks = factory.createHooks();

      // エラーが発生しないことを確認
      await expect(
        hooks.PreToolUse!(
          { toolName: "Bash", args: { command: "rm -rf /tmp" } },
          "tool-use-id",
          { signal: new AbortController().signal },
        ),
      ).resolves.not.toThrow();
    });

    it("複数パターン検出時に最初のパターンのみで pushApprovalRequest が発火すること", async () => {
      const hooks = hooksFactory.createHooks();

      // "rm -rf" と "sudo" の両パターンを含むコマンド
      await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo rm -rf /important" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );

      // 最初にマッチしたパターンのみ発火（1回のみ呼ばれる）
      expect(pushApprovalRequestMock).toHaveBeenCalledTimes(1);
    });
  });
});
```

## RED 確認手順

```bash
# 新規テストファイルを実行して RED 状態を確認する
pnpm --filter @repo/desktop test -- HooksFactory.producer.test.ts

# 期待される結果（Phase 5 実装前）:
#   - テスト 1, 2, 3, 4, 6, 7: FAIL（pushApprovalRequest が呼ばれない）
#   - テスト 5: PASS（安全コマンドでは呼ばれないことは既存挙動で正しい）
```

---

## 完了条件

- [ ] `HooksFactory.producer.test.ts` が新規作成されている
- [ ] 7 件のテストケースが記述されている
- [ ] 既存テスト（`HooksFactory.test.ts`, `AgentExecutor.test.ts`, `ExecutionManager.test.ts`, `integration.test.ts`, `agentHandlers.test.ts`, `agentHandlers.runtime.test.ts`, `index.integration.test.ts`, `approvalHandlers.push.test.ts`）が引き続き PASS すること
- [ ] 新規テスト 1, 2, 3, 4, 6, 7 が RED 状態（失敗）であることが確認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 参照資料

| 資料名                        | パス                                                                      | 説明                             |
| ----------------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| phase-1-requirements.md       | `./phase-1-requirements.md`                                               | FR / NFR / 受入基準              |
| phase-2-design.md             | `./phase-2-design.md`                                                     | 接続ポイント・型設計             |
| phase-3-design-review.md      | `./phase-3-design-review.md`                                              | 設計レビュー PASS・残課題        |
| HooksFactory.ts               | `apps/desktop/src/main/services/agent/HooksFactory.ts`                    | 実装対象（TODO(human) 設置済み） |
| HooksFactory.test.ts          | `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`     | 既存テスト（PASS 維持が必要）    |
| AgentExecutor.test.ts         | `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`    | 既存テスト（PASS 維持が必要）    |
| ExecutionManager.test.ts      | `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts` | 既存テスト（PASS 維持が必要）    |
| integration.test.ts           | `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`      | 既存テスト（PASS 維持が必要）    |
| agentHandlers.test.ts         | `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`               | 既存テスト（PASS 維持が必要）    |
| agentHandlers.runtime.test.ts | `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`       | 既存テスト（PASS 維持が必要）    |
| index.integration.test.ts     | `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`           | 既存テスト（PASS 維持が必要）    |

---

## 成果物

| 成果物         | パス                                                                           | 説明       |
| -------------- | ------------------------------------------------------------------------------ | ---------- |
| テスト仕様書   | `phase-4-test-creation.md`                                                     | 本ファイル |
| テストファイル | `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | 新規作成   |
| 既存テスト     | `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`          | 引数追従   |
| 既存テスト     | `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`         | 引数追従   |
| 既存テスト     | `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`           | 引数追従   |

---

## 次の Phase

Phase 5: 実装 → [phase-5-implementation.md](phase-5-implementation.md)

## 実行タスク

- producer 単体テストの期待値を確定する
- regression-only テストの範囲を切り分ける
- dangerous command ブロックの観点を固定する

## 統合テスト連携

- Phase 5 実装後に producer 単体テストと regression テストを再実行する
- Phase 6 以降の拡張テストで同じ current contract を再利用する
