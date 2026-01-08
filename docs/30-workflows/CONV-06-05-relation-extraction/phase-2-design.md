# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| Phase名    | 設計                           |
| 前提Phase  | Phase 1                        |
| 後続Phase  | Phase 3                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

関係抽出サービスのアーキテクチャ設計、インターフェース定義、型設計を行う。

## 背景

Phase 1で定義した要件を満たすために、Clean Architectureの原則に従ったインターフェース設計と、Zodを使用した型安全なデータ構造を設計する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: clean-architecture-principles

**パス**: `.claude/skills/clean-architecture-principles/SKILL.md`

**Trigger条件**: インターフェース設計、依存関係逆転が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. IRelationExtractorインターフェースを設計

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### スキル2: interface-segregation

**パス**: `.claude/skills/interface-segregation/SKILL.md`

**Trigger条件**: 複数の責務を持つインターフェースの分離が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. extract / extractBatch / mergeRelations の責務分離を検討
3. 成果物を下記のパスに出力

**期待される成果物**:

- インターフェース設計が `outputs/phase-2/architecture-design.md` に含まれる

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**: TypeScriptの型安全設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. ExtractedRelation, RelationType, RelationExtractionOptions の型設計
3. ジェネリクスの活用を検討

**期待される成果物**:

- 型設計が `outputs/phase-2/architecture-design.md` に含まれる

---

### スキル4: zod-validation

**パス**: `.claude/skills/zod-validation/SKILL.md`

**Trigger条件**: ランタイムバリデーションスキーマが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. relationTypeSchema, extractedRelationSchema を設計
3. LLM応答のパースバリデーションを設計

**期待される成果物**:

- Zodスキーマ設計が `outputs/phase-2/architecture-design.md` に含まれる

---

## 参照資料

| 参照資料       | パス                                                                  | 内容             |
| -------------- | --------------------------------------------------------------------- | ---------------- |
| Phase 1成果物  | `outputs/phase-1/requirements-definition.md`                          | 機能・非機能要件 |
| Phase 1成果物  | `outputs/phase-1/acceptance-criteria.md`                              | 受け入れ基準     |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-06-05-relation-extraction.md` | 実装仕様の詳細   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                          | 内容                       |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| エンティティ・関係スキーマ | `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md` | エンティティと関係の型定義 |
| 埋め込みパイプライン       | `.claude/skills/aiworkflow-requirements/references/embedding-pipeline.md`     | パイプライン全体設計       |

---

## 成果物

| 成果物             | パス                                     | 内容                     |
| ------------------ | ---------------------------------------- | ------------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | インターフェース・型設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 2では以下の統合テスト連携アクションを実施:

- [ ] 統合ポイント/契約（API・スキーマ）を設計に反映
- [ ] IRelationExtractorとExtractionPipelineの連携設計
- [ ] LLMプロバイダーインターフェースとの統合設計

---

## 設計ガイドライン

### インターフェース設計

```typescript
export interface IRelationExtractor {
  /**
   * チャンクとエンティティから関係を抽出
   */
  extract(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptions,
  ): Promise<Result<RelationExtractionResult, Error>>;

  /**
   * バッチ抽出
   */
  extractBatch(
    chunks: ContentChunk[],
    entitiesByChunk: Map<ChunkId, ExtractedEntity[]>,
    options?: RelationExtractionOptions,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  /**
   * 関係のマージ（重複の統合）
   */
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
```

### 関係タイプ設計

15種類の関係タイプを定義:

| タイプ            | 説明         | 例                                   |
| ----------------- | ------------ | ------------------------------------ |
| belongs_to        | 所属関係     | "John belongs_to Microsoft"          |
| related_to        | 一般的な関連 | "AI related_to Machine Learning"     |
| causes            | 因果関係     | "Bug causes Error"                   |
| depends_on        | 依存関係     | "React depends_on JavaScript"        |
| created_by        | 作成者       | "TypeScript created_by Microsoft"    |
| uses              | 使用関係     | "Next.js uses React"                 |
| part_of           | 部分-全体    | "Chapter part_of Book"               |
| located_in        | 位置関係     | "Google located_in California"       |
| succeeds          | 後継         | "Python 3 succeeds Python 2"         |
| precedes          | 先行         | "HTML precedes HTML5"                |
| competes_with     | 競合関係     | "React competes_with Vue"            |
| collaborates_with | 協力関係     | "OpenAI collaborates_with Microsoft" |
| implements        | 実装         | "Express implements HTTP server"     |
| extends           | 拡張         | "TypeScript extends JavaScript"      |
| other             | その他       | 分類困難な関係                       |

### Zodスキーマ設計

```typescript
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
```

---

## 完了条件

- [ ] IRelationExtractorインターフェースが設計されている
- [ ] 関係タイプ（RelationType）が定義されている
- [ ] ExtractedRelation型が設計されている
- [ ] RelationExtractionOptions型が設計されている
- [ ] Zodスキーマが設計されている
- [ ] LLMプロバイダーとの連携設計が完了している
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

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 2
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- clean-architecture-principles: [success/failure/partial]
- interface-segregation: [success/failure/partial]
- type-safety-patterns: [success/failure/partial]
- zod-validation: [success/failure/partial]

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

`docs/30-workflows/CONV-06-05-relation-extraction/phase-3-design-review.md`
