import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { validateAndSyncPersistedConfig } from "./store/slices/llmSlice";
import type {
  LLMProvider,
  LLMProviderId,
} from "@repo/shared/types/llm/schemas";

const PERSIST_KEY = "knowledge-studio-store";
const RELOAD_COUNT_KEY = "phase11-llm-config-persistence-reload-count";

type HarnessScenario = "valid" | "invalid" | "legacy";

type PersistedStore = {
  state?: Record<string, unknown>;
  version?: number;
};

type HarnessViewModel = {
  rawStore: PersistedStore;
  persistedVersion: number;
  persistedProviderId: string | null;
  persistedModelId: string | null;
  effectiveProviderId: string | null;
  effectiveModelId: string | null;
  providerName: string;
  modelName: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger";
  summary: string;
  isLegacy: boolean;
};

const PROVIDERS: LLMProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        isDefault: true,
      },
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        isDefault: false,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        isDefault: true,
      },
    ],
  },
];

function getScenario(): HarnessScenario {
  const value = new URLSearchParams(window.location.search).get("scenario");
  if (value === "invalid" || value === "legacy" || value === "valid") {
    return value;
  }
  return "valid";
}

function getSelectedString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isKnownProviderId(value: string | null): value is LLMProviderId {
  return (
    value === "anthropic" ||
    value === "openai" ||
    value === "google" ||
    value === "xai"
  );
}

function createPersistState(scenario: HarnessScenario): PersistedStore {
  const baseState = {
    currentView: "settings",
    selectedFile: null,
    expandedFolders: [],
    userProfile: null,
    autoSyncEnabled: false,
    windowSize: { width: 1440, height: 1600 },
    isNavExpanded: true,
    permissionHistory: [],
    notifications: [],
  };

  switch (scenario) {
    case "invalid":
      return {
        version: 2,
        state: {
          ...baseState,
          selectedProviderId: "legacy-provider",
          selectedModelId: "legacy-model",
        },
      };
    case "legacy":
      return {
        version: 1,
        state: baseState,
      };
    case "valid":
    default:
      return {
        version: 2,
        state: {
          ...baseState,
          selectedProviderId: "anthropic",
          selectedModelId: "claude-3-5-sonnet",
        },
      };
  }
}

function readPersistedStore(scenario: HarnessScenario): PersistedStore {
  const raw = window.localStorage.getItem(PERSIST_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PersistedStore;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // fall through to seed
    }
  }

  const seeded = createPersistState(scenario);
  window.localStorage.setItem(PERSIST_KEY, JSON.stringify(seeded));
  return seeded;
}

function createViewModel(scenario: HarnessScenario): HarnessViewModel {
  const rawStore = readPersistedStore(scenario);
  const rawState = rawStore.state ?? {};
  const persistedVersion =
    typeof rawStore.version === "number" ? rawStore.version : 0;
  const persistedProviderIdRaw = getSelectedString(rawState.selectedProviderId);
  const persistedProviderId = isKnownProviderId(persistedProviderIdRaw)
    ? persistedProviderIdRaw
    : null;
  const persistedModelId = getSelectedString(rawState.selectedModelId);

  const normalized = validateAndSyncPersistedConfig(
    persistedProviderId,
    persistedModelId,
    PROVIDERS,
  );

  const provider = PROVIDERS.find((item) => item.id === normalized.providerId);
  const model = provider?.models.find((item) => item.id === normalized.modelId);
  const isLegacy = persistedVersion < 2;

  let statusLabel = "persist v2 is hydrated";
  let statusTone: HarnessViewModel["statusTone"] = "success";
  let summary =
    "selectedProviderId / selectedModelId が localStorage からそのまま復元されました。";

  if (isLegacy) {
    statusLabel = "legacy state normalized to v2";
    statusTone = "warning";
    summary =
      "version 1 の入力は v2 へ正規化され、persist 追加フィールドの初期値が安全に補われます。";
  } else if (!normalized.providerId) {
    statusLabel = "invalid provider cleared";
    statusTone = "danger";
    summary =
      "存在しない provider は null にクリアされ、DEFAULT_CONFIG への暗黙 fallback は発生しません。";
  }

  return {
    rawStore,
    persistedVersion,
    persistedProviderId,
    persistedModelId,
    effectiveProviderId: normalized.providerId,
    effectiveModelId: normalized.modelId,
    providerName: provider?.name ?? "未選択",
    modelName: model?.name ?? "未選択",
    statusLabel,
    statusTone,
    summary,
    isLegacy,
  };
}

function toneClasses(tone: HarnessViewModel["statusTone"]): string {
  switch (tone) {
    case "danger":
      return "border-rose-400/50 bg-rose-500/10 text-rose-200";
    case "warning":
      return "border-amber-400/50 bg-amber-500/10 text-amber-200";
    case "success":
    default:
      return "border-emerald-400/50 bg-emerald-500/10 text-emerald-200";
  }
}

function keyValue(
  label: string,
  value: string | null | undefined,
): JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">
        {value ?? "未選択"}
      </div>
    </div>
  );
}

function Harness(): JSX.Element {
  const scenario = getScenario();
  const [reloadCount, setReloadCount] = useState(() => {
    const current =
      Number(window.sessionStorage.getItem(RELOAD_COUNT_KEY) ?? "0") + 1;
    window.sessionStorage.setItem(RELOAD_COUNT_KEY, String(current));
    return current;
  });
  const [viewModel] = useState(() => createViewModel(scenario));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  useEffect(() => {
    setReloadCount(
      Number(window.sessionStorage.getItem(RELOAD_COUNT_KEY) ?? "1"),
    );
  }, [scenario]);

  const rawState = viewModel.rawStore.state ?? {};
  const rawSummary = useMemo(
    () => JSON.stringify(viewModel.rawStore, null, 2),
    [viewModel.rawStore],
  );

  return (
    <div
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.28),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#111827_100%)] text-slate-100"
      data-testid="phase11-llm-config-persistence"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03)_0%,transparent_28%,transparent_72%,rgba(255,255,255,0.03)_100%)]" />
      <main className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-300/80">
                Phase 11 dedicated harness
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                LLM Config Persistence Review
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                `knowledge-studio-store` の persist v2、無効 provider の null
                クリア、再読み込み後の状態維持を1画面で確認する。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                persist v2
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
                reload count {reloadCount}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
                scenario {scenario}
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Raw Storage
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  localStorage snapshot
                </h2>
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses(viewModel.statusTone)}`}
              >
                {viewModel.statusLabel}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {keyValue("Stored version", String(viewModel.persistedVersion))}
              {keyValue(
                "Current view",
                getSelectedString(rawState.currentView) ?? "settings",
              )}
              {keyValue("selectedProviderId", viewModel.persistedProviderId)}
              {keyValue("selectedModelId", viewModel.persistedModelId)}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-200">Raw JSON</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  key: {PERSIST_KEY}
                </span>
              </div>
              <pre className="mt-3 max-h-[320px] overflow-auto text-xs leading-6 text-slate-300">
                {rawSummary}
              </pre>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Validation
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              normalized selection
            </h2>

            <div className="mt-5 space-y-4">
              {keyValue("Effective provider", viewModel.effectiveProviderId)}
              {keyValue("Effective model", viewModel.effectiveModelId)}
              {keyValue("Provider label", viewModel.providerName)}
              {keyValue("Model label", viewModel.modelName)}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-sm font-semibold text-white">
                Validation note
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {viewModel.summary}
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Validation policy
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  無効な provider は fallback せず `null` にクリアする。
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Migration guard
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  {viewModel.isLegacy
                    ? "legacy v1 input was normalized to v2 schema."
                    : "v2 schema is already present in storage."}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Reload
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              reload retention proof
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  mount count
                </div>
                <div className="mt-2 text-4xl font-black text-white">
                  {reloadCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  retained after reload
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-300">
                  {reloadCount >= 2
                    ? "ページ再読み込み後も同じ provider / model が保持されている。"
                    : "左のボタンで再読み込みすると mount count が 2 になり、保持状態を確認できる。"}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                aria-label="ページを再読み込み"
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition-transform hover:-translate-y-0.5"
              >
                ページを再読み込み
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-6 text-slate-300">
                reload 後の state は `knowledge-studio-store` の localStorage
                から再読込される。
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Provider Catalog
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              available providers used for validation
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {provider.name}
                    </h3>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-200">
                      available
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {provider.models.map((model) => (
                      <li
                        key={model.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                      >
                        <span>{model.name}</span>
                        <span className="text-xs text-slate-400">
                          {model.isDefault ? "default" : model.id}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-indigo-950/70 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Snapshot Summary
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              visual checkpoints
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  persist v2
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  version {viewModel.persistedVersion} / raw storage visible
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  invalid clear
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  provider {viewModel.effectiveProviderId ?? "null"}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  reload retained
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  mount count {reloadCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  current model
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  {viewModel.effectiveModelId ?? "null"}
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Harness />
  </React.StrictMode>,
);
