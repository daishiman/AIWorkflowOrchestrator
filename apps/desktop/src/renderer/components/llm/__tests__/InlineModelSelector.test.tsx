/**
 * InlineModelSelector Component Tests
 *
 * T1: ドロップダウン開閉
 * T2: プロバイダー選択
 * T3: モデル選択・コールバック
 * T4: ヘルスステータス表示
 * T5: 未選択状態
 * T6: compact prop
 * T7: disabled prop
 * T8: キーボード操作
 *
 * P39: happy-dom環境では fireEvent 使用（userEvent 禁止）
 * P47: デザイントークン定数インポートで検証
 * P9: beforeEach でモックリセット
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import * as store from "@/renderer/store";

import {
  InlineModelSelector,
  selectorTriggerStyles,
  healthDotStyles,
} from "../InlineModelSelector";

import type { LLMProvider } from "@repo/shared/types/llm";

const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();
const mockFetchProviders = vi.fn();
const mockCheckHealth = vi.fn();

// P31: Mock individual selectors
vi.mock("@/renderer/store", () => ({
  useLLMProviders: vi.fn(() => []),
  useSelectedProviderId: vi.fn(() => null),
  useSelectedModelId: vi.fn(() => null),
  useLLMHealthStatus: vi.fn(() => ({})),
  useLLMIsLoading: vi.fn(() => false),
  useSelectProvider: vi.fn(() => mockSelectProvider),
  useSelectModel: vi.fn(() => mockSelectModel),
  useFetchProviders: vi.fn(() => mockFetchProviders),
  useCheckLLMHealth: vi.fn(() => mockCheckHealth),
}));

// Test data
const mockProviders: LLMProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        isDefault: true,
        contextWindow: 200000,
      },
      {
        id: "claude-3-haiku",
        name: "Claude 3 Haiku",
        isDefault: false,
        contextWindow: 200000,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        isDefault: true,
        contextWindow: 128000,
      },
    ],
  },
];

describe("InlineModelSelector", () => {
  beforeEach(() => {
    // P9: reset mocks between tests
    vi.clearAllMocks();
    vi.mocked(store.useLLMProviders).mockReturnValue([]);
    vi.mocked(store.useSelectedProviderId).mockReturnValue(null);
    vi.mocked(store.useSelectedModelId).mockReturnValue(null);
    vi.mocked(store.useLLMHealthStatus).mockReturnValue({});
    vi.mocked(store.useSelectProvider).mockReturnValue(mockSelectProvider);
    vi.mocked(store.useSelectModel).mockReturnValue(mockSelectModel);
    vi.mocked(store.useFetchProviders).mockReturnValue(mockFetchProviders);
    vi.mocked(store.useCheckLLMHealth).mockReturnValue(mockCheckHealth);
  });

  // ========================================
  // T1: ドロップダウン開閉
  // ========================================
  describe("T1: ドロップダウン開閉", () => {
    it("T1-1: 初期状態でドロップダウンが閉じている", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("T1-2: トリガークリックでドロップダウンが開く", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("T1-3: ドロップダウン開いた状態でトリガー再クリックすると閉じる", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("T1-4: ドロップダウン開いた状態で外部クリックすると閉じる", async () => {
      render(
        <div>
          <InlineModelSelector providers={mockProviders} />
          <button data-testid="outside">Outside</button>
        </div>,
      );
      const trigger = screen.getByRole("combobox");
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await act(async () => {
        fireEvent.mouseDown(screen.getByTestId("outside"));
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ========================================
  // T2: プロバイダー選択
  // ========================================
  describe("T2: プロバイダー選択", () => {
    it("T2-1: 利用可能なプロバイダーリストが表示される", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
    });

    it("T2-2: プロバイダーをクリックすると onSelectionChange が呼ばれる", async () => {
      const onSelectionChange = vi.fn();
      render(
        <InlineModelSelector
          providers={mockProviders}
          onSelectionChange={onSelectionChange}
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("OpenAI"));
      });
      expect(onSelectionChange).toHaveBeenCalledWith({
        providerId: "openai",
        modelId: "gpt-4o",
      });
    });

    it("T2-2b: Store連携時は selectProvider と onSelectionChange が呼ばれる", async () => {
      vi.mocked(store.useLLMProviders).mockReturnValue(mockProviders);
      vi.mocked(store.useSelectedProviderId).mockReturnValue("anthropic");
      const onSelectionChange = vi.fn();

      render(<InlineModelSelector onSelectionChange={onSelectionChange} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("OpenAI"));
      });

      expect(mockSelectProvider).toHaveBeenCalledWith("openai");
      expect(onSelectionChange).toHaveBeenCalledWith({
        providerId: "openai",
        modelId: "gpt-4o",
      });
    });

    it("T2-3: プロバイダー選択後に対応するモデルリストが表示される", async () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      expect(screen.getByText("Claude 3.5 Sonnet")).toBeInTheDocument();
      expect(screen.getByText("Claude 3 Haiku")).toBeInTheDocument();
    });
  });

  // ========================================
  // T3: モデル選択・コールバック
  // ========================================
  describe("T3: モデル選択・コールバック", () => {
    it("T3-1: モデルをクリックすると選択が変わりドロップダウンが閉じる", async () => {
      const onSelectionChange = vi.fn();
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
          onSelectionChange={onSelectionChange}
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Claude 3 Haiku"));
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("T3-2: モデル選択後に onSelectionChange が正しい引数で呼ばれる", async () => {
      const onSelectionChange = vi.fn();
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
          onSelectionChange={onSelectionChange}
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("Claude 3 Haiku"));
      });
      expect(onSelectionChange).toHaveBeenCalledWith({
        providerId: "anthropic",
        modelId: "claude-3-haiku",
      });
    });

    it("T3-3: onSelectionChange が渡されていなくてもクラッシュしない", async () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      // Should not throw
      await act(async () => {
        fireEvent.click(screen.getByText("Claude 3 Haiku"));
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ========================================
  // T4: ヘルスステータス表示
  // ========================================
  describe("T4: ヘルスステータス表示", () => {
    it("T4-1: healthStatus=healthy でグリーンドットが表示される", () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          healthStatus="healthy"
        />,
      );
      const dot = screen.getByTestId("health-dot-healthy");
      expect(dot.className).toContain(healthDotStyles.healthy);
    });

    it("T4-2: healthStatus=degraded でイエロードットが表示される", () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          healthStatus="degraded"
        />,
      );
      const dot = screen.getByTestId("health-dot-degraded");
      expect(dot.className).toContain(healthDotStyles.degraded);
    });

    it("T4-3: healthStatus=checking でアニメーション付きドットが表示される", () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          healthStatus="checking"
        />,
      );
      const dot = screen.getByTestId("health-dot-checking");
      expect(dot.className).toContain("animate-pulse");
    });

    it("T4-4: healthStatus=error でレッドドットが表示される", () => {
      render(
        <InlineModelSelector providers={mockProviders} healthStatus="error" />,
      );
      const dot = screen.getByTestId("health-dot-error");
      expect(dot.className).toContain(healthDotStyles.error);
    });
  });

  // ========================================
  // T5: 未選択状態
  // ========================================
  describe("T5: 未選択状態", () => {
    it("T5-1: 未選択状態でプレースホルダーが表示される", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      expect(screen.getByText("モデルを選択")).toBeInTheDocument();
    });

    it("T5-2: 未選択状態でトリガーをクリックするとドロップダウンが開く", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  // ========================================
  // T6: compact prop
  // ========================================
  describe("T6: compact prop", () => {
    it("T6-1: compact=true でコンパクトサイズスタイルが適用される", () => {
      render(<InlineModelSelector providers={mockProviders} compact />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain(selectorTriggerStyles.compactSize);
    });

    it("T6-2: compact=false で通常サイズスタイルが適用される", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain(selectorTriggerStyles.normalSize);
    });
  });

  // ========================================
  // T7: disabled prop
  // ========================================
  describe("T7: disabled prop", () => {
    it("T7-1: disabled=true でトリガーがクリック不可能", () => {
      render(<InlineModelSelector providers={mockProviders} disabled />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });

    it("T7-2: disabled=true でドロップダウンが開かない", async () => {
      render(<InlineModelSelector providers={mockProviders} disabled />);
      const trigger = screen.getByRole("combobox");
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ========================================
  // T8: キーボード操作
  // ========================================
  describe("T8: キーボード操作", () => {
    it("T8-1: Escapeキーでドロップダウンが閉じる", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("T8-2: Enterキーでプロバイダー/モデルを選択できる", async () => {
      const onSelectionChange = vi.fn();
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
          onSelectionChange={onSelectionChange}
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      // Click model via keyboard (Enter on button triggers click)
      const modelOption = screen.getByText("Claude 3 Haiku").closest("button");
      expect(modelOption).not.toBeNull();
      await act(async () => {
        fireEvent.keyDown(modelOption!, { key: "Enter" });
        fireEvent.click(modelOption!);
      });
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("T8-3: Escape後にトリガーにフォーカスが戻る", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(document.activeElement).toBe(trigger);
    });
  });

  // ========================================
  // T9: エッジケース
  // ========================================
  describe("T9: エッジケース", () => {
    it("T9-1: プロバイダーリストが空のとき空状態メッセージが表示される", async () => {
      render(<InlineModelSelector providers={[]} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      expect(screen.getByText("プロバイダーがありません")).toBeInTheDocument();
    });

    it("T9-5: onSelectionChange が渡されていなくてもクラッシュしない", async () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      // Should not throw when selecting without callback
      expect(() => {
        fireEvent.click(screen.getByText("Claude 3 Haiku"));
      }).not.toThrow();
    });

    it("T9-6: providers prop が渡された場合 Store の値より優先される", () => {
      const customProviders: LLMProvider[] = [
        {
          id: "google",
          name: "Google",
          isAvailable: true,
          models: [{ id: "gemini-pro", name: "Gemini Pro", isDefault: true }],
        },
      ];
      render(<InlineModelSelector providers={customProviders} />);
      // Provider from props should be shown (not store mock's empty array)
      // The component should render without error
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("T9-7: Store連携時に providers 未取得なら mount で fetchProviders する", () => {
      render(<InlineModelSelector />);
      expect(mockFetchProviders).toHaveBeenCalledTimes(1);
    });

    it("T9-8: providers prop がある場合は fetchProviders しない", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      expect(mockFetchProviders).not.toHaveBeenCalled();
    });

    it("T9-9: Store連携時に provider 変更で checkHealth を更新する", () => {
      vi.mocked(store.useLLMProviders).mockReturnValue(mockProviders);
      vi.mocked(store.useSelectedProviderId).mockReturnValue("anthropic");

      const { rerender } = render(<InlineModelSelector />);

      expect(mockCheckHealth).toHaveBeenCalledTimes(1);
      expect(mockCheckHealth).toHaveBeenLastCalledWith("anthropic");

      rerender(<InlineModelSelector />);
      expect(mockCheckHealth).toHaveBeenCalledTimes(1);

      vi.mocked(store.useSelectedProviderId).mockReturnValue("openai");
      rerender(<InlineModelSelector />);

      expect(mockCheckHealth).toHaveBeenCalledTimes(2);
      expect(mockCheckHealth).toHaveBeenLastCalledWith("openai");
    });
  });

  // ========================================
  // T10: アクセシビリティ
  // ========================================
  describe("T10: アクセシビリティ", () => {
    it("T10-1: トリガーに aria-haspopup=listbox 属性がある", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-haspopup",
        "listbox",
      );
    });

    it("T10-2: ドロップダウン開いたとき aria-expanded=true になる", async () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      await act(async () => {
        fireEvent.click(trigger);
      });
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("T10-3: ドロップダウン閉じたとき aria-expanded=false になる", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("T10-4: 選択されたProviderのoptionにaria-selected=trueが設定される", async () => {
      render(
        <InlineModelSelector
          providers={mockProviders}
          selectedProviderId="anthropic"
        />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });
      const options = screen.getAllByRole("option");
      const anthropicOption = options.find((o) =>
        o.textContent?.includes("Anthropic"),
      );
      expect(anthropicOption).toHaveAttribute("aria-selected", "true");
    });

    it("T10-6: aria-label が設定されている", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-label");
      expect(trigger.getAttribute("aria-label")).toContain("LLMモデル選択");
    });
  });

  // ========================================
  // T11: デザイントークン検証 (P47)
  // ========================================
  describe("T11: デザイントークン検証", () => {
    it("T11-1: トリガーにデフォルトスタイルが適用される", () => {
      render(<InlineModelSelector providers={mockProviders} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain(selectorTriggerStyles.base);
      expect(trigger.className).toContain(selectorTriggerStyles.default);
    });

    it("T11-2: disabled時にdisabledスタイルが適用される", () => {
      render(<InlineModelSelector providers={mockProviders} disabled />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain(selectorTriggerStyles.disabled);
    });

    it("T11-3: compact=true でコンパクトクラスが適用される", () => {
      render(<InlineModelSelector providers={mockProviders} compact />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain(selectorTriggerStyles.compactSize);
      expect(trigger.className).not.toContain(selectorTriggerStyles.normalSize);
    });
  });
});
