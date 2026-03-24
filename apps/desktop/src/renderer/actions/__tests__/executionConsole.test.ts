import { describe, expect, it, vi, beforeEach } from "vitest";

const mockSetCurrentView = vi.fn();

vi.mock("@/renderer/store", () => ({
  useAppStore: {
    getState: () => ({
      setCurrentView: mockSetCurrentView,
    }),
  },
}));

import { openExecutionConsole } from "../executionConsole";

describe("openExecutionConsole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("setCurrentView('executionConsole') を呼ぶ", () => {
    openExecutionConsole();
    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentView).toHaveBeenCalledWith("executionConsole");
  });

  it("引数なしで呼び出しても正常に動作する（後方互換）", () => {
    openExecutionConsole();
    expect(mockSetCurrentView).toHaveBeenCalledWith("executionConsole");
  });
});
