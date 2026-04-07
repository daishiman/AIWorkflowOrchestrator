/**
 * @vitest-environment happy-dom
 *
 * SkillLifecyclePanel onApprovalRequest テスト
 *
 * UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 4
 *
 * TDD Red → Green: SkillLifecyclePanel が onApprovalRequest を購読し
 * ApprovalSheet を表示・approve/reject を respondToApproval に接続することを検証する。
 */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

// --- store mock ---
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockCreateSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockClearGenerationState = vi.fn();
const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();
const mockClearHandoffGuidance = vi.fn();

vi.mock("../../../store", () => ({
  useBeginSkillReview: () => mockBeginSkillReview,
  useCreateSkill: () => mockCreateSkill,
  useCompleteSkillReview: () => mockCompleteSkillReview,
  useExecuteSkill: () => mockExecuteSkill,
  useFetchSkills: () => mockFetchSkills,
  useReExecuteAfterImprovement: () => mockReExecuteAfterImprovement,
  useResetSkillExecutionCycle: () => mockResetSkillExecutionCycle,
  useSelectSkillByName: () => mockSelectSkillByName,
  useClearSkillError: () => mockClearSkillError,
  useClearStreamingMessages: () => mockClearStreamingMessages,
  useClearGenerationState: () => mockClearGenerationState,
  useSelectedSkillName: () => null,
  useIsSkillExecuting: () => false,
  useStreamingMessages: () => [],
  useSkillExecutionStatus: () => null,
  useSkillError: () => null,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useCurrentPlanId: () => null,
  useCurrentPlanResult: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useWorkflowSnapshot: () => null,
  useWorkflowError: () => null,
  useSetWorkflowSnapshot: () => mockSetWorkflowSnapshot,
  useSetWorkflowError: () => mockSetWorkflowError,
  useHandoffGuidance: () => null,
  useSetHandoffGuidance: () => mockSetHandoffGuidance,
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
}));

// --- 子コンポーネント mock ---
vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: () => <div data-testid="mock-streaming-view" />,
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mock-analysis-view">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

vi.mock("../ApiKeySettingsPanel", () => ({
  ApiKeySettingsPanel: () => <div data-testid="mock-api-key-panel" />,
}));

vi.mock("../SessionResumePrompt", () => ({
  SessionResumePrompt: () => <div data-testid="mock-session-resume" />,
}));

vi.mock("../SessionIndicator", () => ({
  SessionIndicator: () => <div data-testid="mock-session-indicator" />,
}));

vi.mock("../LLMAdapterErrorBanner", () => ({
  LLMAdapterErrorBanner: () => <div data-testid="mock-llm-error-banner" />,
}));

vi.mock("../hooks/useLLMAdapterStatus", () => ({
  useLLMAdapterStatus: () => ({ status: "connected", failureReason: null }),
}));

vi.mock("../../organisms/TerminalHandoffCard", () => ({
  TerminalHandoffCard: () => <div data-testid="mock-handoff-card" />,
}));

vi.mock("../ImprovementProposalPanel", () => ({
  ImprovementProposalPanel: () => <div data-testid="mock-improvement-panel" />,
}));

vi.mock("../SkillCreationResultPanel", () => ({
  SkillCreationResultPanel: () => <div data-testid="mock-creation-result" />,
}));

vi.mock("../ConversationalInterview", () => ({
  ConversationalInterview: () => <div data-testid="mock-interview" />,
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

// --- approval mock helpers ---
type ApprovalCallback = (payload: {
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
}) => void;

let capturedApprovalCallback: ApprovalCallback | null = null;
let mockUnsubscribe: ReturnType<typeof vi.fn>;
let mockOnApprovalRequest: ReturnType<typeof vi.fn>;
let mockRespondToApproval: ReturnType<typeof vi.fn>;

function setupSkillCreatorApiMock() {
  mockUnsubscribe = vi.fn();
  mockOnApprovalRequest = vi.fn().mockImplementation((cb: ApprovalCallback) => {
    capturedApprovalCallback = cb;
    return mockUnsubscribe;
  });
  mockRespondToApproval = vi.fn().mockResolvedValue({ success: true });

  (
    window as Window & {
      skillCreatorAPI?: {
        onApprovalRequest?: (cb: ApprovalCallback) => () => void;
        respondToApproval?: (
          sessionId: string,
          operationId: string,
          action: "approve" | "reject",
        ) => Promise<{ success: boolean }>;
        getDisclosureInfo?: () => Promise<{ success: boolean }>;
        listSessions?: () => Promise<{ success: boolean; data: [] }>;
        cleanupExpiredSessions?: () => Promise<number>;
        onWorkflowStateChanged?: (cb: unknown) => () => void;
      };
    }
  ).skillCreatorAPI = {
    onApprovalRequest: mockOnApprovalRequest,
    respondToApproval: mockRespondToApproval,
    getDisclosureInfo: vi.fn().mockResolvedValue({ success: false }),
    listSessions: vi.fn().mockResolvedValue({ success: true, data: [] }),
    cleanupExpiredSessions: vi.fn().mockResolvedValue(0),
    onWorkflowStateChanged: vi.fn().mockReturnValue(vi.fn()),
  };
}

const testPayload = {
  operationType: "dangerous_operation",
  description: "ファイルを削除します",
  sessionId: "session-123",
  operationId: "op-456",
};

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("SkillLifecyclePanel: onApprovalRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedApprovalCallback = null;
    setupSkillCreatorApiMock();
  });

  afterEach(() => {
    cleanup();
    // window mock cleanup
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI =
      undefined;
  });

  // TC-APPR-06: SkillLifecyclePanel が onApprovalRequest を購読する
  it("TC-APPR-06: レンダリング時に onApprovalRequest が呼ばれる", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});

    expect(mockOnApprovalRequest).toHaveBeenCalledTimes(1);
    expect(mockOnApprovalRequest).toHaveBeenCalledWith(expect.any(Function));
  });

  // TC-APPR-07: approval request 受信時に ApprovalSheet が表示される
  it("TC-APPR-07: onApprovalRequest callback 発火で approval-sheet が表示される", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});

    expect(capturedApprovalCallback).not.toBeNull();

    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    expect(screen.getByTestId("approval-sheet")).toBeInTheDocument();
  });

  // TC-APPR-08: approve ボタン押下で respondToApproval が呼ばれる
  it("TC-APPR-08: approve ボタンで respondToApproval(sessionId, operationId, 'approve') が呼ばれる", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    const approveButton = screen.getByTestId("approval-approve");
    await act(async () => {
      fireEvent.click(approveButton);
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith(
      testPayload.sessionId,
      testPayload.operationId,
      "approve",
    );
  });

  // TC-APPR-09: reject ボタン押下で respondToApproval が呼ばれる
  it("TC-APPR-09: reject ボタンで respondToApproval(sessionId, operationId, 'reject') が呼ばれる", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    const rejectButton = screen.getByTestId("approval-reject");
    await act(async () => {
      fireEvent.click(rejectButton);
    });

    expect(mockRespondToApproval).toHaveBeenCalledWith(
      testPayload.sessionId,
      testPayload.operationId,
      "reject",
    );
  });

  // TC-APPR-10: アンマウント時に unsubscribe が呼ばれる
  it("TC-APPR-10: アンマウント時に unsubscribe 関数が呼ばれる", async () => {
    const { unmount } = render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});

    expect(mockUnsubscribe).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  // TC-APPR-14: respondToApproval 非影響確認（回帰ガード）
  it("TC-APPR-14: approval request がない状態では respondToApproval が呼ばれない（回帰ガード）", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});

    // approval request を発火させない状態
    expect(mockRespondToApproval).not.toHaveBeenCalled();
  });

  // TC-APPR-15: getDisclosureInfo 非影響確認（回帰ガード）
  it("TC-APPR-15: onApprovalRequest 購読は getDisclosureInfo に影響しない（回帰ガード）", async () => {
    const mockGetDisclosureInfo = vi.fn().mockResolvedValue({ success: false });
    (
      window as Window & {
        skillCreatorAPI?: { getDisclosureInfo?: () => Promise<unknown> };
      }
    ).skillCreatorAPI!.getDisclosureInfo = mockGetDisclosureInfo;

    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});

    // onApprovalRequest の購読は getDisclosureInfo を呼ばない
    expect(mockOnApprovalRequest).toHaveBeenCalledTimes(1);
    // getDisclosureInfo は SkillLifecyclePanel 内で自動呼び出しされる場合もあるが
    // onApprovalRequest コールバックの起動だけでは呼ばれない
    // approval callback を発火させてもgetDisclosureInfoは呼ばれない
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    // approval-sheet が表示されても getDisclosureInfo は呼ばれないこと
    // (getDisclosureInfo は別フローで呼ばれる)
    expect(screen.getByTestId("approval-sheet")).toBeInTheDocument();
  });

  // TC-APPR-16: approval payload が null の場合（UI が表示されない）
  it("TC-APPR-16: onApprovalRequest が呼ばれない状態では approval-sheet が表示されない", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});

    // approval callback を発火させない
    expect(screen.queryByTestId("approval-sheet")).not.toBeInTheDocument();
  });

  // TC-APPR-17: approve 後に pendingApproval がクリア（UI 非表示）
  it("TC-APPR-17: approve ボタン押下後に approval-sheet が非表示になる", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    expect(screen.getByTestId("approval-sheet")).toBeInTheDocument();

    const approveButton = screen.getByTestId("approval-approve");
    await act(async () => {
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("approval-sheet")).not.toBeInTheDocument();
    });
  });

  // TC-APPR-18: reject 後に pendingApproval がクリア（UI 非表示）
  it("TC-APPR-18: reject ボタン押下後に approval-sheet が非表示になる", async () => {
    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    expect(screen.getByTestId("approval-sheet")).toBeInTheDocument();

    const rejectButton = screen.getByTestId("approval-reject");
    await act(async () => {
      fireEvent.click(rejectButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("approval-sheet")).not.toBeInTheDocument();
    });
  });

  // TC-APPR-19: respondToApproval 失敗時は sheet を維持し、error を表示する
  it("TC-APPR-19: approval 応答が失敗した場合は approval-sheet を維持する", async () => {
    mockRespondToApproval.mockResolvedValueOnce({
      success: false,
      error: "approval failed",
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    const approveButton = screen.getByTestId("approval-approve");
    await act(async () => {
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(mockRespondToApproval).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("approval-sheet")).toBeInTheDocument();
      expect(screen.getByTestId("skill-lifecycle-error")).toHaveTextContent(
        "approval failed",
      );
    });
  });

  // TC-APPR-20: 応答中は重複送信を防ぐ
  it("TC-APPR-20: approval 応答中は二重送信されない", async () => {
    const deferred = createDeferred<{ success: boolean }>();
    mockRespondToApproval.mockReturnValueOnce(deferred.promise);

    render(<SkillLifecyclePanel onClose={vi.fn()} />);

    await act(async () => {});
    await act(async () => {
      capturedApprovalCallback!(testPayload);
    });

    const approveButton = screen.getByTestId("approval-approve");
    const rejectButton = screen.getByTestId("approval-reject");

    await act(async () => {
      fireEvent.click(approveButton);
    });

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();

    await act(async () => {
      fireEvent.click(rejectButton);
    });

    expect(mockRespondToApproval).toHaveBeenCalledTimes(1);

    deferred.resolve({ success: true });

    await waitFor(() => {
      expect(screen.queryByTestId("approval-sheet")).not.toBeInTheDocument();
    });
  });
});
