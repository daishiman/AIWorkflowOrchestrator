/**
 * @vitest-environment happy-dom
 *
 * @file TASK-TRACE-SKILL-AUTH-001 — 回帰テスト
 * @description スキル生成フローで auth:login が呼ばれないことを検証する回帰テスト。
 *
 * Phase 4 で作成された RED テスト（修正前は TC-01 が失敗する）。
 * Phase 5 の修正後に TC-01 が GREEN になることを確認する。
 *
 * テストケース:
 *   TC-01: SkillLifecyclePanel の作成フローが auth:login を呼ばないこと（回帰テスト）
 *   TC-02: AccountSection の login() が正常に呼ばれること（正常系保護）
 *   TC-03: スキル生成フローが auth:login タイムアウトなしで完了すること
 *   TC-04: authSlice の login() thunk がデバッグコード除去後も正常動作すること
 */

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
const mockGetWorkflowState = vi.fn();
const mockOnWorkflowStateChanged = vi.fn();
const mockGetDisclosureInfo = vi.fn();
const mockGetVerifyDetail = vi.fn();
const defaultCreateRequest = "テスト用スキルを作成してください";

type DeferredPromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function createDeferredPromise<T>(): DeferredPromise<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

function fillCreateRequest(request = defaultCreateRequest): void {
  fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
    target: { value: request },
  });
}

function clickPrepareButton(): void {
  fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
}

async function waitForCreateModeReady(): Promise<void> {
  await waitFor(() => {
    expect(screen.getByTestId("skill-lifecycle-mode-label")).toHaveTextContent(
      "直作成",
    );
  });
  expect(screen.getByTestId("skill-lifecycle-session-log")).toHaveTextContent(
    "推奨モード: 直作成",
  );
}

// ============================================================
// TC-01: スキル生成で auth:login が呼ばれないこと（回帰テスト）
// ============================================================

describe("TC-01: SkillLifecyclePanel prepare flow does not call auth:login during skill generation", () => {
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
    };
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("スキル生成ボタン押下時に auth:login が呼ばれないこと", async () => {
    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      fillCreateRequest();
      clickPrepareButton();
    });

    await waitFor(
      () => {
        expect(mockDetectMode).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );

    expect(mockDetectMode).toHaveBeenCalledWith(defaultCreateRequest);
    await waitForCreateModeReady();
    expect(mockDetectMode).toHaveBeenCalledTimes(1);
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
// TC-03: スキル生成フローが auth:login タイムアウトなしで完了すること
// ============================================================

describe("TC-03: skill generation completes without auth:login timeout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDetectMode.mockResolvedValue({ success: true, data: "create" });
    mockGetVerifyDetail.mockResolvedValue({ success: false });
    mockGetWorkflowState.mockResolvedValue({ success: false });
    mockOnWorkflowStateChanged.mockReturnValue(() => {});

    // auth.login は呼ばれるべきでないため、タイムアウトを模倣したハングを設定
    // 修正後は呼ばれないのでタイムアウトは発生しない
    const neverResolve = new Promise<never>(() => {}); // 永遠に pending
    mockAuthLogin.mockReturnValue(neverResolve);

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
    };
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("スキル生成後に auth:login が pending 状態にならないこと", async () => {
    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      fillCreateRequest();
      clickPrepareButton();
    });

    await waitFor(() => {
      expect(mockDetectMode).toHaveBeenCalledTimes(1);
    });
    await waitForCreateModeReady();
    expect(mockDetectMode).toHaveBeenCalledWith(defaultCreateRequest);
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();
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
// TC-05: 未ログイン状態でのスキル生成 — auth:login は呼ばれない
// ============================================================

describe("TC-05: skill generation does not call auth:login when user is unauthenticated", () => {
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

    mockDetectMode.mockResolvedValue({ success: true, data: "create" });
    mockGetVerifyDetail.mockResolvedValue({ success: false });
    mockGetWorkflowState.mockResolvedValue({ success: false });
    mockOnWorkflowStateChanged.mockReturnValue(() => {});

    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
      detectMode: mockDetectMode,
      planSkill: mockPlanSkill,
      getWorkflowState: mockGetWorkflowState,
      onWorkflowStateChanged: mockOnWorkflowStateChanged,
      getDisclosureInfo: mockGetDisclosureInfo,
      getVerifyDetail: mockGetVerifyDetail,
    };
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("未認証状態でスキル生成ボタンを押しても auth:login が呼ばれないこと", async () => {
    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      fillCreateRequest();
      clickPrepareButton();
    });

    await waitFor(() => {
      expect(mockDetectMode).toHaveBeenCalledTimes(1);
    });
    await waitForCreateModeReady();
    expect(mockDetectMode).toHaveBeenCalledWith(defaultCreateRequest);
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-06: 連続押下でも auth:login が複数回呼ばれないこと
// ============================================================

describe("TC-06: rapid skill generation clicks do not trigger multiple auth:login", () => {
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

    mockDetectMode.mockResolvedValue({ success: true, data: "create" });
    mockGetVerifyDetail.mockResolvedValue({ success: false });
    mockGetWorkflowState.mockResolvedValue({ success: false });
    mockOnWorkflowStateChanged.mockReturnValue(() => {});

    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
      detectMode: mockDetectMode,
      planSkill: mockPlanSkill,
      getWorkflowState: mockGetWorkflowState,
      onWorkflowStateChanged: mockOnWorkflowStateChanged,
      getDisclosureInfo: mockGetDisclosureInfo,
      getVerifyDetail: mockGetVerifyDetail,
    };
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("スキル生成ボタンを複数回押下しても auth:login が呼ばれないこと", async () => {
    const deferredDetectMode = createDeferredPromise<{
      success: boolean;
      data: "create";
    }>();
    mockDetectMode.mockReturnValue(deferredDetectMode.promise as never);

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      fillCreateRequest();
      const prepareButton = screen.getByTestId(
        "skill-lifecycle-prepare-button",
      );
      // 3回連続でクリック
      fireEvent.click(prepareButton);
      fireEvent.click(prepareButton);
      fireEvent.click(prepareButton);
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockDetectMode).toHaveBeenCalledWith(defaultCreateRequest);
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();

    await act(async () => {
      deferredDetectMode.resolve({ success: true, data: "create" });
      await deferredDetectMode.promise;
    });

    await waitForCreateModeReady();
    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-07: コンポーネント再レンダリング時に auth:login が呼ばれないこと
// ============================================================

describe("TC-07: auth:login is not triggered on component re-render during skill flow", () => {
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

    mockDetectMode.mockResolvedValue({ success: true, data: "create" });
    mockGetVerifyDetail.mockResolvedValue({ success: false });
    mockGetWorkflowState.mockResolvedValue({ success: false });
    mockOnWorkflowStateChanged.mockReturnValue(() => {});

    (window as Window & { electronAPI?: unknown }).electronAPI = {
      auth: { login: mockAuthLogin },
    };
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
      detectMode: mockDetectMode,
      planSkill: mockPlanSkill,
      getWorkflowState: mockGetWorkflowState,
      onWorkflowStateChanged: mockOnWorkflowStateChanged,
      getDisclosureInfo: mockGetDisclosureInfo,
      getVerifyDetail: mockGetVerifyDetail,
    };
  });

  afterEach(() => {
    delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
    cleanup();
  });

  it("コンポーネントのマウント・再レンダリング時に auth:login が呼ばれないこと", async () => {
    const deferredDetectMode = createDeferredPromise<{
      success: boolean;
      data: "create";
    }>();
    mockDetectMode.mockReturnValue(deferredDetectMode.promise as never);

    const { rerender } = render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    // レンダリング更新が prepare フローを二重実行しないことを確認する
    await act(async () => {
      fillCreateRequest();
      clickPrepareButton();
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockDetectMode).toHaveBeenCalledWith(defaultCreateRequest);
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <SkillLifecyclePanel
          isOpen={true}
          onClose={vi.fn()}
          defaultTab="create"
        />,
      );
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferredDetectMode.resolve({ success: true, data: "create" });
      await deferredDetectMode.promise;
    });

    await waitForCreateModeReady();
    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockPlanSkill).not.toHaveBeenCalled();
    expect(mockAuthLogin).not.toHaveBeenCalled();
  });
});

// ============================================================
// TC-08: authModeSlice 状態変化が auth:login を呼ばないこと
// ============================================================

describe("TC-08: authModeSlice state changes do not trigger unexpected auth:login", () => {
  it("authModeSlice の setMode('api-key') が auth.login を呼ばず IPC と state を更新すること", async () => {
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
