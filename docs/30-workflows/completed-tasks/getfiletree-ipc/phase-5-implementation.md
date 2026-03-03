# Phase 5: 実装 — skill:getFileTree IPC実装

## メタ情報

| 項目         | 値                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-UI-05A-GETFILETREE-001                                                                                                           |
| Phase        | 5（実装）                                                                                                                           |
| 前提Phase    | [phase-4-test-creation.md](./phase-4-test-creation.md)                                                                              |
| 作成日       | 2026-03-03                                                                                                                          |
| Issue        | #948                                                                                                                                |
| 関連Pitfalls | P42（.trim()バリデーション漏れ）, P44（IPCインターフェース不整合）, P45（IPC引数命名の契約ドリフト）, P32（型定義の二箇所同時更新） |

## 目的

Phase 4 で作成した Red 状態のテストを全て Green にするために、skill:getFileTree IPC チャネルのプロダクションコードを実装する。以下の4レイヤーを順序通りに実装する:

1. チャネル定数定義
2. SkillFileManager サービスメソッド
3. Main Process IPC ハンドラ
4. Preload API ブリッジ

## 実行タスク

### Task 5-1: IPC_CHANNELS に SKILL_GET_FILE_TREE を追加

**対象ファイル:** `apps/desktop/src/preload/channels.ts`

**変更内容:**

1. `IPC_CHANNELS` オブジェクトの `// Skill file operations (TASK-9A-B)` セクションに追加:

```typescript
// Skill file operations (TASK-9A-B)
SKILL_READ_FILE: "skill:readFile",
SKILL_WRITE_FILE: "skill:writeFile",
SKILL_CREATE_FILE: "skill:createFile",
SKILL_DELETE_FILE: "skill:deleteFile",
SKILL_LIST_BACKUPS: "skill:listBackups",
SKILL_RESTORE_BACKUP: "skill:restoreBackup",
SKILL_GET_FILE_TREE: "skill:getFileTree",  // ← 追加（UT-UI-05A-GETFILETREE-001）
```

2. `ALLOWED_INVOKE_CHANNELS` 配列の `// Skill file operations (TASK-9A-B)` セクションに追加:

```typescript
// Skill file operations (TASK-9A-B)
IPC_CHANNELS.SKILL_READ_FILE,
IPC_CHANNELS.SKILL_WRITE_FILE,
IPC_CHANNELS.SKILL_CREATE_FILE,
IPC_CHANNELS.SKILL_DELETE_FILE,
IPC_CHANNELS.SKILL_LIST_BACKUPS,
IPC_CHANNELS.SKILL_RESTORE_BACKUP,
IPC_CHANNELS.SKILL_GET_FILE_TREE,  // ← 追加（UT-UI-05A-GETFILETREE-001）
```

### Task 5-2: SkillFileManager.getFileTree() メソッド実装

**対象ファイル:** `apps/desktop/src/main/services/skill/SkillFileManager.ts`

**変更内容:** 既存の `listSkillFiles` メソッドの直後に `getFileTree` パブリックメソッドを追加する。

**メソッドシグネチャ:**

```typescript
/**
 * スキルのファイルツリーを取得
 * @param skillName - スキル名
 * @returns ツリー構造のファイルノード配列
 * @throws {SkillNotFoundError} スキルが見つからない場合
 */
async getFileTree(skillName: string): Promise<SkillFileTreeNode[]>
```

**実装方針:**

1. `findSkillDir(skillName)` でスキルディレクトリを解決する
2. 新規プライベートメソッド `buildFileTree(dir, basePath)` を作成してツリー構造を構築する
3. `buildFileTree` の処理フロー:
   - `fs.readdir(dir, { withFileTypes: true })` でエントリ一覧を取得
   - `BACKUP_PATTERN` に一致するファイルを除外する
   - ディレクトリエントリは再帰的に `buildFileTree` を呼び出して `children` を構築
   - ファイルエントリは `type: "file"` のリーフノードを生成
   - `path` フィールドには `basePath` からの相対パス（`/` 区切り）を設定
   - ディレクトリ先頭・ファイル後方の順で、それぞれ名前順にソートする
4. 空ディレクトリの場合は空配列 `[]` を返す

**SkillFileTreeNode 型のインポート:**

`SkillFileTreeNode` 型は `apps/desktop/src/renderer/views/SkillEditorView/types.ts` に定義されているが、Main Process から Renderer の型を import するのはレイヤー違反（01-architecture.md: 上位層から下位層への一方向依存厳守）のため、以下の方針で対応する:

- `SkillFileManager.ts` 内にローカルインターフェースとして `SkillFileTreeNode` を定義する
- Phase 8（リファクタリング）で `@repo/shared` への型移動を検討する

```typescript
/** ファイルツリーのノード型（SkillEditorView/types.ts と同一定義） */
interface SkillFileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: SkillFileTreeNode[];
}
```

**buildFileTree プライベートメソッド:**

```typescript
/**
 * ディレクトリをツリー構造に変換する
 * @param dir - ディレクトリの絶対パス
 * @param basePath - ルートからの相対パスベース（空文字列で開始）
 * @returns SkillFileTreeNode 配列
 */
private async buildFileTree(dir: string, basePath: string): Promise<SkillFileTreeNode[]>
```

### Task 5-3: skill:getFileTree IPC ハンドラ実装

**対象ファイル:** `apps/desktop/src/main/ipc/skillFileHandlers.ts`

**変更内容:** `registerSkillFileHandlers` 関数内に `skill:getFileTree` ハンドラを追加する。

**ハンドラ構造（既存ハンドラ `skill:listBackups` と同一パターン）:**

```typescript
// skill:getFileTree (UT-UI-05A-GETFILETREE-001)
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_FILE_TREE,
  async (event: IpcMainInvokeEvent, args: { skillName: string }) => {
    // 1. 送信元ウィンドウ検証
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_GET_FILE_TREE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. P42 3段バリデーション（型チェック → 空文字列 → トリム後空文字列）
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      return {
        success: false,
        error: "skillName must be a non-empty string",
      };
    }

    // 3. サービス呼び出し
    try {
      const tree = await skillFileManager.getFileTree(args.skillName);
      return { success: true, data: tree };
    } catch (error) {
      // 4. エラーサニタイズ
      if (isKnownSkillFileError(error)) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Internal error" };
    }
  },
);
```

**セキュリティ対策（多層防御）:**

| 層    | 対策内容                                         |
| ----- | ------------------------------------------------ |
| 第1層 | `validateIpcSender` による送信元ウィンドウ検証   |
| 第2層 | P42 準拠 3段バリデーション（型/空文字列/トリム） |
| 第3層 | `SkillFileManager.findSkillDir` 内のパス解決     |

**`unregisterSkillFileHandlers` への追加:**

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_FILE_TREE);
```

### Task 5-4: Preload API 追加

**対象ファイル:**

1. `apps/desktop/src/preload/skill-api.ts`
2. `apps/desktop/src/preload/types.ts`（変更不要 — getFileTree は BackupInfo 等の新型を使用しない）

**skill-api.ts の変更:**

1. `SkillAPI` インターフェースに `getFileTree` メソッドを追加:

```typescript
// === Skill File Operations (TASK-9A-B) ===

/** スキルファイルを読み込む */
readFile: (skillName: string, relativePath: string) => Promise<string>;
// ... 既存メソッド ...
/** バックアップからファイルを復元する */
restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
/** スキルのファイルツリーを取得する (UT-UI-05A-GETFILETREE-001) */
getFileTree: (skillName: string) => Promise<SkillFileTreeNode[]>;
```

2. `skillAPI` オブジェクトの実装に `getFileTree` を追加:

```typescript
getFileTree: (skillName: string): Promise<SkillFileTreeNode[]> =>
  safeInvokeUnwrap<SkillFileTreeNode[]>(
    IPC_CHANNELS.SKILL_GET_FILE_TREE,
    { skillName },
  ),
```

3. `SkillFileTreeNode` 型のインポート:

```typescript
import type { SkillFileTreeNode } from "./types";
// または skill-api.ts 内にローカル定義
```

**SkillFileTreeNode 型の配置（P32 対策）:**

`SkillFileTreeNode` 型は Preload → Renderer 間で共有されるため、`apps/desktop/src/preload/types.ts` に定義を追加する:

```typescript
/** ファイルツリーノード型 (UT-UI-05A-GETFILETREE-001) */
export interface SkillFileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: SkillFileTreeNode[];
}
```

既に `apps/desktop/src/renderer/views/SkillEditorView/types.ts` に同一定義が存在するため、Renderer 側は Preload 型を再 export するか、Phase 8 で `@repo/shared` に統一する。

### Task 5-5: 型定義の整合性確保

**対象ファイル:** `apps/desktop/src/renderer/views/SkillEditorView/types.ts`

**変更内容:** 既存の `SkillFileTreeNode` 定義を維持する。Phase 8 で `@repo/shared` への移動を検討する。

**useFileTree.ts の型キャスト除去:**

`apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` の `as` キャスト部分を、正式な `window.electronAPI.skill.getFileTree` 呼び出しに置き換える:

```typescript
// Before（asキャスト）
const skillApi = window.electronAPI?.skill as
  | (Record<string, unknown> & typeof window.electronAPI.skill)
  | undefined;
const getFileTree = skillApi?.getFileTree as
  | ((name: string) => Promise<{ tree: SkillFileTreeNode[] } | SkillFileTreeNode[]>)
  | undefined;
if (typeof getFileTree !== "function") { ... }
const result = await getFileTree(skillName);

// After（正式な API 呼び出し）
const tree = await window.electronAPI.skill.getFileTree(skillName);
setFileTree(tree);
```

## SubAgent 分担テーブル

| SubAgent | 担当タスク                             | 対象ファイル                                                          |
| -------- | -------------------------------------- | --------------------------------------------------------------------- |
| Agent A  | Task 5-1: チャネル定数追加             | `apps/desktop/src/preload/channels.ts`                                |
| Agent B  | Task 5-2: SkillFileManager.getFileTree | `apps/desktop/src/main/services/skill/SkillFileManager.ts`            |
| Agent C  | Task 5-3: IPCハンドラ実装              | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                      |
| Agent D  | Task 5-4 + 5-5: Preload API + 型定義   | `apps/desktop/src/preload/skill-api.ts`, `types.ts`, `useFileTree.ts` |

## 参照資料

| 資料                  | パス                                                                          | 参照目的                               |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| 既存IPCハンドラ       | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                              | ハンドラパターン（多層防御）           |
| SkillFileManager      | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                    | walkDir/findSkillDir パターン          |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                                       | safeInvokeUnwrap パターン              |
| チャネル定義          | `apps/desktop/src/preload/channels.ts`                                        | IPC_CHANNELS / ALLOWED_INVOKE_CHANNELS |
| useFileTree フック    | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts`        | asキャスト除去対象                     |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC契約の整合性確認                    |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          | P42, P44, P45, P32 の対策確認          |
| IPC セキュリティ仕様  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | 送信元検証・エラーサニタイズ           |

依存Phase参照: Phase 4

## 実行手順

**実行順序は依存関係に基づく（後続タスクは前段の完了が前提）:**

1. **Task 5-1（チャネル定数）** → 全レイヤーが参照するため最初に実装
2. **Task 5-2（SkillFileManager）** → サービス層の実装（IPCハンドラが依存）
3. **Task 5-3（IPCハンドラ）** → Task 5-1 + 5-2 の完了後に実装
4. **Task 5-4（Preload API）** → Task 5-1 の完了後に実装（Task 5-2/5-3 と並列可能）
5. **Task 5-5（型定義・useFileTree）** → Task 5-4 の完了後に実装
6. **Green 確認**: `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts src/main/services/skill/__tests__/SkillFileManager.getFileTree.test.ts src/preload/__tests__/skill-api.getFileTree.test.ts` を実行し、Phase 4 の全テストが **PASS（Green）** することを確認
7. **型チェック確認**: `pnpm --filter @repo/desktop exec tsc --noEmit` を実行し、型エラーがないことを確認
8. **Lint 確認**: `pnpm --filter @repo/desktop lint` を実行し、Lint エラーがないことを確認

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 5 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物                                   | パス                                                                   | 変更種別 |
| ---------------------------------------- | ---------------------------------------------------------------------- | -------- |
| チャネル定数（SKILL_GET_FILE_TREE 追加） | `apps/desktop/src/preload/channels.ts`                                 | 変更     |
| SkillFileManager.getFileTree メソッド    | `apps/desktop/src/main/services/skill/SkillFileManager.ts`             | 変更     |
| skill:getFileTree IPCハンドラ            | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                       | 変更     |
| Preload API（getFileTree 追加）          | `apps/desktop/src/preload/skill-api.ts`                                | 変更     |
| Preload 型定義（SkillFileTreeNode 追加） | `apps/desktop/src/preload/types.ts`                                    | 変更     |
| useFileTree asキャスト除去               | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` | 変更     |
| 実装サマリー                             | `outputs/phase-5/implementation-summary.md`                            | 新規     |

## 完了条件

- [ ] `IPC_CHANNELS.SKILL_GET_FILE_TREE` が `channels.ts` に定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_GET_FILE_TREE` が追加されている
- [ ] `SkillFileManager.getFileTree(skillName)` が `SkillFileTreeNode[]` を返す
- [ ] `getFileTree` がバックアップファイル（`.backup.` / `.deleted.` 接尾辞）を除外する
- [ ] `getFileTree` がディレクトリ先頭・ファイル後方の名前順ソートを返す
- [ ] IPCハンドラが `validateIpcSender` で送信元を検証する
- [ ] IPCハンドラが P42 準拠 3段バリデーション（型チェック → 空文字列 → トリム後空文字列）を実施する
- [ ] IPCハンドラが `isKnownSkillFileError` で既知エラーをサニタイズする
- [ ] IPCハンドラが未知エラーに対して `"Internal error"` を返す
- [ ] `unregisterSkillFileHandlers` に `SKILL_GET_FILE_TREE` の解除が含まれている
- [ ] Preload API `skillAPI.getFileTree` が `safeInvokeUnwrap` で正しいチャネルを呼び出す
- [ ] `SkillFileTreeNode` 型が `preload/types.ts` に定義されている
- [ ] `useFileTree.ts` の `as` キャストが正式な API 呼び出しに置き換えられている
- [ ] Phase 4 の全テスト（14テスト）が Green（PASS）である
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` が型エラーなしで通る
- [ ] `pnpm --filter @repo/desktop lint` が Lint エラーなしで通る

## 次Phase

全テストが Green であることを確認後、[Phase 6: テスト拡充](./phase-6-test-expansion.md) へ進む。
