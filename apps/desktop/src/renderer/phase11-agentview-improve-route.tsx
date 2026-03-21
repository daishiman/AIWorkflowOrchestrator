/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — Phase 11 screenshot harness (not production code)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { useAppStore } from "./store";
import {
  toSkillId,
  type ImportedSkill,
  type Skill,
} from "@repo/shared/types/skill";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

type HarnessScenario = "cta-visible" | "cta-hidden" | "analysis";
type HarnessTheme = "light" | "dark";

function getScenario(): HarnessScenario {
  const scenario = new URLSearchParams(window.location.search).get("scenario");
  switch (scenario) {
    case "cta-hidden":
    case "analysis":
    case "cta-visible":
      return scenario;
    default:
      return "cta-visible";
  }
}

function getTheme(): HarnessTheme {
  return new URLSearchParams(window.location.search).get("theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

const now = "2026-03-20T09:00:00.000Z";

const importedSkills: ImportedSkill[] = [
  {
    name: "skill-alpha",
    description: "AgentView から SkillAnalysisView への handoff 検証用スキル",
    path: "/mock/skills/skill-alpha",
    allowedTools: ["Read", "Write"],
    updatedAt: now,
    importedAt: now,
    status: "active",
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: "skill-beta",
    description: "比較表示用の補助スキル",
    path: "/mock/skills/skill-beta",
    allowedTools: ["Read"],
    updatedAt: now,
    importedAt: now,
    status: "active",
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

const selectedSkill: Skill = {
  id: toSkillId("phase11:skill-alpha"),
  name: "skill-alpha",
  slug: "skill-alpha",
  description: "AgentView から SkillAnalysisView への handoff 検証用スキル",
  path: "/mock/skills/skill-alpha",
  triggers: [],
  anchors: [],
  lastModified: new Date(now),
};

const mockAnalysis: SkillAnalysis = {
  skillName: "skill-alpha",
  overallScore: 84,
  categories: [
    {
      name: "routing",
      score: 88,
      details: "Agent 起点の handoff と戻り導線は正しく構成されています。",
      issues: [],
    },
    {
      name: "ux",
      score: 80,
      details: "CTA の露出条件は妥当ですが、微細なアニメーションは未追加です。",
      issues: ["CTA バナーの 200-300ms 遷移は follow-up 候補です。"],
    },
  ],
  suggestions: [
    {
      type: "documentation",
      priority: "medium",
      description: "Phase 11/12 の証跡を current workflow に同期する",
      autoFixable: false,
    },
    {
      type: "ux",
      priority: "low",
      description: "CTA バナー出現時に軽いフェードを追加する",
      autoFixable: true,
    },
  ],
  risks: [
    {
      category: "state",
      level: "low",
      description: "viewHistory は agent へ再遷移するたびに積み上がります。",
      impact:
        "長いセッションでは戻る導線の意図が読みづらくなる可能性があります。",
    },
  ],
  analyzedAt: now,
};

function createNamespaceProxy(entries: Record<string, unknown> = {}) {
  return new Proxy(entries, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      if (typeof prop === "string" && prop.startsWith("on")) {
        return () => () => {};
      }
      return async () => ({ success: true, data: {} });
    },
  });
}

function ensureElectronApi(theme: HarnessTheme): void {
  const resolvedTheme = theme;
  const mockUser = {
    id: "phase11-agentview-improve-route",
    email: "phase11-agentview-improve-route@example.com",
    displayName: "Phase11 Reviewer",
    avatarUrl: null,
    provider: "google",
    createdAt: now,
    lastSignInAt: now,
  };

  const llmProviders = [
    {
      id: "anthropic",
      name: "Anthropic",
      isAvailable: true,
      models: [
        {
          id: "claude-sonnet-4-5",
          name: "Claude Sonnet 4.5",
          description: "Phase 11 harness default model",
          isDefault: true,
        },
      ],
    },
  ];

  const noop = async () => ({ success: true, data: {} });

  window.confirm = () => true;
  localStorage.setItem("dev-skip-auth", "true");

  (
    window as typeof window & {
      electronAPI?: Record<string, unknown>;
    }
  ).electronAPI = {
    auth: createNamespaceProxy({
      checkOnline: async () => ({ success: true, data: { online: true } }),
      getSession: async () => ({
        success: true,
        data: {
          user: mockUser,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          isOffline: false,
        },
      }),
      onAuthStateChanged: (callback: (state: unknown) => void) => {
        setTimeout(() => {
          callback({
            authenticated: true,
            user: mockUser,
            isOffline: false,
          });
        }, 10);
        return () => {};
      },
      login: async () => ({ success: true }),
      logout: noop,
      refresh: async () => ({
        success: true,
        data: {
          user: mockUser,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          isOffline: false,
        },
      }),
    }),
    theme: createNamespaceProxy({
      get: async () => ({
        success: true,
        data: { mode: resolvedTheme, resolvedTheme },
      }),
      set: async ({ mode }: { mode: HarnessTheme }) => ({
        success: true,
        data: { mode, resolvedTheme: mode },
      }),
      getSystem: async () => ({
        success: true,
        data: { isDark: resolvedTheme === "dark", resolvedTheme },
      }),
      onSystemChanged: () => () => {},
    }),
    profile: createNamespaceProxy({
      get: async () => ({ success: true, data: mockUser }),
      getProviders: async () => ({ success: true, data: [] }),
      update: noop,
      linkProvider: noop,
      unlinkProvider: noop,
      delete: noop,
    }),
    avatar: createNamespaceProxy({
      upload: noop,
      useProvider: noop,
      remove: noop,
    }),
    store: createNamespaceProxy({
      get: async ({
        key,
        defaultValue,
      }: {
        key: string;
        defaultValue?: unknown;
      }) => {
        if (key === "onboarding.hasCompleted") {
          return { success: true, data: true };
        }
        if (key === "onboarding.userName") {
          return { success: true, data: "Phase11 Reviewer" };
        }
        if (key === "onboarding.selectedStarterTool") {
          return { success: true, data: "agent" };
        }
        return {
          success: true,
          data: defaultValue,
        };
      },
      set: async () => ({ success: true }),
    }),
    notification: createNamespaceProxy({
      getHistory: async () => ({
        success: true,
        data: { notifications: [], totalCount: 0 },
      }),
      markRead: noop,
      markAllRead: noop,
      clear: noop,
    }),
    historySearch: createNamespaceProxy({
      search: async () => ({
        success: true,
        data: { items: [], totalCount: 0, hasMore: false },
      }),
      getStats: async () => ({
        success: true,
        data: { chat: 0, file: 0, skill: 0, total: 0 },
      }),
    }),
    authKey: createNamespaceProxy({
      set: noop,
      exists: async () => ({ exists: true }),
      validate: async () => ({ valid: true, message: "ok" }),
      delete: noop,
    }),
    permissions: createNamespaceProxy({
      getMode: async () => "default",
      getRemembered: async () => [],
      setMode: async () => undefined,
      clearRemembered: async () => undefined,
    }),
    llm: createNamespaceProxy({
      getProviders: async () => llmProviders,
      setSelectedConfig: async () => undefined,
      checkHealth: async (providerId: string) => ({
        status: "connected",
        providerId,
        checkedAt: new Date(now),
      }),
    }),
    skill: createNamespaceProxy({
      list: async () => [],
      getImported: async () => importedSkills,
      rescan: async () => [],
      import: async (skillName: string) =>
        importedSkills.find((skill) => skill.name === skillName) ??
        importedSkills[0],
      remove: async () => undefined,
      execute: async ({ skillName }: { skillName: string }) => ({
        executionId: `exec-${skillName}-phase11`,
      }),
      abort: async () => undefined,
      sendPermissionResponse: async () => undefined,
      onStream: () => () => {},
      onComplete: () => () => {},
      onError: () => () => {},
      onPermissionRequest: () => () => {},
      analyze: async (skillName: string) => ({
        ...mockAnalysis,
        skillName,
      }),
      applyImprovements: async () => ({ applied: [], skipped: [] }),
      autoImprove: async () => ({ applied: [], skipped: [] }),
    }),
  };
}

function bootstrapScenario(
  scenario: HarnessScenario,
  theme: HarnessTheme,
): void {
  applyTheme(theme);
  ensureElectronApi(theme);

  useAppStore.setState({
    currentView: scenario === "analysis" ? "skillAnalysis" : "agent",
    viewHistory:
      scenario === "analysis"
        ? ["dashboard", "agent", "skillAnalysis"]
        : ["dashboard", "agent"],
    currentSkillName: scenario === "analysis" ? "skill-alpha" : null,
    importedSkills,
    availableSkillsMetadata: [],
    importedSkillIds: [selectedSkill.id],
    selectedSkill: scenario === "cta-hidden" ? null : selectedSkill,
    selectedSkillName: scenario === "cta-hidden" ? null : "skill-alpha",
    skillFilter: "",
    isImportDialogOpen: false,
    toastMessage: null,
    recentExecutions: [
      {
        executionId: "phase11-exec-01",
        skillName: "skill-alpha",
        skillDisplayName: "skill-alpha",
        status: "completed",
        startedAt: new Date("2026-03-20T08:56:00.000Z"),
        completedAt: new Date("2026-03-20T08:57:12.000Z"),
        duration: 72_000,
      },
    ],
    isAdvancedSettingsOpen: false,
    isExecuting: false,
    executionId: "phase11-exec-01",
    skillExecutionStatus: scenario === "cta-hidden" ? null : "completed",
    currentAnalysis: null,
    previousAnalysis: null,
    isAnalyzing: false,
    isImproving: false,
    providers: [
      {
        id: "anthropic",
        name: "Anthropic",
        isAvailable: true,
        models: [
          {
            id: "claude-sonnet-4-5",
            name: "Claude Sonnet 4.5",
            description: "Phase 11 harness default model",
            isDefault: true,
          },
        ],
      },
    ],
    selectedProviderId: "anthropic",
    selectedModelId: "claude-sonnet-4-5",
    healthStatus: {
      anthropic: {
        status: "connected",
        providerId: "anthropic",
        checkedAt: new Date(now),
      },
    },
    isAuthenticated: true,
    isLoading: false,
    themeMode: theme,
    resolvedTheme: theme,
    windowSize: { width: 1440, height: 960 },
    responsiveMode: "desktop",
    dynamicIsland: {
      visible: false,
      status: "completed",
      message: "",
    },
  });
}

const scenario = getScenario();
const theme = getTheme();
bootstrapScenario(scenario, theme);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
