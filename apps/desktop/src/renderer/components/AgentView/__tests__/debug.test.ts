// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

describe("Debug test", () => {
  it("should have window.electronAPI.skill", () => {
    console.log("window:", typeof window);
    console.log(
      "window.electronAPI?.skill:",
      typeof (window as any).electronAPI?.skill,
    );
    console.log(
      "window.electronAPI?.skill?.onStream:",
      typeof (window as any).electronAPI?.skill?.onStream,
    );
    expect(true).toBe(true);
  });
});
