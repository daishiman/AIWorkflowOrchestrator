# 統合テスト設計書 - 関係抽出サービス

## 概要

| 項目      | 内容             |
| --------- | ---------------- |
| 機能ID    | CONV-06-05       |
| 機能名    | 関係抽出サービス |
| 作成日    | 2026-01-07       |
| 実装Phase | Phase 7          |

---

## 1. 統合テストカテゴリ

### 1.1 API統合

| シナリオ                | 検証内容                            |
| ----------------------- | ----------------------------------- |
| LLMプロバイダー呼び出し | ILLMProvider.generateの正常呼び出し |
| プロンプト送信          | 正しいプロンプト形式でLLMに送信     |
| 応答パース              | LLM応答のJSONパース                 |

### 1.2 データフロー統合

| シナリオ                          | 検証内容                         |
| --------------------------------- | -------------------------------- |
| EntityExtractor→RelationExtractor | エンティティ結果の受け渡し       |
| Pipeline一括処理                  | チャンク→エンティティ→関係の連携 |
| Repository保存                    | ExtractedRelation[]のDB保存      |

### 1.3 エラーハンドリング統合

| シナリオ           | 検証内容                   |
| ------------------ | -------------------------- |
| LLMタイムアウト    | タイムアウト時のエラー伝播 |
| ネットワークエラー | ネットワーク障害時の動作   |
| リトライ動作       | maxRetriesに基づくリトライ |

---

## 2. 統合テストシナリオ

### IT-001: EntityExtractor→RelationExtractor連携

**目的**: エンティティ抽出結果が関係抽出に正しく渡されること

**前提条件**:

- IEntityExtractorが設定済み
- IRelationExtractorが設定済み
- チャンクデータが存在

**テスト手順**:

1. IEntityExtractor.extractBatch()でエンティティを抽出
2. 抽出結果からMap<ChunkId, ExtractedEntity[]>を作成
3. IRelationExtractor.extractBatch()で関係を抽出
4. 関係のsourceEntity/targetEntityがエンティティリストに存在することを確認

**期待結果**:

- 関係のエンティティ参照が有効
- チャンクIDが正しく紐付けられている

---

### IT-002: ExtractionPipeline統合

**目的**: ExtractionPipelineが全処理を正しく実行すること

**前提条件**:

- ExtractionPipelineが構成済み
- IEntityExtractorとIRelationExtractorが注入済み

**テスト手順**:

1. ExtractionPipeline.process(chunks)を呼び出す
2. エンティティ抽出が実行されることを確認
3. 関係抽出が実行されることを確認
4. 結果にentitiesとrelationsが含まれることを確認

**期待結果**:

- エンティティと関係が抽出される
- 処理順序が正しい（エンティティ→関係）

---

### IT-003: Repository保存統合

**目的**: 抽出結果がRepositoryに正しく保存されること

**前提条件**:

- EntityRepositoryとRelationRepositoryが設定済み
- ExtractionPipelineが構成済み

**テスト手順**:

1. ExtractionPipeline.process()を実行
2. EntityRepository.bulkUpsert()が呼ばれることを確認
3. RelationRepository.bulkUpsert()が呼ばれることを確認
4. 保存されたデータを取得して検証

**期待結果**:

- エンティティがEntityRepositoryに保存される
- 関係がRelationRepositoryに保存される

---

### IT-004: エラー伝播統合

**目的**: LLMエラーがPipelineに正しく伝播すること

**前提条件**:

- LLMプロバイダーがエラーを返す設定

**テスト手順**:

1. ExtractionPipeline.process()を呼び出す
2. LLMエラーが発生
3. エラーがResult.errとして返されることを確認

**期待結果**:

- エラーが適切に伝播される
- エラーメッセージが明確

---

### IT-005: 空エンティティ時の動作

**目的**: エンティティが抽出されない場合の動作確認

**前提条件**:

- エンティティが抽出されないチャンク

**テスト手順**:

1. 空またはエンティティがないチャンクを処理
2. 関係抽出がスキップされることを確認
3. 空の関係配列が返されることを確認

**期待結果**:

- エラーにならない
- 空の結果が返される

---

## 3. テストデータ設計

### 3.1 統合テスト用チャンク

```typescript
const integrationTestChunks: Chunk[] = [
  {
    id: "it-chunk-001",
    content:
      "TypeScriptはMicrosoftが開発したプログラミング言語です。JavaScriptを拡張し、静的型付けを提供します。",
    metadata: { source: "integration-test" },
  },
  {
    id: "it-chunk-002",
    content:
      "ReactはFacebookが開発したUIライブラリです。Vueは競合フレームワークとして知られています。",
    metadata: { source: "integration-test" },
  },
];
```

### 3.2 期待される抽出結果

```typescript
const expectedEntities = [
  { name: "TypeScript", type: "technology" },
  { name: "Microsoft", type: "organization" },
  { name: "JavaScript", type: "technology" },
  { name: "React", type: "technology" },
  { name: "Facebook", type: "organization" },
  { name: "Vue", type: "technology" },
];

const expectedRelations = [
  { source: "TypeScript", target: "Microsoft", type: "created_by" },
  { source: "TypeScript", target: "JavaScript", type: "extends" },
  { source: "React", target: "Facebook", type: "created_by" },
  {
    source: "React",
    target: "Vue",
    type: "competes_with",
    bidirectional: true,
  },
];
```

---

## 4. モック設計（統合テスト用）

### 4.1 LLMプロバイダーモック

```typescript
const createIntegrationMockLLMProvider = (): ILLMProvider => {
  const responses: Record<string, LLMRelationResponse> = {
    "it-chunk-001": {
      relations: [
        {
          sourceEntity: "TypeScript",
          targetEntity: "Microsoft",
          relationType: "created_by",
          confidence: 0.95,
        },
        {
          sourceEntity: "TypeScript",
          targetEntity: "JavaScript",
          relationType: "extends",
          confidence: 0.9,
        },
      ],
    },
    "it-chunk-002": {
      relations: [
        {
          sourceEntity: "React",
          targetEntity: "Facebook",
          relationType: "created_by",
          confidence: 0.92,
        },
        {
          sourceEntity: "React",
          targetEntity: "Vue",
          relationType: "competes_with",
          confidence: 0.88,
          bidirectional: true,
        },
      ],
    },
  };

  return {
    modelId: "integration-mock",
    generate: vi.fn().mockImplementation((prompt) => {
      // プロンプトからチャンクIDを抽出して対応する応答を返す
      const chunkId = extractChunkIdFromPrompt(prompt);
      return ok({ text: JSON.stringify(responses[chunkId]), tokensUsed: 100 });
    }),
  };
};
```

### 4.2 Repositoryモック

```typescript
const createMockEntityRepository = (): IEntityRepository => ({
  bulkUpsert: vi.fn().mockResolvedValue(ok(undefined)),
  findByNames: vi.fn().mockResolvedValue(ok([])),
});

const createMockRelationRepository = (): IRelationRepository => ({
  bulkUpsert: vi.fn().mockResolvedValue(ok(undefined)),
  findByEntityIds: vi.fn().mockResolvedValue(ok([])),
});
```

---

## 5. 統合テスト実行計画

### 5.1 実行Phase

| Phase | 内容                   |
| ----- | ---------------------- |
| 7     | 統合テストの実装       |
| 9     | 統合テストの実行・検証 |

### 5.2 実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/shared test:run -- extraction-pipeline

# 全テスト実行
pnpm --filter @repo/shared test:run -- --coverage
```

---

## 6. 統合テスト連携アクション確認

- [x] 統合テストシナリオを作成（API/データフロー/エラー）
- [x] エンティティ抽出サービスとの連携テストを設計
- [x] ExtractionPipelineとの統合テストを設計

---

## 7. サマリー

| カテゴリ         | テスト数 |
| ---------------- | -------- |
| API統合          | 3        |
| データフロー統合 | 3        |
| エラー統合       | 2        |
| **合計**         | 8        |
