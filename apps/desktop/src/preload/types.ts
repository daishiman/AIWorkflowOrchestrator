// IPC Request/Response Types

import type {
  OpenFileDialogRequest,
  OpenFileDialogResponse,
  GetFileMetadataRequest,
  GetFileMetadataResponse,
  GetMultipleFileMetadataRequest,
  GetMultipleFileMetadataResponse,
  ValidateFilePathRequest,
  ValidateFilePathResponse,
} from "@repo/shared/schemas";

// File operations
export interface GetFileTreeRequest {
  rootPath: string;
  depth?: number;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  isRagIndexed?: boolean;
}

export interface GetFileTreeResponse {
  success: boolean;
  data?: FileNode[];
  error?: string;
}

export interface ReadFileRequest {
  filePath: string;
  encoding?: string;
}

export interface ReadFileResponse {
  success: boolean;
  data?: {
    content: string;
    metadata: {
      size: number;
      lastModified: Date;
      encoding: string;
    };
  };
  error?: string;
}

export interface WriteFileRequest {
  filePath: string;
  content: string;
  encoding?: string;
}

export interface WriteFileResponse {
  success: boolean;
  error?: string;
}

export interface RenameFileRequest {
  oldPath: string;
  newPath: string;
}

export interface RenameFileResponse {
  success: boolean;
  data?: {
    oldPath: string;
    newPath: string;
  };
  error?: string;
}

export interface WatchStartRequest {
  watchPath: string;
  recursive?: boolean;
}

export interface WatchStartResponse {
  success: boolean;
  watchId?: string;
  error?: string;
}

export interface FileChangedEvent {
  watchId: string;
  eventType: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  filePath: string;
  timestamp: Date;
}

// Store operations
export interface StoreGetRequest {
  key: string;
  defaultValue?: unknown;
}

export interface StoreGetResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface StoreSetRequest {
  key: string;
  value: unknown;
}

export interface StoreSetResponse {
  success: boolean;
  error?: string;
}

export interface StoreGetSecureRequest {
  key: string;
}

export interface StoreGetSecureResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface StoreSetSecureRequest {
  key: string;
  value: string;
}

export interface StoreSetSecureResponse {
  success: boolean;
  error?: string;
}

// AI operations
export interface AIChatRequest {
  message: string;
  conversationId?: string;
  ragEnabled?: boolean;
}

export interface AIChatResponse {
  success: boolean;
  data?: {
    message: string;
    conversationId: string;
    ragSources?: string[];
  };
  error?: string;
}

export interface AICheckConnectionResponse {
  success: boolean;
  data?: {
    status: "connected" | "disconnected" | "error";
    indexedDocuments: number;
    lastSyncTime?: Date;
  };
  error?: string;
}

export interface AIIndexRequest {
  folderPath: string;
  recursive?: boolean;
}

export interface AIIndexResponse {
  success: boolean;
  data?: {
    indexedCount: number;
    skippedCount: number;
    errors: string[];
  };
  error?: string;
}

// Graph operations
export interface GraphNode {
  id: string;
  label: string;
  type: "main" | "document" | "concept";
  x: number;
  y: number;
  size: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphGetResponse {
  success: boolean;
  data?: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  error?: string;
}

export interface GraphRefreshResponse {
  success: boolean;
  data?: {
    nodes: GraphNode[];
    links: GraphLink[];
    refreshedAt: Date;
  };
  error?: string;
}

// Dashboard operations
export interface DashboardStats {
  totalDocs: number;
  ragIndexed: number;
  pending: number;
  storageUsed: number;
  storageTotal: number;
}

export interface DashboardGetStatsResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}

export interface DashboardGetActivityRequest {
  limit?: number;
}

export interface DashboardGetActivityResponse {
  success: boolean;
  data?: ActivityItem[];
  error?: string;
}

// Window operations
export interface WindowGetStateResponse {
  success: boolean;
  data?: {
    width: number;
    height: number;
    x: number;
    y: number;
    isMaximized: boolean;
    isFullScreen: boolean;
  };
  error?: string;
}

export interface WindowResizedEvent {
  width: number;
  height: number;
}

// App operations
export interface AppGetVersionResponse {
  success: boolean;
  data?: {
    appVersion: string;
    electronVersion: string;
    nodeVersion: string;
    platform: string;
  };
  error?: string;
}

export type MenuAction =
  | "new"
  | "open"
  | "save"
  | "close"
  | "preferences"
  | "view-dashboard"
  | "view-editor"
  | "view-chat"
  | "view-graph"
  | "view-settings"
  | "toggle-fullscreen";

export interface MenuActionEvent {
  action: MenuAction;
}

// Theme operations
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

// Auth operations
export type OAuthProvider = "google" | "github" | "discord";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: OAuthProvider;
  createdAt: string;
  lastSignInAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  isOffline: boolean;
}

export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  isOffline?: boolean;
}

export interface AuthLoginRequest {
  provider: OAuthProvider;
}

export interface AuthLoginResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthLogoutResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthGetSessionResponse {
  success: boolean;
  data?: AuthSession | null;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthRefreshResponse {
  success: boolean;
  data?: AuthSession;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthCheckOnlineResponse {
  success: boolean;
  data?: {
    online: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Profile operations
export type UserPlan = "free" | "pro" | "enterprise";

// ロケール型
export type Locale = "ja" | "en" | "zh-CN" | "zh-TW" | "ko";

// 通知設定型
export interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  sound: boolean;
  workflowComplete: boolean;
  workflowError: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
  // 拡張プロフィール属性
  timezone?: string;
  locale?: Locale;
  notificationSettings?: NotificationSettings;
  preferences?: Record<string, unknown>;
}

export interface ProfileUpdateFields {
  displayName?: string;
  avatarUrl?: string | null;
}

export interface LinkedProvider {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
}

export interface ProfileGetResponse {
  success: boolean;
  data?: UserProfile;
  error?: {
    code: string;
    message: string;
  };
}

export interface ProfileUpdateRequest {
  updates: ProfileUpdateFields;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data?: UserProfile;
  error?: {
    code: string;
    message: string;
  };
}

export interface ProfileDeleteRequest {
  confirmEmail: string;
}

export interface ProfileDeleteResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface ProfileGetProvidersResponse {
  success: boolean;
  data?: LinkedProvider[];
  error?: {
    code: string;
    message: string;
  };
}

export interface ProfileLinkProviderRequest {
  provider: OAuthProvider;
}

export interface ProfileLinkProviderResponse {
  success: boolean;
  data?: LinkedProvider;
  error?: {
    code: string;
    message: string;
  };
}

export interface ProfileUnlinkProviderRequest {
  provider: OAuthProvider;
}

export interface ProfileUnlinkProviderResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

// Avatar operations
export interface AvatarUploadResponse {
  success: boolean;
  data?: {
    avatarUrl: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface AvatarUseProviderRequest {
  provider: OAuthProvider;
}

export interface AvatarUseProviderResponse {
  success: boolean;
  data?: {
    avatarUrl: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface AvatarRemoveResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

// ===== Workspace operations =====

export interface PersistedFolderEntry {
  id: string;
  path: string;
  displayName: string;
  isExpanded: boolean;
  expandedPaths: string[];
  addedAt: string;
}

export interface PersistedWorkspaceState {
  version: 1;
  folders: PersistedFolderEntry[];
  lastSelectedFilePath: string | null;
  updatedAt: string;
}

export interface WorkspaceLoadResponse {
  success: boolean;
  data?: PersistedWorkspaceState;
  error?: {
    code: "STORAGE_ERROR" | "PARSE_ERROR" | "UNKNOWN_ERROR";
    message: string;
  };
}

export interface WorkspaceSaveRequest {
  state: PersistedWorkspaceState;
}

export interface WorkspaceSaveResponse {
  success: boolean;
  error?: {
    code: "VALIDATION_ERROR" | "STORAGE_ERROR" | "UNKNOWN_ERROR";
    message: string;
  };
}

export interface WorkspaceAddFolderResponse {
  success: boolean;
  data?: {
    path: string;
    displayName: string;
    exists: boolean;
    isDirectory: boolean;
  };
  error?: {
    code: "CANCELED" | "ACCESS_DENIED" | "NOT_DIRECTORY" | "UNKNOWN_ERROR";
    message: string;
  };
}

export interface WorkspaceRemoveFolderRequest {
  folderId: string;
}

export interface WorkspaceRemoveFolderResponse {
  success: boolean;
  error?: {
    code: "NOT_FOUND" | "VALIDATION_ERROR" | "UNKNOWN_ERROR";
    message: string;
  };
}

export interface WorkspaceValidatePathsRequest {
  paths: string[];
}

export interface WorkspaceValidatePathsResponse {
  success: boolean;
  data?: {
    validPaths: string[];
    invalidPaths: Array<{
      path: string;
      reason: "NOT_FOUND" | "NOT_DIRECTORY" | "ACCESS_DENIED";
    }>;
  };
  error?: {
    code: "UNKNOWN_ERROR";
    message: string;
  };
}

export interface WorkspaceFolderChangedEvent {
  folderId: string;
  eventType: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  filePath: string;
  timestamp: Date;
}

// API Key operations
export type AIProvider = "openai" | "anthropic" | "google" | "xai";

export interface ApiKeySaveRequest {
  provider: AIProvider;
  apiKey: string;
  validateBeforeSave?: boolean;
}

export interface ApiKeySaveResponse {
  success: boolean;
  data?: {
    provider: AIProvider;
    savedAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiKeyDeleteRequest {
  provider: AIProvider;
}

export interface ApiKeyDeleteResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiKeyValidateRequest {
  provider: AIProvider;
  apiKey: string;
}

export type ApiKeyValidationStatus =
  | "valid"
  | "invalid"
  | "network_error"
  | "timeout"
  | "unknown_error";

export interface ApiKeyValidateResponse {
  success: boolean;
  data?: {
    provider: AIProvider;
    status: ApiKeyValidationStatus;
    validatedAt: string;
    errorMessage?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ProviderStatus {
  provider: AIProvider;
  displayName: string;
  status: "registered" | "not_registered";
  lastValidatedAt: string | null;
}

export interface ApiKeyListResponse {
  success: boolean;
  data?: {
    providers: ProviderStatus[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ThemeGetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

export interface ThemeSetRequest {
  mode: ThemeMode;
}

export interface ThemeSetResponse {
  success: boolean;
  data?: {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

export interface ThemeGetSystemResponse {
  success: boolean;
  data?: {
    isDark: boolean;
    resolvedTheme: ResolvedTheme;
  };
  error?: string;
}

export interface ThemeSystemChangedEvent {
  isDark: boolean;
  resolvedTheme: ResolvedTheme;
}

// ElectronAPI interface
export interface ElectronAPI {
  file: {
    getTree: (request: GetFileTreeRequest) => Promise<GetFileTreeResponse>;
    read: (request: ReadFileRequest) => Promise<ReadFileResponse>;
    write: (request: WriteFileRequest) => Promise<WriteFileResponse>;
    rename: (request: RenameFileRequest) => Promise<RenameFileResponse>;
    watchStart: (request: WatchStartRequest) => Promise<WatchStartResponse>;
    watchStop: (watchId: string) => Promise<void>;
    onChanged: (callback: (event: FileChangedEvent) => void) => () => void;
  };

  store: {
    get: (request: StoreGetRequest) => Promise<StoreGetResponse>;
    set: (request: StoreSetRequest) => Promise<StoreSetResponse>;
    getSecure: (
      request: StoreGetSecureRequest,
    ) => Promise<StoreGetSecureResponse>;
    setSecure: (
      request: StoreSetSecureRequest,
    ) => Promise<StoreSetSecureResponse>;
  };

  ai: {
    chat: (request: AIChatRequest) => Promise<AIChatResponse>;
    checkConnection: () => Promise<AICheckConnectionResponse>;
    index: (request: AIIndexRequest) => Promise<AIIndexResponse>;
  };

  graph: {
    get: () => Promise<GraphGetResponse>;
    refresh: () => Promise<GraphRefreshResponse>;
  };

  dashboard: {
    getStats: () => Promise<DashboardGetStatsResponse>;
    getActivity: (
      request: DashboardGetActivityRequest,
    ) => Promise<DashboardGetActivityResponse>;
  };

  window: {
    getState: () => Promise<WindowGetStateResponse>;
    onResized: (callback: (event: WindowResizedEvent) => void) => () => void;
  };

  app: {
    getVersion: () => Promise<AppGetVersionResponse>;
    onMenuAction: (callback: (event: MenuActionEvent) => void) => () => void;
  };

  theme: {
    get: () => Promise<ThemeGetResponse>;
    set: (request: ThemeSetRequest) => Promise<ThemeSetResponse>;
    getSystem: () => Promise<ThemeGetSystemResponse>;
    onSystemChanged: (
      callback: (event: ThemeSystemChangedEvent) => void,
    ) => () => void;
  };

  auth: {
    login: (request: AuthLoginRequest) => Promise<AuthLoginResponse>;
    logout: () => Promise<AuthLogoutResponse>;
    getSession: () => Promise<AuthGetSessionResponse>;
    refresh: () => Promise<AuthRefreshResponse>;
    checkOnline: () => Promise<AuthCheckOnlineResponse>;
    onAuthStateChanged: (callback: (state: AuthState) => void) => () => void;
  };

  profile: {
    get: () => Promise<ProfileGetResponse>;
    update: (request: ProfileUpdateRequest) => Promise<ProfileUpdateResponse>;
    delete: (request: ProfileDeleteRequest) => Promise<ProfileDeleteResponse>;
    getProviders: () => Promise<ProfileGetProvidersResponse>;
    linkProvider: (
      request: ProfileLinkProviderRequest,
    ) => Promise<ProfileLinkProviderResponse>;
    unlinkProvider: (
      request: ProfileUnlinkProviderRequest,
    ) => Promise<ProfileUnlinkProviderResponse>;
  };

  avatar: {
    upload: () => Promise<AvatarUploadResponse>;
    useProvider: (
      request: AvatarUseProviderRequest,
    ) => Promise<AvatarUseProviderResponse>;
    remove: () => Promise<AvatarRemoveResponse>;
  };

  apiKey: {
    save: (request: ApiKeySaveRequest) => Promise<ApiKeySaveResponse>;
    delete: (request: ApiKeyDeleteRequest) => Promise<ApiKeyDeleteResponse>;
    validate: (
      request: ApiKeyValidateRequest,
    ) => Promise<ApiKeyValidateResponse>;
    list: () => Promise<ApiKeyListResponse>;
  };

  workspace: {
    load: () => Promise<WorkspaceLoadResponse>;
    save: (request: WorkspaceSaveRequest) => Promise<WorkspaceSaveResponse>;
    addFolder: () => Promise<WorkspaceAddFolderResponse>;
    removeFolder: (
      request: WorkspaceRemoveFolderRequest,
    ) => Promise<WorkspaceRemoveFolderResponse>;
    validatePaths: (
      request: WorkspaceValidatePathsRequest,
    ) => Promise<WorkspaceValidatePathsResponse>;
    onFolderChanged: (
      callback: (event: WorkspaceFolderChangedEvent) => void,
    ) => () => void;
  };

  search: {
    executeFile: (request: SearchFileRequest) => Promise<SearchFileResponse>;
    executeWorkspace: (
      request: SearchWorkspaceRequest,
    ) => Promise<SearchWorkspaceResponse>;
  };

  replace: {
    fileSingle: (
      request: ReplaceFileSingleRequest,
    ) => Promise<ReplaceFileSingleResponse>;
    fileAll: (
      request: ReplaceFileAllRequest,
    ) => Promise<ReplaceFileAllResponse>;
    workspaceAll: (
      request: ReplaceWorkspaceAllRequest,
    ) => Promise<ReplaceWorkspaceAllResponse>;
    undo: (request: ReplaceUndoRequest) => Promise<ReplaceUndoResponse>;
    redo: (request: ReplaceRedoRequest) => Promise<ReplaceRedoResponse>;
  };

  fileSelection: {
    openDialog: (
      request: OpenFileDialogRequest,
    ) => Promise<OpenFileDialogResponse>;
    getMetadata: (
      request: GetFileMetadataRequest,
    ) => Promise<GetFileMetadataResponse>;
    getMultipleMetadata: (
      request: GetMultipleFileMetadataRequest,
    ) => Promise<GetMultipleFileMetadataResponse>;
    validatePath: (
      request: ValidateFilePathRequest,
    ) => Promise<ValidateFilePathResponse>;
  };

  // Generic invoke for IPC calls
  invoke: <T>(channel: string, payload?: unknown) => Promise<T>;

  // Dialog APIs
  dialog: {
    showOpenDialog: (options: {
      title?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      properties?: string[];
    }) => Promise<{ canceled: boolean; filePaths: string[] }>;
    showSaveDialog: (options: {
      title?: string;
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => Promise<{ canceled: boolean; filePath?: string }>;
  };
}

// ===== Search operations =====

export interface SearchMatch {
  text: string;
  line: number;
  column: number;
  length: number;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchFileRequest {
  filePath: string;
  query: string;
  options: SearchOptions;
}

export interface SearchFileResponse {
  success: boolean;
  data?: {
    matches: SearchMatch[];
    totalCount: number;
  };
  error?: string;
}

export interface SearchWorkspaceRequest {
  rootPath: string;
  query: string;
  options: SearchOptions;
  includePattern?: string;
  excludePatterns?: string[];
}

export interface WorkspaceSearchMatch extends SearchMatch {
  filePath: string;
}

export interface SearchWorkspaceResponse {
  success: boolean;
  data?: {
    matches: WorkspaceSearchMatch[];
    totalCount: number;
    fileCount: number;
  };
  error?: string;
}

// ===== Replace operations =====

export interface ReplaceOptions {
  preserveCase: boolean;
}

export interface ReplaceFileSingleRequest {
  filePath: string;
  query: string;
  replaceString: string;
  match: SearchMatch;
  searchOptions: SearchOptions;
  replaceOptions: ReplaceOptions;
}

export interface ReplaceFileSingleResponse {
  success: boolean;
  data?: {
    newContent: string;
    undoGroupId: string;
  };
  error?: string;
}

export interface ReplaceFileAllRequest {
  filePath: string;
  query: string;
  replaceString: string;
  searchOptions: SearchOptions;
  replaceOptions: ReplaceOptions;
}

export interface ReplaceFileAllResponse {
  success: boolean;
  data?: {
    replacedCount: number;
    undoGroupId: string;
  };
  error?: string;
}

export interface ReplaceWorkspaceAllRequest {
  rootPath: string;
  query: string;
  replaceString: string;
  searchOptions: SearchOptions;
  replaceOptions: ReplaceOptions;
  includePattern?: string;
  excludePatterns?: string[];
}

export interface ReplaceWorkspaceAllResponse {
  success: boolean;
  data?: {
    replacedCount: number;
    fileCount: number;
    undoGroupId: string;
  };
  error?: string;
}

export interface ReplaceUndoRequest {
  undoGroupId: string;
}

export interface ReplaceUndoResponse {
  success: boolean;
  error?: string;
}

export interface ReplaceRedoRequest {
  undoGroupId: string;
}

export interface ReplaceRedoResponse {
  success: boolean;
  error?: string;
}

// Global type declaration
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
