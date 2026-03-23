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
import type {
  AuthMode,
  ISubscriptionAuthProvider,
} from "@repo/shared/types/auth-mode";
import type {
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorPlanResponse,
  RuntimeSkillCreatorPlanResult as SkillPlanResult,
} from "@repo/shared/types";
import type { IAuthKeyService } from "../auth/types";
import type { ILLMAdapter } from "../../adapters/llm/types";
import type { ResourceLoader } from "../skill/ResourceLoader";
import type { SkillFileWriter } from "../skill/SkillFileWriter";
import type { SkillGeneratedContent } from "@repo/shared/types";
import { RuntimePolicyResolver } from "./RuntimePolicyResolver";
import { TerminalHandoffBuilder } from "./TerminalHandoffBuilder";
import {
  PLAN_PROMPT_CONSTANTS,
  PLAN_RESPONSE_SCHEMA_INSTRUCTION,
} from "./planPromptConstants";

/** RuntimeSkillCreatorFacade の依存 */
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileWriter?: SkillFileWriter;
}

export class RuntimeSkillCreatorFacade {
  private readonly resolver: RuntimePolicyResolver;
  private readonly handoffBuilder: TerminalHandoffBuilder;
  private readonly skillExecutor: SkillExecutor;
  private readonly llmAdapter?: ILLMAdapter;
  private readonly resourceLoader?: ResourceLoader;
  private readonly skillFileWriter?: SkillFileWriter;

  constructor(deps: RuntimeSkillCreatorFacadeDeps) {
    this.skillExecutor = deps.skillExecutor;
    this.llmAdapter = deps.llmAdapter;
    this.resourceLoader = deps.resourceLoader;
    this.skillFileWriter = deps.skillFileWriter;
    this.resolver = new RuntimePolicyResolver(
      deps.authKeyService,
      deps.subscriptionAuthProvider,
    );
    this.handoffBuilder = new TerminalHandoffBuilder();
  }

  private resolveDecision(authMode: AuthMode, apiKey: string | null) {
    if (authMode === "api-key" && (!apiKey || apiKey.trim() === "")) {
      return this.resolver.resolveWithService(authMode);
    }
    return this.resolver.resolve(authMode, apiKey);
  }

  /**
   * Planner role: スキル仕様を受け取り、実行計画を生成する。
   * Public IPC: "skill-creator:plan"
   */
  async plan(
    skillSpec: string,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorPlanResponse> {
    const decision = await this.resolveDecision(authMode, apiKey);

    if (decision.type === "terminal_handoff") {
      // terminal_handoff 経路ではバリデーションスキップ（handoff側が処理）
      const guidance = this.handoffBuilder.buildForSurface(
        {
          surfaceType: "runtime",
          runtimeType: "skill",
          prompt: `Skill を作成してください: ${skillSpec}`,
          workingDirectory: process.cwd(),
        },
        "terminal_handoff",
      );
      return { type: "terminal_handoff", guidance };
    }

    // integrated_api: 入力バリデーション（P42 準拠3段バリデーション）
    if (typeof skillSpec !== "string" || skillSpec.trim() === "") {
      throw new Error("skillSpec must be a non-empty string");
    }

    // integrated_api: LLM で計画を生成
    const planId = `plan-${Date.now()}`;

    // Graceful degradation: llmAdapter/resourceLoader 未注入時はスタブ
    if (!this.llmAdapter || !this.resourceLoader) {
      return {
        planId,
        skillSpec,
        estimatedSteps: 3,
        skillName: "",
        description: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      };
    }

    // agent 仕様書を読み込む
    const agentSpecs: Array<{ name: string; content: string }> = [];
    for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES) {
      const content = await this.resourceLoader.loadAgent(name);
      agentSpecs.push({ name, content });
    }

    // LLM 呼び出し
    const systemPrompt = buildPlanSystemPrompt(agentSpecs);
    const response = await this.llmAdapter.sendChat({
      modelId: PLAN_PROMPT_CONSTANTS.DEFAULT_MODEL_ID,
      systemPrompt,
      messages: [{ role: "user", content: skillSpec }],
      maxTokens: PLAN_PROMPT_CONSTANTS.DEFAULT_MAX_TOKENS,
      temperature: PLAN_PROMPT_CONSTANTS.DEFAULT_TEMPERATURE,
    });

    // レスポンスパース
    const parsed = parsePlanResponse(response.content);

    return {
      planId,
      skillSpec,
      estimatedSteps: parsed.agents.length + parsed.scripts.length,
      skillName: parsed.skillName,
      description: parsed.description,
      agents: parsed.agents,
      scripts: parsed.scripts,
      triggers: parsed.triggers,
      anchors: parsed.anchors,
    };
  }

  /**
   * Executor role: 計画に基づき Skill を実行・生成する。
   * SkillExecutor に委譲する。
   * Public IPC: "skill-creator:execute-plan"
   */
  async execute(
    planResult: SkillPlanResult,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorExecuteResponse> {
    const decision = await this.resolveDecision(authMode, apiKey);

    if (decision.type === "terminal_handoff") {
      const bundle = this.handoffBuilder.build(
        planResult.skillSpec,
        process.cwd(),
      );
      return { type: "terminal_handoff", bundle };
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

    const skillName =
      planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed";

    // SkillFileWriter が注入されている場合、LLM 生成コンテンツを永続化
    if (response.success && this.skillFileWriter) {
      try {
        const generatedContent = this.extractGeneratedContent(planResult);
        await this.skillFileWriter.persist(skillName, generatedContent);
      } catch (err: unknown) {
        const errorMessage =
          err != null && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to persist skill files";
        return {
          executeId: response.executionId,
          skillName,
          success: false,
          error: `Skill execution succeeded but file persistence failed: ${errorMessage}`,
        };
      }
    }

    return {
      executeId: response.executionId,
      skillName,
      success: response.success,
      error: response.error?.message,
    };
  }

  private extractGeneratedContent(
    planResult: SkillPlanResult,
  ): SkillGeneratedContent {
    const agentEntries = planResult.agents.map((a) => ({
      name: a.name,
      content: `# ${a.name}\n\n${a.role}`,
    }));

    const scriptEntries = planResult.scripts.map((s) => ({
      name: s.name,
      content: `// ${s.name}\n// ${s.purpose}`,
    }));

    return {
      skillMd: [
        `# ${planResult.skillName || "Unnamed Skill"}`,
        "",
        planResult.description || "",
        "",
        planResult.triggers.length > 0
          ? `Trigger: ${planResult.triggers.join(", ")}`
          : "",
        planResult.anchors.length > 0
          ? `Anchors: ${planResult.anchors.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      agents: agentEntries,
      scripts: scriptEntries,
      references: [],
    };
  }

  /**
   * Improver role: 実行結果を分析し、改善提案を返す。
   * Public IPC: "skill-creator:improve-skill"
   */
  async improve(
    skillName: string,
    feedback: string,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorImproveResponse> {
    const decision = await this.resolveDecision(authMode, apiKey);

    if (decision.type === "terminal_handoff") {
      const guidance = this.handoffBuilder.buildForSurface(
        {
          surfaceType: "runtime",
          runtimeType: "skill",
          skillName,
          prompt: `スキル "${skillName}" を改善してください: ${feedback}`,
          workingDirectory: process.cwd(),
        },
        "terminal_handoff",
      );
      return { type: "terminal_handoff", guidance };
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

// --- Helper functions (module-scope, exported for testing) ---

interface LLMPlanResponse {
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}

export function buildPlanSystemPrompt(
  agentSpecs: Array<{ name: string; content: string }>,
): string {
  const agentSections = agentSpecs
    .map(
      ({ name, content }) =>
        `${PLAN_PROMPT_CONSTANTS.AGENT_SEPARATOR_START} ${name} ===\n${content}\n${PLAN_PROMPT_CONSTANTS.AGENT_SEPARATOR_END} ${name} ===`,
    )
    .join("\n\n");

  return `${agentSections}\n\n${PLAN_RESPONSE_SCHEMA_INSTRUCTION}`;
}

/** Markdownコードブロック（```json ... ``` や ``` ... ```）を除去する */
function stripMarkdownCodeBlock(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n\s*```$/);
  return match ? match[1].trim() : trimmed;
}

export function parsePlanResponse(responseText: string): LLMPlanResponse {
  // LLM がMarkdownコードブロックで囲む場合があるため strip する
  const cleaned = stripMarkdownCodeBlock(responseText);
  const parsed: unknown = JSON.parse(cleaned);

  if (!isValidPlanResponse(parsed)) {
    throw new Error("LLM response does not match expected plan schema");
  }

  return parsed;
}

function isValidArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isValidAgentEntry(
  entry: unknown,
): entry is { name: string; role: string } {
  return (
    entry != null &&
    typeof entry === "object" &&
    "name" in entry &&
    typeof entry.name === "string" &&
    entry.name.trim() !== "" &&
    "role" in entry &&
    typeof entry.role === "string" &&
    entry.role.trim() !== ""
  );
}

function isValidScriptEntry(
  entry: unknown,
): entry is { name: string; purpose: string } {
  return (
    entry != null &&
    typeof entry === "object" &&
    "name" in entry &&
    typeof entry.name === "string" &&
    entry.name.trim() !== "" &&
    "purpose" in entry &&
    typeof entry.purpose === "string" &&
    entry.purpose.trim() !== ""
  );
}

function isValidPlanResponse(value: unknown): value is LLMPlanResponse {
  if (value == null || typeof value !== "object") return false;

  if (!("skillName" in value) || typeof value.skillName !== "string")
    return false;
  if (value.skillName.trim() === "") return false;

  if (!("description" in value) || typeof value.description !== "string")
    return false;
  if (value.description.trim() === "") return false;

  if (!("agents" in value) || !Array.isArray(value.agents)) return false;
  if (value.agents.length === 0) return false;
  if (!value.agents.every(isValidAgentEntry)) return false;

  if (!("scripts" in value) || !Array.isArray(value.scripts)) return false;
  if (!value.scripts.every(isValidScriptEntry)) return false;

  if (!("triggers" in value) || !isValidArrayOfStrings(value.triggers))
    return false;

  if (!("anchors" in value) || !isValidArrayOfStrings(value.anchors))
    return false;

  return true;
}
