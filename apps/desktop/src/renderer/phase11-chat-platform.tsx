import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "./styles/globals.css";
import { ChatView } from "./views/ChatView";
import { WorkspaceView } from "./views/WorkspaceView";
import { SkillLifecyclePanel } from "./components/skill/SkillLifecyclePanel";
import { useAppStore } from "./store";
import type { AppStore } from "./store";
import type { FolderId, FolderPath } from "./store/types/workspace";
import {
  createChatReviveSnapshot,
  createWorkspaceContextAttachments,
} from "./features/chat-platform/contracts";
import { createSelectedFile } from "./views/WorkspaceView/workspaceFileSelection";
import { createSkillLifecycleChatHandoff } from "./navigation/skillLifecycleJourney";
import { createEmptyChatStreamOverlayState } from "@repo/shared/types";
import type { Conversation, Message } from "../shared/types/conversation";

type HarnessScenario =
  | "general"
  | "workspace-handoff"
  | "skill-lifecycle"
  | "revive"
  | "stream-cancel";

function getScenario(): HarnessScenario {
  const raw = new URLSearchParams(window.location.search).get("scenario");
  switch (raw) {
    case "workspace-handoff":
    case "skill-lifecycle":
    case "revive":
    case "stream-cancel":
    case "general":
      return raw;
    default:
      return "general";
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

function ensureChatPlatformApis(): void {
  window.electronAPI = {
    ...(window.electronAPI ?? {}),
    ai: {
      ...(window.electronAPI?.ai ?? {}),
      chat: async () => ({
        success: true,
        data: {
          message: "phase11 harness response",
          conversationId: "phase11-general-conversation",
        },
      }),
      checkConnection: async () => ({
        success: true,
        data: {
          status: "connected",
          indexedDocuments: 24,
        },
      }),
      index: async () => ({
        success: true,
        data: {
          indexedCount: 0,
          skippedCount: 0,
          errors: [],
        },
      }),
    },
    file: {
      ...(window.electronAPI?.file ?? {}),
      read: async ({ filePath }: { filePath: string }) => ({
        success: true,
        data: {
          content: `// ${filePath}\nexport const phase11 = true;`,
          metadata: {
            size: 64,
            lastModified: new Date("2026-03-12T00:00:00.000Z"),
            encoding: "utf-8",
          },
        },
      }),
      watchStart: async () => ({ success: true, watchId: "phase11-watch" }),
      watchStop: async () => undefined,
      onChanged: () => () => undefined,
    },
    llm: {
      ...(window.electronAPI?.llm ?? {}),
      streamChat: async () => ({
        requestId: "phase11-stream-request",
      }),
      cancelStream: async () => ({ success: true }),
      onStreamChunk: () => () => undefined,
      onStreamEnd: () => () => undefined,
      onStreamError: () => () => undefined,
    },
    skillCreator: {
      detectMode: async () => ({
        success: true,
        data: "collaborative",
      }),
      improveSkill: async () => ({
        success: true,
        data: {
          suggestions: [
            {
              category: "handoff",
              description: "Chat platform contract へ寄せる",
              severity: "medium",
              autoFixable: false,
            },
          ],
          applied: false,
        },
      }),
    },
  } as unknown as typeof window.electronAPI;

  const baseConversation: Conversation = {
    id: "phase11-conversation",
    userId: "phase11-user",
    title: "Phase11 Chat Platform",
    createdAt: "2026-03-12T00:00:00.000Z",
    updatedAt: "2026-03-12T00:00:00.000Z",
    messageCount: 2,
    isFavorite: false,
    isPinned: false,
    pinOrder: null,
    lastMessagePreview: "phase11 harness response",
    metadata: {},
    messages: [],
  };

  const assistantMessage: Message = {
    id: "phase11-message",
    sessionId: baseConversation.id,
    role: "assistant",
    content: "phase11 harness response",
    messageIndex: 1,
    timestamp: "2026-03-12T00:00:05.000Z",
    attachments: [],
    metadata: {},
  };

  window.conversationAPI = {
    ...(window.conversationAPI ?? {}),
    list: async () => ({ success: true, data: [] }),
    get: async () => ({
      success: true,
      data: {
        ...baseConversation,
        messages: [assistantMessage],
      },
    }),
    create: async () => ({
      success: true,
      data: baseConversation,
    }),
    update: async () => ({
      success: true,
      data: baseConversation,
    }),
    delete: async () => ({
      success: true,
      data: { deleted: true },
    }),
    addMessage: async () => ({
      success: true,
      data: assistantMessage,
    }),
    search: async () => ({ success: true, data: [] }),
  };
}

function resetHarnessStorage(): void {
  window.localStorage.removeItem("workspace-layout-mode");
  window.localStorage.removeItem("workspace-panel-sizes");
}

function bootstrapGeneralState(): void {
  useAppStore.setState({
    chatMessages: [
      {
        id: "general-user",
        role: "user",
        content: "workspace と general の違いを教えて",
        timestamp: new Date("2026-03-12T00:00:00.000Z"),
        isStreaming: false,
      },
      {
        id: "general-assistant",
        role: "assistant",
        content:
          "general は追加文脈なし、workspace は選択ファイルの背景情報付きで会話します。",
        timestamp: new Date("2026-03-12T00:00:05.000Z"),
        isStreaming: false,
      },
    ],
    chatInput: "",
    isSending: false,
    ragConnectionStatus: "connected",
    isSystemPromptPanelExpanded: false,
    systemPrompt: "",
    templates: [],
    selectedTemplateId: null,
    isSaveTemplateDialogOpen: false,
    initializeTemplates: async () => undefined,
    saveTemplate: async () => undefined,
    deleteTemplate: async () => undefined,
    openSaveTemplateDialog: () => undefined,
    closeSaveTemplateDialog: () => undefined,
  } as unknown as Partial<AppStore>);
}

function bootstrapWorkspaceState(): void {
  resetHarnessStorage();
  window.localStorage.setItem("workspace-layout-mode", "chat+files");
  window.localStorage.setItem(
    "workspace-panel-sizes",
    JSON.stringify({
      filePanelWidth: 280,
      previewPanelWidth: 360,
    }),
  );

  const selectedFile = createSelectedFile({
    filePath: "/workspace/app.ts",
    size: 128,
    lastModified: new Date("2026-03-12T00:00:00.000Z"),
  });

  useAppStore.setState({
    workspace: {
      id: "default",
      folders: [
        {
          id: "folder-1" as FolderId,
          path: "/workspace" as FolderPath,
          displayName: "workspace",
          isExpanded: true,
          expandedPaths: new Set<string>(),
          addedAt: new Date("2026-03-12T00:00:00.000Z"),
        },
      ],
      lastSelectedFileId: null,
      createdAt: new Date("2026-03-12T00:00:00.000Z"),
      updatedAt: new Date("2026-03-12T00:00:00.000Z"),
    },
    folderFileTrees: new Map([
      [
        "folder-1" as FolderId,
        [
          {
            id: "file-1",
            name: "app.ts",
            type: "file",
            path: "/workspace/app.ts",
          },
          {
            id: "file-2",
            name: "chat.ts",
            type: "file",
            path: "/workspace/chat.ts",
          },
        ],
      ],
    ]),
    workspaceIsLoading: false,
    workspaceError: null,
    selectedFiles: [selectedFile],
    selectedProviderId: "anthropic",
    selectedModelId: "claude-opus-4",
    loadWorkspace: async () => undefined,
    addFolder: async () => undefined,
    setWorkspaceSelectedFile: () => undefined,
    addFiles: () => undefined,
    removeFile: () => undefined,
    setCurrentView: () => undefined,
  } as unknown as Partial<AppStore>);
}

function bootstrapSkillLifecycleState(): void {
  useAppStore.setState({
    selectedSkillName: "chat-platform-demo-skill",
    isExecuting: false,
    streamingMessages: [],
    skillExecutionStatus: null,
    skillError: null,
    createSkill: async () => "/skills/chat-platform-demo-skill",
    executeSkill: async () => undefined,
    selectSkillByName: () => undefined,
    clearSkillError: () => undefined,
    clearStreamingMessages: () => undefined,
  } as unknown as Partial<AppStore>);
}

function bootstrapScenario(scenario: HarnessScenario): void {
  ensureChatPlatformApis();

  switch (scenario) {
    case "workspace-handoff":
      bootstrapWorkspaceState();
      break;
    case "skill-lifecycle":
      bootstrapSkillLifecycleState();
      break;
    case "revive":
    case "stream-cancel":
      bootstrapGeneralState();
      bootstrapWorkspaceState();
      bootstrapSkillLifecycleState();
      break;
    case "general":
    default:
      bootstrapGeneralState();
      break;
  }
}

function HarnessFrame({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] px-6 py-8 text-[var(--text-primary)]"
      data-testid="phase11-chat-platform-harness"
    >
      <div className="mx-auto max-w-[1440px] rounded-[32px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function EvidenceCard({
  title,
  eyebrow,
  items,
  testId,
}: {
  title: string;
  eyebrow: string;
  items: Array<{ label: string; value: string }>;
  testId: string;
}): JSX.Element {
  return (
    <section
      className="rounded-[28px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6 shadow-sm"
      data-testid={testId}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--status-primary)]">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
        {title}
      </h1>
      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={`${title}-${item.label}`}
            className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4"
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {item.label}
            </dt>
            <dd className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function renderScenario(scenario: HarnessScenario): JSX.Element {
  switch (scenario) {
    case "workspace-handoff":
      return (
        <HarnessFrame>
          <WorkspaceView />
        </HarnessFrame>
      );
    case "skill-lifecycle":
      return (
        <HarnessFrame>
          <SkillLifecyclePanel
            onClose={() => undefined}
            onOpenWizard={() => undefined}
            initialRequest="workspace で集めた文脈を使ってレビュー補助スキルを作り、そのまま実行したい"
          />
        </HarnessFrame>
      );
    case "revive": {
      const attachments = createWorkspaceContextAttachments([
        createSelectedFile({
          filePath: "/workspace/app.ts",
          size: 128,
          lastModified: new Date("2026-03-12T00:00:00.000Z"),
        }),
      ]);
      const snapshot = createChatReviveSnapshot({
        mode: "workspace",
        conversationId: "phase11-conversation",
        request: "app.ts の責務を整理して",
        attachments,
        metadata: {
          recentRail: ["phase11-conversation", "phase11-other-conversation"],
        },
      });

      return (
        <HarnessFrame>
          <EvidenceCard
            testId="phase11-revive-evidence"
            eyebrow="Revive Boundary"
            title="recent session / active session は復元し、streaming overlay は復元しない"
            items={[
              {
                label: "mode",
                value: snapshot.mode,
              },
              {
                label: "conversationId",
                value: snapshot.conversationId ?? "-",
              },
              {
                label: "title",
                value: snapshot.title,
              },
              {
                label: "attachments",
                value: snapshot.summary,
              },
              {
                label: "recent rail",
                value: String(snapshot.metadata.recentRail),
              },
              {
                label: "non-persist",
                value:
                  "currentStreamId / streamingMessageId / streamingContent / streamingError は revive 対象外",
              },
            ]}
          />
        </HarnessFrame>
      );
    }
    case "stream-cancel": {
      const afterCancel = createEmptyChatStreamOverlayState();

      return (
        <HarnessFrame>
          <EvidenceCard
            testId="phase11-stream-cancel-evidence"
            eyebrow="Streaming Reset"
            title="cancel / end 後に非永続 overlay を空に戻す"
            items={[
              {
                label: "isStreaming",
                value: String(afterCancel.isStreaming),
              },
              {
                label: "currentStreamId",
                value: String(afterCancel.currentStreamId),
              },
              {
                label: "streamingMessageId",
                value: String(afterCancel.streamingMessageId),
              },
              {
                label: "streamingContent",
                value: JSON.stringify(afterCancel.streamingContent),
              },
              {
                label: "streamingError",
                value: String(afterCancel.streamingError),
              },
              {
                label: "note",
                value:
                  "workspace / general どちらでも revive されるのは session metadata のみ",
              },
            ]}
          />
        </HarnessFrame>
      );
    }
    case "general":
    default:
      return (
        <HarnessFrame>
          <ChatView />
        </HarnessFrame>
      );
  }
}

const scenario = getScenario();
applyTheme(getTheme());
bootstrapScenario(scenario);

const lifecycleHandoff = createSkillLifecycleChatHandoff({
  request: "作成したスキルをすぐ実行して改善点も見たい",
  sourceSurface: "task03",
  skillName: "chat-platform-demo-skill",
  createdSkillPath: "/skills/chat-platform-demo-skill",
});

if (scenario === "skill-lifecycle") {
  useAppStore.setState({
    selectedSkillName: lifecycleHandoff.attachments[0]?.label ?? null,
  } as Partial<AppStore>);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MemoryRouter>{renderScenario(scenario)}</MemoryRouter>
  </React.StrictMode>,
);
