# 統合設計書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 2（設計）            |

---

## 1. ILLMProvider統合

### 1.1 インターフェース参照

```typescript
// 既存のILLMProviderインターフェース
interface ILLMProvider {
  generate(
    prompt: string,
    options?: LLMGenerationOptions,
  ): Promise<Result<LLMResponse, Error>>;
}

interface LLMGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

interface LLMResponse {
  text: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}
```

### 1.2 呼び出し契約

| 項目           | 値/仕様                                 |
| -------------- | --------------------------------------- |
| メソッド       | `generate(prompt, options)`             |
| temperature    | 0.3（一貫性確保）                       |
| maxTokens      | `maxSummaryTokens * 2`（デフォルト400） |
| responseFormat | `"json"`（構造化レスポンス強制）        |
| 戻り値         | `Result<LLMResponse, Error>`            |

### 1.3 使用パターン

```typescript
// CommunitySummarizer内での使用
const llmResponse = await this.llmProvider.generate(prompt, {
  maxTokens: (options.maxSummaryTokens ?? 200) * 2,
  temperature: 0.3,
  responseFormat: "json",
});

if (!llmResponse.ok) {
  return err(llmResponse.error);
}

// レスポンステキストからJSONを抽出
const parsed = this.parseResponse(llmResponse.value.text);
```

### 1.4 エラーハンドリング

| エラー条件         | 対応                             |
| ------------------ | -------------------------------- |
| LLM呼び出し失敗    | `Result.err(llmResponse.error)`  |
| レスポンス形式不正 | `parseResponse()`でエラー処理    |
| タイムアウト       | プロバイダー側でタイムアウト処理 |

---

## 2. IEmbeddingProvider統合

### 2.1 インターフェース参照

```typescript
// 既存のIEmbeddingProviderインターフェース
interface IEmbeddingProvider {
  embedSingle(text: string): Promise<Result<number[], Error>>;
  embedBatch(texts: string[]): Promise<Result<number[][], Error>>;
  getDimensions(): number;
}
```

### 2.2 呼び出し契約

| 項目     | 値/仕様                             |
| -------- | ----------------------------------- |
| メソッド | `embedSingle(text)`                 |
| 入力     | 要約テキスト or 検索クエリ          |
| 戻り値   | `Result<number[], Error>`           |
| 次元数   | `getDimensions()` で取得（通常384） |

### 2.3 使用パターン

#### 要約埋め込み生成

```typescript
// 要約生成後の埋め込み生成
let embedding: number[] | undefined;
if (options.generateEmbedding) {
  const embeddingResult = await this.embeddingProvider.embedSingle(
    parsedData.summary,
  );
  if (embeddingResult.ok) {
    embedding = embeddingResult.value;
  }
  // 埋め込み失敗時は embedding=undefined で続行（致命的エラーとしない）
}
```

#### 検索クエリ埋め込み生成

```typescript
// searchSummaries()でのクエリ埋め込み
const queryEmbedding = await this.embeddingProvider.embedSingle(query);
if (!queryEmbedding.ok) {
  return err(queryEmbedding.error);
}
// ベクトル類似検索に使用
```

### 2.4 エラーハンドリング

| エラー条件             | 対応                                  |
| ---------------------- | ------------------------------------- |
| 要約埋め込み生成失敗   | 警告ログ、`embedding=undefined`で続行 |
| 検索クエリ埋め込み失敗 | `Result.err()`返却（検索不可）        |

---

## 3. IKnowledgeGraphStore統合

### 3.1 インターフェース参照

```typescript
// CONV-08-01で実装済み
interface IKnowledgeGraphStore {
  // エンティティ取得
  findEntities(query: EntityQuery): Promise<Result<StoredEntity[], Error>>;
  getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>>;

  // 関係取得
  getRelationsByEntity(
    entityId: EntityId,
    options?: { direction?: "outgoing" | "incoming" | "both" },
  ): Promise<Result<StoredRelation[], Error>>;

  // その他のメソッド（使用しない）
  // addEntity, updateEntity, deleteEntity, addRelation, etc.
}
```

### 3.2 呼び出し契約

#### findEntities()

| 項目   | 値/仕様                          |
| ------ | -------------------------------- |
| 用途   | コミュニティ内エンティティの取得 |
| 入力   | `{ entityIds: EntityId[] }`      |
| 戻り値 | `Result<StoredEntity[], Error>`  |

#### getRelationsByEntity()

| 項目   | 値/仕様                             |
| ------ | ----------------------------------- |
| 用途   | コミュニティ内関係の取得            |
| 入力   | `entityId`, `{ direction: "both" }` |
| 戻り値 | `Result<StoredRelation[], Error>`   |

### 3.3 使用パターン

```typescript
// コミュニティ内エンティティの取得
async getCommunityEntities(
  community: Community
): Promise<Result<StoredEntity[], Error>> {
  return this.graphStore.findEntities({
    entityIds: community.memberEntityIds,
  });
}

// コミュニティ内関係の取得（内部エッジのみ）
async getRelationsInCommunity(
  community: Community
): Promise<Result<StoredRelation[], Error>> {
  const relations: StoredRelation[] = [];
  const memberSet = new Set(community.memberEntityIds);

  for (const entityId of community.memberEntityIds) {
    const relationsResult = await this.graphStore.getRelationsByEntity(
      entityId,
      { direction: "both" }
    );

    if (relationsResult.ok) {
      for (const relation of relationsResult.value) {
        // コミュニティ内の関係のみ（両端がメンバー）
        if (
          memberSet.has(relation.sourceEntityId) &&
          memberSet.has(relation.targetEntityId)
        ) {
          // 重複チェック
          if (!relations.some((r) => r.id === relation.id)) {
            relations.push(relation);
          }
        }
      }
    }
  }

  return ok(relations);
}
```

### 3.4 エラーハンドリング

| エラー条件           | 対応               |
| -------------------- | ------------------ |
| エンティティ取得失敗 | `Result.err()`返却 |
| 関係取得失敗         | `Result.err()`返却 |

---

## 4. ICommunityRepository統合

### 4.1 既存インターフェース（CONV-08-02で定義済み）

```typescript
interface ICommunityRepository {
  insert(community: Community): Promise<Result<Community, Error>>;
  insertMany(communities: Community[]): Promise<Result<Community[], Error>>;
  findById(id: CommunityId): Promise<Result<Community | null, Error>>;
  findByEntityId(entityId: EntityId): Promise<Result<Community[], Error>>;
  findByLevel(level: number): Promise<Result<Community[], Error>>;
  deleteAll(): Promise<Result<void, Error>>;
  addEntityCommunityMapping(
    entityId: EntityId,
    communityId: CommunityId,
  ): Promise<Result<void, Error>>;
}
```

### 4.2 追加メソッド（本タスクで追加）

```typescript
interface ICommunityRepository {
  // 既存メソッド...

  /**
   * コミュニティの要約を取得
   *
   * @param communityId - コミュニティID
   * @returns 要約、または要約が存在しない場合はnull
   */
  getSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary | null, Error>>;

  /**
   * コミュニティの要約を更新
   *
   * @param communityId - コミュニティID
   * @param summary - 新しい要約データ
   * @returns 保存結果
   */
  updateSummary(
    communityId: CommunityId,
    summary: CommunitySummary,
  ): Promise<Result<void, Error>>;
}
```

### 4.3 追加メソッドの呼び出し契約

#### getSummary()

| 項目   | 値/仕様                                   |
| ------ | ----------------------------------------- |
| 用途   | 子コミュニティの要約取得                  |
| 入力   | `communityId: CommunityId`                |
| 戻り値 | `Result<CommunitySummary \| null, Error>` |
| 備考   | 要約未生成の場合は`null`を返却            |

#### updateSummary()

| 項目   | 値/仕様                                    |
| ------ | ------------------------------------------ |
| 用途   | 要約のDB保存                               |
| 入力   | `communityId`, `summary: CommunitySummary` |
| 戻り値 | `Result<void, Error>`                      |
| 備考   | 既存要約がある場合は上書き                 |

### 4.4 使用パターン

```typescript
// 子コミュニティ要約の取得（summarize内）
if (options.useChildSummaries && community.childCommunityIds.length > 0) {
  const childResults = await Promise.all(
    community.childCommunityIds.map((id) =>
      this.communityRepository.getSummary(id),
    ),
  );
  childSummaries = childResults
    .filter((r) => r.ok && r.value !== null)
    .map((r) => r.value!);
}

// 要約の保存
const saveResult = await this.communityRepository.updateSummary(
  community.id,
  summary,
);
if (!saveResult.ok) {
  return err(saveResult.error);
}
```

---

## 5. データベーススキーマ（追加）

### 5.1 community_summaries テーブル

```sql
CREATE TABLE community_summaries (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  summary TEXT NOT NULL,
  keywords TEXT NOT NULL,  -- JSON array
  main_entities TEXT NOT NULL,  -- JSON array
  main_relations TEXT NOT NULL,  -- JSON array
  sentiment TEXT,  -- 'positive' | 'negative' | 'neutral'
  confidence REAL NOT NULL,
  token_count INTEGER NOT NULL,
  embedding BLOB,  -- Float32Array as binary
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

CREATE INDEX idx_community_summaries_level ON community_summaries(level);
CREATE INDEX idx_community_summaries_community_id ON community_summaries(community_id);
```

---

## 6. 統合テスト設計

### 6.1 テスト対象

| 統合ポイント         | テスト内容                             |
| -------------------- | -------------------------------------- |
| ILLMProvider         | generate()呼び出し、JSONレスポンス処理 |
| IEmbeddingProvider   | embedSingle()呼び出し、埋め込み格納    |
| IKnowledgeGraphStore | findEntities(), getRelationsByEntity() |
| ICommunityRepository | getSummary(), updateSummary()          |

### 6.2 モック設計

```typescript
// テスト用モック
const mockLLMProvider: ILLMProvider = {
  generate: vi.fn().mockResolvedValue(
    ok({
      text: JSON.stringify({
        summary: "テスト要約",
        keywords: ["keyword1", "keyword2"],
        mainEntities: ["entity1"],
        mainRelations: ["relation1"],
        sentiment: "neutral",
        confidence: 0.85,
      }),
      tokenUsage: { prompt: 100, completion: 50, total: 150 },
    }),
  ),
};

const mockEmbeddingProvider: IEmbeddingProvider = {
  embedSingle: vi.fn().mockResolvedValue(ok(new Array(384).fill(0.1))),
  embedBatch: vi.fn(),
  getDimensions: () => 384,
};

const mockGraphStore: IKnowledgeGraphStore = {
  findEntities: vi.fn().mockResolvedValue(ok([mockEntity])),
  getRelationsByEntity: vi.fn().mockResolvedValue(ok([mockRelation])),
  // ...
};

const mockCommunityRepo: ICommunityRepository = {
  findById: vi.fn().mockResolvedValue(ok(mockCommunity)),
  getSummary: vi.fn().mockResolvedValue(ok(null)),
  updateSummary: vi.fn().mockResolvedValue(ok(undefined)),
  // ...
};
```

### 6.3 統合テストケース

| ID    | テストケース                  | 検証ポイント                   |
| ----- | ----------------------------- | ------------------------------ |
| IT-01 | LLM呼び出し成功               | generate()の正しい呼び出し     |
| IT-02 | LLM呼び出し失敗時のエラー処理 | Result.errの返却               |
| IT-03 | 埋め込み生成成功              | embedSingle()の呼び出し、格納  |
| IT-04 | 埋め込み生成失敗時の継続処理  | embedding=undefinedで成功      |
| IT-05 | エンティティ取得成功          | findEntities()の正しい呼び出し |
| IT-06 | 関係取得とフィルタリング      | コミュニティ内関係のみ取得     |
| IT-07 | 子コミュニティ要約取得        | getSummary()の呼び出し         |
| IT-08 | 要約のDB保存                  | updateSummary()の呼び出し      |

---

## 完了条件

- [x] ILLMProvider統合が設計されている
- [x] IEmbeddingProvider統合が設計されている
- [x] IKnowledgeGraphStore統合が設計されている
- [x] ICommunityRepository統合が設計されている
- [x] 新規メソッド（getSummary, updateSummary）が定義されている
- [x] データベーススキーマ（community_summaries）が定義されている
- [x] 統合テスト設計が含まれている
