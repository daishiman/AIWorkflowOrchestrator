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
