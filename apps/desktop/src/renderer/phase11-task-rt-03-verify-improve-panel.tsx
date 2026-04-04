import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type {
  RuntimeSkillCreatorImproveResult,
  RuntimeSkillCreatorVerifyDetail,
} from "@repo/shared/types";
import { ImproveResultDetailPanel } from "./components/skill/ImproveResultDetailPanel";
import { VerifyResultDetailPanel } from "./components/skill/VerifyResultDetailPanel";
import "./styles/globals.css";

function createVerifyDetail(
  overrides: Partial<RuntimeSkillCreatorVerifyDetail>,
): RuntimeSkillCreatorVerifyDetail {
  return {
    planId: "plan-verify-improve-phase11",
    currentPhase: "verify",
    status: "pass",
    message: "All checks passed",
    nextAction: "handoff",
    checks: [],
    evidenceCount: 0,
    route: {
      type: "integrated_api",
      summary: "Integrated API runtime route",
      permissionMode: "default",
    },
    reverifyEligible: true,
    delegatedGovernanceNote: "Governance note",
    delegatedSessionNote: "Session note",
    ...overrides,
  };
}

function createImproveResult(
  overrides: Partial<RuntimeSkillCreatorImproveResult>,
): RuntimeSkillCreatorImproveResult {
  return {
    improveId: "improve-verify-improve-phase11",
    suggestions: [
      {
        section: "Triggers",
        before: "改善提案が表示される",
        after: "改善提案と理由が表示される",
        reason: "改善の意図が分かるようにするため",
      },
      {
        section: "StatusBadge",
        before: "デフォルトの文言",
        after: "verify 用の語彙に合わせた文言",
        reason: "Verify パネルの文言と整合させるため",
      },
    ],
    revisedSpec: [
      "# Revised Verify / Improve Result Panels",
      "",
      "- verify / improve の表示責務を分離する",
      "- 共通パーツを再利用する",
      "- スクリーンショットで状態差を確認する",
    ].join("\n"),
    ...overrides,
  };
}

function LightThemeBootstrap(): null {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return null;
}

function ScenarioCard({
  title,
  description,
  testId,
  children,
}: {
  title: string;
  description: string;
  testId: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <article
      data-testid={testId}
      className="overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)]"
    >
      <div className="border-b border-[var(--border-subtle)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--status-primary)]">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </article>
  );
}

function Phase11VerifyImproveHarness(): JSX.Element {
  const verifyPass = createVerifyDetail({
    status: "pass",
    message: "verify は合格です",
    nextAction: "handoff",
    evidenceCount: 4,
    checks: [
      {
        id: "chk-verify-pass-1",
        layer: "layer1",
        severity: "info",
        summary: "必要なファイルが揃っています",
        evidenceSummary: "SKILL.md, agents/, references/ が存在します",
      },
      {
        id: "chk-verify-pass-2",
        layer: "layer2",
        severity: "info",
        summary: "SKILL.md の必須セクションが揃っています",
        evidenceSummary: "Anchors / Trigger / Task sections are present",
      },
    ],
  });

  const verifyFail = createVerifyDetail({
    status: "fail",
    message: "verify で差分が見つかりました",
    nextAction: "improve",
    evidenceCount: 2,
    reverifyEligible: false,
    disabledReason: "改善前のため再検証できません",
    checks: [
      {
        id: "chk-verify-fail-1",
        layer: "layer3",
        severity: "warning",
        summary: "一部の説明が不足しています",
        evidenceSummary: "Part 1 の例えが薄い箇所があります",
      },
      {
        id: "chk-verify-fail-2",
        layer: "layer4",
        severity: "error",
        summary: "参照先の整合性が不足しています",
        evidenceSummary: "phase-12 の証跡参照が未記載です",
      },
    ],
    route: {
      type: "terminal_handoff",
      launcher: "manual-review",
      summary: "人手での改善確認が必要です",
      permissionMode: "acceptEdits",
    },
  });

  const improveResult = createImproveResult({});

  return (
    <main
      data-testid="phase11-verify-improve-harness"
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      <LightThemeBootstrap />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-8 py-7 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--status-primary)]">
            Phase 11 Visual Audit
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
            Verify / Improve 結果パネル
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-secondary)]">
            Verify パネルの合格・不合格、Improve パネルの通常表示を、同じ
            harness で要素単位に確認する。
          </p>
        </header>

        <section className="grid gap-6">
          <ScenarioCard
            testId="phase11-verify-pass-card"
            title="TC-11-01 verify pass"
            description="全チェックが合格した状態。次の action と合格バッジを確認する。"
          >
            <VerifyResultDetailPanel
              verifyDetail={verifyPass}
              onReverify={() => undefined}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-verify-fail-card"
            title="TC-11-02 verify fail"
            description="warning / error を含む状態。不合格バッジと無効化理由を確認する。"
          >
            <VerifyResultDetailPanel
              verifyDetail={verifyFail}
              onReverify={() => undefined}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-improve-card"
            title="TC-11-03 improve default"
            description="改善提案と revisedSpec を表示する通常状態。"
          >
            <ImproveResultDetailPanel improveResult={improveResult} />
          </ScenarioCard>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Phase11VerifyImproveHarness />,
);
