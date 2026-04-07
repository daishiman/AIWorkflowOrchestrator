/**
 * @vitest-environment happy-dom
 *
 * SkillLifecyclePanel - onApprovalRequest テスト
 *
 * TASK-SDK-07: approval:request surface 追加
 * Phase 4: T-4-6 〜 T-4-9 / Phase 6: T-6-5 〜 T-6-7
 */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

// --- store モック ---
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
let mockHandoffGuidance: {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
} | null = null;

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
  useHandoffGuidance: () => mockHandoffGuidance,
  useSetHandoffGuidance: () => mockSetHandoffGuidance,
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
}));

vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: ({ skillName }: { skillName: string }) => (
    <div data-testid="mock-streaming-view">{skillName}</div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="mock-analysis-view">
      <span>{skillName}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

// window.electronAPI のセットアップユーティリティ
type ApprovalPayload = {
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
};

type MockElectronAPI = {
  skillCreator: {
    onApprovalRequest: (
      callback: (payload: ApprovalPayload) => void,
    ) => () => void;
    detectMode?: () => Promise<unknown>;
    planSkill?: () => Promise<unknown>;
    executePlan?: () => Promise<unknown>;
    getWorkflowState?: () => Promise<unknown>;
    submitUserInput?: () => Promise<unknown>;
    onWorkflowStateChanged?: () => () => void;
    getVerifyDetail?: () => Promise<unknown>;
    reverifyWorkflow?: () => Promise<unknown>;
    improveSkill?: () => Promise<unknown>;
    improveSkillWithFeedback?: () => Promise<unknown>;
    applyRuntimeImprovement?: () => Promise<unknown>;
    getDisclosureInfo?: () => Promise<unknown>;
    listSessions?: () => Promise<unknown>;
    resumeSession?: () => Promise<unknown>;
    deleteSession?: () => Promise<void>;
    cleanupExpiredSessions?: () => Promise<number>;
  };
};

function setupElectronAPI(api: MockElectronAPI) {
  Object.defineProperty(window, "electronAPI", {
    value: api,
    writable: true,
    configurable: true,
  });
}

function cleanupElectronAPI() {
  delete (window as Window & { electronAPI?: unknown }).electronAPI;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHandoffGuidance = null;
});

afterEach(() => {
  cleanup();
  cleanupElectronAPI();
});

// --- Phase 4 テスト: T-4-6 〜 T-4-9 ---

describe("SkillLifecyclePanel - approval request UI (Phase 4)", () => {
  // T-4-6: approval request 受信前は approval UI が表示されないこと
  it("T-4-6: approval request 受信前は approval UI が表示されないこと", () => {
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi.fn().mockReturnValue(mockUnsubscribe);

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    expect(
      screen.queryByTestId("skill-lifecycle-approval-request"),
    ).not.toBeInTheDocument();
  });

  // T-4-7: approval request 受信時に data-testid="skill-lifecycle-approval-request" が表示されること
  it("T-4-7: approval request 受信時に data-testid が表示されること", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    // コールバックが登録されていること
    expect(mockOnApprovalRequest).toHaveBeenCalled();
    expect(capturedCallback).not.toBeNull();

    const payload: ApprovalPayload = {
      operationType: "file_write",
      description: "設定ファイルへの書き込み",
      destination: "/etc/config.json",
      sessionId: "session-abc",
      operationId: "op-xyz",
    };

    await act(async () => {
      capturedCallback?.(payload);
    });

    expect(
      screen.getByTestId("skill-lifecycle-approval-request"),
    ).toBeInTheDocument();
  });

  // T-4-8: 表示内容に operationType / description / sessionId が含まれること
  it("T-4-8: 表示内容に operationType / description / sessionId が含まれること", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    const payload: ApprovalPayload = {
      operationType: "network_call",
      description: "外部APIへの接続リクエスト",
      destination: "https://api.example.com",
      sessionId: "session-t48",
      operationId: "op-t48",
    };

    await act(async () => {
      capturedCallback?.(payload);
    });

    const approvalDiv = screen.getByTestId("skill-lifecycle-approval-request");

    // operationType が表示されること
    expect(approvalDiv).toHaveTextContent("network_call");
    // description が表示されること
    expect(approvalDiv).toHaveTextContent("外部APIへの接続リクエスト");
    // sessionId が表示されること
    expect(approvalDiv).toHaveTextContent("session-t48");
  });

  // T-4-9: コンポーネントアンマウント時にリスナーが解除されること
  it("T-4-9: コンポーネントアンマウント時にリスナーが解除されること", () => {
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi.fn().mockReturnValue(mockUnsubscribe);

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    const { unmount } = render(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    // マウント時にリスナーが登録されること
    expect(mockOnApprovalRequest).toHaveBeenCalled();

    // アンマウント時にアンサブスクライブ関数が呼ばれること
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

// --- Phase 6 テスト: T-6-5 〜 T-6-7 ---

describe("SkillLifecyclePanel - approval request エッジケース (Phase 6)", () => {
  // T-6-5: 新しい approval request が届いたとき、前の request が上書きされること
  it("T-6-5: 新しい approval request で前の request が上書きされること", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    const payload1: ApprovalPayload = {
      operationType: "file_write",
      description: "最初のリクエスト",
      sessionId: "session-first",
      operationId: "op-first",
    };

    await act(async () => {
      capturedCallback?.(payload1);
    });

    // 最初のリクエストが表示されること
    expect(
      screen.getByTestId("skill-lifecycle-approval-request"),
    ).toHaveTextContent("最初のリクエスト");

    const payload2: ApprovalPayload = {
      operationType: "network_call",
      description: "上書きリクエスト",
      sessionId: "session-second",
      operationId: "op-second",
    };

    await act(async () => {
      capturedCallback?.(payload2);
    });

    // 上書き後は新しいリクエストのみが表示されること
    const approvalDiv = screen.getByTestId("skill-lifecycle-approval-request");
    expect(approvalDiv).toHaveTextContent("上書きリクエスト");
    expect(approvalDiv).not.toHaveTextContent("最初のリクエスト");
  });

  // T-6-6: destination が undefined の場合、宛先表示がレンダリングされないこと
  it("T-6-6: destination が undefined の場合、宛先表示がレンダリングされないこと", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    const payloadWithoutDestination: ApprovalPayload = {
      operationType: "internal_process",
      description: "内部処理の承認リクエスト",
      // destination は undefined（省略）
      sessionId: "session-nodest",
      operationId: "op-nodest",
    };

    await act(async () => {
      capturedCallback?.(payloadWithoutDestination);
    });

    const approvalDiv = screen.getByTestId("skill-lifecycle-approval-request");

    // approval UI は表示されること
    expect(approvalDiv).toBeInTheDocument();
    expect(approvalDiv).toHaveTextContent("内部処理の承認リクエスト");

    // 宛先テキストは表示されないこと
    expect(approvalDiv).not.toHaveTextContent("宛先:");
  });

  // T-6-7: コンポーネント再マウント時に前の request state がリセットされること
  it("T-6-7: コンポーネント再マウント時に前の request state がリセットされること", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    const { unmount } = render(
      <SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />,
    );

    const payload: ApprovalPayload = {
      operationType: "file_write",
      description: "マウント前のリクエスト",
      sessionId: "session-remount",
      operationId: "op-remount",
    };

    await act(async () => {
      capturedCallback?.(payload);
    });

    // 最初のマウントでリクエストが表示されること
    expect(
      screen.getByTestId("skill-lifecycle-approval-request"),
    ).toBeInTheDocument();

    // アンマウント
    unmount();
    cleanup();

    // 再マウント
    vi.clearAllMocks();
    capturedCallback = null;
    const mockUnsubscribe2 = vi.fn();
    const mockOnApprovalRequest2 = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe2;
      });

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest2,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    // 再マウント直後は approval UI が表示されないこと（state がリセットされていること）
    expect(
      screen.queryByTestId("skill-lifecycle-approval-request"),
    ).not.toBeInTheDocument();
  });

  // T-6-8: handoff 表示中でも approval request が 1 回だけ表示されること
  it("T-6-8: handoff 表示中でも approval request が 1 回だけ表示されること", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });

    mockHandoffGuidance = {
      terminalCommand: "pnpm --filter @repo/desktop dev",
      contextSummary: "launcher=cli cwd=/tmp/workspace",
      reason: "手動実行が必要です",
    };

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(<SkillLifecyclePanel onClose={vi.fn()} onOpenWizard={vi.fn()} />);

    const payload: ApprovalPayload = {
      operationType: "terminal_handoff",
      description: "handoff 中の承認リクエスト",
      sessionId: "session-handoff",
      operationId: "op-handoff",
    };

    await act(async () => {
      capturedCallback?.(payload);
    });

    expect(
      screen.getAllByTestId("skill-lifecycle-approval-request"),
    ).toHaveLength(1);
    expect(
      screen.getByTestId("skill-lifecycle-approval-request"),
    ).toHaveTextContent("handoff 中の承認リクエスト");
  });

  // T-6-9: 一覧へ戻る操作で approval request state がクリアされること
  it("T-6-9: 一覧へ戻る操作で approval request state がクリアされること", async () => {
    let capturedCallback: ((payload: ApprovalPayload) => void) | null = null;
    const mockUnsubscribe = vi.fn();
    const mockOnApprovalRequest = vi
      .fn()
      .mockImplementation((cb: (payload: ApprovalPayload) => void) => {
        capturedCallback = cb;
        return mockUnsubscribe;
      });
    const mockOnClose = vi.fn();

    setupElectronAPI({
      skillCreator: {
        onApprovalRequest: mockOnApprovalRequest,
      },
    });

    render(
      <SkillLifecyclePanel onClose={mockOnClose} onOpenWizard={vi.fn()} />,
    );

    const payload: ApprovalPayload = {
      operationType: "file_write",
      description: "戻る前のリクエスト",
      sessionId: "session-close",
      operationId: "op-close",
    };

    await act(async () => {
      capturedCallback?.(payload);
    });

    expect(
      screen.getByTestId("skill-lifecycle-approval-request"),
    ).toHaveTextContent("戻る前のリクエスト");

    await act(async () => {
      screen.getByRole("button", { name: "一覧へ戻る" }).click();
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(
      screen.queryByTestId("skill-lifecycle-approval-request"),
    ).not.toBeInTheDocument();
  });
});
