/**
 * SkillChainBuilder メインビューのテスト
 *
 * - チェーン一覧の表示
 * - ローディング状態
 * - エラー状態
 * - 空状態（EmptyState）
 * - 新規作成ボタン
 * - 検索フィルタ
 * - 編集モードへの遷移
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
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
const mockSaveChain = vi.fn();
const mockExecuteChain = vi.fn();
const mockAddStep = vi.fn();
const mockRemoveStep = vi.fn();
const mockMoveStep = vi.fn();
const mockUpdateName = vi.fn();
const mockUpdateDescription = vi.fn();
const mockUpdateVariable = vi.fn();
const mockRemoveVariable = vi.fn();

let mockUseChainEditorReturn: Record<string, unknown>;

vi.mock("../hooks/useChainEditor", () => ({
  useChainEditor: () => mockUseChainEditorReturn,
}));

// --- 子コンポーネントモック ---
vi.mock("../components/ChainCardGrid", () => ({
  ChainCardGrid: vi.fn(
    ({
      chains,
      onSelect,
    }: {
      chains: SkillChainDefinition[];
      onSelect: (id: string) => void;
    }) => (
      <div data-testid="chain-card-grid">
        {chains.map((c) => (
          <div
            key={c.id}
            data-testid={`chain-card-${c.id}`}
            onClick={() => onSelect(c.id)}
          >
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
  CreateChainDialog: vi.fn(
    ({
      isOpen,
      onCreate,
    }: {
      isOpen: boolean;
      onCreate: (name: string, desc: string) => void;
    }) =>
      isOpen ? (
        <div data-testid="create-chain-dialog">
          <button
            data-testid="mock-create-submit"
            onClick={() => onCreate("新チェーン", "説明")}
          >
            作成
          </button>
        </div>
      ) : null,
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

describe("SkillChainBuilder", () => {
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
      saveChain: mockSaveChain,
      executeChain: mockExecuteChain,
      addStep: mockAddStep,
      removeStep: mockRemoveStep,
      moveStep: mockMoveStep,
      updateName: mockUpdateName,
      updateDescription: mockUpdateDescription,
      updateVariable: mockUpdateVariable,
      removeVariable: mockRemoveVariable,
    };
  });

  it("data-testid='skill-chain-builder-view'が表示される", () => {
    render(<SkillChainBuilder />);
    expect(screen.getByTestId("skill-chain-builder-view")).toBeInTheDocument();
  });

  it("「スキルチェーン」ヘッダーが表示される", () => {
    render(<SkillChainBuilder />);
    expect(screen.getByText("スキルチェーン")).toBeInTheDocument();
  });

  it("サブタイトルが表示される", () => {
    render(<SkillChainBuilder />);
    expect(
      screen.getByText("複数のスキルを連携させてワークフローを構築"),
    ).toBeInTheDocument();
  });

  it("ローディング中にスピナーが表示される", () => {
    mockUseChainListReturn.isLoading = true;
    render(<SkillChainBuilder />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージが表示される", () => {
    mockUseChainListReturn.error = "データの取得に失敗しました";
    render(<SkillChainBuilder />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/データの取得に失敗しました/)).toBeInTheDocument();
  });

  it("エラー時に再試行ボタンが表示される", () => {
    mockUseChainListReturn.error = "エラー";
    render(<SkillChainBuilder />);
    const retryButton = screen.getByText("再試行");
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledOnce();
  });

  it("チェーンがない場合にEmptyStateが表示される", () => {
    render(<SkillChainBuilder />);
    expect(screen.getByText("チェーンがまだありません")).toBeInTheDocument();
  });

  it("チェーンがある場合にカードグリッドが表示される", () => {
    mockUseChainListReturn.chains = [
      createMockChain({ id: "c1", name: "チェーンA" }),
      createMockChain({ id: "c2", name: "チェーンB" }),
    ];
    render(<SkillChainBuilder />);
    expect(screen.getByTestId("chain-card-grid")).toBeInTheDocument();
    expect(screen.getByTestId("chain-card-c1")).toBeInTheDocument();
    expect(screen.getByTestId("chain-card-c2")).toBeInTheDocument();
  });

  it("新規作成ボタンが表示される", () => {
    render(<SkillChainBuilder />);
    expect(screen.getByTestId("create-chain-button")).toBeInTheDocument();
  });

  it("新規作成ボタンクリックでダイアログが開く", async () => {
    render(<SkillChainBuilder />);

    expect(screen.queryByTestId("create-chain-dialog")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId("create-chain-button"));
    });

    expect(screen.getByTestId("create-chain-dialog")).toBeInTheDocument();
  });

  it("新規作成後に編集モードに遷移する", async () => {
    // initNewChainが呼ばれた後、editorのchainをセット
    mockInitNewChain.mockImplementation(() => {
      mockUseChainEditorReturn.chain = createMockChain({
        id: "new-chain",
        name: "新チェーン",
      });
    });

    render(<SkillChainBuilder />);

    // ダイアログを開く
    await act(async () => {
      fireEvent.click(screen.getByTestId("create-chain-button"));
    });

    // 作成ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByTestId("mock-create-submit"));
    });

    expect(mockInitNewChain).toHaveBeenCalledWith("新チェーン", "説明");
    // 編集モードに遷移（ChainEditorが表示される）
    expect(screen.getByTestId("chain-editor")).toBeInTheDocument();
  });

  it("チェーンカードクリックで編集モードに遷移する", async () => {
    mockUseChainListReturn.chains = [
      createMockChain({ id: "c1", name: "チェーンA" }),
    ];

    // loadChain後にeditorのchainをセット
    mockLoadChain.mockImplementation(async () => {
      mockUseChainEditorReturn.chain = createMockChain({ id: "c1" });
    });

    render(<SkillChainBuilder />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("chain-card-c1"));
    });

    await waitFor(() => {
      expect(mockLoadChain).toHaveBeenCalledWith("c1");
    });

    expect(screen.getByTestId("chain-editor")).toBeInTheDocument();
  });

  it("検索バーでチェーンがフィルタリングされる", async () => {
    mockUseChainListReturn.chains = [
      createMockChain({
        id: "c1",
        name: "APIチェーン",
        description: "API処理",
      }),
      createMockChain({
        id: "c2",
        name: "テストチェーン",
        description: "テスト実行",
      }),
    ];

    render(<SkillChainBuilder />);

    // 検索バーに入力
    const searchInput = screen.getByTestId("chain-search-input");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "API" } });
    });

    // APIチェーンのみ表示
    expect(screen.getByTestId("chain-card-c1")).toBeInTheDocument();
    expect(screen.queryByTestId("chain-card-c2")).toBeNull();
  });

  it("検索結果が0件の場合にEmptyStateが表示される", async () => {
    mockUseChainListReturn.chains = [
      createMockChain({ id: "c1", name: "チェーン1" }),
    ];

    render(<SkillChainBuilder />);

    const searchInput = screen.getByTestId("chain-search-input");
    await act(async () => {
      fireEvent.change(searchInput, {
        target: { value: "存在しないキーワード" },
      });
    });

    expect(screen.getByText("検索結果が見つかりません")).toBeInTheDocument();
  });
});
