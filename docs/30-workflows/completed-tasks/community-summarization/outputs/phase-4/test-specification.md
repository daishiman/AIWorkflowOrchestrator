# テスト仕様書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 4（テスト作成）      |

---

## 1. テスト対象

### 1.1 対象モジュール

| モジュール                  | パス                                           |
| --------------------------- | ---------------------------------------------- |
| ICommunitySummarizer        | `interfaces/community-summarizer.interface.ts` |
| CommunitySummarizer         | `community-summarizer.ts`                      |
| buildCommunitySummaryPrompt | `prompts/community-summary-prompt.ts`          |

### 1.2 テストファイル

| テストファイル                             | 対象                      |
| ------------------------------------------ | ------------------------- |
| `community-summarizer.test.ts`             | CommunitySummarizer全機能 |
| `community-summary-prompt.test.ts`         | プロンプト生成関数        |
| `community-summarizer.integration.test.ts` | 統合テスト                |

---

## 2. テストケース設計

### 2.1 受け入れ基準対応テスト

| AC ID | テストケース名                         | 検証ポイント                             |
| ----- | -------------------------------------- | ---------------------------------------- |
| AC-01 | 単一コミュニティの要約生成             | Result.ok、summary/keywords/mainEntities |
| AC-02 | 子コミュニティの要約を使用した要約生成 | 子要約がプロンプトに含まれる             |
| AC-03 | 全コミュニティの一括要約生成           | level降順処理、全要約取得                |
| AC-04 | 要約の埋め込み生成とセマンティック検索 | embedding存在、検索結果ソート            |
| AC-05 | レベル指定検索                         | 指定レベルのみ返却                       |
| AC-06 | 要約の更新                             | createdAt更新、DB反映                    |
| AC-07 | 部分失敗時の継続処理                   | failedCommunities記録、他は成功          |

### 2.2 品質基準テスト

| QC ID | テストケース名     | 検証ポイント                   |
| ----- | ------------------ | ------------------------------ |
| QC-01 | テストカバレッジ   | Line 80%+, Branch 60%+         |
| QC-02 | TypeScript型エラー | 型エラー0件                    |
| QC-03 | JSDocコメント      | 全publicメソッドにドキュメント |

### 2.3 統合テスト

| IT ID | テストケース名                   | 検証ポイント                        |
| ----- | -------------------------------- | ----------------------------------- |
| IT-01 | ILLMProvider統合（正常）         | generate()呼び出し、JSONパース      |
| IT-02 | ILLMProvider統合（エラー）       | Result.err返却                      |
| IT-03 | IEmbeddingProvider統合（正常）   | embedSingle()呼び出し、埋め込み格納 |
| IT-04 | IEmbeddingProvider統合（エラー） | embedding=undefinedで続行           |
| IT-05 | IKnowledgeGraphStore統合         | findEntities(), getRelations()      |
| IT-06 | ICommunityRepository統合         | getSummary(), updateSummary()       |

### 2.4 エッジケーステスト

| EC ID | テストケース名                 | 検証ポイント                      |
| ----- | ------------------------------ | --------------------------------- |
| EC-01 | 空のコミュニティ               | 適切なエラーまたはデフォルト要約  |
| EC-02 | 単一エンティティのコミュニティ | 正常に要約生成                    |
| EC-03 | 大量エンティティ（100+）       | 上位20件のみ使用                  |
| EC-04 | JSONパース失敗                 | Result.err("No JSON found")       |
| EC-05 | 存在しないコミュニティID       | Result.err("Community not found") |

---

## 3. テストデータ設計

### 3.1 モックエンティティ

```typescript
const mockEntity: StoredEntity = {
  id: createEntityId("entity-1"),
  name: "TypeScript",
  normalizedName: "typescript",
  type: "technology",
  description: "静的型付けプログラミング言語",
  aliases: ["TS"],
  confidence: 0.9,
  mentionCount: 10,
  importance: 0.85,
  embedding: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### 3.2 モック関係

```typescript
const mockRelation: StoredRelation = {
  id: createRelationId("relation-1"),
  sourceEntityId: createEntityId("entity-1"),
  targetEntityId: createEntityId("entity-2"),
  relationType: "SUPERSET_OF",
  description: "TypeScriptはJavaScriptのスーパーセット",
  confidence: 0.95,
  bidirectional: false,
  evidence: [{ chunkId: createChunkId("chunk-1"), text: "...", position: 0 }],
  createdAt: new Date(),
};
```

### 3.3 モックコミュニティ

```typescript
const mockCommunity: Community = {
  id: createCommunityId("community-1"),
  level: 0,
  memberEntityIds: [createEntityId("entity-1"), createEntityId("entity-2")],
  childCommunityIds: [],
  parentCommunityId: undefined,
  size: 2,
  internalEdges: 1,
  externalEdges: 0,
  modularity: 0.5,
  summary: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### 3.4 モックLLMレスポンス

```typescript
const mockLLMResponse = {
  summary: "このグループはプログラミング言語に関連するエンティティです",
  keywords: ["TypeScript", "JavaScript", "プログラミング"],
  mainEntities: ["TypeScript", "JavaScript"],
  mainRelations: ["TypeScriptはJavaScriptのスーパーセット"],
  sentiment: "neutral",
  confidence: 0.85,
};
```

---

## 4. カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 5. テスト実行コマンド

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test -- community-summarizer

# カバレッジ付き実行
pnpm --filter @repo/shared test -- community-summarizer --coverage

# 特定テストのみ実行
pnpm --filter @repo/shared test -- community-summarizer.test.ts
```

---

## 完了条件

- [x] 受け入れ基準対応テストケースが設計されている（7件）
- [x] 統合テストケースが設計されている（6件）
- [x] エッジケーステストが設計されている（5件）
- [x] テストデータが設計されている
- [x] カバレッジ目標が設定されている
