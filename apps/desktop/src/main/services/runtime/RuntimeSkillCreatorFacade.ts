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

import fs from "fs/promises";
import path from "path";
import {
  normalizeSdkMessage,
  normalizeSdkStream,
  type NormalizerContext,
} from "./sdkMessageNormalizer";
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
  RuntimeSkillCreatorDegradedReason,
  RuntimeSkillCreatorReverifyResponse,
  RuntimeSkillCreatorPlanResult as SkillPlanResult,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
  RuntimeSkillCreatorVerifyDetailResponse,
  ApplyImprovementResult,
  LoadedWorkflowManifest,
  SkillCreatorSdkEvent,
  SkillCreatorSdkPermissionDenial,
  LLMAdapterStatus,
  RuntimeSkillCreatorVerifyAndImproveResult,
  RuntimeSkillCreatorVerifyCheck,
  SkillCreatorSessionListItem,
} from "@repo/shared/types";
import {
  SKILL_CREATOR_ENGINE_VERSION,
  SESSION_TTL_MS,
} from "@repo/shared/types";
import type { IAuthKeyService } from "../auth/types";
import type { ILLMAdapter } from "../../adapters/llm/types";
import type { ResourceLoader } from "../skill/ResourceLoader";
import type { SkillFileManager } from "../skill/SkillFileManager";
import type { SkillFileWriter } from "../skill/SkillFileWriter";
import { RuntimePolicyResolver } from "./RuntimePolicyResolver";
import { ManifestLoader } from "./ManifestLoader";
import {
  SkillCreatorWorkflowEngine,
  type SkillCreatorWorkflowSourceProvenance,
} from "./SkillCreatorWorkflowEngine";
import { TerminalHandoffBuilder } from "./TerminalHandoffBuilder";
import {
  PLAN_RESOURCE_REQUESTS,
  PLAN_PROMPT_CONSTANTS,
  PLAN_RESPONSE_SCHEMA_INSTRUCTION,
} from "./planPromptConstants";
import {
  IMPROVE_RESOURCE_REQUESTS,
  IMPROVE_PROMPT_CONSTANTS,
  IMPROVE_RESPONSE_SCHEMA_INSTRUCTION,
} from "./improvePromptConstants";
import type {
  PhaseResourcePlanningSnapshot,
  PlannedSkillCreatorResource,
} from "./PhaseResourcePlanner";
import { PhaseResourcePlanner } from "./PhaseResourcePlanner";
import { ResolvedResourceReader } from "./ResolvedResourceReader";
import { SkillCreatorSourceResolver } from "./SkillCreatorSourceResolver";
import { parseLlmResponseToContent } from "./parseLlmResponseToContent";
import { SkillCreatorVerificationEngine } from "./SkillCreatorVerificationEngine";
import { formatVerifyChecksAsFeedback } from "./formatVerifyChecksAsFeedback";
import type { SkillCreatorWorkflowSessionRepository } from "../session";
import {
  SkillCreatorAuditSink,
  createHooks,
  getPolicy,
  canUseTool as evaluateGovernanceToolUse,
  type SkillCreatorHooks,
} from "./governance";
import type {
  SkillCreatorGovernancePhase,
  SkillCreatorGovernanceState,
} from "@repo/shared/types";

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
  sourceResolver?: SkillCreatorSourceResolver;
  resourcePlanner?: PhaseResourcePlanner;
  resolvedResourceReader?: ResolvedResourceReader;
  verificationEngine?: SkillCreatorVerificationEngine;
  /** verify→improve→re-verify ループの最大試行回数（デフォルト: 3） */
  maxImproveRetry?: number;
  /** セッション永続化リポジトリ (TASK-P0-08) */
  sessionRepository?: SkillCreatorWorkflowSessionRepository;
  /** Facade インスタンスID（セッションリース用）(TASK-P0-08) */
  ownerInstanceId?: string;
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
  private readonly sourceResolver?: SkillCreatorSourceResolver;
  private readonly resourcePlanner?: PhaseResourcePlanner;
  private readonly resolvedResourceReader?: ResolvedResourceReader;
  private readonly manifestLoader = new ManifestLoader();
  private readonly verificationEngine?: SkillCreatorVerificationEngine;
  private readonly maxImproveRetry: number;

  // TASK-P0-09: Governance / Permission / Hooks
  private readonly auditSink = new SkillCreatorAuditSink();
  private currentGovernancePhase: SkillCreatorGovernancePhase = "plan";

  // TASK-RT-01: LLMAdapter ステータス管理
  private _llmAdapterStatus: LLMAdapterStatus = "initializing";
  private _llmAdapterFailureReason: string | null = null;

  // TASK-P0-08: セッション永続化
  private readonly sessionRepository?: SkillCreatorWorkflowSessionRepository;
  private readonly ownerInstanceId: string;

  constructor(deps: RuntimeSkillCreatorFacadeDeps) {
    this.skillExecutor = deps.skillExecutor;
    this.workflowEngine =
      deps.workflowEngine ?? new SkillCreatorWorkflowEngine();
    this.llmAdapter = deps.llmAdapter;
    if (deps.llmAdapter) {
      this._llmAdapterStatus = "ready";
    }
    this.resourceLoader = deps.resourceLoader;
    this.skillFileManager = deps.skillFileManager;
    this.skillFileWriter = deps.skillFileWriter;
    this.sourceResolver = deps.sourceResolver;
    this.resourcePlanner = deps.resourcePlanner;
    this.resolvedResourceReader = deps.resolvedResourceReader;
    this.verificationEngine = deps.verificationEngine;
    this.maxImproveRetry = Math.min(Math.max(deps.maxImproveRetry ?? 3, 1), 10);
    this.sessionRepository = deps.sessionRepository;
    this.ownerInstanceId = deps.ownerInstanceId ?? `facade-${Date.now()}`;
    this.resolver = new RuntimePolicyResolver(
      deps.authKeyService,
      deps.subscriptionAuthProvider,
    );
    this.handoffBuilder = new TerminalHandoffBuilder();
  }

  /** LLMAdapter の現在のステータスを取得する (TASK-RT-01) */
  get llmAdapterStatus(): LLMAdapterStatus {
    return this._llmAdapterStatus;
  }

  /** LLMAdapter 初期化失敗時の理由を取得する (TASK-RT-01) */
  get llmAdapterFailureReason(): string | null {
    return this._llmAdapterFailureReason;
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
    this._llmAdapterStatus = "ready";
    this._llmAdapterFailureReason = null;
  }

  /**
   * LLMAdapter 初期化失敗を記録する (TASK-RT-01)。
   * fire-and-forget の catch ブロックから呼ばれ、ステータスを "failed" に遷移させる。
   */
  setLLMAdapterFailed(reason: string): void {
    this._llmAdapterStatus = "failed";
    this._llmAdapterFailureReason = reason;
  }

  getWorkflowStateSnapshot(
    planId: string,
  ): SkillCreatorWorkflowUiSnapshot | undefined {
    return this.workflowEngine.getWorkflowState(planId);
  }

  submitUserInput(
    planId: string,
    submission: SkillCreatorUserInputSubmission,
  ): SkillCreatorWorkflowUiSnapshot {
    return this.workflowEngine.submitUserInput(planId, submission);
  }

  getVerifyDetail(planId: string): RuntimeSkillCreatorVerifyDetailResponse {
    return this.workflowEngine.getVerifyDetail(planId);
  }

  reverifyWorkflow(planId: string): RuntimeSkillCreatorReverifyResponse {
    return this.workflowEngine.requestReverify(planId);
  }

  /**
   * 現在の governance 状態を返す (TASK-P0-09)。
   * renderer は IPC 経由で read-only 参照する。
   */
  getGovernanceState(): SkillCreatorGovernanceState {
    const phase = this.currentGovernancePhase;
    const activePolicy = getPolicy(phase);
    const recentAuditEvents = this.auditSink.getRecentEvents(20);
    const recentDenials = this.auditSink
      .getDenialEvents()
      .slice(-10)
      .map((e) => ({
        toolName: e.toolName,
        toolUseId: undefined,
        reason: e.decision?.reason ?? "unknown",
      }));
    return { phase, activePolicy, recentAuditEvents, recentDenials };
  }

  /**
   * 指定 phase の hooks を生成する (TASK-P0-09)。
   * 内部メソッド: plan/execute/verify/improve の各フローで使用。
   */
  private createGovernanceHooks(
    phase: SkillCreatorGovernancePhase,
  ): SkillCreatorHooks {
    this.currentGovernancePhase = phase;
    const provenance = this.buildSourceProvenance();
    return createHooks(phase, this.auditSink, provenance);
  }

  async verifySkill(
    skillDir: string,
  ): Promise<import("@repo/shared").RuntimeSkillCreatorVerifyCheck[]> {
    const verifyId = `verify-${Date.now()}`;
    const governanceHooks = this.createGovernanceHooks("verify");
    governanceHooks.onSessionStart({
      sessionId: verifyId,
      provenance: this.buildSourceProvenance(),
    });

    if (!this.verificationEngine) {
      governanceHooks.onSessionEnd({
        sessionId: verifyId,
        summary: "Verify skipped: verificationEngine unavailable",
      });
      return [];
    }

    try {
      const checks = await this.verificationEngine.verify(skillDir);
      governanceHooks.onSessionEnd({
        sessionId: verifyId,
        summary: `Verify completed: ${checks.length} checks`,
      });
      return checks;
    } catch (error) {
      governanceHooks.onSessionEnd({
        sessionId: verifyId,
        summary: `Verify failed: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  private createExecuteGovernanceCanUseTool() {
    return async (
      toolName: string,
      _input: Record<string, unknown>,
      options: { toolUseID: string },
    ) => {
      const decision = evaluateGovernanceToolUse(toolName, "execute");
      if (decision.allowed) {
        return { behavior: "allow" as const, toolUseID: options.toolUseID };
      }
      return {
        behavior: "deny" as const,
        message: decision.reason,
        toolUseID: options.toolUseID,
      };
    };
  }

  /**
   * verify → improve → re-verify の自動閉ループを実行する。
   * 前回の改善要約を次回の feedback に織り込んで、同一修正の反復を抑える。
   *
   * TASK-P0-02: verify→improve→re-verify 閉ループ
   */
  async verifyAndImproveLoop(
    planId: string,
    skillDir: string,
    skillName: string,
    authMode: string,
    apiKey?: string,
  ): Promise<RuntimeSkillCreatorVerifyAndImproveResult> {
    if (!this.verificationEngine) {
      console.warn(
        "[RuntimeSkillCreatorFacade] verificationEngine が未設定のため、verify→improve ループをスキップします",
      );
    }

    const maxRetry = this.maxImproveRetry;
    let attemptCount = 0;
    let previousImproveSummary = "";

    while (true) {
      // Step 1: verify 実行
      let checks: RuntimeSkillCreatorVerifyCheck[];
      try {
        checks = await this.verifySkill(skillDir);
      } catch (err) {
        return {
          finalStatus: "error",
          totalAttempts: attemptCount,
          finalChecks: [],
          loopExhausted: false,
          errorMessage: err instanceof Error ? err.message : String(err),
          workflowSnapshot: this.workflowEngine.getWorkflowState(planId)! ?? {
            planId,
            currentPhase: "verify",
            awaitingUserInput: null,
            verifyResult: null,
            phaseArtifacts: [],
            resumeTokenEnvelope: {
              version: "task-sdk-02-v1",
              planId,
              currentPhase: "verify",
              artifactCount: 0,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }

      // Step 2: 全チェック PASS 判定（error がなければ PASS）
      const allPassed = checks.every((c) => c.severity !== "error");

      if (allPassed) {
        const snapshot = this.workflowEngine.recordVerifyPass(planId, checks);
        return {
          finalStatus: "pass",
          totalAttempts: attemptCount,
          finalChecks: checks,
          loopExhausted: false,
          workflowSnapshot: snapshot,
        };
      }

      // Step 3: maxRetry チェック
      if (attemptCount >= maxRetry) {
        const snapshot = this.workflowEngine.recordVerifyFailure(
          planId,
          `verify→improve ループが最大試行回数(${maxRetry})に到達しました`,
          "review",
        );
        return {
          finalStatus: "fail",
          totalAttempts: attemptCount,
          finalChecks: checks,
          loopExhausted: true,
          workflowSnapshot: snapshot,
        };
      }

      // Step 4: improve 試行
      const failedChecks = checks.filter((check) => check.severity !== "info");
      this.workflowEngine.recordImproveAttempt(planId, failedChecks);
      attemptCount++;

      try {
        const feedback = buildImproveFeedback(
          failedChecks,
          previousImproveSummary,
        );
        const improveResult = await this.improve(
          skillName,
          feedback,
          authMode as AuthMode,
          apiKey ?? null,
        );

        // エラーレスポンスチェック
        if ("success" in improveResult && !improveResult.success) {
          throw new Error(
            (improveResult as { error: { message: string } }).error.message,
          );
        }

        // terminal_handoff チェック
        if (
          "type" in improveResult &&
          improveResult.type === "terminal_handoff"
        ) {
          const snapshot = this.workflowEngine.recordVerifyFailure(
            planId,
            "improve が terminal_handoff を返しました",
            "review",
          );
          return {
            finalStatus: "error",
            totalAttempts: attemptCount,
            finalChecks: checks,
            loopExhausted: false,
            errorMessage: "terminal_handoff",
            workflowSnapshot: snapshot,
          };
        }

        const suggestions =
          "suggestions" in improveResult ? improveResult.suggestions : [];

        if (suggestions.length === 0) {
          const snapshot = this.workflowEngine.recordVerifyFailure(
            planId,
            "LLM が改善提案を生成できませんでした",
            "review",
          );
          return {
            finalStatus: "fail",
            totalAttempts: attemptCount,
            finalChecks: checks,
            loopExhausted: false,
            errorMessage: "改善提案なし",
            workflowSnapshot: snapshot,
          };
        }

        // Step 4.3: 改善を適用
        const applyResult = await this.applyImprovement(skillName, suggestions);

        if (applyResult.applied === 0) {
          const snapshot = this.workflowEngine.recordVerifyFailure(
            planId,
            "改善提案の適用に全て失敗しました",
            "review",
          );
          return {
            finalStatus: "fail",
            totalAttempts: attemptCount,
            finalChecks: checks,
            loopExhausted: false,
            errorMessage: "改善適用失敗",
            workflowSnapshot: snapshot,
          };
        }

        previousImproveSummary = summarizeImproveSuggestions(suggestions);

        // Step 5: re-verify へ（while ループ先頭に戻る）
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const snapshot = this.workflowEngine.recordVerifyFailure(
          planId,
          `improve 中にエラーが発生: ${errorMsg}`,
          "review",
        );
        return {
          finalStatus: "error",
          totalAttempts: attemptCount,
          finalChecks: checks,
          loopExhausted: false,
          errorMessage: errorMsg,
          workflowSnapshot: snapshot,
        };
      }
    }
  }

  // ── SDK Message 正規化 (TASK-RT-06) ─────────────────

  /**
   * SDK 生メッセージ 1 件を lane 正規化イベントに変換する。
   */
  normalizeSdkMessage(rawMessage: unknown): SkillCreatorSdkEvent {
    return normalizeSdkMessage(rawMessage, this.buildNormalizerContext());
  }

  /**
   * SDK 生メッセージのストリーム全体を正規化する。
   */
  normalizeSdkStream(rawMessages: unknown[]): SkillCreatorSdkEvent[] {
    return normalizeSdkStream(rawMessages, this.buildNormalizerContext());
  }

  /**
   * セッション一覧を返す。(TASK-P0-08)
   * sessionRepository がある場合はそれを優先使用。
   */
  listSessions(): SkillCreatorSessionListItem[] {
    if (!this.sessionRepository) {
      return this.workflowEngine.listCheckpoints();
    }

    this.sessionRepository.cleanupExpiredLeases();
    this.sessionRepository.cleanupExpiredCheckpoints(SESSION_TTL_MS);

    const now = Date.now();
    const checkpoints = this.sessionRepository.listCheckpoints();

    return checkpoints
      .filter((cp) => now - cp.updatedAt <= SESSION_TTL_MS)
      .map((cp) => {
        const root = this.getExplicitSkillCreatorRoot();
        const compatibility =
          this.sessionRepository!.evaluateResumeCompatibility(cp.planId, {
            currentSnapshot: {
              engineVersion: SKILL_CREATOR_ENGINE_VERSION,
              sourceProvenance: root
                ? { resolvedSkillCreatorRoot: root }
                : undefined,
            },
            currentInstanceId: this.ownerInstanceId,
          });
        return {
          checkpointId: cp.checkpointId,
          planId: cp.planId,
          currentPhase: cp.workflowStateSnapshot.currentPhase,
          checkpointType: cp.checkpointType,
          compatibility,
          updatedAt: cp.updatedAt,
        };
      });
  }

  /**
   * セッション詳細スナップショットを返す。(TASK-P0-08)
   */
  getSessionDetail(
    checkpointId: string,
  ): SkillCreatorWorkflowUiSnapshot | undefined {
    return this.workflowEngine.getCheckpointSnapshot(checkpointId);
  }

  /**
   * セッションを復元する。(TASK-P0-08)
   */
  resumeSession(
    checkpointId: string,
  ): SkillCreatorWorkflowUiSnapshot | undefined {
    if (!this.sessionRepository) {
      return this.workflowEngine.resumeFromCheckpoint(checkpointId);
    }

    const checkpoints = this.sessionRepository.listCheckpoints();
    const checkpoint = checkpoints.find(
      (cp) => cp.checkpointId === checkpointId,
    );
    if (!checkpoint) return undefined;

    return this.workflowEngine.hydrateFromCheckpoint(checkpoint);
  }

  /**
   * セッションを削除する。(TASK-P0-08)
   */
  deleteSession(checkpointId: string): void {
    if (!this.sessionRepository) {
      this.workflowEngine.deleteCheckpoint(checkpointId);
      return;
    }

    const checkpoints = this.sessionRepository.listCheckpoints();
    const checkpoint = checkpoints.find(
      (cp) => cp.checkpointId === checkpointId,
    );
    if (!checkpoint) return;

    this.sessionRepository.deleteCheckpoint(checkpoint.planId);
  }

  /**
   * 現在の Facade 状態から NormalizerContext を構築する。
   */
  buildNormalizerContext(): NormalizerContext {
    const root = this.getExplicitSkillCreatorRoot();
    return {
      sourceProvenance: root ? { resolvedSkillCreatorRoot: root } : undefined,
    };
  }

  private resolveDecision(authMode: AuthMode, apiKey: string | null) {
    if (authMode === "api-key" && (!apiKey || apiKey.trim() === "")) {
      return this.resolver.resolveWithService(authMode);
    }
    return this.resolver.resolve(authMode, apiKey);
  }

  private buildSourceProvenance(
    planningSnapshot?: PhaseResourcePlanningSnapshot,
  ): SkillCreatorWorkflowSourceProvenance | undefined {
    if (planningSnapshot) {
      return {
        resolvedSkillCreatorRoot: planningSnapshot.resolvedSkillCreatorRoot,
        resourceDescriptorHash:
          planningSnapshot.foundationSnapshot?.resourceDescriptorHash,
        manifestPath: planningSnapshot.foundationSnapshot?.sourcePath,
        manifestCacheKey: planningSnapshot.foundationSnapshot?.cacheKey,
        candidateRoots: planningSnapshot.candidateRoots,
        selectedRoots: planningSnapshot.selectedRoots,
        selectedResourceIds: planningSnapshot.selectedResourceIds,
        droppedResourceIds: planningSnapshot.droppedResourceIds,
        structureSignature: planningSnapshot.structureSignature,
        degradeReasons: planningSnapshot.degradeReasons,
      };
    }

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

  private hasDynamicResourcePipeline(): boolean {
    return Boolean(
      this.sourceResolver &&
      this.resourcePlanner &&
      this.resolvedResourceReader,
    );
  }

  private getExplicitSkillCreatorRoot(): string | undefined {
    return this.resourceLoader &&
      typeof this.resourceLoader.getBasePath === "function"
      ? this.resourceLoader.getBasePath()
      : undefined;
  }

  private async loadWorkflowManifest(
    explicitRoot?: string,
  ): Promise<LoadedWorkflowManifest | undefined> {
    if (!explicitRoot) {
      return undefined;
    }

    const manifestPath = path.join(explicitRoot, "workflow-manifest.json");
    try {
      await fs.access(manifestPath);
      return await this.manifestLoader.loadManifest(manifestPath);
    } catch {
      return undefined;
    }
  }

  private async resolveOperationResources(
    requests: readonly import("./PhaseResourcePlanner").PhaseResourceRequest[],
    maxBytes: number,
    operation: import("./PhaseResourcePlanner").SkillCreatorOperation,
  ): Promise<{
    resources: PlannedSkillCreatorResource[];
    sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  }> {
    if (
      !this.sourceResolver ||
      !this.resourcePlanner ||
      !this.resolvedResourceReader
    ) {
      throw new Error("Dynamic resource pipeline is not configured");
    }

    const explicitRoot = this.getExplicitSkillCreatorRoot();
    const manifest = await this.loadWorkflowManifest(explicitRoot);
    const resolution = await this.sourceResolver.resolve({
      explicitRoot,
      manifest,
      requiredRelativePaths: requests
        .filter((request) => request.required)
        .map((request) => request.relativePath),
    });
    const planning = await this.resourcePlanner.plan({
      operation,
      requests,
      resolution,
      maxBytes,
    });

    return {
      resources: planning.resources,
      sourceProvenance: this.buildSourceProvenance(planning.snapshot),
    };
  }

  private async readPlannedResources(
    resources: PlannedSkillCreatorResource[],
  ): Promise<Array<PlannedSkillCreatorResource & { content: string }>> {
    if (!this.resolvedResourceReader) {
      throw new Error("ResolvedResourceReader is not configured");
    }

    const loaded: Array<PlannedSkillCreatorResource & { content: string }> = [];
    for (const resource of resources) {
      const content = await this.resolvedResourceReader.readText(resource);
      loaded.push({ ...resource, content });
    }
    return loaded;
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
    // TASK-RT-01: アダプターステータスチェック
    if (this._llmAdapterStatus === "failed") {
      return {
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: toActionableMessage(this._llmAdapterFailureReason),
        },
      };
    }

    if (this._llmAdapterStatus === "initializing") {
      return {
        success: false,
        error: {
          code: "llm_adapter_unavailable",
          message: "LLMAdapter の初期化中です。しばらくお待ちください",
        },
      };
    }

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
    const governanceHooks = this.createGovernanceHooks("plan");
    governanceHooks.onSessionStart({ sessionId: planId });
    let sourceProvenance: SkillCreatorWorkflowSourceProvenance | undefined =
      this.buildSourceProvenance();

    // TASK-RT-02: llmAdapter/resourceLoader 未注入時は explicit error を返す
    if (!this.llmAdapter) {
      return buildDegradedError("llm_adapter_unavailable");
    }
    if (!this.resourceLoader && !this.hasDynamicResourcePipeline()) {
      return buildDegradedError("resource_loader_unavailable");
    }

    let agentSpecs: Array<{ name: string; content: string }> = [];
    let referenceSpecs: Array<{ name: string; content: string }> = [];
    if (this.hasDynamicResourcePipeline()) {
      const resolved = await this.resolveOperationResources(
        PLAN_RESOURCE_REQUESTS,
        PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
        "plan",
      );
      const loadedResources = await this.readPlannedResources(
        resolved.resources,
      );
      agentSpecs = loadedResources
        .filter((resource) => resource.kind === "agent")
        .map((resource) => ({
          name: resource.id,
          content: resource.content,
        }));
      referenceSpecs = loadedResources
        .filter((resource) => resource.kind === "reference")
        .map((resource) => ({
          name: resource.id,
          content: resource.content,
        }));
      sourceProvenance = resolved.sourceProvenance;
    } else if (this.resourceLoader) {
      // fallback path: PLAN_RESOURCE_REQUESTS が唯一の source of truth。
      // kind === "agent" のエントリのみを agent 名として使用し、reference が混入しない。
      for (const request of PLAN_RESOURCE_REQUESTS.filter(
        (r) => r.kind === "agent",
      )) {
        const content = await this.resourceLoader.loadAgent(request.id);
        agentSpecs.push({ name: request.id, content });
      }
      sourceProvenance = this.buildSourceProvenance();
    }

    // LLM 呼び出し
    const systemPrompt = buildPlanSystemPrompt(agentSpecs, referenceSpecs);
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
      adapterStatus: this._llmAdapterStatus,
    };
    const planSnapshot = this.workflowEngine.recordPlanResult(
      planResult,
      decision,
      sourceProvenance,
    );

    // TASK-P0-08: review-ready checkpoint を永続化
    if (this.sessionRepository) {
      const artifacts =
        this.workflowEngine.serializeArtifactsForPersistence(planId);
      this.sessionRepository.saveCheckpoint({
        planId,
        checkpointType: "review-ready",
        workflowState: {
          currentPhase: planSnapshot.currentPhase,
          awaitingUserInput: planSnapshot.awaitingUserInput,
          verifyResult: planSnapshot.verifyResult,
          phaseArtifacts: artifacts,
          resumeTokenEnvelope:
            planSnapshot.resumeTokenEnvelope as import("@repo/shared/types").SkillCreatorResumeTokenEnvelope,
          handoffBundle: planSnapshot.handoffBundle,
        },
        compatibilitySnapshot: {
          routeSnapshot: planSnapshot.routeSnapshot ?? {
            type: "integrated_api",
            permissionMode: "default",
          },
          sourceProvenance: sourceProvenance
            ? {
                resolvedSkillCreatorRoot:
                  sourceProvenance.resolvedSkillCreatorRoot,
              }
            : undefined,
          engineVersion: SKILL_CREATOR_ENGINE_VERSION,
        },
        ownerInstanceId: this.ownerInstanceId,
      });
    }

    governanceHooks.onSessionEnd({
      sessionId: planId,
      summary: `Plan completed: ${parsed.skillName}`,
    });
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
    const governanceHooks = this.createGovernanceHooks("execute");
    governanceHooks.onSessionStart({
      sessionId: planResult.planId,
      provenance: sourceProvenance,
    });

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
    const executePolicy = getPolicy("execute");

    const request: SkillExecutionRequest = {
      prompt: planResult.skillSpec,
      skillId: `creator-${planResult.planId}`,
      allowedTools: [...executePolicy.allowedTools],
      permissionMode: executePolicy.permissionMode,
      canUseTool: this.createExecuteGovernanceCanUseTool(),
      hookObservers: {
        onPreToolUse: (input, _toolUseId) => {
          const decision = governanceHooks.onPreToolUse({
            sessionId: planResult.planId,
            toolName: input.toolName,
          });
          return decision.allowed
            ? { proceed: true }
            : { proceed: false, message: decision.reason };
        },
        onPostToolUse: (input, _toolUseId, success, error) =>
          governanceHooks.onPostToolUse({
            sessionId: planResult.planId,
            toolName: input.toolName,
            success,
            error,
          }),
      },
    };

    const skillMeta = {
      id: `creator-${planResult.planId}`,
      name: "skill-creator-executor",
      slug: "skill-creator-executor",
      description: "RuntimeSkillCreatorFacade の Executor role",
      path: "",
      triggers: [],
      anchors: [],
      allowedTools: [...executePolicy.allowedTools],
      permissionMode: executePolicy.permissionMode,
      content: planResult.skillSpec,
    };

    let response;
    try {
      response = await this.skillExecutor.execute(request, skillMeta);
    } catch (error) {
      const sdkEvents = normalizeSkillCreatorSdkEvents([], sourceProvenance);
      const executeResult: SkillExecuteResult = {
        executeId: `exec-error-${Date.now()}`,
        skillName:
          planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
        success: false,
        error: toExecutionErrorMessage(error),
        sdkEvents,
        sourceProvenance,
      };
      this.workflowEngine.recordExecutionFailure(planResult.planId, {
        executeId: executeResult.executeId,
        skillName: executeResult.skillName,
        reason: "execution_error",
        message: executeResult.error ?? "Skill execution failed.",
        sdkEvents,
        sourceProvenance,
      });
      return executeResult;
    }

    const sdkEvents = normalizeSkillCreatorSdkEvents(
      response.sdkMessages ?? [],
      sourceProvenance,
    );
    const lastResultEvent = [...sdkEvents]
      .reverse()
      .find((event) => event.eventType === "result");
    const lastErrorEvent = [...sdkEvents]
      .reverse()
      .find((event) => event.eventType === "error");
    const permissionDenials = collectPermissionDenials(sdkEvents);

    // Step 3.5-3.6: LLM 応答からコンテンツ抽出 → SkillFileWriter.persist() (TASK-P0-05)
    let persistResult: { skillPath: string; files: string[] } | null = null;
    let persistError: string | null = null;

    if (response.success) {
      try {
        const content = parseLlmResponseToContent(sdkEvents);

        if (content && this.skillFileWriter) {
          persistResult = await this.skillFileWriter.persist(
            planResult.skillName,
            content,
            { overwrite: true },
          );
        } else if (content && !this.skillFileWriter) {
          console.warn(
            "[RuntimeSkillCreatorFacade] skillFileWriter is not injected. " +
              "Skipping persist for generated content.",
          );
        }
      } catch (err) {
        persistError = err instanceof Error ? err.message : String(err);
      }
    }

    const executeResult: SkillExecuteResult = {
      executeId: response.executionId,
      skillName:
        planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
      success: response.success,
      error:
        response.error?.message ??
        (response.success ? undefined : lastErrorEvent?.errorMessage),
      sessionId: findFirstSessionId(sdkEvents),
      resultSubtype: lastResultEvent?.resultSubtype,
      stopReason: lastResultEvent?.stopReason,
      permissionDenials:
        permissionDenials.length > 0 ? permissionDenials : undefined,
      sdkEvents,
      sourceProvenance,
      persistResult,
      persistError,
    };
    if (executeResult.success) {
      this.workflowEngine.recordExecuteResult(planResult.planId, executeResult);
      governanceHooks.onSessionEnd({
        sessionId: planResult.planId,
        summary: `Execute succeeded: ${executeResult.skillName}`,
      });
      return executeResult;
    }

    this.workflowEngine.recordExecutionFailure(planResult.planId, {
      executeId: executeResult.executeId,
      skillName: executeResult.skillName,
      reason: "execution_failed",
      message: executeResult.error ?? "Skill execution failed.",
      sessionId: executeResult.sessionId,
      resultSubtype: executeResult.resultSubtype,
      stopReason: executeResult.stopReason,
      permissionDenials: executeResult.permissionDenials,
      sdkEvents: executeResult.sdkEvents,
      sourceProvenance,
    });
    governanceHooks.onSessionEnd({
      sessionId: planResult.planId,
      summary: `Execute failed: ${executeResult.error ?? "unknown"}`,
    });
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
    const governanceHooks = this.createGovernanceHooks("improve");
    governanceHooks.onSessionStart({ sessionId: improveId });

    // TASK-RT-02: llmAdapter/resourceLoader 未注入時は explicit error を返す
    if (!this.llmAdapter) {
      return buildDegradedError("llm_adapter_unavailable");
    }
    if (!this.resourceLoader && !this.hasDynamicResourcePipeline()) {
      return buildDegradedError("resource_loader_unavailable");
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

      let agentPrompt: string;
      if (this.hasDynamicResourcePipeline()) {
        const resolved = await this.resolveOperationResources(
          IMPROVE_RESOURCE_REQUESTS,
          IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
          "improve",
        );
        const loadedResources = await this.readPlannedResources(
          resolved.resources,
        );
        agentPrompt =
          loadedResources.find((resource) => resource.id === "improve-prompt")
            ?.content ?? "";
        const referenceSections = loadedResources
          .filter((resource) => resource.kind === "reference")
          .map(
            (resource) =>
              `${PLAN_PROMPT_CONSTANTS.REFERENCE_SEPARATOR_START} ${resource.id} ===\n${resource.content}\n${PLAN_PROMPT_CONSTANTS.REFERENCE_SEPARATOR_END} ${resource.id} ===`,
          )
          .join("\n\n");
        agentPrompt = [agentPrompt, referenceSections]
          .filter((section) => section.trim().length > 0)
          .join("\n\n");
      } else {
        agentPrompt = await this.resourceLoader!.loadAgent(
          IMPROVE_PROMPT_CONSTANTS.AGENT_NAME,
        );
      }

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

      governanceHooks.onSessionEnd({
        sessionId: improveId,
        summary: `Improve completed: ${parseResult.suggestions.length} suggestions`,
      });
      return {
        improveId,
        suggestions: parseResult.suggestions,
        revisedSpec: parseResult.revisedSpec,
      };
    } catch (error: unknown) {
      governanceHooks.onSessionEnd({
        sessionId: improveId,
        summary: `Improve failed: ${error instanceof Error ? error.message : "unknown"}`,
      });
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
  referenceSpecs: Array<{ name: string; content: string }> = [],
): string {
  const agentSections = agentSpecs
    .map(
      ({ name, content }) =>
        `${PLAN_PROMPT_CONSTANTS.AGENT_SEPARATOR_START} ${name} ===\n${content}\n${PLAN_PROMPT_CONSTANTS.AGENT_SEPARATOR_END} ${name} ===`,
    )
    .join("\n\n");

  const referenceSections = referenceSpecs
    .map(
      ({ name, content }) =>
        `${PLAN_PROMPT_CONSTANTS.REFERENCE_SEPARATOR_START} ${name} ===\n${content}\n${PLAN_PROMPT_CONSTANTS.REFERENCE_SEPARATOR_END} ${name} ===`,
    )
    .join("\n\n");

  const sections = [
    agentSections,
    referenceSections,
    PLAN_RESPONSE_SCHEMA_INSTRUCTION,
  ]
    .filter((section) => section.trim().length > 0)
    .join("\n\n");

  return sections;
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

function buildImproveFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
  previousImproveSummary: string,
): string {
  const feedback = formatVerifyChecksAsFeedback(checks);
  const summary = previousImproveSummary.trim();

  if (feedback === "" || summary === "") {
    return feedback;
  }

  return `${feedback}\n\n## 前回の改善要約\n${summary}`;
}

function summarizeImproveSuggestions(
  suggestions: RuntimeSkillCreatorImproveSuggestion[],
): string {
  if (suggestions.length === 0) {
    return "";
  }

  return suggestions
    .map((suggestion) => `- ${suggestion.section}: ${suggestion.reason}`)
    .join("\n");
}

const DEGRADED_REASON_MESSAGES: Record<
  RuntimeSkillCreatorDegradedReason,
  string
> = {
  llm_adapter_unavailable:
    "LLM アダプタが利用できません。設定を確認してください。",
  resource_loader_unavailable:
    "リソースローダーが利用できません。設定を確認してください。",
};

function buildDegradedError(reason: RuntimeSkillCreatorDegradedReason): {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
} {
  return {
    success: false,
    error: { code: reason, message: DEGRADED_REASON_MESSAGES[reason] },
  };
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

export function normalizeSkillCreatorSdkEvents(
  sdkMessages: unknown[],
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorSdkEvent[] {
  const normalized = sdkMessages
    .map((message, index) =>
      normalizeSkillCreatorSdkMessage(message, index, sourceProvenance),
    )
    .filter((event): event is SkillCreatorSdkEvent => event !== null);

  return normalized.length > 0
    ? normalized
    : [
        {
          eventType: "error",
          sequence: 0,
          rawType: "missing_sdk_events",
          errorMessage: "SDK stream did not emit any normalizable events.",
          sourceProvenance,
        },
      ];
}

export function normalizeSkillCreatorSdkMessage(
  message: unknown,
  sequence: number,
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorSdkEvent | null {
  if (!isRecord(message)) {
    return null;
  }

  const rawType = readString(message, ["type"]) ?? "unknown";
  const eventType = resolveSkillCreatorSdkEventType(message, rawType);
  if (!eventType) {
    return null;
  }

  const text = extractSkillCreatorSdkText(message);
  const permissionDenials = extractPermissionDenials(message);

  return {
    eventType,
    sequence,
    rawType,
    sessionId: extractSessionId(message),
    messageId: readString(message, ["message", "id"]),
    text: text || undefined,
    resultSubtype:
      readString(message, ["result", "subtype"]) ??
      readString(message, ["subtype"]),
    stopReason:
      readString(message, ["result", "stop_reason"]) ??
      readString(message, ["result", "stopReason"]) ??
      readString(message, ["stop_reason"]) ??
      readString(message, ["stopReason"]),
    permissionDenials:
      permissionDenials.length > 0 ? permissionDenials : undefined,
    errorMessage:
      readString(message, ["error", "message"]) ??
      readString(message, ["result", "error"]),
    sourceProvenance,
  };
}

function resolveSkillCreatorSdkEventType(
  message: Record<string, unknown>,
  rawType: string,
): SkillCreatorSdkEvent["eventType"] | null {
  const normalizedType = rawType.toLowerCase();
  const subtype =
    readString(message, ["subtype"]) ??
    readString(message, ["result", "subtype"]) ??
    "";

  if (
    normalizedType === "system" ||
    normalizedType === "system/init" ||
    subtype === "init"
  ) {
    return "init";
  }
  if (normalizedType === "assistant" || normalizedType === "text") {
    return "assistant";
  }
  if (normalizedType === "result") {
    return "result";
  }
  if (normalizedType === "error") {
    return "error";
  }

  return null;
}

function collectPermissionDenials(
  events: SkillCreatorSdkEvent[],
): SkillCreatorSdkPermissionDenial[] {
  return events.flatMap((event) => event.permissionDenials ?? []);
}

function findFirstSessionId(
  events: SkillCreatorSdkEvent[],
): string | undefined {
  return events.find((event) => Boolean(event.sessionId))?.sessionId;
}

function extractSessionId(
  message: Record<string, unknown>,
): string | undefined {
  return (
    readString(message, ["session_id"]) ??
    readString(message, ["sessionId"]) ??
    readString(message, ["result", "session_id"]) ??
    readString(message, ["result", "sessionId"])
  );
}

function extractSkillCreatorSdkText(message: Record<string, unknown>): string {
  const direct =
    readString(message, ["content"]) ??
    readString(message, ["message", "content"]);
  if (direct) {
    return direct;
  }

  const content = readValue(message, ["message", "content"]);
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (!isRecord(item)) {
        return "";
      }
      return (
        readString(item, ["text"]) ??
        readString(item, ["content"]) ??
        readString(item, ["message"])
      );
    })
    .filter((part): part is string => Boolean(part))
    .join("\n");
}

function extractPermissionDenials(
  message: Record<string, unknown>,
): SkillCreatorSdkPermissionDenial[] {
  const rawValue =
    readValue(message, ["permission_denials"]) ??
    readValue(message, ["permissionDenials"]) ??
    readValue(message, ["result", "permission_denials"]) ??
    readValue(message, ["result", "permissionDenials"]);

  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((item) => {
      if (typeof item === "string") {
        return { reason: item };
      }
      if (!isRecord(item)) {
        return null;
      }

      const reason =
        readString(item, ["reason"]) ??
        readString(item, ["message"]) ??
        readString(item, ["error"]) ??
        "permission_denied";

      return {
        toolName:
          readString(item, ["tool_name"]) ?? readString(item, ["toolName"]),
        toolUseId:
          readString(item, ["tool_use_id"]) ?? readString(item, ["toolUseId"]),
        reason,
      };
    })
    .filter((item): item is SkillCreatorSdkPermissionDenial => item !== null);
}

function readString(
  value: Record<string, unknown>,
  path: string[],
): string | undefined {
  const result = readValue(value, path);
  return typeof result === "string" && result.trim() !== ""
    ? result
    : undefined;
}

function readValue(value: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = value;
  for (const segment of path) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

/**
 * LLMAdapter の失敗理由を actionable なユーザー向けメッセージに変換する (TASK-RT-01)
 */
export function toActionableMessage(reason: string | null): string {
  if (!reason) return "LLMAdapter の初期化に失敗しました";
  if (/api.?key|ANTHROPIC_API_KEY/i.test(reason)) {
    return "APIキーを設定してください";
  }
  return reason;
}

function toExecutionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }
  return "Skill execution failed.";
}
