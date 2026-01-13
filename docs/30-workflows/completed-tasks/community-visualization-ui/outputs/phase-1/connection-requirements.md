# 接続要件書（IPC通信仕様） - Phase 1成果物

## 作成日: 2026-01-13

## タスク: CONV-08-05 コミュニティ構造可視化UI

---

## 1. IPCチャンネル定義

### 1.1 コミュニティデータ取得

| チャンネル             | 方向            | パラメータ                               | 戻り値                                    |
| ---------------------- | --------------- | ---------------------------------------- | ----------------------------------------- |
| `community:getAll`     | Renderer → Main | なし                                     | `Result<Community[], Error>`              |
| `community:getByLevel` | Renderer → Main | `level: number`                          | `Result<Community[], Error>`              |
| `community:getById`    | Renderer → Main | `id: CommunityId`                        | `Result<Community \| null, Error>`        |
| `community:getMembers` | Renderer → Main | `id: CommunityId`                        | `Result<StoredEntity[], Error>`           |
| `community:getSummary` | Renderer → Main | `id: CommunityId`                        | `Result<CommunitySummary \| null, Error>` |
| `community:search`     | Renderer → Main | `query: string, options?: SearchOptions` | `Result<Community[], Error>`              |

### 1.2 SearchOptions型

| プロパティ | 型        | デフォルト | 説明               |
| ---------- | --------- | ---------- | ------------------ |
| `limit`    | `number`  | `10`       | 最大結果数         |
| `level`    | `number?` | -          | 特定レベルのみ検索 |

---

## 2. データフロー図

### 2.1 全体フロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Renderer Process                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                 CommunityVisualization                         │  │
│  │  ┌─────────────────┬─────────────────┬─────────────────────┐  │  │
│  │  │ CommunityFilter │ CommunityGraph  │ CommunityDetailPanel│  │  │
│  │  └────────┬────────┴────────┬────────┴──────────┬──────────┘  │  │
│  │           │                 │                   │              │  │
│  │           └─────────────────┼───────────────────┘              │  │
│  │                             │                                  │  │
│  │                    useCommunities / useCommunityDetail         │  │
│  └─────────────────────────────┼─────────────────────────────────┘  │
│                                │                                     │
│                         window.electronAPI                           │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │ IPC invoke
┌────────────────────────────────┼─────────────────────────────────────┐
│                                │                                     │
│                         ipcMain.handle                               │
│                                │                                     │
│  ┌─────────────────────────────┼─────────────────────────────────┐  │
│  │                             │                                  │  │
│  │  ┌──────────────────────────┴───────────────────────────────┐ │  │
│  │  │               CommunityDetector                          │ │  │
│  │  │  - getCommunitiesForEntity()                             │ │  │
│  │  │  - getCommunitiesByLevel()                               │ │  │
│  │  │  - getCommunityMembers()                                 │ │  │
│  │  └──────────────────────────┬───────────────────────────────┘ │  │
│  │                             │                                  │  │
│  │  ┌──────────────────────────┴───────────────────────────────┐ │  │
│  │  │             ICommunityRepository                         │ │  │
│  │  │  - findByLevel()                                         │ │  │
│  │  │  - findById()                                            │ │  │
│  │  │  - getSummary()                                          │ │  │
│  │  │  - searchSummariesByEmbedding()                          │ │  │
│  │  └──────────────────────────┬───────────────────────────────┘ │  │
│  │                             │                                  │  │
│  └─────────────────────────────┼─────────────────────────────────┘  │
│                                │                                     │
│                         SQLite Database                              │
│                                                                      │
│                         Main Process                                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 コミュニティ取得フロー

```
User → CommunityVisualization
           │
           │ マウント時
           ▼
      useCommunities Hook
           │
           │ window.electronAPI.community.getAll()
           ▼
      IPC: community:getAll
           │
           ▼
      ipcMain.handle('community:getAll')
           │
           ▼
      CommunityDetector.detect() または
      CommunityRepository.findAll()
           │
           ▼
      SQLite Query
           │
           ▼
      Community[] 返却
           │
           ▼
      CommunityGraph に渡して描画
```

### 2.3 詳細パネル表示フロー

```
User → CommunityGraph (ノードクリック)
           │
           │ onSelect(communityId)
           ▼
      CommunityVisualization (状態更新)
           │
           │ selectedCommunityId 設定
           ▼
      CommunityDetailPanel
           │
           │ useCommunityDetail(selectedCommunityId)
           ▼
      並列 IPC 呼び出し:
      ├── community:getById
      ├── community:getSummary
      └── community:getMembers
           │
           ▼
      詳細データ表示
```

---

## 3. エラーハンドリング方針

### 3.1 エラー分類

| カテゴリ     | エラー例           | 対処方法            |
| ------------ | ------------------ | ------------------- |
| 通信エラー   | IPC タイムアウト   | リトライ（最大3回） |
| データエラー | コミュニティ未検出 | 空状態UI表示        |
| 想定外エラー | 予期せぬ例外       | エラーUI + ログ出力 |

### 3.2 リトライポリシー

| 項目             | 値                           |
| ---------------- | ---------------------------- |
| 最大リトライ回数 | 3回                          |
| リトライ間隔     | 指数バックオフ（1s, 2s, 4s） |
| タイムアウト     | 30秒                         |

### 3.3 エラーUI表示

```typescript
// エラー状態の型定義
interface CommunityError {
  code: string; // エラーコード
  message: string; // ユーザー向けメッセージ
  details?: string; // 詳細（開発用）
  retryable: boolean; // リトライ可能か
}

// エラーメッセージマッピング
const ERROR_MESSAGES: Record<string, string> = {
  GRAPH_LOAD_FAILED: "コミュニティデータの読み込みに失敗しました",
  NOT_FOUND: "コミュニティが見つかりません",
  NETWORK_ERROR: "通信エラーが発生しました。再試行してください",
  TIMEOUT: "接続がタイムアウトしました",
  UNKNOWN: "予期せぬエラーが発生しました",
};
```

---

## 4. TypeScript型定義

### 4.1 IPC型定義（Preload）

```typescript
// apps/desktop/src/preload/types.ts

export interface CommunityIPC {
  getAll: () => Promise<Result<Community[], Error>>;
  getByLevel: (level: number) => Promise<Result<Community[], Error>>;
  getById: (id: CommunityId) => Promise<Result<Community | null, Error>>;
  getMembers: (id: CommunityId) => Promise<Result<StoredEntity[], Error>>;
  getSummary: (
    id: CommunityId,
  ) => Promise<Result<CommunitySummary | null, Error>>;
  search: (
    query: string,
    options?: SearchOptions,
  ) => Promise<Result<Community[], Error>>;
}

export interface ElectronAPI {
  community: CommunityIPC;
  // ... 他のIPC
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### 4.2 Context Bridge公開

```typescript
// apps/desktop/src/preload/index.ts

contextBridge.exposeInMainWorld("electronAPI", {
  community: {
    getAll: () => ipcRenderer.invoke("community:getAll"),
    getByLevel: (level: number) =>
      ipcRenderer.invoke("community:getByLevel", level),
    getById: (id: string) => ipcRenderer.invoke("community:getById", id),
    getMembers: (id: string) => ipcRenderer.invoke("community:getMembers", id),
    getSummary: (id: string) => ipcRenderer.invoke("community:getSummary", id),
    search: (query: string, options?: SearchOptions) =>
      ipcRenderer.invoke("community:search", query, options),
  },
});
```

---

## 5. テスト時のモック戦略

### 5.1 モック対象

| レイヤー     | モック方法                        | 用途           |
| ------------ | --------------------------------- | -------------- |
| IPC通信      | `vi.mock` で `window.electronAPI` | ユニットテスト |
| Repository   | DIでモック注入                    | 統合テスト     |
| データベース | インメモリDB                      | E2Eテスト      |

### 5.2 モック例

```typescript
// テスト用モック
const mockCommunityIPC: CommunityIPC = {
  getAll: vi.fn().mockResolvedValue({
    ok: true,
    value: [
      { id: 'community-1', level: 0, size: 10, ... },
      { id: 'community-2', level: 0, size: 5, ... },
    ],
  }),
  getByLevel: vi.fn(),
  getById: vi.fn(),
  getMembers: vi.fn(),
  getSummary: vi.fn(),
  search: vi.fn(),
};

// グローバルセットアップ
beforeAll(() => {
  vi.stubGlobal('electronAPI', {
    community: mockCommunityIPC,
  });
});
```

---

## 確認完了

- [x] IPCチャンネル6種類を定義
- [x] データフロー図を作成
- [x] エラーハンドリング方針を定義
- [x] TypeScript型定義を設計
- [x] テスト時のモック戦略を策定
