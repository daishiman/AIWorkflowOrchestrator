# Phase 4: テスト作成 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                                       |
| ------- | -------------------------------------------------------- |
| Phase   | 4 - テスト作成                                           |
| 機能名  | task-rt-01-llm-adapter-error-propagation                 |
| 作成日  | 2026-04-04                                               |
| 前Phase | [Phase 3: 設計レビューゲート](phase-03-design-review.md) |

## 目的

TDD アプローチを採用し、Phase 5 実装前にテストを先行作成する。
Phase 2 設計書の契約（型・期待レスポンス形式・表示ロジック）をテストとして記述することで、実装品質を保証する。

## 実行タスク

- **IPC ハンドラテスト作成**: `creatorHandlers.adapterStatus.test.ts` を新規作成
- **コンポーネントテスト作成**: `LLMAdapterErrorBanner.test.tsx` を新規作成
- **フックテスト作成**: `useLLMAdapterStatus.test.ts` を新規作成
- **テスト実行（RED確認）**: 作成したテストが実装前に FAIL することを確認

## 参照資料

| 資料名                   | パス                                                                           | 用途                              |
| ------------------------ | ------------------------------------------------------------------------------ | --------------------------------- |
| Phase 2 設計書           | `phase-02-design.md`                                                           | テスト対象の契約定義              |
| 既存テストパターン       | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts` | IPC ハンドラテストの書き方        |
| 既存コンポーネントテスト | `apps/desktop/src/renderer/components/skill/__tests__/ErrorBanner.test.tsx`    | Reactコンポーネントテストパターン |

---

## テスト 1: `creatorHandlers.adapterStatus.test.ts`

**作成先**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`

### テストケース一覧

| テストID | 説明                                      | テスト内容                                                                                                           |
| -------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| T-IPC-01 | ハンドラ登録確認                          | `registerRuntimeSkillCreatorHandlers` 後に `skill-creator:get-adapter-status` ハンドラが登録されること               |
| T-IPC-02 | pull 成功（ready状態）                    | `llmAdapterStatus === "ready"` のとき `{ success: true, data: { status: "ready", failureReason: null } }` が返ること |
| T-IPC-03 | pull 成功（failed状態）                   | `llmAdapterStatus === "failed"` かつ `failureReason` があるとき、payload に `failureReason` が含まれること           |
| T-IPC-04 | サービス未初期化時の graceful degradation | `runtimeSkillCreatorService` が `null` のとき `validationError` が返ること                                           |
| T-IPC-05 | sender validation 呼び出し                | `validateIpcSender` が正しい引数で呼ばれること                                                                       |
| T-IPC-06 | unregister で削除                         | `unregisterRuntimeSkillCreatorHandlers` 後にハンドラが削除されること                                                 |
| T-IPC-07 | push ワイヤリング確認                     | `onAdapterStatusChanged` に callback が設定され、`status` 変化時に `webContents.send` が呼ばれること                 |
| T-IPC-08 | ウィンドウ破棄後の push                   | `mainWindow.isDestroyed()` が `true` のとき `webContents.send` が呼ばれないこと                                      |

### テストコード全文

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import type { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlerMap.set(channel, handler);
      },
    ),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

vi.mock(
  "../../infrastructure/security/ipc-validator",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../infrastructure/security/ipc-validator")
      >();
    return {
      ...original,
      validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
    };
  },
);

import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";
import { validateIpcSender } from "../../infrastructure/security/ipc-validator";

function createMockMainWindow(destroyed = false) {
  return {
    id: 1,
    isDestroyed: vi.fn(() => destroyed),
    webContents: {
      id: 1,
      send: vi.fn(),
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as BrowserWindowType;
}

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

function createMockService(
  status: "ready" | "initializing" | "failed" = "ready",
  failureReason: string | null = null,
) {
  return {
    llmAdapterStatus: status,
    llmAdapterFailureReason: failureReason,
    onAdapterStatusChanged: undefined as
      | ((status: string, reason: string | null) => void)
      | undefined,
  } as unknown as RuntimeSkillCreatorFacade;
}

describe("creatorHandlers - adapterStatus", () => {
  let mainWindow: ReturnType<typeof createMockMainWindow>;
  let service: ReturnType<typeof createMockService>;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
    service = createMockService("ready");
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();
  });

  // T-IPC-01
  it("registerRuntimeSkillCreatorHandlers 後に get-adapter-status ハンドラが登録される", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)).toBe(
      true,
    );
  });

  // T-IPC-02
  it("ready 状態のとき { success: true, data: { status: 'ready', failureReason: null } } が返る", async () => {
    service = createMockService("ready", null);
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toEqual({
      success: true,
      data: { status: "ready", failureReason: null },
    });
  });

  // T-IPC-03
  it("failed 状態のとき failureReason が payload に含まれる", async () => {
    service = createMockService("failed", "API key is invalid");
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toEqual({
      success: true,
      data: { status: "failed", failureReason: "API key is invalid" },
    });
  });

  // T-IPC-04
  it("runtimeSkillCreatorService が null のとき validationError が返る", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, null);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toMatchObject({ success: false });
  });

  // T-IPC-05
  it("validateIpcSender が正しい引数で呼ばれる", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const event = createMockEvent();
    await handler(event);

    expect(validateIpcSender).toHaveBeenCalledWith(
      event,
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
      mainWindow,
    );
  });

  // T-IPC-06
  it("unregisterRuntimeSkillCreatorHandlers 後に get-adapter-status ハンドラが削除される", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)).toBe(
      true,
    );

    unregisterRuntimeSkillCreatorHandlers();
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)).toBe(
      false,
    );
  });

  // T-IPC-07
  it("onAdapterStatusChanged が設定され、呼び出し時に webContents.send が実行される", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    expect(typeof service.onAdapterStatusChanged).toBe("function");

    service.onAdapterStatusChanged!("failed", "API key is invalid");

    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
      { status: "failed", failureReason: "API key is invalid" },
    );
  });

  // T-IPC-08
  it("mainWindow.isDestroyed() が true のとき webContents.send が呼ばれない", () => {
    mainWindow = createMockMainWindow(true); // destroyed = true
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    service.onAdapterStatusChanged!("failed", "API key is invalid");

    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
  });
});
```

---

## テスト 2: `LLMAdapterErrorBanner.test.tsx`

**作成先**: `apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx`

### テストケース一覧

| テストID | 説明                      | テスト内容                                                                            |
| -------- | ------------------------- | ------------------------------------------------------------------------------------- |
| T-BAN-01 | failed 時にバナー表示     | `status === "failed"` のとき `role="alert"` 要素が表示されること                      |
| T-BAN-02 | ready 時に非表示          | `status === "ready"` のとき何も表示されないこと                                       |
| T-BAN-03 | initializing 時に非表示   | `status === "initializing"` のとき何も表示されないこと                                |
| T-BAN-04 | API key メッセージ        | `failureReason` に "API key" が含まれるとき特定メッセージが表示されること             |
| T-BAN-05 | その他エラーメッセージ    | `failureReason` に "API key" が含まれないとき汎用メッセージが表示されること           |
| T-BAN-06 | failureReason が null     | `failureReason === null` のとき "不明なエラー" が表示されること                       |
| T-BAN-07 | onOpenSettings が渡される | `onOpenSettings` が渡されたとき「設定を開く」ボタンが表示され、クリックで呼ばれること |
| T-BAN-08 | onOpenSettings が未設定   | `onOpenSettings` がないとき「設定を開く」ボタンが非表示                               |
| T-BAN-09 | data-testid               | `data-testid="llm-adapter-error-banner"` が設定されていること                         |

### テストコード全文

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LLMAdapterErrorBanner } from "../LLMAdapterErrorBanner";

describe("LLMAdapterErrorBanner", () => {
  // T-BAN-01
  it("status が 'failed' のとき role='alert' バナーが表示される", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="some error" />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("llm-adapter-error-banner")).toBeInTheDocument();
  });

  // T-BAN-02
  it("status が 'ready' のとき何も表示されない", () => {
    const { container } = render(
      <LLMAdapterErrorBanner status="ready" failureReason={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  // T-BAN-03
  it("status が 'initializing' のとき何も表示されない", () => {
    const { container } = render(
      <LLMAdapterErrorBanner status="initializing" failureReason={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  // T-BAN-04
  it("failureReason に 'API key' が含まれるとき APIキー向けメッセージが表示される", () => {
    render(
      <LLMAdapterErrorBanner
        status="failed"
        failureReason="API key is invalid"
      />,
    );
    expect(screen.getByText(/APIキーが設定されていないか/)).toBeInTheDocument();
  });

  // T-BAN-05
  it("failureReason に 'API key' が含まれないとき汎用メッセージが表示される", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="network timeout" />,
    );
    expect(
      screen.getByText(/LLMアダプターの初期化に失敗しました/),
    ).toBeInTheDocument();
    expect(screen.getByText(/network timeout/)).toBeInTheDocument();
  });

  // T-BAN-06
  it("failureReason が null のとき '不明なエラー' が含まれるメッセージが表示される", () => {
    render(<LLMAdapterErrorBanner status="failed" failureReason={null} />);
    expect(screen.getByText(/不明なエラー/)).toBeInTheDocument();
  });

  // T-BAN-07
  it("onOpenSettings が渡されると '設定を開く' ボタンが表示され、クリックで呼ばれる", () => {
    const onOpenSettings = vi.fn();
    render(
      <LLMAdapterErrorBanner
        status="failed"
        failureReason="API key is invalid"
        onOpenSettings={onOpenSettings}
      />,
    );

    const button = screen.getByRole("button", { name: /設定を開く/ });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  // T-BAN-08
  it("onOpenSettings が未設定のとき '設定を開く' ボタンが表示されない", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="some error" />,
    );
    expect(
      screen.queryByRole("button", { name: /設定を開く/ }),
    ).not.toBeInTheDocument();
  });

  // T-BAN-09
  it("data-testid='llm-adapter-error-banner' が設定されている", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="some error" />,
    );
    expect(screen.getByTestId("llm-adapter-error-banner")).toBeInTheDocument();
  });
});
```

---

## テスト 3: `useLLMAdapterStatus.test.ts`

**作成先**: `apps/desktop/src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts`

### テストケース一覧

| テストID | 説明                           | テスト内容                                                                                          |
| -------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| T-HK-01  | 初期状態                       | マウント直後は `{ status: "initializing", failureReason: null }` であること                         |
| T-HK-02  | pull 成功時の状態更新          | `getAdapterStatus()` が `{ status: "ready", failureReason: null }` を返すとき、状態が更新されること |
| T-HK-03  | push 受信時の状態更新          | `onAdapterStatusChanged` コールバックが呼ばれたとき、状態が更新されること                           |
| T-HK-04  | アンマウント時のクリーンアップ | アンマウント後に unsubscribe が呼ばれること                                                         |
| T-HK-05  | アンマウント後の pull 結果無視 | アンマウント後に pull の結果が届いても状態が更新されないこと（cancelled フラグ）                    |
| T-HK-06  | API 未利用可環境               | `window.electronAPI` が undefined でもクラッシュしないこと                                          |

### テストコード全文

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLLMAdapterStatus } from "../useLLMAdapterStatus";

function createMockApi(
  getAdapterStatusResult = {
    success: true,
    data: { status: "ready", failureReason: null },
  },
) {
  const subscribers: Array<
    (payload: { status: string; failureReason: string | null }) => void
  > = [];

  return {
    api: {
      getAdapterStatus: vi.fn(async () => getAdapterStatusResult),
      onAdapterStatusChanged: vi.fn(
        (
          cb: (payload: {
            status: string;
            failureReason: string | null;
          }) => void,
        ) => {
          subscribers.push(cb);
          return () => {
            const idx = subscribers.indexOf(cb);
            if (idx !== -1) subscribers.splice(idx, 1);
          };
        },
      ),
    },
    triggerPush(payload: { status: string; failureReason: string | null }) {
      subscribers.forEach((cb) => cb(payload));
    },
    get subscriberCount() {
      return subscribers.length;
    },
  };
}

describe("useLLMAdapterStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T-HK-01
  it("マウント直後の初期状態は { status: 'initializing', failureReason: null }", () => {
    const { api } = createMockApi();
    vi.spyOn(window, "electronAPI", "get").mockReturnValue({
      skillCreator: api,
    } as unknown);

    const { result } = renderHook(() => useLLMAdapterStatus());
    expect(result.current).toEqual({
      status: "initializing",
      failureReason: null,
    });
  });

  // T-HK-02
  it("pull 成功後に状態が 'ready' に更新される", async () => {
    const { api } = createMockApi({
      success: true,
      data: { status: "ready", failureReason: null },
    });
    vi.spyOn(window, "electronAPI", "get").mockReturnValue({
      skillCreator: api,
    } as unknown);

    const { result } = renderHook(() => useLLMAdapterStatus());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
    expect(result.current.failureReason).toBeNull();
  });

  // T-HK-03
  it("push 受信後に状態が更新される", async () => {
    const { api, triggerPush } = createMockApi();
    vi.spyOn(window, "electronAPI", "get").mockReturnValue({
      skillCreator: api,
    } as unknown);

    const { result } = renderHook(() => useLLMAdapterStatus());

    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => {
      triggerPush({ status: "failed", failureReason: "API key is invalid" });
    });

    expect(result.current).toEqual({
      status: "failed",
      failureReason: "API key is invalid",
    });
  });

  // T-HK-04
  it("アンマウント時に unsubscribe が呼ばれる", async () => {
    const { api, subscriberCount } = createMockApi();
    const unsubscribe = vi.fn();
    api.onAdapterStatusChanged.mockReturnValue(unsubscribe);
    vi.spyOn(window, "electronAPI", "get").mockReturnValue({
      skillCreator: api,
    } as unknown);

    const { unmount } = renderHook(() => useLLMAdapterStatus());

    await waitFor(() => expect(api.onAdapterStatusChanged).toHaveBeenCalled());

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  // T-HK-05
  it("アンマウント後に pull の結果が届いても状態が更新されない", async () => {
    let resolveGetAdapterStatus!: (val: unknown) => void;
    const api = {
      getAdapterStatus: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveGetAdapterStatus = resolve;
          }),
      ),
      onAdapterStatusChanged: vi.fn(() => () => {}),
    };
    vi.spyOn(window, "electronAPI", "get").mockReturnValue({
      skillCreator: api,
    } as unknown);

    const { result, unmount } = renderHook(() => useLLMAdapterStatus());

    // アンマウントしてから pull を resolve
    unmount();
    act(() => {
      resolveGetAdapterStatus({
        success: true,
        data: { status: "ready", failureReason: null },
      });
    });

    // 状態は initializing のまま（更新されていない）
    expect(result.current.status).toBe("initializing");
  });

  // T-HK-06
  it("window.electronAPI が undefined でもクラッシュしない", () => {
    vi.spyOn(window, "electronAPI", "get").mockReturnValue(
      undefined as unknown,
    );

    expect(() => {
      renderHook(() => useLLMAdapterStatus());
    }).not.toThrow();
  });
});
```

---

## テスト実行（RED確認）

Phase 4 完了後に以下のコマンドを実行し、テストが RED（FAIL）であることを確認する：

```bash
# IPC ハンドラテスト
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts

# コンポーネントテスト
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx

# フックテスト
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts
```

期待する結果: `Cannot find module` または `ReferenceError` 等で全テストが FAIL

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断 | 確認内容                                                                       |
| ---------------- | -------- | ------------------------------------------------------------------------------ |
| TDD 順序         | 必須     | テストが実装前に RED であること                                                |
| 設計契約の網羅性 | 必須     | Phase 2 の設計決定（型・表示ロジック・フロー）が全てテストに反映されていること |
| エッジケース     | 適用     | アンマウント競合・API 未利用可・null 値が考慮されていること                    |

## サブタスク管理

| ID     | 内容                                         | ステータス |
| ------ | -------------------------------------------- | ---------- |
| ST-4-1 | `creatorHandlers.adapterStatus.test.ts` 作成 | 未実施     |
| ST-4-2 | `LLMAdapterErrorBanner.test.tsx` 作成        | 未実施     |
| ST-4-3 | `useLLMAdapterStatus.test.ts` 作成           | 未実施     |
| ST-4-4 | テスト実行（RED確認）                        | 未実施     |

## 成果物

| 成果物                    | パス                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| IPC ハンドラテスト        | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`              |
| コンポーネントテスト      | `apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx`    |
| フックテスト              | `apps/desktop/src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts` |
| テスト実行ログ（RED確認） | `outputs/phase-4/test-red-confirmation.md`                                               |

## 完了条件

- [ ] 3つのテストファイルが作成されている
- [ ] 各テストファイルのテストケースが Phase 2 設計の契約を網羅している
- [ ] テスト実行で RED（FAIL）が確認されている
- [ ] テストコードが TypeScript 型エラーなし（構文チェックのみ）

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-4/` に配置した
- [ ] `artifacts.json` の Phase 4 を `completed` に更新した

## 統合テスト連携

本 Phase のテスト成果物は後続 Phase の品質確認・ゲート判定に使用される。

| Phase   | 連携内容                                  |
| ------- | ----------------------------------------- |
| Phase 5 | テスト GREEN を確認してから実装完了とする |
| Phase 9 | 品質保証フェーズで最終確認する            |

## 次Phase

Phase 4 完了後 → [Phase 5: 実装](phase-05-implementation.md) へ進む（TDD: テストを GREEN にする）
