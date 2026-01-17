# タスク仕様書: スキルIPCハンドラー登録バグ修正

## 概要

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | SKILL-IPC-FIX-001           |
| 優先度   | 高                          |
| 種別     | バグ修正                    |
| 影響範囲 | Agent画面（スキル管理機能） |

## 問題の症状

Agent画面を開くと無限ローディング状態になり、スキル一覧が表示されない。

## 根本原因分析

### 原因候補1: skillAPI引数形式の不一致

**ファイル:** `apps/desktop/src/renderer/preload/index.ts`

```typescript
// 現在のコード
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    skillIds,  // ← 配列を直接渡している
  );
}
```

**ファイル:** `apps/desktop/src/main/ipc/skillHandlers.ts`

```typescript
// ハンドラー側
async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
  // args = { skillIds: [...] } を期待
  // 実際に受け取る: args = [...] (配列そのもの)
};
```

### 原因候補2: IPC ハンドラー登録漏れ

`registerSkillHandlers` が呼ばれる前にエラーが発生している可能性。

### 原因候補3: ビルド未反映

修正後のコードがビルドに含まれていない可能性。

## 修正タスク

### タスク1: skillAPI引数形式の修正

**対象ファイル:** `apps/desktop/src/renderer/preload/index.ts`

**修正内容:**

```typescript
// Before
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    skillIds,
  );
}

// After
import: async (skillIds: string[]) => {
  return window.electronAPI.invoke<OperationResult<void>>(
    "skill:import",
    { skillIds },  // オブジェクトとして渡す
  );
}
```

**同様に修正が必要な箇所:**

- `remove`: `skillId` → `{ skillId }`
- `getDetail`: `skillId` → `{ skillId }`

### タスク2: IPC ハンドラー登録確認ログ追加

**対象ファイル:** `apps/desktop/src/main/ipc/index.ts`

**修正内容:**

```typescript
// registerSkillHandlers呼び出し前後にログ追加
console.log("[IPC] Registering skill handlers...");
registerSkillHandlers(mainWindow, skillService);
console.log("[IPC] Skill handlers registered successfully");
```

### タスク3: skillHandlers 登録確認

**対象ファイル:** `apps/desktop/src/main/ipc/skillHandlers.ts`

**確認内容:**

- 各ハンドラーが正しく登録されているか
- `ipcMain.handle` が正しく呼ばれているか

### タスク4: ビルド再実行と動作確認

1. `pnpm build` で完全ビルド
2. Electron アプリを再起動
3. Agent画面を開いてスキル一覧が表示されるか確認

## 受け入れ基準

| #   | 基準                              | 検証方法         |
| --- | --------------------------------- | ---------------- |
| 1   | Agent画面でスキル一覧が表示される | 手動確認         |
| 2   | スキルのインポートが動作する      | 手動確認         |
| 3   | スキルの削除が動作する            | 手動確認         |
| 4   | 全テストがパスする                | `pnpm test`      |
| 5   | 型チェックがパスする              | `pnpm typecheck` |

## 関連ファイル

| ファイル                                              | 役割                      |
| ----------------------------------------------------- | ------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                  | IPC ハンドラー登録        |
| `apps/desktop/src/main/ipc/skillHandlers.ts`          | スキル管理 IPC ハンドラー |
| `apps/desktop/src/renderer/preload/index.ts`          | skillAPI 定義             |
| `apps/desktop/src/renderer/views/AgentView/index.tsx` | Agent 画面 UI             |
| `apps/desktop/src/preload/channels.ts`                | IPC チャンネル定義        |

## 参照資料

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`
