# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装（TDD: Green）              |
| 前提Phase  | Phase 4（テスト作成）           |
| 後続Phase  | Phase 6（テスト拡充）           |
| ステータス | pending                         |
| 作成日     | 2026-02-28                      |
| 機能名     | TASK-9D: スキルチェーン機能実装 |

---

## 目的

TDD（テスト駆動開発）の Green フェーズとして、Phase 4 で作成したテストを通す実装を行う。型定義（Shared）→ 実行エンジン（Main）→ 永続化（Main）→ IPC ハンドラ → Preload → Renderer Store の順に実装し、全テストが成功する状態にする。

## 背景

Phase 4 で Red 状態（テスト失敗）のテストが作成されている。本フェーズでは3層（Shared/Main/Preload）にまたがる実装を行い、IPC 契約チェックリスト（P42/P44/P45/P32）に準拠した堅牢な実装を提供する。

## 本ブランチ差分追補（Auth Callback Server）

| 変更ファイル                                                      | 実装差分                                                                                  | 対応要件（正本）                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/main/auth/authCallbackServer.ts`                | `waitForCallback()` タイムアウト時の自動 `stop()` を削除し、停止責務を明示化              | `security-implementation.md`（ローカルHTTPサーバー停止契約） |
| `apps/desktop/src/main/auth/authCallbackServer.ts`                | `stop()` で `server.listening` を確認し、二重停止時も `Promise<void>` を正常解決          | `patterns.md`（デスクトップOAuth受信パターン）               |
| `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts` | タイムアウトテスト終了時に `await server.stop()` を追加し、ワーカー終了前にクリーンアップ | `directory-structure.md`（auth責務配置）                     |

- タイムアウト時の挙動: `waitForCallback()` は reject のみを担当し、停止は呼び出し側で明示的に行う。
- 停止処理の冪等性: 既停止・未起動・closeエラー時も `stop()` は失敗扱いにしない。
- テスト完了条件: タイムアウト系テスト後に必ず `stop()` でクリーンアップする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。層の依存順（Shared → Main → IPC → Preload → Renderer）に従います。

### タスク1: 型定義実装（Shared 層）

**目的**: `packages/shared` に7つのスキルチェーン型を定義する

**実行手順**:

1. `packages/shared/src/types/skill-chain.ts` を作成し、以下の7型を定義する：

```typescript
// --- SkillChainDefinition ---
export interface SkillChainDefinition {
  id: string;
  name: string;
  description?: string;
  steps: SkillChainStep[];
  variables?: Record<string, unknown>;
  errorHandling: "stop" | "skip" | "retry";
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// --- SkillChainStep ---
export interface SkillChainStep {
  stepId: string;
  skillName: string;
  inputMapping: InputMapping;
  outputMapping?: OutputMapping;
  condition?: SkillChainCondition;
  timeout?: number;
  retryCount?: number;
}

// --- InputMapping ---
export interface InputMapping {
  type: "literal" | "variable" | "template" | "previousOutput";
  value?: unknown;
  template?: string;
}

// --- OutputMapping ---
export interface OutputMapping {
  extractPath?: string;
  variableName: string;
}

// --- SkillChainCondition ---
export interface SkillChainCondition {
  type: "always" | "ifVariable" | "ifPreviousSuccess" | "expression";
  expression?: string;
  variable?: string;
  expectedValue?: unknown;
}

// --- SkillChainResult ---
export interface SkillChainResult {
  chainId: string;
  success: boolean;
  results: StepResult[];
  finalVariables: Record<string, unknown>;
  totalDuration: number;
}

// --- StepResult ---
export interface StepResult {
  stepId: string;
  success?: boolean;
  skipped?: boolean;
  output?: unknown;
  error?: string;
  duration?: number;
}
```

2. `packages/shared/src/types/index.ts` にエクスポートを追加する：

```typescript
export * from "./skill-chain";
```

3. `pnpm --filter @repo/shared build` でビルドが通ることを確認する

**注意事項**:

- `createdAt` / `updatedAt` は ISO 8601 文字列型（IPC 境界でのシリアライズ方針）
- Main Process 内部で Date オブジェクトを使用する場合は、IPC 送信時に `.toISOString()` で変換する

**期待される成果物**:

- `packages/shared/src/types/skill-chain.ts`
- `packages/shared/src/types/index.ts`（修正）

---

### タスク2: SkillChainStore 実装（Main Process 層）

**目的**: チェーン定義の永続化（JSON ファイルベース）を実装する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillChainStore.ts` を作成する

2. 以下の4メソッドを実装する：

```typescript
import { SkillChainDefinition } from "@repo/shared";

export class SkillChainStore {
  private storagePath: string;

  constructor(storagePath?: string) {
    // デフォルトパス: userData/skill-chains.json
  }

  async save(definition: SkillChainDefinition): Promise<SkillChainDefinition> {
    // 1. 既存データを読み込み
    // 2. id が一致するエントリを上書き、なければ追加
    // 3. updatedAt を現在時刻の ISO 8601 文字列で更新
    // 4. JSON ファイルに書き戻し
    // 5. 保存された定義を返す
  }

  async get(chainId: string): Promise<SkillChainDefinition | null> {
    // 1. JSON ファイルから読み込み
    // 2. id が一致するエントリを返す、なければ null
  }

  async list(): Promise<SkillChainDefinition[]> {
    // 1. JSON ファイルから全データを読み込み
    // 2. 配列として返す（0件の場合は空配列）
  }

  async delete(chainId: string): Promise<void> {
    // 1. 既存データから id が一致するエントリを除外
    // 2. JSON ファイルに書き戻し
  }
}
```

3. テストを実行し、Store テストが Green になることを確認する

**注意事項**:

- ファイルI/Oのエラーハンドリング（ファイル未存在時の空配列返却、書き込みエラーの伝播）
- JSON パースエラー時はデータ破損として空配列にリセットしログ出力

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillChainStore.ts`

---

### タスク3: SkillChainExecutor 実装（Main Process 層）

**目的**: チェーン実行エンジンの5メソッドを実装する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` を作成する

2. 以下の5メソッドを実装する：

#### executeChain

```typescript
import {
  SkillChainDefinition,
  SkillChainResult,
  StepResult,
  SkillChainStep,
} from "@repo/shared";

export class SkillChainExecutor {
  constructor(
    private skillExecuteFn: (
      skillName: string,
      input: unknown,
    ) => Promise<unknown>,
  ) {}

  async executeChain(
    definition: SkillChainDefinition,
    variables?: Record<string, unknown>,
  ): Promise<SkillChainResult> {
    const startTime = Date.now();
    const currentVariables: Record<string, unknown> = {
      ...definition.variables,
      ...variables,
    };
    const results: StepResult[] = [];
    let previousOutput: unknown = undefined;
    let overallSuccess = true;

    for (const step of definition.steps) {
      // 1. evaluateCondition で実行可否を判定
      // 2. 条件不成立なら skipped: true で次へ
      // 3. buildStepInput で入力を構築
      // 4. スキル実行（timeout 考慮）
      // 5. extractOutput で出力マッピング
      // 6. エラー時は errorHandling に従い stop/skip/retry
    }

    return {
      chainId: definition.id,
      success: overallSuccess,
      results,
      finalVariables: currentVariables,
      totalDuration: Date.now() - startTime,
    };
  }
}
```

#### buildStepInput

```typescript
buildStepInput(
  inputMapping: InputMapping,
  variables: Record<string, unknown>,
  previousOutput: unknown
): unknown {
  switch (inputMapping.type) {
    case "literal":
      return inputMapping.value;
    case "variable":
      return variables[inputMapping.value as string];
    case "template":
      return this.renderTemplate(inputMapping.template ?? "", variables);
    case "previousOutput":
      return previousOutput;
  }
}
```

#### evaluateCondition

```typescript
evaluateCondition(
  condition: SkillChainCondition | undefined,
  variables: Record<string, unknown>,
  previousResult: StepResult | undefined
): boolean {
  if (!condition) return true;
  switch (condition.type) {
    case "always": return true;
    case "ifVariable":
      return variables[condition.variable ?? ""] === condition.expectedValue;
    case "ifPreviousSuccess":
      return previousResult?.success === true;
    case "expression":
      // 安全な式評価（Function コンストラクタは使わない）
      return this.evaluateSimpleExpression(condition.expression ?? "", variables);
  }
}
```

#### extractOutput

```typescript
extractOutput(
  outputMapping: OutputMapping | undefined,
  output: unknown,
  variables: Record<string, unknown>
): void {
  if (!outputMapping) return;
  const value = outputMapping.extractPath
    ? this.getNestedValue(output, outputMapping.extractPath)
    : output;
  variables[outputMapping.variableName] = value;
}
```

#### renderTemplate

```typescript
renderTemplate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : "";
  });
}
```

3. テストを実行し、Executor テストが Green になることを確認する

**注意事項**:

- `evaluateSimpleExpression` は `Function` コンストラクタや `eval` を使用しない（CSP 違反防止）
- timeout 処理は `Promise.race` と `AbortController` パターンで実装する
- retry 処理は指数バックオフなしの即時再試行（将来拡張可能な設計）

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`

---

### タスク4: IPC ハンドラ実装

**目的**: skillHandlers.ts に5チャネルのチェーンハンドラを追加する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` に以下の5ハンドラを追加する

2. 全ハンドラで以下を遵守する：
   - **IPC_CHANNELS 定数使用**（ハードコード文字列禁止）
   - **sender 検証**（validateIpcSender）
   - **P42 準拠 3段バリデーション**（文字列引数）

#### skill:chain:list

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_LIST, async (event) => {
  validateIpcSender(event);
  return chainStore.list();
});
```

#### skill:chain:get

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_GET, async (event, chainId: string) => {
  validateIpcSender(event);
  // P42 準拠 3段バリデーション
  if (typeof chainId !== "string" || chainId === "" || chainId.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "chainId must be a non-empty string",
    };
  }
  return chainStore.get(chainId.trim());
});
```

#### skill:chain:save

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_SAVE,
  async (event, definition: SkillChainDefinition) => {
    validateIpcSender(event);
    // オブジェクトバリデーション
    if (!definition || typeof definition !== "object") {
      throw {
        code: "VALIDATION_ERROR",
        message: "definition must be a valid object",
      };
    }
    // id バリデーション（P42 準拠）
    if (typeof definition.id !== "string" || definition.id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "definition.id must be a non-empty string",
      };
    }
    // name バリデーション（P42 準拠）
    if (typeof definition.name !== "string" || definition.name.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "definition.name must be a non-empty string",
      };
    }
    // steps バリデーション
    if (!Array.isArray(definition.steps)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "definition.steps must be an array",
      };
    }
    // errorHandling バリデーション
    if (!["stop", "skip", "retry"].includes(definition.errorHandling)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "definition.errorHandling must be 'stop', 'skip', or 'retry'",
      };
    }
    return chainStore.save(definition);
  },
);
```

#### skill:chain:delete

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_DELETE,
  async (event, chainId: string) => {
    validateIpcSender(event);
    if (
      typeof chainId !== "string" ||
      chainId === "" ||
      chainId.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "chainId must be a non-empty string",
      };
    }
    return chainStore.delete(chainId.trim());
  },
);
```

#### skill:chain:execute

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_EXECUTE,
  async (event, chainId: string, variables?: Record<string, unknown>) => {
    validateIpcSender(event);
    if (
      typeof chainId !== "string" ||
      chainId === "" ||
      chainId.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "chainId must be a non-empty string",
      };
    }
    if (
      variables !== undefined &&
      (typeof variables !== "object" ||
        variables === null ||
        Array.isArray(variables))
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "variables must be a plain object",
      };
    }
    const definition = await chainStore.get(chainId.trim());
    if (!definition) {
      throw {
        code: "NOT_FOUND",
        message: `Chain '${chainId.trim()}' not found`,
      };
    }
    return chainExecutor.executeChain(definition, variables);
  },
);
```

3. テストを実行し、IPC ハンドラテストが Green になることを確認する

**注意事項**:

- P5（リスナー二重登録防止）: `unregisterAllIpcHandlers()` に5チャネルを追加する
- P44/P45: 引数名（`chainId`）とセマンティクスを一致させる
- エラーレスポンスは内部情報を漏洩しないようサニタイズする

**期待される成果物**:

- `apps/desktop/src/main/ipc/skillHandlers.ts`（修正）

---

### タスク5: Preload 層拡張

**目的**: チャネル定数・API 関数・型定義を Preload 層に追加する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` にチャネル定数を追加する：

```typescript
// Skill Chain チャネル
SKILL_CHAIN_LIST: "skill:chain:list",
SKILL_CHAIN_GET: "skill:chain:get",
SKILL_CHAIN_SAVE: "skill:chain:save",
SKILL_CHAIN_DELETE: "skill:chain:delete",
SKILL_CHAIN_EXECUTE: "skill:chain:execute",
```

2. `apps/desktop/src/preload/skill-api.ts` に chainAPI を追加する：

```typescript
chainAPI: {
  list: () => safeInvoke(IPC_CHANNELS.SKILL_CHAIN_LIST),
  get: (chainId: string) => safeInvoke(IPC_CHANNELS.SKILL_CHAIN_GET, chainId),
  save: (definition: SkillChainDefinition) => safeInvoke(IPC_CHANNELS.SKILL_CHAIN_SAVE, definition),
  delete: (chainId: string) => safeInvoke(IPC_CHANNELS.SKILL_CHAIN_DELETE, chainId),
  execute: (chainId: string, variables?: Record<string, unknown>) =>
    safeInvoke(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, chainId, variables),
}
```

3. `apps/desktop/src/preload/types.ts` に型定義を追加する：

```typescript
import { SkillChainDefinition, SkillChainResult } from "@repo/shared";

// SkillChainAPI 型定義
export interface SkillChainAPI {
  list(): Promise<SkillChainDefinition[]>;
  get(chainId: string): Promise<SkillChainDefinition | null>;
  save(definition: SkillChainDefinition): Promise<SkillChainDefinition>;
  delete(chainId: string): Promise<void>;
  execute(
    chainId: string,
    variables?: Record<string, unknown>,
  ): Promise<SkillChainResult>;
}
```

4. `pnpm typecheck` で型整合性を検証する

**注意事項**:

- P32: `packages/shared/src/types/skill-chain.ts` と `apps/desktop/src/preload/types.ts` を同時更新する
- P27: safeInvoke の引数は `IPC_CHANNELS` 定数を使用（ハードコード文字列禁止）
- 引数名 `chainId` が IPC ハンドラ側と一致していることを確認（P44/P45）

**期待される成果物**:

- `apps/desktop/src/preload/channels.ts`（修正）
- `apps/desktop/src/preload/skill-api.ts`（修正）
- `apps/desktop/src/preload/types.ts`（修正）

---

### タスク6: Renderer Store 拡張

**目的**: skillSlice にチェーン関連の状態と個別セレクタを追加する

**実行手順**:

1. `apps/desktop/src/renderer/store/slices/skillSlice.ts` にチェーン状態を追加する：

```typescript
// State 拡張
chains: SkillChainDefinition[];
chainsLoading: boolean;
chainsError: string | null;
chainExecutionResult: SkillChainResult | null;
chainExecuting: boolean;

// Actions 拡張
fetchChains: () => Promise<void>;
saveChain: (definition: SkillChainDefinition) => Promise<void>;
deleteChain: (chainId: string) => Promise<void>;
executeChain: (chainId: string, variables?: Record<string, unknown>) => Promise<void>;
```

2. **個別セレクタ**を追加する（P31 準拠: 合成 Hook 禁止）：

```typescript
// 個別セレクタ
export const useChains = () => useStore((s) => s.chains);
export const useChainsLoading = () => useStore((s) => s.chainsLoading);
export const useChainsError = () => useStore((s) => s.chainsError);
export const useChainExecutionResult = () =>
  useStore((s) => s.chainExecutionResult);
export const useChainExecuting = () => useStore((s) => s.chainExecuting);
export const useFetchChains = () => useStore((s) => s.fetchChains);
export const useSaveChain = () => useStore((s) => s.saveChain);
export const useDeleteChain = () => useStore((s) => s.deleteChain);
export const useExecuteChain = () => useStore((s) => s.executeChain);
```

3. テストを実行し、全テストが Green になることを確認する

**注意事項**:

- P31: `useChainStore()` のような合成 Hook は作成しない。個別セレクタのみ提供する
- IPC 呼び出しは `window.electronAPI.skill.chainAPI.*` 経由
- Date 型フィールドは IPC から ISO 8601 文字列として受信し、そのまま string で保持

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/skillSlice.ts`（修正）

---

### タスク7: Green 状態確認

**目的**: 全テストが成功することを確認する（TDD Green フェーズ）

**実行手順**:

1. 以下のコマンドでテストを実行する：

```bash
# Shared 型テスト
cd packages/shared && pnpm vitest run src/types/skill-chain.test.ts

# Main Process テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillChainExecutor.test.ts src/main/services/skill/SkillChainStore.test.ts

# IPC ハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.chain.test.ts
```

2. 全テストが成功することを確認する

3. `pnpm typecheck` で型チェックが通ることを確認する

4. `outputs/phase-5/implementation-summary.md` に実装サマリーとテスト実行結果を記録する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

### タスク8: 設計変更記録

**目的**: Phase 2 設計からの乖離がある場合に記録する

**実行手順**:

1. Phase 2 の設計（`outputs/phase-2/architecture-design.md`）と実装を比較する
2. 乖離がある場合、`outputs/phase-5/design-changes.md` に以下を記録する：
   - 変更箇所
   - 変更理由
   - 影響範囲

3. 乖離がない場合も「設計変更なし」として記録する

**期待される成果物**:

- `outputs/phase-5/design-changes.md`

---

## 参照資料

| 参照資料              | パス                                                                                                                         | 内容                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 設計書                | `outputs/phase-2/architecture-design.md`                                                                                     | クラス・メソッド設計          |
| API仕様               | `outputs/phase-2/api-specification.md`                                                                                       | IPC仕様・引数定義             |
| 型設計                | `outputs/phase-2/type-design.md`                                                                                             | 7型の詳細定義                 |
| Phase 4 テスト        | `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts`                                                            | Executor テスト               |
| Phase 4 テスト        | `apps/desktop/src/main/services/skill/SkillChainStore.test.ts`                                                               | Store テスト                  |
| Phase 4 テスト        | `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts`                                                                      | IPC ハンドラテスト            |
| タスク仕様            | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` | 型定義・IPC定義の正本         |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                | P42/P44/P45検証               |
| セキュリティIPC       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                    | sender検証・サニタイズ        |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                 | Zustand Slice設計             |
| 認証IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                                                          | OAuthコールバック系エラー契約 |
| 認証セキュリティ実装  | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`                                               | authCallbackServer停止条件    |
| 認証実装パターン      | `.claude/skills/aiworkflow-requirements/references/patterns.md`                                                              | ローカルHTTP受信パターン      |
| 実装責務マップ        | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`                                                   | authファイル責務の正本        |

---

## 成果物

| 成果物               | パス                                                              | 内容                         |
| -------------------- | ----------------------------------------------------------------- | ---------------------------- |
| 型定義               | `packages/shared/src/types/skill-chain.ts`                        | 7型定義                      |
| 型エクスポート       | `packages/shared/src/types/index.ts`                              | エクスポート追加             |
| SkillChainExecutor   | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`      | チェーン実行エンジン         |
| SkillChainStore      | `apps/desktop/src/main/services/skill/SkillChainStore.ts`         | チェーン永続化               |
| IPC ハンドラ         | `apps/desktop/src/main/ipc/skillHandlers.ts`                      | 5チャネル追加                |
| チャネル定数         | `apps/desktop/src/preload/channels.ts`                            | 5チャネル定数追加            |
| Preload API          | `apps/desktop/src/preload/skill-api.ts`                           | chainAPI 追加                |
| Preload 型定義       | `apps/desktop/src/preload/types.ts`                               | SkillChainAPI 型追加         |
| Renderer Store       | `apps/desktop/src/renderer/store/slices/skillSlice.ts`            | チェーン状態・セレクタ       |
| Auth Callback Server | `apps/desktop/src/main/auth/authCallbackServer.ts`                | タイムアウト/停止の責務分離  |
| Auth Callback Test   | `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts` | タイムアウト後クリーンアップ |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`                       | 実装記録                     |
| 設計変更記録         | `outputs/phase-5/design-changes.md`                               | 設計乖離記録                 |

---

## TDD検証

### TDD サイクル確認

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillChainExecutor.test.ts src/main/services/skill/SkillChainStore.test.ts src/main/ipc/skillHandlers.chain.test.ts

# 型テスト実行
cd packages/shared && pnpm vitest run src/types/skill-chain.test.ts

# 型チェック
pnpm typecheck
```

**確認項目**:

- [ ] テストが成功することを確認（Green 状態）
- [ ] 型チェックが通ること

---

## 統合テスト連携

**Phase 5 では統合テストの準備として**:

- SkillChainStore のコンストラクタでストレージパスを DI 可能にし、テスト時に一時ディレクトリを使用可能にする
- SkillChainExecutor のコンストラクタで `skillExecuteFn` を DI し、テスト時にモック関数を注入可能にする
- IPC ハンドラは P5（二重登録防止）対応の解除/再登録パターンに従う

---

## 多角的チェック観点

### 実装品質

| 観点                  | 確認内容                                                           | 結果 |
| --------------------- | ------------------------------------------------------------------ | ---- |
| P42 3段バリデーション | 全文字列引数に typeof → 空文字列 → trim() チェックが実装されている | □    |
| P44 契約整合          | IPC引数の形式がPreload側の渡し方と一致している                     | □    |
| P45 引数命名          | 引数名がセマンティクスと一致（chainId は実際にIDを表す）           | □    |
| P32 型同時更新        | shared と preload の型定義が同期している                           | □    |
| P31 個別セレクタ      | 合成 Hook を使わず個別セレクタのみ提供している                     | □    |
| P5 二重登録防止       | unregisterAllIpcHandlers に5チャネルが追加されている               | □    |
| CSP 準拠              | eval / Function コンストラクタを使用していない                     | □    |
| Date シリアライズ     | IPC 境界で ISO 8601 文字列に変換している                           | □    |
| エラーサニタイズ      | IPC エラーレスポンスに内部情報が含まれていない                     | □    |

### Electron 固有観点

| 観点              | 確認内容                                           | 結果 |
| ----------------- | -------------------------------------------------- | ---- |
| sender 検証       | 全5ハンドラで validateIpcSender が呼ばれている     | □    |
| IPC_CHANNELS 定数 | ハードコード文字列でチャネル名を指定していない     | □    |
| contextBridge     | Preload 層で contextBridge 経由の API 公開が正しい | □    |

---

## 完了条件

- [ ] 7つの型定義が `packages/shared` に作成されている
- [ ] SkillChainExecutor の5メソッドが実装されている
- [ ] SkillChainStore の4メソッドが実装されている
- [ ] 5つの IPC ハンドラが P42 準拠バリデーション付きで実装されている
- [ ] Preload 層にチャネル定数・API・型定義が追加されている
- [ ] skillSlice にチェーン状態と個別セレクタが追加されている
- [ ] Phase 4 の全テストが Green 状態（成功）である
- [ ] `pnpm typecheck` が通る
- [ ] 実装サマリーが記録されている
- [ ] 設計変更記録が作成されている（変更なしの場合もその旨を記録）

---

## サブタスク管理

Phase 5 の進行中に検出したサブタスクは以下に記録し、Phase 12 の未タスク検出で処理する：

| #   | サブタスク | 対応Phase | ステータス |
| --- | ---------- | --------- | ---------- |
|     |            |           |            |

---

## タスク100%実行確認

| タスク | 内容                | 完了 |
| ------ | ------------------- | ---- |
| 1      | 型定義実装          | □    |
| 2      | Store 実装          | □    |
| 3      | Executor 実装       | □    |
| 4      | IPC ハンドラ実装    | □    |
| 5      | Preload 層拡張      | □    |
| 6      | Renderer Store 拡張 | □    |
| 7      | Green 状態確認      | □    |
| 8      | 設計変更記録        | □    |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（8タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] 新規作成3ファイル + 修正6ファイルが正しく変更されている

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9D-skill-chain/phase-6-test-expansion.md`
