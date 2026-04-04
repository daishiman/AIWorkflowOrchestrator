import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type {
  RuntimeSkillCreatorVerifyDetail,
  RuntimeSkillCreatorVerifyCheck,
} from "@repo/shared/types";
import {
  VerifyResultDetailPanel,
  type VerifyResultDetailPanelProps,
} from "../VerifyResultDetailPanel";
import type { PanelError } from "../ErrorBanner";

function createMockCheck(
  overrides?: Partial<RuntimeSkillCreatorVerifyCheck>,
): RuntimeSkillCreatorVerifyCheck {
  return {
    id: "check-001",
    layer: "layer1",
    severity: "info",
    summary: "ファイル構造が正しい",
    evidenceSummary: "SKILL.md が存在します",
    ...overrides,
  };
}

function createMockVerifyDetail(
  overrides?: Partial<RuntimeSkillCreatorVerifyDetail>,
): RuntimeSkillCreatorVerifyDetail {
  return {
    planId: "plan-001",
    currentPhase: "verify",
    status: "pass",
    message: "全チェック項目に合格しました",
    nextAction: "handoff",
    checks: [
      createMockCheck({ id: "chk-l1-01", layer: "layer1", severity: "info" }),
      createMockCheck({
        id: "chk-l2-01",
        layer: "layer2",
        severity: "warning",
        summary: "SKILL.md セクション不足",
        evidenceSummary: "Triggers セクションがありません",
      }),
      createMockCheck({
        id: "chk-l3-01",
        layer: "layer3",
        severity: "error",
        summary: "スキーマバリデーションエラー",
        evidenceSummary: "required field missing",
      }),
      createMockCheck({
        id: "chk-l4-01",
        layer: "layer4",
        severity: "info",
        summary: "References整合性OK",
      }),
    ],
    evidenceCount: 4,
    resolvedSkillCreatorRoot: "/path/to/skill-creator",
    manifestPath: "/path/to/manifest.json",
    resourceDescriptorHash: "abc123hash",
    manifestCacheKey: "cache-key-456",
    route: {
      type: "integrated_api",
      permissionMode: "default",
      summary: "API 経由で実行",
    },
    reverifyEligible: true,
    delegatedGovernanceNote: "ガバナンスノートの内容",
    delegatedSessionNote: "セッションノートの内容",
    ...overrides,
  };
}

function renderPanel(overrides?: Partial<VerifyResultDetailPanelProps>) {
  const props: VerifyResultDetailPanelProps = {
    verifyDetail: createMockVerifyDetail(),
    ...overrides,
  };
  return render(<VerifyResultDetailPanel {...props} />);
}

describe("VerifyResultDetailPanel", () => {
  // TC-V-01: null 入力で何も表示しない
  it("verifyDetail が null の場合は何も表示されない", () => {
    const { container } = renderPanel({ verifyDetail: null });
    expect(container.firstChild).toBeNull();
  });

  // TC-V-02: isLoading=true でスケルトンを表示
  it("isLoading が true の場合はスケルトンが表示される", () => {
    renderPanel({ isLoading: true });
    expect(screen.getByTestId("verify-result-skeleton")).toBeInTheDocument();
  });

  // TC-V-03: error のみで ErrorBanner を表示
  it("verifyDetail が null で error がある場合は ErrorBanner が表示される", () => {
    const error: PanelError = {
      code: "VERIFY_FAILED",
      message: "検証エラーが発生しました",
    };
    renderPanel({ verifyDetail: null, error });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("検証エラーが発生しました")).toBeInTheDocument();
  });

  // TC-V-04: status="pass" で StatusBadge(label override) を表示
  it('status="pass" で「合格」ラベルの StatusBadge が表示される', () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({ status: "pass" }),
    });
    expect(screen.getByLabelText("合格")).toBeInTheDocument();
  });

  // TC-V-05: status="fail" で StatusBadge(label override) を表示
  it('status="fail" で「不合格」ラベルの StatusBadge が表示される', () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({ status: "fail" }),
    });
    expect(screen.getByLabelText("不合格")).toBeInTheDocument();
  });

  // TC-V-06: status="pending" で StatusBadge(label override) を表示
  it('status="pending" で「検証中」ラベルの StatusBadge が表示される', () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({ status: "pending" }),
    });
    expect(screen.getByLabelText("検証中")).toBeInTheDocument();
  });

  // TC-V-07: checks を Layer 別にグループ化して表示
  it("checks が Layer 別にグループ化して表示される", () => {
    renderPanel();
    expect(screen.getByText("Layer 1 — 必須ファイル構造")).toBeInTheDocument();
    expect(
      screen.getByText("Layer 2 — SKILL.md セクション"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Layer 3 — スキーマ・コンテンツ品質"),
    ).toBeInTheDocument();
    expect(screen.getByText("Layer 4 — References整合性")).toBeInTheDocument();
  });

  // TC-V-08: severity=error のチェック項目にエラーアイコンを表示
  it("severity=error のチェック項目に✗アイコンが表示される", () => {
    renderPanel();
    expect(screen.getByText("✗")).toBeInTheDocument();
  });

  // TC-V-09: severity=warning のチェック項目に警告アイコンを表示
  it("severity=warning のチェック項目に⚠アイコンが表示される", () => {
    renderPanel();
    // ErrorBanner にも⚠があるので、チェック項目の⚠を探す
    const warnings = screen.getAllByText("⚠");
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });

  // TC-V-10: severity=info のチェック項目に情報アイコンを表示
  it("severity=info のチェック項目にℹアイコンが表示される", () => {
    renderPanel();
    const infoIcons = screen.getAllByText("ℹ");
    expect(infoIcons.length).toBeGreaterThanOrEqual(1);
  });

  // TC-V-11: message がある場合にメッセージを表示
  it("message がある場合にメッセージが表示される", () => {
    renderPanel();
    expect(
      screen.getByText("全チェック項目に合格しました"),
    ).toBeInTheDocument();
  });

  // TC-V-12: nextAction がある場合にバッジを表示
  it("nextAction がある場合にバッジが表示される", () => {
    renderPanel();
    expect(screen.getByText("handoff")).toBeInTheDocument();
  });

  // TC-V-13: evidenceCount をバッジで表示
  it("evidenceCount がバッジで表示される", () => {
    renderPanel();
    expect(screen.getByText("Evidence: 4")).toBeInTheDocument();
  });

  // TC-V-14: reverifyEligible=true で reverify ボタンが有効
  it("reverifyEligible=true で reverify ボタンが有効", () => {
    const onReverify = vi.fn();
    renderPanel({ onReverify });
    const button = screen.getByRole("button", { name: /再検証/ });
    expect(button).not.toBeDisabled();
  });

  // TC-V-15: reverifyEligible=false で reverify ボタンが無効
  it("reverifyEligible=false で reverify ボタンが無効", () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({ reverifyEligible: false }),
      onReverify: vi.fn(),
    });
    const button = screen.getByRole("button", { name: /再検証/ });
    expect(button).toBeDisabled();
  });

  // TC-V-16: planId を DetailFooter で表示
  it("planId がフッターに表示される", () => {
    renderPanel();
    expect(screen.getByText("Plan ID: plan-001")).toBeInTheDocument();
  });

  // TC-V-17: delegatedGovernanceNote / delegatedSessionNote を表示
  it("delegatedGovernanceNote と delegatedSessionNote が表示される", () => {
    renderPanel();
    // Governance Notes は折りたたみ内なので展開してから検証
    const toggleButton = screen.getByRole("button", {
      name: /Governance Notes/,
    });
    fireEvent.click(toggleButton);
    expect(screen.getByText("ガバナンスノートの内容")).toBeInTheDocument();
    expect(screen.getByText("セッションノートの内容")).toBeInTheDocument();
  });

  // TC-V-18: route 情報を表示
  it("route 情報が表示される", () => {
    renderPanel();
    expect(screen.getByText("integrated_api")).toBeInTheDocument();
    expect(screen.getByText("API 経由で実行")).toBeInTheDocument();
  });

  // TC-V-19: onRetry コールバックが ErrorBanner 経由で呼ばれる
  it("error 時に onRetry が ErrorBanner 経由で呼ばれる", () => {
    const onRetry = vi.fn();
    renderPanel({
      verifyDetail: null,
      error: { message: "エラー", retryable: true },
      onRetry,
    });
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // --- Phase 6: テスト拡充 ---

  // TC-V-20: checks が空配列で「チェック項目なし」を表示
  it("checks が空配列で「チェック項目なし」が表示される", () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({ checks: [] }),
    });
    expect(screen.getByText("チェック項目なし")).toBeInTheDocument();
  });

  // TC-V-21: 特定の Layer のみにチェックがある場合、その Layer だけ表示
  it("特定の Layer のみにチェックがある場合、その Layer だけ表示される", () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({
        checks: [createMockCheck({ id: "chk-l2-only", layer: "layer2" })],
      }),
    });
    expect(
      screen.getByText("Layer 2 — SKILL.md セクション"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Layer 1 — 必須ファイル構造"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Layer 3 — スキーマ・コンテンツ品質"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Layer 4 — References整合性"),
    ).not.toBeInTheDocument();
  });

  // TC-V-22: onReverify コールバックが reverify ボタンクリックで呼ばれる
  it("onReverify が reverify ボタンクリックで呼ばれる", () => {
    const onReverify = vi.fn();
    renderPanel({ onReverify });
    const button = screen.getByRole("button", { name: /再検証/ });
    fireEvent.click(button);
    expect(onReverify).toHaveBeenCalledTimes(1);
  });

  // TC-V-23: disabledReason がある場合に表示
  it("disabledReason がある場合に理由が表示される", () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({
        reverifyEligible: false,
        disabledReason: "最大再検証回数に達しました",
      }),
      onReverify: vi.fn(),
    });
    expect(screen.getByText("最大再検証回数に達しました")).toBeInTheDocument();
  });

  // TC-V-24: evidenceSummary がない check 項目で summary のみ表示
  it("evidenceSummary がない check 項目で summary のみ表示される", () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({
        checks: [
          createMockCheck({
            id: "chk-no-evidence",
            layer: "layer1",
            summary: "証拠なしチェック",
            evidenceSummary: undefined,
          }),
        ],
      }),
    });
    expect(screen.getByText("証拠なしチェック")).toBeInTheDocument();
  });

  // TC-V-25: route.type が terminal_handoff の場合の表示
  it("route.type が terminal_handoff の場合に正しく表示される", () => {
    renderPanel({
      verifyDetail: createMockVerifyDetail({
        route: {
          type: "terminal_handoff",
          launcher: "claude-code",
          summary: "ターミナルハンドオフで実行",
        },
      }),
    });
    expect(screen.getByText("terminal_handoff")).toBeInTheDocument();
    expect(screen.getByText("claude-code")).toBeInTheDocument();
    expect(screen.getByText("ターミナルハンドオフで実行")).toBeInTheDocument();
  });
});
