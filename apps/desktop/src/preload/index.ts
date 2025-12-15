import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";
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
  ReplaceFileSingleRequest,
  ReplaceFileAllRequest,
  ReplaceWorkspaceAllRequest,
  ReplaceUndoRequest,
  ReplaceRedoRequest,
} from "./types";

// Type-safe invoke wrapper
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
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
};

// Use contextBridge APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error("Failed to expose electronAPI:", error);
  }
} else {
  // Fallback for non-isolated context (development)
  (window as unknown as { electronAPI: ElectronAPI }).electronAPI = electronAPI;
}
