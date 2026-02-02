# 要件定義書 - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

## 1. 現行IPCハンドラー分析

### 1.1 登録チャネル一覧（skillHandlers.ts: 264行）

| #   | チャネル定数         | チャネル文字列         | パラメータ型                                            | 戻り値型                          | SkillServiceメソッド                | validateIpcSender                               |
| --- | -------------------- | ---------------------- | ------------------------------------------------------- | --------------------------------- | ----------------------------------- | ----------------------------------------------- | --- |
| 1   | SKILL_LIST_AVAILABLE | `skill:list-available` | `{ basePath?: string; forceRefresh?: boolean }`         | `OperationResult<Skill[]>`        | `scanAvailableSkills(forceRefresh)` | Yes                                             |
| 2   | SKILL_LIST_IMPORTED  | `skill:list-imported`  | なし                                                    | `OperationResult<Skill[]>`        | `getImportedSkills()`               | Yes                                             |
| 3   | SKILL_IMPORT         | `skill:import`         | `{ skillIds: string[] }`                                | `ImportResult`                    | `importSkills(skillIds)`            | Yes                                             |
| 4   | SKILL_REMOVE         | `skill:remove`         | `{ skillId: string }`                                   | `OperationResult<RemoveResult>`   | `removeSkill(skillId)`              | Yes                                             |
| 5   | SKILL_GET_DETAIL     | `skill:get-detail`     | `{ skillId: string }`                                   | `OperationResult<Skill            | null>`                              | `getSkillById(skillId)`                         | Yes |
| 6   | SKILL_EXECUTE        | `skill:execute`        | `{ skillId: string; params?: Record<string, unknown> }` | `OperationResult<SkillRunResult>` | `executeSkill(skillId, params)`     | Yes                                             |
| 7   | SKILL_ABORT          | `skill:abort`          | `executionId: string`                                   | `boolean`                         | `SkillExecutor.abort(executionId)`  | Yes                                             |
| 8   | SKILL_GET_STATUS     | `skill:get-status`     | `executionId: string`                                   | `ExecutionStatus                  | null`                               | `SkillExecutor.getExecutionStatus(executionId)` | Yes |

### 1.2 チャネルホワイトリスト（channels.ts）

**ALLOWED_INVOKE_CHANNELS** (lines 374-381):

- `SKILL_LIST_AVAILABLE`, `SKILL_LIST_IMPORTED`, `SKILL_IMPORT`, `SKILL_REMOVE`
- `SKILL_GET_DETAIL`, `SKILL_EXECUTE`, `SKILL_ABORT`, `SKILL_GET_STATUS`

**ALLOWED_ON_CHANNELS** (M→R通知):

- `SKILL_STREAM` - ストリーミングレスポンス
- `SKILL_COMPLETE` - スキルインポート完了イベント
- `SKILL_ERROR` - スキルインポートエラーイベント
- `SKILL_PERMISSION_REQUEST` - 実行中権限リクエスト

### 1.3 ハンドラー登録フロー（ipc/index.ts: 105-126行）

```
1. SkillStore作成 (schema: { importedSkillIds: string[] })
2. SkillScanner作成 (skillBasePath: ~/.claude/skills)
3. SkillParser作成
4. SkillImportManager作成 (skillStore)
5. SkillService作成 (Scanner, Parser, ImportManager)
6. registerSkillHandlers(mainWindow, skillService)
```

### 1.4 戻り値パターン

| パターン                  | チャネル                                           | 形式                                                               |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ | ----- |
| OperationResult<T> ラップ | list-available, list-imported, get-detail, execute | `{ success: true, data: T }` / `{ success: false, error: string }` |
| 直接返却                  | import                                             | `ImportResult` (success, importedCount, errors)                    |
| 直接返却                  | abort                                              | `boolean`                                                          |
| 直接返却                  | get-status                                         | `ExecutionStatus                                                   | null` |
| OperationResult ラップ    | remove                                             | `{ success: true, data: RemoveResult }`                            |

---

## 2. SkillService ファサード分析

### 2.1 公開メソッドマッピング

| メソッド                             | 引数                              | 戻り値                     | 対応チャネル         |
| ------------------------------------ | --------------------------------- | -------------------------- | -------------------- |
| `scanAvailableSkills(forceRefresh?)` | `boolean`                         | `Promise<SkillScanResult>` | skill:list-available |
| `getImportedSkills()`                | なし                              | `Promise<Skill[]>`         | skill:list-imported  |
| `importSkills(skillIds)`             | `string[]`                        | `Promise<ImportResult>`    | skill:import         |
| `removeSkill(skillId)`               | `string`                          | `Promise<RemoveResult>`    | skill:remove         |
| `getSkillById(id)`                   | `string`                          | `Promise<Skill \| null>`   | skill:get-detail     |
| `executeSkill(skillId, params?)`     | `string, Record<string, unknown>` | `Promise<SkillRunResult>`  | skill:execute        |
| `clearCache()`                       | なし                              | `void`                     | （直接対応なし）     |

### 2.2 モジュールレベル状態

- `_skillExecutorInstance`: SkillExecutor インスタンス（ハンドラー登録時に生成）
  - `skill:abort`, `skill:get-status` で使用
  - `unregisterSkillHandlers()` で null 化

---

## 3. テストケース詳細要件

### 3.1 基本12テストケース（TC-01〜TC-12）

| TC    | チャネル                      | テストケース                     | 前提条件(Mock)                                                                        | 操作                                   | 期待結果                                               | セキュリティ検証      |
| ----- | ----------------------------- | -------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ | --------------------- |
| TC-01 | skill:list-available          | スキル一覧取得成功               | `scanAvailableSkills` → `{ skills: [...], errors: [], scannedAt }`                    | handler呼び出し                        | `{ success: true, data: [...skills] }`                 | validateIpcSender呼出 |
| TC-02 | skill:list-available          | スキャンエラー処理               | `scanAvailableSkills` → throw Error("Scan failed")                                    | handler呼び出し                        | `{ success: false, error: "Scan failed" }`             | validateIpcSender呼出 |
| TC-03 | skill:list-imported           | インポート済みスキル取得成功     | `getImportedSkills` → `[skill1, skill2]`                                              | handler呼び出し                        | `{ success: true, data: [...] }`                       | validateIpcSender呼出 |
| TC-04 | skill:import                  | スキルインポート成功             | `importSkills` → `{ success: true, importedCount: 1, errors: [] }`                    | handler("new-skill")                   | `{ success: true, importedCount: 1 }`                  | validateIpcSender呼出 |
| TC-05 | skill:import                  | 既存スキルインポートエラー       | `importSkills` → `{ success: false, importedCount: 0, errors: ["Already imported"] }` | handler("existing")                    | エラー含むImportResult                                 | validateIpcSender呼出 |
| TC-06 | skill:import                  | 存在しないスキルインポートエラー | `importSkills` → throw Error("Not found")                                             | handler("nonexistent")                 | エラーレスポンス                                       | validateIpcSender呼出 |
| TC-07 | skill:remove                  | スキル削除成功                   | `removeSkill` → `{ success: true, removed: true }`                                    | handler("skill-to-remove")             | `{ success: true, data: { removed: true } }`           | validateIpcSender呼出 |
| TC-08 | skill:remove                  | 未インポートスキル削除エラー     | `removeSkill` → throw Error("Not imported")                                           | handler("unknown")                     | `{ success: false, error: "Not imported" }`            | validateIpcSender呼出 |
| TC-09 | skill:execute                 | 実行開始・実行ID返却             | `executeSkill` → `{ executionId: "exec-123", status: "success", ... }`                | handler実行リクエスト                  | `{ success: true, data: { executionId: "exec-123" } }` | validateIpcSender呼出 |
| TC-10 | skill:abort                   | 実行中止                         | `SkillExecutor.abort` → `true`                                                        | handler("exec-123")                    | `true`                                                 | validateIpcSender呼出 |
| TC-11 | skill:permission:response     | 権限応答転送                     | SkillExecutor.handlePermissionResponse Mock                                           | handler({ requestId, approved: true }) | 正常転送確認                                           | 対応ハンドラー確認    |
| TC-12 | skill:list-available (rescan) | 再スキャン                       | `scanAvailableSkills` → 更新リスト（forceRefresh=true）                               | handler({ forceRefresh: true })        | 更新されたスキルリスト                                 | validateIpcSender呼出 |

### 3.2 IMP-002 追加10テストケース（TC-13〜TC-22）

**注記**: これらのチャネル（skill:settings:_, skill:permissions:_, skill:cache:\*）は現行コードベースに未実装。テスト作成時にハンドラーを同時追加する方針とする。

| TC    | チャネル                 | テストケース               | 前提条件(Mock)                                      | 操作                            | 期待結果                                   |
| ----- | ------------------------ | -------------------------- | --------------------------------------------------- | ------------------------------- | ------------------------------------------ |
| TC-13 | skill:settings:get       | 設定取得成功               | `getSettings` → 設定オブジェクト                    | handler(skillName)              | `{ success: true, data: settings }`        |
| TC-14 | skill:settings:get       | 存在しないスキル設定エラー | `getSettings` → throw Error("Not found")            | handler("unknown")              | `{ success: false, error: "Not found" }`   |
| TC-15 | skill:settings:update    | 設定更新成功               | `updateSettings` → 更新後設定                       | handler(skillName, newSettings) | `{ success: true, data: updatedSettings }` |
| TC-16 | skill:settings:update    | バリデーションエラー       | `updateSettings` → throw Error("Validation failed") | handler(invalid)                | `{ success: false, error: "..." }`         |
| TC-17 | skill:permissions:get    | 権限取得成功               | `getPermissions` → 権限オブジェクト                 | handler(skillName)              | `{ success: true, data: permissions }`     |
| TC-18 | skill:permissions:grant  | 権限付与成功               | `grantPermission` → 成功                            | handler(skillName, permission)  | `{ success: true }`                        |
| TC-19 | skill:permissions:revoke | 権限取消成功               | `revokePermission` → 成功                           | handler(skillName, permission)  | `{ success: true }`                        |
| TC-20 | skill:cache:get          | キャッシュ取得成功         | `getCache` → キャッシュデータ                       | handler(key)                    | `{ success: true, data: cachedData }`      |
| TC-21 | skill:cache:set          | キャッシュ設定成功         | `setCache` → 成功                                   | handler(key, value, ttl)        | `{ success: true }`                        |
| TC-22 | skill:cache:invalidate   | キャッシュ無効化成功       | `invalidateCache` → 成功                            | handler(pattern)                | `{ success: true }`                        |

---

## 4. 既存テストとの差別化分析

| 観点             | 既存ユニットテスト (skillHandlers.test.ts: 690行) | 既存統合テスト (skillHandlers.integration.test.ts: 273行) | 既存実行テスト (skillHandlers.execute.test.ts: 581行) | TASK-8C-A テスト（本タスク）                            |
| ---------------- | ------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| テスト範囲       | 個別ハンドラー関数・入力バリデーション            | electron-store永続化連携                                  | skill:execute特化                                     | IPC登録→ハンドラー→Service連携フルパス                  |
| Mock対象         | ipcMain, SkillService全メソッド                   | SkillScanner/Parser（実electron-store使用）               | ipcMain, SkillService                                 | ipcMain（ハンドラーMap方式）+ SkillService Partial Mock |
| セキュリティ検証 | validateIpcSender + DevTools拒否                  | なし                                                      | validateIpcSender + 不正BrowserWindow                 | validateIpcSender + チャネルホワイトリスト              |
| エラーパス       | 個別バリデーションエラー                          | 永続化エラー（重複インポート等）                          | 実行固有エラー                                        | OperationResult エラーパターン網羅                      |
| カバレッジ焦点   | ハンドラー単体のブランチ                          | 永続化の状態遷移                                          | 実行フローのブランチ                                  | 全チャネル統合パス                                      |
| 追加チャネル     | 基本5チャネル                                     | 基本5チャネル                                             | skill:execute                                         | 8基本 + 10追加 = 18チャネル                             |
| テストケース数   | ~25                                               | ~8                                                        | ~15                                                   | 22                                                      |

### TASK-8C-A の独自価値

1. **統合パスの検証**: `registerSkillHandlers` → `ipcMain.handle` 登録 → ハンドラー実行 → `SkillService` 呼び出し → `OperationResult` 変換の一連のフローを検証
2. **全チャネル網羅**: 基本8チャネル + IMP-002追加10チャネル = 18チャネルの統合テスト
3. **OperationResult統一検証**: 各チャネルの戻り値が統一パターンに準拠していることを検証
4. **チャネルホワイトリスト準拠**: channels.ts定義との整合性を検証

---

## 5. 型定義サマリー

### OperationResult<T>

```typescript
interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### ImportResult

```typescript
interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}
```

### RemoveResult

```typescript
interface RemoveResult {
  success: boolean;
  removed: boolean;
}
```

### SkillScanResult

```typescript
interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}
```

### SkillRunResult

```typescript
interface SkillRunResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}
```
