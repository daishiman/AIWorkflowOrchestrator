# テスト仕様書 - 関係抽出サービス

## 概要

| 項目                 | 内容             |
| -------------------- | ---------------- |
| 機能ID               | CONV-06-05       |
| 機能名               | 関係抽出サービス |
| 作成日               | 2026-01-07       |
| テストフレームワーク | Vitest           |
| カバレッジ目標       | 80%以上          |

---

## 1. テスト対象

### 1.1 対象モジュール

| モジュール           | パス                                                            |
| -------------------- | --------------------------------------------------------------- |
| LLMRelationExtractor | `packages/shared/src/services/extraction/relation-extractor.ts` |
| IRelationExtractor   | `packages/shared/src/services/extraction/interfaces.ts`         |
| 関係抽出型定義       | `packages/shared/src/services/extraction/types.ts`              |

### 1.2 テストファイル

| テストファイル     | パス                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| ユニットテスト     | `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts`  |
| 統合テスト（将来） | `packages/shared/src/services/extraction/__tests__/extraction-pipeline.test.ts` |

---

## 2. テストダブル設計

### 2.1 MockLLMProvider

**種類**: Mock（振る舞い検証用）

**目的**: LLM API呼び出しのモック化

```typescript
const createMockLLMProvider = (
  response: LLMRelationResponse,
): ILLMProvider => ({
  modelId: "mock-model",
  generate: vi.fn().mockResolvedValue(
    ok({
      text: JSON.stringify(response),
      tokensUsed: 100,
    }),
  ),
});
```

### 2.2 テストフィクスチャ

**サンプルエンティティ**:

```typescript
const sampleEntities: ExtractedEntity[] = [
  {
    name: "TypeScript",
    normalizedName: "typescript",
    type: "technology",
    confidence: 0.95,
    mentions: [],
    aliases: ["TS"],
  },
  {
    name: "Microsoft",
    normalizedName: "microsoft",
    type: "organization",
    confidence: 0.98,
    mentions: [],
    aliases: ["MS"],
  },
];
```

**サンプルチャンク**:

```typescript
const sampleChunk: Chunk = {
  id: "chunk-001",
  content: "TypeScriptはMicrosoftが開発したプログラミング言語です。",
  metadata: { source: "test" },
};
```

**期待されるLLM応答**:

```typescript
const mockLLMResponse: LLMRelationResponse = {
  relations: [
    {
      sourceEntity: "TypeScript",
      targetEntity: "Microsoft",
      relationType: "created_by",
      description: "TypeScriptはMicrosoftによって開発された",
      confidence: 0.92,
      bidirectional: false,
      evidence: {
        text: "TypeScriptはMicrosoftが開発した",
        startPosition: 0,
        endPosition: 23,
      },
    },
  ],
};
```

---

## 3. テストカテゴリ

### 3.1 ユニットテスト

| カテゴリ     | テスト数 | カバー対象                        |
| ------------ | -------- | --------------------------------- |
| 正常系       | 8        | AC-001, AC-003, AC-005〜AC-009    |
| エッジケース | 4        | AC-002, AC-010, 境界値            |
| 異常系       | 3        | AC-011, LLMエラー、バリデーション |
| マージ処理   | 4        | AC-004, 重複統合                  |

### 3.2 統合テスト（Phase 7で実装）

| カテゴリ       | テスト数 | カバー対象                 |
| -------------- | -------- | -------------------------- |
| Pipeline統合   | 3        | AC-012, ExtractionPipeline |
| Repository連携 | 2        | DB保存・取得               |

---

## 4. TDD Red状態確認

### 4.1 確認コマンド

```bash
pnpm --filter @repo/shared test:run -- relation-extractor
```

### 4.2 期待される結果

- 全テストが失敗すること（実装がないため）
- テスト数: 19件
- 失敗数: 19件

---

## 5. 受け入れ基準とテストマッピング

| 受け入れ基準 | テストケース                              | 優先度 |
| ------------ | ----------------------------------------- | ------ |
| AC-001       | extract: エンティティ間の関係を抽出できる | Must   |
| AC-002       | extract: エンティティ2件未満で空配列      | Must   |
| AC-003       | extractBatch: 複数チャンク一括処理        | Must   |
| AC-004       | mergeRelations: 重複関係をマージ          | Must   |
| AC-005       | extract: 指定タイプのみ抽出               | Should |
| AC-006       | extract: 最小信頼度でフィルタリング       | Should |
| AC-007       | extract: エビデンス情報を含む             | Must   |
| AC-008       | extract: 15種類の関係タイプ分類           | Must   |
| AC-009       | extract: 双方向関係を識別                 | Should |
| AC-010       | extract: 自己参照を除外                   | Must   |
| AC-011       | extract: LLMエラー時にResult.err          | Must   |
| AC-012       | ExtractionPipeline統合（Phase 7）         | Must   |

---

## 6. Phase 4 実行記録

### 使用スキル

- tdd-principles: success
- test-doubles: success

### TDD状態

- Red状態確認: OK（全テスト失敗予定）
- テストケース数: 19件

### 発見事項

- **良かった点**: 受け入れ基準から直接テストケースを導出できた
- **問題点**: なし
- **改善提案**: なし

### 次Phaseへの引き継ぎ事項

- Phase 5（実装）でGreen状態を目指す
- 統合テストはPhase 7で実装
