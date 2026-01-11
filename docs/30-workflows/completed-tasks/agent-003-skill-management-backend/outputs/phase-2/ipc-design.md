# IPC設計書

## メタ情報

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| Phase  | 2                                            |
| タスク | タスク3: IPC設計                             |
| 作成日 | 2026-01-11                                   |
| 配置先 | `apps/desktop/src/main/ipc/agentHandlers.ts` |

---

## 1. IPCチャネル定義

### 1.1 チャネル定数

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // 既存チャネル...

  // Agent関連
  AGENT_SCAN_AVAILABLE_SKILLS: "agent:scan-available-skills",
  AGENT_GET_IMPORTED_SKILLS: "agent:get-imported-skills",
  AGENT_IMPORT_SKILLS: "agent:import-skills",
  AGENT_REMOVE_SKILL: "agent:remove-skill",
  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
```

### 1.2 チャネル一覧

| チャネル名                    | 方向          | 説明                   |
| ----------------------------- | ------------- | ---------------------- |
| `agent:scan-available-skills` | Renderer→Main | 利用可能スキル一覧取得 |
| `agent:get-imported-skills`   | Renderer→Main | インポート済みスキル   |
| `agent:import-skills`         | Renderer→Main | スキルインポート       |
| `agent:remove-skill`          | Renderer→Main | スキル削除             |
| `agent:get-skill-detail`      | Renderer→Main | スキル詳細取得         |

---

## 2. IPCハンドラー設計

### 2.1 ハンドラー登録関数

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts

import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import { validateIpcSender } from "../infrastructure/security/ipc-validator";
import type { IPCError } from "@repo/shared/types/agent";

/**
 * Agent関連のIPCハンドラーを登録
 * @param skillService スキルサービスインスタンス
 */
export function registerAgentHandlers(skillService: SkillService): void {
  registerScanAvailableSkillsHandler(skillService);
  registerGetImportedSkillsHandler(skillService);
  registerImportSkillsHandler(skillService);
  registerRemoveSkillHandler(skillService);
  registerGetSkillDetailHandler(skillService);
}

/**
 * ハンドラーの登録解除
 */
export function unregisterAgentHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_SCAN_AVAILABLE_SKILLS);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_GET_IMPORTED_SKILLS);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_IMPORT_SKILLS);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_REMOVE_SKILL);
  ipcMain.removeHandler(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL);
}
```

### 2.2 個別ハンドラー

#### agent:scan-available-skills

```typescript
function registerScanAvailableSkillsHandler(skillService: SkillService): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_SCAN_AVAILABLE_SKILLS,
    async (
      event: IpcMainInvokeEvent,
      args?: { basePath?: string; forceRefresh?: boolean },
    ) => {
      // IPC sender検証
      if (!validateIpcSender(event.sender)) {
        const error: IPCError = {
          code: "AUTH_ERROR",
          message: "Unauthorized IPC call",
        };
        throw error;
      }

      try {
        // basePathが指定されている場合はスキャナーのパスを更新
        if (args?.basePath) {
          skillService.setBasePath(args.basePath);
        }

        return await skillService.scanAvailableSkills(args?.forceRefresh);
      } catch (e) {
        const error: IPCError = {
          code: "INTERNAL_ERROR",
          message: e instanceof Error ? e.message : String(e),
        };
        throw error;
      }
    },
  );
}
```

#### agent:get-imported-skills

```typescript
function registerGetImportedSkillsHandler(skillService: SkillService): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_IMPORTED_SKILLS,
    async (event: IpcMainInvokeEvent) => {
      // IPC sender検証
      if (!validateIpcSender(event.sender)) {
        const error: IPCError = {
          code: "AUTH_ERROR",
          message: "Unauthorized IPC call",
        };
        throw error;
      }

      try {
        return await skillService.getImportedSkills();
      } catch (e) {
        const error: IPCError = {
          code: "INTERNAL_ERROR",
          message: e instanceof Error ? e.message : String(e),
        };
        throw error;
      }
    },
  );
}
```

#### agent:import-skills

```typescript
function registerImportSkillsHandler(skillService: SkillService): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_IMPORT_SKILLS,
    async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
      // IPC sender検証
      if (!validateIpcSender(event.sender)) {
        const error: IPCError = {
          code: "AUTH_ERROR",
          message: "Unauthorized IPC call",
        };
        throw error;
      }

      // 入力バリデーション
      if (!args || !Array.isArray(args.skillIds)) {
        const error: IPCError = {
          code: "VALIDATION_ERROR",
          message: "skillIds must be an array",
        };
        throw error;
      }

      // 各skillIdのバリデーション
      for (const skillId of args.skillIds) {
        if (typeof skillId !== "string" || skillId.length === 0) {
          const error: IPCError = {
            code: "VALIDATION_ERROR",
            message: "Each skillId must be a non-empty string",
          };
          throw error;
        }
        if (skillId.length > 64) {
          const error: IPCError = {
            code: "VALIDATION_ERROR",
            message: "skillId must be 64 characters or less",
          };
          throw error;
        }
      }

      try {
        return await skillService.importSkills(args.skillIds);
      } catch (e) {
        const error: IPCError = {
          code: "INTERNAL_ERROR",
          message: e instanceof Error ? e.message : String(e),
        };
        throw error;
      }
    },
  );
}
```

#### agent:remove-skill

```typescript
function registerRemoveSkillHandler(skillService: SkillService): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_REMOVE_SKILL,
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      // IPC sender検証
      if (!validateIpcSender(event.sender)) {
        const error: IPCError = {
          code: "AUTH_ERROR",
          message: "Unauthorized IPC call",
        };
        throw error;
      }

      // 入力バリデーション
      if (!args || typeof args.skillId !== "string") {
        const error: IPCError = {
          code: "VALIDATION_ERROR",
          message: "skillId must be a string",
        };
        throw error;
      }

      if (args.skillId.length === 0) {
        const error: IPCError = {
          code: "VALIDATION_ERROR",
          message: "skillId must not be empty",
        };
        throw error;
      }

      try {
        return await skillService.removeSkill(args.skillId);
      } catch (e) {
        const error: IPCError = {
          code: "INTERNAL_ERROR",
          message: e instanceof Error ? e.message : String(e),
        };
        throw error;
      }
    },
  );
}
```

#### agent:get-skill-detail

```typescript
function registerGetSkillDetailHandler(skillService: SkillService): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      // IPC sender検証
      if (!validateIpcSender(event.sender)) {
        const error: IPCError = {
          code: "AUTH_ERROR",
          message: "Unauthorized IPC call",
        };
        throw error;
      }

      // 入力バリデーション
      if (!args || typeof args.skillId !== "string") {
        const error: IPCError = {
          code: "VALIDATION_ERROR",
          message: "skillId must be a string",
        };
        throw error;
      }

      if (args.skillId.length === 0) {
        const error: IPCError = {
          code: "VALIDATION_ERROR",
          message: "skillId must not be empty",
        };
        throw error;
      }

      try {
        const skill = await skillService.getSkillById(args.skillId);
        if (!skill) {
          const error: IPCError = {
            code: "NOT_FOUND",
            message: `Skill not found: ${args.skillId}`,
          };
          throw error;
        }
        return skill;
      } catch (e) {
        if ((e as IPCError).code) {
          throw e; // IPCErrorはそのままスロー
        }
        const error: IPCError = {
          code: "INTERNAL_ERROR",
          message: e instanceof Error ? e.message : String(e),
        };
        throw error;
      }
    },
  );
}
```

---

## 3. Preload API設計

### 3.1 API定義

```typescript
// apps/desktop/src/preload/index.ts に追加

import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels";
import type {
  Skill,
  SkillScanResult,
  ImportResult,
  RemoveResult,
} from "@repo/shared/types/agent";

/**
 * Agent API
 * Renderer ProcessからMain ProcessのSkillServiceにアクセス
 */
const agentAPI = {
  /**
   * 利用可能なスキルをスキャン
   * @param basePath スキャン対象ディレクトリ（省略時はデフォルトパス）
   * @param forceRefresh キャッシュを無視して再スキャン
   */
  scanAvailableSkills: (
    basePath?: string,
    forceRefresh?: boolean,
  ): Promise<SkillScanResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_SCAN_AVAILABLE_SKILLS, {
      basePath,
      forceRefresh,
    }),

  /**
   * インポート済みスキル一覧を取得
   */
  getImportedSkills: (): Promise<Skill[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_IMPORTED_SKILLS),

  /**
   * スキルをインポート
   * @param skillIds インポートするスキルIDの配列
   */
  importSkills: (skillIds: string[]): Promise<ImportResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_IMPORT_SKILLS, { skillIds }),

  /**
   * スキルを削除
   * @param skillId 削除するスキルID
   */
  removeSkill: (skillId: string): Promise<RemoveResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_REMOVE_SKILL, { skillId }),

  /**
   * スキル詳細を取得
   * @param skillId スキルID
   */
  getSkillDetail: (skillId: string): Promise<Skill | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL, { skillId }),
};

// contextBridgeで公開
contextBridge.exposeInMainWorld("electronAPI", {
  // 既存API...
  agent: agentAPI,
});
```

### 3.2 型定義（Window拡張）

```typescript
// apps/desktop/src/preload/types.d.ts

import type {
  Skill,
  SkillScanResult,
  ImportResult,
  RemoveResult,
} from "@repo/shared/types/agent";

declare global {
  interface Window {
    electronAPI: {
      // 既存API...

      agent: {
        scanAvailableSkills: (
          basePath?: string,
          forceRefresh?: boolean,
        ) => Promise<SkillScanResult>;
        getImportedSkills: () => Promise<Skill[]>;
        importSkills: (skillIds: string[]) => Promise<ImportResult>;
        removeSkill: (skillId: string) => Promise<RemoveResult>;
        getSkillDetail: (skillId: string) => Promise<Skill | null>;
      };
    };
  }
}

export {};
```

---

## 4. エラーハンドリング

### 4.1 エラーレスポンス形式

すべてのIPCハンドラーは、エラー発生時に`IPCError`形式でエラーをスローする。

```typescript
interface IPCError {
  code:
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "AUTH_ERROR"
    | "INTERNAL_ERROR"
    | "PATH_TRAVERSAL";
  message: string;
  details?: unknown;
}
```

### 4.2 エラーコード一覧

| コード             | 説明                             | 発生条件                     |
| ------------------ | -------------------------------- | ---------------------------- |
| `VALIDATION_ERROR` | 入力バリデーションエラー         | 引数の型・値が不正           |
| `NOT_FOUND`        | リソースが見つからない           | 指定されたスキルが存在しない |
| `AUTH_ERROR`       | 認証エラー（IPC sender検証失敗） | DevTools/不正ウィンドウ      |
| `INTERNAL_ERROR`   | 内部エラー                       | 予期せぬ例外                 |
| `PATH_TRAVERSAL`   | パストラバーサル検出             | 不正なパス指定               |

### 4.3 Renderer側でのエラーハンドリング例

```typescript
// Renderer Process
try {
  const result = await window.electronAPI.agent.scanAvailableSkills();
  console.log("Scanned skills:", result.skills);
} catch (error) {
  const ipcError = error as IPCError;
  switch (ipcError.code) {
    case "AUTH_ERROR":
      console.error("Unauthorized access");
      break;
    case "VALIDATION_ERROR":
      console.error("Invalid input:", ipcError.message);
      break;
    default:
      console.error("Error:", ipcError.message);
  }
}
```

---

## 5. シーケンス図

### 5.1 スキルスキャン

```
┌────────┐      ┌─────────┐      ┌─────────────┐      ┌─────────────┐
│Renderer│      │ Preload │      │ IPC Handler │      │SkillService │
└───┬────┘      └────┬────┘      └──────┬──────┘      └──────┬──────┘
    │                │                   │                    │
    │ scanAvailableSkills()              │                    │
    │───────────────>│                   │                    │
    │                │ invoke            │                    │
    │                │──────────────────>│                    │
    │                │                   │ validateIpcSender  │
    │                │                   │──────┐             │
    │                │                   │<─────┘             │
    │                │                   │                    │
    │                │                   │ scanAvailableSkills│
    │                │                   │───────────────────>│
    │                │                   │                    │
    │                │                   │  SkillScanResult   │
    │                │                   │<───────────────────│
    │                │ result            │                    │
    │                │<──────────────────│                    │
    │ SkillScanResult│                   │                    │
    │<───────────────│                   │                    │
    │                │                   │                    │
```

### 5.2 スキルインポート

```
┌────────┐      ┌─────────┐      ┌─────────────┐      ┌─────────────┐
│Renderer│      │ Preload │      │ IPC Handler │      │SkillService │
└───┬────┘      └────┬────┘      └──────┬──────┘      └──────┬──────┘
    │                │                   │                    │
    │ importSkills([ids])                │                    │
    │───────────────>│                   │                    │
    │                │ invoke            │                    │
    │                │──────────────────>│                    │
    │                │                   │ validateIpcSender  │
    │                │                   │──────┐             │
    │                │                   │<─────┘             │
    │                │                   │ validateInput      │
    │                │                   │──────┐             │
    │                │                   │<─────┘             │
    │                │                   │                    │
    │                │                   │ importSkills       │
    │                │                   │───────────────────>│
    │                │                   │                    │
    │                │                   │   ImportResult     │
    │                │                   │<───────────────────│
    │                │ result            │                    │
    │                │<──────────────────│                    │
    │ ImportResult   │                   │                    │
    │<───────────────│                   │                    │
    │                │                   │                    │
```

---

## 6. 初期化とライフサイクル

### 6.1 アプリケーション起動時

```typescript
// apps/desktop/src/main/index.ts

import { app } from "electron";
import Store from "electron-store";
import { SkillService } from "./services/skill/SkillService";
import { SkillScanner } from "./services/skill/SkillScanner";
import { SkillParser } from "./services/skill/SkillParser";
import { SkillImportManager } from "./services/skill/SkillImportManager";
import { registerAgentHandlers } from "./ipc/agentHandlers";

// デフォルトのスキルパス
const DEFAULT_SKILL_PATH = `${app.getPath("home")}/.claude/skills`;

// Storeの初期化
const store = new Store<{ importedSkillIds: string[]; skillBasePath: string }>({
  defaults: {
    importedSkillIds: [],
    skillBasePath: DEFAULT_SKILL_PATH,
  },
});

// サービスの初期化
const skillScanner = new SkillScanner(store.get("skillBasePath"));
const skillParser = new SkillParser();
const skillImportManager = new SkillImportManager(store);
const skillService = new SkillService(
  skillScanner,
  skillParser,
  skillImportManager,
);

// IPCハンドラーの登録
app.whenReady().then(() => {
  registerAgentHandlers(skillService);
});
```

### 6.2 アプリケーション終了時

```typescript
// apps/desktop/src/main/index.ts

import { unregisterAgentHandlers } from "./ipc/agentHandlers";

app.on("before-quit", () => {
  unregisterAgentHandlers();
});
```
