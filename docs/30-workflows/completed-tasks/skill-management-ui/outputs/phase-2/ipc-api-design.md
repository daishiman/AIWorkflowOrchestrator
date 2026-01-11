# IPC API設計書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | AGENT-002  |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## 1. 概要

Main ProcessとRenderer Process間のIPC通信を設計する。スキル管理に必要なチャンネル、リクエスト/レスポンス型、セキュリティ要件を定義する。

---

## 2. IPCチャンネル定義

### 2.1 チャンネル一覧

```typescript
// apps/desktop/src/shared/ipc/channels.ts

/**
 * スキル関連のIPCチャンネル
 */
export const SKILL_IPC_CHANNELS = {
  /** 利用可能スキル一覧取得 */
  LIST_AVAILABLE: "skill:list-available",

  /** インポート済みスキル一覧取得 */
  LIST_IMPORTED: "skill:list-imported",

  /** スキルインポート */
  IMPORT: "skill:import",

  /** スキル削除（インポート解除） */
  REMOVE: "skill:remove",

  /** スキル詳細取得 */
  GET_DETAIL: "skill:get-detail",
} as const;

export type SkillIPCChannel =
  (typeof SKILL_IPC_CHANNELS)[keyof typeof SKILL_IPC_CHANNELS];
```

### 2.2 チャンネル詳細

| チャンネル             | 方向            | 用途               | 認証要否 |
| ---------------------- | --------------- | ------------------ | -------- |
| `skill:list-available` | Renderer → Main | 利用可能スキル取得 | 不要     |
| `skill:list-imported`  | Renderer → Main | インポート済み取得 | 不要     |
| `skill:import`         | Renderer → Main | スキルインポート   | 不要     |
| `skill:remove`         | Renderer → Main | スキル削除         | 不要     |
| `skill:get-detail`     | Renderer → Main | スキル詳細取得     | 不要     |

---

## 3. 型定義

### 3.1 リクエスト型

```typescript
// apps/desktop/src/shared/ipc/skill-types.ts

import { z } from "zod";
import type {
  Skill,
  SkillDetail,
  SkillCategory,
} from "@repo/shared/types/skill";

/**
 * スキルインポートリクエスト
 */
export interface SkillImportRequest {
  /** インポートするスキルID一覧 */
  skillIds: string[];
}

export const SkillImportRequestSchema = z.object({
  skillIds: z
    .array(z.string().min(1))
    .min(1, "少なくとも1つのスキルを選択してください"),
});

/**
 * スキル削除リクエスト
 */
export interface SkillRemoveRequest {
  /** 削除するスキルID */
  skillId: string;
}

export const SkillRemoveRequestSchema = z.object({
  skillId: z.string().min(1, "スキルIDは必須です"),
});

/**
 * スキル詳細取得リクエスト
 */
export interface SkillDetailRequest {
  /** スキルID */
  skillId: string;
}

export const SkillDetailRequestSchema = z.object({
  skillId: z.string().min(1, "スキルIDは必須です"),
});
```

### 3.2 レスポンス型

```typescript
/**
 * 基本操作結果
 */
export interface SkillOperationResult {
  /** 成功/失敗 */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  error?: string;
}

export const SkillOperationResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

/**
 * スキル一覧レスポンス
 */
export type SkillListResponse = Skill[];

/**
 * スキル詳細レスポンス
 */
export type SkillDetailResponse = SkillDetail;
```

---

## 4. Preload API

### 4.1 API定義

```typescript
// apps/desktop/src/preload/skill-api.ts

import { ipcRenderer } from "electron";
import { SKILL_IPC_CHANNELS } from "../shared/ipc/channels";
import type {
  Skill,
  SkillDetail,
  SkillImportRequest,
  SkillRemoveRequest,
  SkillDetailRequest,
  SkillOperationResult,
} from "../shared/ipc/skill-types";

/**
 * Skill API（Renderer Processから呼び出し可能）
 */
export interface SkillAPI {
  /**
   * 利用可能スキル一覧を取得
   * @returns スキル一覧
   */
  listAvailable: () => Promise<Skill[]>;

  /**
   * インポート済みスキル一覧を取得
   * @returns インポート済みスキル一覧
   */
  listImported: () => Promise<Skill[]>;

  /**
   * スキルをインポート
   * @param request インポートリクエスト
   * @returns 操作結果
   */
  import: (request: SkillImportRequest) => Promise<SkillOperationResult>;

  /**
   * スキルを削除（インポート解除）
   * @param request 削除リクエスト
   * @returns 操作結果
   */
  remove: (request: SkillRemoveRequest) => Promise<SkillOperationResult>;

  /**
   * スキル詳細を取得
   * @param request 詳細取得リクエスト
   * @returns スキル詳細
   */
  getDetail: (request: SkillDetailRequest) => Promise<SkillDetail>;
}

/**
 * Skill API実装
 */
export const skillAPI: SkillAPI = {
  listAvailable: () => ipcRenderer.invoke(SKILL_IPC_CHANNELS.LIST_AVAILABLE),

  listImported: () => ipcRenderer.invoke(SKILL_IPC_CHANNELS.LIST_IMPORTED),

  import: (request) => ipcRenderer.invoke(SKILL_IPC_CHANNELS.IMPORT, request),

  remove: (request) => ipcRenderer.invoke(SKILL_IPC_CHANNELS.REMOVE, request),

  getDetail: (request) =>
    ipcRenderer.invoke(SKILL_IPC_CHANNELS.GET_DETAIL, request),
};
```

### 4.2 Preloadスクリプト

```typescript
// apps/desktop/src/preload/index.ts

import { contextBridge } from "electron";
import { skillAPI } from "./skill-api";

// 既存のAPIと合わせてエクスポート
contextBridge.exposeInMainWorld("skillAPI", skillAPI);
```

### 4.3 Window拡張型

```typescript
// apps/desktop/src/renderer/types/global.d.ts

import type { SkillAPI } from "../../preload/skill-api";

declare global {
  interface Window {
    skillAPI: SkillAPI;
  }
}

export {};
```

---

## 5. Main Process ハンドラ

### 5.1 ハンドラ実装

```typescript
// apps/desktop/src/main/ipc/skill-handlers.ts

import { ipcMain } from "electron";
import { SKILL_IPC_CHANNELS } from "../../shared/ipc/channels";
import {
  SkillImportRequestSchema,
  SkillRemoveRequestSchema,
  SkillDetailRequestSchema,
} from "../../shared/ipc/skill-types";
import { SkillService } from "../services/skill-service";
import { logger } from "../utils/logger";

/**
 * スキル関連のIPCハンドラを登録
 */
export function registerSkillHandlers(skillService: SkillService): void {
  // 利用可能スキル一覧取得
  ipcMain.handle(SKILL_IPC_CHANNELS.LIST_AVAILABLE, async () => {
    try {
      return await skillService.listAvailableSkills();
    } catch (error) {
      logger.error("Failed to list available skills", error);
      throw error;
    }
  });

  // インポート済みスキル一覧取得
  ipcMain.handle(SKILL_IPC_CHANNELS.LIST_IMPORTED, async () => {
    try {
      return await skillService.listImportedSkills();
    } catch (error) {
      logger.error("Failed to list imported skills", error);
      throw error;
    }
  });

  // スキルインポート
  ipcMain.handle(SKILL_IPC_CHANNELS.IMPORT, async (_event, request) => {
    try {
      const validated = SkillImportRequestSchema.parse(request);
      await skillService.importSkills(validated.skillIds);
      return { success: true };
    } catch (error) {
      logger.error("Failed to import skills", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "インポートに失敗しました",
      };
    }
  });

  // スキル削除
  ipcMain.handle(SKILL_IPC_CHANNELS.REMOVE, async (_event, request) => {
    try {
      const validated = SkillRemoveRequestSchema.parse(request);
      await skillService.removeSkill(validated.skillId);
      return { success: true };
    } catch (error) {
      logger.error("Failed to remove skill", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "削除に失敗しました",
      };
    }
  });

  // スキル詳細取得
  ipcMain.handle(SKILL_IPC_CHANNELS.GET_DETAIL, async (_event, request) => {
    try {
      const validated = SkillDetailRequestSchema.parse(request);
      return await skillService.getSkillDetail(validated.skillId);
    } catch (error) {
      logger.error("Failed to get skill detail", error);
      throw error;
    }
  });
}
```

### 5.2 SkillService インターフェース

```typescript
// apps/desktop/src/main/services/skill-service.ts

import type { Skill, SkillDetail } from "@repo/shared/types/skill";

/**
 * スキルサービス（Main Process）
 */
export interface SkillService {
  /**
   * 利用可能スキル一覧を取得
   * @returns .claude/skills/配下のスキル一覧
   */
  listAvailableSkills(): Promise<Skill[]>;

  /**
   * インポート済みスキル一覧を取得
   * @returns インポート済みスキル一覧
   */
  listImportedSkills(): Promise<Skill[]>;

  /**
   * スキルをインポート
   * @param skillIds インポートするスキルID一覧
   */
  importSkills(skillIds: string[]): Promise<void>;

  /**
   * スキルを削除（インポート解除）
   * @param skillId 削除するスキルID
   */
  removeSkill(skillId: string): Promise<void>;

  /**
   * スキル詳細を取得
   * @param skillId スキルID
   * @returns スキル詳細
   */
  getSkillDetail(skillId: string): Promise<SkillDetail>;
}
```

---

## 6. セキュリティ要件

### 6.1 入力バリデーション

全てのIPCリクエストはZodスキーマでバリデーション:

```typescript
// バリデーション例
const validated = SkillImportRequestSchema.parse(request);

// 不正な入力はZodErrorをスロー
// { skillIds: [] } → ZodError: 少なくとも1つのスキルを選択してください
```

### 6.2 パスサニタイズ

```typescript
// apps/desktop/src/main/utils/path-sanitizer.ts

import path from "path";

const SKILLS_BASE_PATH = ".claude/skills";

/**
 * スキルパスをサニタイズ
 * @param skillPath 入力パス
 * @returns サニタイズ済みパス
 * @throws 不正なパスの場合
 */
export function sanitizeSkillPath(skillPath: string): string {
  // 絶対パスに正規化
  const normalizedPath = path.normalize(skillPath);

  // パストラバーサル攻撃の防止
  if (normalizedPath.includes("..")) {
    throw new Error("Invalid path: path traversal detected");
  }

  // .claude/skills/配下のみ許可
  if (!normalizedPath.startsWith(SKILLS_BASE_PATH)) {
    throw new Error("Invalid path: outside of skills directory");
  }

  return normalizedPath;
}
```

### 6.3 エラーハンドリング

```typescript
// エラーレスポンスには詳細な内部エラーを含めない
return {
  success: false,
  error: "インポートに失敗しました", // 一般的なメッセージ
};

// 詳細はサーバーサイドでログ
logger.error("Failed to import skills", {
  skillIds,
  error: error.stack,
});
```

---

## 7. 永続化

### 7.1 electron-store設定

```typescript
// apps/desktop/src/main/stores/skill-store.ts

import Store from "electron-store";
import type { SkillImportConfig } from "@repo/shared/types/skill";

const schema = {
  skillImportConfig: {
    type: "object" as const,
    properties: {
      importedSkillIds: {
        type: "array" as const,
        items: { type: "string" as const },
        default: [],
      },
      lastUpdated: { type: "string" as const },
      version: { type: "number" as const, default: 1 },
    },
    default: {
      importedSkillIds: [],
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
  },
};

export const skillStore = new Store<{ skillImportConfig: SkillImportConfig }>({
  schema,
  name: "skill-config",
});

/**
 * インポート済みスキルID一覧を取得
 */
export function getImportedSkillIds(): string[] {
  return skillStore.get("skillImportConfig.importedSkillIds", []);
}

/**
 * インポート済みスキルID一覧を保存
 */
export function setImportedSkillIds(ids: string[]): void {
  skillStore.set("skillImportConfig", {
    importedSkillIds: ids,
    lastUpdated: new Date().toISOString(),
    version: 1,
  });
}

/**
 * スキルIDを追加
 */
export function addImportedSkillIds(ids: string[]): void {
  const current = getImportedSkillIds();
  const newIds = [...new Set([...current, ...ids])];
  setImportedSkillIds(newIds);
}

/**
 * スキルIDを削除
 */
export function removeImportedSkillId(id: string): void {
  const current = getImportedSkillIds();
  const newIds = current.filter((skillId) => skillId !== id);
  setImportedSkillIds(newIds);
}
```

---

## 8. シーケンス図

### 8.1 スキル一覧取得

```
┌────────────┐          ┌────────────┐          ┌────────────┐
│  Renderer  │          │   Preload  │          │    Main    │
└─────┬──────┘          └─────┬──────┘          └─────┬──────┘
      │                       │                       │
      │  skillAPI.listImported()                      │
      │───────────────────────>                       │
      │                       │                       │
      │                       │  ipcRenderer.invoke() │
      │                       │───────────────────────>
      │                       │                       │
      │                       │                       │ skillService.listImportedSkills()
      │                       │                       │───────┐
      │                       │                       │       │ skillStore.get()
      │                       │                       │<──────┘
      │                       │                       │
      │                       │                       │ parseSkillFiles()
      │                       │                       │───────┐
      │                       │                       │<──────┘
      │                       │                       │
      │                       │       Skill[]         │
      │                       │<──────────────────────│
      │                       │                       │
      │       Skill[]         │                       │
      │<──────────────────────│                       │
      │                       │                       │
```

### 8.2 スキルインポート

```
┌────────────┐          ┌────────────┐          ┌────────────┐
│  Renderer  │          │   Preload  │          │    Main    │
└─────┬──────┘          └─────┬──────┘          └─────┬──────┘
      │                       │                       │
      │  skillAPI.import({skillIds})                  │
      │───────────────────────>                       │
      │                       │                       │
      │                       │  ipcRenderer.invoke() │
      │                       │───────────────────────>
      │                       │                       │
      │                       │                       │ validate(request)
      │                       │                       │───────┐
      │                       │                       │<──────┘
      │                       │                       │
      │                       │                       │ skillStore.addImportedSkillIds()
      │                       │                       │───────┐
      │                       │                       │<──────┘
      │                       │                       │
      │                       │   {success: true}     │
      │                       │<──────────────────────│
      │                       │                       │
      │   {success: true}     │                       │
      │<──────────────────────│                       │
      │                       │                       │
```

---

## 9. エラーコード

| コード | 説明                       | 対処法           |
| ------ | -------------------------- | ---------------- |
| E001   | スキルパス不正             | パスを確認       |
| E002   | スキルファイル読み取り失敗 | ファイル存在確認 |
| E003   | SKILL.md解析失敗           | フォーマット確認 |
| E004   | インポート設定保存失敗     | ディスク容量確認 |
| E005   | スキルが見つからない       | スキルIDを確認   |

---

## 10. 確認済み

- [x] IPCチャンネル定義が完成している
- [x] リクエスト/レスポンス型が定義されている
- [x] Preload API実装が設計されている
- [x] Main Processハンドラが設計されている
- [x] セキュリティ要件（バリデーション、サニタイズ）が定義されている
- [x] 永続化（electron-store）が設計されている
- [x] シーケンス図が作成されている
