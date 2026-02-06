# Phase 1 成果物: API比較分析表

## 作成日: 2026-02-05

## API#1: `apps/desktop/src/preload/skill-api.ts`

### メソッド一覧（14メソッド、うち実質13 + エイリアス1）

| #   | メソッド                 | シグネチャ                                                                         | 実装状態                | IPCチャンネル               |
| --- | ------------------------ | ---------------------------------------------------------------------------------- | ----------------------- | --------------------------- |
| 1   | `execute`                | `(request: SkillExecutionRequest) => Promise<SkillExecutionResponse>`              | 実装済み                | `SKILL_EXECUTE`             |
| 2   | `onStream`               | `(callback: (message: SkillStreamMessage) => void) => () => void`                  | 実装済み                | `SKILL_STREAM`              |
| 3   | `abort`                  | `(executionId: string) => Promise<boolean>`                                        | 実装済み                | `SKILL_ABORT`               |
| 4   | `getExecutionStatus`     | `(executionId: string) => Promise<ExecutionInfo \| null>`                          | 実装済み                | `SKILL_GET_STATUS`          |
| 5   | `onPermissionRequest`    | `(callback: (request: SkillPermissionRequest) => void) => () => void`              | 実装済み                | `SKILL_PERMISSION_REQUEST`  |
| 6   | `sendPermissionResponse` | `(response: SkillPermissionResponse) => Promise<{ success: boolean }>`             | 実装済み                | `SKILL_PERMISSION_RESPONSE` |
| 7   | `list`                   | `() => Promise<SkillMetadata[]>`                                                   | **スタブ** (空配列返却) | 未接続                      |
| 8   | `getImported`            | `() => Promise<ImportedSkill[]>`                                                   | **スタブ** (空配列返却) | 未接続                      |
| 9   | `rescan`                 | `() => Promise<SkillMetadata[]>`                                                   | **スタブ** (空配列返却) | 未接続                      |
| 10  | `import`                 | `(skillName: string) => Promise<ImportedSkill>`                                    | **スタブ** (ダミー返却) | 未接続                      |
| 11  | `remove`                 | `(skillName: string) => Promise<boolean>`                                          | **スタブ** (true返却)   | 未接続                      |
| 12  | `onComplete`             | `(callback: (data: { executionId: string }) => void) => () => void`                | 実装済み                | `SKILL_COMPLETE`            |
| 13  | `onError`                | `(callback: (data: { executionId: string; error: string }) => void) => () => void` | 実装済み                | `SKILL_ERROR`               |
| 14  | `respondToPermission`    | `(response: SkillPermissionResponse) => Promise<{ success: boolean }>`             | エイリアス              | `SKILL_PERMISSION_RESPONSE` |

### 公開パス

- `window.electronAPI.skill` （preload/index.ts L342経由）
- `window.skillAPI` （preload/index.ts L542で別途exposeInMainWorld）

---

## API#2: `apps/desktop/src/renderer/preload/index.ts`

### メソッド一覧（6メソッド）

| #   | メソッド        | シグネチャ                                                               | 実装状態 | IPCチャンネル                        |
| --- | --------------- | ------------------------------------------------------------------------ | -------- | ------------------------------------ |
| 1   | `listAvailable` | `() => Promise<OperationResult<Skill[]>>`                                | 実装済み | `"skill:list"` (ハードコード)        |
| 2   | `listImported`  | `() => Promise<OperationResult<Skill[]>>`                                | 実装済み | `"skill:getImported"` (ハードコード) |
| 3   | `import`        | `(skillIds: string[]) => Promise<OperationResult<void>>`                 | 実装済み | `"skill:import"` (ハードコード)      |
| 4   | `remove`        | `(skillId: string) => Promise<OperationResult<void>>`                    | 実装済み | `"skill:remove"` (ハードコード)      |
| 5   | `getDetail`     | `(skillId: string) => Promise<OperationResult<Skill>>`                   | 実装済み | `"skill:get-detail"` (ハードコード)  |
| 6   | `execute`       | `(skillId: string, params?) => Promise<OperationResult<SkillRunResult>>` | 実装済み | `"skill:execute"` (ハードコード)     |

### 公開パス

- Rendererプロセス内で直接import（`window.electronAPI.invoke`経由でIPC呼び出し）
- **注意**: `window.electronAPI.invoke`という汎用invokを使用しており、`safeInvoke`のホワイトリスト検証を経由していない

---

## 比較表: API#1 vs API#2

| 機能               | API#1 メソッド                                                       | API#2 メソッド                                                  | 差異                                       |
| ------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| スキル一覧取得     | `list()` → `SkillMetadata[]`                                         | `listAvailable()` → `OperationResult<Skill[]>`                  | メソッド名不一致、戻り値型不一致           |
| インポート済み取得 | `getImported()` → `ImportedSkill[]`                                  | `listImported()` → `OperationResult<Skill[]>`                   | メソッド名不一致、戻り値型不一致           |
| スキルインポート   | `import(skillName: string)` → `ImportedSkill`                        | `import(skillIds: string[])` → `OperationResult<void>`          | 引数型不一致（単数vs配列）、戻り値型不一致 |
| スキル削除         | `remove(skillName: string)` → `boolean`                              | `remove(skillId: string)` → `OperationResult<void>`             | 戻り値型不一致                             |
| スキル実行         | `execute(request: SkillExecutionRequest)` → `SkillExecutionResponse` | `execute(skillId, params?)` → `OperationResult<SkillRunResult>` | シグネチャ完全不一致、戻り値型不一致       |
| スキル詳細取得     | なし                                                                 | `getDetail(skillId)` → `OperationResult<Skill>`                 | API#1に存在しない                          |
| 再スキャン         | `rescan()` → `SkillMetadata[]`                                       | なし                                                            | API#2に存在しない                          |
| ストリーミング     | `onStream(callback)` → `() => void`                                  | なし                                                            | API#2に存在しない                          |
| 中断               | `abort(executionId)` → `boolean`                                     | なし                                                            | API#2に存在しない                          |
| 実行状態取得       | `getExecutionStatus(executionId)` → `ExecutionInfo \| null`          | なし                                                            | API#2に存在しない                          |
| 完了イベント       | `onComplete(callback)` → `() => void`                                | なし                                                            | API#2に存在しない                          |
| エラーイベント     | `onError(callback)` → `() => void`                                   | なし                                                            | API#2に存在しない                          |
| 権限リクエスト     | `onPermissionRequest(callback)` → `() => void`                       | なし                                                            | API#2に存在しない                          |
| 権限応答           | `sendPermissionResponse(response)` → `{ success: boolean }`          | なし                                                            | API#2に存在しない                          |

---

## 主要な差異サマリ

### 1. 戻り値型の不一致

- API#1: 直接型（`SkillMetadata[]`, `ImportedSkill[]` 等）
- API#2: `OperationResult<T>` ラッパー型（`{ success: boolean; data?: T; error?: string }`）

### 2. メソッド名の不一致

- `list` vs `listAvailable`
- `getImported` vs `listImported`

### 3. シグネチャの不一致

- `import`: 単一文字列 vs 配列
- `execute`: リクエストオブジェクト vs 分割引数

### 4. IPCチャンネル接続方法の不一致

- API#1: `safeInvoke`/`safeOn`（ホワイトリスト検証付き）+ `IPC_CHANNELS`定数
- API#2: `window.electronAPI.invoke`（汎用、ハードコード文字列）

### 5. 機能カバレッジの差

- API#1のみ: ストリーミング・イベント・権限・中断・実行状態（8メソッド）
- API#2のみ: `getDetail`（1メソッド）
