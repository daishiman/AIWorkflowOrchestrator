/**
 * @file ChatPanel.test.tsx
 * @description ChatPanel 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red → Green）
 * @task TASK-7D ChatPanel 統合
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ============================================
// Store Mock
// ============================================

const mockFetchSkills = vi.fn();
const mockAbortExecution = vi.fn();

let mockStoreState: Record<string, unknown> = {};

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    return selector(mockStoreState);
  }),
  useIsSkillExecuting: vi.fn(() => Boolean(mockStoreState.isExecuting)),
  useSkillStore: vi.fn(() => ({
    availableSkills: [],
    importedSkills: [],
    selectedSkillName: null,
    isLoadingSkills: false,
    isScanning: false,
    selectSkillByName: vi.fn(),
    fetchSkills: mockFetchSkills,
    rescanSkills: vi.fn(),
  })),
}));

// ============================================
// Component Mocks
// ============================================

vi.mock("../../skill/SkillSelector", () => ({
  SkillSelector: () => (
    <div data-testid="mock-skill-selector">SkillSelector</div>
  ),
}));

vi.mock("../../skill/SkillImportDialog", () => ({
  SkillImportDialog: ({
    skill,
    isOpen,
    onClose,
  }: {
    skill: { name: string };
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="mock-skill-import-dialog">
        {skill.name}
        <button data-testid="mock-import-dialog-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("../../skill/PermissionDialog", () => ({
  PermissionDialog: () => (
    <div data-testid="mock-permission-dialog">PermissionDialog</div>
  ),
}));

vi.mock("../../skill/SkillStreamingView", () => ({
  SkillStreamingView: ({
    skillName,
  }: {
    skillName: string;
    messages: unknown[];
    status: string | null;
  }) => <div data-testid="mock-skill-streaming-view">{skillName}</div>,
}));

import { ChatPanel } from "../ChatPanel";
import type { ChatPanelHandle } from "../ChatPanel";
import type { SkillMetadata } from "@repo/shared";

// ============================================
// Test Data
// ============================================

function createTestSkill(
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata {
  return {
    name: "test-skill",
    description: "Test skill",
    path: "/test/path",
    updatedAt: new Date("2025-01-01"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    ...overrides,
  };
}

// ============================================
// Helpers
// ============================================

function setStoreState(overrides: Partial<Record<string, unknown>> = {}) {
  mockStoreState = {
    selectedSkillName: null,
    streamingMessages: [],
    isExecuting: false,
    skillExecutionStatus: null,
    pendingPermission: null,
    fetchSkills: mockFetchSkills,
    abortExecution: mockAbortExecution,
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe("ChatPanel with Skills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoreState();
  });

  // ============================================================
  // 基本レンダリング
  // ============================================================
  describe("基本レンダリング", () => {
    it("should render SkillSelector in header", () => {
      render(<ChatPanel />);
      expect(screen.getByTestId("mock-skill-selector")).toBeInTheDocument();
      // Verify SkillSelector is inside header
      const header = screen.getByTestId("chat-header");
      expect(header).toContainElement(
        screen.getByTestId("mock-skill-selector"),
      );
    });

    it("should render PermissionDialog", () => {
      render(<ChatPanel />);
      expect(screen.getByTestId("mock-permission-dialog")).toBeInTheDocument();
    });

    it("should render chat panel structure", () => {
      render(<ChatPanel />);
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
      expect(screen.getByTestId("chat-header")).toBeInTheDocument();
      expect(screen.getByTestId("message-area")).toBeInTheDocument();
      expect(screen.getByTestId("input-area")).toBeInTheDocument();
    });
  });

  // ============================================================
  // SkillStreamingView 表示制御
  // ============================================================
  describe("SkillStreamingView 表示制御", () => {
    it("should show streaming view when skill is executing", () => {
      setStoreState({
        isExecuting: true,
        selectedSkillName: "test-skill",
        skillExecutionStatus: "running",
      });
      render(<ChatPanel />);
      expect(
        screen.getByTestId("mock-skill-streaming-view"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-skill-streaming-view")).toHaveTextContent(
        "test-skill",
      );
    });

    it("should hide streaming view when idle", () => {
      setStoreState({
        isExecuting: false,
        selectedSkillName: "test-skill",
      });
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-skill-streaming-view"),
      ).not.toBeInTheDocument();
    });

    it("should hide streaming view when no skill selected", () => {
      setStoreState({
        isExecuting: true,
        selectedSkillName: null,
      });
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-skill-streaming-view"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // fetchSkills 初期化
  // ============================================================
  describe("fetchSkills 初期化", () => {
    it("should call fetchSkills on mount", () => {
      render(<ChatPanel />);
      expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // エッジケース
  // ============================================================
  describe("エッジケース", () => {
    it("should render without crash when store returns initial state", () => {
      setStoreState();
      render(<ChatPanel />);
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });

    it("should handle fetchSkills being called", () => {
      mockFetchSkills.mockRejectedValueOnce(new Error("Network error"));
      render(<ChatPanel />);
      expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // アクセシビリティ
  // ============================================================
  describe("アクセシビリティ", () => {
    it("should have toolbar role on header", () => {
      render(<ChatPanel />);
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("should have aria-label on header", () => {
      render(<ChatPanel />);
      expect(screen.getByRole("toolbar")).toHaveAttribute(
        "aria-label",
        "チャット設定",
      );
    });
  });

  // ============================================================
  // SkillImportDialog 統合
  // ============================================================
  describe("SkillImportDialog 統合", () => {
    it("should show import dialog when handleImportRequest is called via ref", () => {
      const ref = React.createRef<ChatPanelHandle>();
      render(<ChatPanel ref={ref} />);

      act(() => {
        ref.current?.handleImportRequest(createTestSkill());
      });

      expect(
        screen.getByTestId("mock-skill-import-dialog"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-skill-import-dialog")).toHaveTextContent(
        "test-skill",
      );
    });

    it("should call onImportRequest callback when import requested", () => {
      const onImportRequest = vi.fn();
      const ref = React.createRef<ChatPanelHandle>();
      render(<ChatPanel ref={ref} onImportRequest={onImportRequest} />);

      const skill = createTestSkill({ name: "callback-skill" });
      act(() => {
        ref.current?.handleImportRequest(skill);
      });

      expect(onImportRequest).toHaveBeenCalledTimes(1);
      expect(onImportRequest).toHaveBeenCalledWith(skill);
    });

    it("should close import dialog when onClose is called", () => {
      const ref = React.createRef<ChatPanelHandle>();
      render(<ChatPanel ref={ref} />);

      // Open dialog
      act(() => {
        ref.current?.handleImportRequest(createTestSkill());
      });
      expect(
        screen.getByTestId("mock-skill-import-dialog"),
      ).toBeInTheDocument();

      // Close dialog
      fireEvent.click(screen.getByTestId("mock-import-dialog-close"));

      expect(
        screen.queryByTestId("mock-skill-import-dialog"),
      ).not.toBeInTheDocument();
    });

    it("should not show import dialog initially", () => {
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-skill-import-dialog"),
      ).not.toBeInTheDocument();
    });
  });
});
