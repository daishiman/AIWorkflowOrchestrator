import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorPlanResult,
  RuntimeSkillCreatorVerifyDetail,
} from "@repo/shared/types";
import {
  SkillCreationResultPanel,
  type SkillCreationResultPanelProps,
} from "./SkillCreationResultPanel";

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

function createMockExecuteResult(
  overrides?: Partial<RuntimeSkillCreatorExecuteResult>,
): RuntimeSkillCreatorExecuteResult {
  return {
    executeId: "exec-001",
    skillName: "test-skill",
    success: true,
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
      {
        id: "chk-l1-01",
        layer: "layer1",
        severity: "info",
        summary: "構造が正しい",
        evidenceSummary: "SKILL.md が存在します",
      },
      {
        id: "chk-l2-01",
        layer: "layer2",
        severity: "warning",
        summary: "SKILL.md セクション不足",
        evidenceSummary: "Triggers セクションがありません",
      },
      {
        id: "chk-l3-01",
        layer: "layer3",
        severity: "error",
        summary: "スキーマバリデーションエラー",
        evidenceSummary: "required field missing",
      },
      {
        id: "chk-l4-01",
        layer: "layer4",
        severity: "info",
        summary: "References整合性OK",
      },
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

function renderPanel(overrides?: Partial<SkillCreationResultPanelProps>) {
  const props: SkillCreationResultPanelProps = {
    planResult: createMockPlanResult(),
    executeResult: createMockExecuteResult(),
    verifyDetail: createMockVerifyDetail(),
    ...overrides,
  };
  return render(<SkillCreationResultPanel {...props} />);
}

describe("SkillCreationResultPanel", () => {
  it("全props が null の場合に空状態と進行中ステータスを表示する", () => {
    renderPanel({
      planResult: null,
      executeResult: null,
      verifyDetail: null,
    });

    expect(screen.getByText("結果がまだありません")).toBeInTheDocument();
    expect(screen.getByLabelText("進行中")).toBeInTheDocument();
  });

  it("verifyDetail 読み込み中は空状態ではなくスケルトンを表示する", () => {
    renderPanel({
      planResult: null,
      executeResult: null,
      verifyDetail: null,
      isVerifyDetailLoading: true,
    });

    expect(
      screen.queryByTestId("skill-creation-result-empty"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("verify-result-skeleton")).toBeInTheDocument();
  });

  it("planResult のみ渡された場合に plan セクションと Plan完了ステータスが表示される", () => {
    renderPanel({
      executeResult: null,
      verifyDetail: null,
    });

    expect(screen.getByTestId("plan-result-detail-panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Plan完了")).toBeInTheDocument();
  });

  it("planResult の agents / scripts が表示される", () => {
    renderPanel({
      executeResult: null,
      verifyDetail: null,
    });

    expect(screen.getByText("agent-1")).toBeInTheDocument();
    expect(screen.getByText("agent-2")).toBeInTheDocument();
    expect(screen.getByText("validate.sh")).toBeInTheDocument();
    expect(screen.getByText("build.sh")).toBeInTheDocument();
  });

  it("executeResult.success=true の場合に検証中ステータスと保存結果が表示される", () => {
    renderPanel({
      verifyDetail: null,
      executeResult: createMockExecuteResult({
        persistResult: {
          skillPath: ".claude/skills/test-skill",
          files: [
            ".claude/skills/test-skill/SKILL.md",
            ".claude/skills/test-skill/agents/main.md",
          ],
        },
        persistError: null,
      }),
    });

    expect(
      screen.getByText("スキルが正常に作成されました"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("skill-creation-result-overall-status"),
    ).toHaveTextContent("検証中");
    expect(
      screen.getByTestId("execute-result-persist-result"),
    ).toBeInTheDocument();
    expect(screen.getByText(".claude/skills/test-skill")).toBeInTheDocument();
    expect(
      screen.getByText(".claude/skills/test-skill/SKILL.md"),
    ).toBeInTheDocument();
  });

  it("executeResult.persistError が表示される", () => {
    renderPanel({
      verifyDetail: null,
      executeResult: createMockExecuteResult({
        persistResult: null,
        persistError: "ファイルの保存に失敗しました",
      }),
    });

    expect(
      screen.getByTestId("execute-result-persist-error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ファイルの保存に失敗しました"),
    ).toBeInTheDocument();
  });

  it("executeResult.success=false の場合に実行失敗ステータスとエラーが表示される", () => {
    renderPanel({
      verifyDetail: null,
      executeResult: createMockExecuteResult({
        success: false,
        error: "タイムアウトしました",
      }),
    });

    expect(screen.getByLabelText("実行失敗")).toBeInTheDocument();
    expect(screen.getByText("スキルの作成に失敗しました")).toBeInTheDocument();
    expect(screen.getByText("タイムアウトしました")).toBeInTheDocument();
  });

  it("verifyDetail.status=pass の場合に完了ステータスと verify セクションが表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      verifyDetail: createMockVerifyDetail({ status: "pass" }),
    });

    expect(screen.getByLabelText("完了")).toBeInTheDocument();
    expect(
      screen.getByTestId("verify-result-detail-panel"),
    ).toBeInTheDocument();
    expect(screen.getByText("合格")).toBeInTheDocument();
  });

  it("verifyDetail.status=pending の場合に検証中ステータスが表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      verifyDetail: createMockVerifyDetail({ status: "pending" }),
    });

    expect(
      screen.getByTestId("skill-creation-result-overall-status"),
    ).toHaveTextContent("検証中");
  });

  it("verifyDetail.status=fail の場合に検証失敗ステータスと layer グループが表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      verifyDetail: createMockVerifyDetail({
        status: "fail",
        reverifyEligible: false,
        disabledReason: "再検証はロックされています",
      }),
      onReverify: vi.fn(),
    });

    expect(screen.getByLabelText("検証失敗")).toBeInTheDocument();
    expect(
      screen.getByText("Layer 3 — スキーマ・コンテンツ品質"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("スキーマバリデーションエラー"),
    ).toBeInTheDocument();
    expect(screen.getByText("再検証はロックされています")).toBeInTheDocument();
    expect(
      screen.getByTestId("skill-lifecycle-reverify-button"),
    ).toBeDisabled();
  });

  it("verifyError がある場合に検証失敗ステータスと error banner が表示される", () => {
    const onRetryVerify = vi.fn();

    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      verifyDetail: null,
      verifyError: "verify detail の取得に失敗しました。",
      onRetryVerify,
    });

    expect(
      screen.getByTestId("skill-creation-result-overall-status"),
    ).toHaveTextContent("検証失敗");
    expect(screen.getByTestId("error-banner")).toBeInTheDocument();
    expect(
      screen.getByText("verify detail の取得に失敗しました。"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(onRetryVerify).toHaveBeenCalledTimes(1);
  });

  it("isReverifying=true の場合に検証中ステータスと再検証ボタンの無効化が維持される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      verifyDetail: createMockVerifyDetail({ status: "pending" }),
      onReverify: vi.fn(),
      isReverifying: true,
    });

    expect(
      screen.getByTestId("skill-creation-result-overall-status"),
    ).toHaveTextContent("検証中");
    expect(
      screen.getByTestId("skill-lifecycle-reverify-button"),
    ).toBeDisabled();
  });

  it("executeResult.success=true かつ verifyDetail.status=fail の場合に検証失敗になる", () => {
    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      verifyDetail: createMockVerifyDetail({ status: "fail" }),
    });

    expect(screen.getByLabelText("検証失敗")).toBeInTheDocument();
  });

  it("onClose が渡された場合に閉じるボタンが機能する", () => {
    const onClose = vi.fn();
    renderPanel({
      executeResult: null,
      verifyDetail: null,
      onClose,
    });

    fireEvent.click(screen.getByRole("button", { name: "結果パネルを閉じる" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("planResult / executeResult / verifyDetail が揃うと 3 セクションが上から順に表示される", () => {
    renderPanel();

    const panel = screen.getByTestId("skill-creation-result-panel");
    const children = Array.from(
      panel.querySelectorAll("[data-testid$='-detail-panel']"),
    );

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveAttribute(
      "data-testid",
      "plan-result-detail-panel",
    );
    expect(children[1]).toHaveAttribute(
      "data-testid",
      "execute-result-detail-panel",
    );
    expect(children[2]).toHaveAttribute(
      "data-testid",
      "verify-result-detail-panel",
    );
  });
});
