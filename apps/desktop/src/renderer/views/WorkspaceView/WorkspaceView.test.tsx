import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FolderId, FolderPath } from "@/renderer/store/types/workspace";
import { resetWorkspaceLayoutStorage } from "./hooks/useWorkspaceLayout";
import { WorkspaceView } from "./index";

const mockLoadWorkspace = vi.fn();
const mockAddFolder = vi.fn().mockResolvedValue(undefined);
const mockSetWorkspaceSelectedFile = vi.fn();
const mockAddFiles = vi.fn();
const mockRemoveFile = vi.fn();
const mockConversationCreate = vi.fn();
const mockConversationAddMessage = vi.fn();
const mockStreamChat = vi.fn();
const mockCancelStream = vi.fn();
const mockSetCurrentView = vi.fn();
const mockAppState = {
  selectedProviderId: "openai" as const,
  selectedModelId: "gpt-4o",
  setCurrentView: mockSetCurrentView,
};
const mockSelectedFiles: Array<{
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  mimeType: string;
  lastModified: string;
  createdAt: string;
}> = [];
let onStreamChunkListener:
  | ((chunk: { delta?: { content?: string } }) => void)
  | null = null;
let onStreamEndListener: (() => void) | null = null;

const mockStore = {
  workspace: {
    id: "default",
    folders: [
      {
        id: "folder-1" as FolderId,
        path: "/workspace" as FolderPath,
        displayName: "workspace",
        isExpanded: true,
        expandedPaths: new Set<string>(),
        addedAt: new Date(),
      },
    ],
    lastSelectedFileId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      ],
    ],
  ]),
  workspaceLoading: false,
  workspaceError: null,
};

vi.mock("@/renderer/store", () => ({
  useWorkspace: () => mockStore.workspace,
  useFolderFileTrees: () => mockStore.folderFileTrees,
  useWorkspaceLoading: () => mockStore.workspaceLoading,
  useWorkspaceError: () => mockStore.workspaceError,
  useLoadWorkspace: () => mockLoadWorkspace,
  useAddFolder: () => mockAddFolder,
  useSetWorkspaceSelectedFile: () => mockSetWorkspaceSelectedFile,
  useAddFiles: () => mockAddFiles,
  useSelectedFiles: () => mockSelectedFiles,
  useRemoveFile: () => mockRemoveFile,
  useSetCurrentView: () => mockSetCurrentView,
  useAppStore: (selector: (state: typeof mockAppState) => unknown) =>
    selector(mockAppState),
  useLLMProviders: () => [],
  useSelectedProviderId: () => null,
  useSelectedModelId: () => null,
  useLLMHealthStatus: () => "unknown",
  useFetchProviders: () => vi.fn(),
  useSelectProvider: () => vi.fn(),
  useSelectModel: () => vi.fn(),
  useCheckLLMHealth: () => vi.fn(),
}));

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("WorkspaceView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedFiles.length = 0;
    onStreamChunkListener = null;
    onStreamEndListener = null;

    mockConversationCreate.mockResolvedValue({
      success: true,
      data: { id: "conversation-1" },
    });
    mockConversationAddMessage.mockResolvedValue({
      success: true,
      data: { id: "message-1" },
    });
    mockStreamChat.mockResolvedValue({ requestId: "stream-1" });
    mockCancelStream.mockResolvedValue({ success: true });

    resetWorkspaceLayoutStorage();
    setViewportWidth(1280);
    window.electronAPI = {
      ...(window.electronAPI ?? {}),
      file: {
        ...(window.electronAPI?.file ?? {}),
        read: vi.fn().mockResolvedValue({
          success: true,
          data: {
            content: "const app = true;",
            metadata: {
              size: 16,
              lastModified: new Date("2026-03-10T00:00:00.000Z"),
              encoding: "utf-8",
            },
          },
        }),
        watchStart: vi
          .fn()
          .mockResolvedValue({ success: true, watchId: "watch-1" }),
        watchStop: vi.fn().mockResolvedValue({ success: true }),
        onChanged: vi.fn().mockReturnValue(() => {}),
      },
      llm: {
        ...(window.electronAPI?.llm ?? {}),
        streamChat: mockStreamChat,
        cancelStream: mockCancelStream,
        onStreamChunk: vi.fn().mockImplementation((callback) => {
          onStreamChunkListener = callback;
          return () => {
            onStreamChunkListener = null;
          };
        }),
        onStreamEnd: vi.fn().mockImplementation((callback) => {
          onStreamEndListener = callback;
          return () => {
            onStreamEndListener = null;
          };
        }),
        onStreamError: vi.fn().mockImplementation((callback) => {
          return () => {
            void callback;
          };
        }),
      },
    } as typeof window.electronAPI;
    window.conversationAPI = {
      ...(window.conversationAPI ?? {}),
      list: vi.fn(),
      get: vi.fn(),
      create: mockConversationCreate,
      update: vi.fn(),
      delete: vi.fn(),
      addMessage: mockConversationAddMessage,
      search: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期表示は chat-only", () => {
    render(<WorkspaceView />);

    expect(screen.getByTestId("workspace-view")).toBeInTheDocument();
    expect(
      screen.queryByTestId("workspace-file-panel"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-status-layout")).toHaveTextContent(
      "chat-only",
    );
  });

  it("file toggle で file panel を表示する", () => {
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));

    expect(screen.getByTestId("workspace-file-panel")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-status-layout")).toHaveTextContent(
      "chat+files",
    );
  });

  it("mobile では overlay で panel を開く", async () => {
    setViewportWidth(800);
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));

    expect(
      await screen.findByRole("dialog", { name: "ファイル" }),
    ).toBeInTheDocument();
  });

  it("file click で status bar と read を更新する", async () => {
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));

    await waitFor(() => {
      expect(mockSetWorkspaceSelectedFile).toHaveBeenCalled();
    });
    expect(screen.getByRole("status")).toHaveTextContent("/workspace/app.ts");
  });

  it("選択ファイルを背景情報へ追加できる", async () => {
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));

    await screen.findByTestId("workspace-chat-attach-selected");
    fireEvent.click(screen.getByTestId("workspace-chat-attach-selected"));

    await waitFor(() => {
      expect(mockAddFiles).toHaveBeenCalledWith([
        expect.objectContaining({
          path: "/workspace/app.ts",
          name: "app.ts",
          extension: ".ts",
          size: 16,
          mimeType: "text/typescript",
        }),
      ]);
    });
  });

  it("@mention候補を選ぶと背景情報を追加しプレビューを開く", async () => {
    setViewportWidth(1600);
    render(<WorkspaceView />);

    const input = screen.getByTestId("workspace-chat-input");
    fireEvent.change(input, {
      target: { value: "@app", selectionStart: 4 },
    });

    expect(
      await screen.findByTestId("workspace-mention-dropdown"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("app.ts"));

    await waitFor(() => {
      expect(mockAddFiles).toHaveBeenCalledWith([
        expect.objectContaining({
          path: "/workspace/app.ts",
          name: "app.ts",
        }),
      ]);
    });

    expect(
      await screen.findByTestId("workspace-preview-panel"),
    ).toBeInTheDocument();
  });

  it("送信後にストリーミング応答を表示して保存する", async () => {
    render(<WorkspaceView />);

    const input = screen.getByTestId("workspace-chat-input");
    const sendButton = screen.getByTestId("workspace-chat-send");
    fireEvent.change(input, {
      target: { value: "stream test", selectionStart: 11 },
    });
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockConversationCreate).toHaveBeenCalledTimes(1);
      expect(mockConversationAddMessage).toHaveBeenCalledWith({
        sessionId: "conversation-1",
        message: {
          role: "user",
          content: "stream test",
        },
      });
      expect(mockStreamChat).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      onStreamChunkListener?.({
        delta: {
          content: "assistant response",
        },
      });
      onStreamEndListener?.();
    });

    await waitFor(() => {
      expect(screen.getByText("assistant response")).toBeInTheDocument();
      expect(mockConversationAddMessage).toHaveBeenLastCalledWith({
        sessionId: "conversation-1",
        message: {
          role: "assistant",
          content: "assistant response",
          llmProvider: "openai",
          llmModel: "gpt-4o",
        },
      });
    });
  });

  it("context menu から preview を開ける", async () => {
    setViewportWidth(1600);
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.contextMenu(screen.getByTestId("workspace-treeitem-file-1"), {
      clientX: 10,
      clientY: 12,
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "プレビューを開く" }));

    expect(
      await screen.findByTestId("workspace-preview-panel"),
    ).toBeInTheDocument();
  });

  it("file read 失敗時は status bar に error を表示する", async () => {
    vi.useFakeTimers();
    window.electronAPI.file.read = vi.fn().mockResolvedValue({
      success: false,
      error: "Permission denied",
    });

    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));
    fireEvent.click(screen.getByTestId("workspace-toggle-preview"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_100);
    });

    expect(screen.getByTestId("preview-alert")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-status-bar")).toHaveTextContent(
      "Permission denied",
    );
  });

  it("file read timeout 5秒 + 3回再試行後に error を表示する", async () => {
    vi.useFakeTimers();
    const readMock = vi.fn().mockImplementation(() => new Promise(() => {}));
    window.electronAPI.file.read = readMock;

    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));
    fireEvent.click(screen.getByTestId("workspace-toggle-preview"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(17_000);
    });

    expect(readMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByTestId("preview-alert")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-status-bar")).toHaveTextContent(
      "5秒 timeout",
    );
    expect(screen.getByTestId("workspace-status-bar")).toHaveTextContent(
      "3回再試行済み",
    );
  });
});
