import React from "react";
import ReactDOM from "react-dom/client";
import { SkillStreamingView } from "./components/skill/SkillStreamingView";
import "./styles/globals.css";

type HarnessStatus = "review" | "improve_ready" | "reuse_ready";
type HarnessTheme = "light" | "dark";

type ScenarioDefinition = {
  testId: string;
  title: string;
  description: string;
  status: HarnessStatus;
  messages: React.ComponentProps<typeof SkillStreamingView>["messages"];
};

function getTheme(): HarnessTheme {
  return new URLSearchParams(window.location.search).get("theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

const now = new Date("2026-03-20T14:00:00.000Z").getTime();

const scenarios: ScenarioDefinition[] = [
  {
    testId: "phase11-status-review",
    title: "TC-11-01 review",
    description: "完了直後にレビュー待ちへ移行した状態を確認する。",
    status: "review",
    messages: [
      {
        executionId: "phase11-review",
        type: "assistant",
        timestamp: now,
        content: {
          text: "実行結果の棚卸しが終わり、レビュー待ちに入りました。",
          isPartial: false,
        },
      },
    ],
  },
  {
    testId: "phase11-status-improve-ready",
    title: "TC-11-02 improve_ready",
    description: "改善候補が整理され、再実行準備が整った状態を確認する。",
    status: "improve_ready",
    messages: [
      {
        executionId: "phase11-improve",
        type: "assistant",
        timestamp: now + 1_000,
        content: {
          text: "改善ポイントを反映できる状態です。続けて改善サイクルへ進めます。",
          isPartial: false,
        },
      },
    ],
  },
  {
    testId: "phase11-status-reuse-ready",
    title: "TC-11-03 reuse_ready",
    description: "再利用可能な形で結果が確定した状態を確認する。",
    status: "reuse_ready",
    messages: [
      {
        executionId: "phase11-reuse",
        type: "assistant",
        timestamp: now + 2_000,
        content: {
          text: "再利用候補として確定しました。履歴からいつでも呼び出せます。",
          isPartial: false,
        },
      },
      {
        executionId: "phase11-reuse",
        type: "tool_result",
        timestamp: now + 2_500,
        content: {
          toolUseId: "tool-reuse-001",
          success: true,
          result: "再利用準備が完了しました",
        },
      },
    ],
  },
];

function Phase11ExecutionStatusHarness(): JSX.Element {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <header className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-8 py-7 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--status-primary)]">
            Phase 11 Visual Audit
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
            SkillExecutionStatus 3値の視覚検証
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-secondary)]">
            `review` / `improve_ready` / `reuse_ready` が renderer の
            StatusBadge に正しいラベルで表示されるかを、専用 harness
            で要素単位に確認する。
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <article
              key={scenario.status}
              data-testid={scenario.testId}
              className="overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)]"
            >
              <div className="border-b border-[var(--border-subtle)] px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--status-primary)]">
                  {scenario.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {scenario.description}
                </p>
              </div>
              <SkillStreamingView
                skillName="phase11-lifecycle-sample"
                messages={scenario.messages}
                status={scenario.status}
              />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

applyTheme(getTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Phase11ExecutionStatusHarness />,
);
