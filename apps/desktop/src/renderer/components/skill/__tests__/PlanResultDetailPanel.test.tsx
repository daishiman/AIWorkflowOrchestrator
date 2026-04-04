import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { RuntimeSkillCreatorPlanResult } from "@repo/shared/types";
import {
  PlanResultDetailPanel,
  type PlanResultDetailPanelProps,
} from "../PlanResultDetailPanel";
import type { PanelError } from "../ErrorBanner";

function createMockPlanResult(
  overrides?: Partial<RuntimeSkillCreatorPlanResult>,
): RuntimeSkillCreatorPlanResult {
  return {
    planId: "plan-001",
    skillSpec: "# Test Skill Spec\nThis is a test spec.",
    estimatedSteps: 5,
    skillName: "test-skill",
    description: "テスト用スキルの説明",
    agents: [
      { name: "agent-1", role: "コード生成" },
      { name: "agent-2", role: "レビュー" },
    ],
    scripts: [
      { name: "validate.sh", purpose: "入力検証" },
      { name: "build.sh", purpose: "ビルド実行" },
    ],
    triggers: ["コード変更時", "PR作成時"],
    anchors: ["Clean Code", "DDD"],
    ...overrides,
  };
}

function renderPanel(overrides?: Partial<PlanResultDetailPanelProps>) {
  const props: PlanResultDetailPanelProps = {
    planResult: createMockPlanResult(),
    ...overrides,
  };
  return render(<PlanResultDetailPanel {...props} />);
}

describe("PlanResultDetailPanel", () => {
  // T-PRP-01: 完全な planResult を渡す
  it("完全な planResult で全フィールドが表示される", () => {
    renderPanel();

    expect(screen.getByText("test-skill")).toBeInTheDocument();
    expect(screen.getByText("テスト用スキルの説明")).toBeInTheDocument();
    expect(screen.getByText("5 steps")).toBeInTheDocument();
    expect(screen.getByText("agent-1")).toBeInTheDocument();
    expect(screen.getByText("agent-2")).toBeInTheDocument();
    expect(screen.getByText("validate.sh")).toBeInTheDocument();
    expect(screen.getByText("build.sh")).toBeInTheDocument();
    expect(screen.getByText("コード変更時")).toBeInTheDocument();
    expect(screen.getByText("PR作成時")).toBeInTheDocument();
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getByText("DDD")).toBeInTheDocument();
  });

  // T-PRP-02: planResult が null
  it("planResult が null の場合は何も表示されない", () => {
    const { container } = renderPanel({ planResult: null });

    expect(container.firstChild).toBeNull();
  });

  // T-PRP-03: isLoading が true
  it("isLoading が true の場合はスケルトンローダーが表示される", () => {
    renderPanel({ isLoading: true });

    expect(screen.getByTestId("plan-result-skeleton")).toBeInTheDocument();
  });

  // T-PRP-04: error が設定されている
  it("planResult が null で error がある場合は ErrorBanner が表示される", () => {
    const error: PanelError = {
      code: "LLM_ADAPTER_FAILED",
      message: "エラーが発生しました",
    };
    renderPanel({ planResult: null, error });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
  });

  // T-PRP-05: agents が空配列
  it("agents が空配列の場合「エージェントなし」が表示される", () => {
    renderPanel({ planResult: createMockPlanResult({ agents: [] }) });

    expect(screen.getByText("エージェントなし")).toBeInTheDocument();
  });

  // T-PRP-06: scripts が空配列
  it("scripts が空配列の場合「スクリプトなし」が表示される", () => {
    renderPanel({ planResult: createMockPlanResult({ scripts: [] }) });

    expect(screen.getByText("スクリプトなし")).toBeInTheDocument();
  });

  // T-PRP-07: triggers が空配列
  it("triggers が空配列の場合「トリガーなし」が表示される", () => {
    renderPanel({ planResult: createMockPlanResult({ triggers: [] }) });

    expect(screen.getByText("トリガーなし")).toBeInTheDocument();
  });

  // T-PRP-08: anchors が空配列
  it("anchors が空配列の場合「アンカーなし」が表示される", () => {
    renderPanel({ planResult: createMockPlanResult({ anchors: [] }) });

    expect(screen.getByText("アンカーなし")).toBeInTheDocument();
  });

  // T-PRP-09: estimatedSteps が表示される
  it("estimatedSteps がバッジに表示される", () => {
    renderPanel({
      planResult: createMockPlanResult({ estimatedSteps: 12 }),
    });

    expect(screen.getByText("12 steps")).toBeInTheDocument();
  });

  // T-PRP-10: skillSpec の折りたたみ展開
  it("skillSpec の折りたたみを展開すると全文が表示される", () => {
    renderPanel();

    // 初期状態では閉じている
    expect(screen.queryByText("# Test Skill Spec")).not.toBeInTheDocument();

    // 展開
    const toggleButton = screen.getByRole("button", { name: /Skill Spec/ });
    fireEvent.click(toggleButton);

    expect(screen.getByText(/# Test Skill Spec/)).toBeInTheDocument();
  });

  // T-PRP-11: agents に複数エントリ
  it("agents に複数エントリが name — role 形式で表示される", () => {
    const agents = [
      { name: "agent-a", role: "分析" },
      { name: "agent-b", role: "生成" },
      { name: "agent-c", role: "検証" },
    ];
    renderPanel({ planResult: createMockPlanResult({ agents }) });

    expect(screen.getByText("agent-a")).toBeInTheDocument();
    expect(screen.getByText("agent-b")).toBeInTheDocument();
    expect(screen.getByText("agent-c")).toBeInTheDocument();
  });

  // T-PRP-12: planId が表示される
  it("planId がフッターに表示される", () => {
    renderPanel();

    expect(screen.getByText("Plan ID: plan-001")).toBeInTheDocument();
  });

  // T-PRP-13: raw plan detail が保持される（props の再レンダリングで値が保持される）
  it("planResult の再レンダリングで値が保持される", () => {
    const { rerender } = render(
      <PlanResultDetailPanel planResult={createMockPlanResult()} />,
    );

    expect(screen.getByText("test-skill")).toBeInTheDocument();

    // 同じ planResult で再レンダリング
    rerender(<PlanResultDetailPanel planResult={createMockPlanResult()} />);

    expect(screen.getByText("test-skill")).toBeInTheDocument();
  });

  // T-PRP-14: terminal_handoff → PlanResultDetailPanel は表示しない
  // (terminal_handoff の場合は planResult=null が渡されるため)
  it("planResult が null の場合はパネルが表示されない（handoff パターン）", () => {
    const { container } = renderPanel({ planResult: null });

    expect(container.firstChild).toBeNull();
  });

  // Edge case: skillName が空文字列
  it("skillName が空文字列の場合は fallback テキストが表示される", () => {
    renderPanel({
      planResult: createMockPlanResult({ skillName: "" }),
    });

    expect(screen.getByText("名称未設定")).toBeInTheDocument();
  });

  // Edge case: skillSpec が undefined → 折りたたみが表示されない
  it("skillSpec が undefined の場合は折りたたみセクションが非表示", () => {
    renderPanel({
      planResult: createMockPlanResult({ skillSpec: "" }),
    });

    expect(
      screen.queryByRole("button", { name: /Skill Spec/ }),
    ).not.toBeInTheDocument();
  });

  // Edge case: onRetry がある場合にエラーバナーから再試行できる
  it("error 時に onRetry が呼ばれる", () => {
    const onRetry = vi.fn();
    renderPanel({
      planResult: null,
      error: { message: "エラー", retryable: true },
      onRetry,
    });

    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // Edge case: 日本語の skillName
  it("日本語の skillName が正常に表示される", () => {
    renderPanel({
      planResult: createMockPlanResult({ skillName: "日本語スキル名" }),
    });

    expect(screen.getByText("日本語スキル名")).toBeInTheDocument();
  });

  // Edge case: description に HTML タグを含む (XSS 防止)
  it("description の HTML タグがエスケープされて表示される", () => {
    renderPanel({
      planResult: createMockPlanResult({
        description: '<script>alert("xss")</script>',
      }),
    });

    expect(
      screen.getByText('<script>alert("xss")</script>'),
    ).toBeInTheDocument();
  });

  // Edge case: 200文字の長い skillName でもクラッシュしない
  it("200文字の長い skillName でもクラッシュせずレンダリングされる", () => {
    const longName = "a".repeat(200);
    renderPanel({
      planResult: createMockPlanResult({ skillName: longName }),
    });

    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  // Edge case: 2000文字の長い description でもレイアウトが崩れない
  it("2000文字の長い description でもレイアウトが保持される", () => {
    const longDesc = "テスト説明文".repeat(334); // 約2004文字
    renderPanel({
      planResult: createMockPlanResult({ description: longDesc }),
    });

    expect(screen.getByText(longDesc)).toBeInTheDocument();
    expect(screen.getByTestId("plan-result-detail-panel")).toBeInTheDocument();
  });

  // Edge case: 50個の agents が全てレンダリングされる
  it("50個の agents が全てレンダリングされる", () => {
    const agents = Array.from({ length: 50 }, (_, i) => ({
      name: `agent-${i}`,
      role: `role-${i}`,
    }));
    renderPanel({ planResult: createMockPlanResult({ agents }) });

    for (let i = 0; i < 50; i++) {
      expect(screen.getByText(`agent-${i}`)).toBeInTheDocument();
    }
  });

  // Edge case: 30個の triggers が全てレンダリングされる
  it("30個の triggers が全てレンダリングされる", () => {
    const triggers = Array.from({ length: 30 }, (_, i) => `trigger-${i}`);
    renderPanel({ planResult: createMockPlanResult({ triggers }) });

    for (let i = 0; i < 30; i++) {
      expect(screen.getByText(`trigger-${i}`)).toBeInTheDocument();
    }
  });

  // Edge case: 全ての配列が同時に空の場合、各セクションに空メッセージが表示される
  it("全ての配列が同時に空の場合、各セクションに空メッセージが表示される", () => {
    renderPanel({
      planResult: createMockPlanResult({
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      }),
    });

    expect(screen.getByText("エージェントなし")).toBeInTheDocument();
    expect(screen.getByText("スクリプトなし")).toBeInTheDocument();
    expect(screen.getByText("トリガーなし")).toBeInTheDocument();
    expect(screen.getByText("アンカーなし")).toBeInTheDocument();
  });

  // Edge case: isLoading true → false (planResult あり) の状態遷移
  it("isLoading true → false の状態遷移でスケルトンからコンテンツに切り替わる", () => {
    const { rerender } = render(
      <PlanResultDetailPanel planResult={null} isLoading={true} />,
    );

    // ローディング中はスケルトンが表示される
    expect(screen.getByTestId("plan-result-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("test-skill")).not.toBeInTheDocument();

    // ローディング完了 → planResult セット
    rerender(
      <PlanResultDetailPanel
        planResult={createMockPlanResult()}
        isLoading={false}
      />,
    );

    // スケルトンが消え、コンテンツが表示される
    expect(
      screen.queryByTestId("plan-result-skeleton"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("test-skill")).toBeInTheDocument();
    expect(screen.getByText("テスト用スキルの説明")).toBeInTheDocument();
  });
});
