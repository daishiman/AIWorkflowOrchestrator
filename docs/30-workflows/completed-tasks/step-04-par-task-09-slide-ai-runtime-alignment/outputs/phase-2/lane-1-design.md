# Phase 2 Lane 1 設計成果物: Runtime Routing / Lifecycle / Direct SDK 排除

## 担当タスク: T-2-1, T-2-2, T-2-4

---

## 1. Runtime Routing 設計（T-2-1）

### 1-1. 現行フロー（問題のある状態）

```
[slide/SyncManager]
       |
       v
[slide/SkillExecutor]  <-- createSkillExecutor() 引数なし
       |
       v
[slide/agent-client.ts]  <-- getAgentAPI() を呼び出し
       |
       +-- (L99)  new Store<{anthropic_api_key}>()  ← 独自 electron-store
       +-- (L117) store.get("anthropic_api_key")    ← 直接読み取り
       +-- (L127) process.env.ANTHROPIC_API_KEY     ← env silent fallback
       +-- (L245) new Anthropic({ apiKey })          ← Direct SDK
       +-- (L248) client.messages.create(...)        ← Direct SDK 呼び出し

[slide/modifier-skill.ts]  <-- 孤立: createModifierSkill() は呼び出し元なし
       |
       v
[slide/agent-client.ts]  <-- 同じ問題経路を使用
```

### 1-2. 目標フロー（統一後）

```
[slide/SyncManager]
       |
       v  DI: SkillExecutor インスタンスを受け取る
[slide/SkillExecutor]  <-- createSkillExecutor(authKeyService, authModeService)
       |
       v  execute() 先頭で resolve() を await する
[services/runtime/RuntimeResolver]  <-- 既存クラスを再利用（DI で注入）
       |
       +-- authModeService.getMode()  ← IAuthModeService (DIP)
       +-- authKeyService.hasKey()    ← IAuthKeyService  (DIP)
       +-- authKeyService.getKey()    ← IAuthKeyService  (DIP)
       |
       v  RuntimeResolution を返す
  type: "integrated"  -->  authKeyService.getKey() で取得した apiKey を使い Anthropic SDK 呼び出し
  type: "handoff"     -->  SkillExecutionResult { success: false, error: reason, isHandoff: true }
```

### 1-3. 分岐ルール

| authMode     | hasKey | 結果       | handoff reason                                                               |
| ------------ | ------ | ---------- | ---------------------------------------------------------------------------- |
| subscription | -      | handoff    | "サブスクリプションモードのため、Claude Code CLI で続行してください。"       |
| api-key      | false  | handoff    | "API キーが設定されていません。設定画面から API キーを登録してください。"    |
| api-key      | true   | integrated | SkillExecutor が `authKeyService.getKey()` で取得した apiKey で SDK 呼び出し |

### 1-4. handoff 時の SkillExecutionResult 型拡張

現行の `SkillExecutionResult`（`@repo/shared`）に `isHandoff` フラグを追加する。

```typescript
// @repo/shared/types/skill-types.ts （既存型への追加）
export interface SkillExecutionResult {
  phase: SkillPhase;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  changes?: StructureChange[];
  direction?: "forward" | "reverse";
  projectPath?: string;
  isHandoff?: boolean; // 追加: handoff 時に true を設定
}
```

### 1-5. SkillExecutor のシグネチャ変更

```typescript
// Before（廃止）
export const createSkillExecutor = (): SkillExecutor => { ... }

// After（統一後）
export const createSkillExecutor = (
  authKeyService: IAuthKeyService,
  authModeService: IAuthModeService,
): SkillExecutor => { ... }
```

`createSkillExecutor()` の引数なし呼び出しはコンパイルエラーになることで、移行漏れを静的に検出できる。

### 1-6. execute() 内の runtime 解決コード骨格

```typescript
async execute(phase: SkillPhase, projectPath: string): Promise<SkillExecutionResult> {
  const startTime = Date.now();

  // 1. RuntimeResolver で integrated / handoff を判定
  const resolver = new RuntimeResolver(authKeyService, authModeService);
  const resolution = await resolver.resolve();

  if (resolution.type === "handoff") {
    return {
      phase,
      success: false,
      error: resolution.reason,
      duration: Date.now() - startTime,
      isHandoff: true,
    };
  }

  // 2. integrated 経路: apiKey を取得して SDK 呼び出し
  const apiKey = await authKeyService.getKey();
  if (!apiKey) {
    // フェイルセキュア: resolved が integrated でも getKey() が null の場合は失敗
    return {
      phase,
      success: false,
      error: "API キーを取得できませんでした。",
      duration: Date.now() - startTime,
    };
  }

  // 3. Anthropic SDK 呼び出し（agent-client.ts の executeAgentQuery に相当）
  const client = new Anthropic({ apiKey });
  // ... 以下既存ロジックに SDK_CONFIG, timeout, abort signal を渡す
}
```

---

## 2. Role 設計（T-2-2）

### 2-1. 各モジュールの責務

| モジュール                | 責務（単一）                                                                              | 廃止 / 残存         |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| `slide/file-watcher.ts`   | ファイル変更検知のみ。chokidar で structure.md / index.html を監視する                    | 残存（変更なし）    |
| `slide/sync-manager.ts`   | 逆同期 orchestration + SyncStatus 管理。AI 処理は SkillExecutor に委譲                    | 残存（DI 引数追加） |
| `slide/skill-executor.ts` | RuntimeResolver 呼び出し + Anthropic SDK 呼び出し + modifier prompt 構成の統合            | 残存（拡張）        |
| `slide/modifier-skill.ts` | **廃止**。`buildModifierPrompt()` / `parseModifierResponse()` を skill-executor.ts に移動 | **廃止**            |
| `slide/agent-client.ts`   | **廃止**。全機能を SkillExecutor + RuntimeResolver に移管                                 | **廃止**            |

### 2-2. DI 注入テーブル

| ファクトリ / クラス                                               | 注入される依存                         | 型                   | 注入タイミング         |
| ----------------------------------------------------------------- | -------------------------------------- | -------------------- | ---------------------- |
| `createSkillExecutor(authKeyService, authModeService)`            | AuthKeyService インスタンス            | `IAuthKeyService`    | SyncManager 初期化時   |
| `createSkillExecutor(authKeyService, authModeService)`            | AuthModeService インスタンス           | `IAuthModeService`   | SyncManager 初期化時   |
| `createSyncManager(executor?, authKeyService?, authModeService?)` | SkillExecutor（or 既存生成）           | `SkillExecutor`      | IPC ハンドラ登録時     |
| `RuntimeResolver` （createSkillExecutor 内部で生成）              | 同上の authKeyService, authModeService | 既存 RuntimeResolver | execute() 呼び出しごと |

### 2-3. modifier prompt 統合

`modifier-skill.ts` の以下の関数 / 型を `skill-executor.ts` に移動する:

| 移動元                                                      | 移動先                                    | export 変更     |
| ----------------------------------------------------------- | ----------------------------------------- | --------------- |
| `buildModifierPrompt(context: ModifierContext): string`     | `skill-executor.ts`                       | `export` を保持 |
| `parseModifierResponse(response: string): ModifierResponse` | `skill-executor.ts`                       | `export` を保持 |
| `ModifierContext` 型                                        | `skill-executor.ts` または `@repo/shared` | 再 export       |
| `ModifierResponse` 型                                       | `skill-executor.ts` または `@repo/shared` | 再 export       |
| `StructureChange` 型                                        | `@repo/shared`（既存）                    | 変更なし        |

**統合後の skill-executor.ts の責務**:

- `execute(phase, projectPath)` のエントリーポイント（変更なし）
- `phase === "modifier"` 時に `buildModifierPrompt()` を内部で呼び出す
- `parseModifierResponse()` で AI レスポンスをパースする
- `RuntimeResolver.resolve()` で integrated / handoff を判定する
- integrated 時に `new Anthropic({ apiKey })` で SDK を初期化して呼び出す

### 2-4. createSyncManager のシグネチャ変更

```typescript
// Before
export const createSyncManager = (executor?: SkillExecutor): SyncManager

// After（テスト互換性を維持しつつ DI 引数を追加）
export const createSyncManager = (
  executor?: SkillExecutor,
  authKeyService?: IAuthKeyService,
  authModeService?: IAuthModeService,
): SyncManager => {
  // executor が渡されない場合は authKeyService, authModeService で生成
  const skillExecutor = executor ?? createSkillExecutor(authKeyService!, authModeService!);
  // ...
}
```

**IPC ハンドラ登録時（プロダクションコード）**:

```typescript
// apps/desktop/src/main/slide/ipc-handlers.ts
const syncManager = createSyncManager(
  undefined,
  container.authKeyService,
  container.authModeService,
);
```

---

## 3. Direct SDK 排除設計（T-2-4）

### 3-1. agent-client.ts 廃止の影響分析テーブル

| 影響ファイル                                     | 現在の依存内容                                     | 移行後の対応                                               | 影響度         |
| ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------- | -------------- |
| `main/slide/skill-executor.ts`                   | `import { getAgentAPI } from "./agent-client"`     | `IAuthKeyService.getKey()` + `new Anthropic()` に変更      | **高**         |
| `main/slide/modifier-skill.ts`                   | `import { getAgentAPI } from "./agent-client"`     | ファイル自体を廃止（skill-executor.ts に統合）             | **高（廃止）** |
| `main/slide/__tests__/agent-client.test.ts`      | `getAgentAPI`, `resetAgentAPI` をテスト            | ファイル廃止。テストケースを skill-executor.test.ts に移植 | **高（廃止）** |
| `main/slide/__tests__/modifier-skill.test.ts`    | `getAgentAPI` モック経由で modifier-skill をテスト | ファイル廃止。skill-executor.test.ts に統合                | **高（廃止）** |
| `main/slide/__tests__/skill-executor.test.ts`    | `vi.mock("../agent-client")` でモック              | `IAuthKeyService` / `IAuthModeService` モックに切り替え    | **中**         |
| `main/slide/__tests__/sdk-integration.test.ts`   | `agent-client.ts` の統合テスト                     | RuntimeResolver + SkillExecutor の統合テストに改修         | **中**         |
| `main/slide/__tests__/slide-integration.test.ts` | `agent-client` 経由の E2E 動作テスト               | SyncManager + SkillExecutor の統合テスト（依存 mock 更新） | **中**         |

### 3-2. 排除方法（3ステップ）

#### ステップ 1: skill-executor.ts を改修

`getAgentAPI()` 呼び出しを RuntimeResolver + 直接 SDK 呼び出しに置き換える。

コード骨格は 1-6 節を参照。追加で以下を実施:

- `import { getAgentAPI } from "./agent-client"` を削除
- `import Anthropic from "@anthropic-ai/sdk"` を追加
- `import type { IAuthKeyService, IAuthModeService } from "../services/auth/types"` を追加
- `import { RuntimeResolver } from "../services/runtime/RuntimeResolver"` を追加
- `buildModifierPrompt()`, `parseModifierResponse()` を modifier-skill.ts からコピー移動

#### ステップ 2: modifier-skill.ts を廃止

1. `buildModifierPrompt()` / `parseModifierResponse()` を skill-executor.ts に移動（コピー後に削除）
2. `createModifierSkill()` の呼び出し元が 0 件であることを確認:
   ```bash
   grep -rn "createModifierSkill" apps/desktop/src/
   ```
3. `modifier-skill.ts` を削除

#### ステップ 3: agent-client.ts を廃止

1. 全 import 元が 0 件であることを確認:
   ```bash
   grep -rn "agent-client" apps/desktop/src/main/
   ```
2. `agent-client.ts` を削除

### 3-3. テストファイル 3 本への影響詳細

#### `__tests__/agent-client.test.ts` → 廃止

- モック対象（`@anthropic-ai/sdk`, `electron-store`, `electron.safeStorage`）が agent-client 専用のため廃止
- **移植先**: `skill-executor.test.ts` に以下のテストケースを追加:
  - `subscription モードで handoff を返す`
  - `api-key モードで API キー未設定の場合 handoff を返す`
  - `integrated モードで Anthropic SDK を呼び出す`
  - `タイムアウト時に Request timeout エラーを返す`
  - `abort 時に Aborted エラーを返す`

#### `__tests__/modifier-skill.test.ts` → 廃止

- `getAgentAPI` を `vi.mock("../agent-client")` でモックするパターンを廃止
- **移植先**: `skill-executor.test.ts` の modifier phase テストセクションに統合
  - `buildModifierPrompt()` のユニットテスト（コンテキスト構築の正確性）
  - `parseModifierResponse()` のユニットテスト（JSON パース・バリデーション）
  - `execute("modifier", projectPath)` の統合テスト

#### `__tests__/skill-executor.test.ts` → 改修

削除:

```typescript
vi.mock("../agent-client", () => ({
  getAgentAPI: vi.fn(() => mockAgentAPI),
  resetAgentAPI: vi.fn(),
}));
```

追加（beforeEach 内）:

```typescript
const mockAuthKeyService: IAuthKeyService = {
  setKey: vi.fn(),
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key"),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi.fn().mockResolvedValue(true),
  deleteKey: vi.fn(),
};

const mockAuthModeService: IAuthModeService = {
  getMode: vi.fn().mockReturnValue("api-key"),
  setMode: vi.fn(),
  getStatus: vi.fn(),
  getCredential: vi.fn(),
  onModeChange: vi.fn(),
  validateMode: vi.fn(),
};

// Anthropic SDK をモック
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));
```

executor 生成の変更:

```typescript
// Before
const executor = createSkillExecutor();

// After
const executor = createSkillExecutor(mockAuthKeyService, mockAuthModeService);
```

---

## 4. 設計依存関係まとめ

```
IAuthKeyService    (services/auth/types.ts)
IAuthModeService   (services/auth/types.ts)
         |
         v
RuntimeResolver    (services/runtime/RuntimeResolver.ts)  ← 既存クラスを再利用
         |
         v
slide/skill-executor.ts  ← createSkillExecutor(authKeyService, authModeService)
         |                  + buildModifierPrompt()  (moved from modifier-skill.ts)
         |                  + parseModifierResponse() (moved from modifier-skill.ts)
         v
slide/sync-manager.ts    ← createSyncManager(executor?, authKeyService?, authModeService?)
         |
         v
slide/file-watcher.ts    ← 変更なし
```

### 廃止ファイル

| ファイル                                                       | 理由                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/slide/agent-client.ts`                  | Direct SDK / 独自ストア読み取りを排除                      |
| `apps/desktop/src/main/slide/modifier-skill.ts`                | createModifierSkill() が孤立。関数を skill-executor に統合 |
| `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`   | agent-client.ts 廃止に伴い廃止                             |
| `apps/desktop/src/main/slide/__tests__/modifier-skill.test.ts` | modifier-skill.ts 廃止に伴い廃止                           |

### 残存・改修ファイル

| ファイル                                                          | 変更内容                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/slide/skill-executor.ts`                   | DI 引数追加・RuntimeResolver 統合・modifier prompt 統合     |
| `apps/desktop/src/main/slide/sync-manager.ts`                     | DI 引数追加（オプション引数として追加）                     |
| `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`    | モック差替（agent-client → authKeyService/authModeService） |
| `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`   | RuntimeResolver + SkillExecutor 統合テストに改修            |
| `apps/desktop/src/main/slide/__tests__/slide-integration.test.ts` | SyncManager + SkillExecutor 統合テスト（依存 mock 更新）    |
| `packages/shared/src/types/skill-types.ts`（または該当ファイル）  | `SkillExecutionResult` に `isHandoff?: boolean` を追加      |

---

## 5. 完了条件チェックリスト（Lane 1 担当分）

- [x] agent-client.ts 廃止の影響分析テーブル（全 7 ファイル）が完成している
- [x] RuntimeResolver を slide 経路に適用する設計が明文化されている
- [x] API Key 取得経路を `IAuthKeyService.getKey()` に統一する設計が明文化されている
- [x] 分岐ルール（integrated / handoff）が条件・ reason・戻り値とともに定義されている
- [x] フロー図（現行 -> 目標）が記述されている
- [x] FileWatcher の責務と DI 注入点が明示されている
- [x] SyncManager の責務と DI 注入点が明示されている
- [x] modifier-skill.ts の二重実装解消方針（廃止 + 統合先）が明記されている
- [x] テストファイル 3 本への影響詳細（廃止 / 改修 / 移植先）が記述されている
