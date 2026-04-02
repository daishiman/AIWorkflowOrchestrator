/**
 * AdvancedSettingsPanel コンポーネントテスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
// P39対策: userEvent は使用しない

// Red状態: コンポーネントはまだ実装されていない
import { AdvancedSettingsPanel } from "../AdvancedSettingsPanel";

/**
 * ModelCardItem型（Phase 5で共有型として定義予定）
 */
interface ModelCardItem {
  providerId: string;
  modelId: string;
  displayName: string;
  description?: string;
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}

describe("AdvancedSettingsPanel", () => {
  const mockModels: ModelCardItem[] = [
    {
      providerId: "anthropic",
      modelId: "claude-opus-4",
      displayName: "Claude Opus 4",
      description: "Most capable model",
      healthStatus: "healthy",
      isSelected: true,
    },
    {
      providerId: "anthropic",
      modelId: "claude-sonnet-4",
      displayName: "Claude Sonnet 4",
      description: "Balanced model",
      healthStatus: "healthy",
      isSelected: false,
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    models: mockModels,
    selectedProviderId: "anthropic" as string | null,
    selectedModelId: "claude-opus-4" as string | null,
    onSelectModel: vi.fn(),
    permissionMode: "default",
    onModeChange: vi.fn(),
    rememberedCount: 3,
    onResetRemembered: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // GovernanceSummaryPanel が IPC ポーリングするため最小モックを設定
    // success: true + 最小データで ready 状態に遷移させる
    Object.defineProperty(window, "electronAPI", {
      value: {
        skillCreator: {
          getGovernanceState: vi.fn().mockResolvedValue({
            success: true,
            data: {
              phase: "plan",
              activePolicy: {
                phase: "plan",
                permissionMode: "default",
                allowedTools: [],
                disallowedTools: [],
              },
              recentAuditEvents: [],
              recentDenials: [],
            },
          }),
        },
      },
      writable: true,
      configurable: true,
    });
  });

  it("isOpen=true でパネル表示", () => {
    render(<AdvancedSettingsPanel {...defaultProps} isOpen={true} />);

    expect(screen.getByTestId("advanced-settings-panel")).toBeInTheDocument();
  });

  it("GovernanceSummaryPanel が詳細設定パネル内に描画される", async () => {
    render(<AdvancedSettingsPanel {...defaultProps} isOpen={true} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("governance-panel")).toBeInTheDocument();
    expect(screen.getByText("Governance 状態")).toBeInTheDocument();
  });

  it("isOpen=false でパネル非表示", () => {
    render(<AdvancedSettingsPanel {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByTestId("advanced-settings-panel"),
    ).not.toBeInTheDocument();
  });

  it("閉じるボタンで onClose 発火", async () => {
    const onClose = vi.fn();
    render(<AdvancedSettingsPanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: /^閉じる$/i });
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("モデル選択変更で onSelectModel 発火", async () => {
    const onSelectModel = vi.fn();
    render(
      <AdvancedSettingsPanel {...defaultProps} onSelectModel={onSelectModel} />,
    );

    // 2番目のモデル（Claude Sonnet 4）をクリック
    const sonnetOption = screen.getByText("Claude Sonnet 4");
    await act(async () => {
      fireEvent.click(sonnetOption);
    });

    expect(onSelectModel).toHaveBeenCalledWith("anthropic", "claude-sonnet-4");
  });

  it("許可モード変更で onModeChange 発火", async () => {
    const onModeChange = vi.fn();
    render(
      <AdvancedSettingsPanel {...defaultProps} onModeChange={onModeChange} />,
    );

    // 許可モードの選択肢を変更
    const modeSelector = screen.getByTestId("permission-mode-selector");
    await act(async () => {
      fireEvent.change(modeSelector, { target: { value: "acceptEdits" } });
    });

    expect(onModeChange).toHaveBeenCalledWith("acceptEdits");
  });

  it("リセットボタンで onResetRemembered 発火", async () => {
    const onResetRemembered = vi.fn();
    render(
      <AdvancedSettingsPanel
        {...defaultProps}
        onResetRemembered={onResetRemembered}
      />,
    );

    const resetButton = screen.getByRole("button", { name: /リセット/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    expect(onResetRemembered).toHaveBeenCalledTimes(1);
  });

  it("ESCキーで onClose 発火", async () => {
    const onClose = vi.fn();
    render(<AdvancedSettingsPanel {...defaultProps} onClose={onClose} />);

    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("オーバーレイクリックで onClose 発火", async () => {
    const onClose = vi.fn();
    render(<AdvancedSettingsPanel {...defaultProps} onClose={onClose} />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("advanced-settings-overlay"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // === Phase 6: テスト拡充 ===

  describe("境界値テスト", () => {
    it("models空配列でもクラッシュしない", () => {
      expect(() => {
        render(<AdvancedSettingsPanel {...defaultProps} models={[]} />);
      }).not.toThrow();

      expect(screen.getByTestId("advanced-settings-panel")).toBeInTheDocument();
    });

    it("selectedProviderId/selectedModelId が null の場合", () => {
      render(
        <AdvancedSettingsPanel
          {...defaultProps}
          selectedProviderId={null}
          selectedModelId={null}
        />,
      );

      // モデルが全て未選択（aria-checked=false）
      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute("aria-checked", "false");
      });
    });

    it("rememberedCount=0 の場合はリセットボタンが無効化される", () => {
      render(<AdvancedSettingsPanel {...defaultProps} rememberedCount={0} />);

      expect(screen.getByText("記憶された許可: 0件")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /リセット/i })).toBeDisabled();
    });
  });

  describe("組み合わせテスト", () => {
    it("モデルのdescriptionがない場合も正常表示", () => {
      const modelsWithoutDesc: ModelCardItem[] = [
        {
          providerId: "anthropic",
          modelId: "claude-opus-4",
          displayName: "Claude Opus 4",
          healthStatus: "healthy",
          isSelected: true,
        },
      ];

      render(
        <AdvancedSettingsPanel {...defaultProps} models={modelsWithoutDesc} />,
      );

      expect(screen.getByText("Claude Opus 4")).toBeInTheDocument();
    });

    it("モデル選択でキーボード操作（Enter）が動作する", async () => {
      const onSelectModel = vi.fn();
      render(
        <AdvancedSettingsPanel
          {...defaultProps}
          onSelectModel={onSelectModel}
        />,
      );

      const sonnetOption = screen
        .getByText("Claude Sonnet 4")
        .closest("[role='radio']")!;
      await act(async () => {
        fireEvent.keyDown(sonnetOption, { key: "Enter", code: "Enter" });
      });

      expect(onSelectModel).toHaveBeenCalledWith(
        "anthropic",
        "claude-sonnet-4",
      );
    });
  });

  describe("アクセシビリティテスト", () => {
    it("AIの種類 radiogroup が存在する", () => {
      render(<AdvancedSettingsPanel {...defaultProps} />);

      expect(
        screen.getByRole("radiogroup", { name: "AIの種類" }),
      ).toBeInTheDocument();
    });

    it("モデルリストのradio要素にtabIndex=0がある", () => {
      render(<AdvancedSettingsPanel {...defaultProps} />);

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute("tabindex", "0");
      });
    });
  });
});
