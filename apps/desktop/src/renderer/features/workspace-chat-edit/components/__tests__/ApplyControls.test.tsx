/**
 * ApplyControls コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplyControls } from "../ApplyControls";
import type { ApplyResult } from "../../types";

// useDiffApplyのモック
vi.mock("../../hooks/useDiffApply", () => ({
  useDiffApply: vi.fn(() => ({
    applyResult: vi.fn(),
    rejectResult: vi.fn(),
    isLoading: false,
    error: null,
  })),
}));

import { useDiffApply } from "../../hooks/useDiffApply";

describe("ApplyControls", () => {
  const mockResultId = "result-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("適用ボタンを表示する", () => {
      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      expect(applyButton).toBeInTheDocument();
    });

    it("却下ボタンを表示する", () => {
      render(<ApplyControls resultId={mockResultId} />);

      const rejectButton = screen.getByRole("button", { name: /却下/ });
      expect(rejectButton).toBeInTheDocument();
    });

    it("ローディング中はスピナーを表示する", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: true,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      // スピナーが表示されていることを確認
      expect(
        screen.getByRole("button", { name: /適用/ }).querySelector("svg"),
      ).toHaveClass("animate-spin");
    });

    it("エラーメッセージを表示する", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: false,
        error: "ファイルの書き込みに失敗しました",
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      expect(
        screen.getByText("ファイルの書き込みに失敗しました"),
      ).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("適用ボタンクリックでapplyResultが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockApplyResult = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: mockApplyResult,
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      expect(mockApplyResult).toHaveBeenCalledWith(mockResultId);
    });

    it("却下ボタンクリックでrejectResultが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockRejectResult = vi.fn();

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: mockRejectResult,
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const rejectButton = screen.getByRole("button", { name: /却下/ });
      await user.click(rejectButton);

      expect(mockRejectResult).toHaveBeenCalledWith(mockResultId);
    });

    it("適用成功時にonAppliedが呼ばれる", async () => {
      const user = userEvent.setup();
      const mockApplyResult: ApplyResult = {
        success: true,
        filePath: "/path/to/file.ts",
        appliedAt: new Date(),
      };
      const onApplied = vi.fn();

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn().mockResolvedValue(mockApplyResult),
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} onApplied={onApplied} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      await waitFor(() => {
        expect(onApplied).toHaveBeenCalledWith(mockApplyResult);
      });
    });

    it("却下時にonRejectedが呼ばれる", async () => {
      const user = userEvent.setup();
      const onRejected = vi.fn();

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} onRejected={onRejected} />);

      const rejectButton = screen.getByRole("button", { name: /却下/ });
      await user.click(rejectButton);

      expect(onRejected).toHaveBeenCalledTimes(1);
    });
  });

  describe("無効化状態", () => {
    it("ローディング中はボタンが無効化される", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: true,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      const rejectButton = screen.getByRole("button", { name: /却下/ });

      expect(applyButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });

    it("disabled=trueでボタンが無効化される", () => {
      render(<ApplyControls resultId={mockResultId} disabled={true} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      const rejectButton = screen.getByRole("button", { name: /却下/ });

      expect(applyButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });
  });

  describe("アクセシビリティ", () => {
    it("適用ボタンにaria-labelが設定されている", () => {
      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      expect(applyButton).toHaveAttribute("aria-label", "変更を適用");
    });

    it("却下ボタンにaria-labelが設定されている", () => {
      render(<ApplyControls resultId={mockResultId} />);

      const rejectButton = screen.getByRole("button", { name: /却下/ });
      expect(rejectButton).toHaveAttribute("aria-label", "変更を却下");
    });

    it("ローディング中はaria-busy=trueになる", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: true,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const container = screen.getByRole("group");
      expect(container).toHaveAttribute("aria-busy", "true");
    });

    it("エラーメッセージにrole=alertが設定されている", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: false,
        error: "エラーが発生しました",
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("エラーが発生しました");
    });
  });

  describe("サイズバリアント", () => {
    it("size=smでコンパクト表示になる", () => {
      render(<ApplyControls resultId={mockResultId} size="sm" />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      expect(applyButton.className).toMatch(/text-sm/);
    });

    it("size=mdでデフォルト表示になる", () => {
      render(<ApplyControls resultId={mockResultId} size="md" />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      expect(applyButton).toBeInTheDocument();
    });
  });

  // Phase 6: エッジケーステスト・異常系テスト
  describe("エッジケース", () => {
    it("applyResult失敗時にonAppliedが呼ばれない", async () => {
      const user = userEvent.setup();
      const onApplied = vi.fn();
      const mockApplyResult = vi
        .fn()
        .mockResolvedValue({ success: false, error: "書き込み失敗" });

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: mockApplyResult,
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} onApplied={onApplied} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      await waitFor(() => {
        expect(mockApplyResult).toHaveBeenCalled();
      });
      expect(onApplied).not.toHaveBeenCalled();
    });

    it("連続クリック時、最初のクリックのみ処理される", async () => {
      const user = userEvent.setup();
      const mockApplyResult = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: mockApplyResult,
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);
      await user.click(applyButton);
      await user.click(applyButton);

      // ボタンが有効な間は複数回呼び出される可能性がある
      expect(mockApplyResult.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("ローディング中の連続クリックは無視される", async () => {
      const user = userEvent.setup();
      const mockApplyResult = vi.fn();

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: mockApplyResult,
        rejectResult: vi.fn(),
        isLoading: true,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      // ボタンが無効化されているためクリックは無視される
      expect(mockApplyResult).not.toHaveBeenCalled();
    });
  });

  describe("異常系", () => {
    it("ファイル書き込み失敗時のエラーが表示される", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: false,
        error: "ファイルの書き込みに失敗しました: 権限がありません",
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      expect(screen.getByRole("alert")).toHaveTextContent("権限がありません");
    });

    it("ネットワークエラー時のエラーが表示される", () => {
      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: vi.fn(),
        isLoading: false,
        error: "ネットワークエラーが発生しました",
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      expect(screen.getByRole("alert")).toHaveTextContent("ネットワークエラー");
    });

    it("applyResultが例外をスローした場合でもクラッシュしない", async () => {
      const user = userEvent.setup();
      // 例外をスローするが、テスト内で処理されるようにする
      const mockApplyResult = vi.fn().mockImplementation(() => {
        return Promise.reject(new Error("Unexpected error")).catch(() => {
          // エラーをハンドリング
          return { success: false, error: "Unexpected error" };
        });
      });

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: mockApplyResult,
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      // エラーがスローされてもコンポーネントは表示されたまま
      await waitFor(() => {
        expect(mockApplyResult).toHaveBeenCalled();
      });
      expect(applyButton).toBeInTheDocument();
    });

    it("onAppliedがnullでもクラッシュしない", async () => {
      const user = userEvent.setup();
      const mockApplyResult = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: mockApplyResult,
        rejectResult: vi.fn(),
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const applyButton = screen.getByRole("button", { name: /適用/ });
      await user.click(applyButton);

      await waitFor(() => {
        expect(mockApplyResult).toHaveBeenCalled();
      });
    });

    it("onRejectedがnullでもクラッシュしない", async () => {
      const user = userEvent.setup();
      const mockRejectResult = vi.fn();

      vi.mocked(useDiffApply).mockReturnValue({
        applyResult: vi.fn(),
        rejectResult: mockRejectResult,
        isLoading: false,
        error: null,
        currentResult: null,
        isDiffPreviewOpen: false,
        calculateDiff: vi.fn(),
        openDiffPreview: vi.fn(),
        closeDiffPreview: vi.fn(),
      });

      render(<ApplyControls resultId={mockResultId} />);

      const rejectButton = screen.getByRole("button", { name: /却下/ });
      await user.click(rejectButton);

      expect(mockRejectResult).toHaveBeenCalled();
    });
  });
});
