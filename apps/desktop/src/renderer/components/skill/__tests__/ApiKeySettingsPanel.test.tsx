/**
 * @vitest-environment happy-dom
 * @file ApiKeySettingsPanel.test.tsx
 * @description API キー管理パネルのユニットテスト (TASK-RT-04)
 * @phase Phase 4: テスト作成 (TDD: Red)
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

// ============================================================
// electronAPI.authKey モック
// ============================================================
const mockAuthKey = {
  set: vi.fn(),
  exists: vi.fn(),
  validate: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // デフォルト: キー未設定
  mockAuthKey.exists.mockResolvedValue({ exists: false, source: "not-set" });
  mockAuthKey.set.mockResolvedValue({ success: true });
  mockAuthKey.validate.mockResolvedValue({ valid: true });
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

import { ApiKeySettingsPanel } from "../ApiKeySettingsPanel";

// ============================================================
// AC-1: コンポーネントの存在と描画
// ============================================================
describe("AC-1: ApiKeySettingsPanel の描画", () => {
  it("コンポーネントが正常にレンダリングされる", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    expect(screen.getByText("APIキー設定")).toBeInTheDocument();
  });

  it("初期ロードで exists() を呼び出す", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    expect(mockAuthKey.exists).toHaveBeenCalledTimes(1);
  });

  it("キー未設定時に入力フォームが表示される", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    expect(screen.getByPlaceholderText("sk-ant-api...")).toBeInTheDocument();
  });

  it("キー設定済み時にマスク表示される", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "saved",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByText("設定済み")).toBeInTheDocument();
    });
  });
});

// ============================================================
// AC-2: バリデーション
// ============================================================
describe("AC-2: バリデーション", () => {
  it("空文字で保存ボタンを押すとエラーが表示される", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(screen.getByText("APIキーを入力してください")).toBeInTheDocument();
  });

  it("不正なフォーマットのキーでエラーが表示される", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid-key-format" } });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(
      screen.getByText("APIキーの形式が正しくありません"),
    ).toBeInTheDocument();
  });

  it("正しいフォーマットのキーでバリデーションが通る", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-ant-api03-validkeyvalue123" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(mockAuthKey.set).toHaveBeenCalledWith(
        "sk-ant-api03-validkeyvalue123",
      );
    });
  });
});

// ============================================================
// AC-3: 保存状態の表示
// ============================================================
describe("AC-3: 保存状態の表示", () => {
  it("未設定状態で「未設定」バッジが表示される", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    expect(screen.getByText("未設定")).toBeInTheDocument();
  });

  it("検証中状態で「検証中」テキストが表示される", async () => {
    mockAuthKey.set.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-ant-api03-validkeyvalue123" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    const elements = screen.getAllByText("検証中...");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("設定済み状態で「設定済み」バッジが表示される", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "saved",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByText("設定済み")).toBeInTheDocument();
    });
  });

  it("エラー状態でエラーメッセージが表示される", async () => {
    mockAuthKey.set.mockResolvedValue({
      success: false,
      error: "Encryption failed",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-ant-api03-validkeyvalue123" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(screen.getByText("Encryption failed")).toBeInTheDocument();
    });
  });

  it("環境変数フォールバック時にソースが表示される", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "env-fallback",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByText("環境変数")).toBeInTheDocument();
    });
  });

  it("未知の source 値ではソース表示を出さない", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "unexpected-source",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByText("設定済み")).toBeInTheDocument();
    });
    expect(screen.queryByText("保存済み")).not.toBeInTheDocument();
    expect(screen.queryByText("環境変数")).not.toBeInTheDocument();
  });
});

// ============================================================
// AC-4: 削除機能
// ============================================================
describe("AC-4: 削除機能", () => {
  it("設定済み状態で削除ボタンが表示される", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "saved",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
  });

  it("削除ボタン押下で delete() が呼ばれる", async () => {
    mockAuthKey.exists
      .mockResolvedValueOnce({
        exists: true,
        source: "saved",
      })
      .mockResolvedValueOnce({
        exists: false,
        source: "not-set",
      });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: "削除" });
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    expect(mockAuthKey.delete).toHaveBeenCalledTimes(1);
  });

  it("削除成功後に入力フォームが再表示される", async () => {
    mockAuthKey.exists
      .mockResolvedValueOnce({
        exists: true,
        source: "saved",
      })
      .mockResolvedValueOnce({
        exists: false,
        source: "not-set",
      });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: "削除" });
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() => {
      expect(screen.getByPlaceholderText("sk-ant-api...")).toBeInTheDocument();
    });
  });

  it("env-fallback は削除後も configured を維持する", async () => {
    mockAuthKey.exists
      .mockResolvedValueOnce({
        exists: true,
        source: "env-fallback",
      })
      .mockResolvedValueOnce({
        exists: true,
        source: "env-fallback",
      });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: "削除" });
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() => {
      expect(screen.getByText("設定済み")).toBeInTheDocument();
      expect(screen.getByText("環境変数")).toBeInTheDocument();
    });
  });
});

// ============================================================
// AC-5: onStatusChange コールバック
// ============================================================
describe("AC-5: onStatusChange コールバック", () => {
  it("初期ロードで onStatusChange が呼ばれる", async () => {
    const mockOnStatusChange = vi.fn();
    await act(async () => {
      render(<ApiKeySettingsPanel onStatusChange={mockOnStatusChange} />);
    });
    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith("not_set");
    });
  });

  it("保存成功で onStatusChange('configured') が呼ばれる", async () => {
    const mockOnStatusChange = vi.fn();
    await act(async () => {
      render(<ApiKeySettingsPanel onStatusChange={mockOnStatusChange} />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-ant-api03-validkeyvalue123" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith("configured");
    });
  });
});

// ============================================================
// Phase 6: Edge case テスト
// ============================================================
describe("Edge case: エラーハンドリング", () => {
  it("exists() がエラーを投げた場合、not_set にフォールバックする", async () => {
    mockAuthKey.exists.mockRejectedValue(new Error("Network error"));
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByText("未設定")).toBeInTheDocument();
    });
  });

  it("set() が例外を投げた場合、エラーメッセージが表示される", async () => {
    mockAuthKey.set.mockRejectedValue(new Error("Unexpected"));
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-ant-api03-validkeyvalue123" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(
        screen.getByText("予期しないエラーが発生しました"),
      ).toBeInTheDocument();
    });
  });

  it("delete() が失敗した場合、エラーメッセージが表示される", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "saved",
    });
    mockAuthKey.delete.mockResolvedValue({
      success: false,
      error: "Storage error",
    });
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: "削除" });
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() => {
      expect(screen.getByText("Storage error")).toBeInTheDocument();
    });
  });

  it("delete() が例外を投げた場合、エラーメッセージが表示される", async () => {
    mockAuthKey.exists.mockResolvedValue({
      exists: true,
      source: "saved",
    });
    mockAuthKey.delete.mockRejectedValue(new Error("Unexpected"));
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button", { name: "削除" });
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    await waitFor(() => {
      expect(
        screen.getByText("予期しないエラーが発生しました"),
      ).toBeInTheDocument();
    });
  });
});

describe("Edge case: バリデーション境界値", () => {
  it("200文字ちょうどのキーは受け入れられる", async () => {
    const key = "sk-ant-api03-" + "a".repeat(187);
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, { target: { value: key } });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(mockAuthKey.set).toHaveBeenCalledWith(key);
    });
  });

  it("201文字のキーはバリデーションエラーになる", async () => {
    const key = "sk-ant-api03-" + "a".repeat(188);
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, { target: { value: key } });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(screen.getByText("APIキーの長さが不正です")).toBeInTheDocument();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });

  it("空白のみの入力はバリデーションエラーになる", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "   " } });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(screen.getByText("APIキーを入力してください")).toBeInTheDocument();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
  });
});

describe("Edge case: 入力フィールドの連動", () => {
  it("入力変更でバリデーションエラーがクリアされる", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(screen.getByText("APIキーを入力してください")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, { target: { value: "s" } });
    });
    expect(
      screen.queryByText("APIキーを入力してください"),
    ).not.toBeInTheDocument();
  });

  it("検証中は入力フィールドが無効化される", async () => {
    mockAuthKey.set.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-ant-api03-validkeyvalue123" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(input).toBeDisabled();
  });

  it("前後空白付きキーでも trim して保存する", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "  sk-ant-api03-validkeyvalue123  " },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(mockAuthKey.set).toHaveBeenCalledWith(
        "sk-ant-api03-validkeyvalue123",
      );
    });
  });

  it("sk- プレフィックス形式のキーを許容する", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });
    const input = screen.getByPlaceholderText("sk-ant-api...");
    await act(async () => {
      fireEvent.change(input, {
        target: { value: "sk-generic-test-key" },
      });
    });
    const saveButton = screen.getByRole("button", { name: "保存" });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(mockAuthKey.set).toHaveBeenCalledWith("sk-generic-test-key");
    });
  });
});
