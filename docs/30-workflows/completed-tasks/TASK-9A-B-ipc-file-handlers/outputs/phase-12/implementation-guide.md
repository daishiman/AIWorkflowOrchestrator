# ファイル編集IPCハンドラー 実装ガイド — TASK-9A-B

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-9A-B              |
| Phase    | 12（ドキュメント更新） |
| 作成日   | 2026-02-19             |

## Part 1: 概念的説明（中学生レベル）

### IPCハンドラーとは？

IPCハンドラーは「お店の受付カウンター」のようなもの。お客さん(Renderer)は直接バックオフィス(Main Process)に入れない。受付カウンター(IPCハンドラー)を通してリクエストする。

### パストラバーサル防止とは？

「住所の偽造防止」。受付カウンターに「隣のビルのファイルを見せて」と言っても断られる。`../../../etc/passwd`のようなパスを指定しても受付が「不正です」と拒否する。

### 6つの操作

| 操作          | 日常の例え                           |
| ------------- | ------------------------------------ |
| readFile      | 図書館で本を借りて内容を読む         |
| writeFile     | ノートに内容を書き込む               |
| createFile    | 新しいノートを1冊作る                |
| deleteFile    | 不要なノートをゴミ箱に入れる         |
| listBackups   | バックアップフォルダの一覧を確認する |
| restoreBackup | バックアップから元の状態に戻す       |

### エラーサニタイズとは？

エラーメッセージの「情報漏洩防止フィルター」。内部エラー(スタックトレース、ファイルパス)が外部に漏れないよう、既知のエラーはメッセージをそのまま返し、未知のエラーは「Internal error」と一律で返す。

## Part 2: 技術者向け実装詳細

### 実装概要

| 項目               | 値                                               |
| ------------------ | ------------------------------------------------ |
| チャンネル数       | 6                                                |
| ハンドラーファイル | `apps/desktop/src/main/ipc/skillFileHandlers.ts` |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`          |
| 型定義             | `apps/desktop/src/preload/types.ts`              |
| 共有チャンネル定数 | `packages/shared/src/ipc/channels.ts`            |

### 6チャンネルのインターフェース

#### skill:readFile

- 引数: `{ skillName: string; relativePath: string }`
- 戻り値(成功): `{ success: true, data: string }`
- 戻り値(失敗): `{ success: false, error: string }`
- Preload API: `skillAPI.readFile(skillName, relativePath): Promise<string>` (safeInvokeUnwrap)

#### skill:writeFile

- 引数: `{ skillName: string; relativePath: string; content: string }`
- 戻り値(成功): `{ success: true }`
- 戻り値(失敗): `{ success: false, error: string }`
- 副作用: `skillService?.scanAvailableSkills()` が呼ばれる
- Preload API: `skillAPI.writeFile(skillName, relativePath, content): Promise<void>`

#### skill:createFile

- 引数: `{ skillName: string; relativePath: string; content: string }`
- 戻り値: 同上
- Preload API: `skillAPI.createFile(skillName, relativePath, content): Promise<void>`

#### skill:deleteFile

- 引数: `{ skillName: string; relativePath: string }`
- 戻り値: 同上
- Preload API: `skillAPI.deleteFile(skillName, relativePath): Promise<void>`

#### skill:listBackups

- 引数: `{ skillName: string }`
- 戻り値(成功): `{ success: true, data: BackupInfo[] }`
- Preload API: `skillAPI.listBackups(skillName): Promise<BackupInfo[]>`

#### skill:restoreBackup

- 引数: `{ skillName: string; backupPath: string }`
- 戻り値(成功): `{ success: true }`
- Preload API: `skillAPI.restoreBackup(skillName, backupPath): Promise<void>`

### BackupInfo型

```typescript
interface BackupInfo {
  filename: string;
  relativePath: string;
  originalPath: string;
  type: "backup" | "deleted";
  timestamp: number;
  createdAt: Date;
}
```

### セキュリティ検証フロー（多層防御）

```
1. validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })
   → 送信元ウィンドウ検証。不正→throw toIPCValidationError
2. 引数バリデーション
   → typeof + .trim() === "" チェック。不正→ { success: false, error: "..." }
3. SkillFileManager 内部検証
   → パストラバーサル防止、読み取り専用チェック
4. isKnownSkillFileError(error) によるエラーサニタイズ
   → 既知→error.message、未知→"Internal error"
```

### エラーハンドリングパターン

既知のエラー（isKnownSkillFileError型ガード）:

- SkillNotFoundError: スキルが見つからない
- ReadonlySkillError: 読み取り専用スキルへの書き込み
- PathTraversalError: パストラバーサル攻撃検出
- FileExistsError: ファイルが既に存在
- FileNotFoundError: ファイルが見つからない

未知のエラー → "Internal error" (スタックトレース・パス情報の漏洩防止)

### 登録・解除

```typescript
// 登録
registerSkillFileHandlers(mainWindow, skillFileManager, skillService?)
// 解除（macOS activate等での二重登録防止）
unregisterSkillFileHandlers()
```

## IPC チャンネル仕様

| チャンネル名        | IPC_CHANNELS定数     | 引数                                 | 戻り値(成功)                          | 説明             |
| ------------------- | -------------------- | ------------------------------------ | ------------------------------------- | ---------------- |
| skill:readFile      | SKILL_READ_FILE      | { skillName, relativePath }          | { success: true, data: string }       | ファイル読み込み |
| skill:writeFile     | SKILL_WRITE_FILE     | { skillName, relativePath, content } | { success: true }                     | ファイル書き込み |
| skill:createFile    | SKILL_CREATE_FILE    | { skillName, relativePath, content } | { success: true }                     | ファイル新規作成 |
| skill:deleteFile    | SKILL_DELETE_FILE    | { skillName, relativePath }          | { success: true }                     | ファイル削除     |
| skill:listBackups   | SKILL_LIST_BACKUPS   | { skillName }                        | { success: true, data: BackupInfo[] } | バックアップ一覧 |
| skill:restoreBackup | SKILL_RESTORE_BACKUP | { skillName, backupPath }            | { success: true }                     | バックアップ復元 |

全チャンネルの失敗レスポンス: `{ success: false, error: string }`
