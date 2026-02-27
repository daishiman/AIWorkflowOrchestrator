# Preload API 対応付け: skill-api.ts メソッド別 IPC フロー分析

> **作成日**: 2026-02-27
> **対象ファイル**: `apps/desktop/src/preload/skill-api.ts`
> **タスク**: TASK-SKILL-IPC-RESPONSE-CONSISTENCY Phase 1 Task 1-2

## 概要

skill-api.ts の全メソッドについて、`safeInvoke` / `safeInvokeUnwrap` の使用状況と、Main側戻り値 → Preload変換 → Renderer到達型のフローを対応付けた。

## ヘルパー関数の仕様

### safeInvoke<T>

- ホワイトリスト検証後、`ipcRenderer.invoke` を直呼び出し
- Main側の戻り値がそのまま `T` として返される（ラッパー展開なし）
- Main側で throw されたエラーは `Promise.reject` として伝播する

### safeInvokeUnwrap<T>

- 内部で `safeInvoke<IpcResult<T>>` を呼び出し
- `IpcResult` = `{ success: boolean; data?: T; error?: string }`
- `result.success === false` の場合: `throw new Error(result.error || "IPC call failed: ...")`
- `result.success === true` の場合: `result.data as T` を返す

---

## メソッド別対応マッピング

### 1. execute

| 項目                | 内容                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<SkillExecutionResponse>(IPC_CHANNELS.SKILL_EXECUTE, request)`                                                                                                                          |
| **Main側戻り値型**  | `{ success: true, data: result }` / `{ success: false, error: string }` (ラッパー形式)                                                                                                                   |
| **Preload変換**     | `safeInvokeUnwrap` がラッパーを展開し `result.data` を返す                                                                                                                                               |
| **Renderer到達型**  | `SkillExecutionResponse`                                                                                                                                                                                 |
| **型一致判定**      | **要確認**: `skillService.executeSkill()` の戻り値が `SkillExecutionResponse` であれば一致。ただし Main 側で `{ success: true, data: result }` と包んでいるため、`data` の中身は `executeSkill` の戻り値 |
| **エラー経路**      | Main 側 throw → IPC エラー伝播 / Main 側 `{ success: false }` → `safeInvokeUnwrap` が `new Error(error)` を throw                                                                                        |

### 2. onStream

| 項目                | 内容                                                              |
| ------------------- | ----------------------------------------------------------------- |
| **Preload呼び出し** | `safeOn<SkillStreamMessage>(IPC_CHANNELS.SKILL_STREAM, callback)` |
| **Main側送出**      | `mainWindow.webContents.send(IPC_CHANNELS.SKILL_STREAM, message)` |
| **Preload変換**     | `ipcRenderer.on` でリスナー登録、データをそのまま callback に渡す |
| **Renderer到達型**  | `SkillStreamMessage`                                              |
| **型一致判定**      | Main 側の送出データが `SkillStreamMessage` であれば一致           |
| **エラー経路**      | なし（イベントリスナー方式）                                      |

### 3. abort

| 項目                | 内容                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvoke<void>(IPC_CHANNELS.SKILL_ABORT, executionId)`                                                               |
| **Main側戻り値型**  | `boolean`（`false` or `_skillExecutorInstance.abort()` の戻り値）                                                       |
| **Preload変換**     | なし（safeInvoke — ラッパー展開なし）                                                                                   |
| **Renderer到達型**  | `void`（Preload型定義）/ 実際は `boolean`（Main側実装）                                                                 |
| **型一致判定**      | **不一致**: Preload型は `Promise<void>` だが Main 側は `boolean` を返す。Renderer側で戻り値を使用していなければ実害なし |
| **エラー経路**      | Main 側 throw（バリデーション / IPC検証）→ IPC エラー伝播 → `Promise.reject`                                            |

### 4. getExecutionStatus

| 項目                | 内容                                                                         |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| **Preload呼び出し** | `safeInvoke<ExecutionInfo                                                    | null>(IPC_CHANNELS.SKILL_GET_STATUS, executionId)` |
| **Main側戻り値型**  | `ExecutionInfo                                                               | null`                                              |
| **Preload変換**     | なし（safeInvoke — ラッパー展開なし）                                        |
| **Renderer到達型**  | `ExecutionInfo                                                               | null`                                              |
| **型一致判定**      | **一致**: Main 側の直接返却型と Preload 型が一致                             |
| **エラー経路**      | Main 側 throw（バリデーション / IPC検証）→ IPC エラー伝播 → `Promise.reject` |

### 5. onPermissionRequest

| 項目                | 内容                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeOn<SkillPermissionRequest>(IPC_CHANNELS.SKILL_PERMISSION_REQUEST, callback)` |
| **Main側送出**      | イベント送出（`mainWindow.webContents.send`）                                     |
| **Preload変換**     | `ipcRenderer.on` でリスナー登録                                                   |
| **Renderer到達型**  | `SkillPermissionRequest`                                                          |
| **型一致判定**      | Main 側の送出データが `SkillPermissionRequest` であれば一致                       |
| **エラー経路**      | なし（イベントリスナー方式）                                                      |

### 6. sendPermissionResponse

| 項目                | 内容                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| **Preload呼び出し** | `safeInvoke<{ success: boolean }>(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, response)` |
| **Main側戻り値型**  | `{ success: boolean }`                                                               |
| **Preload変換**     | なし（safeInvoke — ラッパー展開なし）                                                |
| **Renderer到達型**  | `{ success: boolean }`                                                               |
| **型一致判定**      | **一致**: Main 側ハンドラの戻り値型次第                                              |
| **エラー経路**      | Main 側 throw → IPC エラー伝播                                                       |

### 7. list

| 項目                | 内容                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_LIST)`                                   |
| **Main側戻り値型**  | `{ success: true, data: result.skills }` / `{ success: false, error: string }`                 |
| **Preload変換**     | `safeInvokeUnwrap` がラッパーを展開し `result.data`（= `result.skills`）を返す                 |
| **Renderer到達型**  | `SkillMetadata[]`                                                                              |
| **型一致判定**      | **要確認**: `scanAvailableSkills()` の戻り値 `result.skills` が `SkillMetadata[]` であれば一致 |
| **エラー経路**      | Main 側 `{ success: false }` → `safeInvokeUnwrap` が `new Error(error)` を throw               |

### 8. getImported

| 項目                | 内容                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<ImportedSkill[]>(IPC_CHANNELS.SKILL_GET_IMPORTED)`             |
| **Main側戻り値型**  | `{ success: true, data: skills }` / `{ success: false, error: string }`          |
| **Preload変換**     | `safeInvokeUnwrap` がラッパーを展開し `result.data`（= `skills`）を返す          |
| **Renderer到達型**  | `ImportedSkill[]`                                                                |
| **型一致判定**      | **要確認**: `getImportedSkills()` の戻り値が `ImportedSkill[]` であれば一致      |
| **エラー経路**      | Main 側 `{ success: false }` → `safeInvokeUnwrap` が `new Error(error)` を throw |

### 9. rescan

| 項目                | 内容                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| **Preload呼び出し** | `safeInvokeUnwrap<SkillMetadata[]>(IPC_CHANNELS.SKILL_SCAN)`                   |
| **Main側戻り値型**  | `{ success: true, data: result.skills }` / `{ success: false, error: string }` |
| **Preload変換**     | `safeInvokeUnwrap` がラッパーを展開                                            |
| **Renderer到達型**  | `SkillMetadata[]`                                                              |
| **型一致判定**      | list と同一パターン                                                            |
| **エラー経路**      | Main 側 `{ success: false }` → `safeInvokeUnwrap` が throw                     |

### 10. import

| 項目                | 内容                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvoke<ImportedSkill>(IPC_CHANNELS.SKILL_IMPORT, skillName)`                                                                                                                                 |
| **Main側戻り値型**  | `ImportedSkill`（直接返却 — ラッパーなし）                                                                                                                                                        |
| **Preload変換**     | なし（safeInvoke — ラッパー展開なし）                                                                                                                                                             |
| **Renderer到達型**  | `ImportedSkill`                                                                                                                                                                                   |
| **型一致判定**      | **一致**: Main 側が `ImportedSkill` を直接返し、Preload 側は `safeInvoke` で直接受け取る。ラッパーを使っていないため unwrap も不要                                                                |
| **エラー経路**      | Main 側 throw `{ code, message }` → IPC エラー伝播 → `Promise.reject`。他チャネル（list等）の `{ success: false, error }` パターンとは異なり、Renderer側では `catch` でエラーを受け取る必要がある |
| **特記事項**        | **レスポンス形式不統一**: 他の管理系 API（list, getImported, rescan）は `safeInvokeUnwrap` でラッパーを展開するが、import だけは `safeInvoke` で直接返却。エラーハンドリング方式が完全に異なる    |

### 11. remove

| 項目                | 内容                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvoke<RemoveResult>(IPC_CHANNELS.SKILL_REMOVE, skillName)`                                                  |
| **Main側戻り値型**  | `RemoveResult`（= `{ success: boolean, removed: boolean }`）（直接返却）                                          |
| **Preload変換**     | なし（safeInvoke — ラッパー展開なし）                                                                             |
| **Renderer到達型**  | `RemoveResult`                                                                                                    |
| **型一致判定**      | **一致**: Main 側が `RemoveResult` を直接返し、Preload は `safeInvoke` で直接受け取る                             |
| **エラー経路**      | Main 側 throw `{ code, message }` → IPC エラー伝播 → `Promise.reject`                                             |
| **特記事項**        | import と同一パターンの不統一。`RemoveResult.success` フィールドがラッパーの `success` と名前が被り混同リスクあり |

### 12. onComplete

| 項目                | 内容                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| **Preload呼び出し** | `safeOn<{ executionId: string }>(IPC_CHANNELS.SKILL_COMPLETE, callback)` |
| **Main側送出**      | イベント送出                                                             |
| **Renderer到達型**  | `{ executionId: string }`                                                |
| **型一致判定**      | Main 側の送出データ型次第                                                |

### 13. onError

| 項目                | 内容                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| **Preload呼び出し** | `safeOn<{ executionId: string; error: string }>(IPC_CHANNELS.SKILL_ERROR, callback)` |
| **Main側送出**      | イベント送出                                                                         |
| **Renderer到達型**  | `{ executionId: string; error: string }`                                             |
| **型一致判定**      | Main 側の送出データ型次第                                                            |

### 14. readFile

| 項目                | 内容                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_READ_FILE, { skillName, relativePath })` |
| **Main側戻り値型**  | `{ success: true, data: content }` / `{ success: false, error: string }`              |
| **Preload変換**     | `safeInvokeUnwrap` がラッパーを展開し `result.data` を返す                            |
| **Renderer到達型**  | `string`                                                                              |
| **型一致判定**      | **一致**: `skillFileManager.readFile()` は `string` を返す                            |
| **エラー経路**      | Main 側 `{ success: false }` → `safeInvokeUnwrap` が throw                            |

### 15. writeFile

| 項目                | 内容                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_WRITE_FILE, { skillName, relativePath, content })`                          |
| **Main側戻り値型**  | `{ success: true }` **（data なし）** / `{ success: false, error: string }`                                            |
| **Preload変換**     | `safeInvokeUnwrap` が `result.data as void` を返す（`data` は `undefined`）                                            |
| **Renderer到達型**  | `void`（実質 `undefined`）                                                                                             |
| **型一致判定**      | **実質一致**: `void` の場合 `data` が `undefined` でも問題ないが、`IpcResult` 型の `data?: T` は厳密には省略されている |
| **エラー経路**      | Main 側 `{ success: false }` → `safeInvokeUnwrap` が throw                                                             |

### 16. createFile

| 項目                | 内容                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_CREATE_FILE, { skillName, relativePath, content })` |
| **Main側戻り値型**  | writeFile と同一（`data` なし）                                                                |
| **Preload変換**     | writeFile と同一                                                                               |
| **Renderer到達型**  | `void`                                                                                         |
| **型一致判定**      | writeFile と同一                                                                               |

### 17. deleteFile

| 項目                | 内容                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DELETE_FILE, { skillName, relativePath })` |
| **Main側戻り値型**  | writeFile と同一（`data` なし）                                                       |
| **Preload変換**     | writeFile と同一                                                                      |
| **Renderer到達型**  | `void`                                                                                |
| **型一致判定**      | writeFile と同一                                                                      |

### 18. listBackups

| 項目                | 内容                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<BackupInfo[]>(IPC_CHANNELS.SKILL_LIST_BACKUPS, { skillName })` |
| **Main側戻り値型**  | `{ success: true, data: backups }` / `{ success: false, error: string }`         |
| **Preload変換**     | `safeInvokeUnwrap` がラッパーを展開                                              |
| **Renderer到達型**  | `BackupInfo[]`                                                                   |
| **型一致判定**      | **一致**: `skillFileManager.listBackups()` の戻り値型次第                        |
| **エラー経路**      | Main 側 `{ success: false }` → `safeInvokeUnwrap` が throw                       |

### 19. restoreBackup

| 項目                | 内容                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Preload呼び出し** | `safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_RESTORE_BACKUP, { skillName, backupPath })` |
| **Main側戻り値型**  | writeFile と同一（`data` なし）                                                        |
| **Preload変換**     | writeFile と同一                                                                       |
| **Renderer到達型**  | `void`                                                                                 |
| **型一致判定**      | writeFile と同一                                                                       |

---

## safeInvoke / safeInvokeUnwrap 使用状況サマリー

| メソッド               | 呼び出し方式       | Main 側レスポンス形式                  | 整合性                                                   |
| ---------------------- | ------------------ | -------------------------------------- | -------------------------------------------------------- |
| execute                | `safeInvokeUnwrap` | ラッパー `{ success, data/error }`     | **OK**                                                   |
| onStream               | `safeOn`           | イベント送出                           | **OK**                                                   |
| abort                  | `safeInvoke`       | **直接返却** (`boolean`)               | **NG**: Preload型 `void` とMain戻り値 `boolean` が不一致 |
| getExecutionStatus     | `safeInvoke`       | **直接返却** (`ExecutionInfo \| null`) | **OK**: 型一致                                           |
| onPermissionRequest    | `safeOn`           | イベント送出                           | **OK**                                                   |
| sendPermissionResponse | `safeInvoke`       | 直接返却 `{ success: boolean }`        | **OK**                                                   |
| list                   | `safeInvokeUnwrap` | ラッパー                               | **OK**                                                   |
| getImported            | `safeInvokeUnwrap` | ラッパー                               | **OK**                                                   |
| rescan                 | `safeInvokeUnwrap` | ラッパー                               | **OK**                                                   |
| import                 | `safeInvoke`       | **直接返却** (`ImportedSkill`)         | **OK**: 型一致（ただしレスポンス形式不統一）             |
| remove                 | `safeInvoke`       | **直接返却** (`RemoveResult`)          | **OK**: 型一致（ただしレスポンス形式不統一）             |
| onComplete             | `safeOn`           | イベント送出                           | **OK**                                                   |
| onError                | `safeOn`           | イベント送出                           | **OK**                                                   |
| readFile               | `safeInvokeUnwrap` | ラッパー                               | **OK**                                                   |
| writeFile              | `safeInvokeUnwrap` | ラッパー（data欠落）                   | **実質OK**（void）                                       |
| createFile             | `safeInvokeUnwrap` | ラッパー（data欠落）                   | **実質OK**（void）                                       |
| deleteFile             | `safeInvokeUnwrap` | ラッパー（data欠落）                   | **実質OK**（void）                                       |
| listBackups            | `safeInvokeUnwrap` | ラッパー                               | **OK**                                                   |
| restoreBackup          | `safeInvokeUnwrap` | ラッパー（data欠落）                   | **実質OK**（void）                                       |

---

## 重要な不整合まとめ

### 不整合1: safeInvoke と safeInvokeUnwrap の使い分けがレスポンス形式と連動していない

**期待される対応関係**:

- Main 側がラッパー返却 → Preload 側で `safeInvokeUnwrap`
- Main 側が直接返却 → Preload 側で `safeInvoke`

**実際の状況**: import / remove / abort / getExecutionStatus は Main 側が直接返却で Preload 側が `safeInvoke` を使用 — この4つは対応関係が正しい。ただし、同じ「スキル管理 API」カテゴリの list / getImported / rescan はラッパー + `safeInvokeUnwrap` を使用しており、カテゴリ内で形式が混在している。

### 不整合2: abort の戻り値型不一致

- **Main側**: `boolean` を return
- **Preload型定義**: `Promise<void>`
- **影響**: Renderer側で `abort` の戻り値を使用しなければ実害なし。使用する場合は `boolean` 値が `void` として無視される

### 不整合3: エラーハンドリング経路の二重化

ラッパー使用チャネル（list, getImported 等）のエラー:

1. Main 側で `{ success: false, error: "message" }` を return
2. Preload 側の `safeInvokeUnwrap` で `throw new Error(error)` に変換
3. Renderer 側で `catch` で受け取る

直接返却チャネル（import, remove）のエラー:

1. Main 側で throw `{ code: "...", message: "..." }`
2. Electron IPC がエラーをシリアライズして Renderer に伝播
3. Renderer 側で `catch` で受け取る（ただしエラーオブジェクトの形状が異なる可能性がある）

**リスク**: Renderer側のエラーハンドリングで、`Error` オブジェクト（`error.message`）を期待するコードが、直接返却チャネルのエラー（`{ code, message }` 形式）を正しく処理できない可能性がある。

### 不整合4: skill:get-detail の Preload API 欠落

skillHandlers.ts には `skill:get-detail` ハンドラが登録されているが、skill-api.ts の `SkillAPI` インターフェースに対応するメソッドが存在しない。Renderer からこのチャネルを呼び出す手段が公式 API には含まれていない。
