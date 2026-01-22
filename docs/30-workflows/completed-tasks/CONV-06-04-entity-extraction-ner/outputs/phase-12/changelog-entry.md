# CHANGELOG エントリ - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 12                    |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## CHANGELOG エントリ

以下の内容を `CHANGELOG.md` に追加してください。

```markdown
## [Unreleased]

### Added

#### Entity Extraction Service (NER) - CONV-06-04

Named Entity Recognition (NER) service for Knowledge Graph construction.

**New Features:**

- **IEntityExtractor Interface**: Strategy pattern interface for entity extraction
  - `extract()`: Single chunk extraction with configurable options
  - `extractBatch()`: Batch extraction with parallel processing (1-100 chunks)
  - `mergeEntities()`: Deduplicate and merge entities by normalized name

- **LLMEntityExtractor**: LLM-based high-precision extraction
  - 52 entity types across 10 categories
  - Context-aware extraction with descriptions and aliases
  - Automatic retry with exponential backoff
  - Fallback support to RuleBasedExtractor

- **RuleBasedEntityExtractor**: Pattern-based fast extraction
  - No external dependencies (offline capable)
  - Built-in patterns for dates, tech terms, organizations
  - Millisecond-level processing
  - Extensible with custom patterns and dictionaries

- **Type-safe schemas**: Zod schemas for all types
  - `ExtractedEntity`: Entity with confidence, mentions, aliases
  - `ExtractionResult`: Result with metrics and model info
  - `EntityExtractionOptions`: Configurable extraction parameters

**Technical Details:**

- Location: `packages/shared/src/services/extraction/`
- Test Coverage: 97.1% (224 tests)
- Quality Score: 96.8%

**Extraction Options:**

| Option                 | Default | Description              |
| ---------------------- | ------- | ------------------------ |
| `minConfidence`        | 0.5     | Minimum confidence score |
| `maxEntitiesPerChunk`  | 20      | Max entities per chunk   |
| `generateDescriptions` | true    | Generate descriptions    |
| `useLLM`               | true    | Use LLM extraction       |

**Entity Types (52 types in 10 categories):**

| Category           | Types                                    |
| ------------------ | ---------------------------------------- |
| People & Orgs      | person, organization, role, team         |
| Location & Time    | location, date, event                    |
| Business           | company, product, service, brand, etc.   |
| Technology         | technology, tool, method, standard, etc. |
| Code & Software    | programming_language, framework, etc.    |
| Abstract Concepts  | concept, theory, principle, pattern      |
| Document Structure | document, chapter, section, etc.         |
| Document Elements  | keyword, summary, figure, table, etc.    |
| Media              | image, video, audio, diagram             |
| Other              | other                                    |
```

---

## Breaking Changes

**なし**

この機能は新規追加であり、既存のAPIやインターフェースに変更はありません。

---

## 依存関係の変更

### 追加された依存関係

| パッケージ | バージョン | 用途         |
| ---------- | ---------- | ------------ |
| (なし)     | -          | 新規依存なし |

### 更新された依存関係

| パッケージ | 変更前 | 変更後 | 理由 |
| ---------- | ------ | ------ | ---- |
| (なし)     | -      | -      | -    |

---

## Migration Guide

### 新規利用者向け

```typescript
// 1. インポート
import {
  LLMEntityExtractor,
  RuleBasedEntityExtractor,
  type ExtractedEntity,
  type ExtractionResult,
} from "@repo/shared/services/extraction";

// 2. LLMプロバイダーを用意（DI）
const llmProvider = new YourLLMProvider();

// 3. エクストラクターを生成
const extractor = new LLMEntityExtractor(llmProvider);

// 4. 抽出実行
const result = await extractor.extract(chunk, {
  minConfidence: 0.7,
});

if (result.isOk()) {
  const entities = result.value.entities;
  console.log(`Extracted ${entities.length} entities`);
}
```

### RuleBasedのみを使用する場合

```typescript
// LLMなしで高速抽出
const extractor = new RuleBasedEntityExtractor();
const result = await extractor.extract(chunk);
```

### バッチ処理

```typescript
// 複数チャンクを並列処理
const chunks = [chunk1, chunk2 /* ... */];
const result = await extractor.extractBatch(chunks);

if (result.isOk()) {
  const { results, totalEntities } = result.value;
  console.log(`Total: ${totalEntities} entities from ${results.length} chunks`);
}
```

---

## 関連タスク

| タスクID   | 内容             | 状況 |
| ---------- | ---------------- | ---- |
| CONV-06-04 | エンティティ抽出 | ✅   |
| CONV-06-05 | 関係抽出         | 予定 |

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
