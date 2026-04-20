/**
 * @vitest-environment happy-dom
 *
 * @file TASK-TRACE-SKILL-AUTH-001 — 回帰テスト
 * @description SkillLifecyclePanel のウィザード起動で auth:login が呼ばれないことを検証する回帰テスト。
 *
 * Phase 4 で作成された RED テスト（修正前は TC-01 が失敗する）。
 * Phase 5 の修正後に TC-01 が GREEN になることを確認する。
 *
 * テストケース:
 *   TC-01: SkillLifecyclePanel の作成フローが auth:login を呼ばないこと（回帰テスト）
 *   TC-02: AccountSection の login() が正常に呼ばれること（正常系保護）
 *   TC-04: authSlice の login() thunk がデバッグコード除去後も正常動作すること
 *   TC-08: authModeSlice 状態変化が auth:login を呼ばないこと
 *
 * 追加テストケース（UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001）:
 *   TC-06相当: AUTH-REGRESS-RAPID-CLICK-06 — rapid click 時に auth:login が呼ばれないこと
 *   TC-07相当: AUTH-REGRESS-RERENDER-07 — rerender 時に auth:login が呼ばれないこと
 *   AUTH-REGRESS-HANDLER-GUARANTEE — handler 呼び出し保証点
 *   AUTH-REGRESS-INTEGRATION-01/02 — 統合境界テスト
 *   AUTH-REGRESS-EDGE-01〜04 — 境界条件・エッジケース
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
} from "@testing-library/react";

// ============================================================
// Store モック（SkillLifecyclePanel.test.tsx のパターンを踏襲）
// ============================================================

const mockCreateSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockClearGenerationState = vi.fn();
const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();
const mockClearHandoffGuidance = vi.fn();
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();
const mockSetIsGenerating = vi.fn();
const mockSetGenerationError = vi.fn();
const mockSetGenerationProgress = vi.fn();
const mockSetCurrentPlanId = vi.fn();
const mockSetCurrentPlanResult = vi.fn();

type MockStoreState = {
  selectedSkillName: string | null;
  isExecuting: boolean;
  streamingMessages: never[];
  skillExecutionStatus: string | null;
  skillError: string | null;
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: null;
  workflowSnapshot: null;
  workflowError: string | null;
  handoffGuidance: null;
};

let mockStoreState: MockStoreState = {
  selectedSkillName: null,
  isExecuting: false,
  streamingMessages: [],
  skillExecutionStatus: null,
  skillError: null,
  isGenerating: false,
  generationProgress: null,
  generationError: null,
  currentPlanId: null,
  currentPlanResult: null,
  workflowSnapshot: null,
  workflowError: null,
  handoffGuidance: null,
};

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
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => mockStoreState.isExecuting,
  useStreamingMessages: () => mockStoreState.streamingMessages,
  useSkillExecutionStatus: () => mockStoreState.skillExecutionStatus,
  useSkillError: () => mockStoreState.skillError,
  useIsSkillGenerating: () => mockStoreState.isGenerating,
  useGenerationProgress: () => mockStoreState.generationProgress,
  useGenerationError: () => mockStoreState.generationError,
  useCurrentPlanId: () => mockStoreState.currentPlanId,
  useCurrentPlanResult: () => mockStoreState.currentPlanResult,
  useSetIsSkillGenerating: () => mockSetIsGenerating,
  useSetGenerationError: () => mockSetGenerationError,
  useSetGenerationProgress: () => mockSetGenerationProgress,
  useSetCurrentPlanId: () => mockSetCurrentPlanId,
  useSetCurrentPlanResult: () => mockSetCurrentPlanResult,
  useWorkflowSnapshot: () => mockStoreState.workflowSnapshot,
  useWorkflowError: () => mockStoreState.workflowError,
  useSetWorkflowSnapshot: () => mockSetWorkflowSnapshot,
  useSetWorkflowError: () => mockSetWorkflowError,
  useHandoffGuidance: () => mockStoreState.handoffGuidance,
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

// ============================================================
// Skill Creator API モック
// ============================================================

const mockDetectMode = vi.fn();
const mockPlanSkill = vi.fn();
const mockAuthLogin = vi.fn();
const mockListSessions = vi.fn();
const mockDeleteSession = vi.fn();
const mockCleanupExpiredSessions = vi.fn();
const mockGetWorkflowState = vi.fn();
const mockOnWorkflowStateChanged = vi.fn();
const mockGetDisclosureInfo = vi.fn();
const mockGetVerifyDetail = vi.fn();
// ============================================================
// TC-01: ウィザード起動で auth:login が呼ばれないこと（回帰テスト）
// ============================================================

describe("TC-01: SkillLifecyclePanel wizard flow does not call auth:login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedSkillName: "test-skill",
      isExecuting: false,
      streamingMessages: [],
      skillExecutionStatus: null,
      skillError: null,
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
      workflowSnapshot: null,
      workflowError: null,
      handoffGuidance: null,
    };

    // detectMode は "create" を返す（planSkill を呼ばない経路）
    mockDetectMode.mockResolvedValue({
      success: true,
      data: "create",
    });

    mockGetVerifyDetail.mockResolvedValue({ success: false });
    mockGetWorkflowState.mockResolvedValue({ success: false });
    mockOnWorkflowStateChanged.mockReturnValue(() => {});
    mockListSessions.mockResolvedValue({ success: true, data: [] });
    mockDeleteSession.mockResolvedValue(undefined);
    mockCleanupExpiredSessions.mockResolvedValue(0);

    // window.electronAPI.auth.login をスパイとして設定
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: {
        login: mockAuthLogin,
      },
    };
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
      detectMode: mockDetectMode,
      planSkill: mockPlanSkill,
      getWorkflowState: mockGetWorkflowState,
      onWorkflowStateChanged: mockOnWorkflowStateChanged,
      getDisclosureInfo: mockGetDisclosureInfo,
      getVerifyDetail: mockGetVerifyDetail,
      listSessions: mockListSessions,
      deleteSession: mockDeleteSession,
      cleanupExpiredSessions: mockCleanupExpiredSessions,
    };
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("ウィザードボタン押下時に auth:login が呼ばれないこと", async () => {
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={vi.fn()}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-open-wizard-button"));
    });

    expect(mockDetectMode).not.toHaveBeenCalled();
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-02: AccountSection の auth:login が正常に呼ばれること（正常系保護）
// ============================================================

describe("TC-02: AccountSection triggers auth:login on demand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AccountSection の handleLogin が login() を呼ぶこと", async () => {
    // login() が正常に呼び出せることを確認（AccountSection の正常系）
    // authSlice の login action を直接テスト
    const { createAuthSlice } = await import("../../../store/slices/authSlice");

    const mockSet = vi.fn();
    const storeRef: { current: ReturnType<typeof createAuthSlice> | null } = {
      current: null,
    };
    const mockGet = vi.fn(() => storeRef.current!);

    const mockAuthLoginIPC = vi.fn().mockResolvedValue({ success: true });
    Object.defineProperty(window, "electronAPI", {
      value: { auth: { login: mockAuthLoginIPC } },
      writable: true,
    });

    storeRef.current = createAuthSlice(mockSet, mockGet, {});

    // login() を呼ぶ（AccountSection / AuthView の正当なパス）
    await storeRef.current.login("google");

    expect(mockAuthLoginIPC).toHaveBeenCalledWith({ provider: "google" });
  });
});

// ============================================================
// TC-04: authSlice.login() がデバッグコード除去後も正常動作すること
// ============================================================

describe("TC-04: authSlice.login thunk works correctly (no debug code)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("[TEMP DEBUG] タグがソースコードに存在しないこと", async () => {
    // デバッグコードが残存していないことを確認
    // 実装時は authSlice.ts の実際の内容を確認する
    const { createAuthSlice } = await import("../../../store/slices/authSlice");

    const mockLoginIPC = vi.fn().mockResolvedValue({ success: true });
    const storeRef: { current: ReturnType<typeof createAuthSlice> | null } = {
      current: null,
    };
    const mockSet = vi.fn((updater: unknown) => {
      if (typeof updater === "function" && storeRef.current) {
        Object.assign(storeRef.current, updater(storeRef.current));
      } else if (storeRef.current) {
        Object.assign(storeRef.current, updater);
      }
    });
    const mockGet = vi.fn(() => storeRef.current!);

    Object.defineProperty(window, "electronAPI", {
      value: { auth: { login: mockLoginIPC } },
      writable: true,
    });

    storeRef.current = createAuthSlice(mockSet, mockGet, {});

    // login() を呼んでも console.trace は出ないこと
    const consoleSpy = vi.spyOn(console, "trace");
    await storeRef.current.login("google");

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("authSlice.login() が正常に IPC を呼び出すこと", async () => {
    const { createAuthSlice } = await import("../../../store/slices/authSlice");

    const mockLoginIPC = vi.fn().mockResolvedValue({ success: true });
    const storeRef: { current: ReturnType<typeof createAuthSlice> | null } = {
      current: null,
    };
    const mockSet = vi.fn();
    const mockGet = vi.fn(() => storeRef.current!);

    Object.defineProperty(window, "electronAPI", {
      value: { auth: { login: mockLoginIPC } },
      writable: true,
    });

    storeRef.current = createAuthSlice(mockSet, mockGet, {});

    await storeRef.current.login("google");

    expect(mockLoginIPC).toHaveBeenCalledWith({ provider: "google" });
  });
});

// ============================================================
// TC-08: authModeSlice 状態変化が auth:login を呼ばないこと
// ============================================================

describe("TC-08: authModeSlice state changes do not trigger unexpected auth:login", () => {
  it("authModeSlice の setMode('api-key') が auth.login を呼ばず IPC と state を更新すること [TC-08]", async () => {
    const authModeModule = await import("../../../store/slices/authModeSlice");
    const { createAuthModeSlice, resetAuthModeListenerFlag } = authModeModule;
    resetAuthModeListenerFlag();

    const storeRef: { current: ReturnType<typeof createAuthModeSlice> | null } =
      { current: null };
    const mockSet = vi.fn((updater: unknown) => {
      if (!storeRef.current) {
        return;
      }
      const nextState =
        typeof updater === "function" ? updater(storeRef.current) : updater;
      Object.assign(storeRef.current, nextState);
    });
    const mockGet = vi.fn(() => storeRef.current!);
    const mockLoginIPC = vi.fn();
    const now = Date.now();
    const mockStatus = {
      mode: "api-key" as const,
      isValid: true,
      hasCredentials: true,
      message: "認証方式は利用可能です",
      lastCheckedAt: now,
    };

    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockLoginIPC },
      authMode: {
        get: vi.fn().mockResolvedValue({
          success: true,
          data: { mode: "api-key" as const },
        }),
        set: vi.fn().mockResolvedValue({ success: true }),
        status: vi.fn().mockResolvedValue({
          success: true,
          data: mockStatus,
        }),
        validate: vi.fn().mockResolvedValue({
          success: true,
          data: mockStatus,
        }),
        onModeChanged: vi.fn().mockReturnValue(() => {}),
      },
    };

    storeRef.current = createAuthModeSlice(mockSet, mockGet, {});

    const assertNoLogin = async (
      label: string,
      action: () => Promise<unknown> | unknown,
    ): Promise<void> => {
      mockLoginIPC.mockClear();
      await action();
      expect(
        mockLoginIPC,
        `${label} は auth.login を呼ばない`,
      ).not.toHaveBeenCalled();
    };

    await assertNoLogin("setMode", () => storeRef.current!.setMode("api-key"));

    const mockWindow = window as Window & {
      electronAPI?: {
        authMode?: {
          set: ReturnType<typeof vi.fn>;
          status: ReturnType<typeof vi.fn>;
        };
      };
    };
    const authModeApi = mockWindow.electronAPI?.authMode;
    expect(authModeApi).toBeDefined();

    expect(authModeApi?.set).toHaveBeenCalledWith({
      mode: "api-key",
    });
    expect(authModeApi?.status).toHaveBeenCalledTimes(1);
    expect(storeRef.current!.mode).toBe("api-key");
    expect(storeRef.current!.status).toEqual(mockStatus);
  });
});

// ============================================================
// TC-06相当: AUTH-REGRESS-RAPID-CLICK-06
// rapid click — onOpenSkillWizard を連続クリックしても auth:login が呼ばれないこと
// ============================================================

describe("TC-06: rapid click — onOpenSkillWizard を連続クリックしても auth:login が呼ばれないこと", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedSkillName: null,
      isExecuting: false,
      streamingMessages: [],
      skillExecutionStatus: null,
      skillError: null,
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
      workflowSnapshot: null,
      workflowError: null,
      handoffGuidance: null,
    };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("3回連続クリックしても auth:login が呼ばれないこと", async () => {
    const mockOnOpenSkillWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={mockOnOpenSkillWizard}
        skillName="test-skill"
      />,
    );

    const button = screen.getByTestId("skill-lifecycle-open-wizard-button");
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
    expect(mockOnOpenSkillWizard).toHaveBeenCalledTimes(3);
  });

  it("5回連続クリックしても auth:login が呼ばれないこと", async () => {
    const mockOnOpenSkillWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={mockOnOpenSkillWizard}
        skillName="test-skill"
      />,
    );

    const button = screen.getByTestId("skill-lifecycle-open-wizard-button");
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        fireEvent.click(button);
      });
    }

    expect(mockAuthLogin).not.toHaveBeenCalled();
    expect(mockOnOpenSkillWizard).toHaveBeenCalledTimes(5);
  });
});

// ============================================================
// TC-07相当: AUTH-REGRESS-RERENDER-07
// rerender — 再レンダリング時に auth:login が呼ばれないこと
// ============================================================

describe("TC-07: rerender — 再レンダリング時に auth:login が呼ばれないこと", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedSkillName: null,
      isExecuting: false,
      streamingMessages: [],
      skillExecutionStatus: null,
      skillError: null,
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
      workflowSnapshot: null,
      workflowError: null,
      handoffGuidance: null,
    };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("skillName props 変更による rerender で auth:login が呼ばれないこと", async () => {
    const { rerender } = render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={vi.fn()}
        skillName="skill-a"
      />,
    );

    await act(async () => {
      rerender(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="skill-b"
        />,
      );
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("onOpenWizard props 変更による rerender で auth:login が呼ばれないこと", async () => {
    const { rerender } = render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={vi.fn()}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      rerender(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="test-skill"
        />,
      );
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("store 状態変化（isGenerating: false→true）による rerender で auth:login が呼ばれないこと", async () => {
    const { rerender } = render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={vi.fn()}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      mockStoreState = { ...mockStoreState, isGenerating: true };
      rerender(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="test-skill"
        />,
      );
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// AUTH-REGRESS-HANDLER-GUARANTEE
// onOpenSkillWizard / onOpenWizard の auth:login 非混入保証
// ============================================================

describe("AUTH-REGRESS-HANDLER-GUARANTEE: onOpenSkillWizard/onOpenWizard の auth:login 非混入保証", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedSkillName: null,
      isExecuting: false,
      streamingMessages: [],
      skillExecutionStatus: null,
      skillError: null,
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
      workflowSnapshot: null,
      workflowError: null,
      handoffGuidance: null,
    };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
      listSessions: mockListSessions,
      deleteSession: mockDeleteSession,
      cleanupExpiredSessions: mockCleanupExpiredSessions,
    };
    mockListSessions.mockResolvedValue({ success: true, data: [] });
    mockDeleteSession.mockResolvedValue(undefined);
    mockCleanupExpiredSessions.mockResolvedValue(0);
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("onOpenSkillWizard ボタン押下時に onOpenSkillWizard が呼ばれ auth:login が呼ばれないこと [TC-GUARD-01a]", async () => {
    const mockOnOpenSkillWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={mockOnOpenSkillWizard}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-open-wizard-button"));
    });

    expect(mockOnOpenSkillWizard).toHaveBeenCalledTimes(1);
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("onOpenWizard ボタン押下時に onOpenWizard が呼ばれ auth:login が呼ばれないこと [TC-GUARD-01b]", async () => {
    const mockOnOpenWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={mockOnOpenWizard}
        onOpenSkillWizard={vi.fn()}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-open-wizard"));
    });

    expect(mockOnOpenWizard).toHaveBeenCalledTimes(1);
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("session-start-new-btn 押下時に deleteSession と onOpenWizard が呼ばれ auth:login が呼ばれないこと [TC-GUARD-01c]", async () => {
    const resumableSession = {
      checkpointId: "checkpoint-001",
      sessionId: "session-001",
      planId: "plan-001",
      checkpointType: "review-ready" as const,
      currentPhase: "review" as const,
      startedAt: Date.now() - 60_000,
      createdAt: Date.now() - 60_000,
      updatedAt: Date.now(),
      compatibility: {
        status: "compatible" as const,
        reasons: [],
        warnings: [],
      },
    };
    const mockOnOpenWizard = vi.fn();
    mockListSessions.mockResolvedValue({
      success: true,
      data: [resumableSession],
    });

    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={mockOnOpenWizard}
        onOpenSkillWizard={vi.fn()}
        skillName="test-skill"
      />,
    );

    const startNewButton = await screen.findByTestId("session-start-new-btn");
    await act(async () => {
      fireEvent.click(startNewButton);
    });

    expect(mockDeleteSession).toHaveBeenCalledWith("checkpoint-001");
    expect(mockOnOpenWizard).toHaveBeenCalledTimes(1);
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// AUTH-REGRESS-INTEGRATION-01/02: 統合境界テスト
// ============================================================

describe("AUTH-REGRESS-INTEGRATION-01: wizard 起動先を含む統合境界で auth:login が混入しないこと", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedSkillName: null,
      isExecuting: false,
      streamingMessages: [],
      skillExecutionStatus: null,
      skillError: null,
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
      workflowSnapshot: null,
      workflowError: null,
      handoffGuidance: null,
    };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("onOpenSkillWizard 起動後も auth:login が呼ばれないこと", async () => {
    const mockOnOpenSkillWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={vi.fn()}
        onOpenSkillWizard={mockOnOpenSkillWizard}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-open-wizard-button"));
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("onOpenWizard 起動後も wizard 境界で auth:login が呼ばれないこと", async () => {
    const mockOnOpenWizard = vi.fn();
    render(
      <SkillLifecyclePanel
        onClose={vi.fn()}
        onOpenWizard={mockOnOpenWizard}
        onOpenSkillWizard={vi.fn()}
        skillName="test-skill"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-open-wizard"));
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

describe("AUTH-REGRESS-INTEGRATION-02: マウント・アンマウント境界で auth:login が呼ばれないこと", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("マウント直後に auth:login が呼ばれないこと", async () => {
    await act(async () => {
      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="test-skill"
        />,
      );
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });

  it("アンマウント（cleanup）後に auth:login が呼ばれないこと", async () => {
    await act(async () => {
      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="test-skill"
        />,
      );
    });

    await act(async () => {
      cleanup();
    });

    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// AUTH-REGRESS-EDGE: 境界条件・エッジケース
// ============================================================

describe("AUTH-REGRESS-EDGE: 境界条件・エッジケースでの auth:login 非発火保証", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedSkillName: null,
      isExecuting: false,
      streamingMessages: [],
      skillExecutionStatus: null,
      skillError: null,
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
      workflowSnapshot: null,
      workflowError: null,
      handoffGuidance: null,
    };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe("AUTH-REGRESS-EDGE-01: skillError 状態での wizard 起動", () => {
    it("skillError がある状態でも onOpenSkillWizard クリックで auth:login が呼ばれないこと", async () => {
      mockStoreState = { ...mockStoreState, skillError: "テストエラー" };

      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="test-skill"
        />,
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-open-wizard-button"),
        );
      });

      expect(mockAuthLogin).not.toHaveBeenCalled();
    });
  });

  describe("AUTH-REGRESS-EDGE-02: isGenerating 状態での rapid click", () => {
    it("isGenerating=true の状態で連続クリックしても auth:login が呼ばれないこと", async () => {
      mockStoreState = { ...mockStoreState, isGenerating: true };

      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={vi.fn()}
          skillName="test-skill"
        />,
      );

      const button = screen.getByTestId("skill-lifecycle-open-wizard-button");
      await act(async () => {
        fireEvent.click(button);
      });
      await act(async () => {
        fireEvent.click(button);
      });

      expect(mockAuthLogin).not.toHaveBeenCalled();
    });
  });

  describe("AUTH-REGRESS-EDGE-03: onOpenSkillWizard に空の関数を渡したケース", () => {
    it("onOpenSkillWizard が空の arrow function でも auth:login が呼ばれないこと", async () => {
      render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={() => {}}
          skillName="test-skill"
        />,
      );

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-open-wizard-button"),
        );
      });

      expect(mockAuthLogin).not.toHaveBeenCalled();
    });
  });

  describe("AUTH-REGRESS-EDGE-04: 複数回 rerender 後の状態安定性", () => {
    it("3回以上 rerender 後も auth:login が呼ばれず onOpenSkillWizard クリックが機能すること", async () => {
      const mockOnOpenSkillWizard = vi.fn();
      const { rerender } = render(
        <SkillLifecyclePanel
          onClose={vi.fn()}
          onOpenWizard={vi.fn()}
          onOpenSkillWizard={mockOnOpenSkillWizard}
          skillName="skill-a"
        />,
      );

      for (const name of ["skill-b", "skill-c", "skill-d"]) {
        await act(async () => {
          rerender(
            <SkillLifecyclePanel
              onClose={vi.fn()}
              onOpenWizard={vi.fn()}
              onOpenSkillWizard={mockOnOpenSkillWizard}
              skillName={name}
            />,
          );
        });
      }

      await act(async () => {
        fireEvent.click(
          screen.getByTestId("skill-lifecycle-open-wizard-button"),
        );
      });

      expect(mockAuthLogin).not.toHaveBeenCalled();
      expect(mockOnOpenSkillWizard).toHaveBeenCalledTimes(1);
    });
  });
});
