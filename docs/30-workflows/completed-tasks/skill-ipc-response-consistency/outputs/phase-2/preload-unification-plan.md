# Preload 単一化設計: safeInvoke / safeInvokeUnwrap 使い分け方針

> **Phase 2 Task 2-2 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: outputs/phase-1/preload-mapping.md, outputs/phase-2/contract-profiles.md

---

## 1. 設計方針

Preload 層は「契約プロファイルに従って safeInvoke / safeInvokeUnwrap を選択する」というルールを厳格に適用し、Renderer に対して単一の型解釈を提供する。

### 選択ルール

| プロファイル                | Preload 関数          | 条件                               | Renderer 受け取り型          |
| --------------------------- | --------------------- | ---------------------------------- | ---------------------------- |
| Profile-A（ラッパー返却型） | `safeInvokeUnwrap<T>` | Main が `{ success, data }` を返す | `T`（data フィールドの中身） |
| Profile-B（直接返却型）     | `safeInvoke<T>`       | Main が `T` を直接返す             | `T`（Main の戻り値そのもの） |
| Profile-C（プリミティブ型） | `safeInvoke<T>`       | Main がプリミティブを返す          | `boolean` / `T \| null`      |
| Profile-D（void 型）        | `safeInvoke<void>`    | Main が戻り値なし                  | `void`                       |

---

## 2. 現状の safeInvoke / safeInvokeUnwrap 使用状況

### 2.1 safeInvokeUnwrap 使用メソッド（Profile-A 対応）

| #   | Preload メソッド | IPC チャネル         | Renderer 到達型          | Main 側レスポンス                  | 整合性  |
| --- | ---------------- | -------------------- | ------------------------ | ---------------------------------- | ------- |
| 1   | `execute`        | SKILL_EXECUTE        | `SkillExecutionResponse` | `{ success, data: result }`        | OK      |
| 2   | `list`           | SKILL_LIST           | `SkillMetadata[]`        | `{ success, data: result.skills }` | OK      |
| 3   | `getImported`    | SKILL_GET_IMPORTED   | `ImportedSkill[]`        | `{ success, data: skills }`        | OK      |
| 4   | `rescan`         | SKILL_SCAN           | `SkillMetadata[]`        | `{ success, data: result.skills }` | OK      |
| 5   | `readFile`       | SKILL_READ_FILE      | `string`                 | `{ success, data: content }`       | OK      |
| 6   | `writeFile`      | SKILL_WRITE_FILE     | `void`                   | `{ success: true }` (data 欠落)    | 実質 OK |
| 7   | `createFile`     | SKILL_CREATE_FILE    | `void`                   | `{ success: true }` (data 欠落)    | 実質 OK |
| 8   | `deleteFile`     | SKILL_DELETE_FILE    | `void`                   | `{ success: true }` (data 欠落)    | 実質 OK |
| 9   | `listBackups`    | SKILL_LIST_BACKUPS   | `BackupInfo[]`           | `{ success, data: backups }`       | OK      |
| 10  | `restoreBackup`  | SKILL_RESTORE_BACKUP | `void`                   | `{ success: true }` (data 欠落)    | 実質 OK |

### 2.2 safeInvoke 使用メソッド（Profile-B / C 対応）

| #   | Preload メソッド         | IPC チャネル              | Renderer 到達型         | Main 側レスポンス            | 整合性                   |
| --- | ------------------------ | ------------------------- | ----------------------- | ---------------------------- | ------------------------ |
| 11  | `import`                 | SKILL_IMPORT              | `ImportedSkill`         | `ImportedSkill` 直接         | OK (Profile-B)           |
| 12  | `remove`                 | SKILL_REMOVE              | `RemoveResult`          | `RemoveResult` 直接          | OK (Profile-B)           |
| 13  | `abort`                  | SKILL_ABORT               | `void` (型定義)         | `boolean` (実装)             | **型不一致** (Profile-C) |
| 14  | `getExecutionStatus`     | SKILL_GET_STATUS          | `ExecutionInfo \| null` | `ExecutionInfo \| null` 直接 | OK (Profile-C)           |
| 15  | `sendPermissionResponse` | SKILL_PERMISSION_RESPONSE | `{ success: boolean }`  | `{ success: boolean }`       | OK                       |

### 2.3 safeOn 使用メソッド（イベントリスナー）

| #   | Preload メソッド      | IPC チャネル             | データ型                                 |
| --- | --------------------- | ------------------------ | ---------------------------------------- |
| 16  | `onStream`            | SKILL_STREAM             | `SkillStreamMessage`                     |
| 17  | `onPermissionRequest` | SKILL_PERMISSION_REQUEST | `SkillPermissionRequest`                 |
| 18  | `onComplete`          | SKILL_COMPLETE           | `{ executionId: string }`                |
| 19  | `onError`             | SKILL_ERROR              | `{ executionId: string; error: string }` |

---

## 3. 不整合箇所と対応方針

### 3.1 skill:abort の型不一致（唯一の修正対象）

| 項目              | 内容                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **現状**          | Preload: `safeInvoke<void>` / SkillAPI 型: `Promise<void>`                                                                                                                                  |
| **Main 実装**     | `return false` / `return _skillExecutorInstance.abort(executionId)` -- `boolean` 返却                                                                                                       |
| **Renderer 使用** | `agentSlice.ts` L695, `useSkillExecution.ts` L178 -- 戻り値未使用（fire-and-forget）                                                                                                        |
| **対応方針**      | Profile-C として文書化。Preload の `safeInvoke<void>` は維持（Renderer 側で boolean を使用していないため実害なし）。SkillAPI 型定義にコメントを追加し、Main 側が boolean を返す旨を明記する |
| **理由**          | `safeInvoke<boolean>` に変更すると Renderer 側で明示的に boolean を受け取る API になるが、実際には使用されていない。void のまま維持する方が API の意図（中断命令の送信）を正確に表現する    |

### 3.2 Preload API 未定義チャネル

skill:analyze, skill:improve, skill:optimize, skill:optimize:variants, skill:optimize:evaluate, skill:get-detail の6チャネルは Preload API (`skill-api.ts`) に対応メソッドが定義されていない。Main 側ハンドラのみ存在する。

| チャネル                | Preload メソッド | 対応状況     |
| ----------------------- | ---------------- | ------------ |
| skill:analyze           | なし             | ハンドラのみ |
| skill:improve           | なし             | ハンドラのみ |
| skill:optimize          | なし             | ハンドラのみ |
| skill:optimize:variants | なし             | ハンドラのみ |
| skill:optimize:evaluate | なし             | ハンドラのみ |
| skill:get-detail        | なし             | ハンドラのみ |

本タスクのスコープではこれらの Preload メソッド追加は行わない（別タスクとして管理）。

---

## 4. TO-BE の Preload API シグネチャ

### 4.1 変更なし（現状維持）メソッド

```typescript
// Profile-A: safeInvokeUnwrap
execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
list: () => Promise<SkillMetadata[]>;
getImported: () => Promise<ImportedSkill[]>;
rescan: () => Promise<SkillMetadata[]>;
readFile: (skillName: string, relativePath: string) => Promise<string>;
writeFile: (skillName: string, relativePath: string, content: string) => Promise<void>;
createFile: (skillName: string, relativePath: string, content: string) => Promise<void>;
deleteFile: (skillName: string, relativePath: string) => Promise<void>;
listBackups: (skillName: string) => Promise<BackupInfo[]>;
restoreBackup: (skillName: string, backupPath: string) => Promise<void>;

// Profile-B: safeInvoke
import: (skillName: SkillName) => Promise<ImportedSkill>;
remove: (skillName: SkillName) => Promise<RemoveResult>;

// Profile-C: safeInvoke
abort: (executionId: string) => Promise<void>;  // Main は boolean を返すが Renderer は使用しない
getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
sendPermissionResponse: (response: SkillPermissionResponse) => Promise<{ success: boolean }>;

// イベントリスナー
onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
onPermissionRequest: (callback: (request: SkillPermissionRequest) => void) => () => void;
onComplete: (callback: (data: { executionId: string }) => void) => () => void;
onError: (callback: (data: { executionId: string; error: string }) => void) => () => void;
```

### 4.2 エラー伝播の統一パターン

| プロファイル | Main 側エラー                                           | Preload 変換                                   | Renderer 到達             |
| ------------ | ------------------------------------------------------- | ---------------------------------------------- | ------------------------- |
| Profile-A    | `{ success: false, error: "サニタイズ済みメッセージ" }` | `safeInvokeUnwrap` が `throw new Error(error)` | `catch(error)` で受け取り |
| Profile-A    | `throw { code: "VALIDATION_ERROR", message }`           | Electron IPC がシリアライズ                    | `catch(error)` で受け取り |
| Profile-B    | `throw { code, message }`                               | Electron IPC がシリアライズ                    | `catch(error)` で受け取り |
| Profile-C    | `throw { code: "VALIDATION_ERROR", message }`           | Electron IPC がシリアライズ                    | `catch(error)` で受け取り |

---

## 5. AR-2 準拠検証

| AR-2 制約                                   | 検証結果                                                      |
| ------------------------------------------- | ------------------------------------------------------------- |
| `{ success, data }` 系は `safeInvokeUnwrap` | 全 Profile-A チャネルで `safeInvokeUnwrap` を使用 -- **適合** |
| 直接返却系は `safeInvoke`                   | 全 Profile-B/C チャネルで `safeInvoke` を使用 -- **適合**     |
| skill:import は safeInvoke                  | `safeInvoke<ImportedSkill>` -- **適合**                       |
| skill:remove は safeInvoke                  | `safeInvoke<RemoveResult>` -- **適合**                        |
