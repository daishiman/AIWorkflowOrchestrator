# Phase 2 設計ドキュメント: ファイル編集IPCハンドラー追加

**タスクID:** TASK-9A-B
**バージョン:** 1.0
**作成日:** 2026-02-19
**ステータス:** 設計完了

---

## 目次

1. [IPC チャンネル設計](#ipc-チャンネル設計)
2. [Main Process ハンドラー設計](#main-process-ハンドラー設計)
3. [Preload API 設計](#preload-api-設計)
4. [型定義設計](#型定義設計)
5. [セキュリティ設計](#セキュリティ設計)
6. [SkillFileManager 統合設計](#skillfilemanager-統合設計)
7. [統合テスト設計](#統合テスト設計)
8. [完了条件チェックリスト](#完了条件チェックリスト)

---

## IPC チャンネル設計

### 1.1 チャンネル定数一覧

以下の6つの IPC チャンネルを `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトに追加する。

#### チャンネル定義

| 定数名                      | チャンネル文字列      | 方向            | 説明                     |
| --------------------------- | --------------------- | --------------- | ------------------------ |
| `SKILL_FILE_READ`           | `skill:readFile`      | Renderer → Main | スキルファイルの読み込み |
| `SKILL_FILE_WRITE`          | `skill:writeFile`     | Renderer → Main | スキルファイルの書き込み |
| `SKILL_FILE_CREATE`         | `skill:createFile`    | Renderer → Main | スキルファイルの新規作成 |
| `SKILL_FILE_DELETE`         | `skill:deleteFile`    | Renderer → Main | スキルファイルの削除     |
| `SKILL_FILE_LIST_BACKUPS`   | `skill:listBackups`   | Renderer → Main | バックアップ一覧取得     |
| `SKILL_FILE_RESTORE_BACKUP` | `skill:restoreBackup` | Renderer → Main | バックアップからの復元   |

#### コード配置位置

**ファイル:** `apps/desktop/src/preload/channels.ts`

**セクション:** `// Skill management operations` の直後に新しいセクション `// Skill file operations (TASK-9A-B)` を追加

```typescript
// Skill file operations (TASK-9A-B)
SKILL_FILE_READ: "skill:readFile",
SKILL_FILE_WRITE: "skill:writeFile",
SKILL_FILE_CREATE: "skill:createFile",
SKILL_FILE_DELETE: "skill:deleteFile",
SKILL_FILE_LIST_BACKUPS: "skill:listBackups",
SKILL_FILE_RESTORE_BACKUP: "skill:restoreBackup",
```

### 1.2 ホワイトリスト設定（ALLOWED_INVOKE_CHANNELS）

すべての6チャンネルは `ALLOWED_INVOKE_CHANNELS` 配列に追加される（invoke/handle パターン）。

**配置位置:** `ALLOWED_INVOKE_CHANNELS` 配列の `// Skill improvement channels (TASK-9C)` セクションの直後

```typescript
// Skill file channels (TASK-9A-B)
IPC_CHANNELS.SKILL_FILE_READ,
IPC_CHANNELS.SKILL_FILE_WRITE,
IPC_CHANNELS.SKILL_FILE_CREATE,
IPC_CHANNELS.SKILL_FILE_DELETE,
IPC_CHANNELS.SKILL_FILE_LIST_BACKUPS,
IPC_CHANNELS.SKILL_FILE_RESTORE_BACKUP,
```

**注記:** 6チャンネルはすべて一方向通信（Renderer → Main）であるため、`ALLOWED_ON_CHANNELS` への追加は不要である。

---

## Main Process ハンドラー設計

### 2.1 ハンドラー登録・解除関数

**ファイル:** `apps/desktop/src/main/ipc/skillHandlers.ts`

#### registerSkillFileHandlers 関数

```typescript
/**
 * SkillFile IPC ハンドラーを一括登録する
 * アプリ起動時またはactivateイベント時に呼び出される
 *
 * @param fileManager - SkillFileManager インスタンス
 * @param skillService - SkillService インスタンス（writeFile後の再スキャン用）
 * @param mainWindow - BrowserWindow インスタンス（validateIpcSender検証用）
 * @throws Error - ハンドラー登録失敗時
 */
function registerSkillFileHandlers(
  fileManager: SkillFileManager,
  skillService: SkillService,
  mainWindow: BrowserWindow,
): void;
```

#### unregisterSkillFileHandlers 関数

```typescript
/**
 * SkillFile IPC ハンドラーを一括解除する
 * アプリ終了時またはハンドラー再登録前に呼び出される
 * （P5対策: macOS activateイベントでの二重登録防止）
 *
 * @throws Error - ハンドラー解除失敗時
 */
function unregisterSkillFileHandlers(): void;
```

### 2.2 ハンドラー実装テーブル

| チャンネル定数              | IPC メソッド     | 引数                                        | SkillFileManager メソッド                      | 追加処理         | レスポンス形式                          |
| --------------------------- | ---------------- | ------------------------------------------- | ---------------------------------------------- | ---------------- | --------------------------------------- |
| `SKILL_FILE_READ`           | `ipcMain.handle` | `(event, skillName, relativePath)`          | `readFile(skillName, relativePath)`            | なし             | `{ success: true, data: string }`       |
| `SKILL_FILE_WRITE`          | `ipcMain.handle` | `(event, skillName, relativePath, content)` | `writeFile(skillName, relativePath, content)`  | スキル再スキャン | `{ success: true }`                     |
| `SKILL_FILE_CREATE`         | `ipcMain.handle` | `(event, skillName, relativePath, content)` | `createFile(skillName, relativePath, content)` | なし             | `{ success: true }`                     |
| `SKILL_FILE_DELETE`         | `ipcMain.handle` | `(event, skillName, relativePath)`          | `deleteFile(skillName, relativePath)`          | なし             | `{ success: true }`                     |
| `SKILL_FILE_LIST_BACKUPS`   | `ipcMain.handle` | `(event, skillName)`                        | `listBackups(skillName)`                       | なし             | `{ success: true, data: BackupInfo[] }` |
| `SKILL_FILE_RESTORE_BACKUP` | `ipcMain.handle` | `(event, skillName, backupPath)`            | `restoreBackup(skillName, backupPath)`         | なし             | `{ success: true }`                     |

### 2.3 汎用ハンドラー実装テンプレート

すべてのハンドラーは以下のテンプレートに従う：

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_FILE_READ,
  async (event, skillName: string, relativePath: string) => {
    // 1. 送信元検証
    validateIpcSender(event, mainWindow);

    // 2. パス引数バリデーション（relativePath がある場合）
    validatePath(relativePath);

    try {
      // 3. SkillFileManager に委譲
      const data = await fileManager.readFile(skillName, relativePath);

      // 4. 成功レスポンス
      return { success: true, data };
    } catch (error) {
      // 5. エラーサニタイズ
      return { success: false, error: sanitizeErrorMessage(error) };
    }
  },
);
```

### 2.4 各ハンドラーの詳細設計

#### 2.4.1 readFile ハンドラー

**機能:** スキルファイルを読み込み、ファイル内容を返す

**引数:**

- `event` (IpcMainInvokeEvent): IPC イベントオブジェクト
- `skillName` (string): スキル名（例: `skill-example`）
- `relativePath` (string): スキルディレクトリからの相対パス（例: `SKILL.md`、`src/index.ts`）

**処理フロー:**

1. `validateIpcSender(event, mainWindow)` で送信元を検証
2. `validatePath(relativePath)` でパストラバーサルを検出
3. `fileManager.readFile(skillName, relativePath)` でファイル読み込み
4. `{ success: true, data: <ファイル内容> }` を返す
5. エラー時: `{ success: false, error: <サニタイズ済みメッセージ> }`

**戻り値型:**

```typescript
{ success: true, data: string } | { success: false, error: string }
```

---

#### 2.4.2 writeFile ハンドラー

**機能:** スキルファイルを書き込む。既存ファイルは自動的にバックアップされる。書き込み成功後、スキルメタデータを再スキャンして一覧に即座に反映させる。

**引数:**

- `event` (IpcMainInvokeEvent): IPC イベントオブジェクト
- `skillName` (string): スキル名
- `relativePath` (string): スキルディレクトリからの相対パス
- `content` (string): 書き込む内容

**処理フロー:**

1. `validateIpcSender(event, mainWindow)` で送信元を検証
2. `validatePath(relativePath)` でパストラバーサルを検出
3. `fileManager.writeFile(skillName, relativePath, content)` でファイル書き込み
4. **追加処理:** `skillService.rescanSkill(skillName)` でメタデータ再スキャン
   - 注記: `rescanSkill()` が存在しない場合は `scanSkills()` を使用
5. `{ success: true }` を返す
6. エラー時: `{ success: false, error: <サニタイズ済みメッセージ> }`

**戻り値型:**

```typescript
{ success: true } | { success: false, error: string }
```

**再スキャン処理の詳細:**

```typescript
// 書き込み完了
await fileManager.writeFile(skillName, relativePath, content);

// メタデータ再スキャン（SKILL.mdの変更を即座に反映）
await skillService.rescanSkill(skillName);

return { success: true };
```

---

#### 2.4.3 createFile ハンドラー

**機能:** スキルファイルを新規作成する。既存ファイルが存在する場合はエラーを返す。

**引数:**

- `event` (IpcMainInvokeEvent): IPC イベントオブジェクト
- `skillName` (string): スキル名
- `relativePath` (string): スキルディレクトリからの相対パス
- `content` (string): 書き込む内容

**処理フロー:**

1. `validateIpcSender(event, mainWindow)` で送信元を検証
2. `validatePath(relativePath)` でパストラバーサルを検出
3. `fileManager.createFile(skillName, relativePath, content)` でファイル作成
4. `{ success: true }` を返す
5. エラー時: `{ success: false, error: <サニタイズ済みメッセージ> }`

**戻り値型:**

```typescript
{ success: true } | { success: false, error: string }
```

---

#### 2.4.4 deleteFile ハンドラー

**機能:** スキルファイルを削除する。削除前に自動的にバックアップが作成される。

**引数:**

- `event` (IpcMainInvokeEvent): IPC イベントオブジェクト
- `skillName` (string): スキル名
- `relativePath` (string): スキルディレクトリからの相対パス

**処理フロー:**

1. `validateIpcSender(event, mainWindow)` で送信元を検証
2. `validatePath(relativePath)` でパストラバーサルを検出
3. `fileManager.deleteFile(skillName, relativePath)` でファイル削除（自動バックアップ）
4. `{ success: true }` を返す
5. エラー時: `{ success: false, error: <サニタイズ済みメッセージ> }`

**戻り値型:**

```typescript
{ success: true } | { success: false, error: string }
```

---

#### 2.4.5 listBackups ハンドラー

**機能:** スキルの全バックアップ一覧を取得する。

**引数:**

- `event` (IpcMainInvokeEvent): IPC イベントオブジェクト
- `skillName` (string): スキル名

**処理フロー:**

1. `validateIpcSender(event, mainWindow)` で送信元を検証
2. `fileManager.listBackups(skillName)` でバックアップ一覧を取得
3. `{ success: true, data: <BackupInfo[]> }` を返す
4. エラー時: `{ success: false, error: <サニタイズ済みメッセージ> }`

**戻り値型:**

```typescript
{ success: true, data: BackupInfo[] } | { success: false, error: string }
```

**BackupInfo の型:** 後述の[型定義設計](#型定義設計)参照

---

#### 2.4.6 restoreBackup ハンドラー

**機能:** バックアップからファイルを復元する。

**引数:**

- `event` (IpcMainInvokeEvent): IPC イベントオブジェクト
- `skillName` (string): スキル名
- `backupPath` (string): バックアップファイルの相対パス（例: `backups/2026-02-19_SKILL.md.backup`）

**処理フロー:**

1. `validateIpcSender(event, mainWindow)` で送信元を検証
2. `validatePath(backupPath)` でパストラバーサルを検出
3. `fileManager.restoreBackup(skillName, backupPath)` でバックアップから復元
4. `{ success: true }` を返す
5. エラー時: `{ success: false, error: <サニタイズ済みメッセージ> }`

**戻り値型:**

```typescript
{ success: true } | { success: false, error: string }
```

---

### 2.5 unregisterSkillFileHandlers 実装

```typescript
function unregisterSkillFileHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_FILE_READ);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_FILE_WRITE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_FILE_CREATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_FILE_DELETE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_FILE_LIST_BACKUPS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_FILE_RESTORE_BACKUP);
}
```

---

## Preload API 設計

### 3.1 SkillAPI インターフェース拡張

**ファイル:** `apps/desktop/src/preload/types.ts`

`SkillAPI` インターフェースに以下の6メソッドを追加する：

```typescript
/**
 * スキルファイルを読み込む
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @returns ファイル内容（正常系）、またはエラーメッセージ（異常系）
 * @throws IpcError - IPC通信エラー時
 */
readFile: (skillName: string, relativePath: string) => Promise<string>;

/**
 * スキルファイルを書き込む（既存ファイルは自動バックアップ）
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @param content - 書き込む内容
 * @throws IpcError - IPC通信エラー時
 */
writeFile: (skillName: string, relativePath: string, content: string) =>
  Promise<void>;

/**
 * スキルファイルを新規作成する（既存ファイルがある場合はエラー）
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @param content - 書き込む内容
 * @throws IpcError - IPC通信エラー時
 */
createFile: (skillName: string, relativePath: string, content: string) =>
  Promise<void>;

/**
 * スキルファイルを削除する（自動バックアップ付き）
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @throws IpcError - IPC通信エラー時
 */
deleteFile: (skillName: string, relativePath: string) => Promise<void>;

/**
 * バックアップ一覧を取得する
 * @param skillName - スキル名
 * @returns バックアップ情報の配列
 * @throws IpcError - IPC通信エラー時
 */
listBackups: (skillName: string) => Promise<BackupInfo[]>;

/**
 * バックアップからファイルを復元する
 * @param skillName - スキル名
 * @param backupPath - バックアップファイルの相対パス
 * @throws IpcError - IPC通信エラー時
 */
restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
```

### 3.2 skillAPI オブジェクト実装

**ファイル:** `apps/desktop/src/preload/skill-api.ts`

各メソッドは `safeInvokeUnwrap()` を使用して実装される。Main 側が `{ success: true, data }` 形式で返すため、Preload層で自動的にdataを展開し、Renderer には直接的な値を返す。

```typescript
// === Skill File Operations API (TASK-9A-B) ===

readFile: (skillName: string, relativePath: string): Promise<string> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_READ, skillName, relativePath),

writeFile: (skillName: string, relativePath: string, content: string): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_WRITE, skillName, relativePath, content),

createFile: (skillName: string, relativePath: string, content: string): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_CREATE, skillName, relativePath, content),

deleteFile: (skillName: string, relativePath: string): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_DELETE, skillName, relativePath),

listBackups: (skillName: string): Promise<BackupInfo[]> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_LIST_BACKUPS, skillName),

restoreBackup: (skillName: string, backupPath: string): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_FILE_RESTORE_BACKUP, skillName, backupPath),
```

### 3.3 safeInvokeUnwrap パターン説明

`safeInvokeUnwrap()` は既存の utility 関数で、以下の処理を実行する：

1. **IPC invoke:** `ipcRenderer.invoke()` でメイン側にメッセージを送信
2. **レスポンス解析:** Main 側から返された `{ success, data, error }` を検証
3. **データ展開:** `success === true` の場合、`data` フィールドを直接返す
4. **エラー処理:** `success === false` の場合、`error` メッセージを `throw new Error()`

**利点:**

- Renderer 層は `try-catch` で簡潔にエラーハンドリング可能
- `await skillAPI.readFile(...)` の戻り値は直接 `string` 型（ラッパーなし）
- 既存の `list()` / `getImported()` / `rescan()` と同じパターン

---

## 型定義設計

### 4.1 BackupInfo 型の管理

`BackupInfo` は SkillFileManager で定義されているが、Preload API で使用するため、型定義の一元管理を行う。

#### 選択肢 A（推奨）: `packages/shared` に移動

```typescript
// packages/shared/src/types/skill.ts に追加

export interface BackupInfo {
  filename: string;
  /** バックアップファイルの相対パス（例: backups/2026-02-19_SKILL.md.backup） */
  relativePath: string;
  /** 元のファイルの相対パス（例: SKILL.md） */
  originalPath: string;
  /** バックアップ種別：通常バックアップまたは削除ファイルのバックアップ */
  type: "backup" | "deleted";
  /** UNIX タイムスタンプ（ファイル作成時刻） */
  timestamp: number;
  /** ISO 8601 形式の作成日時 */
  createdAt: Date;
}
```

**メリット:**

- `@repo/shared` に配置することで、Preload層と Main層で同じ型参照が可能
- P32対策：型定義の二箇所同時更新を回避

**デメリット:**

- `packages/shared` への変更のため、影響範囲確認が必要

#### 選択肢 B: Preload の型定義ファイルに再定義

```typescript
// apps/desktop/src/preload/types.ts に追加

export interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}
```

**メリット:**

- Preload層での変更に留まり、影響範囲が小さい

**デメリット:**

- SkillFileManager との型定義が分散され、P32のリスク（型不一致）が存在

#### 推奨判断基準

実装時に以下を確認し、決定する：

1. `packages/shared/src/types/skill.ts` に `BackupInfo` がすでに存在するか確認
   - **存在する:** 既存型を Preload で import する（最小変更）
   - **存在しない:** 選択肢 A または B を実施

2. `packages/shared` への追加による影響範囲が小さい場合 → **選択肢 A（推奨）**

3. 影響範囲が大きい場合 → **選択肢 B**（但し P32 リスク回避の注意書きを残す）

---

### 4.2 SkillFileAPI インターフェース

**ファイル:** `apps/desktop/src/preload/types.ts`

```typescript
/**
 * SkillFileAPI - スキルファイル操作の Preload API インターフェース
 * @see TASK-9A-B
 * @see skillAPI オブジェクト実装は skill-api.ts を参照
 */
export interface SkillFileAPI {
  /**
   * スキルファイルを読み込む
   */
  readFile: (skillName: string, relativePath: string) => Promise<string>;

  /**
   * スキルファイルを書き込む（既存ファイルは自動バックアップ）
   */
  writeFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;

  /**
   * スキルファイルを新規作成する（既存ファイルがある場合はエラー）
   */
  createFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;

  /**
   * スキルファイルを削除する（自動バックアップ付き）
   */
  deleteFile: (skillName: string, relativePath: string) => Promise<void>;

  /**
   * バックアップ一覧を取得する
   */
  listBackups: (skillName: string) => Promise<BackupInfo[]>;

  /**
   * バックアップからファイルを復元する
   */
  restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
}
```

### 4.3 既存 SkillAPI インターフェースへの統合

設計判断：`SkillFileAPI` を別インターフェースとして切り出すか、既存の `SkillAPI` インターフェースに直接追加するかは実装時に判断する。

**推奨: 既存の SkillAPI に追加**（contextBridge の `skill` API として統一）

```typescript
export interface SkillAPI {
  // 既存メソッド...
  list: () => Promise<SkillInfo[]>;
  getImported: () => Promise<ImportedSkill[]>;
  rescan: () => Promise<void>;

  // === 新規追加（TASK-9A-B）===
  readFile: (skillName: string, relativePath: string) => Promise<string>;
  writeFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;
  createFile: (
    skillName: string,
    relativePath: string,
    content: string,
  ) => Promise<void>;
  deleteFile: (skillName: string, relativePath: string) => Promise<void>;
  listBackups: (skillName: string) => Promise<BackupInfo[]>;
  restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
}
```

---

## セキュリティ設計

### 5.1 多層防御アーキテクチャ

ファイル操作 IPC の多層防御は以下の3層で構成される：

1. **IPC 層（Preload）:** チャンネル名ホワイトリスト（ALLOWED_INVOKE_CHANNELS）
2. **Main 層（IPC ハンドラー）:** 送信元検証 + パスバリデーション + エラーサニタイズ
3. **Service 層（SkillFileManager）:** 実行時パスバリデーション + ビジネスロジック検証

---

### 5.2 validateIpcSender

既存の `validateIpcSender()` 関数を全6ハンドラーの先頭で呼び出す。

```typescript
/**
 * IPC ハンドラーの送信元検証
 * 不正なプロセスからの呼び出しを拒否する
 *
 * @param event - IpcMainInvokeEvent オブジェクト
 * @param mainWindow - BrowserWindow インスタンス（送信元を検証するために使用）
 * @throws Error - 不正な送信元からの呼び出しの場合
 */
function validateIpcSender(
  event: IpcMainInvokeEvent,
  mainWindow: BrowserWindow,
): void {
  if (event.sender.id !== mainWindow.webContents.id) {
    throw new Error("Unauthorized IPC sender");
  }
}
```

**適用範囲:** 全6ハンドラーの最初の処理として呼び出す

---

### 5.3 validatePath

パストラバーサル攻撃（`../` による不正パスアクセス）を検出し、IPC レベルで拒否する。

```typescript
/**
 * IPC ハンドラー用パスバリデーション
 * パストラバーサル攻撃（../ や NULL バイト）を検出し拒否する
 * SkillFileManager 内部にも validatePath が存在するが、IPC層での
 * 多層防御により、セキュリティを強化する
 *
 * @param inputPath - 検証対象のパス文字列（スキルディレクトリからの相対パス）
 * @throws Error - 不正なパスが検出された場合
 */
function validatePath(inputPath: string): void {
  // 型チェック
  if (!inputPath || typeof inputPath !== "string") {
    throw new Error("Invalid path parameter");
  }

  // NULLバイトチェック
  if (inputPath.includes("\0")) {
    throw new Error("Invalid path parameter");
  }

  // パストラバーサルチェック（../ または ..\）
  if (inputPath.includes("..")) {
    throw new Error("Invalid path parameter");
  }
}
```

**設計判断:** エラーメッセージに具体的な拒否理由（「パストラバーサル検出」等）を含めない。これにより、攻撃者への情報漏洩を最小化する。詳細なエラーメッセージは後続の `sanitizeErrorMessage()` でも除去される。

**適用範囲:**

| ハンドラー                  | 検証対象引数   |
| --------------------------- | -------------- |
| `SKILL_FILE_READ`           | `relativePath` |
| `SKILL_FILE_WRITE`          | `relativePath` |
| `SKILL_FILE_CREATE`         | `relativePath` |
| `SKILL_FILE_DELETE`         | `relativePath` |
| `SKILL_FILE_LIST_BACKUPS`   | なし           |
| `SKILL_FILE_RESTORE_BACKUP` | `backupPath`   |

---

### 5.4 sanitizeErrorMessage

Main プロセスのハンドラーでキャッチされたエラーをサニタイズし、内部情報（ファイルパス、スタックトレース、環境変数）を除去する。

```typescript
/**
 * エラーメッセージのサニタイズ
 * 内部パス、スタックトレース、環境変数を除去し、汎用メッセージに変換する
 * Renderer に返す前にエラーメッセージを検査し、機密情報の漏洩を防止する
 *
 * @param error - キャッチされたエラーオブジェクト
 * @returns サニタイズ済みのエラーメッセージ（Renderer に返却可能）
 */
function sanitizeErrorMessage(error: unknown): string {
  // エラーオブジェクトでない場合は汎用メッセージを返す
  if (!(error instanceof Error)) {
    return "スキルファイル操作でエラーが発生しました";
  }

  let message = error.message;

  // ファイルパスを除去（/path/to/file パターン）
  message = message.replace(/\/[^\s:]+/g, "[path]");

  // Windows ファイルパスを除去（C:\path\to\file パターン）
  message = message.replace(/[A-Z]:\\[^\s:]+/gi, "[path]");

  // スタックトレースを除去（at function_name patterns）
  message = message.replace(/\n\s+at\s.+/g, "");

  // 空文字列の場合は汎用メッセージを返す
  return message || "スキルファイル操作でエラーが発生しました";
}
```

**適用範囲:** 全6ハンドラーの catch ブロックで呼び出す

**例（sanitize前後の比較）:**

```
Before:
"ENOENT: no such file or directory, open '/Users/user/skills/skill-example/SKILL.md'"

After:
"ENOENT: no such file or directory, open '[path]'"
```

---

### 5.5 セキュリティ適用マトリクス

| チャンネル                  | validateIpcSender | validatePath 対象 | sanitizeErrorMessage | 検証順序             |
| --------------------------- | :---------------: | :---------------: | :------------------: | -------------------- |
| `SKILL_FILE_READ`           |        ✅         |  `relativePath`   |          ✅          | 送信元 → パス → 処理 |
| `SKILL_FILE_WRITE`          |        ✅         |  `relativePath`   |          ✅          | 送信元 → パス → 処理 |
| `SKILL_FILE_CREATE`         |        ✅         |  `relativePath`   |          ✅          | 送信元 → パス → 処理 |
| `SKILL_FILE_DELETE`         |        ✅         |  `relativePath`   |          ✅          | 送信元 → パス → 処理 |
| `SKILL_FILE_LIST_BACKUPS`   |        ✅         |       なし        |          ✅          | 送信元 → 処理        |
| `SKILL_FILE_RESTORE_BACKUP` |        ✅         |   `backupPath`    |          ✅          | 送信元 → パス → 処理 |

---

## SkillFileManager 統合設計

### 6.1 依存性注入（DI）パターン

SkillFileManager インスタンスは `registerSkillFileHandlers()` の引数として受け取る **Constructor Injection** パターンを採用する。

#### DI パターンの利点

| パターン                | 説明                                           | 選択状況 |
| ----------------------- | ---------------------------------------------- | -------- |
| Constructor Injection   | インスタンス生成時に依存オブジェクトを受け取る | ✅ 採用  |
| Setter Injection        | セッターメソッドで後から注入する               | ✗ 非採用 |
| Service Locator Pattern | グローバルコンテナから参照する                 | ✗ 非採用 |

**なぜ Constructor Injection か？**

- SkillFileManager は外部リソース（BrowserWindow等）に依存しないため、生成時点で即座に利用可能
- P34（遅延初期化が必要な依存オブジェクト）に該当しない
- 引数として `mainWindow` を別途受け取ることで、BrowserWindow の遅延初期化に対応

---

### 6.2 アプリケーション起動フロー

```
1. main/index.ts でアプリケーション初期化

2. SkillFileManager インスタンス化
   const fileManager = new SkillFileManager(skillsDir);

3. BrowserWindow 生成
   const mainWindow = new BrowserWindow(...);

4. IPC ハンドラー登録
   registerSkillFileHandlers(fileManager, skillService, mainWindow);
   ↓
   6つの ipcMain.handle() が登録される

5. アプリケーション実行
   ↓
   Renderer → IPC → Main ハンドラー → SkillFileManager

6. アプリケーション終了時
   unregisterSkillFileHandlers();
   ↓
   6つの ipcMain.removeHandler() を実行
```

---

### 6.3 ハンドラー再登録フロー（P5対策）

macOS `activate` イベント時には、既存ハンドラーを一度解除してから再登録することで、二重登録を防止する。

```typescript
// main/index.ts の app.on('activate') イベント内

app.on("activate", () => {
  // 既存ハンドラーを一括解除（P5対策）
  unregisterAllIpcHandlers(); // ← 既存関数で全ハンドラー解除
  //   内部で unregisterSkillFileHandlers() 呼び出し

  // ハンドラーを再登録
  registerSkillFileHandlers(fileManager, skillService, mainWindow);
});
```

**既存の unregisterAllIpcHandlers() への変更:**

```typescript
function unregisterAllIpcHandlers(): void {
  // 既存の他のハンドラーを解除
  unregisterSkillHandlers();
  unregisterAuthHandlers();
  // ... その他のハンドラー

  // TASK-9A-B で追加
  unregisterSkillFileHandlers();
}
```

---

### 6.4 ハンドラー登録・解除のベストプラクティス

#### 登録関数の実装例

```typescript
function registerSkillFileHandlers(
  fileManager: SkillFileManager,
  skillService: SkillService,
  mainWindow: BrowserWindow,
): void {
  // SKILL_FILE_READ handler
  ipcMain.handle(
    IPC_CHANNELS.SKILL_FILE_READ,
    async (event, skillName: string, relativePath: string) => {
      validateIpcSender(event, mainWindow);
      validatePath(relativePath);
      try {
        const data = await fileManager.readFile(skillName, relativePath);
        return { success: true, data };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // SKILL_FILE_WRITE handler
  ipcMain.handle(
    IPC_CHANNELS.SKILL_FILE_WRITE,
    async (event, skillName: string, relativePath: string, content: string) => {
      validateIpcSender(event, mainWindow);
      validatePath(relativePath);
      try {
        await fileManager.writeFile(skillName, relativePath, content);
        // 再スキャン処理
        await skillService.rescanSkill(skillName);
        return { success: true };
      } catch (error) {
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // ... その他4つのハンドラー（同じパターン）
}
```

#### 解除関数の実装例

```typescript
function unregisterSkillFileHandlers(): void {
  const channels = [
    IPC_CHANNELS.SKILL_FILE_READ,
    IPC_CHANNELS.SKILL_FILE_WRITE,
    IPC_CHANNELS.SKILL_FILE_CREATE,
    IPC_CHANNELS.SKILL_FILE_DELETE,
    IPC_CHANNELS.SKILL_FILE_LIST_BACKUPS,
    IPC_CHANNELS.SKILL_FILE_RESTORE_BACKUP,
  ];

  channels.forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
}
```

---

## 統合テスト設計

### 7.1 テストスコープ

| テスト種別             | 検証内容                                              | テストファイル予定先                |
| :--------------------- | :---------------------------------------------------- | :---------------------------------- |
| ハンドラー登録テスト   | registerSkillFileHandlers で6チャンネルが登録される   | `skillHandlers.test.ts`             |
| ハンドラー解除テスト   | unregisterSkillFileHandlers で6チャンネルが解除される | `skillHandlers.test.ts`             |
| 送信元検証テスト       | 不正な送信元からの呼び出しが拒否される                | `skillHandlers.test.ts`             |
| パストラバーサルテスト | `../` を含むパスが IPC レベルで拒否される             | `skillHandlers.test.ts`             |
| エラーサニタイズテスト | エラーレスポンスにファイルパスが含まれない            | `skillHandlers.test.ts`             |
| 正常系 E2E テスト      | Renderer → Preload → Main → SkillFileManager 往復     | `skillHandlers.integration.test.ts` |
| Preload API テスト     | safeInvokeUnwrap で自動展開が正常動作                 | `skill-api.test.ts`                 |

### 7.2 テストの詳細設計

#### 7.2.1 ハンドラー登録テスト

```typescript
describe("registerSkillFileHandlers", () => {
  it("should register 6 skill file handlers", () => {
    const mockFileManager = {} as SkillFileManager;
    const mockSkillService = {} as SkillService;
    const mockMainWindow = { webContents: { id: 1 } } as BrowserWindow;

    registerSkillFileHandlers(
      mockFileManager,
      mockSkillService,
      mockMainWindow,
    );

    // ipcMain.handle が6回呼ばれたことを検証
    expect(ipcMain.handle).toHaveBeenCalledTimes(6);

    // 各チャンネルが正確に登録されたことを検証
    expect(ipcMain.handle).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_FILE_READ,
      expect.any(Function),
    );
    expect(ipcMain.handle).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_FILE_WRITE,
      expect.any(Function),
    );
    // ... その他4つ
  });
});
```

#### 7.2.2 送信元検証テスト

```typescript
describe("validateIpcSender", () => {
  it("should throw error when sender is not mainWindow", () => {
    const event = {
      sender: { id: 999 }, // mainWindow の ID と異なる
    } as IpcMainInvokeEvent;
    const mainWindow = { webContents: { id: 1 } } as BrowserWindow;

    expect(() => validateIpcSender(event, mainWindow)).toThrow(
      "Unauthorized IPC sender",
    );
  });

  it("should not throw when sender is mainWindow", () => {
    const event = {
      sender: { id: 1 },
    } as IpcMainInvokeEvent;
    const mainWindow = { webContents: { id: 1 } } as BrowserWindow;

    expect(() => validateIpcSender(event, mainWindow)).not.toThrow();
  });
});
```

#### 7.2.3 パストラバーサルテスト

```typescript
describe("validatePath", () => {
  it("should throw when path contains ../", () => {
    expect(() => validatePath("../etc/passwd")).toThrow(
      "Invalid path parameter",
    );
  });

  it("should throw when path contains NULL byte", () => {
    expect(() => validatePath("file.txt\0.sh")).toThrow(
      "Invalid path parameter",
    );
  });

  it("should not throw for valid relative paths", () => {
    expect(() => validatePath("src/index.ts")).not.toThrow();
    expect(() => validatePath("SKILL.md")).not.toThrow();
  });
});
```

#### 7.2.4 エラーサニタイズテスト

```typescript
describe("sanitizeErrorMessage", () => {
  it("should remove file paths", () => {
    const error = new Error(
      "ENOENT: no such file or directory, open '/Users/user/skills/skill-example/SKILL.md'",
    );
    const sanitized = sanitizeErrorMessage(error);

    expect(sanitized).not.toContain("/Users/user");
    expect(sanitized).toContain("[path]");
  });

  it("should remove Windows paths", () => {
    const error = new Error("File not found: C:\\Users\\user\\skills\\file.md");
    const sanitized = sanitizeErrorMessage(error);

    expect(sanitized).not.toContain("C:\\");
    expect(sanitized).toContain("[path]");
  });

  it("should return generic message for non-Error objects", () => {
    const result = sanitizeErrorMessage("string error");
    expect(result).toBe("スキルファイル操作でエラーが発生しました");
  });
});
```

---

## 完了条件チェックリスト

### Phase 2 設計完了基準

以下すべてが満たされていることを確認する：

- [x] **6つの IPC チャンネル定数が定義されている**
  - IPC_CHANNELS.SKILL_FILE_READ
  - IPC_CHANNELS.SKILL_FILE_WRITE
  - IPC_CHANNELS.SKILL_FILE_CREATE
  - IPC_CHANNELS.SKILL_FILE_DELETE
  - IPC_CHANNELS.SKILL_FILE_LIST_BACKUPS
  - IPC_CHANNELS.SKILL_FILE_RESTORE_BACKUP

- [x] **チャンネル定数の配置位置が明確に指定されている**
  - channels.ts の `// Skill management operations` セクションの直後
  - ALLOWED_INVOKE_CHANNELS の `// Skill improvement channels (TASK-9C)` セクションの直後

- [x] **6つの Main Process ハンドラーの設計が完了している**
  - 関数シグネチャ（registerSkillFileHandlers / unregisterSkillFileHandlers）
  - 各ハンドラーの引数・戻り値・エラー処理
  - 実装テンプレート（共通パターン）

- [x] **writeFile ハンドラーの再スキャン処理が設計されている**
  - skillService.rescanSkill(skillName) の呼び出し
  - 代替案（rescanSkill未存在時の scanSkills 使用）

- [x] **unregisterSkillFileHandlers の実装パターンが明確である**
  - 6つの ipcMain.removeHandler() 呼び出し

- [x] **6つの Preload API メソッドの実装パターンが定義されている**
  - safeInvokeUnwrap を使用した実装
  - すべてのメソッドが Promise を返す

- [x] **BackupInfo 型の管理方針が決定している**
  - 選択肢 A（packages/shared への移動）と選択肢 B（再定義）の判断基準を明示
  - 実装時の確認ステップを記載

- [x] **SkillFileAPI インターフェースが設計されている**
  - 6メソッドの署名（引数・戻り値）
  - JSDoc コメント

- [x] **セキュリティ関数の設計が完了している**
  - validateIpcSender: 送信元検証
  - validatePath: パストラバーサル検出（../, NULL バイト）
  - sanitizeErrorMessage: 内部情報除去（パス、スタックトレース）

- [x] **セキュリティ適用マトリクスが明確である**
  - 全6ハンドラーに対する validateIpcSender 適用
  - 各ハンドラーに対する validatePath の対象引数
  - 全6ハンドラーに対する sanitizeErrorMessage 適用

- [x] **SkillFileManager の DI パターンが定義されている**
  - Constructor Injection の採用理由
  - P34（遅延初期化）との判断基準

- [x] **ハンドラーのライフサイクルが明確である**
  - アプリ起動時: registerSkillFileHandlers()
  - アプリ終了時: unregisterSkillFileHandlers()
  - macOS activate イベント時: unregister → register

- [x] **P5（二重登録防止）対策が含まれている**
  - unregisterAllIpcHandlers() への unregisterSkillFileHandlers() 追加
  - activate イベント時のフロー説明

- [x] **統合テスト設計が記載されている**
  - テストスコープ（6種類のテスト）
  - 各テストの詳細実装パターン

---

## 成果物概要

### 本ドキュメントの構成

| セクション                     | 内容                                                  | ステータス |
| ------------------------------ | ----------------------------------------------------- | ---------- |
| 1. IPC チャンネル設計          | 6チャンネル定義・配置位置・ホワイトリスト             | ✅ 完成    |
| 2. Main Process ハンドラー設計 | 登録・解除関数・6ハンドラー詳細・テンプレート         | ✅ 完成    |
| 3. Preload API 設計            | SkillAPI拡張・safeInvokeUnwrap パターン               | ✅ 完成    |
| 4. 型定義設計                  | BackupInfo・SkillFileAPI インターフェース             | ✅ 完成    |
| 5. セキュリティ設計            | validateIpcSender・validatePath・sanitizeErrorMessage | ✅ 完成    |
| 6. SkillFileManager 統合設計   | DI パターン・ライフサイクル・P5対策                   | ✅ 完成    |
| 7. 統合テスト設計              | テストスコープ・詳細実装パターン                      | ✅ 完成    |

---

## 参照資料

| 資料             | パス                                                                         | 目的                                                                   |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-1-requirements.md`      | 要件・受入基準の確認                                                   |
| Phase 2 設計仕様 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-2-design.md`            | 本設計ドキュメントの基盤                                               |
| IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC通信のセキュリティ要件                                              |
| Preload API      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Preload API 設計パターン                                               |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                         | P5（二重登録）、P27（ハードコード）、P32（型定義）、P34（DI パターン） |
| SkillFileManager | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                   | ファイル操作サービス実装                                               |
| 既存IPC実装      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                 | 既存パターン・実装例                                                   |
| 既存Preload API  | `apps/desktop/src/preload/skill-api.ts`                                      | safeInvokeUnwrap 実装例                                                |

---

## 次のPhase

**→ Phase 3: 設計レビューゲート** （docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-3-design-review.md）

設計の妥当性、セキュリティ、既存パターンとの一貫性を検証し、PASS/MINOR/MAJOR 判定を実施する。
