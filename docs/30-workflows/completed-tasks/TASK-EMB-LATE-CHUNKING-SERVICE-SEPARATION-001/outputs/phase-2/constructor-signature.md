# Constructor Signature - Phase 2

## `LateChunkingService` コンストラクタ

```typescript
import type { ITokenizer, IEmbeddingClient } from "../../chunking/interfaces";
import type { Chunk, LateChunkingOptions } from "../../chunking/types";
import { ChunkingError } from "../../chunking/errors";

export class LateChunkingService {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly embeddingClient: IEmbeddingClient,
  ) {}

  // ─── public メソッド ──────────────────────────────────

  async applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]> {
    // 既存 ChunkingService.applyLateChunking のロジックをコピー移動
  }

  determineChunkBoundaries(chunks: Chunk[]): number[] {
    // 既存 ChunkingService.determineChunkBoundaries のロジックをコピー移動
  }

  poolTokenEmbeddings(
    tokenEmbeddings: number[][],
    boundaries: number[],
    strategy: "mean" | "cls" | "attention",
  ): number[][] {
    // 既存 ChunkingService.poolTokenEmbeddings のロジックをコピー移動
  }

  // ─── private メソッド ─────────────────────────────────

  private async getTokenEmbeddings(
    tokens: number[],
    maxSequenceLength: number,
  ): Promise<number[][]> {
    // 既存 ChunkingService.getTokenEmbeddings のロジックをコピー移動
  }
}
```

### DI 契約

- `tokenizer`: 必須。`encode` / `decode` / `countTokens` を使用
- `embeddingClient`: **必須**（`ChunkingService` での `embeddingClient?` 扱いとは異なる）
  - 理由: Late Chunking は埋め込み生成が前提。embeddingClient 未設定で `LateChunkingService` を構築する状況は存在しない
  - `ChunkingService` 側で「`embeddingClient` 未設定なら `LateChunkingService` を生成しない」ことで責務分離

## `ChunkingService` コンストラクタ（拡張版）

```typescript
import { LateChunkingService } from "../embedding/late-chunking";

export class ChunkingService {
  private strategies: Map<ChunkingStrategy, IChunkingStrategy>;
  private tokenizer: ITokenizer;
  private embeddingClient?: IEmbeddingClient;
  private llmClient?: ILLMClient;
  private lateChunkingService?: LateChunkingService;

  constructor(
    tokenizer: ITokenizer,
    embeddingClient?: IEmbeddingClient,
    llmClient?: ILLMClient,
    lateChunkingService?: LateChunkingService,
  ) {
    this.tokenizer = tokenizer;
    this.embeddingClient = embeddingClient;
    this.llmClient = llmClient;
    this.lateChunkingService =
      lateChunkingService ??
      (embeddingClient
        ? new LateChunkingService(tokenizer, embeddingClient)
        : undefined);
    this.strategies = new Map();
    this.registerStrategies();
  }
}
```

### 既定挙動

| 呼び出しパターン                                   | `lateChunkingService` の値                        |
| -------------------------------------------------- | ------------------------------------------------- |
| `new ChunkingService(tok)`                         | `undefined`                                       |
| `new ChunkingService(tok, emb)`                    | `new LateChunkingService(tok, emb)`（自動生成）   |
| `new ChunkingService(tok, emb, llm)`               | `new LateChunkingService(tok, emb)`（自動生成）   |
| `new ChunkingService(tok, emb, llm, custom)`       | `custom`（DI 注入）                               |
| `new ChunkingService(tok, undefined, llm, custom)` | `custom`（DI 注入・embeddingClient なしでも許可） |

### 後方互換性

| 既存呼び出し                                     | 影響                   |
| ------------------------------------------------ | ---------------------- |
| `new ChunkingService(tokenizer)`                 | なし                   |
| `new ChunkingService(tokenizer, embClient)`      | なし（内部で自動生成） |
| `new ChunkingService(tokenizer, embClient, llm)` | なし（内部で自動生成） |

## 採否判定再掲

| 案           | 方法                                     | 採否   | 理由                                                                          |
| ------------ | ---------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| オプション A | コンストラクタ第 4 引数で受け取る        | 採用   | テスト時に `vi.fn()` でモック注入可能。既存 3 引数呼び出しを破壊しない        |
| オプション B | `embeddingClient` 設定時に内部で自動生成 | 不採用 | 委譲確認テスト（SEP-08/SEP-09）で `applyLateChunking` を spy 不可・観測性不足 |

注: オプション A 採用後も、`lateChunkingService` 未指定時は内部で自動生成する（ユーザー利便性）。テスト時には明示注入で override する。
