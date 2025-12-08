// IPC Channel definitions
// All channel names are centralized here for type safety

export const IPC_CHANNELS = {
  // File operations
  FILE_GET_TREE: "file:get-tree",
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_WATCH_START: "file:watch-start",
  FILE_WATCH_STOP: "file:watch-stop",
  FILE_CHANGED: "file:changed",

  // Store operations
  STORE_GET: "store:get",
  STORE_SET: "store:set",
  STORE_GET_SECURE: "store:get-secure",
  STORE_SET_SECURE: "store:set-secure",

  // AI operations
  AI_CHAT: "ai:chat",
  AI_CHECK_CONNECTION: "ai:check-connection",
  AI_INDEX: "ai:index",

  // Graph operations
  GRAPH_GET: "graph:get",
  GRAPH_REFRESH: "graph:refresh",

  // Dashboard operations
  DASHBOARD_GET_STATS: "dashboard:get-stats",
  DASHBOARD_GET_ACTIVITY: "dashboard:get-activity",

  // Window operations
  WINDOW_GET_STATE: "window:get-state",
  WINDOW_RESIZED: "window:resized",

  // App operations
  APP_GET_VERSION: "app:get-version",
  APP_MENU_ACTION: "app:menu-action",

  // Theme operations
  THEME_GET: "theme:get",
  THEME_SET: "theme:set",
  THEME_GET_SYSTEM: "theme:get-system",
  THEME_SYSTEM_CHANGED: "theme:system-changed",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// Whitelist of allowed channels for security
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_GET_TREE,
  IPC_CHANNELS.FILE_READ,
  IPC_CHANNELS.FILE_WRITE,
  IPC_CHANNELS.FILE_WATCH_START,
  IPC_CHANNELS.FILE_WATCH_STOP,
  IPC_CHANNELS.STORE_GET,
  IPC_CHANNELS.STORE_SET,
  IPC_CHANNELS.STORE_GET_SECURE,
  IPC_CHANNELS.STORE_SET_SECURE,
  IPC_CHANNELS.AI_CHAT,
  IPC_CHANNELS.AI_CHECK_CONNECTION,
  IPC_CHANNELS.AI_INDEX,
  IPC_CHANNELS.GRAPH_GET,
  IPC_CHANNELS.GRAPH_REFRESH,
  IPC_CHANNELS.DASHBOARD_GET_STATS,
  IPC_CHANNELS.DASHBOARD_GET_ACTIVITY,
  IPC_CHANNELS.WINDOW_GET_STATE,
  IPC_CHANNELS.APP_GET_VERSION,
  // Theme channels
  IPC_CHANNELS.THEME_GET,
  IPC_CHANNELS.THEME_SET,
  IPC_CHANNELS.THEME_GET_SYSTEM,
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_CHANGED,
  IPC_CHANNELS.WINDOW_RESIZED,
  IPC_CHANNELS.APP_MENU_ACTION,
  // Theme channels
  IPC_CHANNELS.THEME_SYSTEM_CHANGED,
];
