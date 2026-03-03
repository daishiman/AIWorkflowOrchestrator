# インターフェース設計書 — skill:getFileTree IPC実装

## メタ情報

| 項目      | 内容                      |
| --------- | ------------------------- |
| タスクID  | UT-UI-05A-GETFILETREE-001 |
| Phase     | 2（設計）                 |
| 作成日    | 2026-03-03                |
| 前提Phase | Phase 1（要件定義書）     |
| Issue     | #948                      |

## 1. IPC チャンネルインターフェース

### チャンネル定義

| 定数名                | チャンネル文字列    | 方向            | パターン      |
| --------------------- | ------------------- | --------------- | ------------- |
| `SKILL_GET_FILE_TREE` | `skill:getFileTree` | Renderer → Main | invoke/handle |

### リクエスト/レスポンス契約

**リクエスト:**

```typescript
// Preload → Main（ipcRenderer.invoke 経由）
{
  skillName: string; // スキル名（P42準拠: 非null, 非空, 非スペースのみ）
}
```

**成功レスポンス:**

```typescript
{
  success: true,
  data: SkillFileTreeNode[]  // ツリー構造のファイルノード配列
}
```

**失敗レスポンス:**

```typescript
{
  success: false,
  error: string  // サニタイズ済みエラーメッセージ
}
```

## 2. 型定義インターフェース

### SkillFileTreeNode（@repo/shared）

```typescript
// packages/shared/src/types/skill-file.ts

/**
 * ファイルツリーのノード型
 *
 * スキルディレクトリのファイル構造をツリー形式で表現する。
 * ディレクトリノードは children フィールドに子ノードを持つ。
 */
export interface SkillFileTreeNode {
  /** ファイル名またはディレクトリ名 */
  name: string;

  /** スキルディレクトリからの相対パス（POSIX形式: / 区切り） */
  path: string;

  /** ノードの種別 */
  type: "file" | "directory";

  /** 子ノード（type === "directory" の場合のみ存在） */
  children?: SkillFileTreeNode[];
}
```

### 型参照パス

| 参照元                                          | インポート元   | 方式       |
| ----------------------------------------------- | -------------- | ---------- |
| `SkillFileManager.ts`（Main Process）           | `@repo/shared` | 直接import |
| `skill-api.ts`（Preload）                       | `@repo/shared` | 直接import |
| `useFileTree.ts`（Renderer）                    | `../types`     | re-export  |
| `SkillEditorView/types.ts`（Renderer 後方互換） | `@repo/shared` | re-export  |

## 3. Preload API インターフェース

### SkillAPI インターフェース拡張

```typescript
// apps/desktop/src/preload/skill-api.ts

interface SkillAPI {
  // ... 既存メソッド ...

  // === Skill File Operations (TASK-9A-B) ===
  // ... 既存の readFile, writeFile, listFiles, restoreBackup ...

  /** スキルのファイルツリーを取得する (UT-UI-05A-GETFILETREE-001) */
  getFileTree: (skillName: string) => Promise<SkillFileTreeNode[]>;
}
```

### 実装メソッド

```typescript
getFileTree: (skillName: string): Promise<SkillFileTreeNode[]> =>
  safeInvokeUnwrap<SkillFileTreeNode[]>(
    IPC_CHANNELS.SKILL_GET_FILE_TREE,
    { skillName },
  ),
```

### safeInvokeUnwrap の動作

`safeInvokeUnwrap<T>()` は IPC レスポンスの `{ success, data, error }` ラッパーを展開する:

- `success === true` → `data` を `T` として返す
- `success === false` → `Error(error)` を throw する

## 4. Main Process ハンドラーインターフェース

### skillFileHandlers.ts 拡張

```typescript
// registerSkillFileHandlers() 内に追加
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_FILE_TREE,
  async (event: IpcMainInvokeEvent, args: { skillName: string }) => {
    // ...ハンドラー実装...
  },
);
```

### ハンドラー引数/戻り値

| 項目     | 型                                                            |
| -------- | ------------------------------------------------------------- |
| 引数     | `(event: IpcMainInvokeEvent, args: { skillName: string })`    |
| 成功戻値 | `{ success: true, data: SkillFileTreeNode[] }`                |
| 失敗戻値 | `{ success: false, error: string }`                           |
| 例外     | `toIPCValidationError(validation)` — validateIpcSender 失敗時 |

## 5. SkillFileManager サービスインターフェース

### 新規 public メソッド

```typescript
/**
 * スキルのファイルツリーを取得する
 * @param skillName - スキル名
 * @returns ツリー構造のファイルノード配列
 * @throws {SkillNotFoundError} スキルが見つからない場合
 */
async getFileTree(skillName: string): Promise<SkillFileTreeNode[]>
```

### 新規 private メソッド

```typescript
/**
 * ディレクトリを再帰走査してツリー構造を構築する
 * @param dir - 走査対象ディレクトリの絶対パス
 * @param basePath - スキルディレクトリのルート絶対パス（相対パス算出用）
 * @returns SkillFileTreeNode の配列
 */
private async buildTree(
  dir: string,
  basePath: string,
): Promise<SkillFileTreeNode[]>
```

## 6. IPC 契約整合性マトリクス

### 引数の流れ

```
Renderer: window.electronAPI.skill.getFileTree("my-skill")
  │
  ├─ Preload (skill-api.ts):
  │   safeInvokeUnwrap(SKILL_GET_FILE_TREE, { skillName: "my-skill" })
  │
  ├─ IPC Layer:
  │   ipcRenderer.invoke("skill:getFileTree", { skillName: "my-skill" })
  │
  └─ Main (skillFileHandlers.ts):
      handler(event, args: { skillName: "my-skill" })
        → args.skillName === "my-skill"
        → skillFileManager.getFileTree("my-skill")
```

### P44/P45 準拠確認

| チェック項目                               | 結果                          |
| ------------------------------------------ | ----------------------------- |
| ハンドラー引数形式 = Preload 渡し形式      | 一致: `{ skillName: string }` |
| 引数名 `skillName` = 値のセマンティクス    | 一致: スキル名を表す          |
| SkillFileManager パラメータ名 = IPC 引数名 | 一致: `skillName`             |

## 7. セキュリティ層インターフェース

### 多層防御モデル

```
Layer 1: validateIpcSender(event, channel, options)
  → 送信元ウィンドウ検証
  → 失敗時: throw toIPCValidationError(validation)

Layer 2: P42 3段バリデーション
  → typeof args?.skillName !== "string"  // 型チェック
  → args.skillName === ""               // 空文字列チェック（trim に包含）
  → args.skillName.trim() === ""        // トリム空文字列チェック
  → 失敗時: { success: false, error: "skillName must be a non-empty string" }

Layer 3: findSkillDir(skillName)
  → パストラバーサル防止（SkillFileManager 内部実装）
  → 失敗時: SkillNotFoundError throw

Error Sanitization:
  → isKnownSkillFileError(error): error.message を返す
  → 未知エラー: "Internal error" を返す
```

## 8. Renderer フックインターフェース

### useFileTree フック（更新後）

```typescript
// 公開インターフェース（変更なし）
function useFileTree(skillName: string | null): {
  fileTree: SkillFileTreeNode[];
  isLoading: boolean;
  error: string | null;
  refreshTree: () => Promise<void>;
  setFileTree: (tree: SkillFileTreeNode[]) => void;
};
```

### 内部呼び出しの変更

```typescript
// 変更前: as キャスト + 実行時チェック
const getFileTree = (window.electronAPI?.skill as Record<string, unknown>)
  ?.getFileTree as ((name: string) => Promise<unknown>) | undefined;

// 変更後: 型安全な直接呼び出し
const tree = await window.electronAPI.skill.getFileTree(skillName);
```
