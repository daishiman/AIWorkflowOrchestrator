# Knowledge Studio - IPC通信要件定義書

> **ドキュメントID**: REQ-KS-IPC-001
> **バージョン**: 1.0.0
> **作成日**: 2024-12-08
> **ステータス**: Draft

---

## 1. 概要

### 1.1 目的

本ドキュメントは、Knowledge StudioのMain ProcessとRenderer Process間のIPC（Inter-Process Communication）通信要件を定義する。
Electronのセキュリティベストプラクティスに準拠したcontextBridge API設計の基礎を確立する。

### 1.2 スコープ

| 含む                     | 含まない               |
| ------------------------ | ---------------------- |
| IPCチャネル一覧と型定義  | 具体的なハンドラー実装 |
| contextBridge公開API定義 | Main Process実装詳細   |
| セキュリティ要件         | バックエンドAPI設計    |
| エラーハンドリング方針   | 外部サービス連携詳細   |

### 1.3 参照ドキュメント

- [UI機能要件定義書](./requirements-ui-functions.md) (REQ-KS-UI-001)
- [状態管理要件定義書](./requirements-state-management.md) (REQ-KS-STATE-001)
- [タスク実行仕様書](./task-knowledge-studio.md)

### 1.4 セキュリティ前提条件

| 設定               | 値      | 説明                            |
| ------------------ | ------- | ------------------------------- |
| `nodeIntegration`  | `false` | Renderer ProcessでNode.js無効化 |
| `contextIsolation` | `true`  | コンテキスト分離有効化          |
| `sandbox`          | `true`  | サンドボックス有効化            |
| `webSecurity`      | `true`  | Web Security有効化              |

---

## 2. IPCチャネル分類

### 2.1 分類基準

| 分類                      | パターン      | 説明                             | 例               |
| ------------------------- | ------------- | -------------------------------- | ---------------- |
| **Request-Response**      | invoke/handle | 結果を返す双方向通信             | ファイル読み取り |
| **One-way (to Main)**     | send/on       | Main Processへの一方向通知       | ログ記録         |
| **One-way (to Renderer)** | send          | Renderer Processへのイベント通知 | ファイル変更検知 |

### 2.2 チャネル命名規則

```
[カテゴリ]:[操作]
```

| カテゴリ | 説明             | 例                                 |
| -------- | ---------------- | ---------------------------------- |
| `file`   | ファイル操作     | `file:read`, `file:write`          |
| `store`  | 永続化ストレージ | `store:get`, `store:set`           |
| `ai`     | AI API通信       | `ai:chat`, `ai:index`              |
| `graph`  | グラフデータ     | `graph:get`, `graph:refresh`       |
| `window` | ウィンドウ操作   | `window:resize`, `window:minimize` |
| `app`    | アプリケーション | `app:quit`, `app:version`          |

---

## 3. ファイル操作チャネル

### 3.1 IPC-FILE-001: ファイルツリー取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `file:get-tree`                  |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | FR-EDIT-001, STATE-EDIT-002      |

#### リクエスト型

```typescript
interface GetFileTreeRequest {
  rootPath: string; // ルートディレクトリパス
  depth?: number; // 探索深度（デフォルト: 無制限）
}
```

#### レスポンス型

```typescript
interface GetFileTreeResponse {
  success: boolean;
  data?: FileNode[];
  error?: string;
}
```

---

### 3.2 IPC-FILE-002: ファイル読み取り

| 項目           | 内容                                     |
| -------------- | ---------------------------------------- |
| **チャネルID** | `file:read`                              |
| **パターン**   | Request-Response (invoke/handle)         |
| **優先度**     | Must                                     |
| **関連要件**   | FR-EDIT-002, FR-EDIT-004, STATE-EDIT-004 |

#### リクエスト型

```typescript
interface ReadFileRequest {
  filePath: string; // ファイルの絶対パス
  encoding?: string; // エンコーディング（デフォルト: 'utf-8'）
}
```

#### レスポンス型

```typescript
interface ReadFileResponse {
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
```

---

### 3.3 IPC-FILE-003: ファイル書き込み

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `file:write`                     |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | FR-EDIT-005                      |

#### リクエスト型

```typescript
interface WriteFileRequest {
  filePath: string; // ファイルの絶対パス
  content: string; // 書き込む内容
  encoding?: string; // エンコーディング（デフォルト: 'utf-8'）
}
```

#### レスポンス型

```typescript
interface WriteFileResponse {
  success: boolean;
  error?: string;
}
```

---

### 3.4 IPC-FILE-004: ファイル変更監視開始

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `file:watch-start`               |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Should                           |
| **関連要件**   | STATE-EDIT-002（自動更新）       |

#### リクエスト型

```typescript
interface WatchStartRequest {
  watchPath: string; // 監視対象パス
  recursive?: boolean; // サブディレクトリも監視（デフォルト: true）
}
```

#### レスポンス型

```typescript
interface WatchStartResponse {
  success: boolean;
  watchId?: string; // 監視ID（停止時に使用）
  error?: string;
}
```

---

### 3.5 IPC-FILE-005: ファイル変更通知

| 項目           | 内容                      |
| -------------- | ------------------------- |
| **チャネルID** | `file:changed`            |
| **パターン**   | One-way (Main → Renderer) |
| **優先度**     | Should                    |
| **関連要件**   | STATE-EDIT-002            |

#### イベントデータ型

```typescript
interface FileChangedEvent {
  watchId: string;
  eventType: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  filePath: string;
  timestamp: Date;
}
```

---

## 4. ストレージチャネル

### 4.1 IPC-STORE-001: 設定取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `store:get`                      |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | STATE-SET-001〜003, PERSIST-\*   |

#### リクエスト型

```typescript
interface StoreGetRequest {
  key: string; // 設定キー
  defaultValue?: unknown; // デフォルト値
}
```

#### レスポンス型

```typescript
interface StoreGetResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
```

---

### 4.2 IPC-STORE-002: 設定保存

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `store:set`                      |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | STATE-SET-001〜003, PERSIST-\*   |

#### リクエスト型

```typescript
interface StoreSetRequest {
  key: string; // 設定キー
  value: unknown; // 保存する値
}
```

#### レスポンス型

```typescript
interface StoreSetResponse {
  success: boolean;
  error?: string;
}
```

---

### 4.3 IPC-STORE-003: セキュア設定取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `store:get-secure`               |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | STATE-SET-002（APIキー）         |

#### リクエスト型

```typescript
interface StoreGetSecureRequest {
  key: string; // セキュア設定キー
}
```

#### レスポンス型

```typescript
interface StoreGetSecureResponse {
  success: boolean;
  data?: string; // 復号化された値
  error?: string;
}
```

---

### 4.4 IPC-STORE-004: セキュア設定保存

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `store:set-secure`               |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | STATE-SET-002（APIキー）         |

#### リクエスト型

```typescript
interface StoreSetSecureRequest {
  key: string; // セキュア設定キー
  value: string; // 暗号化する値
}
```

#### レスポンス型

```typescript
interface StoreSetSecureResponse {
  success: boolean;
  error?: string;
}
```

---

## 5. AI通信チャネル

### 5.1 IPC-AI-001: チャットメッセージ送信

| 項目           | 内容                                          |
| -------------- | --------------------------------------------- |
| **チャネルID** | `ai:chat`                                     |
| **パターン**   | Request-Response (invoke/handle)              |
| **優先度**     | Must                                          |
| **関連要件**   | FR-CHAT-002, FR-CHAT-003, STATE-CHAT-001〜003 |

#### リクエスト型

```typescript
interface AIChatRequest {
  message: string; // ユーザーメッセージ
  conversationId?: string; // 会話ID（コンテキスト継続用）
  ragEnabled?: boolean; // RAG検索有効化
}
```

#### レスポンス型

```typescript
interface AIChatResponse {
  success: boolean;
  data?: {
    message: string; // AIレスポンス
    conversationId: string; // 会話ID
    ragSources?: string[]; // 参照ドキュメント
  };
  error?: string;
}
```

---

### 5.2 IPC-AI-002: RAG接続確認

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `ai:check-connection`            |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | FR-CHAT-005, STATE-CHAT-004      |

#### リクエスト型

```typescript
interface AICheckConnectionRequest {
  // パラメータなし
}
```

#### レスポンス型

```typescript
interface AICheckConnectionResponse {
  success: boolean;
  data?: {
    status: "connected" | "disconnected" | "error";
    indexedDocuments: number;
    lastSyncTime?: Date;
  };
  error?: string;
}
```

---

### 5.3 IPC-AI-003: RAGインデックス作成

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `ai:index`                       |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Should                           |
| **関連要件**   | FR-EDIT-010                      |

#### リクエスト型

```typescript
interface AIIndexRequest {
  folderPath: string; // インデックス対象フォルダ
  recursive?: boolean; // サブフォルダも含む
}
```

#### レスポンス型

```typescript
interface AIIndexResponse {
  success: boolean;
  data?: {
    indexedCount: number;
    skippedCount: number;
    errors: string[];
  };
  error?: string;
}
```

---

## 6. グラフデータチャネル

### 6.1 IPC-GRAPH-001: グラフデータ取得

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| **チャネルID** | `graph:get`                             |
| **パターン**   | Request-Response (invoke/handle)        |
| **優先度**     | Must                                    |
| **関連要件**   | FR-GRAPH-001〜003, STATE-GRAPH-001〜002 |

#### リクエスト型

```typescript
interface GraphGetRequest {
  // パラメータなし（全データ取得）
}
```

#### レスポンス型

```typescript
interface GraphGetResponse {
  success: boolean;
  data?: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  error?: string;
}
```

---

### 6.2 IPC-GRAPH-002: グラフリフレッシュ

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `graph:refresh`                  |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Should                           |
| **関連要件**   | FR-GRAPH-006                     |

#### リクエスト型

```typescript
interface GraphRefreshRequest {
  // パラメータなし
}
```

#### レスポンス型

```typescript
interface GraphRefreshResponse {
  success: boolean;
  data?: {
    nodes: GraphNode[];
    links: GraphLink[];
    refreshedAt: Date;
  };
  error?: string;
}
```

---

## 7. ダッシュボードチャネル

### 7.1 IPC-DASH-001: 統計データ取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `dashboard:get-stats`            |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | FR-DASH-002, STATE-DASH-001      |

#### リクエスト型

```typescript
interface DashboardGetStatsRequest {
  // パラメータなし
}
```

#### レスポンス型

```typescript
interface DashboardGetStatsResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}
```

---

### 7.2 IPC-DASH-002: アクティビティ取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `dashboard:get-activity`         |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | FR-DASH-003, STATE-DASH-002      |

#### リクエスト型

```typescript
interface DashboardGetActivityRequest {
  limit?: number; // 取得件数（デフォルト: 10）
}
```

#### レスポンス型

```typescript
interface DashboardGetActivityResponse {
  success: boolean;
  data?: ActivityItem[];
  error?: string;
}
```

---

## 8. ウィンドウ操作チャネル

### 8.1 IPC-WINDOW-001: ウィンドウ状態取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `window:get-state`               |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Must                             |
| **関連要件**   | FR-ELECTRON-003, STATE-UI-003    |

#### リクエスト型

```typescript
interface WindowGetStateRequest {
  // パラメータなし
}
```

#### レスポンス型

```typescript
interface WindowGetStateResponse {
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
```

---

### 8.2 IPC-WINDOW-002: ウィンドウサイズ変更通知

| 項目           | 内容                       |
| -------------- | -------------------------- |
| **チャネルID** | `window:resized`           |
| **パターン**   | One-way (Main → Renderer)  |
| **優先度**     | Must                       |
| **関連要件**   | STATE-UI-003, STATE-UI-004 |

#### イベントデータ型

```typescript
interface WindowResizedEvent {
  width: number;
  height: number;
}
```

---

## 9. アプリケーションチャネル

### 9.1 IPC-APP-001: バージョン情報取得

| 項目           | 内容                             |
| -------------- | -------------------------------- |
| **チャネルID** | `app:get-version`                |
| **パターン**   | Request-Response (invoke/handle) |
| **優先度**     | Should                           |
| **関連要件**   | -                                |

#### リクエスト型

```typescript
interface AppGetVersionRequest {
  // パラメータなし
}
```

#### レスポンス型

```typescript
interface AppGetVersionResponse {
  success: boolean;
  data?: {
    appVersion: string;
    electronVersion: string;
    nodeVersion: string;
    platform: string;
  };
  error?: string;
}
```

---

### 9.2 IPC-APP-002: メニューアクション

| 項目           | 内容                      |
| -------------- | ------------------------- |
| **チャネルID** | `app:menu-action`         |
| **パターン**   | One-way (Main → Renderer) |
| **優先度**     | Must                      |
| **関連要件**   | FR-ELECTRON-001           |

#### イベントデータ型

```typescript
interface MenuActionEvent {
  action:
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
}
```

---

## 10. contextBridge公開API

### 10.1 API構造

```typescript
// window.electronAPI
interface ElectronAPI {
  // ファイル操作
  file: {
    getTree: (request: GetFileTreeRequest) => Promise<GetFileTreeResponse>;
    read: (request: ReadFileRequest) => Promise<ReadFileResponse>;
    write: (request: WriteFileRequest) => Promise<WriteFileResponse>;
    watchStart: (request: WatchStartRequest) => Promise<WatchStartResponse>;
    watchStop: (watchId: string) => Promise<void>;
    onChanged: (callback: (event: FileChangedEvent) => void) => () => void;
  };

  // ストレージ
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

  // AI
  ai: {
    chat: (request: AIChatRequest) => Promise<AIChatResponse>;
    checkConnection: () => Promise<AICheckConnectionResponse>;
    index: (request: AIIndexRequest) => Promise<AIIndexResponse>;
  };

  // グラフ
  graph: {
    get: () => Promise<GraphGetResponse>;
    refresh: () => Promise<GraphRefreshResponse>;
  };

  // ダッシュボード
  dashboard: {
    getStats: () => Promise<DashboardGetStatsResponse>;
    getActivity: (
      request: DashboardGetActivityRequest,
    ) => Promise<DashboardGetActivityResponse>;
  };

  // ウィンドウ
  window: {
    getState: () => Promise<WindowGetStateResponse>;
    onResized: (callback: (event: WindowResizedEvent) => void) => () => void;
  };

  // アプリ
  app: {
    getVersion: () => Promise<AppGetVersionResponse>;
    onMenuAction: (callback: (event: MenuActionEvent) => void) => () => void;
  };
}
```

### 10.2 型定義ファイル

```typescript
// apps/desktop/src/preload/types.d.ts
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

---

## 11. エラーハンドリング

### 11.1 エラーコード定義

| コード                | 説明                       | 対処                         |
| --------------------- | -------------------------- | ---------------------------- |
| `FILE_NOT_FOUND`      | ファイルが存在しない       | UIでエラー表示               |
| `PERMISSION_DENIED`   | アクセス権限がない         | UIでエラー表示               |
| `ENCODING_ERROR`      | エンコーディングエラー     | UIでエラー表示               |
| `STORE_ERROR`         | ストレージ操作エラー       | リトライ後にエラー表示       |
| `AI_CONNECTION_ERROR` | AI API接続エラー           | 接続状態を更新、リトライ案内 |
| `AI_RATE_LIMIT`       | AI APIレート制限           | 待機時間を表示               |
| `GRAPH_LOAD_ERROR`    | グラフデータ読み込みエラー | リトライ後にエラー表示       |
| `UNKNOWN_ERROR`       | 不明なエラー               | 一般的なエラー表示           |

### 11.2 エラーレスポンス型

```typescript
interface IPCError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}
```

### 11.3 エラーハンドリング方針

| 方針                     | 説明                                           |
| ------------------------ | ---------------------------------------------- |
| **一貫したフォーマット** | 全チャネルで同じエラーレスポンス形式を使用     |
| **ユーザーフレンドリー** | 技術的詳細を隠し、理解しやすいメッセージを表示 |
| **リカバリー情報**       | 可能な場合、復旧手順を提示                     |
| **ログ記録**             | エラーはMain Processでログに記録               |

---

## 12. セキュリティ考慮事項

### 12.1 セキュリティ要件

| 要件ID      | 要件                     | 対策                                   |
| ----------- | ------------------------ | -------------------------------------- |
| SEC-IPC-001 | パス検証                 | ファイルパスをホワイトリストでチェック |
| SEC-IPC-002 | 入力サニタイズ           | 全入力をZodスキーマで検証              |
| SEC-IPC-003 | 機密データ暗号化         | APIキーはsafeStorage APIで暗号化       |
| SEC-IPC-004 | チャネル名検証           | 許可されたチャネル名のみ受け入れ       |
| SEC-IPC-005 | レスポンスフィルタリング | 不要な情報をレスポンスから除外         |

### 12.2 パス検証ルール

```typescript
// 許可されたベースパス
const allowedBasePaths = [app.getPath("documents"), app.getPath("userData")];

// パス検証関数（概念）
function isPathAllowed(filePath: string): boolean {
  const normalizedPath = path.normalize(filePath);
  return allowedBasePaths.some((basePath) =>
    normalizedPath.startsWith(basePath),
  );
}
```

### 12.3 CSP（Content Security Policy）

```javascript
// 推奨CSP設定
const cspPolicy = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"], // Tailwind用
  "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'"], // AI API接続用に調整が必要
};
```

---

## 13. IPCチャネル一覧サマリー

| カテゴリ  | チャネルID               | パターン      | 優先度 |
| --------- | ------------------------ | ------------- | ------ |
| File      | `file:get-tree`          | invoke/handle | Must   |
| File      | `file:read`              | invoke/handle | Must   |
| File      | `file:write`             | invoke/handle | Must   |
| File      | `file:watch-start`       | invoke/handle | Should |
| File      | `file:changed`           | Main→Renderer | Should |
| Store     | `store:get`              | invoke/handle | Must   |
| Store     | `store:set`              | invoke/handle | Must   |
| Store     | `store:get-secure`       | invoke/handle | Must   |
| Store     | `store:set-secure`       | invoke/handle | Must   |
| AI        | `ai:chat`                | invoke/handle | Must   |
| AI        | `ai:check-connection`    | invoke/handle | Must   |
| AI        | `ai:index`               | invoke/handle | Should |
| Graph     | `graph:get`              | invoke/handle | Must   |
| Graph     | `graph:refresh`          | invoke/handle | Should |
| Dashboard | `dashboard:get-stats`    | invoke/handle | Must   |
| Dashboard | `dashboard:get-activity` | invoke/handle | Must   |
| Window    | `window:get-state`       | invoke/handle | Must   |
| Window    | `window:resized`         | Main→Renderer | Must   |
| App       | `app:get-version`        | invoke/handle | Should |
| App       | `app:menu-action`        | Main→Renderer | Must   |

---

## 14. 検証チェックリスト

### 14.1 完了条件

- [x] IPCチャネル一覧が定義されている
- [x] 各チャネルのリクエスト/レスポンス型が定義されている
- [x] contextBridgeで公開するAPI一覧が定義されている
- [x] セキュリティ考慮事項が明記されている

### 14.2 次フェーズへの引き継ぎ

- **T-01-4（IPC設計）**: 本ドキュメントのチャネル定義を基に詳細設計を実施
- **T-02-4（IPCテスト作成）**: 型定義を基にテストケースを作成

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 担当                |
| ---------- | ---------- | -------- | ------------------- |
| 1.0.0      | 2024-12-08 | 初版作成 | @electron-architect |
