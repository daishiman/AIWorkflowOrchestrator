# RuntimePolicyResolver Capability Bridge 実装ガイド

- タスク: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
- 作成日: 2026-03-21
- 対象ファイル:
  - `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `apps/desktop/src/main/ipc/creatorHandlers.ts`
  - `packages/shared/src/types/execution-capability.ts`

---

## Part 1: なぜ必要か（中学生レベルの説明）

### 信号機モデルで理解する「4状態 capability bridge」

交差点の信号機を思い浮かべてください。

**旧モデル（2状態）**では信号の色は2種類しかありませんでした。

- 「青信号」= `integrated_api`（APIキーがある → AI が直接実行する）
- 「赤信号」= `terminal_handoff`（APIキーがない → ターミナルに委ねる）

この2択で動かしていたのですが、現実には「**APIキーはあるけれど接続が不安定**」とか「**サブスクリプション認証もAPIキーも両方ある**」という状況が起きます。2色の信号機ではこれらを表現できません。

**新モデル（4状態）**は信号機を4色に増やしました。たとえば、通学路で「歩ける」「待つ」「状況しだい」「通行止め」を区別するように、AI 実行でも細かい状態を分けないと安全に判断できません。

### この機能でできること

この機能でできることは、「今は直接実行できるのか」「いったんターミナルへ渡すべきか」「そもそも止めるべきか」を、その場しのぎではなく同じ基準で決めることです。

| 信号の色   | capability 値       | 意味                                              |
| ---------- | ------------------- | ------------------------------------------------- |
| 青         | `integratedRuntime` | APIキーが有効 → AI が直接実行できる               |
| 黄         | `terminalSurface`   | サブスクリプション認証のみ → ターミナル経由で実行 |
| 青＋黄同時 | `both`              | APIキーとサブスクリプションの両方が有効           |
| 赤         | `none`              | どちらの認証情報もない → 実行不可                 |

### `assertNoSilentFallback` は「赤信号で発進しようとしたら緊急停止する装置」

「赤信号（`none`）」なのに、うっかりAI実行（`integratedRuntime`）に進んでしまうことがあります。これを **P62 パターン（DEFAULT_CONFIG への暗黙 fallback）** と呼びます。

`assertNoSilentFallback()` はこの暗黙遷移を阻止する緊急停止装置です。`none` の状態で実行しようとすると、即座に例外を投げて止めます。これにより「なんとなく動いているように見えるが、意図しないモデルで課金されている」という事態を防ぎます。

### capability bridge とは「名簿の一本化」

以前は「自分のクラスの出席名簿（`authMode` 二択）」と「学校全体の公式名簿（`AccessCapability` 4状態）」が別々に存在し、内容が合っていませんでした。

この bridge は、各クラスの判断を「`packages/shared` の公式名簿」に合わせる作業です。`resolveCapability()` という関数が唯一の authority（権威ある名簿）となり、アプリ全体でブレのない判断ができるようになります。

---

## Part 2: 開発者向け実装詳細

### TypeScript 型定義（`packages/shared/src/types/execution-capability.ts`）

```typescript
// アクセス能力 4 状態
export type AccessCapability =
  | "integratedRuntime" // APIキーが有効
  | "terminalSurface" // サブスクリプション認証のみ有効
  | "both" // 両方が有効
  | "none"; // 認証情報なし

// capability 判定の入力
export interface ExecutionCapabilityInput {
  apiKeyValid: boolean;
  subscriptionValid: boolean;
  apiKeyDegraded?: boolean; // true: APIキーはあるが接続が degraded
}

// ガード関数: "none" からの暗黙遷移を禁止（P62 対策）
export function assertNoSilentFallback(capability: AccessCapability): void;
```

### RuntimeDecision 型（`RuntimePolicyResolver.ts`）

```typescript
export type RuntimeDecision =
  | { capability: "integratedRuntime" }
  | { capability: "terminalSurface"; bundle: TerminalHandoffBundle }
  | { capability: "both" }
  | { capability: "none" };
```

注意: `RuntimeDecision` は `packages/shared` の `AccessCapability` とは別の型です。`RuntimePolicyResolver` が bundle などの付随データを付与した「実行用の決定型」です。

### API シグネチャ

```typescript
class RuntimePolicyResolver implements IRuntimePolicyResolver {
  // 同期版: ExecutionCapabilityInput を直接渡す
  resolve(input: ExecutionCapabilityInput): RuntimeDecision;

  // 非同期版: authKeyService から入力を自動構築する
  resolveFromServices(options?: { silent?: boolean }): Promise<RuntimeDecision>;
}
```

`silent: true` オプションは UI 表示目的（状態観測）のみに使用します。実際の実行パスでは使用しないでください。

### resolveCapability の判定ルール

```
apiKeyValid=true,  subscriptionValid=false → "integratedRuntime"
apiKeyValid=false, subscriptionValid=true  → "terminalSurface"
apiKeyValid=true,  subscriptionValid=true  → "both"
apiKeyValid=false, subscriptionValid=false → "none"
apiKeyDegraded=true + subscriptionValid=true  → "terminalSurface"（integratedRuntime を除外）
apiKeyDegraded=true + subscriptionValid=false → "none"
```

### direct caller（`RuntimeSkillCreatorFacade.ts`）での使用例

```typescript
const decision = this.resolver.resolve(input); // assertNoSilentFallback が内部で呼ばれる

switch (decision.capability) {
  case "integratedRuntime":
  case "both":
    // AI が直接実行する経路
    return { planId: `plan-${Date.now()}`, skillSpec, estimatedSteps: 3 };

  case "terminalSurface":
    // ターミナル委譲経路
    const bundle = this.handoffBuilder.build(skillSpec, process.cwd());
    return { type: "terminal_handoff", bundle };

  case "none":
    // assertNoSilentFallback で到達しないはずだが、型安全のために記述
    throw new Error(
      "Unreachable: capability 'none' は assertNoSilentFallback で阻止される",
    );
}
```

### IPC boundary での正規化（`creatorHandlers.ts`）

IPC 境界では `authMode` や `apiKey` などの生の値を `ExecutionCapabilityInput` に正規化します。`authMode` という旧語彙はこの境界より内側には持ち込みません。

```typescript
function buildCapabilityInput(args: {
  authMode?: string;
  apiKey?: string | null;
  apiKeyDegraded?: boolean;
}): ExecutionCapabilityInput {
  return {
    apiKeyValid: typeof args.apiKey === "string" && args.apiKey.trim() !== "",
    subscriptionValid: args.authMode === "subscription",
    apiKeyDegraded: args.apiKeyDegraded ?? false,
  };
}
```

P42 準拠の3段バリデーション（型チェック → 空文字列 → `.trim()` 空文字列）をすべての文字列引数に適用しています。

### エッジケース

| ケース                           | 入力                                                                 | 期待結果                                         |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| degraded API キーのみ            | `apiKeyValid=true`, `subscriptionValid=false`, `apiKeyDegraded=true` | `none` と fail-fast                              |
| degraded API キー + subscription | `apiKeyValid=true`, `subscriptionValid=true`, `apiKeyDegraded=true`  | `terminalSurface` に降格                         |
| `terminalSurface` execute        | `RuntimeSkillCreatorFacade.execute()`                                | `SkillExecutor` を呼ばず handoff bundle を返す   |
| `both` execute                   | `RuntimeSkillCreatorFacade.execute()`                                | integrated 経路を優先して `SkillExecutor` に委譲 |
| `resolveFromServices()`          | API キーなし・subscription service 未統合                            | `silent: true` 以外では `none` で fail-fast      |

### エラーハンドリング

| 状況                                                             | 動作                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `capability === "none"` かつ `assertNoSilentFallback` が呼ばれた | `Error` を throw して実行を即停止                                         |
| `resolveFromServices({ silent: true })` で `none`                | 例外なし、`{ capability: "none" }` を返す（UI 表示用）                    |
| IPC ハンドラでバリデーションエラー                               | `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }` |
| IPC ハンドラで実行エラー                                         | `{ success: false, error: { code: "EXECUTION_FAILED", message: "..." } }` |

### 設定項目と定数

| 種別                 | 名前                           | 用途                                      |
| -------------------- | ------------------------------ | ----------------------------------------- |
| shared type          | `AccessCapability`             | 4状態の authority                         |
| shared type          | `ExecutionCapabilityInput`     | resolver / facade / IPC の共通入力        |
| shared guard         | `assertNoSilentFallback()`     | `none` からの暗黙遷移を阻止               |
| internal IPC const   | `CREATOR_CHANNELS`             | `creator:*` internal adapter channel 定義 |
| public preload const | `IPC_CHANNELS.SKILL_CREATOR_*` | 既存 public `skill-creator:*` surface     |

### 設定とエントリポイント

| 役割                                | ファイルパス                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| authority module（型定義 + 純関数） | `packages/shared/src/types/execution-capability.ts`                                  |
| capability bridge（runtime 判断）   | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                    |
| direct caller（3 role）             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                |
| IPC 境界（boundary 正規化）         | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                       |
| テスト（resolver）                  | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`     |
| テスト（facade）                    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` |
| テスト（IPC adapter）               | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                        |

### packages/shared への exports 追加

`tsup.config.ts` に `src/types/execution-capability.ts` を entry として追加し、`package.json` の `exports` フィールドに `"./types/execution-capability"` を追加することで、`@repo/shared/types/execution-capability` からのインポートが可能になっています。

### 現在の境界条件

- `creatorHandlers.ts` は internal adapter として実装済みだが、app registration / preload の public surface は依然 `registerSkillCreatorHandlers` / `skill-creator:*` が正本である
- そのため、本タスクは direct caller lane の capability bridge までを完了範囲とし、public IPC / preload 統合は follow-up `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` で扱う
- `resolveFromServices()` の `subscriptionValid` は現状 `false` 固定であり、subscription service 統合は `UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001` を参照する
