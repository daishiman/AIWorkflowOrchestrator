import React from "react";
import ReactDOM from "react-dom/client";
import { AuthGuard } from "./components/AuthGuard";
import { useAppStore } from "./store";
import { SettingsView } from "./views/SettingsView";
import "./styles/globals.css";

type Phase11HarnessState = Partial<ReturnType<typeof useAppStore.getState>> & {
  resolvedTheme?: ReturnType<typeof useAppStore.getState>["resolvedTheme"];
};

declare global {
  interface Window {
    __PHASE11_AUTHGUARD_TIMEOUT_HARNESS__?: Phase11HarnessState;
  }
}

const harnessState = window.__PHASE11_AUTHGUARD_TIMEOUT_HARNESS__;

if (harnessState) {
  useAppStore.setState(harnessState);

  if (harnessState.resolvedTheme) {
    document.documentElement.setAttribute(
      "data-theme",
      harnessState.resolvedTheme,
    );
    document.documentElement.style.colorScheme =
      harnessState.resolvedTheme === "light" ? "light" : "dark";
  }
}

const ProtectedShell = (): JSX.Element => (
  <div
    className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
    data-testid="phase11-protected-shell"
  >
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
      <section className="w-full rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 shadow-[var(--shadow-lg)]">
        <p className="mb-2 text-sm uppercase tracking-[0.24em] text-[var(--text-secondary)]">
          Protected Shell
        </p>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          AuthGuard 保護ビュー
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          認証が成功した場合のみ表示される想定のダッシュボードハーネスです。
        </p>
      </section>
    </main>
  </div>
);

const SettingsShell = (): JSX.Element => (
  <div
    className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
    data-testid="phase11-settings-shell"
  >
    <main className="min-h-screen p-6">
      <SettingsView />
    </main>
  </div>
);

const Phase11AuthguardTimeoutHarness = (): JSX.Element => {
  const currentView = useAppStore((state) => state.currentView);

  if (currentView === "settings") {
    return <SettingsShell />;
  }

  return (
    <AuthGuard>
      <ProtectedShell />
    </AuthGuard>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Phase11AuthguardTimeoutHarness />,
);
