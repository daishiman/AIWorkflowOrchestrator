# Phase 2: 設計 - Agent SDK 正式統合

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION                           |
| Phase    | 2（設計）                                                  |
| 作成日   | 2026-02-12                                                 |
| 作成者   | Claude Agent (Phase 1-3)                                   |
| 前Phase  | Phase 1 要件定義                                           |
| 参照資料 | Phase 1 requirements-definition.md, acceptance-criteria.md |

---

## 1. 設計方針の決定

### 1.1 型定義更新方針: 方式A「型宣言ファイル拡張」

#### 検討した選択肢

| 方式                  | 概要                                                                        | 採用                                          |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------------------- |
| A: 型宣言ファイル拡張 | `@anthropic-ai-claude-agent-sdk.d.ts` に `query` 名前付きエクスポートを追加 | 採用                                          |
| B: SDK自体の型利用    | SDKをインストールし、SDKパッケージの型定義を直接使用                        | 不採用（SDKが node_modules に存在しないため） |
| C: 別ファイルで型定義 | SkillExecutor 専用の SDK 型定義ファイルを作成                               | 不採用（二重管理になるため）                  |

#### 方式A の採用理由

1. 既存の型宣言ファイルを拡張するだけで最小限の変更
2. `ClaudeSDK` default export を維持し、`agent-client.ts` への影響がゼロ
3. テストモック（`{ query: ... }` パターン）と自然に整合
4. SDKがインストールされた場合に型宣言ファイルを削除するだけで移行可能

### 1.2 動的 import 型付けパターン: パターン2「型アノテーション」

#### 検討した選択肢

| パターン                      | コード例                                                  | 採用                                                       |
| ----------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| 1: 直接（型推論に依存）       | `const sdk = await import("...")`                         | 不採用（型宣言が正しければ動くが、分割代入との相性が悪い） |
| 2: 型アノテーション           | `const { query } = await import("...")` + 型宣言拡張      | 採用                                                       |
| 3: 明示的型キャスト（安全型） | `const sdk = await import("...") as typeof import("...")` | 不採用（冗長）                                             |

#### パターン2 の詳細

型宣言ファイルに `query` 名前付きエクスポートが正しく定義されていれば、以下のコードで型推論が自動的に効く:

```typescript
// 変更後のコード
const { query } = await import("@anthropic-ai/claude-agent-sdk");
// → query の型は型宣言ファイルの export function query の型で推論される
```

`as any` を単純に除去するだけで済む。追加の型アノテーションは不要。

### 1.3 ローカルSDK型定義の処理方針: 維持

#### 決定

`SDKQueryOptions` と `SDKMessage` のローカル型定義は**維持する**。

#### 理由

1. **変換レイヤーとしての役割**: SkillExecutor は SDK の実メッセージを内部の `SkillStreamMessage` に変換する。ローカル型定義はこの変換レイヤーの入力型として機能する
2. **疎結合の維持**: SkillExecutor が SDK の型に直接依存すると、SDK 型変更時に SkillExecutor 内部の全処理に影響が波及する
3. **既存テストとの互換性**: テストは `SDKMessage` ローカル型を前提にメッセージを構築している

ただし、`SDKQueryOptions` の `permissionMode` の値は SDK 実 API に合わせて修正する（後述の型マッピング参照）。

---

## 2. 型宣言ファイル変更設計

### 2.1 変更対象

**ファイル**: `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`

### 2.2 追加する型定義

```typescript
// === 追加: query() 名前付きエクスポート関連 ===

/** query() に渡す Options */
export interface QueryFunctionOptions {
  /** 使用可能ツール */
  tools?: string[];
  /** 権限モード */
  permissionMode?: "auto" | "ask" | "deny" | "default";
  /** AbortSignal */
  signal?: AbortSignal;
  /** API Key（直接指定） */
  apiKey?: string;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** Hooks */
  hooks?: Record<string, unknown>;
  /** Permissions */
  permissions?: Record<string, unknown>;
}

/** query() の引数 */
export interface QueryFunctionArgs {
  prompt: string;
  options?: QueryFunctionOptions;
}

/** query() が返す Conversation オブジェクト */
export interface QueryConversation {
  /** ストリーミングメッセージを取得する */
  stream(): AsyncIterable<unknown>;
}

/** query() 名前付きエクスポート関数 */
export function query(args: QueryFunctionArgs): QueryConversation;
```

### 2.3 既存定義の維持

以下の既存定義は**変更しない**:

- `SDKConfig` interface
- `QueryOptions` interface（クラスメソッド用）
- `QueryMessage` interface
- `QueryResult` interface
- `ClaudeSDK` default export class

### 2.4 完全なファイル構成（変更後）

```typescript
declare module "@anthropic-ai/claude-agent-sdk" {
  // === 既存: ClaudeSDK クラス関連（変更なし） ===
  export interface SDKConfig { ... }
  export interface QueryOptions { ... }
  export interface QueryMessage { ... }
  export interface QueryResult { ... }
  export default class ClaudeSDK { ... }

  // === 追加: query() 関数エクスポート ===
  export interface QueryFunctionOptions { ... }
  export interface QueryFunctionArgs { ... }
  export interface QueryConversation { ... }
  export function query(args: QueryFunctionArgs): QueryConversation;
}
```

---

## 3. SkillExecutor.ts 変更設計

### 3.1 callSDKQuery メソッドの変更

#### 変更前

```typescript
private async callSDKQuery(
  prompt: string,
  options: SDKQueryOptions,
): Promise<{ stream: () => AsyncIterable<SDKMessage> }> {
  const apiKey = await this.getApiKey();

  // Dynamic import for SDK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;

  const conversation = query({
    prompt,
    options: {
      apiKey,
      tools: options.tools,
      permissionMode: options.permissionMode,
      signal: options.signal,
    },
  });

  return {
    stream: () => conversation.stream(),
  };
}
```

#### 変更後

```typescript
private async callSDKQuery(
  prompt: string,
  options: SDKQueryOptions,
): Promise<{ stream: () => AsyncIterable<SDKMessage> }> {
  const apiKey = await this.getApiKey();

  // Dynamic import for SDK（型宣言によりクエリ関数は型安全）
  const { query } = await import("@anthropic-ai/claude-agent-sdk");

  const conversation = query({
    prompt,
    options: {
      apiKey,
      tools: options.tools,
      permissionMode: options.permissionMode,
      signal: options.signal,
    },
  });

  return {
    stream: () => conversation.stream(),
  };
}
```

#### 変更点まとめ

1. `as any` を除去
2. `eslint-disable-next-line` コメントを除去
3. コメント文を更新（「SDK型定義が不完全なため」→「型宣言によりクエリ関数は型安全」）
4. ロジック変更なし

### 3.2 SDKQueryOptions の permissionMode 修正

#### 変更前

```typescript
interface SDKQueryOptions {
  tools?: string[];
  permissionMode?: "default" | "plan" | "bypassPermissions";
  signal?: AbortSignal;
  timeout?: number;
}
```

#### 変更後

```typescript
interface SDKQueryOptions {
  tools?: string[];
  permissionMode?: "auto" | "ask" | "deny" | "default";
  signal?: AbortSignal;
  timeout?: number;
}
```

#### 理由

SDK 実 API の `PermissionMode` は `"auto" | "ask" | "deny" | "default"` であり、現在の `"plan" | "bypassPermissions"` は存在しない値。ただし、callSDKQuery 内で実際に使われているのは `"default"` のみであるため、ランタイムへの影響はない。

### 3.3 変更しない部分

- `SDKMessage` ローカル型定義: 変更なし（内部変換用）
- `isValidSDKMessage` 型ガード: 変更なし
- `convertToStreamMessage` メソッド: 変更なし
- `executeWithRetry` メソッド: 変更なし（callSDKQuery の戻り値型は同一）
- Hooks 関連メソッド: 変更なし

---

## 4. 影響分析

### 4.1 影響を受けるファイル

| ファイル                                                        | 変更内容                         | 影響度 |
| --------------------------------------------------------------- | -------------------------------- | ------ |
| `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` | query 名前付きエクスポート追加   | 中     |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`         | as any 除去、permissionMode 修正 | 低     |

### 4.2 影響を受けないファイル

| ファイル                                                            | 理由                                                                                    |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`             | tsconfig.json で exclude されており、型チェック対象外。型宣言の追加は既存 import と互換 |
| `packages/shared/src/agent/agent-client.ts`                         | ClaudeSDK default export を変更しないため影響なし                                       |
| `packages/shared/src/agent/types.ts`                                | 変更しない                                                                              |
| `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts` | Vitest モックは型宣言とは独立して動作する                                               |
| 全6テストファイル                                                   | vi.mock で完全モック化されており、型宣言変更の影響なし                                  |

### 4.3 agent-client.ts 互換性の詳細検証

`agent-client.ts` は以下の import を使用:

```typescript
import ClaudeSDK from "@anthropic-ai/claude-agent-sdk";
```

型宣言ファイルの `export default class ClaudeSDK` は変更しないため:

- `new ClaudeSDK({ apiKey })` のインスタンス生成に影響なし
- `sdk.query()` メソッド呼び出しに影響なし
- `sdk.abort()` メソッド呼び出しに影響なし

### 4.4 AgentExecutor.ts 互換性の詳細検証

`AgentExecutor.ts` は以下の import を使用:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
```

型宣言ファイルに `export function query` が追加されることで:

- import が正しく型解決される（改善）
- ただし AgentExecutor.ts は tsconfig.json の exclude に含まれているため型チェック対象外
- AgentExecutor.ts のコードには一切触れない

---

## 5. テスト戦略

### 5.1 既存テストの互換性

全テストファイルは `vi.mock("@anthropic-ai/claude-agent-sdk", ...)` でモジュール全体をモック化しているため、型宣言ファイルの変更はテスト実行に影響しない。

### 5.2 型安全性の検証

Phase 4（テスト作成）で以下を実施:

1. `pnpm typecheck` で SkillExecutor.ts のコンパイル成功を確認
2. 意図的に型エラーを発生させ、検出されることを確認（手動検証）

### 5.3 リグレッション検証

```bash
# SkillExecutor 関連テスト全実行
pnpm --filter @repo/desktop vitest run src/main/services/skill/__tests__/SkillExecutor

# SkillService 委譲テスト
pnpm --filter @repo/desktop vitest run src/main/services/skill/__tests__/SkillService.delegate
```

---

## 6. 実装順序

| Step | 作業内容                                  | ファイル                              | 影響                               |
| ---- | ----------------------------------------- | ------------------------------------- | ---------------------------------- |
| 1    | 型宣言ファイルに query エクスポートを追加 | `@anthropic-ai-claude-agent-sdk.d.ts` | 他ファイルへの影響なし（追加のみ） |
| 2    | SkillExecutor.ts の `as any` 除去         | `SkillExecutor.ts`                    | ロジック変更なし                   |
| 3    | SDKQueryOptions の permissionMode 修正    | `SkillExecutor.ts`                    | ランタイム影響なし                 |
| 4    | eslint-disable コメント除去               | `SkillExecutor.ts`                    | コメントのみ                       |
| 5    | typecheck 実行                            | -                                     | 検証                               |
| 6    | テスト実行                                | -                                     | 検証                               |
