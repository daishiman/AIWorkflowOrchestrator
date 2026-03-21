/**
 * RuntimeSkillCreatorFacade - Runtime ルーティング対応の Skill Creator Facade
 *
 * TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
 *
 * Planner / Executor / Improver の 3 role を持つ。
 * decision.capability の4状態（integratedRuntime / terminalSurface / both / none）で分岐する。
 * 重要: internal role 名は IPC payload に含めない（TC-4-12, P44 準拠）。
 *
 * 既存の SkillCreatorService（TASK-9B-G）とは別クラス。
 * 既存クラスは Skill ファイル作成 Facade であり、本クラスは
 * runtime routing（capability bridge）を担う。
 */

import type {
  SkillExecutor,
  SkillExecutionRequest,
} from "../skill/SkillExecutor";
import type { ExecutionCapabilityInput } from "@repo/shared/types/execution-capability";
import type { IAuthKeyService } from "../auth/types";
import { RuntimePolicyResolver } from "./RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "./TerminalHandoffBuilder";

/** Planner role の出力 */
export interface SkillPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
}

/** Executor role の出力 */
export interface SkillExecuteResult {
  executeId: string;
  skillName: string;
  success: boolean;
  error?: string;
}

export interface RuntimeTerminalHandoffResult {
  type: "terminal_handoff";
  bundle: ReturnType<TerminalHandoffBuilder["build"]>;
}

/** Improver role の出力 */
export interface SkillImproveResult {
  improveId: string;
  suggestions: string[];
  revisedSpec?: string;
}

/** RuntimeSkillCreatorFacade の依存 */
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
}

export class RuntimeSkillCreatorFacade {
  private readonly resolver: RuntimePolicyResolver;
  private readonly handoffBuilder: TerminalHandoffBuilder;
  private readonly skillExecutor: SkillExecutor;

  constructor(deps: RuntimeSkillCreatorFacadeDeps) {
    this.skillExecutor = deps.skillExecutor;
    this.resolver = new RuntimePolicyResolver(deps.authKeyService);
    this.handoffBuilder = new TerminalHandoffBuilder();
  }

  /**
   * Planner role: スキル仕様を受け取り、実行計画を生成する。
   * IPC 外部名: "plan_result"
   */
  async plan(
    skillSpec: string,
    input: ExecutionCapabilityInput,
  ): Promise<SkillPlanResult | RuntimeTerminalHandoffResult> {
    const decision = this.resolver.resolve(input);

    switch (decision.capability) {
      case "terminalSurface": {
        const bundle = this.handoffBuilder.build(
          `Skill を作成してください: ${skillSpec}`,
          process.cwd(),
        );
        return { type: "terminal_handoff", bundle };
      }
      case "integratedRuntime":
      case "both": {
        const planId = `plan-${Date.now()}`;
        return { planId, skillSpec, estimatedSteps: 3 };
      }
      case "none":
        throw new Error(
          "Unreachable: capability 'none' は assertNoSilentFallback で阻止される",
        );
    }
  }

  /**
   * Executor role: 計画に基づき Skill を実行・生成する。
   * SkillExecutor に委譲する。
   * IPC 外部名: "execute_result"
   */
  async execute(
    planResult: SkillPlanResult,
    input: ExecutionCapabilityInput,
  ): Promise<SkillExecuteResult | RuntimeTerminalHandoffResult> {
    const decision = this.resolver.resolve(input);

    switch (decision.capability) {
      case "terminalSurface": {
        const bundle = this.handoffBuilder.build(
          `以下の Skill 実行を継続してください: ${planResult.skillSpec}`,
          process.cwd(),
        );
        return { type: "terminal_handoff", bundle };
      }
      case "integratedRuntime":
      case "both":
        break;
      case "none":
        throw new Error(
          "Unreachable: capability 'none' は assertNoSilentFallback で阻止される",
        );
    }

    const request: SkillExecutionRequest = {
      prompt: planResult.skillSpec,
      skillId: `creator-${planResult.planId}`,
    };

    const skillMeta = {
      id: `creator-${planResult.planId}`,
      name: "skill-creator-executor",
      slug: "skill-creator-executor",
      description: "RuntimeSkillCreatorFacade の Executor role",
      path: "",
      triggers: [],
      anchors: [],
      allowedTools: ["Read", "Edit", "Write"],
      content: planResult.skillSpec,
    };

    const response = await this.skillExecutor.execute(request, skillMeta);

    return {
      executeId: response.executionId,
      skillName:
        planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
      success: response.success,
      error: response.error?.message,
    };
  }

  /**
   * Improver role: 実行結果を分析し、改善提案を返す。
   * IPC 外部名: "improve_result"
   */
  async improve(
    skillName: string,
    feedback: string,
    input: ExecutionCapabilityInput,
  ): Promise<SkillImproveResult | RuntimeTerminalHandoffResult> {
    const decision = this.resolver.resolve(input);

    switch (decision.capability) {
      case "terminalSurface": {
        const bundle = this.handoffBuilder.build(
          `スキル "${skillName}" を改善してください: ${feedback}`,
          process.cwd(),
        );
        return { type: "terminal_handoff", bundle };
      }
      case "integratedRuntime":
      case "both": {
        const improveId = `improve-${Date.now()}`;
        return {
          improveId,
          suggestions: [
            "エラーハンドリングを強化してください",
            "入力バリデーションを追加してください",
          ],
        };
      }
      case "none":
        throw new Error(
          "Unreachable: capability 'none' は assertNoSilentFallback で阻止される",
        );
    }
  }
}
