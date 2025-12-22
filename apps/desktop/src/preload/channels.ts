// IPC Channel definitions
// All channel names are centralized here for type safety

export const IPC_CHANNELS = {
  // File operations
  FILE_GET_TREE: "file:get-tree",
  FILE_READ: "file:read",
  FILE_WRITE: "file:write",
  FILE_RENAME: "file:rename",
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

  // Auth operations
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_GET_SESSION: "auth:get-session",
  AUTH_REFRESH: "auth:refresh",
  AUTH_STATE_CHANGED: "auth:state-changed",
  AUTH_CHECK_ONLINE: "auth:check-online",
  AUTH_TEST_CALLBACK: "auth:test-callback", // 開発用: コールバックURLを手動送信

  // Profile operations
  PROFILE_GET: "profile:get",
  PROFILE_UPDATE: "profile:update",
  PROFILE_DELETE: "profile:delete",
  PROFILE_GET_PROVIDERS: "profile:get-providers",
  PROFILE_LINK_PROVIDER: "profile:link-provider",
  PROFILE_UNLINK_PROVIDER: "profile:unlink-provider",

  // Extended Profile operations
  PROFILE_UPDATE_TIMEZONE: "profile:update-timezone",
  PROFILE_UPDATE_LOCALE: "profile:update-locale",
  PROFILE_UPDATE_NOTIFICATIONS: "profile:update-notifications",
  PROFILE_EXPORT: "profile:export",
  PROFILE_IMPORT: "profile:import",

  // Avatar operations
  AVATAR_UPLOAD: "avatar:upload",
  AVATAR_USE_PROVIDER: "avatar:use-provider",
  AVATAR_REMOVE: "avatar:remove",

  // Settings operations (user-specific)
  USER_SETTINGS_GET: "settings:get",
  USER_SETTINGS_UPDATE: "settings:update",

  // API Key operations
  API_KEY_SAVE: "apiKey:save",
  API_KEY_DELETE: "apiKey:delete",
  API_KEY_VALIDATE: "apiKey:validate",
  API_KEY_LIST: "apiKey:list",

  // Dialog operations
  DIALOG_SHOW_OPEN: "dialog:showOpenDialog",
  DIALOG_SHOW_SAVE: "dialog:showSaveDialog",

  // Workspace operations
  WORKSPACE_LOAD: "workspace:load",
  WORKSPACE_SAVE: "workspace:save",
  WORKSPACE_ADD_FOLDER: "workspace:add-folder",
  WORKSPACE_REMOVE_FOLDER: "workspace:remove-folder",
  WORKSPACE_VALIDATE_PATHS: "workspace:validate-paths",
  WORKSPACE_FOLDER_CHANGED: "workspace:folder-changed",

  // Search operations
  SEARCH_FILE_EXECUTE: "search:file:execute",
  SEARCH_WORKSPACE_EXECUTE: "search:workspace:execute",

  // Replace operations
  REPLACE_FILE_SINGLE: "replace:file:single",
  REPLACE_FILE_ALL: "replace:file:all",
  REPLACE_WORKSPACE_ALL: "replace:workspace:all",
  REPLACE_UNDO: "replace:undo",
  REPLACE_REDO: "replace:redo",

  // File Selection operations
  FILE_SELECTION_OPEN_DIALOG: "file-selection:open-dialog",
  FILE_SELECTION_GET_METADATA: "file-selection:get-metadata",
  FILE_SELECTION_GET_MULTIPLE_METADATA: "file-selection:get-multiple-metadata",
  FILE_SELECTION_VALIDATE_PATH: "file-selection:validate-path",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// Whitelist of allowed channels for security
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_GET_TREE,
  IPC_CHANNELS.FILE_READ,
  IPC_CHANNELS.FILE_WRITE,
  IPC_CHANNELS.FILE_RENAME,
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
  // Auth channels
  IPC_CHANNELS.AUTH_LOGIN,
  IPC_CHANNELS.AUTH_LOGOUT,
  IPC_CHANNELS.AUTH_GET_SESSION,
  IPC_CHANNELS.AUTH_REFRESH,
  IPC_CHANNELS.AUTH_CHECK_ONLINE,
  IPC_CHANNELS.AUTH_TEST_CALLBACK, // 開発用
  // Profile channels
  IPC_CHANNELS.PROFILE_GET,
  IPC_CHANNELS.PROFILE_UPDATE,
  IPC_CHANNELS.PROFILE_DELETE,
  IPC_CHANNELS.PROFILE_GET_PROVIDERS,
  IPC_CHANNELS.PROFILE_LINK_PROVIDER,
  IPC_CHANNELS.PROFILE_UNLINK_PROVIDER,
  // Extended Profile channels
  IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE,
  IPC_CHANNELS.PROFILE_UPDATE_LOCALE,
  IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
  IPC_CHANNELS.PROFILE_EXPORT,
  IPC_CHANNELS.PROFILE_IMPORT,
  // Avatar channels
  IPC_CHANNELS.AVATAR_UPLOAD,
  IPC_CHANNELS.AVATAR_USE_PROVIDER,
  IPC_CHANNELS.AVATAR_REMOVE,
  // Settings channels
  IPC_CHANNELS.USER_SETTINGS_GET,
  IPC_CHANNELS.USER_SETTINGS_UPDATE,
  // API Key channels (GET is not exposed for security - NFR-SEC-008)
  IPC_CHANNELS.API_KEY_SAVE,
  IPC_CHANNELS.API_KEY_DELETE,
  IPC_CHANNELS.API_KEY_VALIDATE,
  IPC_CHANNELS.API_KEY_LIST,
  // Dialog channels
  IPC_CHANNELS.DIALOG_SHOW_OPEN,
  IPC_CHANNELS.DIALOG_SHOW_SAVE,
  // Workspace channels
  IPC_CHANNELS.WORKSPACE_LOAD,
  IPC_CHANNELS.WORKSPACE_SAVE,
  IPC_CHANNELS.WORKSPACE_ADD_FOLDER,
  IPC_CHANNELS.WORKSPACE_REMOVE_FOLDER,
  IPC_CHANNELS.WORKSPACE_VALIDATE_PATHS,
  // Search channels
  IPC_CHANNELS.SEARCH_FILE_EXECUTE,
  IPC_CHANNELS.SEARCH_WORKSPACE_EXECUTE,
  // Replace channels
  IPC_CHANNELS.REPLACE_FILE_SINGLE,
  IPC_CHANNELS.REPLACE_FILE_ALL,
  IPC_CHANNELS.REPLACE_WORKSPACE_ALL,
  IPC_CHANNELS.REPLACE_UNDO,
  IPC_CHANNELS.REPLACE_REDO,
  // File Selection channels
  IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG,
  IPC_CHANNELS.FILE_SELECTION_GET_METADATA,
  IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
  IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH,
];

export const ALLOWED_ON_CHANNELS: readonly string[] = [
  IPC_CHANNELS.FILE_CHANGED,
  IPC_CHANNELS.WINDOW_RESIZED,
  IPC_CHANNELS.APP_MENU_ACTION,
  // Theme channels
  IPC_CHANNELS.THEME_SYSTEM_CHANGED,
  // Auth channels
  IPC_CHANNELS.AUTH_STATE_CHANGED,
  // Workspace channels
  IPC_CHANNELS.WORKSPACE_FOLDER_CHANGED,
];
