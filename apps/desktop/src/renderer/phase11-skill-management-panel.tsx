import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { SkillManagementPanel } from "./components/skill/SkillManagementPanel";
import { useAppStore } from "./store";
import type { AppStore } from "./store";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
import type { SkillCreatorAPI } from "../preload/skill-creator-api";

function getTheme(): "light" | "dark" {
  return new URLSearchParams(window.location.search).get("theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function createImportedSkill(name: string, description: string): ImportedSkill {
  return {
    name: name as ImportedSkill["name"],
    description,
    path: `/skills/${name}`,
    allowedTools: [],
    updatedAt: new Date("2026-03-11T00:00:00+09:00"),
    importedAt: new Date("2026-03-11T00:00:00+09:00"),
    status: "active",
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };
}

function createAnalysis(skillName: string, score: number): SkillAnalysis {
  return {
    skillName,
    overallScore: score,
    categories: [
      {
        name: "prompt",
        score,
        details: "create / execute / improve の導線が整理されています",
        issues: [],
      },
    ],
    suggestions: [
      {
        type: "structure",
        priority: "medium",
        description: "error copy の視認性をさらに上げる余地があります",
        autoFixable: true,
      },
    ],
    risks: [
      {
        category: "maintenance",
        level: "low",
        description: "長文 prompt 時の密度が上がりやすい",
        impact: "視線誘導の難度が上がる",
      },
    ],
  };
}

function ensureElectronAPI(): void {
  const target = window as typeof window & {
    electronAPI?: {
      skillCreator?: SkillCreatorAPI;
    };
  };

  const notUsed = async <T,>(): Promise<{
    success: false;
    error: string;
    data?: T;
  }> => ({
    success: false,
    error: "phase11 harness では未使用です",
  });

  const skillCreator: SkillCreatorAPI = {
    detectMode: async (request: string) => ({
      success: true,
      data: request.includes("改善") ? "improve-prompt" : "create",
    }),
    createSkill: () => notUsed<string>(),
    executeTasks: () => notUsed(),
    validateSkill: async () => ({
      success: true,
      data: true,
    }),
    validateSchema: () => notUsed<boolean>(),
    improveSkill: () => notUsed(),
    forkSkill: () => notUsed<string>(),
    shareSkill: () => notUsed<string>(),
    scheduleSkill: () => notUsed<void>(),
    debugSkill: () => notUsed(),
    generateDocs: () => notUsed<string>(),
    getStats: () => notUsed(),
    onProgress: () => () => {},
  };

  target.electronAPI = {
    ...(target.electronAPI ?? {}),
    skillCreator,
  };
}

function bootstrapStore(): void {
  const importedSkills = [createImportedSkill("skill-alpha", "既存スキル")];
  const availableSkillsMetadata: SkillMetadata[] = [];

  const fetchSkills = async (): Promise<void> => {
    useAppStore.setState({
      importedSkills,
      availableSkillsMetadata,
      isLoadingSkills: false,
      skillError: null,
    });
  };

  const createSkill = async (
    _description: string,
    _options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ): Promise<string> => {
    const newSkill = createImportedSkill(
      "new-skill",
      "Issue を整理して task 仕様書を生成するスキル",
    );
    useAppStore.setState({
      importedSkills: [...importedSkills, newSkill],
      selectedSkillName: newSkill.name,
      skillError: null,
    });
    return "/skills/new-skill";
  };

  const executeSkill = async (_prompt: string): Promise<void> => {
    useAppStore.setState({
      isExecuting: false,
      skillExecutionStatus: "completed",
      streamingMessages: [
        {
          executionId: "phase11-exec",
          timestamp: Date.now(),
          type: "status",
          content: {
            status: "completed",
            detail: "実行が完了しました",
          },
        },
      ],
      executionId: "phase11-exec",
      skillError: null,
    });
  };

  const analyzeSkill = async (skillName: string): Promise<void> => {
    useAppStore.setState({
      currentAnalysis: createAnalysis(skillName, 88),
      isAnalyzing: false,
      skillError: null,
    });
  };

  const autoImproveSkill = async (skillName: string): Promise<void> => {
    useAppStore.setState({
      currentAnalysis: createAnalysis(skillName, 92),
      isImproving: false,
      skillError: null,
    });
  };

  const initialState: Partial<AppStore> = {
    importedSkills,
    availableSkillsMetadata,
    selectedSkillName: null,
    isLoadingSkills: false,
    isImporting: false,
    importingSkillName: null,
    isExecuting: false,
    skillExecutionStatus: null,
    streamingMessages: [],
    currentAnalysis: null,
    isAnalyzing: false,
    isImproving: false,
    skillError: null,
    fetchSkills,
    removeSkill: async () => {},
    clearSkillError: () => {
      useAppStore.setState({ skillError: null });
    },
    createSkill,
    selectSkillByName: (skillName) => {
      useAppStore.setState({ selectedSkillName: skillName });
    },
    executeSkill,
    analyzeSkill,
    autoImproveSkill,
  };

  useAppStore.setState(initialState);
}

function HarnessFrame({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      data-testid="phase11-skill-management-harness"
      className="min-h-screen bg-[var(--bg-primary)] px-8 py-10 text-[var(--text-primary)]"
    >
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <HarnessFrame>
      <SkillManagementPanel />
    </HarnessFrame>
  );
}

applyTheme(getTheme());
ensureElectronAPI();
bootstrapStore();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
