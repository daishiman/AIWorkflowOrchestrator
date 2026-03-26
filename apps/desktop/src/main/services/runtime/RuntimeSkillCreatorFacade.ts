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
  RuntimeSkillCreatorExecuteResponse as SkillExecuteResponse,
  RuntimeSkillCreatorExecuteResult as SkillExecuteResult,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorImproveSuggestion,
  RuntimeSkillCreatorPlanResponse,
  RuntimeSkillCreatorPlanResult as SkillPlanResult,
  ApplyImprovementResult,
} from "@repo/shared/types";
import type { IAuthKeyService } from "../auth/types";
import type { ILLMAdapter } from "../../adapters/llm/types";
import type { ResourceLoader } from "../skill/ResourceLoader";
import type { SkillFileManager } from "../skill/SkillFileManager";
import type { SkillFileWriter } from "../skill/SkillFileWriter";
import { RuntimePolicyResolver } from "./RuntimePolicyResolver";
import {
  SkillCreatorWorkflowEngine,
  type SkillCreatorWorkflowSourceProvenance,
} from "./SkillCreatorWorkflowEngine";
import { TerminalHandoffBuilder } from "./TerminalHandoffBuilder";
import {
  PLAN_PROMPT_CONSTANTS,
  PLAN_RESPONSE_SCHEMA_INSTRUCTION,
} from "./planPromptConstants";
import {
  IMPROVE_PROMPT_CONSTANTS,
  IMPROVE_RESPONSE_SCHEMA_INSTRUCTION,
} from "./improvePromptConstants";

/** RuntimeSkillCreatorFacade の依存 */
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  workflowEngine?: SkillCreatorWorkflowEngine;
  resourceLoader?: ResourceLoader;
  skillFileManager?: SkillFileManager;
  skillFileWriter?: SkillFileWriter;
}

export class RuntimeSkillCreatorFacade {
  private readonly resolver: RuntimePolicyResolver;
  private readonly handoffBuilder: TerminalHandoffBuilder;
  private readonly skillExecutor: SkillExecutor;
  private readonly workflowEngine: SkillCreatorWorkflowEngine;
  private llmAdapter?: ILLMAdapter;
  private readonly resourceLoader?: ResourceLoader;
  private readonly skillFileManager?: SkillFileManager;
  private readonly skillFileWriter?: SkillFileWriter;

  constructor(deps: RuntimeSkillCreatorFacadeDeps) {
    this.skillExecutor = deps.skillExecutor;
    this.workflowEngine =
      deps.workflowEngine ?? new SkillCreatorWorkflowEngine();
    this.llmAdapter = deps.llmAdapter;
    this.resourceLoader = deps.resourceLoader;
    this.skillFileManager = deps.skillFileManager;
    this.skillFileWriter = deps.skillFileWriter;
    this.resolver = new RuntimePolicyResolver(
      deps.authKeyService,
      deps.subscriptionAuthProvider,
    );
    this.handoffBuilder = new TerminalHandoffBuilder();
  }

  /**
   * LLMAdapter を遅延注入する（Setter Injection — P34 準拠）。
   * LLMAdapterFactory.getAdapter() が非同期のため、コンストラクタ時点では
   * 注入できない。注入前は graceful degradation でスタブ応答を返す。
   * 冪等: 複数回呼び出した場合、最後に渡された adapter が使用される。
   *
   * @param adapter - 注入する ILLMAdapter インスタンス
   * @see P34 in .claude/rules/06-known-pitfalls.md
   */
  setLLMAdapter(adapter: ILLMAdapter): void {
    this.llmAdapter = adapter;
  }

  getWorkflowStateSnapshot(planId: string) {
    return this.workflowEngine.getWorkflowState(planId);
  }

  private resolveDecision(authMode: AuthMode, apiKey: string | null) {
    if (authMode === "api-key" && (!apiKey || apiKey.trim() === "")) {
      return this.resolver.resolveWithService(authMode);
    }
    return this.resolver.resolve(authMode, apiKey);
  }

  private buildSourceProvenance():
    | SkillCreatorWorkflowSourceProvenance
    | undefined {
    const resolvedSkillCreatorRoot =
      this.resourceLoader &&
      typeof this.resourceLoader.getBasePath === "function"
        ? this.resourceLoader.getBasePath()
        : undefined;
    if (!resolvedSkillCreatorRoot) {
      return undefined;
    }

    return { resolvedSkillCreatorRoot };
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
    const sourceProvenance = this.buildSourceProvenance();

    // Graceful degradation: llmAdapter/resourceLoader 未注入時はスタブ
    if (!this.llmAdapter || !this.resourceLoader) {
      const planResult = {
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
      this.workflowEngine.recordPlanResult(
        planResult,
        decision,
        sourceProvenance,
      );
      return planResult;
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

    const planResult = {
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
    this.workflowEngine.recordPlanResult(
      planResult,
      decision,
      sourceProvenance,
    );
    return planResult;
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
  ): Promise<SkillExecuteResponse> {
    const decision = await this.resolveDecision(authMode, apiKey);
    const sourceProvenance = this.buildSourceProvenance();

    if (decision.type === "terminal_handoff") {
      this.workflowEngine.recordExecuteHandoff(
        planResult,
        decision,
        decision.bundle,
        sourceProvenance,
      );
      return { type: "terminal_handoff", bundle: decision.bundle };
    }

    this.workflowEngine.recordExecuteStart(
      planResult,
      decision,
      sourceProvenance,
    );

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

    const executeResult: SkillExecuteResult = {
      executeId: response.executionId,
      skillName:
        planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
      success: response.success,
      error: response.error?.message,
    };
    this.workflowEngine.recordExecuteResult(planResult.planId, executeResult);
    return executeResult;
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
          prompt: `スキル "${skillName}" を改善してください: ${feedback}`,
          workingDirectory: process.cwd(),
        },
        "terminal_handoff",
      );
      return { type: "terminal_handoff", guidance };
    }

    // P42 準拠 3段バリデーション
    if (typeof skillName !== "string" || skillName.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "skillName must be a non-empty string",
        },
      };
    }
    if (typeof feedback !== "string" || feedback.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "feedback must be a non-empty string",
        },
      };
    }

    const improveId = `improve-${Date.now()}`;

    // Graceful degradation: llmAdapter/resourceLoader 未注入時はスタブ
    if (!this.llmAdapter || !this.resourceLoader) {
      return {
        improveId,
        suggestions: [],
      };
    }

    try {
      // SKILL.md 読み込み
      if (!this.skillFileManager) {
        return {
          success: false,
          error: {
            code: "READ_ERROR",
            message: "skillFileManager is not available",
          },
        };
      }
      const skillContent = await this.skillFileManager.readFile(
        skillName,
        "SKILL.md",
      );

      // プロンプト読み込み
      const agentPrompt = await this.resourceLoader.loadAgent(
        IMPROVE_PROMPT_CONSTANTS.AGENT_NAME,
      );

      // system プロンプト = improve-prompt.md + IMPROVE_RESPONSE_SCHEMA_INSTRUCTION
      const systemPrompt = `${agentPrompt}\n\n${IMPROVE_RESPONSE_SCHEMA_INSTRUCTION}`;

      // user プロンプト
      const userPrompt = buildImproveUserPrompt(feedback, skillContent);

      // LLM 呼び出し
      const response = await this.llmAdapter.sendChat({
        modelId: IMPROVE_PROMPT_CONSTANTS.DEFAULT_MODEL_ID,
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        maxTokens: IMPROVE_PROMPT_CONSTANTS.DEFAULT_MAX_TOKENS,
        temperature: IMPROVE_PROMPT_CONSTANTS.DEFAULT_TEMPERATURE,
      });

      // レスポンスパース
      const parseResult = parseImproveResponse(response.content);
      if (!parseResult.success) {
        return {
          success: false,
          error: { code: "PARSE_ERROR", message: parseResult.error },
        };
      }

      return {
        improveId,
        suggestions: parseResult.suggestions,
        revisedSpec: parseResult.revisedSpec,
      };
    } catch (error: unknown) {
      return handleImproveError(error);
    }
  }

  /**
   * 改善提案を SKILL.md に適用する。
   * before/after テキストによる文字列置換を順次適用。
   */
  async applyImprovement(
    skillName: string,
    suggestions: RuntimeSkillCreatorImproveSuggestion[],
  ): Promise<ApplyImprovementResult> {
    if (!this.skillFileManager) {
      return {
        applied: 0,
        skipped: 0,
        skippedDetails: [],
        errors: ["skillFileManager is not available"],
      };
    }

    let content = await this.skillFileManager.readFile(skillName, "SKILL.md");
    let applied = 0;
    let skipped = 0;
    const skippedDetails: Array<{ section: string; reason: string }> = [];
    const errors: string[] = [];

    for (const suggestion of suggestions) {
      if (content.includes(suggestion.before)) {
        content = content.replace(suggestion.before, suggestion.after);
        applied++;
      } else {
        skipped++;
        skippedDetails.push({
          section: suggestion.section,
          reason: `before text not found in SKILL.md`,
        });
      }
    }

    if (applied > 0) {
      try {
        await this.skillFileManager.writeFile(skillName, "SKILL.md", content);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Unknown write error";
        errors.push(errMsg);
      }
    }

    return { applied, skipped, skippedDetails, errors };
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

// --- improve() Helper functions ---

interface LLMImprovement {
  section: string;
  issue?: string;
  pattern?: string;
  before: string;
  after: string;
}

interface LLMImproveResponse {
  improvements: LLMImprovement[];
  improvedContent?: string;
}

interface ImproveParseSuccess {
  success: true;
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  revisedSpec?: string;
}

interface ImproveParseFailure {
  success: false;
  error: string;
}

type ImproveParseResult = ImproveParseSuccess | ImproveParseFailure;

export function buildImproveUserPrompt(
  feedback: string,
  skillContent: string,
): string {
  return `以下のスキルに対するフィードバックに基づいて、改善提案を生成してください。

## フィードバック
${feedback}

## 現在のSKILL.md
${skillContent}`;
}

/** LLM 改善提案の1件を RuntimeSkillCreatorImproveSuggestion に変換する */
function mapToSuggestion(
  raw: LLMImprovement,
): RuntimeSkillCreatorImproveSuggestion {
  const reason =
    [raw.issue, raw.pattern ? `(改善パターン: ${raw.pattern})` : ""]
      .filter(Boolean)
      .join(" ") || "改善理由の詳細は提供されていません";

  return {
    section: raw.section,
    before: raw.before,
    after: raw.after,
    reason,
  };
}

/** LLM レスポンスが有効な improve 形式かを検証する（P49: in 演算子使用） */
function isValidImproveResponse(value: unknown): value is LLMImproveResponse {
  if (value == null || typeof value !== "object") return false;
  if (!("improvements" in value) || !Array.isArray(value.improvements))
    return false;

  return value.improvements.every((item: unknown) => {
    if (item == null || typeof item !== "object") return false;
    if (!("section" in item) || typeof item.section !== "string") return false;
    if (!("before" in item) || typeof item.before !== "string") return false;
    if (!("after" in item) || typeof item.after !== "string") return false;
    // 空文字列 before は content.includes("") → 常に true となり
    // content.replace("", after) で先頭に不正挿入されるため拒否する
    if (item.before.trim() === "") return false;
    return true;
  });
}

/** LLM レスポンス文字列から改善提案をパースする */
export function parseImproveResponse(responseText: string): ImproveParseResult {
  try {
    const cleaned = stripMarkdownCodeBlock(responseText);
    const parsed: unknown = JSON.parse(cleaned);

    if (!isValidImproveResponse(parsed)) {
      return {
        success: false,
        error: "LLM response does not match expected improve schema",
      };
    }

    const suggestions = parsed.improvements.map(mapToSuggestion);
    return {
      success: true,
      suggestions,
      revisedSpec:
        "improvedContent" in parsed &&
        typeof parsed.improvedContent === "string"
          ? parsed.improvedContent
          : undefined,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown parse error";
    return { success: false, error: message };
  }
}

/** improve() のエラーをIPC wrapper形式に変換する */
function handleImproveError(
  error: unknown,
): RuntimeSkillCreatorImproveResponse {
  if (error instanceof Error) {
    const name = error.constructor.name;
    if (name === "SkillNotFoundError") {
      return {
        success: false,
        error: { code: "SKILL_NOT_FOUND", message: error.message },
      };
    }
    if (name === "FileNotFoundError") {
      return {
        success: false,
        error: { code: "READ_ERROR", message: error.message },
      };
    }
    if (name === "ReadonlySkillError") {
      return {
        success: false,
        error: { code: "READONLY_SKILL", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "LLM_ERROR", message: error.message },
    };
  }
  return {
    success: false,
    error: { code: "LLM_ERROR", message: "Unknown error" },
  };
}
