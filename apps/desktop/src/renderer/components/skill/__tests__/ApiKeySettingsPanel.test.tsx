/**
 * @vitest-environment happy-dom
 * @file ApiKeySettingsPanel.test.tsx
 * @description ApiKeySettingsPanel 委譲動作のユニットテスト
 * @phase Phase 5: 実装後テスト (TC-11〜TC-15)
 * @task TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001
 *
 * ApiKeySettingsPanel は AuthKeySection への薄いラッパーとなった。
 * このテストは「委譲が正しく機能すること」を検証する。
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

// ============================================================
// AuthKeySection をモック（vi.mock factory 内で vi.fn を定義）
// ============================================================
vi.mock("../../settings/AuthKeySection", () => ({
  // vi.mock は hoisted されるため、factory 内に直接 vi.fn() を記述する
  AuthKeySection: vi.fn().mockImplementation(
    ({
      onStatusChange,
    }: {
      onStatusChange?: (status: string) => void;
    }): React.ReactNode =>
      React.createElement("div", {
        "data-testid": "mock-auth-key-section",
        "data-on-status-change": onStatusChange ? "provided" : "not-provided",
      }),
  ),
}));

// モックへの参照（vi.mocked 経由）
import { AuthKeySection } from "../../settings/AuthKeySection";
const MockAuthKeySection = vi.mocked(AuthKeySection);

// ============================================================
// electronAPI モック（ApiKeySettingsPanel が直接呼ばないことの検証用）
// ============================================================
const mockAuthKey = {
  set: vi.fn(),
  exists: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  MockAuthKeySection.mockImplementation(
    ({
      onStatusChange,
    }: {
      onStatusChange?: (status: string) => void;
    }): React.ReactNode =>
      React.createElement("div", {
        "data-testid": "mock-auth-key-section",
        "data-on-status-change": onStatusChange ? "provided" : "not-provided",
      }),
  );

  mockAuthKey.exists.mockResolvedValue({ exists: false });
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

import { ApiKeySettingsPanel } from "../ApiKeySettingsPanel";

// ============================================================
// TC-11: 委譲動作テスト
// ============================================================
describe("TC-11: 委譲動作", () => {
  it("should render AuthKeySection as delegate", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });

    expect(screen.getByTestId("mock-auth-key-section")).toBeInTheDocument();
    expect(MockAuthKeySection).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// TC-12: onStatusChange 伝播テスト
// ============================================================
describe("TC-12: onStatusChange 伝播", () => {
  it("should pass onStatusChange prop to AuthKeySection", async () => {
    const mockFn = vi.fn();

    await act(async () => {
      render(<ApiKeySettingsPanel onStatusChange={mockFn} />);
    });

    expect(MockAuthKeySection).toHaveBeenCalledWith(
      expect.objectContaining({ onStatusChange: mockFn }),
      expect.anything(),
    );
  });

  it("should pass undefined when onStatusChange is not provided", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });

    expect(MockAuthKeySection).toHaveBeenCalledWith(
      expect.objectContaining({ onStatusChange: undefined }),
      expect.anything(),
    );
  });
});

// ============================================================
// TC-13: 独立 IPC 呼び出しがないことの確認
// ============================================================
describe("TC-13: 直接 IPC 呼び出しなし（委譲のみ）", () => {
  it("should not call IPC directly on initial render (delegation only)", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });

    // ApiKeySettingsPanel 自体は IPC を直接呼ばない
    // （AuthKeySection がモックされているため IPC は呼ばれない）
    expect(mockAuthKey.exists).not.toHaveBeenCalled();
    expect(mockAuthKey.set).not.toHaveBeenCalled();
    expect(mockAuthKey.delete).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-14: 既存の props インターフェース互換テスト
// ============================================================
describe("TC-14: 後方互換性", () => {
  it("should accept same props interface as before (backward compatibility)", async () => {
    const mockFn = vi.fn();

    await act(async () => {
      render(<ApiKeySettingsPanel onStatusChange={mockFn} />);
    });

    expect(screen.getByTestId("mock-auth-key-section")).toBeInTheDocument();
  });

  it("should render without props (optional onStatusChange)", async () => {
    await act(async () => {
      render(<ApiKeySettingsPanel />);
    });

    expect(screen.getByTestId("mock-auth-key-section")).toBeInTheDocument();
  });
});

// ============================================================
// TC-15: スナップショット/回帰テスト
// ============================================================
describe("TC-15: スナップショット（委譲リファクタリング後）", () => {
  it("should match snapshot after delegation refactor", async () => {
    let container!: HTMLElement;

    await act(async () => {
      const result = render(<ApiKeySettingsPanel />);
      container = result.container;
    });

    expect(container).toMatchSnapshot();
  });
});
