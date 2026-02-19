# Phase 2: 設計 — ファイル編集IPCハンドラー追加

## メタ情報

| 項目      | 内容                                                      |
| --------- | --------------------------------------------------------- |
| タスクID  | TASK-9A-B                                                 |
| Phase     | 2                                                         |
| タスク名  | ファイル編集IPCハンドラー追加（SkillFileManager IPC統合） |
| 作成日    | 2026-02-19                                                |
| 依存Phase | Phase 1（要件定義）                                       |

## 目的

Phase 1 で定義した6つの機能要件（FR-1〜FR-6）と非機能要件（NFR-1〜NFR-4）に対するアーキテクチャ設計を行う。既存の IPC パターン（skillHandlers.ts, skill-api.ts, channels.ts）との一貫性を保ちながら、Main Process ハンドラー、IPC チャンネル定義、Preload API、型定義を設計する。

## 実行タスク

- Task 1: IPC チャンネル設計 — channels.ts への6チャンネル追加とホワイトリスト更新を定義する
- Task 2: Main Process ハンドラー設計 — skillHandlers.ts への6ハンドラー追加を定義する
- Task 3: Preload API 設計 — skill-api.ts への6メソッド追加を定義する
- Task 4: 型定義設計 — SkillFileAPI インターフェースを定義する
- Task 5: セキュリティ設計 — validatePath / sanitizeErrorMessage の統合を定義する
- Task 6: SkillFileManager 統合設計 — DI パターンとライフサイクルを定義する

---

### Task 1: IPC チャンネル設計

#### channels.ts への追加

`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトに以下の6定数を追加する。配置位置は既存の `// Skill management operations` セクションの直後とする。

```typescript
// Skill file operations (TASK-9A-B)
SKILL_FILE_READ: "skill:readFile",
SKILL_FILE_WRITE: "skill:writeFile",
SKILL_FILE_CREATE: "skill:createFile",
SKILL_FILE_DELETE: "skill:deleteFile",
SKILL_FILE_LIST_BACKUPS: "skill:listBackups",
SKILL_FILE_RESTORE_BACKUP: "skill:restoreBackup",
```

#### チャンネル名一覧

| 定数名                      | チャンネル文字列      | 方向            |
| --------------------------- | --------------------- | --------------- |
| `SKILL_FILE_READ`           | `skill:readFile`      | Renderer → Main |
| `SKILL_FILE_WRITE`          | `skill:writeFile`     | Renderer → Main |
| `SKILL_FILE_CREATE`         | `skill:createFile`    | Renderer → Main |
| `SKILL_FILE_DELETE`         | `skill:deleteFile`    | Renderer → Main |
| `SKILL_FILE_LIST_BACKUPS`   | `skill:listBackups`   | Renderer → Main |
| `SKILL_FILE_RESTORE_BACKUP` | `skill:restoreBackup` | Renderer → Main |

#### ALLOWED_INVOKE_CHANNELS への追加

```typescript
// Skill file channels (TASK-9A-B)
IPC_CHANNELS.SKILL_FILE_READ,
IPC_CHANNELS.SKILL_FILE_WRITE,
IPC_CHANNELS.SKILL_FILE_CREATE,
IPC_CHANNELS.SKILL_FILE_DELETE,
IPC_CHANNELS.SKILL_FILE_LIST_BACKUPS,
IPC_CHANNELS.SKILL_FILE_RESTORE_BACKUP,
```

配置位置: `ALLOWED_INVOKE_CHANNELS` 配列の `// Skill improvement channels (TASK-9C)` セクションの直後。

**注意**: 6チャンネルはすべて invoke/handle パターン（Renderer → Main 一方向）であるため、`ALLOWED_ON_CHANNELS` への追加は不要。

---

### Task 2: Main Process ハンドラー設計

#### ファイル配置

ハンドラーは `apps/desktop/src/main/ipc/skillHandlers.ts` に追加する。既存の skillHandlers.ts 内に `registerSkillFileHandlers()` / `unregisterSkillFileHandlers()` を新規関数として定義する。

#### 関数シグネチャ

```typescript
/**
 * SkillFile IPC ハンドラーを一括登録する
 * @param fileManager - SkillFileManager インスタンス
 * @param skillService - SkillService インスタンス（writeFile 後の再スキャン用）
 * @param mainWindow - BrowserWindow インスタンス（validateIpcSender 用）
 */
function registerSkillFileHandlers(
  fileManager: SkillFileManager,
  skillService: SkillService,
  mainWindow: BrowserWindow,
): void;

/**
 * SkillFile IPC ハンドラーを一括解除する
 */
function unregisterSkillFileHandlers(): void;
```

#### ハンドラー設計テーブル

| チャンネル定数              | IPC メソッド     | 引数                                        | SkillFileManager メソッド                      | 追加処理         | レスポンス形式                          |
| --------------------------- | ---------------- | ------------------------------------------- | ---------------------------------------------- | ---------------- | --------------------------------------- |
| `SKILL_FILE_READ`           | `ipcMain.handle` | `(event, skillName, relativePath)`          | `readFile(skillName, relativePath)`            | なし             | `{ success: true, data: string }`       |
| `SKILL_FILE_WRITE`          | `ipcMain.handle` | `(event, skillName, relativePath, content)` | `writeFile(skillName, relativePath, content)`  | スキル再スキャン | `{ success: true }`                     |
| `SKILL_FILE_CREATE`         | `ipcMain.handle` | `(event, skillName, relativePath, content)` | `createFile(skillName, relativePath, content)` | なし             | `{ success: true }`                     |
| `SKILL_FILE_DELETE`         | `ipcMain.handle` | `(event, skillName, relativePath)`          | `deleteFile(skillName, relativePath)`          | なし             | `{ success: true }`                     |
| `SKILL_FILE_LIST_BACKUPS`   | `ipcMain.handle` | `(event, skillName)`                        | `listBackups(skillName)`                       | なし             | `{ success: true, data: BackupInfo[] }` |
| `SKILL_FILE_RESTORE_BACKUP` | `ipcMain.handle` | `(event, skillName, backupPath)`            | `restoreBackup(skillName, backupPath)`         | なし             | `{ success: true }`                     |

#### ハンドラー実装パターン（共通テンプレート）

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

#### writeFile 後の再スキャン処理

`skill:writeFile` ハンドラーでは、書き込み成功後にスキルメタデータを再スキャンする。これにより、SKILL.md の変更がスキル一覧に即座に反映される。

```typescript
// writeFile 固有の追加処理
await fileManager.writeFile(skillName, relativePath, content);
// 再スキャンしてメタデータ更新
await skillService.rescanSkill(skillName);
return { success: true };
```

**注意**: `skillService.rescanSkill()` が存在しない場合は、`skillService.scanSkills()` を使用する。実装時に既存メソッドの有無を確認すること。

#### unregisterSkillFileHandlers の実装パターン

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

### Task 3: Preload API 設計

#### SkillAPI インターフェースへの追加

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに以下の6メソッドを追加する。

```typescript
// === Skill File Operations API (TASK-9A-B) ===

/**
 * スキルファイルを読み込む
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @returns ファイル内容
 */
readFile: (skillName: string, relativePath: string) => Promise<string>;

/**
 * スキルファイルを書き込む（既存ファイルは自動バックアップ）
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @param content - 書き込む内容
 */
writeFile: (skillName: string, relativePath: string, content: string) =>
  Promise<void>;

/**
 * スキルファイルを新規作成する（既存ファイルがある場合はエラー）
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 * @param content - 書き込む内容
 */
createFile: (skillName: string, relativePath: string, content: string) =>
  Promise<void>;

/**
 * スキルファイルを削除する（自動バックアップ付き）
 * @param skillName - スキル名
 * @param relativePath - スキルディレクトリからの相対パス
 */
deleteFile: (skillName: string, relativePath: string) => Promise<void>;

/**
 * バックアップ一覧を取得する
 * @param skillName - スキル名
 * @returns バックアップ情報の配列
 */
listBackups: (skillName: string) => Promise<BackupInfo[]>;

/**
 * バックアップからファイルを復元する
 * @param skillName - スキル名
 * @param backupPath - バックアップファイルの相対パス
 */
restoreBackup: (skillName: string, backupPath: string) => Promise<void>;
```

#### skillAPI オブジェクトの実装

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

**設計判断**: `safeInvokeUnwrap` を使用する。Main 側が `{ success: true, data }` 形式で返すため、Preload 層で自動的に data を展開し、Renderer には直接的な値を返す。これは既存の `list()` / `getImported()` / `rescan()` と同じパターンである。

---

### Task 4: 型定義設計

#### BackupInfo の import

`BackupInfo` 型は `SkillFileManager.ts` からエクスポート済み。Preload 層で使用するためには以下の選択肢がある:

**選択肢 A（推奨）: `packages/shared` に BackupInfo を移動**

```typescript
// packages/shared/src/types/skill.ts に追加
export interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}
```

**選択肢 B: Preload の型定義ファイルに再定義**

P32（型定義の二箇所同時更新必須）のリスクがあるが、`packages/shared` への移動が影響範囲が大きい場合はこちらを採用する。

**判断基準**: 実装時に `packages/shared/src/types/skill.ts` に BackupInfo がすでに存在するか確認し、存在しない場合は追加する。

#### SkillFileAPI インターフェース（preload/types.ts）

```typescript
/**
 * SkillFileAPI - スキルファイル操作の Preload API インターフェース
 * @see TASK-9A-B
 */
export interface SkillFileAPI {
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

**注意**: 既存の `SkillAPI` インターフェースに直接追加する設計とする（`SkillFileAPI` を別インターフェースとして切り出すかは実装時に判断）。

---

### Task 5: セキュリティ設計

#### validateIpcSender の適用

既存の `validateIpcSender()` 関数を全6ハンドラーの先頭で呼び出す。この関数は `event.senderFrame.url` を検証し、不正な送信元からの呼び出しを拒否する。

```typescript
// 既存パターン（skillHandlers.ts から参照）
function validateIpcSender(
  event: IpcMainInvokeEvent,
  mainWindow: BrowserWindow,
): void {
  if (event.sender.id !== mainWindow.webContents.id) {
    throw new Error("Unauthorized IPC sender");
  }
}
```

#### validatePath の設計

IPC ハンドラーレベルでのパスバリデーション。SkillFileManager 内部にも validatePath が存在するが、IPC 層で事前に拒否することで多層防御を実現する。

```typescript
/**
 * IPC ハンドラー用パスバリデーション
 * パストラバーサル攻撃を検出し、不正なパスを拒否する
 *
 * @param inputPath - 検証対象のパス文字列
 * @throws Error パストラバーサルが検出された場合
 */
function validatePath(inputPath: string): void {
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

**設計判断**: エラーメッセージに具体的な拒否理由（「パストラバーサル検出」等）を含めない。これは sanitizeErrorMessage で更にサニタイズされるが、IPC 層では汎用的なメッセージとすることで攻撃者への情報漏洩を最小化する。

#### sanitizeErrorMessage の設計

既存の authModeHandlers.ts / skillCreatorHandlers.ts と同じパターンを使用する。

```typescript
/**
 * エラーメッセージのサニタイズ
 * 内部パス、スタックトレース、環境変数を除去する
 *
 * @param error - キャッチされたエラーオブジェクト
 * @returns サニタイズ済みのエラーメッセージ
 */
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "スキルファイル操作でエラーが発生しました";
  }

  let message = error.message;

  // ファイルパスを除去
  message = message.replace(/\/[^\s:]+/g, "[path]");
  // Windowsパスを除去
  message = message.replace(/[A-Z]:\\[^\s:]+/gi, "[path]");
  // スタックトレースを除去
  message = message.replace(/\n\s+at\s.+/g, "");

  return message || "スキルファイル操作でエラーが発生しました";
}
```

#### セキュリティ適用マトリクス

| チャンネル                  | validateIpcSender | validatePath 対象引数  | sanitizeErrorMessage |
| --------------------------- | ----------------- | ---------------------- | -------------------- |
| `SKILL_FILE_READ`           | ✅                | `relativePath`         | ✅                   |
| `SKILL_FILE_WRITE`          | ✅                | `relativePath`         | ✅                   |
| `SKILL_FILE_CREATE`         | ✅                | `relativePath`         | ✅                   |
| `SKILL_FILE_DELETE`         | ✅                | `relativePath`         | ✅                   |
| `SKILL_FILE_LIST_BACKUPS`   | ✅                | なし（skillName のみ） | ✅                   |
| `SKILL_FILE_RESTORE_BACKUP` | ✅                | `backupPath`           | ✅                   |

---

### Task 6: SkillFileManager 統合設計

#### DI パターン

SkillFileManager のインスタンスは `registerSkillFileHandlers()` の引数として受け取る（Constructor Injection パターン）。

```
アプリ起動時フロー:
1. main/index.ts で SkillFileManager をインスタンス化
2. registerSkillFileHandlers(fileManager, skillService, mainWindow) を呼び出し
3. アプリ終了時に unregisterSkillFileHandlers() を呼び出し
```

**P34 参照**: SkillFileManager は BrowserWindow 等の外部リソースを必要としないため、Constructor Injection で問題ない。mainWindow は registerSkillFileHandlers の引数として渡す。

#### ライフサイクル管理

```
registerSkillFileHandlers()  ← アプリ起動時 or activate イベント時
        ↓
  6つの ipcMain.handle() を登録
        ↓
unregisterSkillFileHandlers()  ← アプリ終了時 or 再登録前
        ↓
  6つの ipcMain.removeHandler() を実行
```

**P5（二重登録防止）対策**: `unregisterSkillFileHandlers()` を呼び出してから `registerSkillFileHandlers()` を呼び出すことで、macOS `activate` イベントでの二重登録を防止する。既存の `unregisterAllIpcHandlers()` に `unregisterSkillFileHandlers()` の呼び出しを追加する。

---

## 参照資料

| 参照資料                 | パス                                                                         | 内容                    |
| ------------------------ | ---------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件定義         | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-1-requirements.md`      | FR/NFR/AC 定義          |
| IPC セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC通信セキュリティ要件 |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Preload API設計         |
| SkillFileManager 実装    | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                   | ファイル操作サービス    |
| 既存 IPC ハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                 | 既存パターン参照        |
| 既存 Preload API         | `apps/desktop/src/preload/skill-api.ts`                                      | safeInvoke パターン参照 |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                         | P5, P27, P32, P34       |

---

## 統合テスト連携

| テスト種別             | 検証内容                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| ハンドラー登録テスト   | registerSkillFileHandlers で6チャンネルが登録される               |
| ハンドラー解除テスト   | unregisterSkillFileHandlers で6チャンネルが解除される             |
| 送信元検証テスト       | 不正な送信元からの呼び出しが拒否される                            |
| パストラバーサルテスト | `../` を含むパスが IPC レベルで拒否される                         |
| エラーサニタイズテスト | エラーレスポンスにファイルパスが含まれない                        |
| 正常系 E2E テスト      | Renderer → Preload → Main → SkillFileManager の往復が正常動作する |

---

## 成果物

| 成果物               | パス                                                              |
| -------------------- | ----------------------------------------------------------------- |
| 設計書（本ファイル） | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-2-design.md` |

---

## 完了条件

- [ ] 6つの IPC チャンネル定数と配置位置が定義されている
- [ ] 6つの Main Process ハンドラーの引数・戻り値・エラー処理が設計されている
- [ ] 6つの Preload API メソッドの実装パターンが定義されている
- [ ] SkillFileAPI 型定義が設計されている
- [ ] セキュリティ関数（validateIpcSender, validatePath, sanitizeErrorMessage）の適用箇所が明示されている
- [ ] SkillFileManager の DI パターンとライフサイクルが定義されている
- [ ] P5（二重登録防止）対策が設計に含まれている

---

## 次のPhase

→ Phase 3: 設計レビューゲート（`phase-3-design-review.md`）
