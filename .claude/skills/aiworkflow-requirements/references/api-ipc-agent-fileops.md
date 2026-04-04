# スキルファイル操作 IPC チャネル仕様

> 親仕様書: [api-ipc-agent-core.md](api-ipc-agent-core.md)
> 役割: スキルファイル読み書き・バックアップ・復元 IPC 契約

## スキルファイル操作 IPC チャネル（TASK-9A-B）

スキルファイルの読み書き・バックアップ・復元操作をIPC経由で提供する。
`SkillFileManager` サービスと連携し、Rendererからファイル操作を安全に実行する。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- IPCハンドラー: `apps/desktop/src/main/ipc/skillFileHandlers.ts`
- Preload API: `apps/desktop/src/preload/skill-api.ts`（`electronAPI.skill` のメソッドとして公開）
- 型定義: `apps/desktop/src/preload/types.ts`

### チャンネル一覧

| チャネル              | 方向            | 用途                 | Request                                                              | Response              |
| --------------------- | --------------- | -------------------- | -------------------------------------------------------------------- | --------------------- |
| `skill:readFile`      | Renderer → Main | ファイル読み込み     | `{ skillName: string, relativePath: string }`                        | `IpcResult<string>`   |
| `skill:writeFile`     | Renderer → Main | ファイル書き込み     | `{ skillName: string, relativePath: string, content: string }`       | `IpcResult<void>`     |
| `skill:createFile`    | Renderer → Main | ファイル新規作成     | `{ skillName: string, relativePath: string, content: string }`       | `IpcResult<void>`     |
| `skill:deleteFile`    | Renderer → Main | ファイル削除         | `{ skillName: string, relativePath: string }`                        | `IpcResult<void>`     |
| `skill:listBackups`   | Renderer → Main | バックアップ一覧取得 | `{ skillName: string }`                                              | `IpcResult<BackupInfo[]>` |
| `skill:restoreBackup` | Renderer → Main | バックアップ復元     | `{ skillName: string, backupPath: string }`                          | `IpcResult<void>`     |

### 型定義

| 型名         | 説明                                           |
| ------------ | ---------------------------------------------- |
| `IpcResult<T>` | IPC統一レスポンス型（`{ success: true; data: T } \| { success: false; error: string }`） |
| `BackupInfo` | バックアップファイル情報（filename, relativePath, originalPath, type, timestamp, createdAt） |

### 実装状況

| 項目                   | 状態   | タスク    |
| ---------------------- | ------ | --------- |
| チャネル定数定義       | 完了   | TASK-9A-B |
| ホワイトリスト追加     | 完了   | TASK-9A-B |
| IPCハンドラー実装      | 完了   | TASK-9A-B |
| Preload API実装        | 完了   | TASK-9A-B |
| Sender検証（全ハンドラー）| 完了 | TASK-9A-B |
| 引数バリデーション     | 完了   | TASK-9A-B |
| エラーサニタイズ       | 完了   | TASK-9A-B |
| isKnownSkillFileError  | 完了   | TASK-9A-B |

### セキュリティ仕様

全6 invokeハンドラーで以下のセキュリティ検証を実施する。

| 対策 | 実装 | 返却仕様 |
| ---- | ---- | -------- |
| Sender検証 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError` で返却（例: `"Unauthorized IPC call"`） |
| 引数バリデーション | `typeof` チェック + `.trim()` 空文字列検出 | 不正時: 各エラーメッセージ |
| SkillFileManager内部検証 | `SkillFileManager.validatePath()` によるパストラバーサル検出 | `PathTraversalError` → サニタイズ済みメッセージ |
| エラーサニタイズ | `isKnownSkillFileError(error)` でSkillFileManagerエラーを識別し安全なメッセージを返却 | 不明エラー: `"Internal error"` |
