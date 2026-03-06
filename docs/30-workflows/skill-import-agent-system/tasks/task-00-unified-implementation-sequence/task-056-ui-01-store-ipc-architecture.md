# TASK-UI-01-STORE-IPC-ARCHITECTURE: Store・IPC アーキテクチャ設計

## 1. メタ情報

| 項目         | 値                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-01-STORE-IPC-ARCHITECTURE                                                           |
| タスク名     | Store・IPCアーキテクチャ設計（既存Slice棚卸し・新規Slice・IPCチャネル・通知・ViewType拡張） |
| 優先度       | 最高（全画面の前提条件）                                                                    |
| 複雑度       | high                                                                                        |
| 依存タスク   | TASK-UI-00-DESIGN-FOUNDATION（共通コンポーネント型定義参照）                                |
| ブロック対象 | 02〜09の全タスク                                                                            |

## 2. 目的

UI刷新に伴い必要となる Zustand Store の拡張計画と IPC チャネル契約を設計する。既存15スライスの棚卸し、新規/拡張スライスの設計、全体依存関係図、新規IPCチャネル定義、通知サブシステム、ViewType拡張を一元管理し、後続の全画面仕様（02〜09）が本仕様を参照してデータフローを構築する。

## 3. Why（なぜ必要か）

1. **Slice膨張防止**: 15スライスが既に存在し、無計画な追加は AppStore 型の肥大化とテスト困難を招く
2. **IPC契約の先行定義**: 画面側が必要とするデータの取得方法を先に合意することで、Main Process 実装との並行開発が可能になる
3. **P31対策の徹底**: 新規スライスは最初から個別セレクタパターンで設計し、合成Hook起因の無限ループを防止
4. **ViewType拡張の一括化**: 分散的にViewTypeを追加するとswitch文の修正漏れが発生するため、一括設計が必要

## 4. 実行タスク

### Task 1: 既存Slice棚卸し

#### 1.1 スライス一覧（2026-02-21時点）

ディレクトリ: `apps/desktop/src/renderer/store/slices/`

| #   | Slice名                       | ファイル                       | 行数 | 責務                                          | テスト有無 |
| --- | ----------------------------- | ------------------------------ | ---- | --------------------------------------------- | ---------- |
| 1   | **NavigationSlice**           | `navigationSlice.ts`           | 52   | ビュー切替、履歴管理                          | ✅         |
| 2   | **EditorSlice**               | `editorSlice.ts`               | 78   | ファイル選択、ツリー展開                      | ✅         |
| 3   | **ChatSlice**                 | `chatSlice.ts`                 | 313  | チャットメッセージ送受信                      | ✅         |
| 4   | **GraphSlice**                | `graphSlice.ts`                | 52   | グラフノード・リンク管理                      | ✅         |
| 5   | **SettingsSlice**             | `settingsSlice.ts`             | 124  | ユーザープロフィール、テーマ、API設定         | ✅         |
| 6   | **UISlice**                   | `uiSlice.ts`                   | 122  | DynamicIsland、レスポンシブ、モバイルドロワー | ✅         |
| 7   | **DashboardSlice**            | `dashboardSlice.ts`            | 54   | 統計情報、アクティビティフィード              | ✅         |
| 8   | **AuthSlice**                 | `authSlice.ts`                 | 796  | 認証状態、セッション、プロフィール            | ✅         |
| 9   | **AuthModeSlice**             | `authModeSlice.ts`             | 419  | 認証モード（subscription/api-key）            | ―          |
| 10  | **WorkspaceSlice**            | `workspaceSlice.ts`            | 391  | ワークスペース CRUD、ファイルツリー           | ✅         |
| 11  | **FileSelectionSlice**        | `fileSelectionSlice.ts`        | 213  | ファイル選択、フィルタリング                  | ✅         |
| 12  | **SystemPromptTemplateSlice** | `systemPromptTemplateSlice.ts` | 225  | プロンプトテンプレート CRUD                   | ✅         |
| 13  | **LLMSlice**                  | `llmSlice.ts`                  | 221  | LLMプロバイダー、モデル選択                   | ―          |
| 14  | **AgentSlice**                | `agentSlice.ts`                | 766  | エージェント実行、スキル管理（統合済み）      | ―          |
| 15  | **PermissionHistorySlice**    | `permissionHistorySlice.ts`    | 81   | 権限リクエスト履歴                            | ―          |

**features/ 内（store外のSlice）:**

| #   | Slice名           | ファイル                                              | 行数 | 責務                     |
| --- | ----------------- | ----------------------------------------------------- | ---- | ------------------------ |
| 16  | **ChatEditSlice** | `features/workspace-chat-edit/store/chatEditSlice.ts` | N/A  | チャットでのファイル編集 |

**AppStore 合成型**: 16スライスの交差型 (`&` 合成)

```typescript
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice &
  AuthSlice &
  AuthModeSlice &
  WorkspaceSlice &
  FileSelectionSlice &
  SystemPromptTemplateSlice &
  LLMSlice &
  AgentSlice &
  ChatEditSlice &
  PermissionHistorySlice;
```

**永続化フィールド** (`partialize`):

- `currentView`, `selectedFile`, `expandedFolders`, `userProfile`, `autoSyncEnabled`, `windowSize`, `permissionHistory`

#### 1.2 既存セレクタ数

`store/index.ts` のエクスポートセレクタ数: **約100個**（P31対策の個別セレクタ含む）

- NavigationSlice: 1個
- EditorSlice: 3個
- ChatSlice: 2個
- UISlice: 4個
- DashboardSlice: 2個
- AuthSlice: 10個
- AuthModeSlice: 22個（`@deprecated` 合成Hook + 個別セレクタ）
- WorkspaceSlice: 11個
- FileSelectionSlice: 17個
- LLMSlice: 20個（`@deprecated` 合成Hook + 個別セレクタ）
- SkillSlice（AgentSlice統合）: 27個（`@deprecated` 合成Hook + 個別セレクタ）
- AgentViewSlice: 12個

---

### Task 2: 新規 / 拡張 Slice 設計

#### 2.1 設計方針

| 方針                  | 根拠                                      |
| --------------------- | ----------------------------------------- |
| 個別セレクタのみ      | P31: 合成Hook無限ループ防止               |
| props-down, events-up | コンポーネントはstoreに直接依存しない     |
| 最小スライス原則      | 1スライス = 1ドメイン責務                 |
| 既存拡張 > 新規作成   | 責務が既存Sliceと重複する場合は拡張を優先 |

#### 2.2 NavigationSlice — 拡張（既存: 52行）

**現状**: `currentView: ViewType` + `viewHistory` + `setCurrentView` / `goBack` / `canGoBack`

**拡張内容**: ViewType拡張に伴う追加（Task 6で詳述）

```typescript
// 拡張後の型（変更分のみ）
// ViewType自体の拡張は store/types.ts で行う
// NavigationSlice の interface 変更は不要（ViewType型の拡張が自動反映）
```

**判断**: NavigationSlice 自体のインターフェース変更は不要。ViewType union型の拡張のみで対応可能。

#### 2.3 NotificationSlice — 新規作成

**判断根拠**: 通知は AuthSlice（プロフィール通知設定）とは独立した「アプリ内通知」ドメイン。既存のどのSliceにも該当しない。

> **⚠️ 正本**: NotificationSlice の型定義・インターフェース・セレクタの詳細設計は **TASK-UI-08（08-notification-center.md）セクション6** を参照。本セクションでは契約概要のみ記載する。

**契約概要**:

| 項目           | 値                                                             |
| -------------- | -------------------------------------------------------------- | ------ |
| 型名           | `Notification`（`AppNotification` ではない）                   |
| 種別フィールド | `type: NotificationType`（`level` ではない）                   |
| Source型       | Discriminated Union（`{ kind: "skill_execution"; ... }` 形式） |
| Popover状態    | `isPopoverOpen`（`isNotificationPopoverOpen` ではない）        |
| 削除アクション | `deleteNotification`（`removeNotification` ではない）          |
| フィルタ状態   | `activeFilter: NotificationType                                | "all"` |

**実装メモ**:

- 通知上限: 最大100件。超過時は古い既読通知から削除
- `unreadCount` はderived stateだが、パフォーマンスのため `addNotification` / `markAsRead` 時に同期更新
- 永続化: `notifications` を `partialize` に追加（アプリ再起動後も未読通知を保持）
- 個別セレクタのみexport（P31対策）— 詳細は08参照

#### 2.4 SkillCenter — 新規Slice不要（useState管理）

**判断**: **新規Sliceは作成しない**

> **⚠️ 正本**: TASK-UI-05（05-skill-center-view.md）セクション6.1 で明示的に「SkillCenter は**新規スライスを作成しない**」と決定済み。

**理由**:

1. SkillCenter のUI状態（Inspector開閉、タブ選択、削除確認ダイアログ）は画面固有であり、他画面と共有する必要がない
2. スキルデータは既存 `agentSlice` のセレクタ（`useImportedSkills`, `useSkillFilter` 等）から取得で十分
3. 03-state-management.md の「コンポーネント固有UI → `useState`」原則に適合

**状態管理方針**:

```typescript
// SkillCenterView 内の useState（05-skill-center-view.md セクション6.2 参照）
interface SkillCenterLocalState {
  isInspectorOpen: boolean;
  inspectedSkillName: string | null;
  activeInspectorTab: "info" | "code";
  isDeleteConfirmOpen: boolean;
  deleteTargetSkillName: string | null;
}
```

**データフロー**: スキルデータは既存の AgentSlice セレクタ（`useAvailableSkillsMetadata`, `useImportedSkills`, `useSkillFilter`, `useSkillCategory` 等）から取得。UI表示状態は `useState` で管理。

#### 2.5 履歴検索 — historySearchSlice（06に委譲）

**判断**: 汎用 SearchSlice は作成しない。履歴検索は **TASK-UI-06（06-history-search-view.md）** で `historySearchSlice` として設計する。

> **⚠️ 正本**: historySearchSlice の型定義（`HistoryItem`, `HistoryItemType`, `HistorySearchFilters`）・インターフェース・11個の個別セレクタは **TASK-UI-06 セクション6** を参照。

**判断根拠**:

1. 検索は「HistorySearchView 固有の機能」であり、横断的な汎用検索ドメインとして独立させるほどの再利用性がない
2. 06の historySearchSlice は検索クエリ、フィルタ、結果、統計情報を一貫して管理しており、責務が明確
3. 別途 SearchSlice を定義すると、06の historySearchSlice と状態が重複し、どちらが正本か不明確になる
4. 将来的にワークスペース検索が必要になった場合は、workspaceSearchSlice として独立設計する（YAGNI原則）

**IPCチャネル**: 06が定義する `history:search`, `history:get-stats` を使用（kebab-case統一）

#### 2.6 WorkspaceSlice — 既存拡張（追加フィールドなし）

**現状分析**: WorkspaceSlice (391行) は既にフォルダCRUD、ファイルツリー読み込み、永続化を完備。

**判断**: UI刷新に際して WorkspaceSlice 自体への変更は不要。Workspace画面固有のUI状態（アクティブタブ、プレビューモード等）は Workspace ビューコンポーネントの `useState` で管理する（03-state-management.md「コンポーネント固有UI → `useState`」原則）。

---

### Task 3: Slice依存関係図（ASCII）

```
┌─────────────────────────────────────────────────────────────┐
│                      AppStore (合成型)                        │
│                                                               │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐  │
│  │ Navigation   │ │ UI           │ │ Settings              │  │
│  │ Slice        │ │ Slice        │ │ Slice                 │  │
│  │ ·currentView │ │ ·responsive  │ │ ·themeMode            │  │
│  │ ·viewHistory │ │ ·dynamicIsland│ │ ·userProfile         │  │
│  └──────┬───────┘ └──────────────┘ └───────────────────────┘  │
│         │ ViewType                                             │
│  ┌──────┴────────────────────────────────────────────────┐    │
│  │           ViewType → View Routing (App.tsx)            │    │
│  │  dashboard│editor│chat│graph│agent│settings            │    │
│  │  + workspace│skillCenter│historySearch (新規)          │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─ 認証ドメイン ───────────────────────────────┐            │
│  │ AuthSlice (796行)  ←→  AuthModeSlice (419行) │            │
│  │ ·isAuthenticated       ·mode                  │            │
│  │ ·profile               ·status                │            │
│  └───────────────────────────────────────────────┘            │
│                                                               │
│  ┌─ コンテンツドメイン ──────────────────────────────────┐   │
│  │                                                        │   │
│  │  EditorSlice (78行)   ChatSlice (313行)               │   │
│  │  ·selectedFile         ·chatMessages                   │   │
│  │       │                      │                         │   │
│  │       └──────────┬───────────┘                         │   │
│  │                  │                                     │   │
│  │  WorkspaceSlice (391行)   ChatEditSlice               │   │
│  │  ·workspace              ·chatEditContext              │   │
│  │  ·folderFileTrees                                     │   │
│  │                                                        │   │
│  │  GraphSlice (52行)   FileSelectionSlice (213行)       │   │
│  │  ·graphNodes          ·selectedFiles                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─ AIドメイン ──────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  LLMSlice (221行)     AgentSlice (766行)              │   │
│  │  ·providers            ·skills (統合済み)              │   │
│  │  ·selectedModel        ·executionStatus                │   │
│  │       │                      │                         │   │
│  │       └──────────┬───────────┘                         │   │
│  │                  │reads                                │   │
│  │  SkillCenter: 新規Slice不要（useState管理、05参照）   │   │
│  │                                                        │   │
│  │  SystemPromptTemplateSlice (225行)                    │   │
│  │  ·templates                                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─ 横断ドメイン ────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  NotificationSlice (新規、詳細は08参照)               │   │
│  │  ·notifications  ·unreadCount  ·isPopoverOpen          │   │
│  │       ↑ receives from                                  │   │
│  │  AgentSlice, WorkspaceSlice, Auth                      │   │
│  │                                                        │   │
│  │  historySearchSlice (新規、詳細は06参照)              │   │
│  │  ·searchQuery  ·searchResults  ·searchStats            │   │
│  │       ↑ queries: ChatSlice, AgentSlice                 │   │
│  │                                                        │   │
│  │  PermissionHistorySlice (81行)                        │   │
│  │  ·permissionHistory                                    │   │
│  │                                                        │   │
│  │  DashboardSlice (54行)                                │   │
│  │  ·dashboardStats                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

凡例:
  ←→  双方向依存（同一ドメイン内でのみ許可）
  ←── 読み取り依存（データは参照元Sliceから取得）
  ↑    イベント/データ受信
```

**Slice数合計**: 既存16 + 新規2（Notification, historySearch） = **18スライス**

---

### Task 4: 新規IPCチャネル契約

#### 4.1 設計原則

- チャネル名は `IPC_CHANNELS` 定数で管理（P27: ハードコード文字列禁止）
- 引数名はセマンティクスに一致（P45: 契約ドリフト防止）
- 文字列引数は3段バリデーション（P42: `typeof` → `=== ""` → `.trim() === ""`）
- Main側ハンドラで送信元ウィンドウを検証（04-electron-security.md）

#### 4.2 新規チャネル定義

##### 通知チャネル（新規）

```typescript
// channels.ts に追加
// Notification operations
NOTIFICATION_GET_HISTORY: "notification:get-history",
NOTIFICATION_MARK_READ: "notification:mark-read",
NOTIFICATION_MARK_ALL_READ: "notification:mark-all-read",
NOTIFICATION_CLEAR: "notification:clear",
// Notification events (main → renderer)
NOTIFICATION_NEW: "notification:new",
```

**型定義:**

```typescript
// invoke チャネル
interface NotificationGetHistoryArgs {
  limit?: number; // デフォルト: 50
  offset?: number; // デフォルト: 0
}
interface NotificationGetHistoryResult {
  notifications: AppNotification[];
  totalCount: number;
}

interface NotificationMarkReadArgs {
  notificationId: string; // P42: typeof + empty + trim 検証
}

// on チャネル（Main → Renderer push）
interface NotificationNewEvent {
  notification: AppNotification;
}
```

##### 履歴検索チャネル（新規）

> **⚠️ 正本**: 履歴検索IPCチャネルの詳細（型定義・引数・戻り値）は **TASK-UI-06（06-history-search-view.md）セクション7** を参照。

```typescript
// channels.ts に追加（06準拠のkebab-case命名）
// History Search operations
HISTORY_SEARCH: "history:search",
HISTORY_GET_STATS: "history:get-stats",
```

**備考**: 01で当初定義していた `search:history:execute` / `search:history:index-status` は06の設計に統一。チャネル名は `{ドメイン}:{操作}` のkebab-case形式（P27準拠）。

##### SkillCenter 詳細チャネル（既存で十分）

SkillCenter が必要とするデータは既存チャネルで取得可能:

| 必要データ             | 既存チャネル         | 備考                 |
| ---------------------- | -------------------- | -------------------- |
| スキル一覧             | `SKILL_LIST`         | 実装済み             |
| スキル詳細             | `SKILL_GET_DETAIL`   | 実装済み             |
| インポート済みスキル   | `SKILL_GET_IMPORTED` | 実装済み             |
| スキルファイル読み取り | `SKILL_READ_FILE`    | TASK-9A-B で実装済み |
| スキルインポート       | `SKILL_IMPORT`       | UT-FIX済み           |
| スキル削除             | `SKILL_REMOVE`       | UT-FIX済み           |
| スキルスキャン         | `SKILL_SCAN`         | 実装済み             |
| スキル分析             | `SKILL_ANALYZE`      | TASK-9C で実装済み   |

**結論**: SkillCenter 用の新規IPCチャネルは不要。

#### 4.3 チャネル登録先

新規チャネルの追加箇所:

| ファイル                               | 変更内容                                     |
| -------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/preload/channels.ts` | `IPC_CHANNELS` に定数追加                    |
| `apps/desktop/src/preload/channels.ts` | `ALLOWED_INVOKE_CHANNELS` に追加             |
| `apps/desktop/src/preload/channels.ts` | `ALLOWED_ON_CHANNELS` に追加（pushイベント） |
| `packages/shared/src/ipc/channels.ts`  | 共有チャネル定数に追加（必要時）             |
| `apps/desktop/src/main/ipc/`           | ハンドラ実装ファイル新規作成                 |
| `apps/desktop/src/preload/api/`        | Preload API追加                              |

---

### Task 5: 通知サブシステム設計

#### 5.1 通知生成フロー

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Process                             │
│                                                               │
│  AgentExecutor ──────┐                                       │
│  SkillService ───────┤                                       │
│  WorkspaceWatcher ───┤── NotificationService ──→ IPC push    │
│  AuthService ────────┤     ·create()              │          │
│  SystemEvents ───────┘     ·persist()             │          │
│                            ·emit()                │          │
│                                                    ↓          │
│                        NOTIFICATION_NEW channel               │
└────────────────────────────────────────────────────┬──────────┘
                                                     │
┌────────────────────────────────────────────────────┴──────────┐
│                   Renderer Process                             │
│                                                                │
│  Preload Bridge ──→ notificationListener ──→ NotificationSlice│
│                     (safeOn)                 ·addNotification()│
│                                                    │          │
│                                              ┌─────┴──────┐  │
│                                              │  消費先     │  │
│                                              ├─────────────┤  │
│                                              │ GlobalNav   │  │
│                                              │  Badge count│  │
│                                              │  Popover    │  │
│                                              ├─────────────┤  │
│                                              │ DynamicIsland│ │
│                                              │  Toast表示  │  │
│                                              └─────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

#### 5.2 通知の種類と生成トリガー

| 生成元           | トリガー                     | NotificationLevel | 表示方法      |
| ---------------- | ---------------------------- | ----------------- | ------------- |
| AgentExecutor    | 実行完了                     | `success`         | Toast + Badge |
| AgentExecutor    | 実行エラー                   | `error`           | Toast + Badge |
| AgentExecutor    | 権限リクエスト               | `warning`         | Toast + Badge |
| SkillService     | インポート完了               | `success`         | Toast + Badge |
| SkillService     | インポートエラー             | `error`           | Toast + Badge |
| WorkspaceWatcher | ファイル変更検知（外部変更） | `info`            | Badge のみ    |
| AuthService      | セッション期限切れ間近       | `warning`         | Toast + Badge |
| AuthService      | 認証状態変更                 | `info`            | Badge のみ    |
| System           | アプリ更新利用可能           | `info`            | Toast + Badge |

#### 5.3 通知永続化

- **保存先**: Main Process の electron-store（JSON）
- **保持期間**: 最大7日間、または最大100件
- **起動時読み込み**: `NOTIFICATION_GET_HISTORY` で最新50件を取得
- **既読同期**: `NOTIFICATION_MARK_READ` で Main Process 側の永続データを更新

---

### Task 6: ViewType拡張設計

#### 6.1 現在のViewType

```typescript
// store/types.ts (現在)
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent";
```

#### 6.2 拡張後のViewType

```typescript
// store/types.ts (拡張後)
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent"
  // --- UI Overhaul で追加 ---
  | "workspace"
  | "skillCenter"
  | "historySearch";
```

#### 6.3 変更が必要なファイル一覧

ViewType を参照している箇所を一括で更新する必要がある:

| #   | ファイル                                 | 変更内容                                                     |
| --- | ---------------------------------------- | ------------------------------------------------------------ |
| 1   | `store/types.ts`                         | ViewType union型に3値追加                                    |
| 2   | `store/slices/navigationSlice.ts`        | 変更不要（ViewType型の拡張が自動反映）                       |
| 3   | `components/organisms/AppDock/index.tsx` | ViewType重複定義を削除 → `store/types.ts` から import に変更 |
| 4   | `components/organisms/AppDock/index.tsx` | `navItems` 配列に3項目追加                                   |
| 5   | `App.tsx`                                | `renderView()` switch文に3ケース追加                         |
| 6   | `store/index.ts`                         | 永続化 `partialize` は `currentView` で既に対応済み          |

#### 6.4 AppDock navItems 拡張

> **⚠️ 正本**: ショートカットキー割当は **TASK-UI-02（02-global-nav-core.md）セクション4.2 NAV_SECTIONS** が正本。
> Step 3（AppDock削除）完了後は GlobalNavStrip の NAV_SECTIONS が唯一のナビ定義となる。

```typescript
// 02-global-nav-core.md NAV_SECTIONS 準拠のショートカット配列
// ※ AppDock の navItems は Step 3 で削除される。ここは移行中の参考記載。
const navItems: NavItem[] = [
  // --- メインセクション ---
  {
    id: "dashboard",
    icon: "LayoutGrid",
    label: "ダッシュボード",
    shortcut: "Cmd+1",
  },
  {
    id: "workspace",
    icon: "FolderTree",
    label: "ワークスペース",
    shortcut: "Cmd+2",
  },
  { id: "chat", icon: "MessageCircle", label: "チャット", shortcut: "Cmd+3" },
  { id: "agent", icon: "Bot", label: "エージェント", shortcut: "Cmd+4" },
  {
    id: "skillCenter",
    icon: "Puzzle",
    label: "スキルセンター",
    shortcut: "Cmd+5",
  },
  { id: "historySearch", icon: "Search", label: "履歴検索", shortcut: "Cmd+6" },
  // --- サブセクション ---
  { id: "graph", icon: "Network", label: "グラフ", shortcut: "Cmd+7" },
  { id: "editor", icon: "FileCode", label: "エディタ", shortcut: "Cmd+8" },
  // --- フッター ---
  { id: "settings", icon: "Settings", label: "設定", shortcut: "Cmd+," },
];
```

#### 6.5 App.tsx switch文拡張

```typescript
const renderView = () => {
  switch (currentView) {
    case "dashboard":     return <DashboardView />;
    case "editor":        return <EditorView />;
    case "chat":          return <ChatView />;
    case "graph":         return <GraphView />;
    case "agent":         return <AgentView />;
    case "settings":      return <SettingsView />;
    // --- 新規追加 ---
    case "workspace":     return <WorkspaceView />;
    case "skillCenter":   return <SkillCenterView />;
    case "historySearch": return <HistorySearchView />;
    default:
      // TypeScript exhaustive check
      const _exhaustive: never = currentView;
      return <DashboardView />;
  }
};
```

#### 6.6 ViewType重複定義の解消

**問題**: `AppDock/index.tsx` (行6-12) で ViewType が重複定義されている。

```typescript
// 現在（AppDock/index.tsx 行6-12）— 重複定義
export type ViewType =
  | "dashboard"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent";

// 修正後 — store/types.ts から import
import type { ViewType } from "../../../store/types";
// ローカルの ViewType 定義を削除
```

**注意**: この変更は ViewType 拡張と同時に実施し、一度の変更で完了させる。

---

### Task 7: AppStore 拡張

#### 7.1 新規Slice登録

```typescript
// store/index.ts — 追加
import {
  createNotificationSlice,
  type NotificationSlice,
} from "./slices/notificationSlice";
import {
  createHistorySearchSlice,
  type HistorySearchSlice,
} from "./slices/historySearchSlice";

// AppStore 型拡張
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice &
  AuthSlice &
  AuthModeSlice &
  WorkspaceSlice &
  FileSelectionSlice &
  SystemPromptTemplateSlice &
  LLMSlice &
  AgentSlice &
  ChatEditSlice &
  PermissionHistorySlice &
  // --- 新規（UI Overhaul） ---
  NotificationSlice & // 詳細: 08-notification-center.md
  HistorySearchSlice; // 詳細: 06-history-search-view.md
// ※ SkillCenterSlice は不要（05: useState管理）
```

#### 7.2 永続化フィールド拡張

```typescript
partialize: (state) => ({
  // 既存
  currentView: state.currentView,
  selectedFile: state.selectedFile,
  expandedFolders: state.expandedFolders,
  userProfile: state.userProfile,
  autoSyncEnabled: state.autoSyncEnabled,
  windowSize: state.windowSize,
  permissionHistory: state.permissionHistory,
  // --- 新規 ---
  notifications: state.notifications,  // 未読通知保持
}),
```

---

## 5. 成果物

| #   | 成果物                       | パス                                                               |
| --- | ---------------------------- | ------------------------------------------------------------------ |
| 1   | NotificationSlice            | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`      |
| 2   | HistorySearchSlice           | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`     |
| 3   | ViewType拡張                 | `apps/desktop/src/renderer/store/types.ts`                         |
| 4   | AppStore拡張                 | `apps/desktop/src/renderer/store/index.ts`                         |
| 5   | IPCチャネル追加              | `apps/desktop/src/preload/channels.ts`                             |
| 6   | 通知ハンドラ                 | `apps/desktop/src/main/ipc/notificationHandlers.ts`                |
| 7   | 履歴検索ハンドラ             | `apps/desktop/src/main/ipc/historySearchHandlers.ts`               |
| 8   | Preload API追加              | `apps/desktop/src/preload/api/notification-api.ts`                 |
| 9   | 各Sliceテスト                | 各Sliceと同階層の `.test.ts`                                       |
| 10  | AppDock ViewType重複定義解消 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |

> **注**: SkillCenterSlice は不要（05: `useState` 管理）。SearchSlice は不要（06: `historySearchSlice` に統一）。

## 6. 完了条件

- [ ] 2新規Slice（Notification, HistorySearch）が実装・テスト済み
- [ ] SkillCenterSlice が存在しないこと（05準拠: `useState` 管理）
- [ ] 全セレクタが個別セレクタパターン（P31対策済み）
- [ ] ViewType に `workspace | skillCenter | historySearch` が追加されている
- [ ] AppDock の ViewType重複定義が解消されている
- [ ] App.tsx の switch文が全ViewTypeを網羅（exhaustive check付き）
- [ ] 新規IPCチャネル（notification:\*, history:search, history:get-stats）が `IPC_CHANNELS` に追加されている
- [ ] IPCハンドラの引数バリデーションが P42 準拠（3段バリデーション）
- [ ] ショートカットキー割当がTASK-UI-02のNAV_SECTIONSと完全一致すること
- [ ] 全テストが `cd apps/desktop && pnpm vitest run` で PASS
- [ ] `pnpm typecheck` が全パッケージで PASS

## 7. 既知の落とし穴・教訓

| Pitfall | 内容                      | 対策                                                |
| ------- | ------------------------- | --------------------------------------------------- |
| P31     | Zustand合成Hook無限ループ | 全新規Sliceで個別セレクタのみをexport               |
| P42     | .trim()バリデーション漏れ | IPC引数は3段バリデーション必須                      |
| P44     | IPCインターフェース不整合 | Preload APIとハンドラの引数型を同時定義             |
| P45     | IPC引数命名の契約ドリフト | 引数名はセマンティクスに一致させる                  |
| P23     | API二重定義の型管理       | 型定義変更は全箇所同時更新                          |
| P32     | 型定義の二箇所同時更新    | shared/types + preload/types を同時変更             |
| P5      | リスナー二重登録          | notification listener は useEffect + cleanup で管理 |
| 新規    | AppStore型の肥大化        | 18スライスの交差型。TypeScript コンパイル速度に注意 |
| 新規    | 二重定義パターン          | 01は契約ポインタ、画面タスク(05,06,08)が実装正本    |

## 8. 参照資料

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — Zustand設計原則、P31対策、Slice境界
- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` — レイヤー構成、SoC、IPCデータフロー
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — P42/P44/P45を含むIPC実装パターン
- `.claude/skills/aiworkflow-requirements/references/api-endpoints.md` — IPC命名規約、Desktop IPC APIサマリー
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` — IPC契約、Preload型、チャネル設計
- `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` — Electron APIセキュリティ設定
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — sender検証、whitelist、safeInvoke/safeOn
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` — AppDock/ナビ導線の正本
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — エラーコードとResult契約
- `apps/desktop/src/renderer/store/index.ts` — 既存Store構成
- `apps/desktop/src/preload/channels.ts` — 既存IPCチャネル定義
- `apps/desktop/src/main/ipc/` — ハンドラー配置と登録状況

## 9. Atent Team（SubAgent）分割仕様書

本タスクは関心ごとを分離し、以下のSubAgent単位で仕様書を作成する。

| SubAgent | 役割                                   | 仕様書                                                                                                  |
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| A        | Store棚卸し・状態境界設計              | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`                           |
| B        | IPC契約・Preload・セキュリティ         | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md` |
| C        | Notification/HistorySearchドメイン統合 | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                      |
| D        | ViewType拡張・ルーティング・ナビ整合   | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                             |
| E        | 統合ゲート・仕様同期監査               | `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md`                   |

統合インデックス: `task-056-ui-01-store-ipc-architecture/index.md`

## 10. 直列/並列実行マトリクス

| タスク                         | 実行種別 | 依存       | ブロック解除条件               |
| ------------------------------ | -------- | ---------- | ------------------------------ |
| A: Store Slice Baseline        | 並列可能 | TASK-UI-00 | Slice境界とP31対策が確定       |
| B: IPC Contract Security       | 並列可能 | TASK-UI-00 | IPC契約とP42検証順序が確定     |
| C: Notification/History Domain | 直列     | A, B       | 2ドメイン契約の整合が完了      |
| D: ViewType Routing Nav        | 直列     | A          | ViewType拡張とswitch網羅が確定 |
| E: Integration Gate            | 直列     | C, D       | 後続UIタスク参照の正本化が完了 |

## 11. 今回の完了定義（仕様書作成フェーズ）

- [x] ブランチ作成（仕様書作成専用）
- [x] `task-056` 専用ディレクトリ作成
- [x] SubAgent分割仕様書5本の作成
- [x] aiworkflow-requirements正本参照の反映
- [x] 実装タスクは未着手（仕様書作成のみ）
