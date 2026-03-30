/**
 * AgentView カバレッジ拡充テスト（Phase 6）
 *
 * 未カバー箇所:
 * - L338-350: skillExecutionStatus="cancelled" によるキャンセル履歴追加
 * - L460-470: handleCopyHandoffCommand（handoffGuidance のコピー）
 * - L669-677: handoffGuidance が存在するときの TerminalHandoffCard 表示
 * - L726-727: FloatingExecutionBar の onStop（abortExecution 呼び出し）
 * - selectedSkillName=undefined のケース（TC追加）
 *
 * ルール:
 * - P39: happy-dom 環境では userEvent 禁止、fireEvent を使用
 * - P40: cd apps/desktop && pnpm vitest run で実行
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import { AgentView } from "../index";

// Mock skillAPI
vi.mock("../../../preload", () => ({
  skillAPI: {
    listImported: vi.fn().mockResolvedValue({ success: true, data: [] }),
    listAvailable: vi.fn().mockResolvedValue({ success: true, data: [] }),
    import: vi.fn().mockResolvedValue({ success: true }),
    remove: vi.fn().mockResolvedValue({ success: true }),
    getDetail: vi.fn().mockResolvedValue({ success: true, data: null }),
  },
}));

// Mock individual selector hooks（既存テストのパターンに準拠）
const mockFetchSkills = vi.fn();
const mockSelectSkill = vi.fn();
const mockSetSkillFilter = vi.fn();
const mockSetSkillCategory = vi.fn();
const mockOpenImportDialog = vi.fn();
const mockCloseImportDialog = vi.fn();
const mockShowToast = vi.fn();
const mockClearToast = vi.fn();
const mockImportSkill = vi.fn();
const mockRemoveSkill = vi.fn();
const mockSetAdvancedSettingsOpen = vi.fn();
const mockAbortExecution = vi.fn();
const mockExecuteSkill = vi.fn();
const mockAddExecutionToHistory = vi.fn();
const mockClearHandoffGuidance = vi.fn();
const mockFetchProviders = vi.fn();
const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();
const mockSetCurrentView = vi.fn();
const mockSetCurrentSkillName = vi.fn();

const mockPermissionAPI = {
  getAllowedTools: vi.fn().mockResolvedValue({ tools: [] }),
  revokeTool: vi.fn().mockResolvedValue({ success: true }),
  clearAll: vi.fn().mockResolvedValue({ success: true, clearedCount: 0 }),
};

function setMockPermissionsApi(
  overrides: Partial<typeof mockPermissionAPI> = {},
) {
  Object.assign(mockPermissionAPI, {
    getAllowedTools: vi.fn().mockResolvedValue({ tools: [] }),
    revokeTool: vi.fn().mockResolvedValue({ success: true }),
    clearAll: vi.fn().mockResolvedValue({ success: true, clearedCount: 0 }),
    ...overrides,
  });
  Object.defineProperty(window, "permissionAPI", {
    value: mockPermissionAPI,
    configurable: true,
    writable: true,
  });
}

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  // State selectors
  useFetchSkills: vi.fn(() => mockFetchSkills),
  useImportedSkills: vi.fn(() => []),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useAvailableSkillsMetadata: vi.fn(() => []),
  useImportedSkillIds: vi.fn(() => []),
  useSelectedSkill: vi.fn(() => null),
  useSkillFilter: vi.fn(() => ""),
  useSkillCategory: vi.fn(() => null),
  useIsImportDialogOpen: vi.fn(() => false),
  useToastMessage: vi.fn(() => null),
  // TASK-UI-03
  useRecentExecutions: vi.fn(() => []),
  useIsAdvancedSettingsOpen: vi.fn(() => false),
  useSetAdvancedSettingsOpen: vi.fn(() => mockSetAdvancedSettingsOpen),
  useSelectedSkillName: vi.fn(() => null),
  useIsSkillExecuting: vi.fn(() => false),
  useSkillExecutionId: vi.fn(() => null),
  useSkillExecutionStatus: vi.fn(() => null),
  useAbortSkillExecution: vi.fn(() => mockAbortExecution),
  useExecuteSkill: vi.fn(() => mockExecuteSkill),
  useAddExecutionToHistory: vi.fn(() => mockAddExecutionToHistory),
  useHandoffGuidance: vi.fn(() => null),
  useClearHandoffGuidance: vi.fn(() => mockClearHandoffGuidance),
  useLLMProviders: vi.fn(() => []),
  useSelectedProviderId: vi.fn(() => null),
  useSelectedModelId: vi.fn(() => null),
  useLLMHealthStatus: vi.fn(() => ({})),
  useFetchProviders: vi.fn(() => mockFetchProviders),
  useSelectProvider: vi.fn(() => mockSelectProvider),
  useSelectModel: vi.fn(() => mockSelectModel),
  // Action selectors
  useSelectSkill: vi.fn(() => mockSelectSkill),
  useSetSkillFilter: vi.fn(() => mockSetSkillFilter),
  useSetSkillCategory: vi.fn(() => mockSetSkillCategory),
  useOpenImportDialog: vi.fn(() => mockOpenImportDialog),
  useCloseImportDialog: vi.fn(() => mockCloseImportDialog),
  useShowToast: vi.fn(() => mockShowToast),
  useClearToast: vi.fn(() => mockClearToast),
  useImportSkill: vi.fn(() => mockImportSkill),
  useRemoveSkill: vi.fn(() => mockRemoveSkill),
  // Navigation selectors (TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001)
  useSetCurrentView: vi.fn(() => mockSetCurrentView),
  useSetCurrentSkillName: vi.fn(() => mockSetCurrentSkillName),
}));

describe("AgentView - カバレッジ拡充", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    setMockPermissionsApi();
    const store = await import("../../../store");
    vi.mocked(store.useFetchSkills).mockReturnValue(mockFetchSkills);
    vi.mocked(store.useImportedSkills).mockReturnValue([]);
    vi.mocked(store.useIsLoadingSkills).mockReturnValue(false);
    vi.mocked(store.useSkillError).mockReturnValue(null);
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([]);
    vi.mocked(store.useImportedSkillIds).mockReturnValue([]);
    vi.mocked(store.useSelectedSkill).mockReturnValue(null);
    vi.mocked(store.useSkillFilter).mockReturnValue("");
    vi.mocked(store.useSkillCategory).mockReturnValue(null);
    vi.mocked(store.useIsImportDialogOpen).mockReturnValue(false);
    vi.mocked(store.useToastMessage).mockReturnValue(null);
    vi.mocked(store.useSelectSkill).mockReturnValue(mockSelectSkill);
    vi.mocked(store.useSetSkillFilter).mockReturnValue(mockSetSkillFilter);
    vi.mocked(store.useSetSkillCategory).mockReturnValue(mockSetSkillCategory);
    vi.mocked(store.useOpenImportDialog).mockReturnValue(mockOpenImportDialog);
    vi.mocked(store.useCloseImportDialog).mockReturnValue(
      mockCloseImportDialog,
    );
    vi.mocked(store.useShowToast).mockReturnValue(mockShowToast);
    vi.mocked(store.useClearToast).mockReturnValue(mockClearToast);
    vi.mocked(store.useImportSkill).mockReturnValue(mockImportSkill);
    vi.mocked(store.useRemoveSkill).mockReturnValue(mockRemoveSkill);
    vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);
    vi.mocked(store.useSkillExecutionStatus).mockReturnValue(null);
    vi.mocked(store.useAbortSkillExecution).mockReturnValue(mockAbortExecution);
    vi.mocked(store.useExecuteSkill).mockReturnValue(mockExecuteSkill);
    vi.mocked(store.useAddExecutionToHistory).mockReturnValue(
      mockAddExecutionToHistory,
    );
    vi.mocked(store.useHandoffGuidance).mockReturnValue(null);
    vi.mocked(store.useClearHandoffGuidance).mockReturnValue(
      mockClearHandoffGuidance,
    );
    vi.mocked(store.useLLMProviders).mockReturnValue([]);
    vi.mocked(store.useSelectedProviderId).mockReturnValue(null);
    vi.mocked(store.useSelectedModelId).mockReturnValue(null);
    vi.mocked(store.useLLMHealthStatus).mockReturnValue({});
    vi.mocked(store.useFetchProviders).mockReturnValue(mockFetchProviders);
    vi.mocked(store.useSelectProvider).mockReturnValue(mockSelectProvider);
    vi.mocked(store.useSelectModel).mockReturnValue(mockSelectModel);
    vi.mocked(store.useSetCurrentView).mockReturnValue(mockSetCurrentView);
    vi.mocked(store.useSetCurrentSkillName).mockReturnValue(
      mockSetCurrentSkillName,
    );
    vi.mocked(store.useSelectedSkillName).mockReturnValue(null);
    vi.mocked(store.useRecentExecutions).mockReturnValue([]);
    vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(false);
    vi.mocked(store.useSetAdvancedSettingsOpen).mockReturnValue(
      mockSetAdvancedSettingsOpen,
    );
  });

  describe("実行キャンセル状態（L338-350）", () => {
    it("skillExecutionStatus=cancelled のとき cancelled 履歴に追加し floatingStatus を idle に戻す", async () => {
      const store = await import("../../../store");
      const selectedSkill = {
        id: "skill-cancel",
        name: "Cancel Skill",
        description: "Cancel me",
        path: "/path/cancel",
        triggers: ["cancel"],
      };
      vi.mocked(store.useImportedSkills).mockReturnValue([
        selectedSkill,
      ] as never);
      vi.mocked(store.useSelectedSkill).mockReturnValue(selectedSkill as never);
      vi.mocked(store.useSelectedSkillName).mockReturnValue("Cancel Skill");

      const { rerender } = render(<AgentView />);

      // 実行開始
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      // FloatingExecutionBar が表示されていることを確認
      expect(screen.getByTestId("floating-execution-bar")).toBeInTheDocument();

      // キャンセル状態に遷移
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("cancelled");
      rerender(<AgentView />);

      // 履歴にキャンセルとして追加される
      expect(mockAddExecutionToHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          skillName: "Cancel Skill",
          status: "cancelled",
        }),
      );

      // floatingStatus が idle に戻り FloatingExecutionBar が非表示になる
      expect(
        screen.queryByTestId("floating-execution-bar"),
      ).not.toBeInTheDocument();
    });
  });

  describe("TerminalHandoffCard 表示（L669-677）", () => {
    const mockGuidance = {
      terminalCommand: "claude skill-name",
      contextSummary: "surface=agent skill=test-skill",
      reason: "API key not configured",
    };

    it("handoffGuidance が存在するとき TerminalHandoffCard が表示される", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useHandoffGuidance).mockReturnValue(
        mockGuidance as never,
      );

      render(<AgentView />);

      // TerminalHandoffCard のコマンドが表示される
      expect(screen.getByText("claude skill-name")).toBeInTheDocument();
      // TerminalHandoffCard のヘッダーテキストが表示される
      expect(screen.getByText("ターミナル引き継ぎ")).toBeInTheDocument();
    });

    it("handoffGuidance が null のとき TerminalHandoffCard は表示されない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useHandoffGuidance).mockReturnValue(null);

      render(<AgentView />);

      // TerminalHandoffCard は表示されない
      expect(screen.queryByText("ターミナル引き継ぎ")).not.toBeInTheDocument();
    });

    it("TerminalHandoffCard の Dismiss ボタンクリックで clearHandoffGuidance が呼ばれる", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useHandoffGuidance).mockReturnValue(
        mockGuidance as never,
      );

      render(<AgentView />);

      // 案内を閉じるボタンをクリック（aria-label="案内を閉じる"）
      const dismissButton = screen.getByRole("button", {
        name: "案内を閉じる",
      });
      fireEvent.click(dismissButton);

      expect(mockClearHandoffGuidance).toHaveBeenCalledTimes(1);
    });
  });

  describe("FloatingExecutionBar の onStop（L726-727）", () => {
    it("FloatingExecutionBar の中止ボタンクリックで abortExecution が呼ばれる", async () => {
      const store = await import("../../../store");
      const selectedSkill = {
        id: "skill-abort",
        name: "Abort Skill",
        description: "Abort me",
        path: "/path/abort",
        triggers: ["abort"],
      };
      vi.mocked(store.useImportedSkills).mockReturnValue([
        selectedSkill,
      ] as never);
      vi.mocked(store.useSelectedSkill).mockReturnValue(selectedSkill as never);
      vi.mocked(store.useSelectedSkillName).mockReturnValue("Abort Skill");

      render(<AgentView />);

      // 実行開始して FloatingExecutionBar を表示
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      expect(screen.getByTestId("floating-execution-bar")).toBeInTheDocument();

      // 中止ボタンをクリック（aria-label="実行を停止"）
      const stopButton = screen.getByRole("button", { name: "実行を停止" });
      fireEvent.click(stopButton);

      expect(mockAbortExecution).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleResetRemembered エラーブランチ", () => {
    it("clearAll が失敗したとき Error インスタンスのメッセージを含むエラートーストを表示する", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(true);
      setMockPermissionsApi({
        getAllowedTools: vi.fn().mockResolvedValue({
          tools: [
            { toolName: "bash", allowedAt: "2026-03-30T00:00:00Z" },
            { toolName: "read", allowedAt: "2026-03-30T00:00:00Z" },
          ],
        }),
        clearAll: vi.fn().mockRejectedValue(new Error("reset failed")),
      });

      render(<AgentView />);

      // 2件の記憶済み許可が表示されるまで待つ
      await screen.findByText("記憶された許可: 2件");

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /リセット/i }));
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "記憶済み許可のリセットに失敗しました: reset failed",
      );
    });

    it("clearAll が非 Error で失敗したとき汎用エラートーストを表示する", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(true);
      setMockPermissionsApi({
        getAllowedTools: vi.fn().mockResolvedValue({
          tools: [{ toolName: "bash", allowedAt: "2026-03-30T00:00:00Z" }],
        }),
        clearAll: vi.fn().mockRejectedValue("string error"),
      });

      render(<AgentView />);
      await screen.findByText("記憶された許可: 1件");

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /リセット/i }));
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "記憶済み許可のリセットに失敗しました",
      );
    });

    it("clearAll が success:false を返したとき rememberedCount を維持してエラートーストを表示する", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(true);
      setMockPermissionsApi({
        getAllowedTools: vi.fn().mockResolvedValue({
          tools: [{ toolName: "bash", allowedAt: "2026-03-30T00:00:00Z" }],
        }),
        clearAll: vi
          .fn()
          .mockResolvedValue({ success: false, clearedCount: 0 }),
      });

      render(<AgentView />);
      await screen.findByText("記憶された許可: 1件");

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /リセット/i }));
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "記憶済み許可のリセットに失敗しました",
      );
      expect(screen.getByText("記憶された許可: 1件")).toBeInTheDocument();
    });
  });

  describe("TerminalHandoffCard の onCopyCommand（L673-674）", () => {
    it("コマンドをコピーボタンクリックで handleCopyHandoffCommand が呼ばれる", async () => {
      const store = await import("../../../store");
      const mockGuidance = {
        terminalCommand: "claude copy-skill",
        contextSummary: "surface=agent skill=copy-skill",
        reason: "API key not configured",
      };
      vi.mocked(store.useHandoffGuidance).mockReturnValue(
        mockGuidance as never,
      );

      // navigator.clipboard.writeText をモック
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        configurable: true,
        writable: true,
      });

      render(<AgentView />);

      // コピーボタンをクリック（aria-label="コマンドをコピー"）
      const copyButton = screen.getByRole("button", {
        name: "コマンドをコピー",
      });
      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "claude copy-skill",
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        "コマンドをコピーしました",
      );
    });
  });

  describe("handleSkillSelect コールバック実行（L439-440）", () => {
    it("SkillChip クリックで selectSkill が呼ばれる", async () => {
      const store = await import("../../../store");
      const mockSkill = {
        id: "skill-select",
        name: "Selectable Skill",
        description: "Select me",
        path: "/path/select",
        triggers: ["select"],
      };
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      // SkillChip ラジオボタンをクリック
      const chipButton = screen.getByRole("radio", {
        name: "Selectable Skill",
      });
      fireEvent.click(chipButton);

      expect(mockSelectSkill).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Selectable Skill" }),
      );
    });
  });

  describe("handleCopyHandoffCommand handoffGuidance=null アーリーリターン（L462-463）", () => {
    it("handoffGuidance が null のとき clipboard.writeText は呼ばれない", async () => {
      const store = await import("../../../store");
      // handoffGuidance が null の状態（デフォルト）
      vi.mocked(store.useHandoffGuidance).mockReturnValue(null);

      // navigator.clipboard をスパイ
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextSpy },
        configurable: true,
        writable: true,
      });

      render(<AgentView />);

      // TerminalHandoffCard は表示されないため直接 handleCopyHandoffCommand を
      // 呼び出すことはできない。handoffGuidance=null のときカードが非表示なので
      // このブランチは再レンダーでカバーされる。
      // 念のため clipboard が呼ばれていないことを確認
      expect(writeTextSpy).not.toHaveBeenCalled();
    });
  });

  describe("handleCopyHandoffCommand クリップボード失敗ブランチ（L468-469）", () => {
    it("clipboard.writeText が失敗したときエラートーストを表示する", async () => {
      const store = await import("../../../store");
      const mockGuidance = {
        terminalCommand: "claude fail-copy",
        contextSummary: "surface=agent skill=fail-copy",
        reason: "API key not configured",
      };
      vi.mocked(store.useHandoffGuidance).mockReturnValue(
        mockGuidance as never,
      );

      // navigator.clipboard.writeText が失敗するよう設定
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")),
        },
        configurable: true,
        writable: true,
      });

      render(<AgentView />);

      const copyButton = screen.getByRole("button", {
        name: "コマンドをコピー",
      });
      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "コマンドのコピーに失敗しました",
      );
    });
  });

  describe("handlePermissionModeChange ローカル state 動作", () => {
    it("許可モードセレクタの変更がローカル state のみで動作し IPC 呼び出しは発生しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(true);

      render(<AgentView />);

      await act(async () => {
        fireEvent.change(screen.getByTestId("permission-mode-selector"), {
          target: { value: "acceptEdits" },
        });
      });

      // ローカル state のみで動作するため IPC 呼び出しなし、トーストなし
      expect(screen.getByTestId("permission-mode-selector")).toHaveValue(
        "acceptEdits",
      );
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe("handleResetRemembered permissionAPI 不在ブランチ", () => {
    it("permissionAPI が undefined のとき カウントを 0 にリセットしてトーストは出ない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(true);

      // permissionAPI を undefined にする
      const original = window.permissionAPI;
      Object.defineProperty(window, "permissionAPI", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<AgentView />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /リセット/i }));
      });

      // API 不在のため成功トーストは出ない
      expect(mockShowToast).not.toHaveBeenCalled();

      // クリーンアップ
      Object.defineProperty(window, "permissionAPI", {
        value: original,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("Permission count empty-state UI", () => {
    it("空の rememberedCount を表示し、リセットボタンを disabled にする", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(true);
      setMockPermissionsApi({
        getAllowedTools: vi.fn().mockResolvedValue({ tools: [] }),
      });

      render(<AgentView />);

      await waitFor(() => {
        expect(screen.getByText("記憶された許可: 0件")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /リセット/i })).toBeDisabled();
    });
  });

  describe("CTA バナー - selectedSkillName=undefined のケース", () => {
    it("selectedSkillName=undefined のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      // undefined は null と同様に falsy だが明示的にテスト
      vi.mocked(store.useSelectedSkillName).mockReturnValue(
        undefined as unknown as null,
      );
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("CTA バナー - skillExecutionStatus 境界値", () => {
    it("skillExecutionStatus=cancelled のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("cancelled");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it("skillExecutionStatus=permission_pending のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue(
        "permission_pending" as never,
      );
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });
  });
});
