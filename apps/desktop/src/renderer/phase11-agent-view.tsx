import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { AgentView } from "./views/AgentView";
import { SkillChip } from "./components/organisms/AgentView/SkillChip";
import { ExecuteButton } from "./components/organisms/AgentView/ExecuteButton";
import { FloatingExecutionBar } from "./components/organisms/AgentView/FloatingExecutionBar";
import { AdvancedSettingsPanel } from "./components/organisms/AgentView/AdvancedSettingsPanel";
import { RecentExecutionList } from "./components/organisms/AgentView/RecentExecutionList";
import { useAppStore } from "./store";
import type { AppStore } from "./store";
import type { AgentPermissionMode } from "./components/organisms/AgentView/types";
import type { ExecutionSummary } from "./store/slices/agentSlice";
import {
  toSkillId,
  toSkillName,
  type ImportedSkill,
  type Skill,
} from "@repo/shared/types/skill";

type HarnessScenario =
  | "main-view"
  | "chip-selected"
  | "button-disabled"
  | "button-enabled"
  | "floating-executing"
  | "floating-completed"
  | "floating-error"
  | "panel-open"
  | "recent-list"
  | "empty-state"
  | "no-search"
  | "with-search";

function getScenario(): HarnessScenario {
  const raw = new URLSearchParams(window.location.search).get("scenario");
  switch (raw) {
    case "chip-selected":
    case "button-disabled":
    case "button-enabled":
    case "floating-executing":
    case "floating-completed":
    case "floating-error":
    case "panel-open":
    case "recent-list":
    case "empty-state":
    case "no-search":
    case "with-search":
    case "main-view":
      return raw;
    default:
      return "main-view";
  }
}

function getTheme(): "light" | "dark" {
  return new URLSearchParams(window.location.search).get("theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function ensureElectronAPI(): void {
  const targetWindow = window as typeof window & {
    electronAPI?: {
      permissions?: {
        getMode?: () => Promise<AgentPermissionMode>;
        getRemembered?: () => Promise<unknown[]>;
        setMode?: () => Promise<void>;
        clearRemembered?: () => Promise<void>;
      };
    };
  };

  targetWindow.electronAPI = {
    ...(targetWindow.electronAPI ?? {}),
    permissions: {
      getMode: async () => "plan",
      getRemembered: async () => [{}, {}, {}],
      setMode: async () => undefined,
      clearRemembered: async () => undefined,
    },
  };
}

function createSkill(index: number): Skill {
  return {
    id: toSkillId(`phase11-skill-${index}`),
    name: toSkillName(`Skill ${index}`),
    slug: `skill-${index}`,
    description: `Phase 11 harness skill ${index}`,
    path: `.claude/skills/skill-${index}/SKILL.md`,
    triggers: [],
    anchors: [],
    lastModified: new Date("2026-03-10T00:00:00+09:00"),
  };
}

function toImportedSkill(skill: Skill): ImportedSkill {
  return {
    name: skill.name,
    description: skill.description,
    path: skill.path,
    updatedAt: skill.lastModified,
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
    importedAt: skill.lastModified,
    status: "active",
  };
}

function createExecution(
  executionId: string,
  skillDisplayName: string,
  status: ExecutionSummary["status"],
  startedAt: Date,
): ExecutionSummary {
  return {
    executionId,
    skillName: skillDisplayName,
    skillDisplayName,
    status,
    startedAt,
    completedAt:
      status === "executing" ? null : new Date(startedAt.getTime() + 45_000),
    duration: status === "executing" ? null : 45_000,
  };
}

function buildAgentViewState(
  skills: Skill[],
  overrides: Partial<AppStore> = {},
): Partial<AppStore> {
  const selectedSkillName =
    overrides.selectedSkillName ?? skills[0]?.name ?? null;
  const selectedSkill =
    overrides.selectedSkill ??
    skills.find((skill) => skill.name === selectedSkillName) ??
    null;

  return {
    skillError: null,
    isLoadingSkills: false,
    importedSkills: skills.map(toImportedSkill),
    availableSkillsMetadata: [],
    importedSkillIds: skills.map((skill) => skill.id),
    selectedSkill: selectedSkill as AppStore["selectedSkill"],
    selectedSkillName,
    skillFilter: "",
    isImportDialogOpen: false,
    toastMessage: null,
    recentExecutions: [],
    isAdvancedSettingsOpen: false,
    isExecuting: false,
    skillExecutionStatus: null,
    providers: [
      {
        id: "anthropic",
        name: "Anthropic",
        isAvailable: true,
        models: [
          {
            id: "claude-opus-4",
            name: "Claude Opus 4",
            description: "最高性能",
            isDefault: true,
          },
        ],
      },
    ] as AppStore["providers"],
    selectedProviderId: "anthropic" as AppStore["selectedProviderId"],
    selectedModelId: "claude-opus-4",
    healthStatus: {
      anthropic: {
        status: "connected",
        providerId: "anthropic",
        checkedAt: new Date("2026-03-10T00:00:00+09:00"),
      },
    } as AppStore["healthStatus"],
    fetchSkills: async () => undefined,
    fetchProviders: async () => undefined,
    ...overrides,
  };
}

function bootstrapStoreForScenario(scenario: HarnessScenario): void {
  const threeSkills = [createSkill(1), createSkill(2), createSkill(3)];
  const tenSkills = Array.from({ length: 10 }, (_, index) =>
    createSkill(index + 1),
  );
  const elevenSkills = Array.from({ length: 11 }, (_, index) =>
    createSkill(index + 1),
  );

  let nextState: Partial<AppStore>;

  switch (scenario) {
    case "main-view":
      nextState = buildAgentViewState(threeSkills, {
        selectedSkill: null,
        selectedSkillName: null,
        recentExecutions: [],
      });
      break;
    case "empty-state":
      nextState = buildAgentViewState([], {
        selectedSkill: null,
        selectedSkillName: null,
        importedSkillIds: [],
      });
      break;
    case "no-search":
      nextState = buildAgentViewState(tenSkills, {
        selectedSkill: null,
        selectedSkillName: null,
      });
      break;
    case "with-search":
      nextState = buildAgentViewState(elevenSkills, {
        skillFilter: "Skill 1",
        selectedSkill: null,
        selectedSkillName: null,
      });
      break;
    default:
      nextState = buildAgentViewState(threeSkills);
      break;
  }

  useAppStore.setState(nextState);
}

function HarnessFrame({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      data-testid="phase11-agent-view-harness"
      className="min-h-screen bg-[var(--bg-primary)] px-8 py-10 text-[var(--text-primary)]"
    >
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </div>
  );
}

function renderScenario(scenario: HarnessScenario): JSX.Element {
  const startedAt = new Date(Date.now() - 95_000);
  const recentExecutions = [
    createExecution(
      "exec-001",
      "Skill 1",
      "completed",
      new Date(Date.now() - 2 * 60_000),
    ),
    createExecution(
      "exec-002",
      "Skill 2",
      "failed",
      new Date(Date.now() - 65 * 60_000),
    ),
    createExecution(
      "exec-003",
      "Skill 3",
      "executing",
      new Date(Date.now() - 20_000),
    ),
  ];

  switch (scenario) {
    case "chip-selected":
      return (
        <HarnessFrame>
          <section className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">SkillChip 選択状態</h1>
            <div
              role="radiogroup"
              aria-label="ツール選択"
              className="flex gap-4"
            >
              <SkillChip
                skillName="skill-analysis"
                displayName="Skill Analysis"
                isSelected={true}
                onSelect={() => undefined}
              />
              <SkillChip
                skillName="skill-import"
                displayName="Skill Import"
                isSelected={false}
                onSelect={() => undefined}
              />
            </div>
          </section>
        </HarnessFrame>
      );
    case "button-disabled":
      return (
        <HarnessFrame>
          <section className="mx-auto max-w-[600px]">
            <ExecuteButton
              selectedSkillName={null}
              onExecute={() => undefined}
              isExecuting={false}
            />
          </section>
        </HarnessFrame>
      );
    case "button-enabled":
      return (
        <HarnessFrame>
          <section className="mx-auto max-w-[600px]">
            <ExecuteButton
              selectedSkillName="Skill 1"
              onExecute={() => undefined}
              isExecuting={false}
            />
          </section>
        </HarnessFrame>
      );
    case "floating-executing":
      return (
        <HarnessFrame>
          <div className="h-[500px] rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/60" />
          <FloatingExecutionBar
            skillName="Skill 1"
            status="executing"
            startedAt={startedAt}
            progress={40}
            onStop={() => undefined}
          />
        </HarnessFrame>
      );
    case "floating-completed":
      return (
        <HarnessFrame>
          <div className="h-[500px] rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/60" />
          <FloatingExecutionBar
            skillName="Skill 1"
            status="completed"
            startedAt={startedAt}
            onStop={() => undefined}
          />
        </HarnessFrame>
      );
    case "floating-error":
      return (
        <HarnessFrame>
          <div className="h-[500px] rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/60" />
          <FloatingExecutionBar
            skillName="Skill 1"
            status="failed"
            startedAt={startedAt}
            onStop={() => undefined}
          />
        </HarnessFrame>
      );
    case "panel-open":
      return (
        <HarnessFrame>
          <div className="h-[720px] rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/60" />
          <AdvancedSettingsPanel
            isOpen={true}
            onClose={() => undefined}
            models={[
              {
                providerId: "anthropic",
                modelId: "claude-opus-4",
                displayName: "Claude Opus 4",
                description: "最高性能",
                healthStatus: "healthy",
                isSelected: true,
              },
              {
                providerId: "anthropic",
                modelId: "claude-sonnet-4",
                displayName: "Claude Sonnet 4",
                description: "高バランス",
                healthStatus: "degraded",
                isSelected: false,
              },
            ]}
            selectedProviderId="anthropic"
            selectedModelId="claude-opus-4"
            onSelectModel={() => undefined}
            permissionMode="plan"
            onModeChange={() => undefined}
            rememberedCount={3}
            onResetRemembered={() => undefined}
          />
        </HarnessFrame>
      );
    case "recent-list":
      return (
        <HarnessFrame>
          <section className="mx-auto max-w-[600px]">
            <h1 className="mb-4 text-2xl font-semibold">最近の実行</h1>
            <RecentExecutionList
              executions={recentExecutions}
              onSelectExecution={() => undefined}
            />
          </section>
        </HarnessFrame>
      );
    case "empty-state":
    case "no-search":
    case "with-search":
    case "main-view":
    default:
      bootstrapStoreForScenario(scenario);
      return (
        <HarnessFrame>
          <AgentView />
        </HarnessFrame>
      );
  }
}

ensureElectronAPI();
applyTheme(getTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  renderScenario(getScenario()),
);
