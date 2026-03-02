/**
 * ChainEditor コンポーネントのテスト
 *
 * - ステップ一覧表示
 * - ステップ追加ダイアログの開閉
 * - ステップ削除
 * - 保存ボタン
 * - 実行ボタン
 * - エラー表示
 * - 実行結果表示
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type {
  SkillChainDefinition,
  SkillChainStep,
  SkillChainResult,
} from "@repo/shared/types/skill-chain";
import { ChainEditor } from "../components/ChainEditor";

// --- テストデータファクトリ ---

const createMockStep = (
  overrides: Partial<SkillChainStep> = {},
): SkillChainStep => ({
  stepId: "step-001",
  skillName: "テストスキル",
  inputMapping: {},
  ...overrides,
});

const createMockChain = (
  overrides: Partial<SkillChainDefinition> = {},
): SkillChainDefinition => ({
  id: "chain-001",
  name: "テストチェーン",
  description: "テスト用の説明",
  steps: [createMockStep()],
  variables: { apiKey: "test-key" },
  errorHandling: "stop",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

const createMockResult = (
  overrides: Partial<SkillChainResult> = {},
): SkillChainResult => ({
  chainId: "chain-001",
  success: true,
  results: [{ stepId: "step-001", success: true, duration: 100 }],
  finalVariables: {},
  totalDuration: 100,
  ...overrides,
});

describe("ChainEditor", () => {
  const defaultProps = {
    chain: createMockChain(),
    isSaving: false,
    isExecuting: false,
    executionResult: null as SkillChainResult | null,
    error: null as string | null,
    onUpdateName: vi.fn(),
    onUpdateDescription: vi.fn(),
    onAddStep: vi.fn(),
    onRemoveStep: vi.fn(),
    onMoveStep: vi.fn(),
    onUpdateVariable: vi.fn(),
    onRemoveVariable: vi.fn(),
    onSave: vi.fn(),
    onExecute: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("チェーン名が表示される", () => {
    render(<ChainEditor {...defaultProps} />);
    const nameInput = screen.getByTestId("chain-name-editor");
    expect(nameInput).toHaveValue("テストチェーン");
  });

  it("チェーン説明が表示される", () => {
    render(<ChainEditor {...defaultProps} />);
    const descInput = screen.getByTestId("chain-description-editor");
    expect(descInput).toHaveValue("テスト用の説明");
  });

  it("ステップ一覧が表示される", () => {
    render(<ChainEditor {...defaultProps} />);
    expect(screen.getByTestId("step-card-step-001")).toBeInTheDocument();
  });

  it("保存ボタンが表示される", () => {
    render(<ChainEditor {...defaultProps} />);
    expect(screen.getByTestId("save-chain-button")).toBeInTheDocument();
  });

  it("保存ボタンクリックでonSaveが呼ばれる", () => {
    render(<ChainEditor {...defaultProps} />);
    fireEvent.click(screen.getByTestId("save-chain-button"));
    expect(defaultProps.onSave).toHaveBeenCalledOnce();
  });

  it("実行ボタンが表示される", () => {
    render(<ChainEditor {...defaultProps} />);
    expect(screen.getByTestId("execute-chain-button")).toBeInTheDocument();
  });

  it("実行ボタンクリックでonExecuteが呼ばれる", () => {
    render(<ChainEditor {...defaultProps} />);
    fireEvent.click(screen.getByTestId("execute-chain-button"));
    expect(defaultProps.onExecute).toHaveBeenCalledOnce();
  });

  it("ステップが0件の場合は実行ボタンが無効化される", () => {
    const chain = createMockChain({ steps: [] });
    render(<ChainEditor {...defaultProps} chain={chain} />);
    const executeBtn = screen.getByTestId("execute-chain-button");
    expect(executeBtn).toBeDisabled();
  });

  it("戻るボタンクリックでonBackが呼ばれる", () => {
    render(<ChainEditor {...defaultProps} />);
    fireEvent.click(screen.getByTestId("back-to-list"));
    expect(defaultProps.onBack).toHaveBeenCalledOnce();
  });

  it("エラーメッセージが表示される", () => {
    render(<ChainEditor {...defaultProps} error="保存に失敗しました" />);
    expect(screen.getByTestId("chain-editor-error")).toHaveTextContent(
      "保存に失敗しました",
    );
  });

  it("実行結果（成功）が表示される", () => {
    const result = createMockResult();
    render(<ChainEditor {...defaultProps} executionResult={result} />);
    const resultEl = screen.getByTestId("execution-result");
    expect(resultEl).toBeInTheDocument();
    expect(screen.getByText("成功")).toBeInTheDocument();
    expect(screen.getByText("100ms")).toBeInTheDocument();
  });

  it("実行結果（失敗）が表示される", () => {
    const result = createMockResult({ success: false });
    render(<ChainEditor {...defaultProps} executionResult={result} />);
    expect(screen.getByText("失敗")).toBeInTheDocument();
  });

  it("「ステップを追加」ボタンでダイアログが開く", async () => {
    render(<ChainEditor {...defaultProps} />);

    // 初期状態ではダイアログ非表示
    expect(screen.queryByTestId("add-step-dialog")).toBeNull();

    // ステップ追加ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByTestId("add-step-button"));
    });

    expect(screen.getByTestId("add-step-dialog")).toBeInTheDocument();
  });

  it("チェーン名入力変更でonUpdateNameが呼ばれる", () => {
    render(<ChainEditor {...defaultProps} />);
    const nameInput = screen.getByTestId("chain-name-editor");
    fireEvent.change(nameInput, { target: { value: "新しい名前" } });
    expect(defaultProps.onUpdateName).toHaveBeenCalledWith("新しい名前");
  });

  it("チェーン説明入力変更でonUpdateDescriptionが呼ばれる", () => {
    render(<ChainEditor {...defaultProps} />);
    const descInput = screen.getByTestId("chain-description-editor");
    fireEvent.change(descInput, { target: { value: "新しい説明" } });
    expect(defaultProps.onUpdateDescription).toHaveBeenCalledWith("新しい説明");
  });
});
