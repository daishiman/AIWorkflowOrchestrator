import "@testing-library/jest-dom";
import { vi, beforeAll } from "vitest";

console.log("[setup-simple.ts] Running setup...");

// window.skillAPI モック
beforeAll(() => {
  console.log("[setup-simple.ts] beforeAll - typeof window:", typeof window);
  if (typeof window !== "undefined") {
    (window as unknown as { skillAPI: object }).skillAPI = {
      onStream: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
      abort: vi.fn().mockResolvedValue(undefined),
      listImported: vi.fn().mockResolvedValue([]),
      listAvailable: vi.fn().mockResolvedValue([]),
      import: vi.fn().mockResolvedValue({ success: true }),
      remove: vi.fn().mockResolvedValue({ success: true }),
    };
    console.log("[setup-simple.ts] window.skillAPI set");
  }
});
