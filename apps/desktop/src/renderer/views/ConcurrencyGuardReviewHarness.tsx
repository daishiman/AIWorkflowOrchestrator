import { useEffect } from "react";
import type {
  ImportedSkill,
  SkillMetadata,
  SkillStreamMessage,
} from "@repo/shared";
import { toSkillId, toSkillName, type Skill } from "@repo/shared/types/skill";
import ChatPanel from "../components/chat/ChatPanel";
import { useAppStore } from "../store";
import { AgentExecutionView } from "./AgentExecutionView";
import { AgentView } from "./AgentView";

const DEMO_SKILL = {
  id: toSkillId("demo-skill-id"),
  name: toSkillName("demo-skill"),
  slug: "demo-skill",
  description: "並行実行ガード検証用のデモスキル",
  path: "/mock/demo-skill",
  triggers: ["demo"],
  anchors: [],
  category: "testing",
  allowedTools: ["Read"],
  tags: ["demo"],
  dependencies: [],
  lastModified: new Date("2026-03-09T00:00:00.000Z"),
} satisfies Skill;

const DEMO_SKILL_METADATA = {
  name: DEMO_SKILL.name,
  description: DEMO_SKILL.description,
  path: DEMO_SKILL.path,
  updatedAt: DEMO_SKILL.lastModified,
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
} satisfies SkillMetadata;

const DEMO_IMPORTED_SKILL = {
  ...DEMO_SKILL_METADATA,
  importedAt: new Date("2026-03-09T00:00:00.000Z"),
  status: "active",
  content: "# Demo Skill",
} satisfies ImportedSkill;

const DEMO_STREAMING_MESSAGES = [
  {
    executionId: "exec-review-001",
    timestamp: Date.now(),
    type: "assistant",
    content: {
      text: "並行実行ガードが有効です。",
      isPartial: false,
    },
  },
] satisfies SkillStreamMessage[];

function ensureMockElectronAPI(): void {
  const targetWindow = window as typeof window & {
    electronAPI?: Record<string, any>;
  };
  const electronAPI = targetWindow.electronAPI ?? {};

  (targetWindow as any).electronAPI = {
    ...electronAPI,
    skill: {
      list: async () => [DEMO_SKILL_METADATA],
      getImported: async () => [DEMO_IMPORTED_SKILL],
      rescan: async () => [DEMO_SKILL_METADATA],
      execute: async () => ({
        executionId: "exec-review-001",
        success: true,
      }),
      abort: async () => {},
      sendPermissionResponse: async () => ({ success: true }),
      onStream: () => () => {},
      onComplete: () => () => {},
      onError: () => () => {},
      onPermissionRequest: () => () => {},
    },
    authKey: {
      set: async () => ({ success: true }),
      exists: async () => ({ exists: true }),
      validate: async () => ({ valid: true, message: "ok" }),
      delete: async () => ({ success: true }),
    },
  };
}

function getScenario(): "agent-view" | "agent-execution" | "chat-panel" {
  const scenario = new URLSearchParams(window.location.search).get("scenario");
  if (
    scenario === "agent-view" ||
    scenario === "agent-execution" ||
    scenario === "chat-panel"
  ) {
    return scenario;
  }
  return "agent-view";
}

function ScenarioFrame(props: {
  title: string;
  description: string;
  children: React.ReactNode;
}): JSX.Element {
  const { title, description, children } = props;
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
          Phase 11 Review Harness
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      </header>
      <div className="min-h-[640px] rounded-3xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-lg">
        {children}
      </div>
    </section>
  );
}

export function ConcurrencyGuardReviewHarness(): JSX.Element {
  const scenario = getScenario();

  useEffect(() => {
    ensureMockElectronAPI();

    useAppStore.setState({
      currentView: "agent",
      isAuthenticated: true,
      isLoading: false,
      availableSkillsMetadata: [DEMO_SKILL_METADATA],
      importedSkills: [DEMO_IMPORTED_SKILL],
      importedSkillIds: [DEMO_SKILL.id],
      selectedSkill: DEMO_SKILL,
      selectedSkillName: DEMO_SKILL.name,
      isExecuting: true,
      executionId: "exec-review-001",
      skillExecutionStatus: "running",
      streamingMessages: DEMO_STREAMING_MESSAGES,
      pendingPermission: null,
      skillError: null,
      isLoadingSkills: false,
      isScanning: false,
      isImporting: false,
      importingSkillName: null,
      toastMessage: null,
      isImportDialogOpen: false,
      recentExecutions: [
        {
          executionId: "exec-review-000",
          skillName: DEMO_SKILL.name,
          skillDisplayName: "demo-skill",
          status: "completed",
          startedAt: new Date("2026-03-09T00:00:00.000Z"),
          completedAt: new Date("2026-03-09T00:00:05.000Z"),
          duration: 5000,
        },
      ],
      executionState: {
        status: "executing",
        currentSkill: DEMO_SKILL,
        messages: [
          {
            id: "msg-user-001",
            role: "user",
            content: "並行実行ガードの状態を確認したい",
            timestamp: new Date("2026-03-09T00:00:00.000Z"),
          },
        ],
        currentStreamingContent: "guard active",
        error: null,
        startedAt: new Date("2026-03-09T00:00:00.000Z"),
        completedAt: null,
        pendingPermission: null,
        rememberedChoices: {},
      },
      skills: [DEMO_SKILL],
    });
  }, [scenario]);

  if (scenario === "agent-execution") {
    return (
      <ScenarioFrame
        title="AgentExecutionView 実行中"
        description="入力欄が disabled になり、実行コントロールが実行中状態を示すことを確認する。"
      >
        <div data-testid="concurrency-guard-harness">
          <AgentExecutionView />
        </div>
      </ScenarioFrame>
    );
  }

  if (scenario === "chat-panel") {
    return (
      <ScenarioFrame
        title="ChatPanel 実行中"
        description="スキル管理トグルが disabled になり、SkillStreamingView が表示されることを確認する。"
      >
        <div className="h-[640px]" data-testid="concurrency-guard-harness">
          <ChatPanel />
        </div>
      </ScenarioFrame>
    );
  }

  return (
    <ScenarioFrame
      title="AgentView 実行中"
      description="ExecuteButton が非表示になり、Store 層の isExecuting 状態に追従することを確認する。"
    >
      <div className="h-[720px]" data-testid="concurrency-guard-harness">
        <AgentView />
      </div>
    </ScenarioFrame>
  );
}

export default ConcurrencyGuardReviewHarness;
