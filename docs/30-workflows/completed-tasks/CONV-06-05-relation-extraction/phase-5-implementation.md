# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| Phase名    | 実装                           |
| 前提Phase  | Phase 4                        |
| 後続Phase  | Phase 6                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

TDDの「Green」フェーズとして、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

テスト駆動開発では、失敗するテストを通すことを目標に実装を進める。過剰な実装を避け、テストが通る最小限のコードを書くことで、必要十分な機能を実現する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**: TypeScriptの型安全実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Phase 2の型設計に従って実装
3. Zodスキーマを使用したバリデーション実装

**期待される成果物**:

- `packages/shared/src/services/extraction/types.ts`（関係抽出型の追加）
- `packages/shared/src/services/extraction/relation-extractor.ts`

---

### スキル2: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**: エラー処理パターンの実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Result型を使用したエラーハンドリング
3. LLM応答パースのエラー処理

**期待される成果物**:

- エラーハンドリングが実装に含まれる

---

## 参照資料

| 参照資料       | パス                                                                           | 内容                 |
| -------------- | ------------------------------------------------------------------------------ | -------------------- |
| Phase 2成果物  | `outputs/phase-2/architecture-design.md`                                       | インターフェース設計 |
| Phase 4成果物  | `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts` | テストコード         |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-06-05-relation-extraction.md`          | 実装仕様詳細         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                          | 内容                       |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| エンティティ・関係スキーマ | `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md` | エンティティと関係の型定義 |

---

## 成果物

| 成果物             | パス                                                                            | 内容             |
| ------------------ | ------------------------------------------------------------------------------- | ---------------- |
| 関係抽出サービス   | `packages/shared/src/services/extraction/relation-extractor.ts`                 | 実装コード       |
| 関係抽出プロンプト | `packages/shared/src/services/extraction/prompts/relation-extraction-prompt.ts` | LLMプロンプト    |
| 型定義（追加）     | `packages/shared/src/services/extraction/types.ts`                              | 関係抽出関連の型 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                     | 実装内容の要約   |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 5では以下の統合テスト連携アクションを実施:

- [ ] フロント/バック接続の実装とテスト支援コード整備
- [ ] IRelationExtractorインターフェースの実装
- [ ] ExtractionPipelineとの統合実装

---

## 実装ガイドライン

### 型定義の追加（types.ts）

```typescript
// packages/shared/src/services/extraction/types.ts に追加
import { z } from "zod";

export const relationTypeSchema = z.enum([
  "belongs_to",
  "related_to",
  "causes",
  "depends_on",
  "created_by",
  "uses",
  "part_of",
  "located_in",
  "succeeds",
  "precedes",
  "competes_with",
  "collaborates_with",
  "implements",
  "extends",
  "other",
]);
export type RelationType = z.infer<typeof relationTypeSchema>;

export const extractedRelationSchema = z.object({
  sourceEntity: z.string(),
  targetEntity: z.string(),
  relationType: relationTypeSchema,
  description: z.string().optional(),
  evidence: z.array(
    z.object({
      chunkId: z.string(),
      text: z.string(),
      startPosition: z.number(),
      endPosition: z.number(),
    }),
  ),
  confidence: z.number().min(0).max(1),
  bidirectional: z.boolean().default(false),
  attributes: z.record(z.unknown()).optional(),
});
export type ExtractedRelation = z.infer<typeof extractedRelationSchema>;

export interface RelationExtractionOptions {
  types?: RelationType[];
  maxRelationsPerChunk?: number;
  minConfidence?: number;
  allowMultipleRelations?: boolean;
  useLLM?: boolean;
}

export interface RelationExtractionResult {
  relations: ExtractedRelation[];
  chunkId: ChunkId;
  entityCount: number;
  processingTimeMs: number;
  modelUsed: string;
}

export interface BatchRelationExtractionResult {
  results: RelationExtractionResult[];
  totalRelations: number;
  uniqueRelations: number;
  processingTimeMs: number;
}
```

### LLMRelationExtractor実装

```typescript
// packages/shared/src/services/extraction/relation-extractor.ts
export class LLMRelationExtractor implements IRelationExtractor {
  private readonly defaultOptions: RelationExtractionOptions = {
    maxRelationsPerChunk: 30,
    minConfidence: 0.5,
    allowMultipleRelations: true,
    useLLM: true,
  };

  constructor(private readonly llmProvider: ILLMProvider) {}

  async extract(/* ... */): Promise<Result<RelationExtractionResult, Error>> {
    // 実装
  }

  async extractBatch(/* ... */): Promise<
    Result<BatchRelationExtractionResult, Error>
  > {
    // 実装
  }

  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[] {
    // 実装
  }

  private buildExtractionPrompt(/* ... */): string {
    // プロンプト構築
  }

  private parseResponse(/* ... */): Result<ExtractedRelation[], Error> {
    // レスポンスパース
  }

  private filterAndValidate(/* ... */): ExtractedRelation[] {
    // フィルタリングとバリデーション
  }

  private getRelationKey(relation: ExtractedRelation): string {
    // 関係のキー生成（マージ用）
  }
}
```

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- relation-extractor
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）
- [ ] 全てのテストがパスしている
- [ ] 型エラーがない

---

## 完了条件

- [ ] IRelationExtractorインターフェースが実装されている
- [ ] LLMRelationExtractorクラスが実装されている
- [ ] 関係タイプ（RelationType）スキーマが実装されている
- [ ] 関係抽出プロンプトが実装されている
- [ ] 全てのPhase 4テストが成功する（Green状態）
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] 統合テスト連携アクションが完了している
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 5
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- type-safety-patterns: [success/failure/partial]
- error-handling-patterns: [success/failure/partial]

### TDD状態

- Green状態確認: [OK/NG]
- パステスト数: [数値]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-06-05-relation-extraction/phase-6-test-expansion.md`
