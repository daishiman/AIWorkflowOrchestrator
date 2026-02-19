# アーキテクチャ整合性レビュー

## メタ情報

| 項目         | 値                                          |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-9A-B                                   |
| Phase        | 10（最終レビュー）                          |
| 作成日       | 2026-02-19                                  |
| レビュー対象 | IPC ファイルハンドラー アーキテクチャ整合性 |

---

## 1. アーキテクチャ整合性チェックマトリクス

| チェック項目                       | 確認内容                                                               | 結果 |
| ---------------------------------- | ---------------------------------------------------------------------- | ---- |
| ホワイトリスト追加                 | `ALLOWED_INVOKE_CHANNELS` に6チャンネル追加済み（channels.ts:500-505） | ✅   |
| ハンドラー登録                     | `registerSkillFileHandlers()` に6ハンドラー追加済み                    | ✅   |
| ハンドラー解除                     | `unregisterSkillFileHandlers()` に6チャンネルの `removeHandler`        | ✅   |
| チャンネル定数（正本と副本の一致） | `packages/shared` と `apps/desktop` のチャンネル値一致                 | ✅   |
| レイヤー依存方向                   | Renderer → Preload (skill-api.ts) → Main (skillFileHandlers.ts)        | ✅   |
| contextBridge 経由                 | `skillAPI` は `electronAPI.skill` として公開                           | ✅   |
| writeFile 後のスキル再スキャン     | `skillService?.scanAvailableSkills()` 呼び出し（オプショナル）         | ✅   |

---

## 2. レイヤー依存方向の検証

アーキテクチャルール（01-architecture.md）の「Renderer → Preload (contextBridge) → Main → External Services」に準拠していることを確認した。

```
Renderer
  ↓ window.electronAPI.skill.readFile() 呼び出し
Preload (skill-api.ts)
  ↓ safeInvokeUnwrap(IPC_CHANNELS.SKILL_READ_FILE, args) 経由
Main (skillFileHandlers.ts)
  ↓ SkillFileManager.readFile() 委譲
External Services (Node.js fs モジュール)
```

逆方向インポートなし。各層が下位層のみを参照している。

---

## 3. contextBridge 公開パスの検証

`skillAPI` が `electronAPI.skill` として公開されていることを確認した。

```typescript
// preload/index.ts (概略)
contextBridge.exposeInMainWorld("electronAPI", {
  skill: skillAPI,
  // ...他のAPI
});
```

- `contextIsolation: true` 設定下での公開 ✅
- `nodeIntegration: false` 設定下での公開 ✅
- Renderer からは `window.electronAPI.skill.readFile()` でアクセス可能 ✅

---

## 4. ハンドラー登録・解除の対称性

既知の落とし穴 P5（リスナー二重登録）への対策として、登録と解除が対称的に実装されていることを確認した。

**登録（registerSkillFileHandlers）**:

```
ipcMain.handle(IPC_CHANNELS.SKILL_READ_FILE, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_WRITE_FILE, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_CREATE_FILE, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_DELETE_FILE, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_LIST_BACKUPS, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_RESTORE_BACKUP, ...)
```

**解除（unregisterSkillFileHandlers）**:

```
ipcMain.removeHandler(IPC_CHANNELS.SKILL_READ_FILE)
ipcMain.removeHandler(IPC_CHANNELS.SKILL_WRITE_FILE)
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATE_FILE)
ipcMain.removeHandler(IPC_CHANNELS.SKILL_DELETE_FILE)
ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_BACKUPS)
ipcMain.removeHandler(IPC_CHANNELS.SKILL_RESTORE_BACKUP)
```

登録チャンネル数と解除チャンネル数が一致（各6チャンネル）。macOS `activate` イベント等での再登録時にも二重登録が発生しない設計となっている。

---

## 5. チャンネル定数の正本・副本一致確認

P27（Preload ハードコード文字列の見落とし）対策として、チャンネル値が定数参照であることを確認した。

| 定数名                 | packages/shared の値    | apps/desktop の参照                 | 一致 |
| ---------------------- | ----------------------- | ----------------------------------- | ---- |
| `SKILL_READ_FILE`      | `"skill:readFile"`      | `IPC_CHANNELS.SKILL_READ_FILE`      | ✅   |
| `SKILL_WRITE_FILE`     | `"skill:writeFile"`     | `IPC_CHANNELS.SKILL_WRITE_FILE`     | ✅   |
| `SKILL_CREATE_FILE`    | `"skill:createFile"`    | `IPC_CHANNELS.SKILL_CREATE_FILE`    | ✅   |
| `SKILL_DELETE_FILE`    | `"skill:deleteFile"`    | `IPC_CHANNELS.SKILL_DELETE_FILE`    | ✅   |
| `SKILL_LIST_BACKUPS`   | `"skill:listBackups"`   | `IPC_CHANNELS.SKILL_LIST_BACKUPS`   | ✅   |
| `SKILL_RESTORE_BACKUP` | `"skill:restoreBackup"` | `IPC_CHANNELS.SKILL_RESTORE_BACKUP` | ✅   |

文字列リテラルの直接使用は存在しない（`safeInvoke` / `safeOn` も全て定数参照）。

---

## 6. writeFile 後のスキル再スキャン

`writeFile` ハンドラーがファイル書き込み完了後に `skillService?.scanAvailableSkills()` を呼び出すことを確認した。

- `skillService` が未設定の場合はオプショナルチェーン (`?.`) により安全にスキップ ✅
- スキル一覧の整合性が書き込み後に自動的に保たれる設計 ✅
- 再スキャンの失敗がファイル書き込み成功の結果に影響しない分離設計 ✅

---

## 7. アーキテクチャレビュー結果

**全項目 PASS**

IPC ファイルハンドラーのアーキテクチャは、プロジェクトのアーキテクチャルール（01-architecture.md）およびセキュリティルール（04-electron-security.md）に完全準拠している。ハンドラー登録・解除の対称性、チャンネル定数の統一管理、レイヤー依存方向の遵守が確認された。
