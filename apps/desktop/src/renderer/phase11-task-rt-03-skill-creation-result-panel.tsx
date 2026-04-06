import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type {
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorPlanResult,
  RuntimeSkillCreatorVerifyDetail,
} from "@repo/shared/types";
import { SkillCreationResultPanel } from "./components/skill/SkillCreationResultPanel";
import "./styles/globals.css";

function createPlanResult(
  overrides: Partial<RuntimeSkillCreatorPlanResult> = {},
): RuntimeSkillCreatorPlanResult {
  return {
    planId: "plan-rt-03-skill-creation",
    skillSpec: [
      "# Skill Creation Result Demo",
      "",
      "plan / execute / verify の結果を 1 つの面で確認する。",
    ].join("\n"),
    estimatedSteps: 5,
    skillName: "skill-creation-result-demo",
    description: "スキル生成結果の詳細表示を確認するデモ",
    agents: [
      { name: "planner", role: "計画" },
      { name: "executor", role: "実行" },
      { name: "reviewer", role: "確認" },
    ],
    scripts: [
      { name: "validate.sh", purpose: "入力検証" },
      { name: "build.sh", purpose: "生成物の構築" },
    ],
    triggers: ["plan complete", "execute success"],
    anchors: ["Clean Code", "DDD", "Progressive Disclosure"],
    ...overrides,
  };
}

function createExecuteResult(
  overrides: Partial<RuntimeSkillCreatorExecuteResult> = {},
): RuntimeSkillCreatorExecuteResult {
  return {
    executeId: "exec-rt-03-skill-creation",
    skillName: "skill-creation-result-demo",
    success: true,
    persistResult: {
      skillPath: ".claude/skills/skill-creation-result-demo",
      files: [
        ".claude/skills/skill-creation-result-demo/SKILL.md",
        ".claude/skills/skill-creation-result-demo/agents/main.md",
        ".claude/skills/skill-creation-result-demo/references/guide.md",
      ],
    },
    persistError: null,
    sessionId: "session-rt-03-skill-creation",
    resultSubtype: "skill_creation",
    stopReason: "complete",
    ...overrides,
  };
}

function createVerifyDetail(
  overrides: Partial<RuntimeSkillCreatorVerifyDetail> = {},
): RuntimeSkillCreatorVerifyDetail {
  return {
    planId: "plan-rt-03-skill-creation",
    currentPhase: "verify",
    status: "pass",
    message: "全チェック項目に合格しました",
    nextAction: "handoff",
    checks: [
      {
        id: "chk-rt-03-01",
        layer: "layer1",
        severity: "info",
        summary: "必要なファイルが揃っています",
        evidenceSummary: "SKILL.md と補助ファイルが存在します",
      },
      {
        id: "chk-rt-03-02",
        layer: "layer2",
        severity: "warning",
        summary: "説明の補足を追加できます",
        evidenceSummary: "plan の要点をさらに明確化できます",
      },
      {
        id: "chk-rt-03-03",
        layer: "layer3",
        severity: "error",
        summary: "未同期の参照があります",
        evidenceSummary: "phase-12 の記録が不足しています",
      },
      {
        id: "chk-rt-03-04",
        layer: "layer4",
        severity: "info",
        summary: "台帳との整合性は保たれています",
      },
    ],
    evidenceCount: 4,
    resolvedSkillCreatorRoot:
      "/workspace/.claude/skills/skill-creation-result-demo",
    manifestPath:
      "/workspace/.claude/skills/skill-creation-result-demo/manifest.json",
    resourceDescriptorHash: "hash-rt-03-demo",
    manifestCacheKey: "cache-rt-03-demo",
    route: {
      type: "integrated_api",
      permissionMode: "default",
      summary: "通常の integrated_api ルート",
    },
    reverifyEligible: true,
    delegatedGovernanceNote: "ガバナンスノートは表示可能です",
    delegatedSessionNote: "セッションノートは表示可能です",
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
  testId,
  title,
  description,
  children,
}: {
  testId: string;
  title: string;
  description: string;
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

function Phase11SkillCreationResultHarness(): JSX.Element {
  const initialPlan = createPlanResult();
  const planOnly = createPlanResult({
    skillName: "skill-creation-plan-only",
    description: "Plan だけの状態を確認する",
  });
  const executeSuccess = createExecuteResult();
  const executeFailure = createExecuteResult({
    success: false,
    error: "スキルファイルの書き出しに失敗しました",
    persistResult: null,
    persistError: "persist 先のディレクトリが見つかりませんでした",
  });
  const verifyPass = createVerifyDetail({
    status: "pass",
    message: "verify は合格です",
    nextAction: "handoff",
    reverifyEligible: true,
  });
  const verifyFail = createVerifyDetail({
    status: "fail",
    message: "verify で差分が見つかりました",
    nextAction: "improve",
    reverifyEligible: false,
    disabledReason: "改善前のため再検証できません",
    route: {
      type: "terminal_handoff",
      launcher: "manual-review",
      summary: "人手での改善確認が必要です",
      permissionMode: "acceptEdits",
    },
  });

  return (
    <main
      data-testid="phase11-skill-creation-result-harness"
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      <LightThemeBootstrap />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-8 py-7 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--status-primary)]">
            Phase 11 Visual Audit
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
            SkillCreationResultPanel
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-secondary)]">
            plan / execute / verify の結果を 1 枚の結果パネルに束ねた状態を、 6
            つの代表シナリオで確認する。
          </p>
        </header>

        <section className="grid gap-6">
          <ScenarioCard
            testId="phase11-skill-creation-initial-card"
            title="TC-11-01 initial"
            description="全 props が null の初期状態。空状態と進行中の全体ステータスを確認する。"
          >
            <SkillCreationResultPanel
              planResult={null}
              executeResult={null}
              verifyDetail={null}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-skill-creation-plan-card"
            title="TC-11-02 plan complete"
            description="planResult のみがある状態。Plan 完了バッジと plan 詳細を確認する。"
          >
            <SkillCreationResultPanel
              planResult={planOnly}
              executeResult={null}
              verifyDetail={null}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-skill-creation-execute-card"
            title="TC-11-03 execute success"
            description="executeResult.success=true の状態。保存先と生成ファイル一覧を確認する。"
          >
            <SkillCreationResultPanel
              planResult={initialPlan}
              executeResult={executeSuccess}
              verifyDetail={null}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-skill-creation-verify-pass-card"
            title="TC-11-04 verify pass"
            description="plan / execute / verify が揃った完了状態。全体ステータス「完了」を確認する。"
          >
            <SkillCreationResultPanel
              planResult={initialPlan}
              executeResult={executeSuccess}
              verifyDetail={verifyPass}
              onReverify={() => undefined}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-skill-creation-verify-fail-card"
            title="TC-11-05 verify fail"
            description="verify fail の状態。Layer 別チェック、disabledReason、再検証ボタンを確認する。"
          >
            <SkillCreationResultPanel
              planResult={initialPlan}
              executeResult={executeSuccess}
              verifyDetail={verifyFail}
              onReverify={() => undefined}
            />
          </ScenarioCard>

          <ScenarioCard
            testId="phase11-skill-creation-execute-fail-card"
            title="TC-11-06 execute fail"
            description="executeResult.success=false の状態。実行失敗バッジと persistError を確認する。"
          >
            <SkillCreationResultPanel
              planResult={initialPlan}
              executeResult={executeFailure}
              verifyDetail={null}
            />
          </ScenarioCard>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Phase11SkillCreationResultHarness />,
);
