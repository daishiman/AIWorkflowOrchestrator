# Phase 5: 実装 (TDD Green) - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装 (TDD Green)      |
| 前提Phase  | Phase 4 (テスト作成)  |
| 後続Phase  | Phase 6 (リファクタ)  |
| ステータス | 未実施                |
| 作成日     | 2026-01-05            |
| 機能名     | entity-extraction-ner |

---

## 目的

TDDのGreenフェーズとして、テストを通過する最小限の実装を行う。

## 背景

Phase 4で作成したテストを全てパスさせる実装を行う。まずは動作する最小限のコードを書き、リファクタリングは次フェーズで行う。

---

## 使用スキル

### スキル1: zod-validation

**パス**: `.claude/skills/zod-validation/SKILL.md`

**Trigger条件**: 入出力バリデーション、スキーマ定義、型安全性

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. LLMレスポンスのバリデーションスキーマを定義
3. 入力パラメータのバリデーションを実装

**期待される成果物**:

- Zodスキーマ定義
- バリデーション実装

---

### スキル2: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**: 可読性、命名規則、関数分割

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. クリーンなコード原則に従って実装
3. 適切な命名と関数分割を適用

**期待される成果物**:

- 可読性の高い実装コード

---

### スキル3: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**: Result型、エラーハンドリング、例外処理

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. Result型を使用したエラーハンドリングを実装
3. 適切なエラー型を定義

**期待される成果物**:

- エラー定義
- Result型による返却値

---

## 参照資料

| 参照資料       | パス                                                                    | 内容               |
| -------------- | ----------------------------------------------------------------------- | ------------------ |
| 設計書         | `outputs/phase-2/`                                                      | アーキテクチャ設計 |
| テストファイル | `packages/shared/src/services/extraction/__tests__/`                    | テストケース       |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-06-04-entity-extraction-ner.md` | 実装仕様           |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                    | 内容             |
| ---------- | ----------------------------------------------------------------------- | ---------------- |
| 型定義     | `.claude/skills/aiworkflow-requirements/references/type-definitions.md` | 共通型定義       |
| サービス層 | `.claude/skills/aiworkflow-requirements/references/service-layer.md`    | サービス設計基準 |

---

## 成果物

| 成果物           | パス                                                                   | 内容               |
| ---------------- | ---------------------------------------------------------------------- | ------------------ |
| 型定義           | `packages/shared/src/services/extraction/types.ts`                     | エンティティ型     |
| エラー定義       | `packages/shared/src/services/extraction/errors.ts`                    | エラークラス       |
| インターフェース | `packages/shared/src/services/extraction/interfaces.ts`                | IEntityExtractor   |
| LLM実装          | `packages/shared/src/services/extraction/entity-extractor.ts`          | LLMEntityExtractor |
| ルールベース実装 | `packages/shared/src/services/extraction/rule-based-extractor.ts`      | RuleBasedExtractor |
| プロンプト       | `packages/shared/src/services/extraction/prompts/entity-extraction.ts` | LLMプロンプト      |
| エクスポート     | `packages/shared/src/services/extraction/index.ts`                     | バレルエクスポート |

---

## 実装仕様

### 型定義 (types.ts)

```typescript
export type EntityType =
  | "person"
  | "organization"
  | "location"
  | "concept"
  | "technology"
  | "event"
  | "document"
  | "product"
  | "date"
  | "other";

export interface EntityMention {
  text: string;
  startOffset: number;
  endOffset: number;
  context?: string;
}

export interface ExtractedEntity {
  name: string;
  type: EntityType;
  confidence: number;
  description?: string;
  aliases?: string[];
  mentions: EntityMention[];
  metadata?: Record<string, unknown>;
}

export interface EntityExtractionOptions {
  types?: EntityType[];
  minConfidence?: number;
  maxEntities?: number;
  includeDescriptions?: boolean;
  includeAliases?: boolean;
  includeMentions?: boolean;
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  chunkId: string;
  processingTimeMs: number;
}

export interface BatchEntityExtractionResult {
  results: EntityExtractionResult[];
  totalEntities: number;
  processingTimeMs: number;
  errors: Array<{ chunkId: string; error: Error }>;
}
```

### LLMEntityExtractor 実装概要

```typescript
export class LLMEntityExtractor implements IEntityExtractor {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly options?: { maxRetries?: number },
  ) {}

  async extract(
    chunk: ContentChunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, Error>> {
    // 1. プロンプト生成
    // 2. LLM呼び出し（リトライあり）
    // 3. レスポンスパース（Zodバリデーション）
    // 4. オプションに基づくフィルタリング
    // 5. Result返却
  }

  async extractBatch(
    chunks: ContentChunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, Error>> {
    // 各チャンクを並列処理、エラーはスキップして継続
  }

  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[] {
    // 同一エンティティをマージ、メンション集約
  }
}
```

---

## TDD検証

### テスト実行コマンド

```bash
pnpm --filter @repo/shared test:run -- --grep "EntityExtractor"
```

### 確認項目

- [ ] 全テストがパスする（Green状態）
- [ ] カバレッジが80%以上
- [ ] 型エラーがない

---

## 完了条件

- [ ] types.ts が実装されている
- [ ] errors.ts が実装されている
- [ ] interfaces.ts が実装されている
- [ ] LLMEntityExtractor が実装されている
- [ ] RuleBasedEntityExtractor が実装されている
- [ ] プロンプトが実装されている
- [ ] index.ts でエクスポートされている
- [ ] 全テストがパスする（Green状態）
- [ ] 型チェックがパスする

---

## 依存関係

- **前提**: Phase 4 が完了していること（テストが存在しRed状態）
- **後続**: Phase 6 (リファクタリング) へ進む

---

## スキルフィードバック記録

```markdown
## Phase 5 実行記録

### 使用スキル

- zod-validation: {{result}}
- clean-code-practices: {{result}}
- error-handling-patterns: {{result}}

### TDD状態

- Green確認: {{完了/未完了}}
- テストカバレッジ: {{%}}

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-6-refactoring.md`
