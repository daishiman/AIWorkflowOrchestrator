# Knowledge Studio - 状態管理要件定義書

> **ドキュメントID**: REQ-KS-STATE-001
> **バージョン**: 1.0.0
> **作成日**: 2024-12-08
> **ステータス**: Draft

---

## 1. 概要

### 1.1 目的

本ドキュメントは、Knowledge Studioの状態管理要件を定義する。
グローバル状態、ビューローカル状態、永続化が必要な状態を分類し、Zustand + electron-storeによる状態管理設計の基礎を確立する。

### 1.2 スコープ

| 含む                     | 含まない                  |
| ------------------------ | ------------------------- |
| 状態の分類と一覧         | 具体的なZustandストア設計 |
| 永続化方針の定義         | electron-store実装詳細    |
| 状態更新トリガーの明確化 | IPC通信の詳細設計         |
| 状態間の依存関係         | UI実装詳細                |

### 1.3 参照ドキュメント

- [UI機能要件定義書](./requirements-ui-functions.md) (REQ-KS-UI-001)
- [タスク実行仕様書](./task-knowledge-studio.md)

---

## 2. 状態分類

### 2.1 分類基準

| 分類               | 説明                             | 永続化     | 例                           |
| ------------------ | -------------------------------- | ---------- | ---------------------------- |
| **グローバル状態** | 複数ビューで共有される状態       | 場合による | 現在のビュー、選択中ファイル |
| **ビューローカル** | 特定ビュー内でのみ使用される状態 | 不要       | モーダル開閉、入力フォーム   |
| **永続化状態**     | アプリ終了後も保持が必要な状態   | 必須       | ユーザー設定、ウィンドウ状態 |
| **派生状態**       | 他の状態から計算される状態       | 不要       | フィルタ結果、統計値         |

---

## 3. グローバル状態

### 3.1 ナビゲーション状態

#### STATE-NAV-001: 現在のビュー

| 項目             | 内容                                                         |
| ---------------- | ------------------------------------------------------------ |
| **状態ID**       | `currentView`                                                |
| **型**           | `'dashboard' \| 'editor' \| 'chat' \| 'graph' \| 'settings'` |
| **初期値**       | `'dashboard'`                                                |
| **永続化**       | 必要（次回起動時に復元）                                     |
| **更新トリガー** | App Dockクリック、キーボードショートカット                   |
| **関連要件**     | FR-DOCK-001, FR-DOCK-003                                     |

#### STATE-NAV-002: ビュー履歴

| 項目             | 内容                      |
| ---------------- | ------------------------- |
| **状態ID**       | `viewHistory`             |
| **型**           | `ViewType[]`              |
| **初期値**       | `['dashboard']`           |
| **永続化**       | 不要                      |
| **更新トリガー** | ビュー遷移時              |
| **関連要件**     | 戻る/進む機能（将来拡張） |

---

### 3.2 Editor状態

#### STATE-EDIT-001: 選択中ファイル

| 項目             | 内容                             |
| ---------------- | -------------------------------- |
| **状態ID**       | `selectedFile`                   |
| **型**           | `FileNode \| null`               |
| **初期値**       | `null`                           |
| **永続化**       | 必要（次回起動時に復元）         |
| **更新トリガー** | ファイルツリーでファイルクリック |
| **関連要件**     | FR-EDIT-002, FR-EDIT-006         |

#### STATE-EDIT-002: ファイルツリー

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| **状態ID**       | `fileTree`                     |
| **型**           | `FileNode[]`                   |
| **初期値**       | `[]`                           |
| **永続化**       | 不要（IPC経由で取得）          |
| **更新トリガー** | アプリ起動時、ファイル変更検知 |
| **関連要件**     | FR-EDIT-001                    |

#### STATE-EDIT-003: 展開済みフォルダ

| 項目             | 内容                         |
| ---------------- | ---------------------------- |
| **状態ID**       | `expandedFolders`            |
| **型**           | `Set<string>` (フォルダパス) |
| **初期値**       | `new Set()`                  |
| **永続化**       | 必要（次回起動時に復元）     |
| **更新トリガー** | フォルダクリック             |
| **関連要件**     | FR-EDIT-003                  |

#### STATE-EDIT-004: エディタ内容

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| **状態ID**       | `editorContent`                |
| **型**           | `string`                       |
| **初期値**       | `''`                           |
| **永続化**       | 不要（ファイルシステムに保存） |
| **更新トリガー** | ファイル選択、ユーザー入力     |
| **関連要件**     | FR-EDIT-004, FR-EDIT-005       |

#### STATE-EDIT-005: 未保存フラグ

| 項目             | 内容                       |
| ---------------- | -------------------------- |
| **状態ID**       | `hasUnsavedChanges`        |
| **型**           | `boolean`                  |
| **初期値**       | `false`                    |
| **永続化**       | 不要                       |
| **更新トリガー** | エディタ内容変更、保存完了 |
| **関連要件**     | FR-EDIT-005                |

---

### 3.3 Chat状態

#### STATE-CHAT-001: チャット履歴

| 項目             | 内容                                  |
| ---------------- | ------------------------------------- |
| **状態ID**       | `chatMessages`                        |
| **型**           | `ChatMessage[]`                       |
| **初期値**       | 初期メッセージを含む配列              |
| **永続化**       | 必要（セッション履歴として保存）      |
| **更新トリガー** | メッセージ送信、AI応答受信            |
| **関連要件**     | FR-CHAT-001, FR-CHAT-003, FR-CHAT-006 |

#### STATE-CHAT-002: 入力中メッセージ

| 項目             | 内容         |
| ---------------- | ------------ |
| **状態ID**       | `chatInput`  |
| **型**           | `string`     |
| **初期値**       | `''`         |
| **永続化**       | 不要         |
| **更新トリガー** | ユーザー入力 |
| **関連要件**     | FR-CHAT-002  |

#### STATE-CHAT-003: 送信中フラグ

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| **状態ID**       | `isSending`                    |
| **型**           | `boolean`                      |
| **初期値**       | `false`                        |
| **永続化**       | 不要                           |
| **更新トリガー** | メッセージ送信開始、AI応答完了 |
| **関連要件**     | FR-CHAT-004                    |

#### STATE-CHAT-004: RAG接続状態

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| **状態ID**       | `ragConnectionStatus`                      |
| **型**           | `'connected' \| 'disconnected' \| 'error'` |
| **初期値**       | `'disconnected'`                           |
| **永続化**       | 不要                                       |
| **更新トリガー** | 接続確立、接続エラー、切断                 |
| **関連要件**     | FR-CHAT-005                                |

---

### 3.4 Graph状態

#### STATE-GRAPH-001: グラフノード

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| **状態ID**       | `graphNodes`                   |
| **型**           | `GraphNode[]`                  |
| **初期値**       | `[]`                           |
| **永続化**       | 不要（IPC経由で取得）          |
| **更新トリガー** | グラフデータ取得、リフレッシュ |
| **関連要件**     | FR-GRAPH-002                   |

#### STATE-GRAPH-002: グラフリンク

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| **状態ID**       | `graphLinks`                   |
| **型**           | `GraphLink[]`                  |
| **初期値**       | `[]`                           |
| **永続化**       | 不要（IPC経由で取得）          |
| **更新トリガー** | グラフデータ取得、リフレッシュ |
| **関連要件**     | FR-GRAPH-003                   |

#### STATE-GRAPH-003: アニメーション状態

| 項目             | 内容                   |
| ---------------- | ---------------------- |
| **状態ID**       | `isAnimating`          |
| **型**           | `boolean`              |
| **初期値**       | `true`                 |
| **永続化**       | 不要                   |
| **更新トリガー** | アニメーション切り替え |
| **関連要件**     | FR-GRAPH-004           |

---

### 3.5 Settings状態

#### STATE-SET-001: ユーザープロフィール

| 項目             | 内容                   |
| ---------------- | ---------------------- |
| **状態ID**       | `userProfile`          |
| **型**           | `UserProfile`          |
| **初期値**       | デフォルトプロフィール |
| **永続化**       | 必要                   |
| **更新トリガー** | プロフィール編集、保存 |
| **関連要件**     | FR-SET-001             |

#### STATE-SET-002: APIキー

| 項目             | 内容                       |
| ---------------- | -------------------------- |
| **状態ID**       | `apiKey`                   |
| **型**           | `string`                   |
| **初期値**       | `''`                       |
| **永続化**       | 必要（セキュアストレージ） |
| **更新トリガー** | APIキー入力、保存          |
| **関連要件**     | FR-SET-002                 |

#### STATE-SET-003: 自動同期設定

| 項目             | 内容              |
| ---------------- | ----------------- |
| **状態ID**       | `autoSyncEnabled` |
| **型**           | `boolean`         |
| **初期値**       | `true`            |
| **永続化**       | 必要              |
| **更新トリガー** | トグル切り替え    |
| **関連要件**     | FR-SET-003        |

---

### 3.6 UI状態

#### STATE-UI-001: Dynamic Island

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| **状態ID**       | `dynamicIsland`                                                              |
| **型**           | `{ visible: boolean; status: 'processing' \| 'completed'; message: string }` |
| **初期値**       | `{ visible: false, status: 'completed', message: '' }`                       |
| **永続化**       | 不要                                                                         |
| **更新トリガー** | 処理開始、処理完了                                                           |
| **関連要件**     | FR-ISLAND-001, FR-ISLAND-002                                                 |

#### STATE-UI-002: モバイルドロワー

| 項目             | 内容                                               |
| ---------------- | -------------------------------------------------- |
| **状態ID**       | `mobileDrawerOpen`                                 |
| **型**           | `boolean`                                          |
| **初期値**       | `false`                                            |
| **永続化**       | 不要                                               |
| **更新トリガー** | ハンバーガーメニュークリック、オーバーレイクリック |
| **関連要件**     | FR-EDIT-007, FR-EDIT-008                           |

#### STATE-UI-003: ウィンドウサイズ

| 項目             | 内容                                |
| ---------------- | ----------------------------------- |
| **状態ID**       | `windowSize`                        |
| **型**           | `{ width: number; height: number }` |
| **初期値**       | `{ width: 1200, height: 800 }`      |
| **永続化**       | 必要（次回起動時に復元）            |
| **更新トリガー** | ウィンドウリサイズ                  |
| **関連要件**     | FR-ELECTRON-002, FR-ELECTRON-003    |

#### STATE-UI-004: レスポンシブモード

| 項目             | 内容                                |
| ---------------- | ----------------------------------- |
| **状態ID**       | `responsiveMode`                    |
| **型**           | `'mobile' \| 'tablet' \| 'desktop'` |
| **初期値**       | `'desktop'`                         |
| **永続化**       | 不要（windowSizeから派生）          |
| **更新トリガー** | ウィンドウサイズ変更                |
| **関連要件**     | FR-DOCK-002, FR-RESPONSIVE-001      |

---

### 3.7 Dashboard状態

#### STATE-DASH-001: 統計データ

| 項目             | 内容                         |
| ---------------- | ---------------------------- |
| **状態ID**       | `dashboardStats`             |
| **型**           | `DashboardStats`             |
| **初期値**       | デフォルト統計               |
| **永続化**       | 不要（IPC経由で取得）        |
| **更新トリガー** | ダッシュボード表示、定期更新 |
| **関連要件**     | FR-DASH-002                  |

#### STATE-DASH-002: アクティビティフィード

| 項目             | 内容                             |
| ---------------- | -------------------------------- |
| **状態ID**       | `activityFeed`                   |
| **型**           | `ActivityItem[]`                 |
| **初期値**       | `[]`                             |
| **永続化**       | 不要（IPC経由で取得）            |
| **更新トリガー** | ダッシュボード表示、イベント発生 |
| **関連要件**     | FR-DASH-003                      |

---

## 4. ビューローカル状態

### 4.1 Editor ビュー

| 状態ID            | 型        | 説明                         | 関連要件    |
| ----------------- | --------- | ---------------------------- | ----------- |
| `isEditorFocused` | `boolean` | エディタにフォーカスがあるか | FR-EDIT-004 |
| `searchQuery`     | `string`  | ファイルツリー検索クエリ     | 将来拡張    |

### 4.2 Chat ビュー

| 状態ID               | 型        | 説明                   | 関連要件    |
| -------------------- | --------- | ---------------------- | ----------- |
| `isScrolledToBottom` | `boolean` | チャット履歴が最下部か | FR-CHAT-003 |

### 4.3 Graph ビュー

| 状態ID        | 型                  | 説明             | 関連要件     |
| ------------- | ------------------- | ---------------- | ------------ |
| `canvasSize`  | `{ width, height }` | キャンバスサイズ | FR-GRAPH-005 |
| `hoveredNode` | `GraphNode \| null` | ホバー中のノード | 将来拡張     |

### 4.4 Settings ビュー

| 状態ID            | 型        | 説明                    | 関連要件   |
| ----------------- | --------- | ----------------------- | ---------- |
| `hasChanges`      | `boolean` | 未保存の変更があるか    | FR-SET-004 |
| `isApiKeyVisible` | `boolean` | APIキーを表示しているか | FR-SET-002 |

---

## 5. 永続化戦略

### 5.1 永続化が必要な状態一覧

| 状態ID            | 永続化方法                   | 保存タイミング   | 暗号化 |
| ----------------- | ---------------------------- | ---------------- | ------ |
| `currentView`     | electron-store               | 変更時           | 不要   |
| `selectedFile`    | electron-store               | 変更時           | 不要   |
| `expandedFolders` | electron-store               | 変更時           | 不要   |
| `chatMessages`    | electron-store               | メッセージ追加時 | 不要   |
| `userProfile`     | electron-store               | 保存ボタン押下   | 不要   |
| `apiKey`          | electron-store (safeStorage) | 保存ボタン押下   | 必要   |
| `autoSyncEnabled` | electron-store               | 変更時           | 不要   |
| `windowSize`      | electron-store               | リサイズ完了時   | 不要   |

### 5.2 永続化設計方針

#### PERSIST-001: 即座永続化

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| **対象** | currentView, expandedFolders               |
| **方針** | 状態変更時に即座にelectron-storeに保存     |
| **理由** | 頻繁な変更でも軽量、ユーザー体験に影響なし |

#### PERSIST-002: デバウンス永続化

| 項目     | 内容                             |
| -------- | -------------------------------- |
| **対象** | windowSize                       |
| **方針** | 変更後500msのデバウンス後に保存  |
| **理由** | リサイズ中の頻繁な書き込みを防止 |

#### PERSIST-003: 明示的永続化

| 項目     | 内容                         |
| -------- | ---------------------------- |
| **対象** | userProfile, apiKey          |
| **方針** | 保存ボタン押下時のみ保存     |
| **理由** | ユーザーの意図した保存を尊重 |

#### PERSIST-004: セッション永続化

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| **対象** | chatMessages                        |
| **方針** | 最大100件まで保存、古いものから削除 |
| **理由** | ストレージ容量の考慮                |

### 5.3 セキュアストレージ

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| **対象** | apiKey                               |
| **方法** | Electron safeStorage API経由で暗号化 |
| **理由** | APIキーは機密情報のため暗号化が必須  |

---

## 6. 状態更新パターン

### 6.1 同期更新

| パターン         | 説明                       | 例                              |
| ---------------- | -------------------------- | ------------------------------- |
| 直接更新         | アクションで即座に状態更新 | ビュー切り替え、入力フィールド  |
| トランザクション | 複数状態を同時更新         | ファイル選択（選択+内容ロード） |

### 6.2 非同期更新

| パターン | 説明                       | 例                           |
| -------- | -------------------------- | ---------------------------- |
| IPC経由  | Main Processからデータ取得 | ファイルツリー、グラフデータ |
| API経由  | 外部APIからデータ取得      | AI応答、RAGデータ            |

### 6.3 状態更新フロー例

#### ビュー切り替え

```
1. ユーザーがApp Dockアイコンをクリック
2. setCurrentView(newView) を呼び出し
3. 状態更新 → UIリレンダー
4. electron-storeに永続化
```

#### ファイル選択

```
1. ユーザーがファイルをクリック
2. setSelectedFile(file) を呼び出し
3. IPC経由でファイル内容を要求
4. loadFileContent() でMain Processに送信
5. 応答を受けて setEditorContent(content)
6. electron-storeに selectedFile を永続化
```

#### チャットメッセージ送信

```
1. ユーザーが送信ボタンをクリック
2. addMessage(userMessage) で履歴に追加
3. setIsSending(true) で送信中状態に
4. IPC経由でAI APIを呼び出し
5. 応答を受けて addMessage(aiResponse)
6. setIsSending(false) で送信完了
7. electron-storeに chatMessages を永続化
```

---

## 7. 型定義

### 7.1 基本型

```typescript
// ビュー型
type ViewType = "dashboard" | "editor" | "chat" | "graph" | "settings";

// ファイルノード型
interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  isRagIndexed?: boolean;
}

// チャットメッセージ型
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// グラフノード型
interface GraphNode {
  id: string;
  label: string;
  type: "main" | "document" | "concept";
  x: number;
  y: number;
  size: number;
  vx?: number;
  vy?: number;
}

// グラフリンク型
interface GraphLink {
  source: string;
  target: string;
}

// ユーザープロフィール型
interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro" | "enterprise";
}

// ダッシュボード統計型
interface DashboardStats {
  totalDocs: number;
  ragIndexed: number;
  pending: number;
  storageUsed: number;
  storageTotal: number;
}

// アクティビティアイテム型
interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
}
```

### 7.2 ストア型

```typescript
// グローバルストア型
interface AppStore {
  // ナビゲーション
  currentView: ViewType;
  viewHistory: ViewType[];

  // Editor
  selectedFile: FileNode | null;
  fileTree: FileNode[];
  expandedFolders: Set<string>;
  editorContent: string;
  hasUnsavedChanges: boolean;

  // Chat
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  ragConnectionStatus: "connected" | "disconnected" | "error";

  // Graph
  graphNodes: GraphNode[];
  graphLinks: GraphLink[];
  isAnimating: boolean;

  // Settings
  userProfile: UserProfile;
  apiKey: string;
  autoSyncEnabled: boolean;

  // UI
  dynamicIsland: DynamicIslandState;
  mobileDrawerOpen: boolean;
  windowSize: { width: number; height: number };
  responsiveMode: "mobile" | "tablet" | "desktop";

  // Dashboard
  dashboardStats: DashboardStats;
  activityFeed: ActivityItem[];
}
```

---

## 8. 派生状態

### 8.1 派生状態一覧

| 派生状態            | 元の状態         | 計算ロジック                                        |
| ------------------- | ---------------- | --------------------------------------------------- |
| `responsiveMode`    | `windowSize`     | width < 768 → mobile, < 1024 → tablet, else desktop |
| `isDesktop`         | `windowSize`     | width >= 768                                        |
| `isMobile`          | `windowSize`     | width < 768                                         |
| `storagePercentage` | `dashboardStats` | (storageUsed / storageTotal) \* 100                 |
| `hasMessages`       | `chatMessages`   | chatMessages.length > 0                             |

---

## 9. 状態間依存関係

### 9.1 依存関係図

```
windowSize
    └─→ responsiveMode
           └─→ mobileDrawerOpen (モバイル時のみ有効)

selectedFile
    └─→ editorContent (ファイル内容をロード)
           └─→ hasUnsavedChanges

currentView
    └─→ dynamicIsland (ビュー遷移時に表示可能)
```

### 9.2 依存更新ルール

| 依存元        | 依存先         | 更新ルール                          |
| ------------- | -------------- | ----------------------------------- |
| windowSize    | responsiveMode | windowSize変更時に自動計算          |
| selectedFile  | editorContent  | selectedFile変更時にIPC経由でロード |
| chatInput送信 | chatMessages   | 送信時にメッセージ追加              |

---

## 10. 検証チェックリスト

### 10.1 完了条件

- [x] グローバル状態の一覧が定義されている
- [x] ビューローカル状態の一覧が定義されている
- [x] 永続化が必要な状態（electron-store）が特定されている
- [x] 状態更新のトリガーが明確化されている

### 10.2 次フェーズへの引き継ぎ

- **T-01-3（状態管理設計）**: 本ドキュメントの型定義を基にZustandストア構造を設計
- **T-00-3（IPC通信要件定義）**: 状態取得/更新に必要なIPCチャネルを定義

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 担当           |
| ---------- | ---------- | -------- | -------------- |
| 1.0.0      | 2024-12-08 | 初版作成 | @state-manager |
