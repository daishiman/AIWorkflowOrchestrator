import "@testing-library/jest-dom";
import { vi, beforeAll } from "vitest";

console.log("[setup-simple.ts] Running setup...");

// window.electronAPI.skill モック
beforeAll(() => {
  console.log("[setup-simple.ts] beforeAll - typeof window:", typeof window);
  if (typeof window !== "undefined") {
    (window as unknown as { electronAPI: { skill: object } }).electronAPI = {
      skill: {
        onStream: vi.fn().mockReturnValue(() => {}),
        onPermissionRequest: vi.fn().mockReturnValue(() => {}),
        sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
        execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
        abort: vi.fn().mockResolvedValue(undefined),
        list: vi.fn().mockResolvedValue([]),
        getImported: vi.fn().mockResolvedValue([]),
        import: vi.fn().mockResolvedValue({}),
        remove: vi.fn().mockResolvedValue(undefined),
        rescan: vi.fn().mockResolvedValue([]),
        onComplete: vi.fn().mockReturnValue(() => {}),
        onError: vi.fn().mockReturnValue(() => {}),
        getExecutionStatus: vi.fn().mockResolvedValue(null),
      },
    };
    console.log("[setup-simple.ts] window.electronAPI.skill set");
  }
});
