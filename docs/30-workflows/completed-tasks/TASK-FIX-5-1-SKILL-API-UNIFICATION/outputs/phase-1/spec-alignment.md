# 仕様整合性確認: システム仕様との整合性検証

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 1 - 要件定義                       |
| ドキュメント | 仕様整合性確認                     |
| 作成日       | 2026-02-09                         |

## 概要

本ドキュメントでは、TASK-FIX-5-1の要件とシステム仕様との整合性を検証し、既存設計との矛盾がないことを確認する。

## 検証観点

| 観点                             | 参照仕様                        | 判定    |
| -------------------------------- | ------------------------------- | ------- |
| 1. SkillAPI インターフェース仕様 | `interfaces-agent-sdk-skill.md` | ✅ PASS |
| 2. IPCセキュリティパターン       | `security-skill-ipc.md`         | ✅ PASS |
| 3. Electronセキュリティ原則      | `security-electron-ipc.md`      | ✅ PASS |
| 4. セキュリティ設計原則          | `security-principles.md`        | ✅ PASS |
| 5. IPCチャンネル仕様             | `api-ipc-agent.md`              | ✅ PASS |

## 詳細検証

### 観点1: SkillAPI インターフェース仕様

**参照:** `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

#### 検証項目

| #   | 項目         | 仕様       | 実装状況                                            | 判定 |
| --- | ------------ | ---------- | --------------------------------------------------- | ---- |
| 1.1 | メソッド数   | 13メソッド | 13メソッド実装済み                                  | ✅   |
| 1.2 | 一覧・管理系 | 5メソッド  | `list`, `getImported`, `import`, `remove`, `rescan` | ✅   |
| 1.3 | 実行系       | 3メソッド  | `execute`, `abort`, `getExecutionStatus`            | ✅   |
| 1.4 | イベント系   | 3メソッド  | `onStream`, `onComplete`, `onError`                 | ✅   |
| 1.5 | 権限系       | 2メソッド  | `onPermissionRequest`, `sendPermissionResponse`     | ✅   |

#### メソッドシグネチャ検証

**仕様との一致確認:**

```typescript
// 仕様: interfaces-agent-sdk-skill.md
export interface SkillAPI {
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  import: (skillName: string) => Promise<ImportedSkill>;
  remove: (skillName: string) => Promise<void>;
  rescan: () => Promise<SkillMetadata[]>;

  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}

// 実装: apps/desktop/src/preload/skill-api.ts
// → 完全一致
```

**判定:** ✅ PASS - 仕様と実装が完全に一致

#### 公開パス検証

**仕様の要求:**

- APIは `window.electronAPI.skill` として公開される

**実装状況:**

- `apps/desktop/src/preload/index.ts:351` で `skill: skillAPI` として `electronAPI` に割り当て
- `apps/desktop/src/preload/index.ts:542` で `contextBridge.exposeInMainWorld("electronAPI", electronAPI)` で公開

**判定:** ✅ PASS - 仕様どおりに公開されている

### 観点2: IPCセキュリティパターン

**参照:** `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`

#### 検証項目

| #   | 項目                | 仕様                                             | 実装状況 | 判定 |
| --- | ------------------- | ------------------------------------------------ | -------- | ---- |
| 2.1 | safeInvoke パターン | チャンネルホワイトリスト検証                     | 実装済み | ✅   |
| 2.2 | safeOn パターン     | リスナー登録時のチャンネル検証                   | 実装済み | ✅   |
| 2.3 | ホワイトリスト管理  | `ALLOWED_INVOKE_CHANNELS`, `ALLOWED_ON_CHANNELS` | 実装済み | ✅   |
| 2.4 | クリーンアップ      | unsubscribe 関数の返却                           | 実装済み | ✅   |

#### safeInvoke パターン検証

**仕様の要求:**

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

**実装状況:**

```typescript
// apps/desktop/src/preload/skill-api.ts:132-137
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

**判定:** ✅ PASS - 仕様と完全一致

#### safeOn パターン検証

**仕様の要求:**

```typescript
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const listener = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}
```

**実装状況:**

```typescript
// apps/desktop/src/preload/skill-api.ts:142-157
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}
```

**判定:** ✅ PASS - 仕様と完全一致

#### ホワイトリスト検証

**仕様の要求:**

- `ALLOWED_INVOKE_CHANNELS` にスキル実行関連チャンネルが含まれる
- `ALLOWED_ON_CHANNELS` にスキルイベントチャンネルが含まれる

**実装状況:** `apps/desktop/src/preload/channels.ts` で管理

```typescript
export const ALLOWED_INVOKE_CHANNELS = [
  // ... other channels
  IPC_CHANNELS.SKILL_EXECUTE, // 'skill:execute'
  IPC_CHANNELS.SKILL_ABORT, // 'skill:abort'
  IPC_CHANNELS.SKILL_GET_STATUS, // 'skill:getStatus'
  IPC_CHANNELS.SKILL_LIST, // 'skill:list'
  IPC_CHANNELS.SKILL_GET_IMPORTED, // 'skill:getImported'
  IPC_CHANNELS.SKILL_IMPORT, // 'skill:import'
  IPC_CHANNELS.SKILL_REMOVE, // 'skill:remove'
  IPC_CHANNELS.SKILL_SCAN, // 'skill:scan'
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, // 'skill:permissionResponse'
  // ...
];

export const ALLOWED_ON_CHANNELS = [
  // ... other channels
  IPC_CHANNELS.SKILL_STREAM, // 'skill:stream'
  IPC_CHANNELS.SKILL_COMPLETE, // 'skill:complete'
  IPC_CHANNELS.SKILL_ERROR, // 'skill:error'
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST, // 'skill:permissionRequest'
  // ...
];
```

**判定:** ✅ PASS - すべてのスキル関連チャンネルがホワイトリストに含まれる

### 観点3: Electronセキュリティ原則

**参照:** `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`

#### 検証項目

| #   | 項目               | 仕様の要求                               | 実装状況         | 判定 |
| --- | ------------------ | ---------------------------------------- | ---------------- | ---- |
| 3.1 | contextIsolation   | `true` 必須                              | 維持（変更なし） | ✅   |
| 3.2 | nodeIntegration    | `false` 必須                             | 維持（変更なし） | ✅   |
| 3.3 | sandbox            | `true` 必須                              | 維持（変更なし） | ✅   |
| 3.4 | contextBridge 使用 | Preload API公開は contextBridge 経由のみ | 準拠（変更なし） | ✅   |

#### BrowserWindow 設定検証

**仕様の要求:**

```typescript
webPreferences: {
  contextIsolation: true,   // V8コンテキスト分離
  nodeIntegration: false,   // RendererからNode.js遮断
  sandbox: true,            // Chromiumサンドボックス
  preload: path.join(__dirname, 'preload.js'),
}
```

**実装状況:** 本タスクではBrowserWindow設定に変更なし

**判定:** ✅ PASS - セキュリティ設定は維持される

#### contextBridge 公開パターン検証

**仕様の要求:**

- すべての Preload API は `contextBridge.exposeInMainWorld` で公開
- `window.electronAPI` 配下に統一

**実装状況:**

```typescript
// apps/desktop/src/preload/index.ts
const electronAPI: ElectronAPI = {
  // ... other APIs
  skill: skillAPI, // ← スキルAPIも electronAPI に含める
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

**判定:** ✅ PASS - contextBridge パターンに準拠

### 観点4: セキュリティ設計原則

**参照:** `.claude/skills/aiworkflow-requirements/references/security-principles.md`

#### 検証項目

| #   | 原則                           | 要求                             | 実装状況                          | 判定 |
| --- | ------------------------------ | -------------------------------- | --------------------------------- | ---- |
| 4.1 | 最小権限 (Least Privilege)     | 各プロセスに必要最小限の権限のみ | Renderer は electronAPI 経由のみ  | ✅   |
| 4.2 | 多層防御 (Defense in Depth)    | 複数の防御層で保護               | contextBridge + safeInvoke/safeOn | ✅   |
| 4.3 | フェイルセキュア (Fail-Secure) | 障害時は安全側に倒す             | 不正チャンネルは即座にリジェクト  | ✅   |
| 4.4 | 完全仲介 (Complete Mediation)  | すべてのアクセスを毎回検証       | safeInvoke/safeOn で毎回検証      | ✅   |

#### 多層防御の検証

**防御層の確認:**

1. **第1層: contextIsolation**
   - Renderer Process と Preload の V8 コンテキストを分離
   - `window.electronAPI` 以外のアクセスをブロック

2. **第2層: contextBridge ホワイトリスト**
   - 公開するAPIを明示的に指定
   - `electronAPI` のみ公開（`skillAPI` は独立公開しない）

3. **第3層: safeInvoke/safeOn チャンネル検証**
   - `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` でフィルタリング
   - 不正チャンネルは即座にリジェクト

4. **第4層: Main Process IPC ハンドラ**
   - バリデーション
   - パーミッションチェック

**判定:** ✅ PASS - 4層の防御が確保されている

### 観点5: IPCチャンネル仕様

**参照:** `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`

#### 検証項目

| #    | 項目                 | 仕様チャンネル名           | 実装状況 | 判定 |
| ---- | -------------------- | -------------------------- | -------- | ---- |
| 5.1  | スキル一覧           | `skill:list`               | 実装済み | ✅   |
| 5.2  | インポート済みスキル | `skill:getImported`        | 実装済み | ✅   |
| 5.3  | スキルインポート     | `skill:import`             | 実装済み | ✅   |
| 5.4  | スキル削除           | `skill:remove`             | 実装済み | ✅   |
| 5.5  | スキル再スキャン     | `skill:scan`               | 実装済み | ✅   |
| 5.6  | スキル実行           | `skill:execute`            | 実装済み | ✅   |
| 5.7  | 実行中断             | `skill:abort`              | 実装済み | ✅   |
| 5.8  | 実行状態取得         | `skill:getStatus`          | 実装済み | ✅   |
| 5.9  | ストリームメッセージ | `skill:stream`             | 実装済み | ✅   |
| 5.10 | 完了イベント         | `skill:complete`           | 実装済み | ✅   |
| 5.11 | エラーイベント       | `skill:error`              | 実装済み | ✅   |
| 5.12 | 権限リクエスト       | `skill:permissionRequest`  | 実装済み | ✅   |
| 5.13 | 権限応答             | `skill:permissionResponse` | 実装済み | ✅   |

#### チャンネル名の一貫性検証

**実装確認:**

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ... other channels
  SKILL_LIST: "skill:list",
  SKILL_GET_IMPORTED: "skill:getImported",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_SCAN: "skill:scan",
  SKILL_EXECUTE: "skill:execute",
  SKILL_ABORT: "skill:abort",
  SKILL_GET_STATUS: "skill:getStatus",
  SKILL_STREAM: "skill:stream",
  SKILL_COMPLETE: "skill:complete",
  SKILL_ERROR: "skill:error",
  SKILL_PERMISSION_REQUEST: "skill:permissionRequest",
  SKILL_PERMISSION_RESPONSE: "skill:permissionResponse",
  // ...
} as const;
```

**判定:** ✅ PASS - 仕様と完全一致

## タスク変更の仕様適合性検証

### 変更内容の確認

本タスク（TASK-FIX-5-1）の変更内容：

1. **削除対象:**
   - `types.d.ts` の `skillAPI: SkillAPI` 宣言
   - `types.ts` のグローバル宣言の `skillAPI` 宣言

2. **維持対象:**
   - `skill-api.ts` の `SkillAPI` インターフェース
   - `skill-api.ts` の `skillAPI` 実装
   - `index.ts` の `electronAPI.skill` 割り当て
   - すべての呼び出し元（15ファイル）

### 仕様への影響評価

| 仕様観点                  | 影響の有無 | 理由                         |
| ------------------------- | ---------- | ---------------------------- |
| SkillAPI インターフェース | なし       | 型定義のみ削除、実装は維持   |
| IPCセキュリティパターン   | なし       | safeInvoke/safeOn は変更なし |
| Electronセキュリティ原則  | なし       | contextBridge 公開は変更なし |
| セキュリティ設計原則      | なし       | 防御層は全て維持             |
| IPCチャンネル仕様         | なし       | チャンネル定義は変更なし     |

**判定:** ✅ PASS - 全ての仕様に適合、悪影響なし

## まとめ

### 整合性検証結果

| 観点                             | 判定    | 備考                       |
| -------------------------------- | ------- | -------------------------- |
| 1. SkillAPI インターフェース仕様 | ✅ PASS | 13メソッド完全一致         |
| 2. IPCセキュリティパターン       | ✅ PASS | safeInvoke/safeOn 完全準拠 |
| 3. Electronセキュリティ原則      | ✅ PASS | contextBridge パターン維持 |
| 4. セキュリティ設計原則          | ✅ PASS | 4層防御維持                |
| 5. IPCチャンネル仕様             | ✅ PASS | 13チャンネル完全一致       |

**総合判定:** ✅ 全観点 PASS

### 結論

TASK-FIX-5-1の変更内容は、以下の点でシステム仕様と完全に整合している：

1. **SkillAPI仕様の維持:**
   - 13メソッドのインターフェースは変更なし
   - 型シグネチャは仕様と完全一致

2. **セキュリティ原則の遵守:**
   - contextBridge による公開パターンを維持
   - safeInvoke/safeOn パターンを維持
   - チャンネルホワイトリストを維持

3. **後方互換性の保証:**
   - 実装コードへの変更はゼロ
   - すべての呼び出し元が既に統一済み

4. **仕様との矛盾なし:**
   - `window.electronAPI.skill` は仕様で規定された正式なAPIパス
   - `window.skillAPI` は仕様にない独自拡張（削除対象）

**最終判定:** 本タスクは全てのシステム仕様と整合しており、安全に実行可能。

---

**作成日:** 2026-02-09
**ステータス:** Phase 1 完了
**次のアクション:** Phase 2 設計へ進行
