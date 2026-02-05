# チャンネルマッピングテーブル

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 2               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. 旧→新チャンネルマッピング

### 1.1 統一対象チャンネル

| 旧チャンネル           | 旧定数名             | 新チャンネル        | 新定数名           | 対応方針         |
| ---------------------- | -------------------- | ------------------- | ------------------ | ---------------- |
| `skill:list-available` | SKILL_LIST_AVAILABLE | `skill:list`        | SKILL_LIST         | 統一（旧を削除） |
| `skill:list-imported`  | SKILL_LIST_IMPORTED  | `skill:getImported` | SKILL_GET_IMPORTED | 統一（旧を削除） |

### 1.2 ハードコード文字列の置換

| 旧コード                     | 新コード                      | ファイル             |
| ---------------------------- | ----------------------------- | -------------------- |
| `"skill:complete" as string` | `IPC_CHANNELS.SKILL_COMPLETE` | preload/skill-api.ts |
| `"skill:error" as string`    | `IPC_CHANNELS.SKILL_ERROR`    | preload/skill-api.ts |

---

## 2. 維持するチャンネル（変更なし）

### 2.1 スキル管理チャンネル

| 定数名             | チャンネル文字列    | 状態 |
| ------------------ | ------------------- | ---- |
| SKILL_LIST         | `skill:list`        | 維持 |
| SKILL_SCAN         | `skill:scan`        | 維持 |
| SKILL_GET_IMPORTED | `skill:getImported` | 維持 |
| SKILL_UPDATE       | `skill:update`      | 維持 |
| SKILL_IMPORT       | `skill:import`      | 維持 |
| SKILL_REMOVE       | `skill:remove`      | 維持 |
| SKILL_GET_DETAIL   | `skill:get-detail`  | 維持 |
| SKILL_EXECUTE      | `skill:execute`     | 維持 |
| SKILL_ABORT        | `skill:abort`       | 維持 |
| SKILL_GET_STATUS   | `skill:get-status`  | 維持 |

### 2.2 イベントチャンネル

| 定数名                    | チャンネル文字列            | 状態 |
| ------------------------- | --------------------------- | ---- |
| SKILL_COMPLETE            | `skill:complete`            | 維持 |
| SKILL_ERROR               | `skill:error`               | 維持 |
| SKILL_STREAM              | `skill:stream`              | 維持 |
| SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | 維持 |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` | 維持 |

### 2.3 スキル改善チャンネル（TASK-9C）

| 定数名                  | チャンネル文字列          | 状態 |
| ----------------------- | ------------------------- | ---- |
| SKILL_ANALYZE           | `skill:analyze`           | 維持 |
| SKILL_IMPROVE           | `skill:improve`           | 維持 |
| SKILL_OPTIMIZE          | `skill:optimize`          | 維持 |
| SKILL_OPTIMIZE_VARIANTS | `skill:optimize:variants` | 維持 |
| SKILL_OPTIMIZE_EVALUATE | `skill:optimize:evaluate` | 維持 |

---

## 3. 削除するチャンネル

### 3.1 preload/channels.ts から削除

| 定数名               | チャンネル文字列       | 削除理由                 |
| -------------------- | ---------------------- | ------------------------ |
| SKILL_LIST_AVAILABLE | `skill:list-available` | SKILL_LISTに統一         |
| SKILL_LIST_IMPORTED  | `skill:list-imported`  | SKILL_GET_IMPORTEDに統一 |

### 3.2 ホワイトリストから削除

| ホワイトリスト          | 削除する定数         |
| ----------------------- | -------------------- |
| ALLOWED_INVOKE_CHANNELS | SKILL_LIST_AVAILABLE |
| ALLOWED_INVOKE_CHANNELS | SKILL_LIST_IMPORTED  |

---

## 4. ハンドラーマッピング

### 4.1 skillHandlers.ts の修正

| 旧ハンドラー                     | 新ハンドラー                   | 変更内容             |
| -------------------------------- | ------------------------------ | -------------------- |
| `SKILL_LIST_AVAILABLE`ハンドラー | `SKILL_LIST`ハンドラー         | チャンネル名のみ変更 |
| `SKILL_LIST_IMPORTED`ハンドラー  | `SKILL_GET_IMPORTED`ハンドラー | チャンネル名のみ変更 |

### 4.2 unregisterSkillHandlers の修正

| 旧削除対象                                    | 新削除対象                                  |
| --------------------------------------------- | ------------------------------------------- |
| `ipcMain.removeHandler(SKILL_LIST_AVAILABLE)` | `ipcMain.removeHandler(SKILL_LIST)`         |
| `ipcMain.removeHandler(SKILL_LIST_IMPORTED)`  | `ipcMain.removeHandler(SKILL_GET_IMPORTED)` |

---

## 5. 移行チェックリスト

### 5.1 channels.ts

- [ ] SKILL_LIST_AVAILABLE定数を削除
- [ ] SKILL_LIST_IMPORTED定数を削除
- [ ] ALLOWED_INVOKE_CHANNELSからSKILL_LIST_AVAILABLEを削除
- [ ] ALLOWED_INVOKE_CHANNELSからSKILL_LIST_IMPORTEDを削除

### 5.2 skill-api.ts

- [ ] `"skill:complete" as string`を`IPC_CHANNELS.SKILL_COMPLETE`に置換
- [ ] `"skill:error" as string`を`IPC_CHANNELS.SKILL_ERROR`に置換

### 5.3 skillHandlers.ts

- [ ] SKILL_LIST_AVAILABLEハンドラーをSKILL_LISTに変更
- [ ] SKILL_LIST_IMPORTEDハンドラーをSKILL_GET_IMPORTEDに変更
- [ ] unregisterSkillHandlersの削除対象を更新

### 5.4 packages/shared/src/ipc/channels.ts

- [ ] スキル関連のチャンネル定義を確認し、必要に応じて削除または調整
