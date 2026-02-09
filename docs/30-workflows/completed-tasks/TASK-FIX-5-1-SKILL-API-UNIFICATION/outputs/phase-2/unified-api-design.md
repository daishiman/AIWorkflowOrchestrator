# TASK-FIX-5-1: 統一API設計仕様

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 2 - 設計                           |
| ドキュメント | 統一API設計                        |
| 作成日       | 2026-02-09                         |

## 概要

本ドキュメントでは、SkillAPI の統一的な公開インターフェースを設計する。`window.electronAPI.skill` への完全な統一と、13メソッドの仕様を定義する。

## API公開体系

### 統一パス

```
window.electronAPI.skill  ← 唯一の公開エントリポイント
```

### 現状との比較

| 項目                | Before（現状）            | After（統一後）         |
| ------------------- | ------------------------- | ----------------------- |
| 公開パス数          | 2箇所                     | 1箇所（統一）           |
| `electronAPI.skill` | ✅ 使用可能               | ✅ 使用可能（変更なし） |
| `window.skillAPI`   | ❌ 幽霊型定義（実装なし） | ❌ 削除                 |
| 型安全性            | 低（二重定義）            | 高（単一定義）          |

## インターフェース仕様

### SkillAPI インターフェース全体

```typescript
export interface SkillAPI {
  // Group A: スキル管理（5メソッド）
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  import: (skillName: string) => Promise<ImportedSkill>;
  remove: (skillName: string) => Promise<void>;
  rescan: () => Promise<SkillMetadata[]>;

  // Group B: スキル実行（3メソッド）
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // Group C: イベント リスナー（3メソッド）
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // Group D: 権限管理（2メソッド）
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

## メソッド仕様詳細

### Group A: スキル管理

#### A.1 `list()`

```typescript
list: () => Promise<SkillMetadata[]>;
```

**目的:** 利用可能なスキル一覧を取得

**パラメータ:** なし

**戻り値:** `SkillMetadata[]`

- スキール名、説明、バージョン情報を含む

**エラーハンドリング:**

- リスト取得失敗時は `Promise.reject(error)`

**使用例:**

```typescript
const skills = await window.electronAPI.skill.list();
```

#### A.2 `getImported()`

```typescript
getImported: () => Promise<ImportedSkill[]>;
```

**目的:** インポート済みスキル一覧を取得

**パラメータ:** なし

**戻り値:** `ImportedSkill[]`

- インポート済みスキルの詳細情報

**エラーハンドリング:**

- 取得失敗時は `Promise.reject(error)`

**使用例:**

```typescript
const imported = await window.electronAPI.skill.getImported();
```

#### A.3 `import(skillName)`

```typescript
import: (skillName: string) => Promise<ImportedSkill>
```

**目的:** スキルをインポート

**パラメータ:**

- `skillName: string` - インポート対象スキール名

**戻り値:** `ImportedSkill`

- インポート後のスキール情報

**エラーハンドリング:**

- 不正なスキール名: `ValidationError` (1000-1999)
- インポート失敗: `ExternalServiceError` (3000-3999) 、リトライ可能

**使用例:**

```typescript
try {
  const imported = await window.electronAPI.skill.import("my-skill");
} catch (error) {
  console.error("Import failed:", error);
}
```

#### A.4 `remove(skillName)`

```typescript
remove: (skillName: string) => Promise<void>;
```

**目的:** インポート済みスキルを削除

**パラメータ:**

- `skillName: string` - 削除対象スキール名

**戻り値:** `void`

**エラーハンドリング:**

- スキール未検出: `BusinessError` (2000-2999) 、リトライ不可
- 削除失敗: `InfrastructureError` (4000-4999) 、リトライ可能

**使用例:**

```typescript
await window.electronAPI.skill.remove("old-skill");
```

#### A.5 `rescan()`

```typescript
rescan: () => Promise<SkillMetadata[]>;
```

**目的:** スキール一覧を再スキャン

**パラメータ:** なし

**戻り値:** `SkillMetadata[]`

- 再スキャン後のスキール一覧

**エラーハンドリング:**

- スキャン失敗時は `Promise.reject(error)`

**使用例:**

```typescript
const refreshed = await window.electronAPI.skill.rescan();
```

### Group B: スキル実行

#### B.1 `execute(request)`

```typescript
execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
```

**目的:** スキルを実行

**パラメータ:**

- `request: SkillExecutionRequest`
  - `skillName: string` - 実行スキール名
  - `args: unknown[]` - スキールへの引数
  - `options?: { timeout?: number }`

**戻り値:** `SkillExecutionResponse`

- `executionId: string` - 実行ID
- `result?: unknown` - 実行結果

**エラーハンドリング:**

- パラメータ不正: `ValidationError` (1000-1999)
- スキール未検出: `BusinessError` (2000-2999)
- 実行エラー: `InternalError` (5000-5999)

**使用例:**

```typescript
const response = await window.electronAPI.skill.execute({
  skillName: "my-skill",
  args: ["param1", "param2"],
});
```

#### B.2 `abort(executionId)`

```typescript
abort: (executionId: string) => Promise<void>;
```

**目的:** 実行中のスキルを中断

**パラメータ:**

- `executionId: string` - 中断対象の実行ID

**戻り値:** `void`

**エラーハンドリング:**

- 実行ID未検出: `BusinessError` (2000-2999)
- 中断失敗: `InfrastructureError` (4000-4999)

**使用例:**

```typescript
await window.electronAPI.skill.abort("exec-123");
```

#### B.3 `getExecutionStatus(executionId)`

```typescript
getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
```

**目的:** スキル実行ステータスを取得

**パラメータ:**

- `executionId: string` - 照会対象の実行ID

**戻り値:** `ExecutionInfo | null`

- 実行中: `ExecutionInfo` オブジェクト
- 完了済み: `null`

**エラーハンドリング:**

- 照会失敗時は `Promise.reject(error)`

**使用例:**

```typescript
const status = await window.electronAPI.skill.getExecutionStatus("exec-123");
if (status) {
  console.log("Still executing:", status.progress);
}
```

### Group C: イベント リスナー

#### C.1 `onStream(callback)`

```typescript
onStream: (callback: (message: SkillStreamMessage) => void) => () => void
```

**目的:** スキル実行中のストリーム出力をリッスン

**パラメータ:**

- `callback: (message: SkillStreamMessage) => void`
  - `executionId: string`
  - `type: 'stdout' | 'stderr' | 'log'`
  - `data: string`

**戻り値:** `() => void`

- リスナー削除関数（unsubscribe）

**注意点:**

- 複数回呼び出し時は複数リスナーが登録される
- コンポーネントアンマウント時に `unsubscribe()` を呼び出すこと

**使用例:**

```typescript
const unsubscribe = window.electronAPI.skill.onStream((message) => {
  console.log(message.data);
});

// クリーンアップ
return () => unsubscribe();
```

#### C.2 `onComplete(callback)`

```typescript
onComplete: (callback: (data: { executionId: string }) => void) => () => void
```

**目的:** スキル実行完了をリッスン

**パラメータ:**

- `callback: (data: { executionId: string }) => void`

**戻り値:** `() => void`

- リスナー削除関数（unsubscribe）

**使用例:**

```typescript
const unsubscribe = window.electronAPI.skill.onComplete(({ executionId }) => {
  console.log("Execution completed:", executionId);
});
```

#### C.3 `onError(callback)`

```typescript
onError: (
  callback: (data: { executionId: string; error: string }) => void,
) => () => void
```

**目的:** スキル実行エラーをリッスン

**パラメータ:**

- `callback: (data: { executionId: string; error: string }) => void`

**戻り値:** `() => void`

- リスナー削除関数（unsubscribe）

**使用例:**

```typescript
const unsubscribe = window.electronAPI.skill.onError(
  ({ executionId, error }) => {
    console.error("Execution failed:", error);
  },
);
```

### Group D: 権限管理

#### D.1 `onPermissionRequest(callback)`

```typescript
onPermissionRequest: (
  callback: (request: SkillPermissionRequest) => void,
) => () => void
```

**目的:** スキルの権限リクエストをリッスン

**パラメータ:**

- `callback: (request: SkillPermissionRequest) => void`
  - `executionId: string`
  - `skillName: string`
  - `permission: string` - 要求される権限（例: "file:read"）
  - `resource: string` - リソース名

**戻り値:** `() => void`

- リスナー削除関数（unsubscribe）

**使用例:**

```typescript
const unsubscribe = window.electronAPI.skill.onPermissionRequest((request) => {
  // UI側で権限許可/拒否ダイアログを表示
  showPermissionDialog(request);
});
```

#### D.2 `sendPermissionResponse(response)`

```typescript
sendPermissionResponse: (response: SkillPermissionResponse) =>
  Promise<{ success: boolean }>;
```

**目的:** スキルの権限リクエストに対応

**パラメータ:**

- `response: SkillPermissionResponse`
  - `executionId: string`
  - `permission: string`
  - `granted: boolean` - 許可（true）/ 拒否（false）

**戻り値:** `{ success: boolean }`

- `success: true` - 応答が正常に送信された
- `success: false` - 応答送信失敗

**エラーハンドリング:**

- 応答送信失敗時は `Promise.reject(error)`

**使用例:**

```typescript
await window.electronAPI.skill.sendPermissionResponse({
  executionId: "exec-123",
  permission: "file:read",
  granted: true,
});
```

## セキュリティ設計

### チャンネルホワイトリスト

`safeInvoke` / `safeOn` により、許可されたチャンネルのみが使用可能。

**ALLOWED_INVOKE_CHANNELS:**

- `skill:list`
- `skill:import`
- `skill:remove`
- `skill:rescan`
- `skill:execute`
- `skill:abort`
- `skill:getExecutionStatus`
- `skill:sendPermissionResponse`

**ALLOWED_ON_CHANNELS:**

- `skill:stream`
- `skill:complete`
- `skill:error`
- `skill:permissionRequest`

### エラーハンドリング原則

- **Validation Error (1000-1999):** パラメータ不正、リトライ不可
- **Business Error (2000-2999):** スキール未検出等、リトライ不可
- **External Service Error (3000-3999):** 外部サービス障害、リトライ可能
- **Infrastructure Error (4000-4999):** ファイルシステム等、リトライ可能
- **Internal Error (5000-5999):** 予期しないエラー、リトライ不可

### 型安全性

```typescript
// ✅ 正しい使用
const result = await window.electronAPI.skill.execute(request);

// ❌ 間違った使用（型チェックで検出）
const result = await window.skillAPI.execute(request); // Type Error!
```

## 統合契約

### Renderer ← → Preload

**契約:**

- Renderer: `window.electronAPI.skill.*` を呼び出す
- Preload: `electronAPI.skill` を `SkillAPI` 型で公開

**検証方法:**

- TypeScript 型チェック
- `window.electronAPI?.skill` の存在チェック

### Preload ← → Main

**契約:**

- Preload: `safeInvoke` / `safeOn` でホワイトリストチャンネルのみ使用
- Main: 各チャンネルハンドラを登録

**検証方法:**

- チャンネルホワイトリストの確認
- IPC ハンドラ登録確認

## 使用シーン別サンプル

### シーン1: スキール実行と結果受け取り

```typescript
// スキール実行を開始
const { executionId } = await window.electronAPI.skill.execute({
  skillName: "my-skill",
  args: ["arg1"],
});

// ストリーム出力をリッスン
const unsubscribe = window.electronAPI.skill.onStream(({ data }) => {
  console.log("Output:", data);
});

// 完了をリッスン
const unsubscribeComplete = window.electronAPI.skill.onComplete(() => {
  console.log("Done!");
  unsubscribe();
  unsubscribeComplete();
});
```

### シーン2: スキール権限リクエストに対応

```typescript
// 権限リクエストをリッスン
const unsubscribe = window.electronAPI.skill.onPermissionRequest((request) => {
  // ユーザーに許可を求める
  if (userApproved) {
    window.electronAPI.skill.sendPermissionResponse({
      executionId: request.executionId,
      permission: request.permission,
      granted: true,
    });
  }
});
```

### シーン3: スキール一覧と管理

```typescript
// 一覧取得
const available = await window.electronAPI.skill.list();
const imported = await window.electronAPI.skill.getImported();

// インポート
await window.electronAPI.skill.import("new-skill");

// 再スキャン
await window.electronAPI.skill.rescan();

// 削除
await window.electronAPI.skill.remove("old-skill");
```

## メソッド早見表

| Group | メソッド名                 | パラメータ | 戻り値                            | IPC チャンネル                 |
| ----- | -------------------------- | ---------- | --------------------------------- | ------------------------------ |
| A     | `list()`                   | -          | `Promise<SkillMetadata[]>`        | `skill:list`                   |
| A     | `getImported()`            | -          | `Promise<ImportedSkill[]>`        | `skill:getImported`            |
| A     | `import(name)`             | string     | `Promise<ImportedSkill>`          | `skill:import`                 |
| A     | `remove(name)`             | string     | `Promise<void>`                   | `skill:remove`                 |
| A     | `rescan()`                 | -          | `Promise<SkillMetadata[]>`        | `skill:rescan`                 |
| B     | `execute(request)`         | object     | `Promise<SkillExecutionResponse>` | `skill:execute`                |
| B     | `abort(id)`                | string     | `Promise<void>`                   | `skill:abort`                  |
| B     | `getExecutionStatus(id)`   | string     | `Promise<ExecutionInfo \| null>`  | `skill:getExecutionStatus`     |
| C     | `onStream(callback)`       | function   | `() => void` (unsubscribe)        | `skill:stream`                 |
| C     | `onComplete(callback)`     | function   | `() => void` (unsubscribe)        | `skill:complete`               |
| C     | `onError(callback)`        | function   | `() => void` (unsubscribe)        | `skill:error`                  |
| D     | `onPermissionRequest()`    | function   | `() => void` (unsubscribe)        | `skill:permissionRequest`      |
| D     | `sendPermissionResponse()` | object     | `Promise<{ success: boolean }>`   | `skill:sendPermissionResponse` |

## 設計の特徴

### 1. 一貫性

- すべてのメソッドが `window.electronAPI.skill` を通じて公開
- 命名規則が明確（`on*` はイベント リスナー）
- 戻り値の型が統一（Promise / unsubscribe関数）

### 2. セキュリティ

- `contextBridge` による完全な Preload 隔離
- `safeInvoke` / `safeOn` によるホワイトリスト制限
- エラーはサニタイズ（機密情報漏洩防止）

### 3. 後方互換性

- すべての呼び出し元が既に `window.electronAPI.skill` を使用
- 既存実装（`skill-api.ts`, `electronAPI`）は変更なし
- テストコードへの影響なし

## 成果物

このドキュメントは以下を提供する：

- ✅ 13メソッドの詳細仕様
- ✅ セキュリティ設計（ホワイトリスト、エラーハンドリング）
- ✅ 統合契約定義
- ✅ 使用シーン別サンプルコード
- ✅ メソッド早見表

---

**作成日:** 2026-02-09
**ステータス:** Phase 2 成果物
**参照:** Phase 2 設計ドキュメント
