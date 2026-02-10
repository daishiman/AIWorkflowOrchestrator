# UT-FIX-5-4 型変更仕様書

## 変更概要

| 項目       | 内容                      |
| ---------- | ------------------------- |
| 変更対象   | abort()メソッドの戻り値型 |
| 変更内容   | `void` → `Promise<void>`  |
| 影響範囲   | 2ファイル・2行            |
| 破壊的変更 | なし（後方互換）          |

## 詳細仕様

### 変更箇所1: apps/desktop/src/preload/types.ts

**ファイルパス**: `apps/desktop/src/preload/types.ts`
**行番号**: 1289
**インターフェース**: `AgentSDKAPI`

```diff
 export interface AgentSDKAPI {
   getStatus: () => Promise<AgentSDKStatus>;
   createSession: () => Promise<AgentSDKCreateSessionResponse>;
   resumeSession: (request: AgentSDKResumeSessionRequest) => Promise<void>;
   destroySession: (request: AgentSDKDestroySessionRequest) => Promise<void>;
   query: (request: AgentSDKQueryRequest) => Promise<void>;
-  abort: () => void;
+  abort: () => Promise<void>;
   onMessage: (callback: (message: AgentSDKMessage) => void) => () => void;
   setOption: (options: { timeout?: number }) => void;
   getOption: (key: string) => number | undefined;
   setSessionId: (sessionId: string) => void;
 }
```

### 変更箇所2: packages/shared/src/agent/types.ts

**ファイルパス**: `packages/shared/src/agent/types.ts`
**行番号**: 236
**インターフェース**: `AgentAPI`

```diff
 export interface AgentAPI {
   /**
    * クエリを実行する
    */
   query(prompt: string, options?: QueryOptions): Promise<void>;

   /**
    * 実行中のクエリを中断する
    */
-  abort(): void;
+  abort(): Promise<void>;

   /**
    * エージェントのステータスを取得する
    */
   getStatus(): Promise<AgentStatus>;
   // ...
 }
```

## 型互換性分析

### TypeScriptの型推論

```typescript
// void → Promise<void> の互換性

// 1. void として扱う場合（既存コード）
abort(); // OK: Promise<void> は void コンテキストで許容

// 2. Promise として扱う場合（将来の拡張）
await abort(); // OK: 正しい型推論
```

### 呼び出しパターン別互換性

| パターン          | 変更前   | 変更後 | 互換性 |
| ----------------- | -------- | ------ | ------ |
| `abort()`         | 有効     | 有効   | OK     |
| `await abort()`   | 型エラー | 有効   | 改善   |
| `abort().then()`  | 型エラー | 有効   | 改善   |
| `abort().catch()` | 型エラー | 有効   | 改善   |

## 呼び出し箇所詳細分析

### 1. apps/desktop/src/main/agent/agent-handler.ts

**行84**:

```typescript
if (this.agentClient.isQueryRunning()) {
  this.agentClient.abort(); // 戻り値未使用
}
```

**行100**:

```typescript
handleAbort(): void {
  this.agentClient.abort();  // 戻り値未使用
}
```

**影響**: なし（戻り値を使用していない）

### 2. apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx

**行303-308**:

```typescript
const handleAbort = useCallback(() => {
  if (window.agentSDKAPI) {
    window.agentSDKAPI.abort(); // 戻り値未使用
  }
  setExecutionStatus("cancelled");
}, []);
```

**影響**: なし（戻り値を使用していない）

### 3. apps/desktop/src/renderer/hooks/useAgent.ts

**行167-172**:

```typescript
const abort = useCallback(() => {
  const agentAPI = getAgentAPI();
  agentAPI.abort(); // 戻り値未使用
  setIsLoading(false);
}, []);
```

**影響**: なし（戻り値を使用していない）

### 4. テストファイル

| ファイル             | 使用箇所   | 影響                 |
| -------------------- | ---------- | -------------------- |
| agent-client.test.ts | 複数       | なし（戻り値未使用） |
| useAgent.test.ts     | 335, 353行 | なし（戻り値未使用） |

## 実装手順

### Step 1: preload/types.ts の修正

```bash
# ファイル: apps/desktop/src/preload/types.ts
# 行: 1289
# 変更: abort: () => void; → abort: () => Promise<void>;
```

### Step 2: shared/agent/types.ts の修正

```bash
# ファイル: packages/shared/src/agent/types.ts
# 行: 236
# 変更: abort(): void; → abort(): Promise<void>;
```

### Step 3: 型チェック実行

```bash
pnpm typecheck
# 期待: abort()関連のエラーなし
```

### Step 4: テスト実行

```bash
pnpm test
# 期待: 全テストPASS
```

## 検証チェックリスト

### 実装完了時

- [ ] preload/types.ts の abort 型を `Promise<void>` に変更
- [ ] shared/agent/types.ts の abort 型を `Promise<void>` に変更
- [ ] 両ファイルの型が一致していることを確認

### 品質検証時

- [ ] `pnpm typecheck` 成功
- [ ] `pnpm lint` 成功
- [ ] `pnpm test` 成功（abort関連テスト含む）

## 付録: AbortController.abort()との区別

プロジェクト内には多数の `.abort()` 呼び出しが存在するが、以下は本タスクの対象外:

| カテゴリ        | 例                        | 理由               |
| --------------- | ------------------------- | ------------------ |
| AbortController | `abortController.abort()` | 標準API            |
| 他サービス      | `skill.abort()`           | 別インターフェース |
| fetch中断       | `controller.abort()`      | 標準API            |

今回の修正対象は以下のみ:

- `AgentSDKAPI.abort()`
- `AgentAPI.abort()`
