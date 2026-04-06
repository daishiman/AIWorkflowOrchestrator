/**
 * @vitest-environment happy-dom
 * @file useAuthKeyManagement.test.ts
 * @description useAuthKeyManagement カスタムフックのユニットテスト
 * @phase Phase 4: テスト作成 (TDD: Red) / Phase 5: 実装後 Green
 * @task TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useAuthKeyManagement } from "../useAuthKeyManagement";

// ============================================================
// electronAPI.authKey モック
// ============================================================
const mockAuthKey = {
  set: vi.fn(),
  exists: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthKey.exists.mockResolvedValue({ exists: false, source: "not-set" });
  mockAuthKey.set.mockResolvedValue({ success: true });
  mockAuthKey.delete.mockResolvedValue({ success: true });

  Object.defineProperty(window, "electronAPI", {
    value: { authKey: mockAuthKey },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

// ============================================================
// TC-01: 初期化テスト
// ============================================================
describe("TC-01: 初期化", () => {
  it("should initialize with not_set status when authKey does not exist", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: false });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("not_set");
    expect(result.current.keySource).toBeNull();
    expect(result.current.inputValue).toBe("");
  });

  it("should initialize with configured status when key exists with source=saved", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: true, source: "saved" });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("configured");
    expect(result.current.keySource).toBe("saved");
  });

  it("should initialize with configured status when key exists with source=env-fallback", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "env-fallback",
    });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("configured");
    expect(result.current.keySource).toBe("env-fallback");
  });

  it("should set status to check-failed when electronAPI is unavailable", async () => {
    Object.defineProperty(window, "electronAPI", {
      value: {},
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("check-failed");
    expect(result.current.apiError).toBe("ステータスの確認に失敗しました");
  });
});

// ============================================================
// TC-02: 保存成功テスト
// ============================================================
describe("TC-02: 保存成功", () => {
  it("should set status to configured after successful save", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: false });
    mockAuthKey.set.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthKeyManagement());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      result.current.setInputValue("sk-test-validkey123456789012345");
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(true);
    expect(result.current.status).toBe("configured");
    expect(result.current.keySource).toBe("saved");
    expect(result.current.inputValue).toBe("");
    expect(mockAuthKey.set).toHaveBeenCalledWith(
      "sk-test-validkey123456789012345",
    );
  });
});

// ============================================================
// TC-03: 削除成功テスト
// ============================================================
describe("TC-03: 削除成功", () => {
  it("should set status to not_set after successful delete", async () => {
    mockAuthKey.exists
      .mockResolvedValueOnce({ exists: true, source: "saved" })
      .mockResolvedValueOnce({ exists: false });
    mockAuthKey.delete.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthKeyManagement());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("configured");

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleDelete();
    });

    expect(success).toBe(true);
    expect(result.current.status).toBe("not_set");
    expect(result.current.keySource).toBeNull();
  });
});

// ============================================================
// TC-04: バリデーションエラーテスト
// ============================================================
describe("TC-04: バリデーションエラー", () => {
  it("should set validationError when key does not start with sk-", async () => {
    const { result } = renderHook(() => useAuthKeyManagement());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      result.current.setInputValue("invalid-key");
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.validationError).not.toBeNull();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });

  it("should set validationError when key is empty", async () => {
    const { result } = renderHook(() => useAuthKeyManagement());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.validationError).toBe("APIキーを入力してください");
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });

  it("should set validationError when key exceeds 200 characters", async () => {
    const { result } = renderHook(() => useAuthKeyManagement());

    await act(async () => {
      result.current.setInputValue("sk-" + "a".repeat(198));
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.validationError).toBe("APIキーの長さが不正です");
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-05: onStatusChange コールバックテスト
// ============================================================
describe("TC-05: onStatusChange コールバック", () => {
  it("should call onStatusChange when status changes after save", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: false });
    mockAuthKey.set.mockResolvedValue({ success: true });

    const onStatusChange = vi.fn();
    const { result } = renderHook(() =>
      useAuthKeyManagement({ onStatusChange }),
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      result.current.setInputValue("sk-test-validkey123456789012345");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(onStatusChange).toHaveBeenCalledWith("configured");
  });

  it("should call onStatusChange with not_set on initial load when key does not exist", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: false });

    const onStatusChange = vi.fn();
    await act(async () => {
      renderHook(() => useAuthKeyManagement({ onStatusChange }));
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(onStatusChange).toHaveBeenCalledWith("not_set");
  });
});

// ============================================================
// TC-19〜TC-21: IPC 失敗パス（エラーハンドリング）
// ============================================================
describe("TC-19〜TC-21: IPC 失敗パス", () => {
  it("TC-19: should set status to error when authKey.set fails", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: false });
    mockAuthKey.set.mockResolvedValue({
      success: false,
      error: "Storage error",
    });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      result.current.setInputValue("sk-test-validkey123");
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.apiError).not.toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("TC-20: should set apiError when authKey.delete fails", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: true, source: "saved" });
    mockAuthKey.delete.mockResolvedValue({
      success: false,
      error: "Delete failed",
    });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleDelete();
    });

    expect(success).toBe(false);
    expect(result.current.apiError).not.toBeNull();
    expect(result.current.status).toBe("error");
  });

  it("TC-21: should set status to check-failed when authKey.exists throws on init", async () => {
    mockAuthKey.exists.mockRejectedValue(new Error("IPC error"));

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("check-failed");
    expect(result.current.apiError).toBe("ステータスの確認に失敗しました");
  });
});

// ============================================================
// TC-22: exists() throw after delete
// ============================================================
describe("TC-22: exists() throw after delete", () => {
  it("should set apiError when authKey.exists throws after delete", async () => {
    mockAuthKey.exists
      .mockResolvedValueOnce({ exists: true, source: "saved" })
      .mockRejectedValueOnce(new Error("IPC error after delete"));
    mockAuthKey.delete.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("configured");

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleDelete();
    });

    expect(success).toBe(false);
    expect(result.current.apiError).not.toBeNull();
    expect(result.current.status).toBe("check-failed");
    expect(result.current.keySource).toBeNull();
  });
});

// ============================================================
// TC-24: delete API missing
// ============================================================
describe("TC-24: delete API missing", () => {
  it("should set status to error when authKey.delete is unavailable", async () => {
    // delete を欠落させる
    Object.defineProperty(window, "electronAPI", {
      value: { authKey: { exists: mockAuthKey.exists, set: mockAuthKey.set } },
      writable: true,
      configurable: true,
    });
    mockAuthKey.exists.mockResolvedValue({ exists: true, source: "saved" });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("configured");

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleDelete();
    });

    expect(success).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.apiError).toBe("APIキー削除機能が利用できません");
  });
});

// ============================================================
// TC-25: refresh clears apiError on success
// ============================================================
describe("TC-25: refresh clears apiError on success", () => {
  it("should clear apiError when refresh succeeds after check-failed", async () => {
    // 初期は electronAPI 不可で check-failed + apiError
    Object.defineProperty(window, "electronAPI", {
      value: {},
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("check-failed");
    expect(result.current.apiError).toBe("ステータスの確認に失敗しました");

    // 後から electronAPI を提供して refresh()
    Object.defineProperty(window, "electronAPI", {
      value: { authKey: mockAuthKey },
      writable: true,
      configurable: true,
    });
    mockAuthKey.exists.mockResolvedValue({ exists: false });

    let ok!: boolean;
    await act(async () => {
      ok = await result.current.refresh();
    });

    expect(ok).toBe(true);
    expect(result.current.status).toBe("not_set");
    expect(result.current.apiError).toBeNull();
  });
});

// ============================================================
// TC-23: コンポーネントアンマウント時の状態更新防止
// ============================================================
describe("TC-23: アンマウント後の状態更新防止", () => {
  it("should not update state after component unmount", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    let resolveExists!: (value: { exists: boolean }) => void;
    mockAuthKey.exists.mockReturnValue(
      new Promise((r) => {
        resolveExists = r;
      }),
    );

    const { unmount } = renderHook(() => useAuthKeyManagement());

    // exists() が resolve する前にアンマウント
    unmount();

    // アンマウント後に resolve してもエラーが発生しないことを確認
    await act(async () => {
      resolveExists({ exists: false });
      await new Promise((r) => setTimeout(r, 10));
    });

    // "Can't perform a React state update on an unmounted component" 相当の
    // エラーが発生していないことを確認（React 18 では警告は削除済み）
    const reactUpdateErrors = consoleErrorSpy.mock.calls.filter((args) =>
      String(args[0]).includes("unmounted"),
    );
    expect(reactUpdateErrors).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});

// ============================================================
// TC-24: 連続保存の競合防止
// ============================================================
describe("TC-24: 連続保存の競合防止", () => {
  it("should prevent duplicate save while isSubmitting is true", async () => {
    mockAuthKey.exists.mockResolvedValue({ exists: false });

    let resolveSet!: (value: { success: boolean }) => void;
    mockAuthKey.set.mockReturnValue(
      new Promise((r) => {
        resolveSet = r;
      }),
    );

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      result.current.setInputValue("sk-test-validkey123456789");
    });

    // 1回目の保存（未完了状態）
    let firstSavePromise!: Promise<boolean>;
    act(() => {
      firstSavePromise = result.current.handleSave();
    });

    // isSubmitting が true の間に2回目を呼び出す
    let secondSaveResult!: boolean;
    await act(async () => {
      secondSaveResult = await result.current.handleSave();
    });

    // 1回目の保存を完了させる
    await act(async () => {
      resolveSet({ success: true });
      await firstSavePromise;
    });

    // authKey.set() は1回のみ呼ばれているはず
    expect(mockAuthKey.set).toHaveBeenCalledTimes(1);
    expect(secondSaveResult).toBe(false);
  });
});

// ============================================================
// TC-25〜TC-27: バリデーション境界値
// ============================================================
describe("TC-25〜TC-27: バリデーション境界値", () => {
  it("TC-25: should set validationError when inputValue is empty", async () => {
    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.validationError).not.toBeNull();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });

  it("TC-26: should set validationError when key length exceeds 200 chars", async () => {
    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      result.current.setInputValue("sk-" + "a".repeat(200));
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.validationError).not.toBeNull();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });

  it("TC-27: should set validationError when key does not start with sk-", async () => {
    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      result.current.setInputValue("invalid-prefix-key");
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.handleSave();
    });

    expect(success).toBe(false);
    expect(result.current.validationError).not.toBeNull();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-28: env-fallback 状態
// ============================================================
describe("TC-28: env-fallback 初期化", () => {
  it("should initialize with configured status and env-fallback keySource", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "env-fallback",
    });

    const { result } = renderHook(() => useAuthKeyManagement());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.status).toBe("configured");
    expect(result.current.keySource).toBe("env-fallback");
  });
});
