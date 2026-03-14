/**
 * RuntimeSkillCreatorFacade - Runtime ルーティング対応の Skill Creator Facade
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 *
 * Planner / Executor / Improver の 3 role を持つ。
 * 重要: internal role 名は IPC payload に含めない（TC-4-12, P44 準拠）。
 *
 * 既存の SkillCreatorService（TASK-9B-G）とは別クラス。
 * 既存クラスは Skill ファイル作成 Facade であり、本クラスは
 * runtime routing（integrated_api / terminal_handoff）を担う。
 */

import type {
  SkillExecutor,
  SkillExecutionRequest,
} from "../skill/SkillExecutor";
import type { AuthMode } from "@repo/shared/types/auth-mode";
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
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<
    | SkillPlanResult
    | {
        type: "terminal_handoff";
        bundle: ReturnType<TerminalHandoffBuilder["build"]>;
      }
  > {
    const decision = await this.resolver.resolve(authMode, apiKey);

    if (decision.type === "terminal_handoff") {
      const bundle = this.handoffBuilder.build(
        `Skill を作成してください: ${skillSpec}`,
        process.cwd(),
      );
      return { type: "terminal_handoff", bundle };
    }

    // integrated_api: 計画を生成
    const planId = `plan-${Date.now()}`;
    return {
      planId,
      skillSpec,
      estimatedSteps: 3,
    };
  }

  /**
   * Executor role: 計画に基づき Skill を実行・生成する。
   * SkillExecutor に委譲する。
   * IPC 外部名: "execute_result"
   */
  async execute(
    planResult: SkillPlanResult,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<SkillExecuteResult> {
    const decision = await this.resolver.resolve(authMode, apiKey);

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

    const response = await this.skillExecutor.execute(
      request,
      skillMeta,
      decision,
    );

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
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<
    | SkillImproveResult
    | {
        type: "terminal_handoff";
        bundle: ReturnType<TerminalHandoffBuilder["build"]>;
      }
  > {
    const decision = await this.resolver.resolve(authMode, apiKey);

    if (decision.type === "terminal_handoff") {
      const bundle = this.handoffBuilder.build(
        `スキル "${skillName}" を改善してください: ${feedback}`,
        process.cwd(),
      );
      return { type: "terminal_handoff", bundle };
    }

    // integrated_api: 改善提案を生成
    const improveId = `improve-${Date.now()}`;
    return {
      improveId,
      suggestions: [
        "エラーハンドリングを強化してください",
        "入力バリデーションを追加してください",
      ],
    };
  }
}
