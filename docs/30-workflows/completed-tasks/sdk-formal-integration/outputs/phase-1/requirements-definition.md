# Phase 1: 要件定義 - Agent SDK 正式統合

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION          |
| Phase    | 1（要件定義）                             |
| 作成日   | 2026-02-12                                |
| 作成者   | Claude Agent (Phase 1-3)                  |
| ブランチ | refactor/task-9b-i-sdk-formal-integration |

---

## 1. 現状分析

### 1.1 問題箇所の特定

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

**問題コード** (L758-L760):

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
```

このコードには以下の問題がある:

1. `as any` によりSDKモジュールの全型情報が喪失する
2. `query` 関数の引数・戻り値の型チェックが無効になる
3. ESLint の `@typescript-eslint/no-explicit-any` を明示的に無効化している
4. IDEでの補完・型推論が効かない

### 1.2 SkillExecutor内のローカル型定義

SkillExecutor.ts には SDK 関連のローカル型定義が2つ存在する:

#### SDKQueryOptions (L420-L425)

```typescript
interface SDKQueryOptions {
  tools?: string[];
  permissionMode?: "default" | "plan" | "bypassPermissions";
  signal?: AbortSignal;
  timeout?: number;
}
```

#### SDKMessage (L427-L437)

```typescript
interface SDKMessage {
  type?: string;
  content?: string;
  tool_use?: {
    name: string;
    input: unknown;
  };
  error?: {
    message: string;
  };
}
```

これらはSDK本体の型定義とは独立して定義されている。

### 1.3 SDK型定義の現状

#### 1.3.1 カスタム型宣言ファイル

**ファイル**: `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`

```typescript
declare module "@anthropic-ai/claude-agent-sdk" {
  export interface SDKConfig { apiKey: string; }
  export interface QueryOptions { prompt: string; sessionId?: string; systemPrompt?: string; }
  export interface QueryMessage { id: string; type: ...; content: string; timestamp: number; isComplete: boolean; }
  export interface QueryResult { id: string; messages?: QueryMessage[]; }
  export default class ClaudeSDK {
    constructor(config: SDKConfig);
    query(options: QueryOptions, onMessage?: (message: QueryMessage) => void): Promise<QueryResult>;
    abort(): void;
  }
}
```

**問題点**:

- `query` が名前付きエクスポートではなく、`ClaudeSDK` クラスのメソッドとして定義されている
- 実際のSDKでは `query` は名前付きエクスポート関数: `import { query } from "@anthropic-ai/claude-agent-sdk"`
- `query()` のシグネチャが実際の使用パターンと一致しない

#### 1.3.2 node_modules内のSDK

`@anthropic-ai/claude-agent-sdk` パッケージは node_modules に **存在しない**。SDKはインストールされておらず、カスタム型宣言のみで型解決している。

#### 1.3.3 テスト用モック

**ファイル**: `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts`

モックは `ClaudeSDK` クラスベースで、型宣言ファイルと整合している。ただし実際のコードは `query` 名前付きエクスポートを使用しており、テスト内でも `query` のモックが定義されている。

### 1.4 他コンポーネントのSDK使用パターン

#### AgentExecutor.ts（型安全なパターン）

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
// ...
const conversation = query({
  prompt: this.request.prompt,
  options: { tools: [...], signal: ..., hooks, permissions },
});
const stream = conversation.stream();
```

**注意**: AgentExecutor.ts は `tsconfig.json` の `exclude` に含まれており、型チェック対象外。
2箇所の `@ts-expect-error` コメントが存在する。

#### agent-client.ts（packages/shared）

```typescript
import ClaudeSDK from "@anthropic-ai/claude-agent-sdk";
// ...
this.sdk = new ClaudeSDK({ apiKey: ... }) as SDKInstance;
```

クラスベースのインポート。カスタム型宣言と整合。

### 1.5 SDKの実際のAPIシグネチャ

SDKスキル資料（`.claude/skills/claude-agent-sdk/references/query-api.md`）より:

```typescript
import {
  query,
  type SDKMessage,
  type Options,
} from "@anthropic-ai/claude-agent-sdk";

function query({
  prompt,
  options,
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;

// Query extends AsyncGenerator<SDKMessage, void>
// conversation.stream() でストリーミング取得
```

**Options の主要プロパティ**:

- `tools`: `string[]` | プリセット | カスタムツール定義
- `permissionMode`: `"auto" | "ask" | "deny" | "default"`
- `signal`: AbortSignal（推定）
- `apiKey`: `string`（認証キー直接指定）
- `hooks`: Hooks オブジェクト
- `permissions`: Permission オブジェクト

### 1.6 既存テストのモック構造

全6テストファイルで `vi.mock("@anthropic-ai/claude-agent-sdk", ...)` を使用:

| テストファイル                    | モック形式                                     |
| --------------------------------- | ---------------------------------------------- |
| SkillExecutor.test.ts             | `query: (args) => mockQuery(args)`             |
| SkillExecutor.auth.test.ts        | `query: (args) => mockQuery(args)`             |
| SkillExecutor.retry.test.ts       | `query: (args) => mockQuery(args)`             |
| SkillExecutor.integration.test.ts | `query: vi.fn(() => createMockSDKStream(...))` |
| SkillExecutor.permission.test.ts  | `query: vi.fn(() => ...)`                      |
| SkillService.delegate.test.ts     | `query: vi.fn(() => ...)`                      |

全テストが `{ query: ... }` パターンでモック化 -- 名前付きエクスポート前提。

---

## 2. 要件

### 2.1 機能要件

| ID     | 要件                        | 説明                                                                      |
| ------ | --------------------------- | ------------------------------------------------------------------------- |
| FR-001 | `as any` 除去               | SkillExecutor.ts L760 の `as any` キャストを除去する                      |
| FR-002 | 動的importの型安全化        | `await import("@anthropic-ai/claude-agent-sdk")` が型情報を保持する       |
| FR-003 | query()呼び出しの型チェック | `query()` の引数（prompt, options）と戻り値が型チェックされる             |
| FR-004 | eslint-disable除去          | `@typescript-eslint/no-explicit-any` の eslint-disable コメントを除去する |
| FR-005 | ローカルSDK型定義の整合性   | SDKQueryOptions, SDKMessage がSDKの実APIと整合する                        |

### 2.2 非機能要件

| ID      | 要件                | 説明                                                                                |
| ------- | ------------------- | ----------------------------------------------------------------------------------- |
| NFR-001 | 既存テスト互換性    | 全6ファイルのSkillExecutor関連テストがそのままPASSする                              |
| NFR-002 | AgentExecutor無影響 | AgentExecutor.ts のコード・動作に影響を与えない                                     |
| NFR-003 | agent-client無影響  | packages/shared/src/agent/agent-client.ts に影響を与えない                          |
| NFR-004 | tsconfig変更不要    | tsconfig.json の設定変更は不要とする                                                |
| NFR-005 | ランタイム動作維持  | 既存の実行フロー（SDK query呼び出し、ストリーミング処理）のランタイム動作に変更なし |

### 2.3 スコープ制約

#### 含むもの

- `SkillExecutor.ts` の `callSDKQuery` メソッド内の `as any` 除去
- 必要に応じた型宣言ファイル（`@anthropic-ai-claude-agent-sdk.d.ts`）の更新
- SkillExecutor内ローカル型定義の調整

#### 含まないもの

- AgentExecutor.ts の `@ts-expect-error` 除去（別スコープ）
- agent-client.ts の ClaudeSDK クラスインポートパターン変更
- SDK自体のインストールやバージョンアップ
- SkillExecutor のビジネスロジック変更
- `@repo/shared` の QueryOptions, ClaudeSDK 型の変更
- 他ファイル（PromptOptimizer.ts, SkillImprover.ts, SkillAnalyzer.ts）の `require()` パターン変更

---

## 3. 調査結果サマリ

### 3.1 型定義不整合マトリクス

| 観点                   | 型宣言ファイル (.d.ts)    | SkillExecutor ローカル型          | テストモック            | SDK実API                                 |
| ---------------------- | ------------------------- | --------------------------------- | ----------------------- | ---------------------------------------- |
| query エクスポート形態 | ClaudeSDKクラスメソッド   | N/A（dynamic import）             | 名前付きエクスポート    | 名前付きエクスポート                     |
| query 引数             | `(options: QueryOptions)` | `(prompt, options)` 分離引数      | `(args: unknown)`       | `({ prompt, options })` オブジェクト引数 |
| query 戻り値           | `Promise<QueryResult>`    | `{ stream: () => AsyncIterable }` | `{ stream: () => ... }` | `Query (AsyncGenerator)`                 |
| Options.tools          | なし                      | `string[]`                        | N/A                     | `string[]` 他                            |
| Options.signal         | なし                      | `AbortSignal`                     | N/A                     | AbortSignal（推定）                      |
| Options.apiKey         | なし（SDKConfig内）       | なし                              | N/A                     | `string`                                 |
| SDKMessage             | 固定フィールド型          | 緩い型（optional）                | 任意                    | Union型                                  |

### 3.2 解決すべき不整合

1. **型宣言ファイルに `query` 名前付きエクスポートが存在しない** -- 追加が必要
2. **query の引数形式が実APIと不一致** -- `{ prompt, options }` オブジェクト形式に合わせる
3. **query の戻り値に `stream()` メソッドが型定義されていない** -- 追加が必要
4. **Options 型に tools, signal, apiKey 等が未定義** -- 追加が必要

---

## 4. リスク分析

| リスク                                     | 影響度 | 発生確率 | 対策                                                                                              |
| ------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| 型宣言変更がagent-client.tsに影響          | 高     | 中       | ClaudeSDK default export はそのまま残す。query 名前付きエクスポートを追加する                     |
| テストモックとの不整合                     | 中     | 低       | テストは `vi.mock` で完全にモック化されており、型宣言変更の影響を受けにくい                       |
| SkillExecutor ローカル型と型宣言の二重管理 | 低     | 低       | ローカル型はSkillExecutor内部の変換用として維持する（SDKメッセージ→内部メッセージの変換レイヤー） |
