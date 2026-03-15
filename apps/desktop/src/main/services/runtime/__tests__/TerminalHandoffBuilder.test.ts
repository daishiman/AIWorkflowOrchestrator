/**
 * TerminalHandoffBuilder Unit Tests
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * test-matrix.md TC-4-07〜TC-4-10 に対応
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";

describe("TerminalHandoffBuilder", () => {
  let builder: TerminalHandoffBuilder;

  beforeEach(() => {
    builder = new TerminalHandoffBuilder();
  });

  describe("TC-4-07: 基本的なbundleの構築", () => {
    it("should build a valid TerminalHandoffBundle", () => {
      const bundle = builder.build("テストプロンプト", "/home/user/project");
      expect(bundle.launcher).toBe("claude");
      expect(bundle.promptBundle).toBe("テストプロンプト");
      expect(bundle.cwd).toBe("/home/user/project");
      expect(bundle.suggestedCommand).toContain("claude -p");
      expect(bundle.manualRetryRule).toBeTruthy();
    });
  });

  describe("TC-4-08: shell injection 対策", () => {
    it("should escape double quotes in prompt", () => {
      const bundle = builder.build('He said "hello"', "/path");
      expect(bundle.suggestedCommand).not.toContain('"hello"');
      expect(bundle.promptBundle).toContain('\\"hello\\"');
    });

    it("should escape backslash in prompt", () => {
      const bundle = builder.build("path\\to\\file", "/path");
      expect(bundle.promptBundle).toContain("\\\\");
    });

    it("should escape dollar sign in prompt", () => {
      const bundle = builder.build("Price: $100", "/path");
      expect(bundle.promptBundle).toContain("\\$100");
    });

    it("should escape backtick in prompt", () => {
      const bundle = builder.build("`dangerous`", "/path");
      expect(bundle.promptBundle).toContain("\\`dangerous\\`");
    });

    it("should produce safe suggestedCommand", () => {
      const bundle = builder.build('say "hi" && rm -rf /', "/path");
      // The suggestedCommand should not allow command injection
      // double quotes inside should be escaped
      expect(bundle.suggestedCommand).toContain('\\"hi\\"');
    });
  });

  describe("TC-4-09: runbook オプション", () => {
    it("should include runbook when provided", () => {
      const bundle = builder.build("prompt", "/path", {
        runbook: "Step 1: do this\nStep 2: do that",
      });
      expect(bundle.runbook).toBe("Step 1: do this\nStep 2: do that");
    });

    it("should have undefined runbook when not provided", () => {
      const bundle = builder.build("prompt", "/path");
      expect(bundle.runbook).toBeUndefined();
    });
  });

  describe("TC-4-10: suggestedCommand の形式", () => {
    it('should format suggestedCommand as claude -p "..."', () => {
      const bundle = builder.build("simple prompt", "/path");
      expect(bundle.suggestedCommand).toBe('claude -p "simple prompt"');
    });
  });
});
