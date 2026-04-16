import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { InlineModelSelector } from "./components/llm";
import type { LLMProvider } from "@repo/shared/types/llm";

const providers: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "高性能マルチモーダルモデル",
        isDefault: true,
        contextWindow: 128000,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        isDefault: false,
        contextWindow: 128000,
      },
      {
        id: "gpt-4o-nano",
        name: "GPT-4o Nano",
        description: "",
        isDefault: false,
        contextWindow: 64000,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        description: "長文要約と推論に強いモデル",
        isDefault: true,
        contextWindow: 200000,
      },
    ],
  },
];

function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(180deg,var(--bg-primary)_0%,color-mix(in_srgb,var(--bg-secondary)_94%,transparent)_100%)] px-6 py-8 text-[var(--text-primary)]">
      <section
        data-testid="phase11-task-llm-mod-05-renderer-desc-display"
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-[32px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)] p-6 shadow-[var(--shadow-xl)] backdrop-blur-xl"
      >
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
              Phase 11 visual evidence
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              InlineModelSelector description tooltip
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              description がある model では title と sr-only を使って
              補助情報を持たせ、description がない model では余計な情報を
              追加しないことを確認する。
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
            compact renderer
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--text-secondary)]">
              Expected behavior
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-primary)]">
              <li>・閉じた状態では、トリガーにモデル名だけが見える。</li>
              <li>・ホバー時の説明は、title 属性と sr-only で保持される。</li>
              <li>・説明が空のモデルは、追加の補助情報を持たない。</li>
            </ul>

            <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
              このカード自体は静的な証跡ではなく、Playwright から selector
              を操作して同一コンポーネントの閉じ状態 / 開いた状態を 撮影する。
            </div>
          </div>

          <div className="flex items-start justify-center rounded-[24px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-5">
            <InlineModelSelector
              compact
              providers={providers}
              selectedProviderId="openai"
              selectedModelId="gpt-4o"
              healthStatus="healthy"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
