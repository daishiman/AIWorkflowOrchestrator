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
}

// Global type declaration
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
