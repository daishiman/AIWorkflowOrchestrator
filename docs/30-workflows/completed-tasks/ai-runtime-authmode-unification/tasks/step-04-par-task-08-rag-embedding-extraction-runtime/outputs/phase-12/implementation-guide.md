# 実装ガイド: RAG / AI_INDEX / Embedding / Extraction runtime ルール

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase    | 12                                               |
| 作成日   | 2026-03-19                                       |
| 対象機能 | rag-embedding-extraction-runtime                 |

## Part 1: 初学者向け

### なぜこの仕組みが必要か

この機能は、「使えない機能を無理に動かそうとして壊す」のを防ぐためにある。
AI まわりの機能は、API キーが無い、配線がまだ未完成、検索の一部だけが先に実装されている、
のような途中状態が起きやすい。そういう時に無言で失敗すると、どこが悪いのか分からなくなる。

### たとえば何に似ているか

たとえば駅の案内板に似ている。ホーム工事中なら、電車が来ないのに黙って待たせるのではなく、
「このホームは使えません。別のホームへ行ってください」と出す方が親切だ。
この task では、AI 機能でも同じ考え方をとり、「まだ使えない機能」は guidance メッセージで返す。

### この機能でできること

| 項目                   | 説明                                           | 例                                                                 |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| 使える機能を見分ける   | 実装済みか未実装かを runtime で区別する        | GraphRAGQueryService は利用可、HybridRAGFactory full/lite は未配線 |
| 使えない機能を案内する | エラーを隠さず guidance を返す                 | `AI_INDEX は現在利用できません`                                    |
| 途中失敗を観測できる   | silent fallback を warn や metadata に昇格する | community search failure 時に `fallbackReason` を残す              |

### 何が変わったか

- `AI_CHECK_CONNECTION` は削除ではなく legacy 互換で残し、`status: "disconnected"` を返す
- `AI_INDEX` は long-running job 実装ではなく、zero-count guidance を返す stub として固定した
- community IPC はすべて `NOT_IN_SCOPE` guidance-only へそろえた
- GraphRAG / HybridRAG / CommunitySummarizer の fallback ルールを仕様書へ明示した

## Part 2: 開発者向け技術詳細

### 変更ファイル一覧

| ファイル                                                          | 変更内容                                                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                         | `AI_CHECK_CONNECTION` / `AI_INDEX` を legacy guidance stub に整理し、`unregisterAIHandlers()` を追加    |
| `apps/desktop/src/main/ipc/communityHandlers.ts`                  | 全 community チャンネルを `NOT_IN_SCOPE` guidance-only へ統一し、`unregisterCommunityHandlers()` を追加 |
| `apps/desktop/src/main/ipc/aiHandlers.test.ts`                    | `status: "disconnected"` と zero-count guidance へ期待値を更新                                          |
| `packages/shared/src/services/search/hybrid-rag-factory.ts`       | `createFull()` / `createLite()` で `[FACTORY_NOT_READY]` を含む Error throw                             |
| `packages/shared/src/services/search/graphrag-query-service.ts`   | community search failure 時に `fallbackReason` を metadata へ残す                                       |
| `packages/shared/src/services/graph/community-summarizer.ts`      | embed failure を warn 化し、summary save は継続                                                         |
| `packages/shared/src/services/search/crag/relevance-evaluator.ts` | JSON parse fallback を warn で可観測化                                                                  |

### TypeScript 型定義

```typescript
export interface AICheckConnectionResponse {
  success: boolean;
  data?: {
    status: "connected" | "disconnected" | "error";
    indexedDocuments: number;
    lastSyncTime?: Date;
  };
  error?: string;
}

export interface AIIndexRequest {
  folderPath: string;
  recursive?: boolean;
}

export interface AIIndexResponse {
  success: boolean;
  data?: {
    indexedCount: number;
    skippedCount: number;
    errors: string[];
  };
  error?: string;
}

export interface CommunityResult<T> {
  ok: boolean;
  value?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

### APIシグネチャ

```typescript
export function registerAIHandlers(): void;
export function unregisterAIHandlers(): void;
export function registerCommunityHandlers(): void;
export function unregisterCommunityHandlers(): void;

ipcMain.handle(
  IPC_CHANNELS.AI_CHECK_CONNECTION,
  async (): Promise<AICheckConnectionResponse> => {
    return {
      success: true,
      data: {
        status: "disconnected",
        indexedDocuments: 0,
      },
    };
  },
);

ipcMain.handle(
  IPC_CHANNELS.AI_INDEX,
  async (_event, _request: AIIndexRequest): Promise<AIIndexResponse> => {
    return {
      success: true,
      data: {
        indexedCount: 0,
        skippedCount: 0,
        errors: [
          "AI_INDEX は現在利用できません。RAG インデックス機能は今後のリリースで対応予定です。",
        ],
      },
    };
  },
);
```

### 使用例

使用例 1: legacy AI connection surface を読む

```ts
const result = await window.electronAPI.ai.checkConnection();
if (result.success && result.data?.status === "disconnected") {
  console.info("legacy health surface is guidance-only");
}
```

使用例 2: HybridRAGFactory の current behavior を確認する

```ts
try {
  HybridRAGFactory.createFull(config);
} catch (error) {
  if (String(error).includes("FACTORY_NOT_READY")) {
    console.warn("production wiring is not available yet");
  }
}
```

### エラーハンドリング

| 対象                              | 現在の挙動                               | 目的                                    |
| --------------------------------- | ---------------------------------------- | --------------------------------------- |
| `AI_CHECK_CONNECTION`             | fail-fast ではなく `disconnected` を返す | legacy surface を残しつつ UI を壊さない |
| `AI_INDEX`                        | zero-count + `errors: string[]` guidance | long-running job 未配線を明示する       |
| community IPC                     | `ok: false` + `NOT_IN_SCOPE`             | 未対応領域を silent fail にしない       |
| GraphRAG community search         | warn + empty results + `fallbackReason`  | silent fallback を metadata 化する      |
| CommunitySummarizer embed failure | warn のみ、summary save 継続             | partial failure でも要約本体は保存する  |

### エッジケース

| ケース                                     | 現在の扱い                                               |
| ------------------------------------------ | -------------------------------------------------------- |
| `AI_CHECK_CONNECTION` 呼び出し             | `lastSyncTime` は省略可。`indexedDocuments=0` で返す     |
| `AI_INDEX` 呼び出し時に `recursive` 未指定 | request 型は optional だが handler は current では未使用 |
| `enableCommunitySummary=false`             | GraphRAG は search 自体を実行せず `summaries=[]` で継続  |
| community search failure                   | `fallbackOccurred=true`, `fallbackReason=error.message`  |
| summary embedding failure                  | `embedding` なしで `updateSummary()` まで進む            |

### 設定項目と定数一覧

| 項目 / 定数                                   | 値 / 既定                  | 参照                        |
| --------------------------------------------- | -------------------------- | --------------------------- |
| `GraphRAGQueryOptions.limit`                  | 既定 10, 1-20              | `graphrag-query-service.ts` |
| `GraphRAGQueryOptions.confidenceThreshold`    | 既定 0.5                   | `graphrag-query-service.ts` |
| `GraphRAGQueryOptions.enableCommunitySummary` | 既定 true                  | `graphrag-query-service.ts` |
| `CRAG_DEFAULTS.MAX_EVALUATE`                  | relevance evaluator 既定値 | `relevance-evaluator.ts`    |
| `DEFAULT_OPTIONS.generateEmbedding`           | true                       | `community-summarizer.ts`   |
| `DEFAULT_OPTIONS.maxConcurrency`              | 5                          | `community-summarizer.ts`   |

### runtime 状態サマリー

| 領域   | surface                                  | current status                                 |
| ------ | ---------------------------------------- | ---------------------------------------------- |
| IPC    | `AI_CHECK_CONNECTION`                    | legacy guidance, returns `disconnected`        |
| IPC    | `AI_INDEX`                               | legacy guidance, returns zero-count stub       |
| IPC    | `COMMUNITY_*`                            | `NOT_IN_SCOPE` guidance-only                   |
| Search | `GraphRAGQueryService`                   | implemented, `fallbackReason` あり             |
| Search | `HybridRAGFactory.createFull/createLite` | not-ready, `[FACTORY_NOT_READY]` Error         |
| Graph  | `CommunitySummarizer`                    | implemented, embed failure は warn + save 継続 |

### 未解決事項

| ID            | 内容                                | 状態      |
| ------------- | ----------------------------------- | --------- |
| UT-RAG-08-001 | community response unification      | follow-up |
| UT-RAG-08-002 | HybridRAGFactory wiring             | follow-up |
| UT-RAG-08-003 | embedding spec sync                 | follow-up |
| UT-RAG-08-009 | contract-matrix postconditions fix  | follow-up |
| UT-RAG-08-013 | RelevanceEvaluator SF-07 strict fix | follow-up |
