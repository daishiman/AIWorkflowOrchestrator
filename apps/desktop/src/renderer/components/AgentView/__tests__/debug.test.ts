// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

describe("Debug test", () => {
  it("should have window.skillAPI", () => {
    console.log("window:", typeof window);
    console.log("window.skillAPI:", typeof (window as any).skillAPI);
    console.log(
      "window.skillAPI?.onStream:",
      typeof (window as any).skillAPI?.onStream,
    );
    expect(true).toBe(true);
  });
});
