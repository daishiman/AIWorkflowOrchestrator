/**
 * SkillExecutor - パフォーマンステスト
 *
 * TASK-3-1-B: Phase 9 品質保証
 * NFR-001: Hook処理10ms以内の検証
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserWindow } from "electron";
import { SkillExecutor } from "../SkillExecutor";

// BrowserWindowモック作成ヘルパー
function createMockBrowserWindow(): BrowserWindow {
  return {
    isDestroyed: vi.fn().mockReturnValue(false),
    webContents: {
      send: vi.fn(),
    },
  } as unknown as BrowserWindow;
}

describe("SkillExecutor - Performance", () => {
  let mockWindow: BrowserWindow;
  let executor: SkillExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindow = createMockBrowserWindow();
    executor = new SkillExecutor(mockWindow);
  });

  describe("PreToolUse Performance (NFR-001)", () => {
    it("should complete Bash check within 10ms", async () => {
      const hooks = executor.createHooks("perf-test");
      const iterations = 100;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        await hooks.PreToolUse(
          { toolName: "Bash", args: { command: "echo hello" } },
          `tool-${i}`,
          { signal: new AbortController().signal },
        );
      }
      const end = performance.now();

      const avgMs = (end - start) / iterations;
      console.log(`PreToolUse (Bash): ${avgMs.toFixed(4)}ms per call`);
      expect(avgMs).toBeLessThan(10);
    });

    it("should complete Write check within 10ms", async () => {
      const hooks = executor.createHooks("perf-test");
      const iterations = 100;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        await hooks.PreToolUse(
          { toolName: "Write", args: { path: "/tmp/test.txt" } },
          `tool-${i}`,
          { signal: new AbortController().signal },
        );
      }
      const end = performance.now();

      const avgMs = (end - start) / iterations;
      console.log(`PreToolUse (Write): ${avgMs.toFixed(4)}ms per call`);
      expect(avgMs).toBeLessThan(10);
    });
  });

  describe("PostToolUse Performance (NFR-001)", () => {
    it("should complete within 10ms", async () => {
      const hooks = executor.createHooks("perf-test");
      const iterations = 100;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        await hooks.PostToolUse(
          { toolName: "Bash", result: { output: "hello" } },
          `tool-${i}`,
          { signal: new AbortController().signal },
        );
      }
      const end = performance.now();

      const avgMs = (end - start) / iterations;
      console.log(`PostToolUse: ${avgMs.toFixed(4)}ms per call`);
      expect(avgMs).toBeLessThan(10);
    });
  });

  describe("categorizeError Performance", () => {
    it("should complete within 1ms", () => {
      const error = new Error("network connection failed");
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        executor.categorizeError(error);
      }
      const end = performance.now();

      const avgMs = (end - start) / iterations;
      console.log(`categorizeError: ${avgMs.toFixed(4)}ms per call`);
      expect(avgMs).toBeLessThan(1);
    });
  });

  describe("isRetryable Performance", () => {
    it("should complete within 1ms", () => {
      const error = new Error("network connection failed");
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        executor.isRetryable(error);
      }
      const end = performance.now();

      const avgMs = (end - start) / iterations;
      console.log(`isRetryable: ${avgMs.toFixed(4)}ms per call`);
      expect(avgMs).toBeLessThan(1);
    });
  });
});
