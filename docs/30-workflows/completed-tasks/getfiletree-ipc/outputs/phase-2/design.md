# 設計書 — skill:getFileTree IPC実装

## メタ情報

| 項目      | 内容                      |
| --------- | ------------------------- |
| タスクID  | UT-UI-05A-GETFILETREE-001 |
| Phase     | 2（設計）                 |
| 作成日    | 2026-03-03                |
| 前提Phase | Phase 1（要件定義書）     |
| Issue     | #948                      |

## 1. 設計概要

Phase 1 で定義した FR-1〜FR-1-4 および NFR-1〜NFR-4 を実現するための詳細設計を行う。既存の IPC パターン（skillFileHandlers.ts, skill-api.ts, channels.ts）と一貫性を保ちながら、6つの Task に分割して設計する。

### 変更対象ファイル一覧

| ファイル                                                               | 変更種別 | Task |
| ---------------------------------------------------------------------- | -------- | ---- |
| `apps/desktop/src/preload/channels.ts`                                 | 追加     | 2-1  |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                       | 追加     | 2-2  |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`             | 追加     | 2-3  |
| `apps/desktop/src/preload/skill-api.ts`                                | 追加     | 2-4  |
| `packages/shared/src/types/skill-file.ts`                              | 新規     | 2-5  |
| `packages/shared/src/index.ts`（または types/index.ts）                | 追加     | 2-5  |
| `apps/desktop/src/renderer/views/SkillEditorView/types.ts`             | 変更     | 2-5  |
| `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` | 変更     | 2-6  |

## 2. Task 2-1: IPC チャンネル設計

### channels.ts への追加

`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトに定数を1つ追加する。配置位置は既存の `// Skill file operations (TASK-9A-B)` セクションの直後。

```typescript
// Skill file tree operation (UT-UI-05A-GETFILETREE-001)
SKILL_GET_FILE_TREE: "skill:getFileTree",
```

### チャンネル定義

| 定数名                | チャンネル文字列    | 方向            | パターン      |
| --------------------- | ------------------- | --------------- | ------------- |
| `SKILL_GET_FILE_TREE` | `skill:getFileTree` | Renderer → Main | invoke/handle |

### ALLOWED_INVOKE_CHANNELS への追加

```typescript
// Skill file tree channel (UT-UI-05A-GETFILETREE-001)
IPC_CHANNELS.SKILL_GET_FILE_TREE,
```

配置位置: `ALLOWED_INVOKE_CHANNELS` 配列内、`IPC_CHANNELS.SKILL_RESTORE_BACKUP` の直後。

invoke/handle パターンのため `ALLOWED_ON_CHANNELS` への追加は不要。

## 3. Task 2-2: Main Process ハンドラー設計

### ファイル配置

`apps/desktop/src/main/ipc/skillFileHandlers.ts` の `registerSkillFileHandlers()` 関数内にハンドラーを追加する。

### ハンドラー実装設計

```typescript
// skill:getFileTree
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_FILE_TREE,
  async (event: IpcMainInvokeEvent, args: { skillName: string }) => {
    // Layer 1: 送信元検証
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_GET_FILE_TREE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // Layer 2: P42準拠3段バリデーション
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      return {
        success: false,
        error: "skillName must be a non-empty string",
      };
    }

    // Layer 3: SkillFileManager に委譲
    try {
      const tree = await skillFileManager.getFileTree(args.skillName);
      return { success: true, data: tree };
    } catch (error) {
      if (isKnownSkillFileError(error)) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Internal error" };
    }
  },
);
```

### 多層防御テーブル

| レイヤー | 防御内容                               | 対応NFR   |
| -------- | -------------------------------------- | --------- |
| Layer 1  | `validateIpcSender()` 送信元検証       | NFR-SEC-1 |
| Layer 2  | P42準拠 3段バリデーション              | NFR-SEC-2 |
| Layer 3  | `findSkillDir()` パストラバーサル防止  | NFR-SEC-3 |
| エラー   | `isKnownSkillFileError()` + サニタイズ | NFR-SEC-4 |

### unregisterSkillFileHandlers() への追加

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_FILE_TREE);
```

## 4. Task 2-3: SkillFileManager.getFileTree メソッド設計

### メソッドシグネチャ

```typescript
/**
 * スキルのファイルツリーを取得する
 * @param skillName - スキル名
 * @returns ツリー構造のファイルノード配列
 * @throws {SkillNotFoundError} スキルが見つからない場合
 */
async getFileTree(skillName: string): Promise<SkillFileTreeNode[]> {
  const skillDir = await this.findSkillDir(skillName);
  return this.buildTree(skillDir.path, skillDir.path);
}
```

### buildTree プライベートメソッド

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
): Promise<SkillFileTreeNode[]> {
  const nodes: SkillFileTreeNode[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      // バックアップファイルを除外（BACKUP_PATTERN 再利用）
      if (BACKUP_PATTERN.test(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(basePath, fullPath)
        .split(path.sep)
        .join("/");  // POSIX形式に変換

      if (entry.isDirectory()) {
        const children = await this.buildTree(fullPath, basePath);
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: "directory",
          children,
        });
      } else if (entry.isFile()) {
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: "file",
        });
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空配列を返す
  }

  // ソート: ディレクトリを先、同じ種類内ではアルファベット順
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
```

### アルゴリズムフロー

```
getFileTree(skillName)
  ├─ findSkillDir(skillName)       // 既存メソッド再利用
  │   ├─ ~/.aiworkflow/skills/{skillName} を検索
  │   └─ ~/.claude/skills/{skillName} を検索
  └─ buildTree(skillDir, skillDir)  // 新規プライベートメソッド
      ├─ fs.readdir(dir, { withFileTypes: true })
      ├─ BACKUP_PATTERN でバックアップファイルを除外
      ├─ entry.isDirectory() → 再帰呼出し → children 付きノード作成
      ├─ entry.isFile() → ファイルノード作成
      └─ ソート（directory優先 → name昇順）
```

### 既存 listSkillFiles メソッドとの差異

| 比較項目         | listSkillFiles（既存）                 | getFileTree（新規）                 |
| ---------------- | -------------------------------------- | ----------------------------------- |
| 戻り値           | `string[]`（フラットな相対パス配列）   | `SkillFileTreeNode[]`（ツリー構造） |
| ディレクトリ     | ファイルのみ（ディレクトリは含まない） | ディレクトリノードも含む            |
| 再帰走査         | `walkDir()` → フラット化               | `buildTree()` → ツリー構築          |
| バックアップ除外 | `BACKUP_PATTERN` でフィルタ            | `BACKUP_PATTERN` でフィルタ（同一） |
| ソート           | `localeCompare` のアルファベット順     | ディレクトリ優先 + `localeCompare`  |
| パス形式         | POSIX（`/` 区切り）                    | POSIX（`/` 区切り）（同一）         |

## 5. Task 2-4: Preload API 設計

### SkillAPI インターフェースへの追加

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに追加する。配置位置は `// === Skill File Operations (TASK-9A-B) ===` セクション内、`restoreBackup` の直後。

```typescript
/** スキルのファイルツリーを取得する (UT-UI-05A-GETFILETREE-001) */
getFileTree: (skillName: string) => Promise<SkillFileTreeNode[]>;
```

### 実装への追加

```typescript
getFileTree: (skillName: string): Promise<SkillFileTreeNode[]> =>
  safeInvokeUnwrap<SkillFileTreeNode[]>(
    IPC_CHANNELS.SKILL_GET_FILE_TREE,
    { skillName },
  ),
```

### IPC 呼び出しフロー

```
Renderer (useFileTree)
  → window.electronAPI.skill.getFileTree(skillName)
    → safeInvokeUnwrap<SkillFileTreeNode[]>(SKILL_GET_FILE_TREE, { skillName })
      → ipcRenderer.invoke("skill:getFileTree", { skillName })
        → Main Process handler
          → validateIpcSender()
          → P42 3段バリデーション
          → skillFileManager.getFileTree(skillName)
            → findSkillDir() → buildTree()
          → { success: true, data: SkillFileTreeNode[] }
        ← safeInvokeUnwrap が data を展開
      ← SkillFileTreeNode[]
    ← SkillFileTreeNode[]
  ← setFileTree(tree)
```

## 6. Task 2-5: 型配置設計

### SkillFileTreeNode 型の移動

**移動元:** `apps/desktop/src/renderer/views/SkillEditorView/types.ts`
**移動先:** `packages/shared/src/types/skill-file.ts`

### 型定義（正本）

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

### re-export 設計

1. `packages/shared/src/index.ts`（または `types/index.ts`）から re-export:

   ```typescript
   export type { SkillFileTreeNode } from "./types/skill-file";
   ```

2. `apps/desktop/src/renderer/views/SkillEditorView/types.ts` を後方互換 re-export に変更:
   ```typescript
   // 後方互換性のため @repo/shared から re-export
   export type { SkillFileTreeNode } from "@repo/shared";
   ```

### P32 準拠確認

`SkillFileTreeNode` は `@repo/shared` で1箇所定義し、他は re-export で参照するため P32 リスクは低い。確認すべき箇所:

1. `packages/shared/src/types/skill-file.ts` — 正本
2. `apps/desktop/src/renderer/views/SkillEditorView/types.ts` — re-export

## 7. Task 2-6: useFileTree フック更新設計

### 変更前の問題

`apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` では `skill:getFileTree` が未実装のため `as` キャストで型を回避している。

### 変更後の設計

```typescript
const refreshTree = useCallback(async () => {
  if (!skillName) return;
  setIsLoading(true);
  setError(null);
  try {
    const tree = await window.electronAPI.skill.getFileTree(skillName);
    setFileTree(tree);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "ファイルツリーの読み込みに失敗しました",
    );
    setFileTree([]);
  } finally {
    setIsLoading(false);
  }
}, [skillName]);
```

### 変更差分

| 変更前                                                              | 変更後                                                            |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `as` キャストで `getFileTree` 関数を取得                            | `window.electronAPI.skill.getFileTree` を型安全に呼び出し         |
| `typeof getFileTree !== "function"` の実行時チェック                | 削除（型定義で保証されるため不要）                                |
| `{ tree: [...] }` 形式と直接配列形式の両方に対応                    | `SkillFileTreeNode[]` を直接受け取る（`safeInvokeUnwrap` が展開） |
| フォールバックエラー "ファイルツリーの取得はまだ実装されていません" | 削除（実装済みのため不要）                                        |

## 8. NFR カバレッジマトリクス

| NFR        | 対応Task | 実現手段                                     |
| ---------- | -------- | -------------------------------------------- |
| NFR-SEC-1  | Task 2-2 | `validateIpcSender()` Layer 1                |
| NFR-SEC-2  | Task 2-2 | `typeof` + `.trim() === ""` Layer 2          |
| NFR-SEC-3  | Task 2-3 | `findSkillDir()` 内部のパスチェック          |
| NFR-SEC-4  | Task 2-2 | `isKnownSkillFileError()` + "Internal error" |
| NFR-SEC-5  | Task 2-1 | `IPC_CHANNELS.SKILL_GET_FILE_TREE` 定数      |
| NFR-TYP-1  | 全Task   | `any` 型不使用                               |
| NFR-TYP-2  | Task 2-5 | `@repo/shared` に配置                        |
| NFR-TYP-3  | Task 2-2 | `{ success, data, error }` 形式              |
| NFR-TYP-4  | Task 2-4 | `safeInvokeUnwrap<SkillFileTreeNode[]>()`    |
| NFR-PERF-1 | Task 2-3 | fs.readdir + withFileTypes（stat不要）       |
| NFR-PERF-2 | Task 2-3 | `BACKUP_PATTERN` フィルタ                    |
| NFR-CON-1  | Task 2-2 | 既存ハンドラーと同一の多層防御パターン       |
| NFR-CON-2  | Task 2-2 | `isKnownSkillFileError()` 再利用             |
| NFR-CON-3  | Task 2-2 | register/unregister に統合                   |

## 実行結果

全完了条件を確認:

- [x] Task 2-1: IPC チャンネル定数名 `SKILL_GET_FILE_TREE`・値 `"skill:getFileTree"`・配置位置が確定
- [x] Task 2-1: ALLOWED_INVOKE_CHANNELS への追加位置が確定（SKILL_RESTORE_BACKUP の直後）
- [x] Task 2-2: ハンドラーの多層防御設計が確定（validateIpcSender → P42バリデーション → SkillFileManager委譲）
- [x] Task 2-2: unregisterSkillFileHandlers() への解除処理が確定
- [x] Task 2-3: getFileTree メソッドのシグネチャが確定
- [x] Task 2-3: buildTree メソッドの再帰アルゴリズムが確定
- [x] Task 2-4: SkillAPI インターフェースへのメソッド追加が確定
- [x] Task 2-4: safeInvokeUnwrap の型パラメータ `SkillFileTreeNode[]` と引数 `{ skillName }` が確定
- [x] Task 2-5: SkillFileTreeNode の配置先（@repo/shared）が確定
- [x] Task 2-5: 後方互換性のための re-export 戦略が確定
- [x] Task 2-6: useFileTree の as キャスト除去と型安全呼び出しへの移行が設計されている
- [x] 全設計が Phase 1 の FR/NFR/AC を満たしている
- [x] 曖昧表現が使用されていない
