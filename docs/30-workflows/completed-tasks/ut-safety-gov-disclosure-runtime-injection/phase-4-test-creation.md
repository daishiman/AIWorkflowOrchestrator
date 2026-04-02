# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                             |
| --------- | ---------------------------------------------- |
| Phase     | 4                                              |
| 機能名    | ut-safety-gov-disclosure-runtime-injection     |
| 作成日    | 2026-04-02                                     |
| タスクID  | UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 |
| Issue     | #1804                                          |
| 前提Phase | Phase 3 設計レビュー PASS 済み                 |

## 目的

`apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` を新規作成し、
Phase 1 で定義した受入基準（AC-1〜AC-7）を検証するテストケースを記述する。
本 Phase はテストファイルを「作成」するフェーズであり、実装（`ipc/index.ts` の変更）は行わない。

## 実行タスク

- **テストファイル新規作成**: `disclosureHandlers.test.ts` を新規作成
- **テストケース記述**: AC-1〜AC-7 に対応するテストケースを定義
- **Electron mock 設定**: `approvalHandlers.test.ts` と同様のパターンで Electron をモック
- **RED 確認**: テストが失敗（RED）することを確認（実装前のため当然）

## 実行手順

### 1. テスト対象の確認

```bash
# disclosureHandlers.ts の実装を確認
cat apps/desktop/src/main/ipc/disclosureHandlers.ts

# IPC チャンネル定数の確認
grep -n "DISCLOSURE\|disclosure" apps/desktop/src/preload/channels.ts

# 既存テストパターンの確認（参照用）
cat apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts
```

### 2. テストファイルの作成

以下の内容で `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` を新規作成する：

```typescript
/**
 * disclosureHandlers テスト
 *
 * UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 Phase 4
 * Issue #1804
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";

// Electron mock（approvalHandlers.test.ts と同様のパターン）
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
  },
}));

import { registerDisclosureHandlers } from "../disclosureHandlers";

describe("disclosureHandlers", () => {
  let mockMainWindow: BrowserWindow;
  let handler: (event: IpcMainInvokeEvent) => Promise<unknown>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockMainWindow = {
      webContents: { id: 1 },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;
  });

  describe("registerDisclosureHandlers", () => {
    describe("AC-1/AC-2: getDisclosureInfo から aiServiceName が正しく返される", () => {
      it("subscription モードのとき aiServiceName が 'Claude Code CLI' になる", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: true,
          data: {
            aiServiceName: "Claude Code CLI",
            modelName: "claude-sonnet-4-6",
            externalDestinations: [],
          },
        });
      });

      it("api-key モードのとき aiServiceName が 'Anthropic API' になる", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Anthropic API",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: true,
          data: {
            aiServiceName: "Anthropic API",
            modelName: "claude-sonnet-4-6",
            externalDestinations: [],
          },
        });
      });
    });

    describe("AC-3: fallback 値のテスト", () => {
      it("provider 未設定時（authMode が unknown 相当）のとき aiServiceName が 'unknown' になる", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "unknown",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toMatchObject({
          success: true,
          data: {
            aiServiceName: "unknown",
          },
        });
      });
    });

    describe("AC-4: DENY-5 準拠（API key / token 非含有）", () => {
      it("レスポンスに apiKey プロパティが含まれない", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = (await handler(event)) as Record<string, unknown>;

        // Assert
        const data = result?.data as Record<string, unknown> | undefined;
        expect(data).not.toHaveProperty("apiKey");
        expect(data).not.toHaveProperty("token");
        expect(data).not.toHaveProperty("secretKey");
      });
    });

    describe("AC-5: sender 検証（UNAUTHORIZED）", () => {
      it("送信元が mainWindow でない場合 UNAUTHORIZED を返す", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: { id: 999 }, // mainWindow.webContents とは異なる sender
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: expect.any(String),
          },
        });
      });
    });

    describe("AC-6: getDisclosureInfo 例外時 DISCLOSURE_ERROR", () => {
      it("getDisclosureInfo が例外を投げた場合 DISCLOSURE_ERROR を返す", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi
          .fn()
          .mockRejectedValue(new Error("Service unavailable"));

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: false,
          error: {
            code: "DISCLOSURE_ERROR",
            message: expect.any(String),
          },
        });
      });
    });
  });
});
```

### 3. テスト実行（RED 確認）

```bash
# テスト実行（実装前のため失敗することを確認）
pnpm --filter @repo/desktop test -- disclosureHandlers
```

**期待される状態**: テストファイルは存在するが、実装（`buildDisclosureInfo` の DI 接続）が未完了のため一部テストが失敗する（RED）。

### 4. RED 確認チェック

```bash
# テスト結果の確認
pnpm --filter @repo/desktop test -- disclosureHandlers 2>&1 | tail -30
```

失敗内容を記録し、Phase 5 の実装方針と照合する。

## 参照資料

| 資料名                          | パス                                                                                                  | 説明                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 2 設計                    | `phase-2-design.md`                                                                                   | テスト構造設計（C-2）         |
| Phase 3 設計レビュー            | `phase-3-design-review.md`                                                                            | テスタビリティチェック結果    |
| approvalHandlers テスト（参考） | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.test.ts`                                        | Electron mock パターンの参考  |
| disclosureHandlers 実装         | `apps/desktop/src/main/ipc/disclosureHandlers.ts`                                                     | テスト対象のハンドラー        |
| IPC チャンネル定数              | `apps/desktop/src/preload/channels.ts`                                                                | EXECUTION_GET_DISCLOSURE_INFO |
| unassigned-task 仕様書          | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md` | 起票元仕様書                  |

## 統合テスト連携【必須】

| 判定項目                         | 基準         | 結果     |
| -------------------------------- | ------------ | -------- |
| テストファイルが存在する         | ファイルあり | 作成済み |
| テストケース数（AC-1〜AC-7対応） | 6テスト以上  | 未計測   |
| テストが RED である（実装前）    | RED          | 確認要   |
| ユニットテストLine               | 80%+         | 未計測   |
| ユニットテストBranch             | 60%+         | 未計測   |
| ユニットテストFunction           | 80%+         | 未計測   |

## 成果物

| 成果物                | パス                                                             | 説明                           |
| --------------------- | ---------------------------------------------------------------- | ------------------------------ |
| テストファイル        | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 新規作成するテストファイル     |
| テスト実行結果（RED） | `outputs/phase-4/test-result-red.txt`                            | RED 確認の記録（実行後に保存） |

## 完了条件

- [ ] `disclosureHandlers.test.ts` が新規作成されている
- [ ] AC-1: subscription → "Claude Code CLI" のテストケースが存在する
- [ ] AC-2: api-key → "Anthropic API" のテストケースが存在する
- [ ] AC-3: fallback → "unknown" のテストケースが存在する
- [ ] AC-4: DENY-5（apiKey / token 非含有）のテストケースが存在する
- [ ] AC-5: sender 検証（UNAUTHORIZED）のテストケースが存在する
- [ ] AC-6: getDisclosureInfo 例外時 DISCLOSURE_ERROR のテストケースが存在する
- [ ] テスト実行を試みて RED になることを確認した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                      | 状態 | 備考                                                     |
| --------------------------- | ---- | -------------------------------------------------------- |
| テスト対象確認              | 未   | disclosureHandlers.ts / channels.ts を確認               |
| テストファイル新規作成      | 未   | disclosureHandlers.test.ts を作成                        |
| AC-1〜AC-6 テストケース記述 | 未   | 6 テストケースを定義                                     |
| Electron mock 設定          | 未   | vi.mock("electron", ...) パターン適用                    |
| テスト実行（RED 確認）      | 未   | `pnpm --filter @repo/desktop test -- disclosureHandlers` |

## 次のPhase

Phase 5: 実装 → [phase-5-implementation.md](phase-5-implementation.md)

**ゲート**: テストファイルが作成され RED 確認が完了後にのみ Phase 5 へ進む。
