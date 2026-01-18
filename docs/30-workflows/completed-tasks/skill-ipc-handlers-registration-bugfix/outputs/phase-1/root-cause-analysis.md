# 原因分析レポート

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| 作成日     | 2026-01-17             |
| Phase      | 1                      |
| ステータス | 完了                   |
| 作成者     | Claude Code (自動生成) |

---

## 原因候補の検証

### 候補1: skillAPI引数形式の不一致

**ステータス**: **確認済み - これが根本原因**

#### 検証結果

**preload/index.ts の実装** (`apps/desktop/src/renderer/preload/index.ts`):

```typescript
// Line 58-63: import関数
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    skillIds,  // ← 配列を直接渡している
  );
}

// Line 68-72: remove関数
remove: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:remove",
    skillId,  // ← 文字列を直接渡している
  );
}

// Line 78-82: getDetail関数
getDetail: async (skillId: string) => {
  return window.electronAPI.invoke<OperationResult<Skill>>(
    "skill:get-detail",
    skillId,  // ← 文字列を直接渡している
  );
}
```

**skillHandlers.ts の期待** (`apps/desktop/src/main/ipc/skillHandlers.ts`):

```typescript
// Line 83: skill:import - オブジェクト形式を期待
async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
  if (!Array.isArray(args?.skillIds)) {
    // ← args.skillIds を期待
    throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
  }
};

// Line 103: skill:remove - オブジェクト形式を期待
async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
  if (typeof args?.skillId !== "string") {
    // ← args.skillId を期待
    throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
  }
};

// Line 120: skill:get-detail - オブジェクト形式を期待
async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
  if (typeof args?.skillId !== "string") {
    // ← args.skillId を期待
    return { success: false, error: "skillId must be a string" };
  }
};
```

#### 不一致の詳細

| チャンネル       | preload側の渡し方  | handler側の期待形式 | 不一致  |
| ---------------- | ------------------ | ------------------- | ------- |
| skill:import     | `skillIds` (配列)  | `{ skillIds: [] }`  | **YES** |
| skill:remove     | `skillId` (文字列) | `{ skillId: "" }`   | **YES** |
| skill:get-detail | `skillId` (文字列) | `{ skillId: "" }`   | **YES** |

---

### 候補2: IPCハンドラー登録漏れの可能性

**ステータス**: **否定 - 問題なし**

#### 検証結果

`apps/desktop/src/main/ipc/index.ts` Line 113 にて:

```typescript
// Register Skill Management handlers (SKILL-IPC-001)
const skillBasePath = path.join(app.getPath("userData"), ".claude", "skills");
const skillStore = new Store({ name: "skills" });
const skillScanner = new SkillScanner(skillBasePath);
const skillParser = new SkillParser();
const skillImportManager = new SkillImportManager(skillStore);
const skillService = new SkillService(
  skillScanner,
  skillParser,
  skillImportManager,
);
registerSkillHandlers(mainWindow, skillService); // ← 正しく呼び出されている
```

`registerSkillHandlers` は `registerAllIpcHandlers` から正しく呼び出されている。

---

### 候補3: ビルド未反映の可能性

**ステータス**: **未検証（候補1で原因特定のため不要）**

コード分析により候補1が根本原因と特定されたため、ビルド未反映の検証は不要。

---

## 根本原因の特定

**根本原因**: **preload/index.ts の skillAPI における引数形式の不一致**

- `skill:import`: 配列 `skillIds` を直接渡しているが、ハンドラーは `{ skillIds: string[] }` を期待
- `skill:remove`: 文字列 `skillId` を直接渡しているが、ハンドラーは `{ skillId: string }` を期待
- `skill:get-detail`: 文字列 `skillId` を直接渡しているが、ハンドラーは `{ skillId: string }` を期待

---

## 影響範囲

| コンポーネント   | 影響                     |
| ---------------- | ------------------------ |
| Agent画面        | スキル一覧が表示されない |
| スキルインポート | 機能しない               |
| スキル削除       | 機能しない               |
| スキル詳細取得   | 機能しない               |

---

## 修正方針

preload/index.ts の以下の関数を修正:

1. `import`: `{ skillIds }` オブジェクト形式で渡す
2. `remove`: `{ skillId }` オブジェクト形式で渡す
3. `getDetail`: `{ skillId }` オブジェクト形式で渡す

---

## 関連ファイル

| ファイル                                     | 修正要否 |
| -------------------------------------------- | -------- |
| `apps/desktop/src/renderer/preload/index.ts` | **要**   |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 不要     |
| `apps/desktop/src/main/ipc/index.ts`         | 不要     |
