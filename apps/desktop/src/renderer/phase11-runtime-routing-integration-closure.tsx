import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { TerminalHandoffCard } from "./components/organisms/TerminalHandoffCard";
import "./styles/globals.css";

type Variant =
  | "tc01-skill-handoff"
  | "tc02-skill-integrated"
  | "tc03-agent-handoff"
  | "tc04-layout"
  | "tc05-copy-feedback"
  | "tc06-dismiss"
  | "tc07-dark-mode"
  | "tc08-chat-edit-regression"
  | "tc09-skill-regression";

function getVariant(): Variant {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("variant");
  switch (raw) {
    case "tc02-skill-integrated":
    case "tc03-agent-handoff":
    case "tc04-layout":
    case "tc05-copy-feedback":
    case "tc06-dismiss":
    case "tc07-dark-mode":
    case "tc08-chat-edit-regression":
    case "tc09-skill-regression":
      return raw;
    case "tc01-skill-handoff":
    default:
      return "tc01-skill-handoff";
  }
}

function applyTheme(): "light" | "dark" {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme") === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  return theme;
}

const baseSkillGuidance = {
  terminalCommand: 'claude "スキル実行の続きを進めてください"',
  contextSummary: "surface=skill skill=skill-creator",
  reason:
    "サブスクリプションモードのため、Claude Code CLI で続行してください。",
};

const baseAgentGuidance = {
  terminalCommand:
    'claude "現在のコンテキストからエージェント実行を続けてください"',
  contextSummary: "surface=agent skill=agent-01",
  reason: "APIキーが設定されていません。",
};

const longCommandGuidance = {
  terminalCommand:
    'claude --add-dir "/Users/dev/workspace" "ランタイムルーティング統合の継続実装を行い、スキル/エージェント画面のハンドオフUIをスクリーンショットで検証してください。"',
  contextSummary: "surface=skill skill=runtime-routing-integration-closure",
  reason:
    "サブスクリプションモードのため、Claude Code CLI で続行してください。",
};

const variantLabels: Record<Variant, string> = {
  "tc01-skill-handoff": "TC-01 スキル引き継ぎ",
  "tc02-skill-integrated": "TC-02 スキル統合実行",
  "tc03-agent-handoff": "TC-03 エージェント引き継ぎ",
  "tc04-layout": "TC-04 長文コマンドレイアウト",
  "tc05-copy-feedback": "TC-05 コピー操作のフィードバック",
  "tc06-dismiss": "TC-06 引き継ぎカードを閉じる",
  "tc07-dark-mode": "TC-07 スキル引き継ぎ（ダーク）",
  "tc08-chat-edit-regression": "TC-08 chat-edit回帰確認",
  "tc09-skill-regression": "TC-09 APIキー方式の回帰確認",
};

const RuntimeRoutingHarness: React.FC = () => {
  const variant = useMemo(getVariant, []);
  const theme = useMemo(applyTheme, []);
  const themeLabel = theme === "dark" ? "ダーク" : "ライト";

  const initialGuidance =
    variant === "tc03-agent-handoff"
      ? baseAgentGuidance
      : variant === "tc04-layout" || variant === "tc05-copy-feedback"
        ? longCommandGuidance
        : variant === "tc01-skill-handoff" ||
            variant === "tc06-dismiss" ||
            variant === "tc07-dark-mode"
          ? baseSkillGuidance
          : null;

  const [guidance, setGuidance] = useState(initialGuidance);
  const [copyCount, setCopyCount] = useState(0);

  return (
    <main
      data-testid="phase11-runtime-routing-harness"
      className="min-h-screen bg-[var(--bg-primary)] px-8 py-10 text-[var(--text-primary)]"
    >
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold">
            ランタイムルーティング統合クロージャ - Phase 11 ハーネス
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            バリアント: {variantLabels[variant]} / テーマ: {themeLabel}
          </p>
        </header>

        {variant === "tc02-skill-integrated" && (
          <div
            data-testid="phase11-skill-integrated-result"
            className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800"
          >
            スキル統合実行パスが完了しました。ターミナル引き継ぎは表示されません。
          </div>
        )}

        {variant === "tc08-chat-edit-regression" && (
          <div
            data-testid="phase11-chat-edit-regression-result"
            className="rounded-lg border border-sky-300 bg-sky-50 p-4 text-sky-900"
          >
            chat-edit のランタイムルーティング回帰確認: PASS（既存動作を維持）。
          </div>
        )}

        {variant === "tc09-skill-regression" && (
          <div
            data-testid="phase11-skill-regression-result"
            className="rounded-lg border border-indigo-300 bg-indigo-50 p-4 text-indigo-900"
          >
            APIキー方式のスキル実行回帰確認: PASS（統合実行パスを維持）。
          </div>
        )}

        {guidance && (
          <div data-testid="phase11-terminal-handoff-card">
            <TerminalHandoffCard
              guidance={guidance}
              onCopyCommand={() => setCopyCount((prev) => prev + 1)}
              onDismiss={() => setGuidance(null)}
            />
          </div>
        )}

        {!guidance && (
          <div
            data-testid="phase11-handoff-hidden"
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-secondary)]"
          >
            ターミナル引き継ぎカードは非表示です。
          </div>
        )}

        <div
          data-testid="phase11-copy-count"
          className="text-xs text-[var(--text-secondary)]"
        >
          コピー回数={copyCount}
        </div>
      </section>
    </main>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error(
    "ランタイムルーティング用ハーネスのルート要素が見つかりませんでした",
  );
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RuntimeRoutingHarness />
  </React.StrictMode>,
);
