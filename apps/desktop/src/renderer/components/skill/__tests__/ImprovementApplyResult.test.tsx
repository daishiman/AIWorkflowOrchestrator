import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApplyImprovementResult } from "@repo/shared/types";
import {
  ImprovementApplyResult,
  type ImprovementApplyResultProps,
} from "../ImprovementApplyResult";

function createMockApplyResult(
  overrides?: Partial<ApplyImprovementResult>,
): ApplyImprovementResult {
  return {
    applied: 2,
    skipped: 1,
    skippedDetails: [
      {
        section: "## 制約事項",
        reason: "before text not found in SKILL.md",
      },
    ],
    errors: [],
    ...overrides,
  };
}

describe("ImprovementApplyResult", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
  });

  function renderResult(overrides?: Partial<ImprovementApplyResultProps>) {
    const props: ImprovementApplyResultProps = {
      result: createMockApplyResult(),
      onClose: mockOnClose,
      ...overrides,
    };
    return render(<ImprovementApplyResult {...props} />);
  }

  // R-1: 全件適用成功
  it("applied=3, skipped=0 で成功メッセージが表示される", () => {
    renderResult({
      result: createMockApplyResult({
        applied: 3,
        skipped: 0,
        skippedDetails: [],
      }),
    });

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.queryByText(/スキップ/)).not.toBeInTheDocument();
  });

  // R-2: 一部スキップ
  it("applied=2, skipped=1 でスキップ理由が表示される", () => {
    renderResult();

    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText("## 制約事項")).toBeInTheDocument();
    expect(
      screen.getByText("before text not found in SKILL.md"),
    ).toBeInTheDocument();
  });

  // R-3: エラー表示
  it("errors 配列が空でない場合、エラーメッセージが赤色で表示される", () => {
    renderResult({
      result: createMockApplyResult({
        errors: ["ファイル書き込み失敗", "パーミッションエラー"],
      }),
    });

    expect(screen.getByText("ファイル書き込み失敗")).toBeInTheDocument();
    expect(screen.getByText("パーミッションエラー")).toBeInTheDocument();
  });

  // R-4: 閉じるボタン
  it("「閉じる」ボタン押下で onClose が呼ばれる", () => {
    renderResult();

    fireEvent.click(screen.getByRole("button", { name: "結果を閉じる" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // R-5: スキップ詳細表示
  it("skippedDetails の section + reason がリスト表示される", () => {
    renderResult({
      result: createMockApplyResult({
        skipped: 2,
        skippedDetails: [
          {
            section: "## 概要",
            reason: "section not found",
          },
          {
            section: "## 制約",
            reason: "before text mismatch",
          },
        ],
      }),
    });

    expect(screen.getByText("## 概要")).toBeInTheDocument();
    expect(screen.getByText("section not found")).toBeInTheDocument();
    expect(screen.getByText("## 制約")).toBeInTheDocument();
    expect(screen.getByText("before text mismatch")).toBeInTheDocument();
  });

  // R-6: 全件スキップ
  it("applied=0, skipped=3 でスキップメッセージが表示される", () => {
    renderResult({
      result: createMockApplyResult({
        applied: 0,
        skipped: 3,
        skippedDetails: [
          { section: "## A", reason: "reason A" },
          { section: "## B", reason: "reason B" },
          { section: "## C", reason: "reason C" },
        ],
      }),
    });

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  // R-7: 複数エラー
  it("errors に3件のエラーが全てリスト表示される", () => {
    renderResult({
      result: createMockApplyResult({
        errors: ["error1", "error2", "error3"],
      }),
    });

    expect(screen.getByText("error1")).toBeInTheDocument();
    expect(screen.getByText("error2")).toBeInTheDocument();
    expect(screen.getByText("error3")).toBeInTheDocument();
  });

  // R-8: skippedDetails 空
  it("skipped=0 でスキップ詳細セクションが非表示", () => {
    renderResult({
      result: createMockApplyResult({
        skipped: 0,
        skippedDetails: [],
      }),
    });

    expect(screen.queryByText(/スキップ/)).not.toBeInTheDocument();
  });
});
