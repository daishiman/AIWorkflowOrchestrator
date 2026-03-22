import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";
import { invokeWithTimeout } from "./ipc-utils";
import type {
  ElectronAPI,
  GetFileTreeRequest,
  ReadFileRequest,
  WriteFileRequest,
  RenameFileRequest,
  WatchStartRequest,
  StoreGetRequest,
  StoreSetRequest,
  StoreGetSecureRequest,
  StoreSetSecureRequest,
  AIChatRequest,
  AIIndexRequest,
  DashboardGetActivityRequest,
  FileChangedEvent,
  WindowResizedEvent,
  MenuActionEvent,
  ThemeSetRequest,
  ThemeSystemChangedEvent,
  AuthLoginRequest,
  ProfileUpdateRequest,
  ProfileLinkProviderRequest,
  ProfileUnlinkProviderRequest,
  AvatarUseProviderRequest,
  AuthState,
  ApiKeySaveRequest,
  ApiKeyDeleteRequest,
  ApiKeyValidateRequest,
  WorkspaceSaveRequest,
  WorkspaceRemoveFolderRequest,
  WorkspaceValidatePathsRequest,
  WorkspaceFolderChangedEvent,
  SearchFileRequest,
  SearchWorkspaceRequest,
  NotificationGetHistoryRequest,
  NotificationMarkReadRequest,
  NotificationDeleteRequest,
  NotificationClearRequest,
  NotificationNewEvent,
  HistorySearchRequest,
  ReplaceFileSingleRequest,
  ReplaceFileAllRequest,
  ReplaceWorkspaceAllRequest,
  ReplaceUndoRequest,
  ReplaceRedoRequest,
} from "./types";
import type {
  OpenFileDialogRequest,
  GetFileMetadataRequest,
  GetMultipleFileMetadataRequest,
  ValidateFilePathRequest,
} from "@repo/shared/schemas";
import type {
  AuthModeChangedEvent,
  AuthModeSetRequest,
  AuthModeValidateRequest,
} from "./types";
import type {
  LLMProviderId,
  LLMChatRequest,
  LLMError,
} from "@repo/shared/types/llm/schemas";
import type {
  SkillPhase,
  SyncStatus,
  SlideApi,
  LLMStreamChunk,
  AgentExecutionAPI,
  AgentStartRequest,
  AgentStreamPayload,
  AgentStatusPayload,
  AgentPermissionRequest,
  AgentPermissionResponse,
  AgentSDKAPI,
  AgentSDKStatus,
  AgentSDKCreateSessionResponse,
  AgentSDKResumeSessionRequest,
  AgentSDKDestroySessionRequest,
  AgentSDKQueryRequest,
  AgentSDKMessage,
} from "./types";
import type {
  HistoryAPI,
  PaginationOptions,
  LogFilterOptions,
} from "../renderer/components/history/types";
import type {
  CommunityAPI,
  CommunityId,
  SlideSettingsAPI,
  ClaudeCliAPI,
  ClaudeCliSessionOutputEvent,
  ClaudeCliSessionStatusEvent,
  ClaudeCliListSkillsRequest,
  ClaudeCliGetSkillDetailRequest,
  ClaudeCliExecuteScriptRequest,
  ClaudeCliTerminateSessionRequest,
  ClaudeCliGetSessionRequest,
  SystemPromptAPI,
  SystemPromptListRequest,
  SystemPromptGetRequest,
  SystemPromptCreateRequest,
  SystemPromptUpdateRequest,
  SystemPromptDeleteRequest,
} from "./types";

// Type-safe invoke wrapper with timeout
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}

// Type-safe on wrapper with cleanup
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  // Return cleanup function
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

// Expose electronAPI to renderer
const electronAPI: ElectronAPI = {
  file: {
    getTree: (request: GetFileTreeRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_GET_TREE, request),
    read: (request: ReadFileRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_READ, request),
    write: (request: WriteFileRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_WRITE, request),
    rename: (request: RenameFileRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_RENAME, request),
    watchStart: (request: WatchStartRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_WATCH_START, request),
    watchStop: (watchId: string) =>
      safeInvoke(IPC_CHANNELS.FILE_WATCH_STOP, watchId),
    onChanged: (callback: (event: FileChangedEvent) => void) =>
      safeOn<FileChangedEvent>(IPC_CHANNELS.FILE_CHANGED, callback),
  },

  store: {
    get: (request: StoreGetRequest) =>
      safeInvoke(IPC_CHANNELS.STORE_GET, request),
    set: (request: StoreSetRequest) =>
      safeInvoke(IPC_CHANNELS.STORE_SET, request),
    getSecure: (request: StoreGetSecureRequest) =>
      safeInvoke(IPC_CHANNELS.STORE_GET_SECURE, request),
    setSecure: (request: StoreSetSecureRequest) =>
      safeInvoke(IPC_CHANNELS.STORE_SET_SECURE, request),
  },

  ai: {
    chat: (request: AIChatRequest) => safeInvoke(IPC_CHANNELS.AI_CHAT, request),
    checkConnection: () => safeInvoke(IPC_CHANNELS.AI_CHECK_CONNECTION),
    index: (request: AIIndexRequest) =>
      safeInvoke(IPC_CHANNELS.AI_INDEX, request),
  },

  graph: {
    get: () => safeInvoke(IPC_CHANNELS.GRAPH_GET),
    refresh: () => safeInvoke(IPC_CHANNELS.GRAPH_REFRESH),
  },

  dashboard: {
    getStats: () => safeInvoke(IPC_CHANNELS.DASHBOARD_GET_STATS),
    getActivity: (request: DashboardGetActivityRequest) =>
      safeInvoke(IPC_CHANNELS.DASHBOARD_GET_ACTIVITY, request),
  },

  window: {
    getState: () => safeInvoke(IPC_CHANNELS.WINDOW_GET_STATE),
    onResized: (callback: (event: WindowResizedEvent) => void) =>
      safeOn<WindowResizedEvent>(IPC_CHANNELS.WINDOW_RESIZED, callback),
  },

  app: {
    getVersion: () => safeInvoke(IPC_CHANNELS.APP_GET_VERSION),
    onMenuAction: (callback: (event: MenuActionEvent) => void) =>
      safeOn<MenuActionEvent>(IPC_CHANNELS.APP_MENU_ACTION, callback),
  },

  terminal: {
    open: (request) => safeInvoke(IPC_CHANNELS.TERMINAL_OPEN, request),
  },

  theme: {
    get: () => safeInvoke(IPC_CHANNELS.THEME_GET),
    set: (request: ThemeSetRequest) =>
      safeInvoke(IPC_CHANNELS.THEME_SET, request),
    getSystem: () => safeInvoke(IPC_CHANNELS.THEME_GET_SYSTEM),
    onSystemChanged: (callback: (event: ThemeSystemChangedEvent) => void) =>
      safeOn<ThemeSystemChangedEvent>(
        IPC_CHANNELS.THEME_SYSTEM_CHANGED,
        callback,
      ),
  },

  auth: {
    login: (request: AuthLoginRequest) =>
      safeInvoke(IPC_CHANNELS.AUTH_LOGIN, request),
    logout: () => safeInvoke(IPC_CHANNELS.AUTH_LOGOUT),
    getSession: () => safeInvoke(IPC_CHANNELS.AUTH_GET_SESSION),
    refresh: () => safeInvoke(IPC_CHANNELS.AUTH_REFRESH),
    checkOnline: () => safeInvoke(IPC_CHANNELS.AUTH_CHECK_ONLINE),
    onAuthStateChanged: (callback: (state: AuthState) => void) =>
      safeOn<AuthState>(IPC_CHANNELS.AUTH_STATE_CHANGED, callback),
  },

  // Auth Mode API (TASK-AUTH-MODE-SELECTION-001)
  authMode: {
    get: () => safeInvoke(IPC_CHANNELS.AUTH_MODE_GET),
    set: (request: AuthModeSetRequest) =>
      safeInvoke(IPC_CHANNELS.AUTH_MODE_SET, request),
    status: () => safeInvoke(IPC_CHANNELS.AUTH_MODE_STATUS),
    validate: (request?: AuthModeValidateRequest) =>
      safeInvoke(IPC_CHANNELS.AUTH_MODE_VALIDATE, request),
    onModeChanged: (callback: (event: AuthModeChangedEvent) => void) =>
      safeOn<AuthModeChangedEvent>(IPC_CHANNELS.AUTH_MODE_CHANGED, callback),
  },

  profile: {
    get: () => safeInvoke(IPC_CHANNELS.PROFILE_GET),
    update: (request: ProfileUpdateRequest) =>
      safeInvoke(IPC_CHANNELS.PROFILE_UPDATE, request),
    delete: (request: { confirmEmail: string }) =>
      safeInvoke(IPC_CHANNELS.PROFILE_DELETE, request),
    getProviders: () => safeInvoke(IPC_CHANNELS.PROFILE_GET_PROVIDERS),
    linkProvider: (request: ProfileLinkProviderRequest) =>
      safeInvoke(IPC_CHANNELS.PROFILE_LINK_PROVIDER, request),
    unlinkProvider: (request: ProfileUnlinkProviderRequest) =>
      safeInvoke(IPC_CHANNELS.PROFILE_UNLINK_PROVIDER, request),
  },

  avatar: {
    upload: () => safeInvoke(IPC_CHANNELS.AVATAR_UPLOAD),
    useProvider: (request: AvatarUseProviderRequest) =>
      safeInvoke(IPC_CHANNELS.AVATAR_USE_PROVIDER, request),
    remove: () => safeInvoke(IPC_CHANNELS.AVATAR_REMOVE),
  },

  apiKey: {
    save: (request: ApiKeySaveRequest) =>
      safeInvoke(IPC_CHANNELS.API_KEY_SAVE, request),
    delete: (request: ApiKeyDeleteRequest) =>
      safeInvoke(IPC_CHANNELS.API_KEY_DELETE, request),
    validate: (request: ApiKeyValidateRequest) =>
      safeInvoke(IPC_CHANNELS.API_KEY_VALIDATE, request),
    list: () => safeInvoke(IPC_CHANNELS.API_KEY_LIST),
  },

  // Auth Key API (TASK-FIX-16-1)
  authKey: {
    set: (key: string) => safeInvoke(IPC_CHANNELS.AUTH_KEY_SET, { key }),
    exists: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_EXISTS),
    validate: (key: string) =>
      safeInvoke(IPC_CHANNELS.AUTH_KEY_VALIDATE, { key }),
    delete: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_DELETE),
  },

  workspace: {
    load: () => safeInvoke(IPC_CHANNELS.WORKSPACE_LOAD),
    save: (request: WorkspaceSaveRequest) =>
      safeInvoke(IPC_CHANNELS.WORKSPACE_SAVE, request),
    addFolder: () => safeInvoke(IPC_CHANNELS.WORKSPACE_ADD_FOLDER),
    removeFolder: (request: WorkspaceRemoveFolderRequest) =>
      safeInvoke(IPC_CHANNELS.WORKSPACE_REMOVE_FOLDER, request),
    validatePaths: (request: WorkspaceValidatePathsRequest) =>
      safeInvoke(IPC_CHANNELS.WORKSPACE_VALIDATE_PATHS, request),
    onFolderChanged: (callback: (event: WorkspaceFolderChangedEvent) => void) =>
      safeOn<WorkspaceFolderChangedEvent>(
        IPC_CHANNELS.WORKSPACE_FOLDER_CHANGED,
        callback,
      ),
  },

  search: {
    executeFile: (request: SearchFileRequest) =>
      safeInvoke(IPC_CHANNELS.SEARCH_FILE_EXECUTE, request),
    executeWorkspace: (request: SearchWorkspaceRequest) =>
      safeInvoke(IPC_CHANNELS.SEARCH_WORKSPACE_EXECUTE, request),
  },

  notification: {
    getHistory: (request?: NotificationGetHistoryRequest) =>
      safeInvoke(IPC_CHANNELS.NOTIFICATION_GET_HISTORY, request ?? {}),
    markRead: (request: NotificationMarkReadRequest) =>
      safeInvoke(IPC_CHANNELS.NOTIFICATION_MARK_READ, request),
    markAllRead: () => safeInvoke(IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ),
    delete: (request: NotificationDeleteRequest) =>
      safeInvoke(IPC_CHANNELS.NOTIFICATION_DELETE, request),
    clear: (request?: NotificationClearRequest) =>
      safeInvoke(IPC_CHANNELS.NOTIFICATION_CLEAR, request ?? {}),
    onNew: (callback: (event: NotificationNewEvent) => void) =>
      safeOn<NotificationNewEvent>(IPC_CHANNELS.NOTIFICATION_NEW, callback),
  },

  historySearch: {
    search: (request: HistorySearchRequest) =>
      safeInvoke(IPC_CHANNELS.HISTORY_SEARCH, request),
    getStats: () => safeInvoke(IPC_CHANNELS.HISTORY_GET_STATS),
  },

  replace: {
    fileSingle: (request: ReplaceFileSingleRequest) =>
      safeInvoke(IPC_CHANNELS.REPLACE_FILE_SINGLE, request),
    fileAll: (request: ReplaceFileAllRequest) =>
      safeInvoke(IPC_CHANNELS.REPLACE_FILE_ALL, request),
    workspaceAll: (request: ReplaceWorkspaceAllRequest) =>
      safeInvoke(IPC_CHANNELS.REPLACE_WORKSPACE_ALL, request),
    undo: (request: ReplaceUndoRequest) =>
      safeInvoke(IPC_CHANNELS.REPLACE_UNDO, request),
    redo: (request: ReplaceRedoRequest) =>
      safeInvoke(IPC_CHANNELS.REPLACE_REDO, request),
  },

  fileSelection: {
    openDialog: (request: OpenFileDialogRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG, request),
    getMetadata: (request: GetFileMetadataRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_GET_METADATA, request),
    getMultipleMetadata: (request: GetMultipleFileMetadataRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA, request),
    validatePath: (request: ValidateFilePathRequest) =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH, request),
  },

  llm: {
    getProviders: () => safeInvoke(IPC_CHANNELS.LLM_GET_PROVIDERS),
    setSelectedConfig: (request: {
      providerId: LLMProviderId;
      modelId: string;
    }) => safeInvoke(IPC_CHANNELS.LLM_SET_SELECTED_CONFIG, request),
    checkHealth: (providerId: LLMProviderId) =>
      safeInvoke(IPC_CHANNELS.LLM_CHECK_HEALTH, { providerId }),
    sendChat: (request: LLMChatRequest) =>
      safeInvoke(IPC_CHANNELS.LLM_SEND_CHAT, request),
    streamChat: (request: LLMChatRequest) =>
      safeInvoke<{ requestId: string }>(IPC_CHANNELS.LLM_STREAM_CHAT, request),
    cancelStream: (requestId: string) =>
      safeInvoke<{ success: boolean }>(IPC_CHANNELS.LLM_STREAM_CANCEL, {
        requestId,
      }),
    onStreamChunk: (callback: (chunk: LLMStreamChunk) => void) =>
      safeOn<LLMStreamChunk>(IPC_CHANNELS.LLM_STREAM_CHUNK, callback),
    onStreamEnd: (callback: () => void) =>
      safeOn(IPC_CHANNELS.LLM_STREAM_END, callback),
    onStreamError: (callback: (error: LLMError) => void) =>
      safeOn<LLMError>(IPC_CHANNELS.LLM_STREAM_ERROR, callback),
  },

  // Generic invoke for IPC calls
  invoke: <T>(channel: string, payload?: unknown): Promise<T> =>
    safeInvoke<T>(channel, payload),

  // Dialog APIs
  dialog: {
    showOpenDialog: (options: {
      title?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      properties?: string[];
    }) => safeInvoke("dialog:showOpenDialog", options),
    showSaveDialog: (options: {
      title?: string;
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => safeInvoke("dialog:showSaveDialog", options),
  },

  // Community APIs
  community: {
    getAll: () => safeInvoke(IPC_CHANNELS.COMMUNITY_GET_ALL),
    getByLevel: (level: number) =>
      safeInvoke(IPC_CHANNELS.COMMUNITY_GET_BY_LEVEL, level),
    getById: (id: CommunityId) =>
      safeInvoke(IPC_CHANNELS.COMMUNITY_GET_BY_ID, id),
    getMembers: (id: CommunityId) =>
      safeInvoke(IPC_CHANNELS.COMMUNITY_GET_MEMBERS, id),
    getSummary: (id: CommunityId) =>
      safeInvoke(IPC_CHANNELS.COMMUNITY_GET_SUMMARY, id),
    search: (query: string) => safeInvoke(IPC_CHANNELS.COMMUNITY_SEARCH, query),
  } as CommunityAPI,

  // Skill API (TASK-6-1)
  skill: skillAPI,

  // Skill Creator API (TASK-9B-H)
  skillCreator: skillCreatorAPI,
};

// Slide API for slide dependency management
const slideApi: SlideApi = {
  executePhase: (phase: SkillPhase, projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE_EXECUTE_PHASE, phase, projectPath),
  watchStart: (projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE_WATCH_START, projectPath),
  watchStop: () => safeInvoke(IPC_CHANNELS.SLIDE_WATCH_STOP),
  syncStatus: (projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE_SYNC_STATUS, projectPath),
  reverseSync: (projectPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE_REVERSE_SYNC, projectPath),
  cancel: () => safeInvoke(IPC_CHANNELS.SLIDE_CANCEL),
  onStructureChange: (callback: (path: string) => void) =>
    safeOn<string>(IPC_CHANNELS.SLIDE_STRUCTURE_CHANGED, callback),
  onSyncStatusChanged: (callback: (status: SyncStatus) => void) =>
    safeOn<SyncStatus>(IPC_CHANNELS.SLIDE_SYNC_STATUS_CHANGED, callback),
  onExecutionProgress: (callback: (progress: number) => void) =>
    safeOn<number>(IPC_CHANNELS.SLIDE_EXECUTION_PROGRESS, callback),
  onSyncProgress: (callback: (progress: number) => void) =>
    safeOn<number>(IPC_CHANNELS.SLIDE_SYNC_PROGRESS, callback),
  onSyncError: (callback: (error: string) => void) =>
    safeOn<string>(IPC_CHANNELS.SLIDE_SYNC_ERROR, callback),
  onWatchStatus: (callback: (status: string) => void) =>
    safeOn<string>(IPC_CHANNELS.SLIDE_WATCH_STATUS, callback),
};

// History API for version history management
const historyAPI: HistoryAPI = {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_FILE_HISTORY, fileId, options),
  getVersionDetail: (conversionId: string) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL, conversionId),
  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS, conversionId, options),
  restoreVersion: (fileId: string, conversionId: string) =>
    safeInvoke(IPC_CHANNELS.HISTORY_RESTORE_VERSION, fileId, conversionId),
};

// Agent Execution API for agent execution UI
const agentAPI: AgentExecutionAPI = {
  start: (request: AgentStartRequest) =>
    safeInvoke(IPC_CHANNELS.AGENT_EXECUTION_START, request),
  stop: () => safeInvoke(IPC_CHANNELS.AGENT_EXECUTION_STOP_ALL),
  respondPermission: (response: AgentPermissionResponse) =>
    safeInvoke(IPC_CHANNELS.AGENT_EXECUTION_PERMISSION_RES, response),
  onStream: (callback: (payload: AgentStreamPayload) => void) =>
    safeOn<AgentStreamPayload>(IPC_CHANNELS.AGENT_EXECUTION_STREAM, callback),
  onStatus: (callback: (payload: AgentStatusPayload) => void) =>
    safeOn<AgentStatusPayload>(IPC_CHANNELS.AGENT_EXECUTION_STATUS, callback),
  onPermission: (callback: (request: AgentPermissionRequest) => void) =>
    safeOn<AgentPermissionRequest>(
      IPC_CHANNELS.AGENT_EXECUTION_PERMISSION,
      callback,
    ),
};

// Agent SDK API for E2E testing page
const agentSDKOptions: { timeout: number } = { timeout: 30000 };
let _currentSessionId: string | null = null;

const agentSDKAPI: AgentSDKAPI = {
  getStatus: () => safeInvoke<AgentSDKStatus>(IPC_CHANNELS.AGENT_GET_STATUS),
  createSession: () =>
    safeInvoke<AgentSDKCreateSessionResponse>(
      IPC_CHANNELS.AGENT_CREATE_SESSION,
    ),
  resumeSession: (request: AgentSDKResumeSessionRequest) =>
    safeInvoke(IPC_CHANNELS.AGENT_RESUME_SESSION, request),
  destroySession: (request: AgentSDKDestroySessionRequest) =>
    safeInvoke(IPC_CHANNELS.AGENT_DESTROY_SESSION, request),
  query: (request: AgentSDKQueryRequest) =>
    safeInvoke(IPC_CHANNELS.AGENT_QUERY, {
      ...request,
      options: { ...request.options, timeout: agentSDKOptions.timeout },
    }),
  abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
  onMessage: (callback: (message: AgentSDKMessage) => void) =>
    safeOn<AgentSDKMessage>(IPC_CHANNELS.AGENT_MESSAGE, callback),
  setOption: (options: { timeout?: number }) => {
    if (options.timeout !== undefined) {
      agentSDKOptions.timeout = options.timeout;
    }
  },
  getOption: (key: string) => {
    if (key === "timeout") {
      return agentSDKOptions.timeout;
    }
    return undefined;
  },
  setSessionId: (sessionId: string) => {
    _currentSessionId = sessionId;
  },
};

// Slide Settings API for slide output directory configuration
const slideSettingsAPI: SlideSettingsAPI = {
  getDirectory: () => safeInvoke(IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY),
  setDirectory: (dirPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY, dirPath),
  selectDirectory: () =>
    safeInvoke(IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY),
  validateDirectory: (dirPath: string) =>
    safeInvoke(IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY, dirPath),
  getAllSettings: () => safeInvoke(IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL),
};

// System Prompt API for system prompt template management
const systemPromptAPI: SystemPromptAPI = {
  list: (request: SystemPromptListRequest) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_LIST, request),
  get: (request: SystemPromptGetRequest) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_GET, request),
  create: (request: SystemPromptCreateRequest) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_CREATE, request),
  update: (request: SystemPromptUpdateRequest) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_UPDATE, request),
  delete: (request: SystemPromptDeleteRequest) =>
    safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_DELETE, request),
  migrate: () => safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_MIGRATE),
  getPresets: () => safeInvoke(IPC_CHANNELS.SYSTEM_PROMPT_GET_PRESETS),
};

// Claude CLI API for Claude Code CLI integration
const claudeCliAPI: ClaudeCliAPI = {
  checkInstallation: () =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION),
  listSkills: (request?: ClaudeCliListSkillsRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS, request || {}),
  getSkillDetail: (request: ClaudeCliGetSkillDetailRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL, request),
  executeScript: (request: ClaudeCliExecuteScriptRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT, request),
  terminateSession: (request: ClaudeCliTerminateSessionRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION, request),
  listSessions: () => safeInvoke(IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS),
  getSession: (request: ClaudeCliGetSessionRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_GET_SESSION, request),
  onSessionOutput: (callback: (event: ClaudeCliSessionOutputEvent) => void) =>
    safeOn<ClaudeCliSessionOutputEvent>(
      IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
      callback,
    ),
  onSessionStatus: (callback: (event: ClaudeCliSessionStatusEvent) => void) =>
    safeOn<ClaudeCliSessionStatusEvent>(
      IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      callback,
    ),
};

// Conversation API for conversation history persistence
import type {
  ConversationAPI,
  ConversationListRequest,
  ConversationGetRequest,
  ConversationCreateRequest,
  ConversationUpdateRequest,
  ConversationDeleteRequest,
  ConversationAddMessageRequest,
  ConversationSearchRequest,
} from "../shared/types/conversation";

import { skillAPI } from "./skill-api";
import { skillCreatorAPI } from "./skill-creator-api";
import type { SkillCreatorAPI } from "./skill-creator-api";
import type { PermissionAPI } from "./types";
import { chatEditAPI } from "./chatEditApi";
import type { ChatEditAPI } from "./chatEditApi";

const conversationAPI: ConversationAPI = {
  list: (request: ConversationListRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_LIST, request),
  get: (request: ConversationGetRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_GET, request),
  create: (request: ConversationCreateRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_CREATE, request),
  update: (request: ConversationUpdateRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_UPDATE, request),
  delete: (request: ConversationDeleteRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_DELETE, request),
  addMessage: (request: ConversationAddMessageRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, request),
  search: (request: ConversationSearchRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_SEARCH, request),
};

// Permission API for permission settings management (TASK-3-1-E)
const permissionAPI: PermissionAPI = {
  getAllowedTools: () => safeInvoke(IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS),
  revokeTool: (toolName: string) =>
    safeInvoke(IPC_CHANNELS.PERMISSION_REVOKE_TOOL, { toolName }),
  clearAll: () => safeInvoke(IPC_CHANNELS.PERMISSION_CLEAR_ALL),
};

// Use contextBridge APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
    contextBridge.exposeInMainWorld("slideApi", slideApi);
    contextBridge.exposeInMainWorld("historyAPI", historyAPI);
    contextBridge.exposeInMainWorld("agentAPI", agentAPI);
    contextBridge.exposeInMainWorld("agentSDKAPI", agentSDKAPI);
    contextBridge.exposeInMainWorld("slideSettingsAPI", slideSettingsAPI);
    contextBridge.exposeInMainWorld("claudeCliAPI", claudeCliAPI);
    contextBridge.exposeInMainWorld("systemPromptAPI", systemPromptAPI);
    contextBridge.exposeInMainWorld("conversationAPI", conversationAPI);
    contextBridge.exposeInMainWorld("permissionAPI", permissionAPI);
    contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI);
    contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI);
  } catch (error) {
    console.error("Failed to expose APIs:", error);
  }
} else {
  // Fallback for non-isolated context (development)
  (window as unknown as { electronAPI: ElectronAPI }).electronAPI = electronAPI;
  (window as unknown as { slideApi: SlideApi }).slideApi = slideApi;
  (window as unknown as { historyAPI: HistoryAPI }).historyAPI = historyAPI;
  (window as unknown as { agentAPI: AgentExecutionAPI }).agentAPI = agentAPI;
  (window as unknown as { agentSDKAPI: AgentSDKAPI }).agentSDKAPI = agentSDKAPI;
  (
    window as unknown as { slideSettingsAPI: SlideSettingsAPI }
  ).slideSettingsAPI = slideSettingsAPI;
  (window as unknown as { claudeCliAPI: ClaudeCliAPI }).claudeCliAPI =
    claudeCliAPI;
  (window as unknown as { systemPromptAPI: SystemPromptAPI }).systemPromptAPI =
    systemPromptAPI;
  (window as unknown as { conversationAPI: ConversationAPI }).conversationAPI =
    conversationAPI;
  (window as unknown as { permissionAPI: PermissionAPI }).permissionAPI =
    permissionAPI;
  (window as unknown as { skillCreatorAPI: SkillCreatorAPI }).skillCreatorAPI =
    skillCreatorAPI;
  (window as unknown as { chatEditAPI: ChatEditAPI }).chatEditAPI = chatEditAPI;
}
