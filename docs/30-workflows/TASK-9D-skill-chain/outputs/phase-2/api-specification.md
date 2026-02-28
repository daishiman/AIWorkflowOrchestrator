# TASK-9D スキルチェーン機能 IPC/API 仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| タスク ID  | TASK-9D-skill-chain     |
| Phase      | 2                       |
| 成果物     | IPC/API 仕様            |
| 作成日     | 2026-02-28              |
| ステータス | completed               |
| 前提       | Phase 1（要件定義）完了 |

## 概要

本ドキュメントは、スキルチェーン機能の IPC 5 チャネルと Preload chainAPI の詳細仕様を定義する。各チャネルの引数型、戻り値型、バリデーション規則、コード例を含む。

---

## 1. チャネル定数定義

### channels.ts 追加分

```typescript
// apps/desktop/src/preload/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存チャネル ...
  SKILL_CHAIN_LIST: "skill:chain:list",
  SKILL_CHAIN_GET: "skill:chain:get",
  SKILL_CHAIN_SAVE: "skill:chain:save",
  SKILL_CHAIN_DELETE: "skill:chain:delete",
  SKILL_CHAIN_EXECUTE: "skill:chain:execute",
} as const;
```

---

## 2. IPC チャネル仕様

### 2.1 skill:chain:list

| 項目             | 内容                                |
| ---------------- | ----------------------------------- |
| チャネル名       | `skill:chain:list`                  |
| 定数名           | `IPC_CHANNELS.SKILL_CHAIN_LIST`     |
| 方向             | Renderer → Main                     |
| 引数             | なし                                |
| 戻り値           | `IpcResult<SkillChainDefinition[]>` |
| バリデーション   | sender 検証のみ（引数なし）         |
| エラーサニタイズ | 内部パスをマスクして返す            |
| 対応要件         | FR-7-1, FR-1-3                      |

#### 正常系レスポンス

```typescript
// チェーンが存在する場合
{
  success: true,
  data: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "データ分析チェーン",
      description: "データ取得→分析→レポート生成",
      steps: [...],
      variables: {},
      errorHandling: "stop",
      createdAt: "2026-02-28T12:00:00.000Z",
      updatedAt: "2026-02-28T12:00:00.000Z",
    },
    // ...
  ]
}

// チェーンが存在しない場合
{
  success: true,
  data: []
}
```

#### 異常系レスポンス

```typescript
// ファイルシステムエラー
{
  success: false,
  error: "Failed to list chains: [path] access denied"
}
```

#### ハンドラ実装

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_LIST, async (event) => {
  validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });
  try {
    const chains = await skillChainStore.list();
    return { success: true, data: chains };
  } catch (error) {
    return { success: false, error: sanitizeError(error) };
  }
});
```

---

### 2.2 skill:chain:get

| 項目           | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| チャネル名     | `skill:chain:get`                                                   |
| 定数名         | `IPC_CHANNELS.SKILL_CHAIN_GET`                                      |
| 方向           | Renderer → Main                                                     |
| 引数           | `chainId: string`                                                   |
| 戻り値         | `IpcResult<SkillChainDefinition>`                                   |
| バリデーション | sender 検証 + P42 準拠 3 段バリデーション（chainId）                |
| エラーケース   | 存在しない chainId → `{ success: false, error: "Chain not found" }` |
| 対応要件       | FR-7-2, FR-1-2, FR-1-6                                              |

#### バリデーション規則（P42 準拠）

| ステップ | チェック内容                  | エラーメッセージ                     |
| -------- | ----------------------------- | ------------------------------------ |
| 1        | `typeof chainId !== "string"` | "chainId must be a non-empty string" |
| 2        | `chainId === ""`              | "chainId must be a non-empty string" |
| 3        | `chainId.trim() === ""`       | "chainId must be a non-empty string" |

#### 正常系レスポンス

```typescript
{
  success: true,
  data: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "データ分析チェーン",
    description: "データ取得→分析→レポート生成",
    steps: [
      {
        stepId: "step-1",
        skillName: "data-fetcher",
        inputMapping: { url: { type: "literal", value: "https://api.example.com/data" } },
        outputMapping: { variableName: "rawData" },
      },
      // ...
    ],
    variables: {},
    errorHandling: "stop",
    createdAt: "2026-02-28T12:00:00.000Z",
    updatedAt: "2026-02-28T12:00:00.000Z",
  }
}
```

#### 異常系レスポンス

```typescript
// 存在しない chainId
{ success: false, error: "Chain not found" }

// バリデーションエラー
{ success: false, error: "chainId must be a non-empty string" }
```

#### ハンドラ実装

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_GET, async (event, chainId: string) => {
  validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

  // P42 準拠 3 段バリデーション
  if (typeof chainId !== "string" || chainId === "" || chainId.trim() === "") {
    return { success: false, error: "chainId must be a non-empty string" };
  }

  try {
    const chain = await skillChainStore.get(chainId.trim());
    if (!chain) {
      return { success: false, error: "Chain not found" };
    }
    return { success: true, data: chain };
  } catch (error) {
    return { success: false, error: sanitizeError(error) };
  }
});
```

---

### 2.3 skill:chain:save

| 項目           | 内容                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| チャネル名     | `skill:chain:save`                                                     |
| 定数名         | `IPC_CHANNELS.SKILL_CHAIN_SAVE`                                        |
| 方向           | Renderer → Main                                                        |
| 引数           | `chain: SkillChainDefinition`                                          |
| 戻り値         | `IpcResult<SkillChainDefinition>`                                      |
| バリデーション | sender 検証 + オブジェクトバリデーション（name, steps, errorHandling） |
| 補足           | 新規作成時は id を UUID v4 で生成、createdAt/updatedAt を設定          |
| 対応要件       | FR-7-3, FR-1-1, FR-1-4                                                 |

#### バリデーション規則

| ステップ | チェック内容                             | エラーメッセージ                                         |
| -------- | ---------------------------------------- | -------------------------------------------------------- |
| 1        | `!chain \|\| typeof chain !== "object"`  | "chain must be an object"                                |
| 2        | `typeof chain.name !== "string"`         | "chain.name must be a non-empty string"                  |
| 3        | `chain.name.trim() === ""`               | "chain.name must be a non-empty string"                  |
| 4        | `!Array.isArray(chain.steps)`            | "chain.steps must be a non-empty array"                  |
| 5        | `chain.steps.length === 0`               | "chain.steps must be a non-empty array"                  |
| 6        | `!["stop","skip","retry"].includes(...)` | "chain.errorHandling must be 'stop', 'skip', or 'retry'" |

#### 正常系レスポンス

```typescript
// 新規作成
{
  success: true,
  data: {
    id: "550e8400-e29b-41d4-a716-446655440000", // 自動生成
    name: "新しいチェーン",
    description: "説明文",
    steps: [...],
    variables: {},
    errorHandling: "stop",
    createdAt: "2026-02-28T12:00:00.000Z",  // 自動設定
    updatedAt: "2026-02-28T12:00:00.000Z",  // 自動設定
  }
}

// 更新
{
  success: true,
  data: {
    id: "550e8400-e29b-41d4-a716-446655440000", // 既存ID
    name: "更新後のチェーン名",
    // ...
    createdAt: "2026-02-28T12:00:00.000Z",  // 変更なし
    updatedAt: "2026-02-28T13:00:00.000Z",  // 更新
  }
}
```

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_SAVE,
  async (event, chain: SkillChainDefinition) => {
    validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

    // オブジェクトバリデーション
    if (!chain || typeof chain !== "object") {
      return { success: false, error: "chain must be an object" };
    }
    if (typeof chain.name !== "string" || chain.name.trim() === "") {
      return {
        success: false,
        error: "chain.name must be a non-empty string",
      };
    }
    if (!Array.isArray(chain.steps) || chain.steps.length === 0) {
      return {
        success: false,
        error: "chain.steps must be a non-empty array",
      };
    }
    const validStrategies: string[] = ["stop", "skip", "retry"];
    if (!validStrategies.includes(chain.errorHandling)) {
      return {
        success: false,
        error: "chain.errorHandling must be 'stop', 'skip', or 'retry'",
      };
    }

    try {
      const saved = await skillChainStore.save(chain);
      return { success: true, data: saved };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

---

### 2.4 skill:chain:delete

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| チャネル名     | `skill:chain:delete`                                 |
| 定数名         | `IPC_CHANNELS.SKILL_CHAIN_DELETE`                    |
| 方向           | Renderer → Main                                      |
| 引数           | `chainId: string`                                    |
| 戻り値         | `IpcResult<{ deleted: boolean }>`                    |
| バリデーション | sender 検証 + P42 準拠 3 段バリデーション（chainId） |
| 対応要件       | FR-7-4, FR-1-5                                       |

#### バリデーション規則（P42 準拠）

skill:chain:get と同一の 3 段バリデーション。

#### 正常系レスポンス

```typescript
// 削除成功
{ success: true, data: { deleted: true } }

// 存在しない chainId（エラーではなく deleted: false）
{ success: true, data: { deleted: false } }
```

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_DELETE,
  async (event, chainId: string) => {
    validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

    // P42 準拠 3 段バリデーション
    if (
      typeof chainId !== "string" ||
      chainId === "" ||
      chainId.trim() === ""
    ) {
      return { success: false, error: "chainId must be a non-empty string" };
    }

    try {
      const deleted = await skillChainStore.delete(chainId.trim());
      return { success: true, data: { deleted } };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

---

### 2.5 skill:chain:execute

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| チャネル名     | `skill:chain:execute`                                                       |
| 定数名         | `IPC_CHANNELS.SKILL_CHAIN_EXECUTE`                                          |
| 方向           | Renderer → Main                                                             |
| 引数           | `{ chainId: string; variables?: Record<string, unknown> }`                  |
| 戻り値         | `IpcResult<SkillChainResult>`                                               |
| バリデーション | sender 検証 + P42 準拠 3 段バリデーション（chainId） + variables 型チェック |
| 対応要件       | FR-7-5, FR-2-1 〜 FR-2-5                                                    |

#### バリデーション規則

| ステップ | チェック内容                                                                    | エラーメッセージ                     |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| 1        | `!args \|\| typeof args !== "object"`                                           | "args must be an object"             |
| 2        | `typeof args.chainId !== "string"`                                              | "chainId must be a non-empty string" |
| 3        | `args.chainId === ""`                                                           | "chainId must be a non-empty string" |
| 4        | `args.chainId.trim() === ""`                                                    | "chainId must be a non-empty string" |
| 5        | `args.variables !== undefined && (typeof args.variables !== "object" \|\| ...)` | "variables must be a plain object"   |

#### 正常系レスポンス

```typescript
{
  success: true,
  data: {
    chainId: "550e8400-e29b-41d4-a716-446655440000",
    success: true,
    results: [
      {
        stepId: "step-1",
        success: true,
        output: { data: [1, 2, 3] },
        duration: 150,
      },
      {
        stepId: "step-2",
        success: true,
        output: { summary: "分析完了" },
        duration: 200,
      },
      {
        stepId: "step-3",
        skipped: true,  // 条件不一致でスキップ
      },
    ],
    finalVariables: {
      rawData: { data: [1, 2, 3] },
      analysis: { summary: "分析完了" },
    },
    totalDuration: 380,
  }
}
```

#### 異常系レスポンス

```typescript
// チェーン実行失敗（errorHandling="stop"）
{
  success: true,
  data: {
    chainId: "550e8400-e29b-41d4-a716-446655440000",
    success: false,
    results: [
      { stepId: "step-1", success: true, output: {...}, duration: 150 },
      { stepId: "step-2", success: false, error: "Skill execution failed", duration: 50 },
    ],
    finalVariables: { rawData: { data: [1, 2, 3] } },
    totalDuration: 210,
  }
}

// チェーンが見つからない
{ success: false, error: "Chain not found" }

// バリデーションエラー
{ success: false, error: "chainId must be a non-empty string" }
```

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_EXECUTE,
  async (
    event,
    args: { chainId: string; variables?: Record<string, unknown> },
  ) => {
    validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });

    // 引数オブジェクトバリデーション
    if (!args || typeof args !== "object") {
      return { success: false, error: "args must be an object" };
    }

    // P42 準拠 3 段バリデーション（chainId）
    if (
      typeof args.chainId !== "string" ||
      args.chainId === "" ||
      args.chainId.trim() === ""
    ) {
      return { success: false, error: "chainId must be a non-empty string" };
    }

    // variables バリデーション（任意だがオブジェクト型を強制）
    if (
      args.variables !== undefined &&
      (typeof args.variables !== "object" ||
        args.variables === null ||
        Array.isArray(args.variables))
    ) {
      return { success: false, error: "variables must be a plain object" };
    }

    try {
      const chain = await skillChainStore.get(args.chainId.trim());
      if (!chain) {
        return { success: false, error: "Chain not found" };
      }

      const result = await skillChainExecutor.executeChain(
        chain,
        args.variables,
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

---

## 3. Preload API 仕様

### 3.1 chainAPI オブジェクト

```typescript
// apps/desktop/src/preload/skill-api.ts に追加

export const chainAPI = {
  /**
   * 保存済みチェーン一覧を取得する
   */
  list: (): Promise<IpcResult<SkillChainDefinition[]>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_LIST),

  /**
   * chainId 指定でチェーン定義を取得する
   */
  get: (chainId: string): Promise<IpcResult<SkillChainDefinition>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_GET, chainId),

  /**
   * チェーン定義を保存する（新規作成 or 更新）
   */
  save: (
    chain: SkillChainDefinition,
  ): Promise<IpcResult<SkillChainDefinition>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_SAVE, chain),

  /**
   * chainId 指定でチェーン定義を削除する
   */
  delete: (chainId: string): Promise<IpcResult<{ deleted: boolean }>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_DELETE, chainId),

  /**
   * チェーンを実行する
   */
  execute: (
    chainId: string,
    variables?: Record<string, unknown>,
  ): Promise<IpcResult<SkillChainResult>> =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, { chainId, variables }),
};
```

### 3.2 contextBridge 公開

```typescript
// contextBridge.exposeInMainWorld 内
electronAPI: {
  // ... 既存API ...
  chain: chainAPI,
}
```

### 3.3 Preload 型定義（types.ts 追加分）

```typescript
// apps/desktop/src/preload/types.ts に追加
import type { SkillChainDefinition, SkillChainResult } from "@repo/shared";

export interface ChainAPI {
  list: () => Promise<IpcResult<SkillChainDefinition[]>>;
  get: (chainId: string) => Promise<IpcResult<SkillChainDefinition>>;
  save: (
    chain: SkillChainDefinition,
  ) => Promise<IpcResult<SkillChainDefinition>>;
  delete: (chainId: string) => Promise<IpcResult<{ deleted: boolean }>>;
  execute: (
    chainId: string,
    variables?: Record<string, unknown>,
  ) => Promise<IpcResult<SkillChainResult>>;
}
```

---

## 4. IPC 契約整合性チェック（P44/P45 対策）

### 4.1 引数一致確認

| チャネル      | ハンドラ引数                                               | Preload 呼び出し                                 | 一致 |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------ | ---- |
| chain:list    | なし                                                       | `safeInvoke(CH.LIST)`                            | OK   |
| chain:get     | `chainId: string`                                          | `safeInvoke(CH.GET, chainId)`                    | OK   |
| chain:save    | `chain: SkillChainDefinition`                              | `safeInvoke(CH.SAVE, chain)`                     | OK   |
| chain:delete  | `chainId: string`                                          | `safeInvoke(CH.DELETE, chainId)`                 | OK   |
| chain:execute | `{ chainId: string; variables?: Record<string, unknown> }` | `safeInvoke(CH.EXECUTE, { chainId, variables })` | OK   |

### 4.2 引数名セマンティクス確認（P45 対策）

| 引数名    | 実際の値                | セマンティクス一致 |
| --------- | ----------------------- | ------------------ |
| chainId   | チェーン定義の UUID v4  | OK（ID を表す）    |
| chain     | SkillChainDefinition    | OK（定義全体）     |
| variables | Record<string, unknown> | OK（変数マップ）   |

---

## 5. セキュリティ仕様

### 5.1 全チャネル共通

- **sender 検証**: `validateIpcSender(event, { getAllowedWindows: () => [mainWindow] })` を全ハンドラの先頭で実行
- **エラーサニタイズ**: `sanitizeError()` で内部パス・スタックトレースを除去してから返す

### 5.2 P42 準拠 3 段バリデーション

文字列引数（chainId, chain.name）に対して以下の 3 段チェックを実施:

```typescript
// 3 段バリデーション
if (typeof value !== "string" || value === "" || value.trim() === "") {
  return { success: false, error: `${name} must be a non-empty string` };
}
```

### 5.3 パストラバーサル防止（SkillChainStore 内）

```typescript
// chainId からファイルパスを生成時に検証
const filePath = path.normalize(path.join(storePath, `${chainId}.json`));
if (!filePath.startsWith(storePath)) {
  throw new Error("Invalid chain ID: path traversal detected");
}
```

---

## 6. Renderer 状態設計

### 6.1 skillSlice チェーン状態追加

```typescript
// apps/desktop/src/renderer/store/slices/skillSlice.ts に追加

// 状態型
interface SkillChainSliceState {
  /** 保存済みチェーン定義一覧 */
  chains: SkillChainDefinition[];
  /** チェーン実行状態 */
  chainExecutionStatus: ChainExecutionStatus;
  /** 実行中のチェーン結果（実行中 or 最後の結果） */
  chainExecutionResult: SkillChainResult | null;
  /** チェーン一覧のローディング状態 */
  isChainsLoading: boolean;
  /** チェーン操作のエラーメッセージ */
  chainError: string | null;
}

type ChainExecutionStatus = "idle" | "running" | "completed" | "error";

// アクション型
interface SkillChainSliceActions {
  /** チェーン一覧を取得する */
  fetchChains: () => Promise<void>;
  /** チェーンを保存する */
  saveChain: (
    chain: SkillChainDefinition,
  ) => Promise<SkillChainDefinition | null>;
  /** チェーンを削除する */
  deleteChain: (chainId: string) => Promise<boolean>;
  /** チェーンを実行する */
  executeChain: (
    chainId: string,
    variables?: Record<string, unknown>,
  ) => Promise<SkillChainResult | null>;
  /** チェーンエラーをクリアする */
  clearChainError: () => void;
}
```

### 6.2 個別セレクタ設計（P31 対策）

```typescript
// 状態セレクタ
export const useChains = () => useAppStore((s) => s.chains);
export const useChainExecutionStatus = () =>
  useAppStore((s) => s.chainExecutionStatus);
export const useChainExecutionResult = () =>
  useAppStore((s) => s.chainExecutionResult);
export const useIsChainsLoading = () => useAppStore((s) => s.isChainsLoading);
export const useChainError = () => useAppStore((s) => s.chainError);

// アクションセレクタ（Zustand アクション参照は安定しているため
// useEffect 依存配列に安全に含められる）
export const useFetchChains = () => useAppStore((s) => s.fetchChains);
export const useSaveChain = () => useAppStore((s) => s.saveChain);
export const useDeleteChain = () => useAppStore((s) => s.deleteChain);
export const useExecuteChain = () => useAppStore((s) => s.executeChain);
export const useClearChainError = () => useAppStore((s) => s.clearChainError);
```

### 6.3 状態遷移図

```
chainExecutionStatus の状態遷移:

  idle ──[executeChain 開始]──→ running
                                    │
                    ┌───────────────┤
                    │               │
                    ▼               ▼
               completed         error
                    │               │
                    └───┬───────────┘
                        │
                        ▼
                [clearChainError / 次回実行]
                        │
                        ▼
                      idle
```

### 6.4 アクション実装概要

```typescript
// fetchChains アクション
fetchChains: async () => {
  set({ isChainsLoading: true, chainError: null });
  const result = await window.electronAPI.chain.list();
  if (result.success) {
    set({ chains: result.data, isChainsLoading: false });
  } else {
    set({ chainError: result.error, isChainsLoading: false });
  }
},

// executeChain アクション
executeChain: async (chainId, variables) => {
  set({ chainExecutionStatus: "running", chainError: null });
  const result = await window.electronAPI.chain.execute(chainId, variables);
  if (result.success) {
    set({
      chainExecutionStatus: "completed",
      chainExecutionResult: result.data,
    });
    return result.data;
  } else {
    set({
      chainExecutionStatus: "error",
      chainError: result.error,
      chainExecutionResult: null,
    });
    return null;
  }
},
```

---

## 7. Date 型シリアライズ設計

### 7.1 IPC 境界での Date 型変換戦略

| 層           | 型                   | 変換タイミング                                                       |
| ------------ | -------------------- | -------------------------------------------------------------------- |
| Main Process | `string`（ISO 8601） | SkillChainStore が JSON から読み込み時にそのまま文字列として保持     |
| IPC 境界     | `string`             | 変換不要（createdAt/updatedAt は ISO 8601 文字列としてそのまま転送） |
| Renderer     | `string`             | 表示時に `new Date(isoString).toLocaleString()` で変換               |

### 7.2 設計判断

SkillChainDefinition の createdAt/updatedAt は最初から `string`（ISO 8601）型として定義する。Main Process 内部でも Date オブジェクトに変換せず、一貫して ISO 8601 文字列を使用する。これにより IPC 境界での変換処理が不要になり、シリアライズの複雑さを排除する。

### 7.3 ISO 8601 文字列の生成方法

```typescript
// 新規作成時
const now = new Date().toISOString(); // "2026-02-28T12:00:00.000Z"
chain.createdAt = now;
chain.updatedAt = now;

// 更新時
chain.updatedAt = new Date().toISOString();
```

---

## 8. バリデーション規則一覧

### 全チャネル横断バリデーション一覧

| チャネル            | 引数名         | バリデーション種別         | P42 準拠    |
| ------------------- | -------------- | -------------------------- | ----------- |
| skill:chain:list    | なし           | sender 検証のみ            | N/A         |
| skill:chain:get     | chainId        | 3 段バリデーション         | 準拠        |
| skill:chain:save    | chain          | オブジェクトバリデーション | name に準拠 |
| skill:chain:save    | chain.name     | 3 段バリデーション（内部） | 準拠        |
| skill:chain:save    | chain.steps    | 配列チェック + 空配列      | N/A         |
| skill:chain:save    | errorHandling  | ホワイトリストチェック     | N/A         |
| skill:chain:delete  | chainId        | 3 段バリデーション         | 準拠        |
| skill:chain:execute | args           | オブジェクトチェック       | N/A         |
| skill:chain:execute | args.chainId   | 3 段バリデーション         | 準拠        |
| skill:chain:execute | args.variables | 型チェック（plain object） | N/A         |
