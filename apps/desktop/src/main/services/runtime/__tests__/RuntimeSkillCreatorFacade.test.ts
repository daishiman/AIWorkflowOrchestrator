/**
 * RuntimeSkillCreatorFacade Unit Tests
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * task-imp-runtime-skill-creator-facade-test-coverage-001 に対応
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import type { SkillExecutor } from "../../skill/SkillExecutor";

describe("RuntimeSkillCreatorFacade", () => {
  let executeMock: ReturnType<typeof vi.fn>;
  let facade: RuntimeSkillCreatorFacade;

  beforeEach(() => {
    executeMock = vi.fn();
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: {
        execute: executeMock,
      } as unknown as SkillExecutor,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("plan", () => {
    it("terminal_handoff 判定時は buildForSurface の結果を返す", async () => {
      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "terminal_handoff",
          bundle: {
            launcher: "claude",
            promptBundle: "",
            cwd: "/tmp",
            suggestedCommand: 'claude -p "fallback"',
            manualRetryRule: "retry",
          },
        });
      const handoffGuidance = {
        terminalCommand: 'claude -p "Skill を作成してください: spec body"',
        contextSummary: "surface=skill skill=unknown",
        reason: "terminal_handoff",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "buildForSurface")
        .mockReturnValue(handoffGuidance);

      const result = await facade.plan("spec body", "subscription", null);

      expect(resolveSpy).toHaveBeenCalledWith("subscription", null);
      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          surfaceType: "runtime",
          runtimeType: "skill",
          prompt: "Skill を作成してください: spec body",
        }),
        "terminal_handoff",
      );
      expect(result).toEqual({
        type: "terminal_handoff",
        guidance: handoffGuidance,
      });
    });

    it("integrated_api 判定時は plan 結果を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);
      const buildSpy = vi.spyOn(
        TerminalHandoffBuilder.prototype,
        "buildForSurface",
      );

      const result = await facade.plan("line-1\nline-2", "api-key", "sk-test");

      expect(buildSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        planId: "plan-1710000000000",
        skillSpec: "line-1\nline-2",
        estimatedSteps: 3,
      });
    });

    it("apiKey 未指定の api-key モードでは authKeyService 経由の解決を使う", async () => {
      const resolveSpy = vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      const resolveWithServiceSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolveWithService")
        .mockResolvedValue({
          type: "integrated_api",
          apiKey: "stored-key",
          permissionMode: "default",
        });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_010);

      const result = await facade.plan("spec body", "api-key", null);

      expect(resolveSpy).not.toHaveBeenCalled();
      expect(resolveWithServiceSpy).toHaveBeenCalledWith("api-key");
      expect(result).toEqual({
        planId: "plan-1710000000010",
        skillSpec: "spec body",
        estimatedSteps: 3,
      });
    });

    it("apiKey 未指定の api-key モードで stored key がない場合は terminal_handoff", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      const resolveWithServiceSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolveWithService")
        .mockResolvedValue({
          type: "terminal_handoff",
          bundle: {
            launcher: "claude",
            promptBundle: "",
            cwd: "/tmp",
            suggestedCommand: 'claude -p "fallback"',
            manualRetryRule: "retry",
          },
        });
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "buildForSurface")
        .mockReturnValue({
          terminalCommand: 'claude -p "spec"',
          contextSummary: "surface=skill skill=unknown",
          reason: "terminal_handoff",
        });

      const result = await facade.plan("spec", "api-key", null);

      expect(resolveWithServiceSpy).toHaveBeenCalledWith("api-key");
      expect(buildSpy).toHaveBeenCalled();
      expect(result).toHaveProperty("type", "terminal_handoff");
    });

    it("明示的 apiKey が渡された場合は resolveWithService を使わない", async () => {
      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "integrated_api",
          apiKey: "explicit-key",
          permissionMode: "default",
        });
      const resolveWithServiceSpy = vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      );
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_020);

      await facade.plan("spec", "api-key", "explicit-key");

      expect(resolveSpy).toHaveBeenCalledWith("api-key", "explicit-key");
      expect(resolveWithServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe("execute", () => {
    it("SkillExecutor に request と metadata を委譲し、成功結果を返す", async () => {
      const resolveSpy = vi
        .spyOn(RuntimePolicyResolver.prototype, "resolve")
        .mockResolvedValue({
          type: "integrated_api",
          apiKey: "sk-test",
          permissionMode: "default",
        });
      executeMock.mockResolvedValue({
        executionId: "exec-001",
        success: true,
      });

      const result = await facade.execute(
        {
          planId: "plan-001",
          skillSpec: "my-skill\nbody",
          estimatedSteps: 3,
        },
        "api-key",
        "sk-test",
      );

      expect(resolveSpy).toHaveBeenCalledWith("api-key", "sk-test");
      expect(executeMock).toHaveBeenCalledWith(
        {
          prompt: "my-skill\nbody",
          skillId: "creator-plan-001",
        },
        expect.objectContaining({
          id: "creator-plan-001",
          name: "skill-creator-executor",
          slug: "skill-creator-executor",
          content: "my-skill\nbody",
          allowedTools: ["Read", "Edit", "Write"],
        }),
      );
      expect(result).toEqual({
        executeId: "exec-001",
        skillName: "my-skill",
        success: true,
        error: undefined,
      });
    });

    it("SkillExecutor のエラーを message に変換し、skillName を 50 文字に切り詰める", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      executeMock.mockResolvedValue({
        executionId: "exec-002",
        success: false,
        error: {
          code: "EXECUTION_FAILED",
          message: "executor failed",
        },
      });
      const longSkillName =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-suffix";

      const result = await facade.execute(
        {
          planId: "plan-002",
          skillSpec: `${longSkillName}\nbody`,
          estimatedSteps: 3,
        },
        "subscription",
        null,
      );

      expect(result).toEqual({
        executeId: "exec-002",
        skillName: longSkillName.substring(0, 50),
        success: false,
        error: "executor failed",
      });
    });
  });

  describe("improve", () => {
    it("terminal_handoff 判定時は改善 prompt を guidance 化する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      const handoffGuidance = {
        terminalCommand:
          'claude -p "スキル \\"skill-a\\" を改善してください: feedback"',
        contextSummary: "surface=skill skill=skill-a",
        reason: "terminal_handoff",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "buildForSurface")
        .mockReturnValue(handoffGuidance);

      const result = await facade.improve(
        "skill-a",
        "feedback",
        "subscription",
        null,
      );

      expect(buildSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          surfaceType: "runtime",
          runtimeType: "skill",
          skillName: "skill-a",
          prompt: 'スキル "skill-a" を改善してください: feedback',
        }),
        "terminal_handoff",
      );
      expect(result).toEqual({
        type: "terminal_handoff",
        guidance: handoffGuidance,
      });
    });

    it("integrated_api 判定時は改善提案を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_001);

      const result = await facade.improve(
        "skill-b",
        "need better validation",
        "api-key",
        "sk-test",
      );

      expect(result).toEqual({
        improveId: "improve-1710000000001",
        suggestions: [
          "エラーハンドリングを強化してください",
          "入力バリデーションを追加してください",
        ],
      });
    });
  });
});
