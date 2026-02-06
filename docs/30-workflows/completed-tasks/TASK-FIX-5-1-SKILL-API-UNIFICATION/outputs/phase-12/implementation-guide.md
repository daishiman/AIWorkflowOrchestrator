# TASK-FIX-5-1: SkillAPI統一 実装ガイド

## Part 1: 概念説明（初学者向け）

### なぜ2つのAPIがあったのか

このアプリには「スキル」という機能があります。スキルとは、AIに特定の作業をさせるための指示セットです。

以前のコードでは、スキル機能を使うための「窓口」が2つありました。これは、お店に入口が2つあって、それぞれ違う案内図が置いてある状態と同じです。

- **窓口1** (`preload/skill-api.ts`): 新しい設計で作られた窓口。セキュリティチェック付き
- **窓口2** (`renderer/preload/index.ts`): 古い設計で作られた窓口。独自のエラー処理方式

2つの窓口があると、「どっちを使えばいいの?」と迷うだけでなく、片方を直しても、もう片方を直し忘れるという問題が起きます。

### なぜ1つに統一したのか

2つの窓口を1つにまとめることで：

1. **迷わない**: 開発者は `window.electronAPI.skill` だけ覚えればOK
2. **直し忘れがない**: 修正箇所が1か所だけなので、バグが減る
3. **安全**: セキュリティチェック（ホワイトリスト方式）が必ず通る

### 何が変わったのか

| 変更前                           | 変更後                                            |
| -------------------------------- | ------------------------------------------------- |
| `window.skillAPI.execute(...)`   | `window.electronAPI.skill.execute(...)`           |
| `window.skillAPI.listImported()` | `window.electronAPI.skill.getImported()`          |
| `skillAPI.import(ids)` (配列)    | `window.electronAPI.skill.import(name)` (1つずつ) |

全員が同じ入口 (`window.electronAPI.skill`) を使うようになりました。古い入口 (`window.skillAPI`) は完全に閉鎖され、使おうとしても `undefined` になります。

---

## Part 2: 技術詳細（開発者向け）

### 統一SkillAPIインターフェース

```typescript
export interface SkillAPI {
  // 実行系
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // イベント購読系
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // 権限系
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;

  // 管理系
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  rescan: () => Promise<SkillMetadata[]>;
  import: (skillName: string) => Promise<ImportedSkill>;
  remove: (skillName: string) => Promise<void>;
}
```

### IPCチャンネル対応表

| APIメソッド                | IPCチャンネル               | 通信方式   |
| -------------------------- | --------------------------- | ---------- |
| `execute()`                | `skill:execute`             | invoke     |
| `abort()`                  | `skill:abort`               | invoke     |
| `getExecutionStatus()`     | `skill:get-status`          | invoke     |
| `onStream()`               | `skill:stream`              | on (event) |
| `onComplete()`             | `skill:complete`            | on (event) |
| `onError()`                | `skill:error`               | on (event) |
| `onPermissionRequest()`    | `skill:permission:request`  | on (event) |
| `sendPermissionResponse()` | `skill:permission:response` | invoke     |
| `list()`                   | `skill:list`                | invoke     |
| `getImported()`            | `skill:getImported`         | invoke     |
| `rescan()`                 | `skill:scan`                | invoke     |
| `import()`                 | `skill:import`              | invoke     |
| `remove()`                 | `skill:remove`              | invoke     |

### 移行前後のコード比較

#### hooks内の呼び出し

```typescript
// Before (window.skillAPI)
window.skillAPI.execute({ skillName, prompt });
window.skillAPI.onStream((msg) => handleStream(msg));
window.skillAPI.abort(executionId);

// After (window.electronAPI.skill)
window.electronAPI.skill.execute({ skillName, prompt });
window.electronAPI.skill.onStream((msg) => handleStream(msg));
window.electronAPI.skill.abort(executionId);
```

#### AgentViewのインポート

```typescript
// Before (renderer/preload/index.ts経由)
import { skillAPI } from "../../preload";
const result = await skillAPI.listImported();
if (result.success) {
  setSkills(result.data);
}

// After (window.electronAPI.skill直接)
const imported = await window.electronAPI.skill.getImported();
setSkills(imported as unknown as Skill[]);
```

### OperationResult廃止の影響

旧API#2は `OperationResult<T>` パターンを使用していました:

```typescript
// 廃止: OperationResultパターン
type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

統一APIでは直接値を返し、エラーはthrowで伝播します:

```typescript
// 現行: 直接値パターン
try {
  const skills = await window.electronAPI.skill.list();
} catch (error) {
  console.error("Failed to list skills:", error);
}
```

### セキュリティ: safeInvoke / safeOn パターン

全APIメソッドは `safeInvoke`/`safeOn` ヘルパーを経由し、ホワイトリストに登録されたチャンネルのみ通信を許可します:

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 変更ファイル一覧

| ファイル                                | 変更内容                                |
| --------------------------------------- | --------------------------------------- |
| `preload/skill-api.ts`                  | safeInvoke/safeOn実装、スタイル統一     |
| `preload/index.ts`                      | `window.skillAPI` 公開削除              |
| `renderer/hooks/useSkillExecution.ts`   | API呼び出しパス移行                     |
| `renderer/hooks/useSkillPermission.ts`  | API呼び出しパス移行                     |
| `renderer/hooks/usePermissionDialog.ts` | API呼び出しパス移行                     |
| `renderer/views/AgentView/index.tsx`    | 旧API依存解消、型アサーション追加       |
| `renderer/preload/index.ts`             | 削除（旧API#2）                         |
| テストファイル (8件)                    | モック移行 (`window.electronAPI.skill`) |
