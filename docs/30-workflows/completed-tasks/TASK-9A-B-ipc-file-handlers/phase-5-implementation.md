# Phase 5: 実装（TDD: Green）— TASK-9A-B ファイル編集IPCハンドラー

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| 機能名     | TASK-9A-B-ipc-file-handlers            |
| 作成日     | 2026-02-19                             |
| 前提Phase  | Phase 4（テスト作成・Red状態確認）     |
| 依存タスク | TASK-9A-A（SkillFileManager 実装済み） |

## 目的

Phase 4 で作成した全テスト（46テスト）を通すための**最小限のプロダクションコード**を実装し、全テストが **Green 状態**（成功）であることを確認する。

## 実行タスク

### Task 1: チャンネル定数追加

#### 1.1 共有チャンネル定数の追加

**対象ファイル**: `packages/shared/src/ipc/channels.ts`

`IPC_CHANNELS` オブジェクトの `// Skill management operations` セクション末尾に以下の6定数を追加する:

```typescript
// Skill file operations (TASK-9A-B)
SKILL_READ_FILE: "skill:readFile",
SKILL_WRITE_FILE: "skill:writeFile",
SKILL_CREATE_FILE: "skill:createFile",
SKILL_DELETE_FILE: "skill:deleteFile",
SKILL_LIST_BACKUPS: "skill:listBackups",
SKILL_RESTORE_BACKUP: "skill:restoreBackup",
```

#### 1.2 Preload チャンネル定数の同期

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

**手順**:

1. `IPC_CHANNELS` オブジェクトに同じ6定数を追加する（`packages/shared` と同一の値）
2. `ALLOWED_INVOKE_CHANNELS` 配列の Skill セクション末尾に以下を追加する:

```typescript
// Skill file operations (TASK-9A-B)
IPC_CHANNELS.SKILL_READ_FILE,
IPC_CHANNELS.SKILL_WRITE_FILE,
IPC_CHANNELS.SKILL_CREATE_FILE,
IPC_CHANNELS.SKILL_DELETE_FILE,
IPC_CHANNELS.SKILL_LIST_BACKUPS,
IPC_CHANNELS.SKILL_RESTORE_BACKUP,
```

**注意**: `ALLOWED_ON_CHANNELS` への追加は不要（全て invoke パターンのため）。

---

### Task 2: Main Process ハンドラー実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillFileHandlers.ts`（新規作成）

#### 2.1 ファイル構成

```
apps/desktop/src/main/ipc/skillFileHandlers.ts
├── import 宣言
├── registerSkillFileHandlers(mainWindow, skillFileManager, skillService?)
│   ├── skill:readFile ハンドラー
│   ├── skill:writeFile ハンドラー
│   ├── skill:createFile ハンドラー
│   ├── skill:deleteFile ハンドラー
│   ├── skill:listBackups ハンドラー
│   └── skill:restoreBackup ハンドラー
└── unregisterSkillFileHandlers()
```

#### 2.2 関数シグネチャ

```typescript
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels.js";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator.js";
import { SkillFileManager } from "../services/skill/SkillFileManager.js";
import {
  SkillNotFoundError,
  ReadonlySkillError,
  PathTraversalError,
  FileExistsError,
  FileNotFoundError,
} from "../services/skill/errors.js";
import type { SkillService } from "../services/skill/SkillService.js";

export function registerSkillFileHandlers(
  mainWindow: BrowserWindow,
  skillFileManager: SkillFileManager,
  skillService?: SkillService,
): void;

export function unregisterSkillFileHandlers(): void;
```

#### 2.3 各ハンドラーの実装仕様

全ハンドラーは以下の共通パターンに従う:

```
1. validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })
2. validation.valid === false → throw toIPCValidationError(validation)
3. 引数バリデーション（型チェック + 空文字列チェック）
4. SkillFileManager メソッド呼び出し
5. { success: true, data? } を返却
6. 既知のエラー → { success: false, error: error.message }
7. 予期しないエラー → { success: false, error: "Internal error" }
```

##### skill:readFile

| 項目           | 値                                                        |
| -------------- | --------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_READ_FILE`                            |
| 引数           | `{ skillName: string, relativePath: string }`             |
| バリデーション | skillName: 非空文字列、relativePath: 非空文字列           |
| 呼び出し       | `skillFileManager.readFile(skillName, relativePath)`      |
| 成功レスポンス | `{ success: true, data: string }`                         |
| 既知エラー     | SkillNotFoundError, FileNotFoundError, PathTraversalError |

##### skill:writeFile

| 項目           | 値                                                               |
| -------------- | ---------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_WRITE_FILE`                                  |
| 引数           | `{ skillName: string, relativePath: string, content: string }`   |
| バリデーション | skillName: 非空文字列、relativePath: 非空文字列、content: 文字列 |
| 呼び出し       | `skillFileManager.writeFile(skillName, relativePath, content)`   |
| 副作用         | `skillService?.scanAvailableSkills()` を呼び出す（存在する場合） |
| 成功レスポンス | `{ success: true }`                                              |
| 既知エラー     | SkillNotFoundError, ReadonlySkillError, PathTraversalError       |

##### skill:createFile

| 項目           | 値                                                                          |
| -------------- | --------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_CREATE_FILE`                                            |
| 引数           | `{ skillName: string, relativePath: string, content: string }`              |
| バリデーション | skillName: 非空文字列、relativePath: 非空文字列、content: 文字列            |
| 呼び出し       | `skillFileManager.createFile(skillName, relativePath, content)`             |
| 成功レスポンス | `{ success: true }`                                                         |
| 既知エラー     | SkillNotFoundError, ReadonlySkillError, FileExistsError, PathTraversalError |

##### skill:deleteFile

| 項目           | 値                                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_DELETE_FILE`                                              |
| 引数           | `{ skillName: string, relativePath: string }`                                 |
| バリデーション | skillName: 非空文字列、relativePath: 非空文字列                               |
| 呼び出し       | `skillFileManager.deleteFile(skillName, relativePath)`                        |
| 成功レスポンス | `{ success: true }`                                                           |
| 既知エラー     | SkillNotFoundError, ReadonlySkillError, FileNotFoundError, PathTraversalError |

##### skill:listBackups

| 項目           | 値                                        |
| -------------- | ----------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_LIST_BACKUPS`         |
| 引数           | `{ skillName: string }`                   |
| バリデーション | skillName: 非空文字列                     |
| 呼び出し       | `skillFileManager.listBackups(skillName)` |
| 成功レスポンス | `{ success: true, data: BackupInfo[] }`   |
| 既知エラー     | SkillNotFoundError                        |

##### skill:restoreBackup

| 項目           | 値                                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_RESTORE_BACKUP`                                           |
| 引数           | `{ skillName: string, backupPath: string }`                                   |
| バリデーション | skillName: 非空文字列、backupPath: 非空文字列                                 |
| 呼び出し       | `skillFileManager.restoreBackup(skillName, backupPath)`                       |
| 成功レスポンス | `{ success: true }`                                                           |
| 既知エラー     | SkillNotFoundError, ReadonlySkillError, FileNotFoundError, PathTraversalError |

#### 2.4 エラーハンドリング実装

既知のエラークラスかどうかを判定するヘルパー関数を定義する:

```typescript
function isKnownSkillFileError(
  error: unknown,
): error is
  | SkillNotFoundError
  | ReadonlySkillError
  | PathTraversalError
  | FileExistsError
  | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}
```

catch ブロックの実装:

```typescript
catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  // 予期しないエラー: 内部情報を漏洩しない
  return { success: false, error: "Internal error" };
}
```

#### 2.5 unregisterSkillFileHandlers 実装

```typescript
export function unregisterSkillFileHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_READ_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_WRITE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DELETE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_BACKUPS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
}
```

---

### Task 3: Preload API 実装

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`

#### 3.1 SkillAPI インターフェース拡張

`SkillAPI` インターフェースに以下の6メソッドを追加する:

```typescript
// Skill file operations (TASK-9A-B)
readFile: (skillName: string, relativePath: string) => Promise<string>;
writeFile: (skillName: string, relativePath: string, content: string) =>
  Promise<void>;
createFile: (skillName: string, relativePath: string, content: string) =>
  Promise<void>;
deleteFile: (skillName: string, relativePath: string) => Promise<void>;
listBackups: (skillName: string) => Promise<BackupInfo[]>;
restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
```

#### 3.2 skillAPI オブジェクト拡張

`skillAPI` オブジェクトに以下の6メソッド実装を追加する:

```typescript
// Skill file operations (TASK-9A-B)
readFile: (skillName, relativePath) =>
  safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_READ_FILE, { skillName, relativePath }),

writeFile: (skillName, relativePath, content) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_WRITE_FILE, { skillName, relativePath, content }),

createFile: (skillName, relativePath, content) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_CREATE_FILE, { skillName, relativePath, content }),

deleteFile: (skillName, relativePath) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DELETE_FILE, { skillName, relativePath }),

listBackups: (skillName) =>
  safeInvokeUnwrap<BackupInfo[]>(IPC_CHANNELS.SKILL_LIST_BACKUPS, { skillName }),

restoreBackup: (skillName, backupPath) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_RESTORE_BACKUP, { skillName, backupPath }),
```

**注意**: `safeInvokeUnwrap` を使用する。これにより `{ success, data }` ラッパーが自動展開され、失敗時は自動的に `Error` がスローされる。

---

### Task 4: 型定義追加

**対象ファイル**: `apps/desktop/src/preload/types.ts`

`BackupInfo` 型をインポートまたは再定義する:

```typescript
// SkillFileManager と同一の型定義
export interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}
```

**型定義配置の判断**:

- `BackupInfo` が `packages/shared` に既に定義されている場合: そこから re-export する
- `packages/shared` に未定義の場合: `apps/desktop/src/preload/types.ts` に定義し、`SkillFileManager` 側の同名型と一致させる

---

### Task 5: 既存ハンドラーとの統合

#### 5.1 registerAllIpcHandlers からの呼び出し

既存の `registerAllIpcHandlers` 関数（または同等の一括登録関数）から `registerSkillFileHandlers` を呼び出すように更新する。

#### 5.2 unregisterAllIpcHandlers からの呼び出し

既存の `unregisterAllIpcHandlers` 関数から `unregisterSkillFileHandlers` を呼び出すように更新する。

#### 5.3 SkillFileManager インスタンスの生成

`registerSkillFileHandlers` に渡す `SkillFileManager` インスタンスは、アプリ初期化時に生成する。既存の `SkillService` が `SkillFileManager` を内包している場合は、`skillService.fileManager` として取得する。内包していない場合は、`new SkillFileManager()` で直接生成する。

---

## 既知のPitfall対策

| Pitfall ID | 内容                         | 対策                                                                                                                                                                                                                                                                           |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P5         | リスナー二重登録             | `unregisterSkillFileHandlers` で確実に全解除                                                                                                                                                                                                                                   |
| P23        | 型二重定義の管理             | `BackupInfo` を共有型として管理、Preload と Main で同一型を参照                                                                                                                                                                                                                |
| P27        | ハードコード文字列の見落とし | 全チャンネル名に `IPC_CHANNELS` 定数を使用。実装後に `grep -rn "skill:readFile\|skill:writeFile\|skill:createFile\|skill:deleteFile\|skill:listBackups\|skill:restoreBackup" apps/desktop/src/ --include="*.ts" \| grep -v "channels.ts\|test"` で文字列リテラル使用箇所を検出 |
| P32        | 型定義の二箇所同時更新       | `preload/types.ts` と `SkillFileManager` の型を同時に更新                                                                                                                                                                                                                      |

## アーキテクチャ層別実装テーブル

| レイヤー | ファイル                                         | 変更内容                                   |
| -------- | ------------------------------------------------ | ------------------------------------------ |
| 共有定数 | `packages/shared/src/ipc/channels.ts`            | 6チャンネル定数追加                        |
| Preload  | `apps/desktop/src/preload/channels.ts`           | 6チャンネル定数 + ホワイトリスト追加       |
| Preload  | `apps/desktop/src/preload/skill-api.ts`          | 6メソッド追加（safeInvokeUnwrap パターン） |
| Preload  | `apps/desktop/src/preload/types.ts`              | BackupInfo 型追加                          |
| Main     | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | 新規: 6ハンドラー + register/unregister    |

## 参照資料

| 資料                                                             | 用途                                |
| ---------------------------------------------------------------- | ----------------------------------- |
| Phase 4 成果物（テストファイル3件）                              | テストが Green になることを確認     |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                     | 既存ハンドラーの実装パターン        |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | SkillFileManager メソッドシグネチャ |
| `apps/desktop/src/main/services/skill/errors.ts`                 | エラークラス定義                    |
| `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | IPC 検証関数                        |
| `.claude/rules/04-electron-security.md`                          | セキュリティ原則                    |

## 統合テスト連携

| 連携先                | 内容                                                         |
| --------------------- | ------------------------------------------------------------ |
| Phase 4（テスト作成） | 46件のテスト仕様を満たす最小実装を追加する                   |
| Phase 6（テスト拡充） | 実装後の不足分岐・境界値ケースを追加してカバレッジを拡張する |
| Phase 9（品質保証）   | lint/typecheck/coverage を通じて実装品質を確定する           |

## 成果物

| 成果物                                           | 説明                       |
| ------------------------------------------------ | -------------------------- |
| `packages/shared/src/ipc/channels.ts`            | 6チャンネル定数追加        |
| `apps/desktop/src/preload/channels.ts`           | 6定数 + ホワイトリスト追加 |
| `apps/desktop/src/preload/skill-api.ts`          | 6メソッド追加              |
| `apps/desktop/src/preload/types.ts`              | BackupInfo 型追加          |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts` | 新規: ハンドラー実装       |

## 完了条件

- [ ] 6チャンネル定数が `packages/shared` と `preload/channels.ts` の両方に定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に6チャンネルが追加されている
- [ ] 6つのIPCハンドラーが `skillFileHandlers.ts` に実装されている
- [ ] 各ハンドラーで `validateIpcSender` による送信元検証が実施されている
- [ ] 各ハンドラーの引数バリデーション（型チェック + 空文字列チェック）が実装されている
- [ ] 既知エラーは `error.message` をそのまま返し、予期しないエラーは `"Internal error"` を返す
- [ ] `writeFile` ハンドラーで `skillService.scanAvailableSkills()` が呼び出される
- [ ] Preload API に6メソッドが追加されている（`safeInvokeUnwrap` パターン）
- [ ] `unregisterSkillFileHandlers` で6チャンネル全てが解除される
- [ ] ハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数のみ使用）
- [ ] Phase 4 の全テスト（46テスト）が **Green 状態**（成功）である
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillFileHandlers` が全PASS

## 次のPhase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所のテストを追加する。
