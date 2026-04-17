# Implementation Guide: LLM Provider Integration

## Part 1

### なぜ必要か

AI が文章を作るときに、うその例文を返し続けると、ユーザーは本当に動いているのか判断できません。今回の機能は、その「ふり」をなくして、本物の LLM につなぐためにあります。

### 何をするか

- `ipc/index.ts` は `LLMDocQueryAdapter` を登録するだけの薄い配線にします。
- `LLMDocQueryAdapter` は `authKeyService.getKey()` でキーを受け取り、`LLMClient` に委譲します。
- `LLMClient` は `AnthropicProvider` を通して Anthropic API を呼びます。
- `manual-test-result.md` は NON_VISUAL の根拠で、スクリーンショットは不要です。

### 日常の例え

図書館で、受付の人が「この本はここから借ります」と案内するのが `LLMDocQueryAdapter` です。実際に本を棚から持ってくる人が `AnthropicProvider` です。受付の案内が雑だと、借りたい本にたどり着けません。

### 今回作ったもの

- Phase 11 の `outputs/phase-11/manual-test-result.md`
- Phase 12 の `outputs/phase-12/` 一式
- `artifacts.json` と `outputs/artifacts.json` の同期
- Main Process 側の実装確認用テスト

## Part 2

### 型定義

```ts
type DocErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";

type LLMQueryResult =
  | { success: true; content: string }
  | {
      success: false;
      errorCode: DocErrorCode;
      message: string;
      retryable: boolean;
    };
```

### APIシグネチャ

```ts
interface ILLMClient {
  query(prompt: string): Promise<LLMQueryResult>;
}

interface ILLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}
```

### 使用例

```ts
const adapter = new LLMDocQueryAdapter(
  () => authKeyService.getKey(),
  "anthropic",
);

const queryFn = async (prompt: string) => {
  const result = await adapter.query(prompt);
  if (result.success && result.data !== undefined) {
    return { content: result.data };
  }
  throw new Error(result.error?.message ?? "LLM query failed");
};
```

### エラーハンドリング

- `API_KEY_MISSING` は retry しない。
- `API_KEY_INVALID` は retry しない。
- `RATE_LIMIT` / `SERVER_ERROR` / `TIMEOUT` / `NETWORK_ERROR` は retryable とする。
- 予期しない失敗は `INTERNAL_ERROR` に寄せる。
- `sanitizeErrorMessage()` でキーやスタックトレースの露出を避ける。

### エッジケース

- `prompt` が空なら validation error にする。
- `LLMDocQueryAdapter` の stub が残っている場合は `Generated content for:` で検出できる。
- APIキーが空文字でも未設定扱いにする。
- timeout は `LLMClient` と provider 側で二重化しない。

### 設定項目と定数一覧

| 項目        | 内容                        |
| ----------- | --------------------------- |
| APIキー取得 | `authKeyService.getKey()`   |
| モデル      | `claude-haiku-4-5-20251001` |
| timeout     | `30_000`                    |
| retry       | `maxRetries: 3`             |
| 監視文字列  | `Generated content for:`    |

### テスト構成

- `pnpm --filter @repo/desktop exec tsc --noEmit`
- `pnpm --filter @repo/desktop exec vitest run src/main/services/llm/providers/__tests__/AnthropicProvider.test.ts src/main/services/llm/__tests__/LLMClient.test.ts src/main/services/skill/__tests__/LLMDocQueryAdapter.test.ts src/main/services/skill/__tests__/SkillDocGenerator.queryFn.test.ts src/main/services/skill/__tests__/SkillDocGenerator.test.ts src/main/ipc/__tests__/skillHandlers.docs.test.ts`
- 実機 Anthropic API の手動確認は `ANTHROPIC_API_KEY` 未設定のため BLOCKED

### 参照

- Phase 11: `outputs/phase-11/manual-test-result.md`
- Current wiring: `apps/desktop/src/main/ipc/index.ts`
- Current adapter: `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`
