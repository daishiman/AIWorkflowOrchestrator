// IPC Request/Response Types

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

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
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
}

// Global type declaration
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
