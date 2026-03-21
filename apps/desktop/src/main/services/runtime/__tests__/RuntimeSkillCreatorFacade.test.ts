/**
 * RuntimeSkillCreatorFacade Unit Tests - 4 state capability bridge
 *
 * TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
 * Phase 4: 4状態ハンドリングテスト
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "../TerminalHandoffBuilder";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { ExecutionCapabilityInput } from "@repo/shared/types/execution-capability";

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

  describe("plan - 4状態ハンドリング", () => {
    it("integratedRuntime: plan 結果を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "integratedRuntime",
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);

      const input: ExecutionCapabilityInput = {
        apiKeyValid: true,
        subscriptionValid: false,
      };
      const result = await facade.plan("spec body", input);

      expect(result).toEqual({
        planId: "plan-1710000000000",
        skillSpec: "spec body",
        estimatedSteps: 3,
      });
    });

    it("terminalSurface: handoff bundle を返す", async () => {
      const handoffBundle = {
        launcher: "claude",
        promptBundle: "Skill を作成してください: spec body",
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "spec body"',
        manualRetryRule: "retry",
      };
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "terminalSurface",
        bundle: handoffBundle,
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue(
        handoffBundle,
      );

      const input: ExecutionCapabilityInput = {
        apiKeyValid: false,
        subscriptionValid: true,
      };
      const result = await facade.plan("spec body", input);

      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
    });

    it("both: デフォルトで integrated を使用する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "both",
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_000);

      const input: ExecutionCapabilityInput = {
        apiKeyValid: true,
        subscriptionValid: true,
      };
      const result = await facade.plan("spec body", input);

      expect(result).toEqual({
        planId: "plan-1710000000000",
        skillSpec: "spec body",
        estimatedSteps: 3,
      });
    });

    it("none: assertNoSilentFallback により到達しない", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockImplementation(
        () => {
          throw new Error(
            "[assertNoSilentFallback] capability が 'none' のとき integratedRuntime への暗黙遷移は禁止されています。",
          );
        },
      );

      const input: ExecutionCapabilityInput = {
        apiKeyValid: false,
        subscriptionValid: false,
      };
      await expect(facade.plan("spec body", input)).rejects.toThrow(
        "assertNoSilentFallback",
      );
    });
  });

  describe("execute - 4状態ハンドリング", () => {
    it("integratedRuntime: SkillExecutor に委譲する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "integratedRuntime",
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      executeMock.mockResolvedValue({
        executionId: "exec-001",
        success: true,
      });

      const input: ExecutionCapabilityInput = {
        apiKeyValid: true,
        subscriptionValid: false,
      };
      const result = await facade.execute(
        { planId: "plan-001", skillSpec: "my-skill\nbody", estimatedSteps: 3 },
        input,
      );

      expect(executeMock).toHaveBeenCalled();
      expect(result).toEqual({
        executeId: "exec-001",
        skillName: "my-skill",
        success: true,
        error: undefined,
      });
    });

    it("terminalSurface: handoff bundle を返し SkillExecutor を呼ばない", async () => {
      const handoffBundle = {
        launcher: "claude",
        promptBundle:
          "以下の Skill 実行を継続してください: long-skill-name\nbody",
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "execute"',
        manualRetryRule: "retry",
      };
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "terminalSurface",
        bundle: handoffBundle,
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue(
        handoffBundle,
      );

      const input: ExecutionCapabilityInput = {
        apiKeyValid: false,
        subscriptionValid: true,
      };
      const result = await facade.execute(
        {
          planId: "plan-002",
          skillSpec: "long-skill-name\nbody",
          estimatedSteps: 3,
        },
        input,
      );

      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
      expect(executeMock).not.toHaveBeenCalled();
    });

    it("both: integrated 経路を優先して SkillExecutor に委譲する", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "both",
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      executeMock.mockResolvedValue({
        executionId: "exec-002",
        success: false,
        error: { code: "EXECUTION_FAILED", message: "executor failed" },
      });

      const input: ExecutionCapabilityInput = {
        apiKeyValid: true,
        subscriptionValid: true,
      };
      const result = await facade.execute(
        {
          planId: "plan-002",
          skillSpec: "long-skill-name\nbody",
          estimatedSteps: 3,
        },
        input,
      );

      expect(executeMock).toHaveBeenCalledOnce();
      expect(result).toEqual({
        executeId: "exec-002",
        skillName: "long-skill-name",
        success: false,
        error: "executor failed",
      });
    });
  });

  describe("improve - 4状態ハンドリング", () => {
    it("terminalSurface: 改善 prompt を bundle 化する", async () => {
      const handoffBundle = {
        launcher: "claude",
        promptBundle: 'スキル "skill-a" を改善してください: feedback',
        cwd: process.cwd(),
        suggestedCommand: 'claude -p "improve"',
        manualRetryRule: "retry",
      };
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "terminalSurface",
        bundle: handoffBundle,
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue(
        handoffBundle,
      );

      const input: ExecutionCapabilityInput = {
        apiKeyValid: false,
        subscriptionValid: true,
      };
      const result = await facade.improve("skill-a", "feedback", input);

      expect(result).toEqual({
        type: "terminal_handoff",
        bundle: handoffBundle,
      });
    });

    it("integratedRuntime: 改善提案を返す", async () => {
      vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockReturnValue({
        capability: "integratedRuntime",
      } as ReturnType<RuntimePolicyResolver["resolve"]>);
      vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_001);

      const input: ExecutionCapabilityInput = {
        apiKeyValid: true,
        subscriptionValid: false,
      };
      const result = await facade.improve(
        "skill-b",
        "need better validation",
        input,
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
