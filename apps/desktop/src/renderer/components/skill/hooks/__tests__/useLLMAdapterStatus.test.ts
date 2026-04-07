import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLLMAdapterStatus } from "../useLLMAdapterStatus";

function createMockApi(
  getAdapterStatusResult: {
    success: boolean;
    data?: { status: string; failureReason: string | null };
  } = {
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

function setSkillCreatorApi(api: unknown): void {
  Object.defineProperty(window, "skillCreatorAPI", {
    value: api,
    writable: true,
    configurable: true,
  });
}

describe("useLLMAdapterStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Reflect.deleteProperty(window, "skillCreatorAPI");
  });

  // T-HK-01
  it("マウント直後の初期状態は { status: 'initializing', failureReason: null }", () => {
    const api = {
      getAdapterStatus: vi.fn(
        () =>
          new Promise((resolve) => {
            void resolve;
          }),
      ),
      onAdapterStatusChanged: vi.fn(() => () => {}),
    };
    setSkillCreatorApi(api);

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
    setSkillCreatorApi(api);

    const { result } = renderHook(() => useLLMAdapterStatus());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });
    expect(result.current.failureReason).toBeNull();
  });

  // T-HK-03
  it("push 受信後に状態が更新される", async () => {
    const { api, triggerPush } = createMockApi();
    setSkillCreatorApi(api);

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
    const { api } = createMockApi();
    const unsubscribe = vi.fn();
    api.onAdapterStatusChanged.mockReturnValue(unsubscribe);
    setSkillCreatorApi(api);

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
    setSkillCreatorApi(api);

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
  it("window.skillCreatorAPI が undefined でもクラッシュしない", () => {
    setSkillCreatorApi(undefined);

    expect(() => {
      renderHook(() => useLLMAdapterStatus());
    }).not.toThrow();
  });

  // T-HK-07
  it("pull が success: false を返したとき状態は initializing のまま", async () => {
    const { api } = createMockApi({ success: false });
    setSkillCreatorApi(api);

    const { result } = renderHook(() => useLLMAdapterStatus());
    await waitFor(() => expect(api.getAdapterStatus).toHaveBeenCalled());

    expect(result.current.status).toBe("initializing");
  });

  // T-HK-08
  it("連続して push が届いたとき最後の状態が保持される", async () => {
    const { api, triggerPush } = createMockApi();
    setSkillCreatorApi(api);

    const { result } = renderHook(() => useLLMAdapterStatus());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => {
      triggerPush({ status: "failed", failureReason: "error 1" });
      triggerPush({ status: "failed", failureReason: "error 2" });
      triggerPush({ status: "ready", failureReason: null });
    });

    expect(result.current).toEqual({ status: "ready", failureReason: null });
  });

  // T-HK-09
  it("push payload の failureReason が null でも状態が更新される", async () => {
    const { api, triggerPush } = createMockApi();
    setSkillCreatorApi(api);

    const { result } = renderHook(() => useLLMAdapterStatus());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => {
      triggerPush({ status: "ready", failureReason: null });
    });

    expect(result.current).toEqual({ status: "ready", failureReason: null });
  });
});
