/**
 * Skill Creator E2E Test Helpers
 *
 * TASK-SC-08-E2E-VALIDATION: E2E tests for Skill Creator LLM integration
 *
 * Provides mock factories, IPC invocation wrappers, and assertion helpers
 * for testing the RuntimeSkillCreatorFacade via IPC handlers.
 */
import { vi } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import type {
  RuntimeSkillCreatorPlanResult,
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorImproveResult,
  RuntimeSkillCreatorImproveSuggestion,
  ApplyImprovementResult,
  HandoffGuidance,
  VerifyResult,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
} from "@repo/shared/types";

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExecutePlanAcceptedAck {
  accepted: true;
  planId: string;
}

export interface MockWebContents {
  id: number;
  getType: () => string;
  isDevToolsOpened: () => boolean;
  send: ReturnType<typeof vi.fn>;
}

export interface MockBrowserWindow {
  id: number;
  webContents: MockWebContents;
  isDestroyed: () => boolean;
}

export interface MockRuntimeFacade {
  plan: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
  executeAsync: ReturnType<typeof vi.fn>;
  verify: ReturnType<typeof vi.fn>;
  improve: ReturnType<typeof vi.fn>;
  applyImprovement: ReturnType<typeof vi.fn>;
  setLLMAdapter: ReturnType<typeof vi.fn>;
  getWorkflowStateSnapshot: ReturnType<typeof vi.fn>;
  submitUserInput: ReturnType<typeof vi.fn>;
}

// -------------------------------------------------------
// Handler Map (shared with electron mock)
// -------------------------------------------------------

export const handlerMap = new Map<
  string,
  (...args: unknown[]) => Promise<unknown>
>();

// -------------------------------------------------------
// Mock Factories
// -------------------------------------------------------

export function createMockMainWindow(): MockBrowserWindow {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
    isDestroyed: () => false,
  };
}

export function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

export function createMockRuntimeFacade(): MockRuntimeFacade {
  const workflowSnapshot: SkillCreatorWorkflowUiSnapshot = {
    planId: "plan-001",
    currentPhase: "review",
    awaitingUserInput: null,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "plan-001",
      currentPhase: "review",
      artifactCount: 0,
      updatedAt: "2026-03-27T00:00:00.000Z",
    },
    handoffBundle: null,
  };

  return {
    plan: vi.fn(),
    execute: vi.fn(),
    executeAsync: vi.fn().mockResolvedValue(undefined),
    verify: vi.fn(),
    improve: vi.fn(),
    applyImprovement: vi.fn(),
    setLLMAdapter: vi.fn(),
    getWorkflowStateSnapshot: vi
      .fn<(planId: string) => SkillCreatorWorkflowUiSnapshot | undefined>()
      .mockImplementation((planId) => ({
        ...workflowSnapshot,
        planId,
        resumeTokenEnvelope: {
          ...workflowSnapshot.resumeTokenEnvelope,
          planId,
        },
      })),
    submitUserInput: vi
      .fn<
        (
          planId: string,
          submission: SkillCreatorUserInputSubmission,
        ) => SkillCreatorWorkflowUiSnapshot
      >()
      .mockImplementation((planId, submission) => ({
        ...workflowSnapshot,
        planId,
        awaitingUserInput: null,
        resumeTokenEnvelope: {
          ...workflowSnapshot.resumeTokenEnvelope,
          planId,
        },
        verifyResult: {
          status:
            submission.selectedOptionId === "needs_changes" ? "fail" : "pass",
          updatedAt: "2026-03-27T00:00:00.000Z",
        },
      })),
  };
}

// -------------------------------------------------------
// Success Response Factories
// -------------------------------------------------------

export function createSuccessPlanResult(
  overrides?: Partial<RuntimeSkillCreatorPlanResult>,
): RuntimeSkillCreatorPlanResult {
  return {
    planId: "plan-001",
    skillSpec: "test skill spec",
    estimatedSteps: 3,
    skillName: "test-skill",
    description: "A test skill",
    agents: [{ name: "agent-1", role: "analyzer" }],
    scripts: [{ name: "validate.sh", purpose: "validation" }],
    triggers: ["test trigger"],
    anchors: ["test anchor"],
    ...overrides,
  };
}

export function createSuccessExecuteResult(
  overrides?: Partial<RuntimeSkillCreatorExecuteResult>,
): RuntimeSkillCreatorExecuteResult {
  return {
    executeId: "exec-001",
    skillName: "test-skill",
    success: true,
    ...overrides,
  };
}

export function createTerminalHandoffGuidance(
  overrides?: Partial<HandoffGuidance>,
): HandoffGuidance {
  return {
    terminalCommand:
      'claude -p "PRレビューを自動化するスキルを作成してください"',
    contextSummary: "API Key が未設定のため CLI で継続",
    reason: "API Key not configured",
    ...overrides,
  };
}

export function createImproveResult(
  overrides?: Partial<RuntimeSkillCreatorImproveResult>,
): RuntimeSkillCreatorImproveResult {
  return {
    improveId: "improve-001",
    suggestions: [
      {
        section: "SKILL.md",
        before: "old content",
        after: "improved content",
        reason: "better clarity",
      },
    ],
    ...overrides,
  };
}

export function createApplyImprovementResult(
  overrides?: Partial<ApplyImprovementResult>,
): ApplyImprovementResult {
  return {
    applied: 1,
    skipped: 0,
    skippedDetails: [],
    errors: [],
    ...overrides,
  };
}

export function createVerifyResult(
  overrides?: Partial<VerifyResult>,
): VerifyResult {
  return {
    skillName: "test-skill",
    passed: false,
    checkResults: [
      {
        checkId: "L1-001",
        label: "SKILL.md exists",
        passed: true,
        message: "path: /tmp/test-skill/SKILL.md",
      },
      {
        checkId: "L1-002",
        label: "agents/ directory is missing",
        passed: false,
        message: "path: /tmp/test-skill/agents",
      },
    ],
    summary: "1件の検証チェックで警告またはエラーが見つかりました",
    ...overrides,
  };
}

export function createSampleSuggestions(): RuntimeSkillCreatorImproveSuggestion[] {
  return [
    {
      section: "SKILL.md",
      before: "old trigger",
      after: "improved trigger",
      reason: "more precise trigger condition",
    },
  ];
}

// -------------------------------------------------------
// IPC Invocation Helpers
// -------------------------------------------------------

export function getHandler(
  channel: string,
): ((...args: unknown[]) => Promise<unknown>) | undefined {
  return handlerMap.get(channel);
}

export async function invokeSkillCreatorPlan(
  prompt: string,
  authMode = "api-key",
  apiKey: string | null = "test-key",
): Promise<IpcResult<unknown>> {
  const handler = getHandler("skill-creator:plan");
  if (!handler) throw new Error("skill-creator:plan handler not registered");
  return handler(createMockEvent(), {
    prompt,
    authMode,
    apiKey,
  }) as Promise<IpcResult<unknown>>;
}

export async function invokeSkillCreatorExecute(
  planId: string,
  skillSpec: string,
  authMode = "api-key",
  apiKey: string | null = "test-key",
): Promise<unknown> {
  const handler = getHandler("skill-creator:execute-plan");
  if (!handler)
    throw new Error("skill-creator:execute-plan handler not registered");
  return handler(createMockEvent(), {
    planId,
    skillSpec,
    authMode,
    apiKey,
  }) as Promise<IpcResult<unknown>>;
}

export async function invokeSkillCreatorImprove(
  skillName: string,
  feedback: string,
  authMode = "api-key",
  apiKey: string | null = "test-key",
): Promise<IpcResult<unknown>> {
  const handler = getHandler("skill-creator:improve-skill");
  if (!handler)
    throw new Error("skill-creator:improve-skill handler not registered");
  return handler(createMockEvent(), {
    skillName,
    feedback,
    authMode,
    apiKey,
  }) as Promise<IpcResult<unknown>>;
}

export async function invokeSkillCreatorVerify(
  skillName: string,
  authMode = "api-key",
  apiKey: string | null = "test-key",
): Promise<IpcResult<unknown>> {
  const handler = getHandler("skill-creator:verify");
  if (!handler) throw new Error("skill-creator:verify handler not registered");
  return handler(createMockEvent(), {
    skillName,
    authMode,
    apiKey,
  }) as Promise<IpcResult<unknown>>;
}

// -------------------------------------------------------
// Assertion Helpers
// -------------------------------------------------------

export function assertIpcSuccess(
  result: unknown,
): asserts result is IpcResult<unknown> & { success: true } {
  const r = result as IpcResult<unknown>;
  if (!r.success) {
    throw new Error(
      `Expected IPC success but got error: ${r.error ?? "unknown"}`,
    );
  }
}

export function assertExecutePlanAccepted(
  result: unknown,
): asserts result is ExecutePlanAcceptedAck {
  const r = result as ExecutePlanAcceptedAck;
  if (!r || r.accepted !== true || typeof r.planId !== "string") {
    throw new Error("Expected execute-plan to return accepted ack");
  }
}

export function assertIpcError(
  result: unknown,
  expectedErrorSubstring?: string,
): asserts result is IpcResult<never> & { success: false } {
  const r = result as IpcResult<unknown>;
  if (r.success) {
    throw new Error("Expected IPC error but got success");
  }
  if (expectedErrorSubstring && r.error) {
    if (!r.error.includes(expectedErrorSubstring)) {
      throw new Error(
        `Expected error containing "${expectedErrorSubstring}" but got "${r.error}"`,
      );
    }
  }
}

export function assertTerminalHandoff(
  data: unknown,
): asserts data is { type: "terminal_handoff"; guidance: HandoffGuidance } {
  const d = data as Record<string, unknown>;
  if (d.type !== "terminal_handoff") {
    throw new Error(
      `Expected type "terminal_handoff" but got "${String(d.type)}"`,
    );
  }
  const guidance = d.guidance as Record<string, unknown>;
  if (!guidance || typeof guidance.terminalCommand !== "string") {
    throw new Error("Missing or invalid guidance.terminalCommand");
  }
  if (guidance.terminalCommand === "") {
    throw new Error("terminalCommand must not be empty");
  }
  if (!/^[a-zA-Z]/.test(guidance.terminalCommand as string)) {
    throw new Error(
      "terminalCommand must start with an alphanumeric character",
    );
  }
}

export function assertNoSensitiveData(result: IpcResult<unknown>): void {
  const json = JSON.stringify(result);
  const sensitivePatterns = [
    /sk-[a-zA-Z0-9]{20,}/,
    /\n\s+at\s+/,
    /\/Users\/[^\s]+/,
    /\/home\/[^\s]+/,
    /C:\\Users\\[^\s]+/,
  ];
  for (const pattern of sensitivePatterns) {
    if (pattern.test(json)) {
      throw new Error(
        `Response contains sensitive data matching pattern: ${pattern.source}`,
      );
    }
  }
}

export function assertPerformance(startTime: number, limitMs: number): void {
  const elapsed = performance.now() - startTime;
  if (elapsed > limitMs) {
    throw new Error(
      `Performance exceeded limit: ${elapsed.toFixed(0)}ms > ${limitMs}ms`,
    );
  }
}
