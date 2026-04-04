import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { RuntimeSkillCreatorImproveResult } from "@repo/shared/types";
import {
  ImproveResultDetailPanel,
  type ImproveResultDetailPanelProps,
} from "../ImproveResultDetailPanel";
import type { PanelError } from "../ErrorBanner";

function createMockImproveResult(
  overrides?: Partial<RuntimeSkillCreatorImproveResult>,
): RuntimeSkillCreatorImproveResult {
  return {
    improveId: "improve-001",
    suggestions: [
      {
        section: "Triggers",
        before: "コード変更時に実行",
        after: "PR作成時とコード変更時に実行",
        reason: "PR作成時のトリガーが不足しています",
      },
      {
        section: "Anchors",
        before: "Clean Code のみ",
        after: "Clean Code + DDD",
        reason: "ドメイン駆動設計の観点を追加",
      },
    ],
    revisedSpec: "# Revised Skill Spec\nThis is the revised spec content.",
    ...overrides,
  };
}

function renderPanel(overrides?: Partial<ImproveResultDetailPanelProps>) {
  const props: ImproveResultDetailPanelProps = {
    improveResult: createMockImproveResult(),
    ...overrides,
  };
  return render(<ImproveResultDetailPanel {...props} />);
}

describe("ImproveResultDetailPanel", () => {
  // TC-I-01: null 入力で何も表示しない
  it("improveResult が null の場合は何も表示されない", () => {
    const { container } = renderPanel({ improveResult: null });
    expect(container.firstChild).toBeNull();
  });

  // TC-I-02: isLoading=true でスケルトンを表示
  it("isLoading が true の場合はスケルトンが表示される", () => {
    renderPanel({ isLoading: true });
    expect(screen.getByTestId("improve-result-skeleton")).toBeInTheDocument();
  });

  // TC-I-03: error のみで ErrorBanner を表示
  it("improveResult が null で error がある場合は ErrorBanner が表示される", () => {
    const error: PanelError = {
      message: "改善処理でエラーが発生しました",
    };
    renderPanel({ improveResult: null, error });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("改善処理でエラーが発生しました"),
    ).toBeInTheDocument();
  });

  // TC-I-04: suggestions を section/before/after/reason で表示
  it("suggestions が section/before/after/reason で表示される", () => {
    renderPanel();
    expect(screen.getByText("Triggers")).toBeInTheDocument();
    expect(screen.getByText("コード変更時に実行")).toBeInTheDocument();
    expect(
      screen.getByText("PR作成時とコード変更時に実行"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("PR作成時のトリガーが不足しています"),
    ).toBeInTheDocument();
  });

  // TC-I-05: 複数 suggestions を全て表示
  it("複数の suggestions が全て表示される", () => {
    renderPanel();
    expect(screen.getByText("Triggers")).toBeInTheDocument();
    expect(screen.getByText("Anchors")).toBeInTheDocument();
    expect(screen.getByText("Clean Code のみ")).toBeInTheDocument();
    expect(screen.getByText("Clean Code + DDD")).toBeInTheDocument();
  });

  // TC-I-06: suggestions が空配列で「提案なし」を表示
  it("suggestions が空配列の場合に空状態メッセージが表示される", () => {
    renderPanel({
      improveResult: createMockImproveResult({ suggestions: [] }),
    });
    expect(screen.getByText("改善提案はありません")).toBeInTheDocument();
  });

  // TC-I-07: revisedSpec がある場合に折りたたみセクションを表示
  it("revisedSpec がある場合に折りたたみセクションが表示される", () => {
    renderPanel();
    const toggleButton = screen.getByRole("button", {
      name: /Revised Spec/,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  // TC-I-08: revisedSpec の折りたたみを展開できる
  it("revisedSpec の折りたたみを展開するとコードが表示される", () => {
    renderPanel();
    // 初期状態では非表示
    expect(screen.queryByText(/# Revised Skill Spec/)).not.toBeInTheDocument();

    // 展開
    const toggleButton = screen.getByRole("button", {
      name: /Revised Spec/,
    });
    fireEvent.click(toggleButton);
    expect(screen.getByText(/# Revised Skill Spec/)).toBeInTheDocument();
  });

  // TC-I-09: revisedSpec がない場合にセクションを非表示
  it("revisedSpec がない場合に折りたたみセクションが表示されない", () => {
    renderPanel({
      improveResult: createMockImproveResult({ revisedSpec: undefined }),
    });
    expect(
      screen.queryByRole("button", { name: /Revised Spec/ }),
    ).not.toBeInTheDocument();
  });

  // TC-I-10: improveId を DetailFooter で表示
  it("improveId がフッターに表示される", () => {
    renderPanel();
    expect(screen.getByText("Improve ID: improve-001")).toBeInTheDocument();
  });

  // TC-I-11: 提案数バッジに suggestions.length を表示
  it("提案数バッジに suggestions.length が表示される", () => {
    renderPanel();
    expect(screen.getByText("2 件の提案")).toBeInTheDocument();
  });

  // TC-I-12: onRetry コールバックが ErrorBanner 経由で呼ばれる
  it("error 時に onRetry が ErrorBanner 経由で呼ばれる", () => {
    const onRetry = vi.fn();
    renderPanel({
      improveResult: null,
      error: { message: "エラー", retryable: true },
      onRetry,
    });
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // --- Phase 6: テスト拡充 ---

  // TC-I-13: suggestion の before/after が長文の場合のオーバーフロー処理
  it("suggestion の before/after が長文でもレンダリングされる", () => {
    const longText = "改善内容".repeat(200);
    renderPanel({
      improveResult: createMockImproveResult({
        suggestions: [
          {
            section: "LongSection",
            before: longText,
            after: longText,
            reason: "長文テスト",
          },
        ],
      }),
    });
    expect(screen.getByText("LongSection")).toBeInTheDocument();
    expect(screen.getByText("長文テスト")).toBeInTheDocument();
  });

  // TC-I-14: revisedSpec が長文の場合の max-height スクロール
  it("revisedSpec が長文でも折りたたみ展開後にレンダリングされる", () => {
    const longSpec = "# Long Spec\n" + "line\n".repeat(500);
    renderPanel({
      improveResult: createMockImproveResult({ revisedSpec: longSpec }),
    });
    const toggleButton = screen.getByRole("button", {
      name: /Revised Spec/,
    });
    fireEvent.click(toggleButton);
    expect(screen.getByText(/# Long Spec/)).toBeInTheDocument();
  });

  // TC-I-15: suggestion.section が空文字の場合のフォールバック表示
  it("suggestion.section が空文字の場合にフォールバックテキストが表示される", () => {
    renderPanel({
      improveResult: createMockImproveResult({
        suggestions: [
          {
            section: "",
            before: "before-text",
            after: "after-text",
            reason: "理由テキスト",
          },
        ],
      }),
    });
    expect(screen.getByText("（セクション未指定）")).toBeInTheDocument();
  });
});
