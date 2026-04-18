# テスト仕様書

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 4                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## REG-SNAP-01: チャンネル登録スナップショット検証

| 項目      | 内容                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| テスト ID | REG-SNAP-01                                                                                    |
| 目的      | `registerRuntimeSkillCreatorHandlers()` が登録するチャンネル名一覧をスナップショットで固定する |
| 前提条件  | `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` で `ipcMain.handle` を捕捉している |
| 手順      | 1. spy をセットアップ / 2. 関数を呼び出す / 3. 登録チャンネル名配列をソートして抽出する        |
| 期待結果  | `expect(sortedHandles).toMatchSnapshot()` が 19 チャンネルのスナップショットと一致する         |
| 失敗条件  | チャンネルの追加・削除・名称変更でスナップショット差分が出力されテストが失敗する               |

## REG-DEDUP-01: 重複チャンネル登録検出

| 項目      | 内容                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| テスト ID | REG-DEDUP-01                                                                    |
| 目的      | 同一チャンネル名が複数回登録されていないことを検証する                          |
| 前提条件  | REG-SNAP-01 と同じ spy セットアップ                                             |
| 手順      | 1. spy をセットアップ / 2. 関数を呼び出す / 3. チャンネル名配列の重複を検査する |
| 期待結果  | `expect(new Set(handles).size).toBe(handles.length)` が成立する                 |
| 失敗条件  | 重複チャンネルが存在する場合、Set のサイズと配列長が不一致となりテスト失敗      |

## REG-COUNT-01: チャンネル総数検証

| 項目      | 内容                                           |
| --------- | ---------------------------------------------- |
| テスト ID | REG-COUNT-01                                   |
| 目的      | 登録チャンネル総数が 19 件であることを検証する |
| 期待結果  | `expect(handles).toHaveLength(19)` が成立する  |

## テストコード骨格

```typescript
// apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";

const { mockIpcMainHandle } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: vi.fn(),
  },
}));

describe("registerRuntimeSkillCreatorHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
    // より簡潔: mockIpcMainHandle.mockImplementation で直接キャプチャ
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する", async () => {
    const { registerRuntimeSkillCreatorHandlers } =
      await import("../creatorHandlers");
    const mockWindow = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() },
    } as unknown as BrowserWindow;
    registerRuntimeSkillCreatorHandlers(mockWindow);
    expect([...handles].sort()).toMatchSnapshot();
  });

  it("REG-DEDUP-01: 重複チャンネルが存在しない", async () => {
    const { registerRuntimeSkillCreatorHandlers } =
      await import("../creatorHandlers");
    const mockWindow = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() },
    } as unknown as BrowserWindow;
    registerRuntimeSkillCreatorHandlers(mockWindow);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it("REG-COUNT-01: 登録チャンネル総数が 19", async () => {
    const { registerRuntimeSkillCreatorHandlers } =
      await import("../creatorHandlers");
    const mockWindow = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() },
    } as unknown as BrowserWindow;
    registerRuntimeSkillCreatorHandlers(mockWindow);
    expect(handles).toHaveLength(19);
  });
});
```

**注記**: 実際の実装では `vi.resetModules()` を `beforeEach` に追加して dynamic import でモジュールキャッシュをリセットする。
