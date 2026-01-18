# コード構造分析レポート

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| 作成日     | 2026-01-17             |
| Phase      | 2                      |
| ステータス | 完了                   |
| 作成者     | Claude Code (自動生成) |

---

## 分析対象ファイル

### 1. preload/index.ts

**パス**: `apps/desktop/src/renderer/preload/index.ts`

**構造**:

```typescript
// インターフェース定義 (Line 11-22)
export interface SkillAPI {
  listAvailable: () => Promise<OperationResult<Skill[]>>;
  listImported: () => Promise<OperationResult<Skill[]>>;
  import: (skillIds: string[]) => Promise<OperationResult<void>>;
  remove: (skillId: string) => Promise<OperationResult<void>>;
  getDetail: (skillId: string) => Promise<OperationResult<Skill>>;
}

// 実装 (Line 38-87)
export const skillAPI: SkillAPI = {
  // 各メソッドの実装
};
```

### 2. skillHandlers.ts

**パス**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**構造**:

```typescript
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  // skill:list-available (Line 26-53)
  // skill:list-imported (Line 55-78)
  // skill:import (Line 80-98)
  // skill:remove (Line 100-115)
  // skill:get-detail (Line 117-146)
}
```

---

## メソッド別詳細分析

### listAvailable

| 項目       | preload側                  | handler側                                   |
| ---------- | -------------------------- | ------------------------------------------- |
| チャンネル | `skill:list-available`     | `IPC_CHANNELS.SKILL_LIST_AVAILABLE`         |
| 引数形式   | なし                       | `{ basePath?, forceRefresh? }` (オプション) |
| 戻り値形式 | `OperationResult<Skill[]>` | `{ success, data/error }`                   |
| 修正必要   | **NO** (引数なし)          | -                                           |

### listImported

| 項目       | preload側                  | handler側                          |
| ---------- | -------------------------- | ---------------------------------- |
| チャンネル | `skill:list-imported`      | `IPC_CHANNELS.SKILL_LIST_IMPORTED` |
| 引数形式   | なし                       | なし                               |
| 戻り値形式 | `OperationResult<Skill[]>` | `{ success, data/error }`          |
| 修正必要   | **NO** (引数なし)          | -                                  |

### import

| 項目       | preload側               | handler側                   |
| ---------- | ----------------------- | --------------------------- |
| チャンネル | `skill:import`          | `IPC_CHANNELS.SKILL_IMPORT` |
| 引数形式   | `skillIds` (配列直接)   | `{ skillIds: string[] }`    |
| 戻り値形式 | `OperationResult<void>` | `OperationResult<void>`     |
| 修正必要   | **YES**                 | -                           |

**不一致の詳細**:

```typescript
// preload側 (Line 58-66)
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    skillIds,  // ❌ 配列を直接渡している
  );
}

// handler側 (Line 81-98)
async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
  if (!Array.isArray(args?.skillIds)) {  // ← args.skillIds を期待
    throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
  }
  return skillService.importSkills(args.skillIds);
}
```

### remove

| 項目       | preload側               | handler側                   |
| ---------- | ----------------------- | --------------------------- |
| チャンネル | `skill:remove`          | `IPC_CHANNELS.SKILL_REMOVE` |
| 引数形式   | `skillId` (文字列直接)  | `{ skillId: string }`       |
| 戻り値形式 | `OperationResult<void>` | `OperationResult<void>`     |
| 修正必要   | **YES**                 | -                           |

**不一致の詳細**:

```typescript
// preload側 (Line 68-75)
remove: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:remove",
    skillId, // ❌ 文字列を直接渡している
  );
};

// handler側 (Line 101-115)
async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
  if (typeof args?.skillId !== "string") {
    // ← args.skillId を期待
    throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
  }
  return skillService.removeSkill(args.skillId);
};
```

### getDetail

| 項目       | preload側                | handler側                       |
| ---------- | ------------------------ | ------------------------------- |
| チャンネル | `skill:get-detail`       | `IPC_CHANNELS.SKILL_GET_DETAIL` |
| 引数形式   | `skillId` (文字列直接)   | `{ skillId: string }`           |
| 戻り値形式 | `OperationResult<Skill>` | `{ success, data/error }`       |
| 修正必要   | **YES**                  | -                               |

**不一致の詳細**:

```typescript
// preload側 (Line 77-86)
getDetail: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<Skill>>(
    "skill:get-detail",
    skillId, // ❌ 文字列を直接渡している
  );
};

// handler側 (Line 118-146)
async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
  if (typeof args?.skillId !== "string") {
    // ← args.skillId を期待
    return { success: false, error: "skillId must be a string" };
  }
  // ...
};
```

---

## 影響範囲サマリー

| メソッド      | 修正必要 | 影響コンポーネント |
| ------------- | -------- | ------------------ |
| listAvailable | NO       | -                  |
| listImported  | NO       | -                  |
| import        | **YES**  | Agent画面          |
| remove        | **YES**  | Agent画面          |
| getDetail     | **YES**  | Agent画面          |

---

## 結論

**修正対象**: `apps/desktop/src/renderer/preload/index.ts` の以下3メソッド

- `import` (Line 58-66)
- `remove` (Line 68-75)
- `getDetail` (Line 77-86)

**修正内容**: 引数をオブジェクト形式 `{ skillIds }` / `{ skillId }` で渡すように変更
