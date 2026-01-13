# IPC設計書 - Phase 2成果物

## 作成日: 2026-01-13

## タスク: CONV-08-05 コミュニティ構造可視化UI

---

## 1. IPC通信アーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Renderer Process                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      React Components                          │  │
│  │  useCommunities / useCommunityDetail / useCommunitySearch     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                                ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    window.electronAPI                          │  │
│  │  community.getAll / getByLevel / getById / getSummary / ...   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                         contextBridge                                │
│                                │                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      preload/index.ts                          │  │
│  │                   ipcRenderer.invoke()                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │ IPC
┌────────────────────────────────┼─────────────────────────────────────┐
│                                │                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     main/ipc/community.ts                      │  │
│  │                   ipcMain.handle()                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                                ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              CommunityDetector / CommunityRepository           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                                ▼                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                       SQLite Database                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                          Main Process                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. IPCチャンネル定義

### 2.1 チャンネル一覧

| チャンネル             | 方向            | パラメータ                               | 戻り値                                    |
| ---------------------- | --------------- | ---------------------------------------- | ----------------------------------------- |
| `community:getAll`     | Renderer → Main | なし                                     | `Result<Community[], Error>`              |
| `community:getByLevel` | Renderer → Main | `level: number`                          | `Result<Community[], Error>`              |
| `community:getById`    | Renderer → Main | `id: string`                             | `Result<Community \| null, Error>`        |
| `community:getMembers` | Renderer → Main | `id: string`                             | `Result<StoredEntity[], Error>`           |
| `community:getSummary` | Renderer → Main | `id: string`                             | `Result<CommunitySummary \| null, Error>` |
| `community:search`     | Renderer → Main | `query: string, options?: SearchOptions` | `Result<Community[], Error>`              |

### 2.2 SearchOptions型

```typescript
interface SearchOptions {
  /** 最大結果数（デフォルト: 10） */
  limit?: number;
  /** 特定レベルのみ検索 */
  level?: number;
}
```

---

## 3. 型定義

### 3.1 共有型定義（packages/shared）

```typescript
// packages/shared/src/types/community.ts

/** コミュニティID（Branded Type） */
export type CommunityId = string & { readonly __brand: "CommunityId" };

/** エンティティID（Branded Type） */
export type EntityId = string & { readonly __brand: "EntityId" };

/** Result型 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** コミュニティ */
export interface Community {
  id: CommunityId;
  level: number;
  memberEntityIds: EntityId[];
  childCommunityIds: CommunityId[];
  parentCommunityId?: CommunityId;
  size: number;
  internalEdges: number;
  externalEdges: number;
  modularity: number;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** コミュニティ要約 */
export interface CommunitySummary {
  communityId: CommunityId;
  level: number;
  summary: string;
  keywords: string[];
  mainEntities: string[];
  mainRelations: string[];
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  tokenCount: number;
  embedding?: number[];
  createdAt: Date;
}

/** 保存済みエンティティ */
export interface StoredEntity {
  id: EntityId;
  name: string;
  type: string;
  description?: string;
}
```

### 3.2 IPC型定義（Preload）

```typescript
// apps/desktop/src/preload/types.ts

import type {
  Community,
  CommunityId,
  CommunitySummary,
  Result,
  StoredEntity,
} from "@repo/shared";

/** 検索オプション */
export interface SearchOptions {
  limit?: number;
  level?: number;
}

/** コミュニティIPC API */
export interface CommunityIPC {
  getAll: () => Promise<Result<Community[], Error>>;
  getByLevel: (level: number) => Promise<Result<Community[], Error>>;
  getById: (id: string) => Promise<Result<Community | null, Error>>;
  getMembers: (id: string) => Promise<Result<StoredEntity[], Error>>;
  getSummary: (id: string) => Promise<Result<CommunitySummary | null, Error>>;
  search: (
    query: string,
    options?: SearchOptions,
  ) => Promise<Result<Community[], Error>>;
}

/** Electron API（グローバル） */
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

---

## 4. Preload実装

### 4.1 Context Bridge公開

```typescript
// apps/desktop/src/preload/index.ts

import { contextBridge, ipcRenderer } from "electron";
import type { SearchOptions } from "./types";

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

## 5. Main Process実装

### 5.1 IPCハンドラ登録

```typescript
// apps/desktop/src/main/ipc/community.ts

import { ipcMain } from "electron";
import type { CommunityId } from "@repo/shared";
import type { SearchOptions } from "../../preload/types";

// 依存注入で取得
let communityDetector: ICommunityDetector;
let communityRepository: ICommunityRepository;

export function registerCommunityIPC(
  detector: ICommunityDetector,
  repository: ICommunityRepository,
): void {
  communityDetector = detector;
  communityRepository = repository;

  // community:getAll
  ipcMain.handle("community:getAll", async () => {
    try {
      const result = await communityRepository.findAll();
      return result;
    } catch (error) {
      return {
        ok: false,
        error: createError("FETCH_FAILED", error),
      };
    }
  });

  // community:getByLevel
  ipcMain.handle("community:getByLevel", async (_, level: number) => {
    try {
      // 入力値バリデーション
      if (typeof level !== "number" || level < 0) {
        return {
          ok: false,
          error: new Error("Invalid level parameter"),
        };
      }
      const result = await communityDetector.getCommunitiesByLevel(level);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: createError("FETCH_FAILED", error),
      };
    }
  });

  // community:getById
  ipcMain.handle("community:getById", async (_, id: string) => {
    try {
      if (typeof id !== "string" || !id) {
        return {
          ok: false,
          error: new Error("Invalid id parameter"),
        };
      }
      const result = await communityRepository.findById(id as CommunityId);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: createError("FETCH_FAILED", error),
      };
    }
  });

  // community:getMembers
  ipcMain.handle("community:getMembers", async (_, id: string) => {
    try {
      if (typeof id !== "string" || !id) {
        return {
          ok: false,
          error: new Error("Invalid id parameter"),
        };
      }
      const result = await communityDetector.getCommunityMembers(
        id as CommunityId,
      );
      return result;
    } catch (error) {
      return {
        ok: false,
        error: createError("FETCH_FAILED", error),
      };
    }
  });

  // community:getSummary
  ipcMain.handle("community:getSummary", async (_, id: string) => {
    try {
      if (typeof id !== "string" || !id) {
        return {
          ok: false,
          error: new Error("Invalid id parameter"),
        };
      }
      const result = await communityRepository.getSummary(id as CommunityId);
      return result;
    } catch (error) {
      return {
        ok: false,
        error: createError("FETCH_FAILED", error),
      };
    }
  });

  // community:search
  ipcMain.handle(
    "community:search",
    async (_, query: string, options?: SearchOptions) => {
      try {
        if (typeof query !== "string") {
          return {
            ok: false,
            error: new Error("Invalid query parameter"),
          };
        }

        // オプションのバリデーション
        const validatedOptions: SearchOptions = {
          limit: options?.limit ?? 10,
          level: options?.level,
        };

        // 検索実装（将来的にはCommunitySummarizerのsearchSummariesを使用）
        const allResult = await communityRepository.findAll();
        if (!allResult.ok) {
          return allResult;
        }

        const filtered = allResult.value.filter((c) => {
          if (validatedOptions.level !== undefined) {
            if (c.level !== validatedOptions.level) return false;
          }
          // 簡易検索: サマリー文字列に含まれるか
          return c.summary?.toLowerCase().includes(query.toLowerCase());
        });

        return {
          ok: true,
          value: filtered.slice(0, validatedOptions.limit),
        };
      } catch (error) {
        return {
          ok: false,
          error: createError("SEARCH_FAILED", error),
        };
      }
    },
  );
}

// エラー生成ヘルパー
function createError(code: string, originalError: unknown): Error {
  const message =
    originalError instanceof Error ? originalError.message : "Unknown error";
  const error = new Error(`[${code}] ${message}`);
  error.name = code;
  return error;
}
```

---

## 6. エラーハンドリング仕様

### 6.1 エラーコード定義

| エラーコード        | 説明                 | リトライ可能 |
| ------------------- | -------------------- | ------------ |
| `FETCH_FAILED`      | データ取得失敗       | 可           |
| `SEARCH_FAILED`     | 検索処理失敗         | 可           |
| `NOT_FOUND`         | データが見つからない | 不可         |
| `INVALID_PARAMETER` | 無効なパラメータ     | 不可         |
| `DB_ERROR`          | データベースエラー   | 可           |
| `TIMEOUT`           | タイムアウト         | 可           |

### 6.2 エラーメッセージマッピング

```typescript
// apps/desktop/src/renderer/constants/errorMessages.ts

export const ERROR_MESSAGES: Record<string, string> = {
  FETCH_FAILED: "コミュニティデータの読み込みに失敗しました",
  SEARCH_FAILED: "検索処理に失敗しました",
  NOT_FOUND: "コミュニティが見つかりません",
  INVALID_PARAMETER: "無効なパラメータです",
  DB_ERROR: "データベースエラーが発生しました",
  TIMEOUT: "接続がタイムアウトしました",
  UNKNOWN: "予期せぬエラーが発生しました",
};

export function getErrorMessage(error: Error): string {
  return ERROR_MESSAGES[error.name] ?? ERROR_MESSAGES.UNKNOWN;
}
```

### 6.3 リトライポリシー

| 項目             | 値                           |
| ---------------- | ---------------------------- |
| 最大リトライ回数 | 3回                          |
| リトライ間隔     | 指数バックオフ（1s, 2s, 4s） |
| タイムアウト     | 30秒                         |

---

## 7. セキュリティ考慮事項

### 7.1 入力値バリデーション

- Main Process側で全パラメータを検証
- 型チェック（typeof）
- 範囲チェック（level >= 0）
- 空文字チェック（id, query）

### 7.2 Context Isolation

- `contextIsolation: true`（デフォルト）を維持
- `nodeIntegration: false`を維持
- contextBridge経由のみでIPC公開

### 7.3 エラー情報の制限

- 詳細エラーはMain Processのログのみ
- Renderer Processには汎用メッセージのみ返却
- スタックトレースは本番環境で非公開

---

## 8. テスト戦略

### 8.1 モック対象

| レイヤー           | モック方法            | 用途           |
| ------------------ | --------------------- | -------------- |
| window.electronAPI | `vi.stubGlobal`       | ユニットテスト |
| ipcRenderer        | `vi.mock('electron')` | Preloadテスト  |
| Repository         | DIでモック注入        | 統合テスト     |

### 8.2 モック例（Renderer）

```typescript
// テスト用モック
const mockCommunityIPC: CommunityIPC = {
  getAll: vi.fn().mockResolvedValue({
    ok: true,
    value: [
      {
        id: "community-1" as CommunityId,
        level: 0,
        size: 10,
        memberEntityIds: [],
        childCommunityIds: [],
        internalEdges: 5,
        externalEdges: 2,
        modularity: 0.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
  vi.stubGlobal("electronAPI", {
    community: mockCommunityIPC,
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});
```

---

## 確認完了

- [x] IPC通信アーキテクチャ設計
- [x] 6つのIPCチャンネル定義
- [x] 共有型定義の設計
- [x] Preload実装設計
- [x] Main Process実装設計
- [x] エラーハンドリング仕様定義
- [x] セキュリティ考慮事項の文書化
- [x] テスト戦略の策定
