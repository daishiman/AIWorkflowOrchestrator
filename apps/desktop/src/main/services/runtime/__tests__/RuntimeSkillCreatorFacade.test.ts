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
    it("terminal_handoff 判定時は builder の結果を返す", async () => {
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
      const handoffBundle = {
        launcher: "claude",
        promptBundle: "Skill を作成してください: spec body",
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "spec body"',
        manualRetryRule: "retry",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "build")
        .mockReturnValue(handoffBundle);

      const result = await facade.plan("spec body", "subscription", null);

      expect(resolveSpy).toHaveBeenCalledWith("subscription", null);
      expect(buildSpy).toHaveBeenCalledWith(
        "Skill を作成してください: spec body",
        process.cwd(),
      );
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
    });

    it("integrated_api 判定時は plan 結果を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);
      const buildSpy = vi.spyOn(TerminalHandoffBuilder.prototype, "build");

      const result = await facade.plan("line-1\nline-2", "api-key", "sk-test");

      expect(buildSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        planId: "plan-1710000000000",
        skillSpec: "line-1\nline-2",
        estimatedSteps: 3,
        skillName: "",
        description: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
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
        skillName: "",
        description: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
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
        .spyOn(TerminalHandoffBuilder.prototype, "build")
        .mockReturnValue({
          launcher: "claude",
          promptBundle: "prompt",
          cwd: process.cwd(),
          suggestedCommand: "cmd",
          manualRetryRule: "retry",
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
        type: "integrated_api",
        apiKey: "sk-test",
        permissionMode: "default",
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
        "api-key",
        "sk-test",
      );

      expect(result).toEqual({
        executeId: "exec-002",
        skillName: longSkillName.substring(0, 50),
        success: false,
        error: "executor failed",
      });
    });

    it("terminal_handoff 判定時は builder の結果を返す", async () => {
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
      const handoffBundle = {
        launcher: "claude",
        promptBundle: "Skill を実行してください: my-skill\nbody",
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "execute"',
        manualRetryRule: "retry",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "build")
        .mockReturnValue(handoffBundle);

      const result = await facade.execute(
        {
          planId: "plan-003",
          skillSpec: "my-skill\nbody",
          estimatedSteps: 3,
        },
        "subscription",
        null,
      );

      expect(buildSpy).toHaveBeenCalledWith("my-skill\nbody", process.cwd());
      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返す場合", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      ).mockResolvedValue({
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
        .spyOn(TerminalHandoffBuilder.prototype, "build")
        .mockReturnValue({
          launcher: "claude",
          promptBundle: "prompt",
          cwd: process.cwd(),
          suggestedCommand: "cmd",
          manualRetryRule: "retry",
        });

      const result = await facade.execute(
        {
          planId: "plan-004",
          skillSpec: "spec",
          estimatedSteps: 3,
        },
        "api-key",
        null,
      );

      expect(buildSpy).toHaveBeenCalled();
      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toHaveProperty("type", "terminal_handoff");
    });

    it("明示的 apiKey 指定でも terminal_handoff は正しく返る", async () => {
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
      const handoffBundle = {
        launcher: "claude",
        promptBundle: "spec body",
        cwd: process.cwd(),
        suggestedCommand: "cmd",
        manualRetryRule: "retry",
      };
      vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue(
        handoffBundle,
      );

      const result = await facade.execute(
        {
          planId: "plan-005",
          skillSpec: "spec body",
          estimatedSteps: 3,
        },
        "api-key",
        "explicit-key",
      );

      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が integrated_api を返す場合は executor に委譲する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      ).mockResolvedValue({
        type: "integrated_api",
        apiKey: "stored-key",
        permissionMode: "default",
      });
      executeMock.mockResolvedValue({
        executionId: "exec-006",
        success: true,
      });
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_006);

      const result = await facade.execute(
        {
          planId: "plan-006",
          skillSpec: "spec body",
          estimatedSteps: 3,
        },
        "api-key",
        null,
      );

      expect(executeMock).toHaveBeenCalled();
      expect(result).toEqual({
        executeId: "exec-006",
        skillName: "spec body",
        success: true,
        error: undefined,
      });
    });

    it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返す場合は build 引数が正しい", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
      vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      ).mockResolvedValue({
        type: "terminal_handoff",
        bundle: {
          launcher: "claude",
          promptBundle: "",
          cwd: "/tmp",
          suggestedCommand: 'claude -p "fallback"',
          manualRetryRule: "retry",
        },
      });
      const handoffBundle = {
        launcher: "claude",
        promptBundle: "stored-spec",
        cwd: process.cwd(),
        suggestedCommand: "cmd",
        manualRetryRule: "retry",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "build")
        .mockReturnValue(handoffBundle);

      const result = await facade.execute(
        {
          planId: "plan-007",
          skillSpec: "stored-spec",
          estimatedSteps: 3,
        },
        "api-key",
        null,
      );

      expect(buildSpy).toHaveBeenCalledWith("stored-spec", process.cwd());
      expect(executeMock).not.toHaveBeenCalled();
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
    });

    it("明示的 apiKey が渡された場合は resolveWithService を使わない", async () => {
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
      const resolveWithServiceSpy = vi.spyOn(
        RuntimePolicyResolver.prototype,
        "resolveWithService",
      );
      vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue({
        launcher: "claude",
        promptBundle: "spec",
        cwd: process.cwd(),
        suggestedCommand: "cmd",
        manualRetryRule: "retry",
      });

      await facade.execute(
        {
          planId: "plan-008",
          skillSpec: "spec",
          estimatedSteps: 3,
        },
        "api-key",
        "explicit-key",
      );

      expect(resolveSpy).toHaveBeenCalledWith("api-key", "explicit-key");
      expect(resolveWithServiceSpy).not.toHaveBeenCalled();
      expect(executeMock).not.toHaveBeenCalled();
    });
  });

  describe("improve", () => {
    it("terminal_handoff 判定時は改善 prompt を bundle 化する", async () => {
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
      const handoffBundle = {
        launcher: "claude",
        promptBundle: 'スキル "skill-a" を改善してください: feedback',
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "improve"',
        manualRetryRule: "retry",
      };
      const buildSpy = vi
        .spyOn(TerminalHandoffBuilder.prototype, "build")
        .mockReturnValue(handoffBundle);

      const result = await facade.improve(
        "skill-a",
        "feedback",
        "subscription",
        null,
      );

      expect(buildSpy).toHaveBeenCalledWith(
        'スキル "skill-a" を改善してください: feedback',
        process.cwd(),
      );
      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
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
