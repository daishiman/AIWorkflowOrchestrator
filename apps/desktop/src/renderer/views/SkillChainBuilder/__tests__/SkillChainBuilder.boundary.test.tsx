/**
 * SkillChainBuilder 境界値・エラー・a11y テスト
 *
 * Phase 6 テスト拡充: 境界値テスト、IPCエラー、a11yテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { SkillChainDefinition } from "@repo/shared/types/skill-chain";

// --- useChainList モック ---
const mockRefetch = vi.fn();
const mockDeleteChain = vi.fn();

let mockUseChainListReturn: {
  chains: SkillChainDefinition[];
  isLoading: boolean;
  error: string | null;
  refetch: typeof mockRefetch;
  deleteChain: typeof mockDeleteChain;
};

vi.mock("../hooks/useChainList", () => ({
  useChainList: () => mockUseChainListReturn,
}));

// --- useChainEditor モック ---
const mockLoadChain = vi.fn();
const mockInitNewChain = vi.fn();

let mockUseChainEditorReturn: Record<string, unknown>;

vi.mock("../hooks/useChainEditor", () => ({
  useChainEditor: () => mockUseChainEditorReturn,
}));

// --- 子コンポーネントモック ---
vi.mock("../components/ChainCardGrid", () => ({
  ChainCardGrid: vi.fn(
    ({
      chains,
    }: {
      chains: SkillChainDefinition[];
      onSelect: (id: string) => void;
    }) => (
      <div data-testid="chain-card-grid">
        {chains.map((c) => (
          <div key={c.id} data-testid={`chain-card-${c.id}`}>
            {c.name}
          </div>
        ))}
      </div>
    ),
  ),
}));

vi.mock("../components/ChainEditor", () => ({
  ChainEditor: vi.fn(() => <div data-testid="chain-editor">Editor</div>),
}));

vi.mock("../components/CreateChainDialog", () => ({
  CreateChainDialog: vi.fn(({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-chain-dialog" /> : null,
  ),
}));

import { SkillChainBuilder } from "../index";

// --- テストデータファクトリ ---
const createMockChain = (
  overrides: Partial<SkillChainDefinition> = {},
): SkillChainDefinition => ({
  id: "chain-001",
  name: "テストチェーン",
  description: "テスト用のチェーン",
  steps: [],
  variables: {},
  errorHandling: "stop",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("SkillChainBuilder - 境界値テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainListReturn = {
      chains: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      deleteChain: mockDeleteChain,
    };

    mockUseChainEditorReturn = {
      chain: null,
      isSaving: false,
      isExecuting: false,
      executionResult: null,
      error: null,
      loadChain: mockLoadChain,
      initNewChain: mockInitNewChain,
      saveChain: vi.fn(),
      executeChain: vi.fn(),
      addStep: vi.fn(),
      removeStep: vi.fn(),
      moveStep: vi.fn(),
      updateName: vi.fn(),
      updateDescription: vi.fn(),
      updateVariable: vi.fn(),
      removeVariable: vi.fn(),
    };
  });

  it("100件以上のチェーンが正常に表示される", () => {
    const chains = Array.from({ length: 120 }, (_, i) =>
      createMockChain({ id: `chain-${i}`, name: `チェーン${i}` }),
    );
    mockUseChainListReturn.chains = chains;

    render(<SkillChainBuilder />);

    expect(screen.getByTestId("chain-card-grid")).toBeInTheDocument();
    expect(screen.getByTestId("chain-card-chain-0")).toBeInTheDocument();
    expect(screen.getByTestId("chain-card-chain-119")).toBeInTheDocument();
  });

  it("長い名前のチェーンが正常に表示される", () => {
    const longName = "あ".repeat(200);
    mockUseChainListReturn.chains = [
      createMockChain({ id: "long", name: longName }),
    ];

    render(<SkillChainBuilder />);

    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  it("空文字の検索でフィルタが無効化される（全件表示）", async () => {
    mockUseChainListReturn.chains = [
      createMockChain({ id: "c1", name: "チェーン1" }),
      createMockChain({ id: "c2", name: "チェーン2" }),
    ];

    render(<SkillChainBuilder />);

    const searchInput = screen.getByTestId("chain-search-input");

    // 空文字入力
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "" } });
    });

    expect(screen.getByTestId("chain-card-c1")).toBeInTheDocument();
    expect(screen.getByTestId("chain-card-c2")).toBeInTheDocument();
  });

  it("スペースのみの検索で全件表示される（trimロジック確認）", async () => {
    mockUseChainListReturn.chains = [
      createMockChain({ id: "c1", name: "チェーン1" }),
    ];

    render(<SkillChainBuilder />);

    const searchInput = screen.getByTestId("chain-search-input");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "   " } });
    });

    // スペースのみの場合、trimされて空文字になり全件表示
    expect(screen.getByTestId("chain-card-c1")).toBeInTheDocument();
  });
});

describe("SkillChainBuilder - エラー系テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainListReturn = {
      chains: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      deleteChain: mockDeleteChain,
    };

    mockUseChainEditorReturn = {
      chain: null,
      isSaving: false,
      isExecuting: false,
      executionResult: null,
      error: null,
      loadChain: mockLoadChain,
      initNewChain: mockInitNewChain,
      saveChain: vi.fn(),
      executeChain: vi.fn(),
      addStep: vi.fn(),
      removeStep: vi.fn(),
      moveStep: vi.fn(),
      updateName: vi.fn(),
      updateDescription: vi.fn(),
      updateVariable: vi.fn(),
      removeVariable: vi.fn(),
    };
  });

  it("長いエラーメッセージが正常に表示される", () => {
    const longError = "エラー: " + "x".repeat(500);
    mockUseChainListReturn.error = longError;

    render(<SkillChainBuilder />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    // ErrorDisplayが「エラーが発生しました: {message}」の形式で表示する
    expect(screen.getByText(/x{500}/)).toBeInTheDocument();
  });

  it("ネットワークタイムアウトエラーが表示される", () => {
    mockUseChainListReturn.error =
      "ネットワークタイムアウト: 接続がタイムアウトしました";

    render(<SkillChainBuilder />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/ネットワークタイムアウト/)).toBeInTheDocument();
  });

  it("再試行ボタンクリック後にエラーがクリアされない（hookの責務）", () => {
    mockUseChainListReturn.error = "取得失敗";

    render(<SkillChainBuilder />);

    const retryButton = screen.getByText("再試行");
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledOnce();
    // エラークリアはhookの責務のため、ビュー側では引き続きエラー表示
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("SkillChainBuilder - a11y テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainListReturn = {
      chains: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      deleteChain: mockDeleteChain,
    };

    mockUseChainEditorReturn = {
      chain: null,
      isSaving: false,
      isExecuting: false,
      executionResult: null,
      error: null,
      loadChain: mockLoadChain,
      initNewChain: mockInitNewChain,
      saveChain: vi.fn(),
      executeChain: vi.fn(),
      addStep: vi.fn(),
      removeStep: vi.fn(),
      moveStep: vi.fn(),
      updateName: vi.fn(),
      updateDescription: vi.fn(),
      updateVariable: vi.fn(),
      removeVariable: vi.fn(),
    };
  });

  it("検索入力にaria-labelが設定されている", () => {
    mockUseChainListReturn.chains = [createMockChain()];

    render(<SkillChainBuilder />);

    const searchInput = screen.getByLabelText("チェーンを検索");
    expect(searchInput).toBeInTheDocument();
  });

  it("ローディング状態でrole='status'が設定されている", () => {
    mockUseChainListReturn.isLoading = true;

    render(<SkillChainBuilder />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("エラー状態でrole='alert'が設定されている", () => {
    mockUseChainListReturn.error = "エラー";

    render(<SkillChainBuilder />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("メインコンテナのdata-testidが設定されている", () => {
    render(<SkillChainBuilder />);

    expect(screen.getByTestId("skill-chain-builder-view")).toBeInTheDocument();
  });
});
