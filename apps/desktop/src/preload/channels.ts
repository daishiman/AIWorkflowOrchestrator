// IPC Channel definitions
// All channel names are centralized here for type safety
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
} from "@repo/shared/src/ipc/channels";

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

  // Terminal operations
  TERMINAL_OPEN: "terminal:open",

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
  AUTH_START_OAUTH_FLOW: "auth:start-oauth-flow", // PKCE対応OAuth開始
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

  // LLM operations
  LLM_GET_PROVIDERS: "llm:get-providers",
  LLM_SET_SELECTED_CONFIG: "llm:set-selected-config",
  LLM_CHECK_HEALTH: "llm:check-health",
  LLM_SEND_CHAT: "llm:send-chat",
  LLM_STREAM_CHAT: "llm:stream-chat",
  LLM_STREAM_CHUNK: "llm:stream-chunk",
  LLM_STREAM_END: "llm:stream-end",
  LLM_STREAM_ERROR: "llm:stream-error",
  LLM_STREAM_CANCEL: "llm:stream-cancel",

  // Slide operations (invoke)
  SLIDE_EXECUTE_PHASE: "slide:executePhase",
  SLIDE_WATCH_START: "slide:watch-start",
  SLIDE_WATCH_STOP: "slide:watch-stop",
  SLIDE_SYNC_STATUS: "slide:sync-status",
  SLIDE_REVERSE_SYNC: "slide:reverse-sync",
  SLIDE_CANCEL: "slide:cancel",
  // Slide operations (push)
  SLIDE_SYNC_STATUS_CHANGED: "slide:sync-status-changed",
  SLIDE_SYNC_PROGRESS: "slide:sync-progress",
  SLIDE_SYNC_ERROR: "slide:sync-error",
  SLIDE_EXECUTION_PROGRESS: "slide:execution-progress",
  SLIDE_STRUCTURE_CHANGED: "slide:structureChanged",
  SLIDE_WATCH_STATUS: "slide:watch-status",

  // Agent operations
  AGENT_GET_SKILLS: "agent:get-skills",
  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
  AGENT_EXECUTE: "agent:execute",
  AGENT_ABORT: "agent:abort",
  AGENT_GET_STATUS: "agent:get-status",
  AGENT_STATUS_CHANGED: "agent:status-changed",
  AGENT_STREAM_CHUNK: "agent:stream-chunk",
  AGENT_STREAM_END: "agent:stream-end",
  AGENT_STREAM_ERROR: "agent:stream-error",
  AGENT_PERMISSION_REQUEST: "agent:permission-request",
  AGENT_PERMISSION_RESPOND: "agent:permission-respond",

  // Agent Execution operations (AGENT-005)
  AGENT_EXECUTION_START: "agent:start",
  AGENT_EXECUTION_STOP: "agent:stop",
  AGENT_EXECUTION_STOP_ALL: "agent:stop-all",
  AGENT_EXECUTION_GET_ACTIVE: "agent:get-active-executions",
  AGENT_EXECUTION_STREAM: "agent:stream",
  AGENT_EXECUTION_STATUS: "agent:status",
  AGENT_EXECUTION_PERMISSION: "agent:permission",
  AGENT_EXECUTION_PERMISSION_RES: "agent:permission:res",

  // Agent SDK Session operations (AGENT-005-POSTRELEASE)
  AGENT_CREATE_SESSION: "agent:createSession",
  AGENT_RESUME_SESSION: "agent:resumeSession",
  AGENT_DESTROY_SESSION: "agent:destroySession",
  AGENT_QUERY: "agent:query",
  AGENT_MESSAGE: "agent:message",

  // Agent Environment operations (AGENT-007)
  AGENT_EXTRACT_CONTENT: "agent:extract-content",
  AGENT_GET_PREVIEW_CONTENT: "agent:get-preview-content",
  AGENT_CLEANUP_TEMP_FILES: "agent:cleanup-temp-files",

  // Skill management operations
  // Note: SKILL_LIST_AVAILABLE and SKILL_LIST_IMPORTED removed in TASK-FIX-4-1-IPC-CONSOLIDATION
  // Unified to SKILL_LIST and SKILL_GET_IMPORTED (see Skill import operations below)
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_CREATE: "skill:create",
  SKILL_GET_DETAIL: "skill:get-detail",
  SKILL_EXECUTE: "skill:execute",
  SKILL_STREAM: "skill:stream",
  SKILL_ABORT: "skill:abort",
  SKILL_GET_STATUS: "skill:get-status",

  // Skill import operations (TASK-4-1)
  SKILL_LIST: "skill:list",
  SKILL_SCAN: "skill:scan",
  SKILL_GET_IMPORTED: "skill:getImported",
  SKILL_UPDATE: "skill:update",
  SKILL_COMPLETE: "skill:complete",
  SKILL_ERROR: "skill:error",
  // Skill permission operations (TASK-3-1-D + TASK-4-1 + TASK-4-2)
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",

  // Skill improvement operations (TASK-9C)
  SKILL_ANALYZE: "skill:analyze",
  SKILL_IMPROVE: "skill:improve",
  SKILL_OPTIMIZE: "skill:optimize",
  SKILL_OPTIMIZE_VARIANTS: "skill:optimize:variants",
  SKILL_OPTIMIZE_EVALUATE: "skill:optimize:evaluate",

  // Skill analytics operations (TASK-9I)
  SKILL_ANALYTICS_RECORD: "skill:analytics:record",
  SKILL_ANALYTICS_STATISTICS: "skill:analytics:statistics",
  SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
  SKILL_ANALYTICS_TREND: "skill:analytics:trend",
  SKILL_ANALYTICS_EXPORT: "skill:analytics:export",

  // Skill docs operations (TASK-9J)
  SKILL_DOCS_GENERATE: "skill:docs:generate",
  SKILL_DOCS_PREVIEW: "skill:docs:preview",
  SKILL_DOCS_EXPORT: "skill:docs:export",
  SKILL_DOCS_TEMPLATES: "skill:docs:templates",

  // Skill chain operations (TASK-9D)
  SKILL_CHAIN_LIST: "skill:chain:list",
  SKILL_CHAIN_GET: "skill:chain:get",
  SKILL_CHAIN_SAVE: "skill:chain:save",
  SKILL_CHAIN_DELETE: "skill:chain:delete",
  SKILL_CHAIN_EXECUTE: "skill:chain:execute",

  // History operations
  HISTORY_GET_FILE_HISTORY: "history:getFileHistory",
  HISTORY_GET_VERSION_DETAIL: "history:getVersionDetail",
  HISTORY_GET_CONVERSION_LOGS: "history:getConversionLogs",
  HISTORY_RESTORE_VERSION: "history:restoreVersion",
  HISTORY_SEARCH: "history:search",
  HISTORY_GET_STATS: "history:get-stats",

  // Notification operations
  NOTIFICATION_GET_HISTORY: "notification:get-history",
  NOTIFICATION_MARK_READ: "notification:mark-read",
  NOTIFICATION_MARK_ALL_READ: "notification:mark-all-read",
  NOTIFICATION_DELETE: "notification:delete",
  NOTIFICATION_CLEAR: "notification:clear",
  NOTIFICATION_NEW: "notification:new",

  // Community operations
  COMMUNITY_GET_ALL: "community:getAll",
  COMMUNITY_GET_BY_LEVEL: "community:getByLevel",
  COMMUNITY_GET_BY_ID: "community:getById",
  COMMUNITY_GET_MEMBERS: "community:getMembers",
  COMMUNITY_GET_SUMMARY: "community:getSummary",
  COMMUNITY_SEARCH: "community:search",

  // Slide Settings operations
  SLIDE_SETTINGS_GET_DIRECTORY: "slideSettings:getDirectory",
  SLIDE_SETTINGS_SET_DIRECTORY: "slideSettings:setDirectory",
  SLIDE_SETTINGS_SELECT_DIRECTORY: "slideSettings:selectDirectory",
  SLIDE_SETTINGS_VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  SLIDE_SETTINGS_GET_ALL: "slideSettings:getAllSettings",

  // Claude CLI operations
  CLAUDE_CLI_CHECK_INSTALLATION: "claude-cli:check-installation",
  CLAUDE_CLI_LIST_SKILLS: "claude-cli:list-skills",
  CLAUDE_CLI_GET_SKILL_DETAIL: "claude-cli:get-skill-detail",
  CLAUDE_CLI_EXECUTE_SCRIPT: "claude-cli:execute-script",
  CLAUDE_CLI_TERMINATE_SESSION: "claude-cli:terminate-session",
  CLAUDE_CLI_LIST_SESSIONS: "claude-cli:list-sessions",
  CLAUDE_CLI_GET_SESSION: "claude-cli:get-session",
  // Claude CLI streaming events (main -> renderer)
  CLAUDE_CLI_SESSION_OUTPUT: "claude-cli:session-output",
  CLAUDE_CLI_SESSION_STATUS: "claude-cli:session-status",

  // System Prompt Template operations
  SYSTEM_PROMPT_LIST: "system-prompt:list",
  SYSTEM_PROMPT_GET: "system-prompt:get",
  SYSTEM_PROMPT_CREATE: "system-prompt:create",
  SYSTEM_PROMPT_UPDATE: "system-prompt:update",
  SYSTEM_PROMPT_DELETE: "system-prompt:delete",
  SYSTEM_PROMPT_MIGRATE: "system-prompt:migrate",
  SYSTEM_PROMPT_GET_PRESETS: "system-prompt:get-presets",

  // Conversation operations
  CONVERSATION_LIST: "conversation:list",
  CONVERSATION_GET: "conversation:get",
  CONVERSATION_CREATE: "conversation:create",
  CONVERSATION_UPDATE: "conversation:update",
  CONVERSATION_DELETE: "conversation:delete",
  CONVERSATION_ADD_MESSAGE: "conversation:addMessage",
  CONVERSATION_SEARCH: "conversation:search",

  // Chat Edit operations
  CHAT_EDIT_READ_FILE: "chat-edit:read-file",
  CHAT_EDIT_WRITE_FILE: "chat-edit:write-file",
  CHAT_EDIT_GET_SELECTION: "chat-edit:get-selection",
  CHAT_EDIT_SEND_WITH_CONTEXT: "chat-edit:send-with-context",

  // Permission operations (TASK-3-1-E, UT-06-002)
  PERMISSION_GET_ALLOWED_TOOLS: "permission:getAllowedTools",
  PERMISSION_REVOKE_TOOL: "permission:revokeTool",
  PERMISSION_CLEAR_ALL: "permission:clearAll",
  PERMISSION_CLEAR_SESSION: "permission:clear-session",

  // Auth Key operations (TASK-FIX-16-1)
  AUTH_KEY_SET: "auth-key:set",
  AUTH_KEY_EXISTS: "auth-key:exists",
  AUTH_KEY_VALIDATE: "auth-key:validate",
  AUTH_KEY_DELETE: "auth-key:delete",

  // Auth Mode operations (TASK-AUTH-MODE-SELECTION-001)
  AUTH_MODE_GET: "auth-mode:get",
  AUTH_MODE_SET: "auth-mode:set",
  AUTH_MODE_STATUS: "auth-mode:status",
  AUTH_MODE_VALIDATE: "auth-mode:validate",
  AUTH_MODE_CHANGED: "auth-mode:changed",

  // Skill Creator operations (TASK-9B-H)
  SKILL_CREATOR_DETECT_MODE: "skill-creator:detect-mode",
  SKILL_CREATOR_CREATE: "skill-creator:create",
  SKILL_CREATOR_EXECUTE_TASKS: "skill-creator:execute-tasks",
  SKILL_CREATOR_VALIDATE: "skill-creator:validate",
  SKILL_CREATOR_VALIDATE_SCHEMA: "skill-creator:validate-schema",
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",

  // Runtime Skill Creator operations
  SKILL_CREATOR_PLAN: "skill-creator:plan",
  SKILL_CREATOR_EXECUTE_PLAN: "skill-creator:execute-plan",
  SKILL_CREATOR_GET_WORKFLOW_STATE: "skill-creator:get-workflow-state",
  SKILL_CREATOR_SUBMIT_USER_INPUT: "skill-creator:submit-user-input",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_IMPROVE_SKILL: "skill-creator:improve-skill",
  SKILL_CREATOR_APPLY_IMPROVEMENT: "skill-creator:apply-improvement",
  SKILL_CREATOR_GET_VERIFY_DETAIL: "skill-creator:get-verify-detail",
  SKILL_CREATOR_REVERIFY_WORKFLOW: "skill-creator:reverify-workflow",

  // SDK Message 正規化 (TASK-RT-06)
  SKILL_CREATOR_NORMALIZE_SDK_MESSAGES: "skill-creator:normalize-sdk-messages",

  // Session Resume channels (TASK-P0-08)
  SKILL_CREATOR_LIST_SESSIONS: "skill-creator:list-sessions",
  SKILL_CREATOR_GET_SESSION_DETAIL: "skill-creator:get-session-detail",
  SKILL_CREATOR_RESUME_SESSION: "skill-creator:resume-session",
  SKILL_CREATOR_DELETE_SESSION: "skill-creator:delete-session",
  SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS:
    "skill-creator:cleanup-expired-sessions",

  // Skill Creator extended operations (TASK-9B Phase 5)
  SKILL_CREATOR_IMPROVE: "skill-creator:improve",
  SKILL_CREATOR_FORK: "skill-creator:fork",
  SKILL_CREATOR_SHARE: "skill-creator:share",
  SKILL_CREATOR_SCHEDULE: "skill-creator:schedule",
  SKILL_CREATOR_DEBUG: "skill-creator:debug",
  SKILL_CREATOR_GENERATE_DOCS: "skill-creator:generate-docs",
  SKILL_CREATOR_STATS: "skill-creator:stats",

  // Skill file operations (TASK-9A-B)
  SKILL_READ_FILE: "skill:readFile",
  SKILL_WRITE_FILE: "skill:writeFile",
  SKILL_CREATE_FILE: "skill:createFile",
  SKILL_DELETE_FILE: "skill:deleteFile",
  SKILL_LIST_BACKUPS: "skill:listBackups",
  SKILL_RESTORE_BACKUP: "skill:restoreBackup",
  SKILL_GET_FILE_TREE: "skill:getFileTree",

  // Skill share operations (TASK-9F)
  SKILL_IMPORT_FROM_SOURCE: "skill:importFromSource",
  SKILL_EXPORT: "skill:export",
  SKILL_VALIDATE_SOURCE: "skill:validateSource",

  // Skill schedule operations (TASK-9G)
  SKILL_SCHEDULE_LIST: "skill:schedule:list",
  SKILL_SCHEDULE_ADD: "skill:schedule:add",
  SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
  SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
  SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",

  // Skill fork operations (TASK-9E)
  SKILL_FORK: "skill:fork",

  // Skill debug operations (TASK-9H)
  SKILL_DEBUG_START: "skill:debug:start",
  SKILL_DEBUG_COMMAND: "skill:debug:command",
  SKILL_DEBUG_BREAKPOINT_ADD: "skill:debug:breakpoint:add",
  SKILL_DEBUG_BREAKPOINT_REMOVE: "skill:debug:breakpoint:remove",
  SKILL_DEBUG_INSPECT: "skill:debug:inspect",
  SKILL_DEBUG_EVALUATE: "skill:debug:evaluate",
  SKILL_DEBUG_EVENT: "skill:debug:event",

  // Skill safety gate operations (TASK-SAFETY-GATE)
  SKILL_EVALUATE_SAFETY: "skill:evaluate-safety",

  // Approval / Disclosure operations (TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001)
  APPROVAL_RESPOND: APPROVAL_CHANNELS.APPROVAL_RESPOND,
  APPROVAL_REQUEST: APPROVAL_CHANNELS.APPROVAL_REQUEST,
  EXECUTION_GET_DISCLOSURE_INFO:
    EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
  EXECUTION_GET_TERMINAL_LOG: "execution:get-terminal-log",
  EXECUTION_GET_COPY_COMMAND: "execution:get-copy-command",
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
  IPC_CHANNELS.TERMINAL_OPEN,
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
  IPC_CHANNELS.AUTH_START_OAUTH_FLOW, // PKCE対応OAuth開始
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
  // LLM channels
  IPC_CHANNELS.LLM_GET_PROVIDERS,
  IPC_CHANNELS.LLM_SET_SELECTED_CONFIG,
  IPC_CHANNELS.LLM_CHECK_HEALTH,
  IPC_CHANNELS.LLM_SEND_CHAT,
  IPC_CHANNELS.LLM_STREAM_CHAT,
  IPC_CHANNELS.LLM_STREAM_CANCEL,
  // Slide channels
  IPC_CHANNELS.SLIDE_EXECUTE_PHASE,
  IPC_CHANNELS.SLIDE_WATCH_START,
  IPC_CHANNELS.SLIDE_WATCH_STOP,
  IPC_CHANNELS.SLIDE_SYNC_STATUS,
  IPC_CHANNELS.SLIDE_REVERSE_SYNC,
  IPC_CHANNELS.SLIDE_CANCEL,
  // Agent channels
  IPC_CHANNELS.AGENT_GET_SKILLS,
  IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
  IPC_CHANNELS.AGENT_EXECUTE,
  IPC_CHANNELS.AGENT_ABORT,
  IPC_CHANNELS.AGENT_GET_STATUS,
  IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
  // Agent Execution channels (AGENT-005)
  IPC_CHANNELS.AGENT_EXECUTION_START,
  IPC_CHANNELS.AGENT_EXECUTION_STOP,
  IPC_CHANNELS.AGENT_EXECUTION_STOP_ALL,
  IPC_CHANNELS.AGENT_EXECUTION_GET_ACTIVE,
  IPC_CHANNELS.AGENT_EXECUTION_PERMISSION_RES,
  // Agent SDK Session channels (AGENT-005-POSTRELEASE)
  IPC_CHANNELS.AGENT_CREATE_SESSION,
  IPC_CHANNELS.AGENT_RESUME_SESSION,
  IPC_CHANNELS.AGENT_DESTROY_SESSION,
  IPC_CHANNELS.AGENT_QUERY,
  // Agent Environment channels (AGENT-007)
  IPC_CHANNELS.AGENT_EXTRACT_CONTENT,
  IPC_CHANNELS.AGENT_GET_PREVIEW_CONTENT,
  IPC_CHANNELS.AGENT_CLEANUP_TEMP_FILES,
  // Skill management channels
  // Note: SKILL_LIST_AVAILABLE and SKILL_LIST_IMPORTED removed (TASK-FIX-4-1-IPC-CONSOLIDATION)
  IPC_CHANNELS.SKILL_IMPORT,
  IPC_CHANNELS.SKILL_REMOVE,
  IPC_CHANNELS.SKILL_CREATE,
  IPC_CHANNELS.SKILL_GET_DETAIL,
  IPC_CHANNELS.SKILL_EXECUTE,
  IPC_CHANNELS.SKILL_ABORT,
  IPC_CHANNELS.SKILL_GET_STATUS,
  // Skill import channels (TASK-4-1)
  IPC_CHANNELS.SKILL_LIST,
  IPC_CHANNELS.SKILL_SCAN,
  IPC_CHANNELS.SKILL_GET_IMPORTED,
  IPC_CHANNELS.SKILL_UPDATE,
  // Skill permission channels (TASK-3-1-D + TASK-4-1 + TASK-4-2)
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
  // Skill improvement channels (TASK-9C)
  IPC_CHANNELS.SKILL_ANALYZE,
  IPC_CHANNELS.SKILL_IMPROVE,
  IPC_CHANNELS.SKILL_OPTIMIZE,
  IPC_CHANNELS.SKILL_OPTIMIZE_VARIANTS,
  IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE,
  // Skill analytics channels (TASK-9I)
  IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
  IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
  IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY,
  IPC_CHANNELS.SKILL_ANALYTICS_TREND,
  IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
  // Skill docs channels (TASK-9J)
  IPC_CHANNELS.SKILL_DOCS_GENERATE,
  IPC_CHANNELS.SKILL_DOCS_PREVIEW,
  IPC_CHANNELS.SKILL_DOCS_EXPORT,
  IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
  // Skill chain channels (TASK-9D)
  IPC_CHANNELS.SKILL_CHAIN_LIST,
  IPC_CHANNELS.SKILL_CHAIN_GET,
  IPC_CHANNELS.SKILL_CHAIN_SAVE,
  IPC_CHANNELS.SKILL_CHAIN_DELETE,
  IPC_CHANNELS.SKILL_CHAIN_EXECUTE,
  // History channels
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
  IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
  IPC_CHANNELS.HISTORY_RESTORE_VERSION,
  IPC_CHANNELS.HISTORY_SEARCH,
  IPC_CHANNELS.HISTORY_GET_STATS,
  // Notification channels
  IPC_CHANNELS.NOTIFICATION_GET_HISTORY,
  IPC_CHANNELS.NOTIFICATION_MARK_READ,
  IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ,
  IPC_CHANNELS.NOTIFICATION_DELETE,
  IPC_CHANNELS.NOTIFICATION_CLEAR,
  // Community channels
  IPC_CHANNELS.COMMUNITY_GET_ALL,
  IPC_CHANNELS.COMMUNITY_GET_BY_LEVEL,
  IPC_CHANNELS.COMMUNITY_GET_BY_ID,
  IPC_CHANNELS.COMMUNITY_GET_MEMBERS,
  IPC_CHANNELS.COMMUNITY_GET_SUMMARY,
  IPC_CHANNELS.COMMUNITY_SEARCH,
  // Slide Settings channels
  IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
  // Claude CLI channels
  IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
  IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
  IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
  IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
  IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
  IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
  IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
  // System Prompt Template channels
  IPC_CHANNELS.SYSTEM_PROMPT_LIST,
  IPC_CHANNELS.SYSTEM_PROMPT_GET,
  IPC_CHANNELS.SYSTEM_PROMPT_CREATE,
  IPC_CHANNELS.SYSTEM_PROMPT_UPDATE,
  IPC_CHANNELS.SYSTEM_PROMPT_DELETE,
  IPC_CHANNELS.SYSTEM_PROMPT_MIGRATE,
  IPC_CHANNELS.SYSTEM_PROMPT_GET_PRESETS,
  // Conversation channels
  IPC_CHANNELS.CONVERSATION_LIST,
  IPC_CHANNELS.CONVERSATION_GET,
  IPC_CHANNELS.CONVERSATION_CREATE,
  IPC_CHANNELS.CONVERSATION_UPDATE,
  IPC_CHANNELS.CONVERSATION_DELETE,
  IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
  IPC_CHANNELS.CONVERSATION_SEARCH,
  // Chat Edit channels
  IPC_CHANNELS.CHAT_EDIT_READ_FILE,
  IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
  IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
  IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
  // Permission channels (TASK-3-1-E, UT-06-002)
  IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
  IPC_CHANNELS.PERMISSION_REVOKE_TOOL,
  IPC_CHANNELS.PERMISSION_CLEAR_ALL,
  IPC_CHANNELS.PERMISSION_CLEAR_SESSION,
  // Auth Key channels (TASK-FIX-16-1)
  IPC_CHANNELS.AUTH_KEY_SET,
  IPC_CHANNELS.AUTH_KEY_EXISTS,
  IPC_CHANNELS.AUTH_KEY_VALIDATE,
  IPC_CHANNELS.AUTH_KEY_DELETE,
  // Auth Mode channels (TASK-AUTH-MODE-SELECTION-001)
  IPC_CHANNELS.AUTH_MODE_GET,
  IPC_CHANNELS.AUTH_MODE_SET,
  IPC_CHANNELS.AUTH_MODE_STATUS,
  IPC_CHANNELS.AUTH_MODE_VALIDATE,
  // Skill Creator channels (TASK-9B-H)
  IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
  IPC_CHANNELS.SKILL_CREATOR_CREATE,
  IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
  IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
  IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
  IPC_CHANNELS.SKILL_CREATOR_PLAN,
  IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
  IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
  IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
  IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
  IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
  IPC_CHANNELS.SKILL_CREATOR_GET_VERIFY_DETAIL,
  IPC_CHANNELS.SKILL_CREATOR_REVERIFY_WORKFLOW,
  IPC_CHANNELS.SKILL_CREATOR_NORMALIZE_SDK_MESSAGES,
  // Session Resume channels (TASK-P0-08)
  IPC_CHANNELS.SKILL_CREATOR_LIST_SESSIONS,
  IPC_CHANNELS.SKILL_CREATOR_GET_SESSION_DETAIL,
  IPC_CHANNELS.SKILL_CREATOR_RESUME_SESSION,
  IPC_CHANNELS.SKILL_CREATOR_DELETE_SESSION,
  IPC_CHANNELS.SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS,
  // Skill Creator extended channels (TASK-9B Phase 5)
  IPC_CHANNELS.SKILL_CREATOR_IMPROVE,
  IPC_CHANNELS.SKILL_CREATOR_FORK,
  IPC_CHANNELS.SKILL_CREATOR_SHARE,
  IPC_CHANNELS.SKILL_CREATOR_SCHEDULE,
  IPC_CHANNELS.SKILL_CREATOR_DEBUG,
  IPC_CHANNELS.SKILL_CREATOR_GENERATE_DOCS,
  IPC_CHANNELS.SKILL_CREATOR_STATS,
  // Skill file operations (TASK-9A-B)
  IPC_CHANNELS.SKILL_READ_FILE,
  IPC_CHANNELS.SKILL_WRITE_FILE,
  IPC_CHANNELS.SKILL_CREATE_FILE,
  IPC_CHANNELS.SKILL_DELETE_FILE,
  IPC_CHANNELS.SKILL_LIST_BACKUPS,
  IPC_CHANNELS.SKILL_RESTORE_BACKUP,
  IPC_CHANNELS.SKILL_GET_FILE_TREE,
  // Skill share channels (TASK-9F)
  IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE,
  IPC_CHANNELS.SKILL_EXPORT,
  IPC_CHANNELS.SKILL_VALIDATE_SOURCE,
  // Skill schedule channels (TASK-9G)
  IPC_CHANNELS.SKILL_SCHEDULE_LIST,
  IPC_CHANNELS.SKILL_SCHEDULE_ADD,
  IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
  IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
  IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
  // Skill fork channels (TASK-9E)
  IPC_CHANNELS.SKILL_FORK,
  // Skill debug channels (TASK-9H)
  IPC_CHANNELS.SKILL_DEBUG_START,
  IPC_CHANNELS.SKILL_DEBUG_COMMAND,
  IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
  IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
  IPC_CHANNELS.SKILL_DEBUG_INSPECT,
  IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
  // Skill safety gate channels (TASK-SAFETY-GATE)
  IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
  // Approval / Disclosure channels (TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001)
  IPC_CHANNELS.APPROVAL_RESPOND,
  IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
  IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG,
  IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND,
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
  // LLM stream channels
  IPC_CHANNELS.LLM_STREAM_CHUNK,
  IPC_CHANNELS.LLM_STREAM_END,
  IPC_CHANNELS.LLM_STREAM_ERROR,
  // Slide channels
  IPC_CHANNELS.SLIDE_STRUCTURE_CHANGED,
  IPC_CHANNELS.SLIDE_SYNC_STATUS_CHANGED,
  IPC_CHANNELS.SLIDE_SYNC_PROGRESS,
  IPC_CHANNELS.SLIDE_SYNC_ERROR,
  IPC_CHANNELS.SLIDE_EXECUTION_PROGRESS,
  IPC_CHANNELS.SLIDE_WATCH_STATUS,
  // Agent channels
  IPC_CHANNELS.AGENT_STATUS_CHANGED,
  IPC_CHANNELS.AGENT_STREAM_CHUNK,
  IPC_CHANNELS.AGENT_STREAM_END,
  IPC_CHANNELS.AGENT_STREAM_ERROR,
  IPC_CHANNELS.AGENT_PERMISSION_REQUEST,
  // Agent Execution channels (AGENT-005)
  IPC_CHANNELS.AGENT_EXECUTION_STREAM,
  IPC_CHANNELS.AGENT_EXECUTION_STATUS,
  IPC_CHANNELS.AGENT_EXECUTION_PERMISSION,
  // Agent SDK Message channel (AGENT-005-POSTRELEASE)
  IPC_CHANNELS.AGENT_MESSAGE,
  // Claude CLI streaming channels
  IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
  IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
  // Skill streaming channels
  IPC_CHANNELS.SKILL_STREAM,
  // Skill import streaming channels (TASK-4-1)
  IPC_CHANNELS.SKILL_COMPLETE,
  IPC_CHANNELS.SKILL_ERROR,
  // Skill permission channels (TASK-3-1-D + TASK-4-1 + TASK-4-2)
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
  // Auth Mode channels (TASK-AUTH-MODE-SELECTION-001)
  IPC_CHANNELS.AUTH_MODE_CHANGED,
  // Skill Creator channels (TASK-9B-H)
  IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
  IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  // Skill debug event channel (TASK-9H)
  IPC_CHANNELS.SKILL_DEBUG_EVENT,
  // Notification event channels
  IPC_CHANNELS.NOTIFICATION_NEW,
  // Approval push notification (TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001)
  IPC_CHANNELS.APPROVAL_REQUEST,
];
