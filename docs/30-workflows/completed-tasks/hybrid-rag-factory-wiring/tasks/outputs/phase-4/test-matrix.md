# Phase 4: Test Matrix - HybridRAGFactory

## test file

`packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts`

## Test Cases (22 tests)

### createFull() rerankerType variations (4 tests)

| #   | Test                                                       | Status |
| --- | ---------------------------------------------------------- | ------ |
| 1   | rerankerType: 'none' -> NoOpReranker                       | GREEN  |
| 2   | rerankerType: 'cohere' -> CohereReranker(apiKey, {model})  | GREEN  |
| 3   | rerankerType: 'voyage' -> VoyageReranker(apiKey, {})       | GREEN  |
| 4   | rerankerType: 'llm' -> LLMReranker(llmClient, {batchSize}) | GREEN  |

### createFull() CRAG (2 tests)

| #   | Test                                                   | Status |
| --- | ------------------------------------------------------ | ------ |
| 5   | enableCRAG: true -> RelevanceEvaluator + CorrectiveRAG | GREEN  |
| 6   | enableCRAG: false -> crag=null                         | GREEN  |

### createFull() component assembly (4 tests)

| #   | Test                                                    | Status |
| --- | ------------------------------------------------------- | ------ |
| 7   | LLMQueryClassifier + RuleBasedQueryClassifier(fallback) | GREEN  |
| 8   | VectorSearchStrategy + GraphSearchStrategy              | GREEN  |
| 9   | RRFFusion(rrfK)                                         | GREEN  |
| 10  | HybridRAGEngine receives all components                 | GREEN  |

### createFull() validation (6 tests)

| #   | Test                                                | Status |
| --- | --------------------------------------------------- | ------ |
| 11  | cohere: cohereApiKey missing -> throw               | GREEN  |
| 12  | cohere: cohereApiKey whitespace-only (P42) -> throw | GREEN  |
| 13  | voyage: voyageApiKey missing -> throw               | GREEN  |
| 14  | voyage: voyageApiKey whitespace-only (P42) -> throw | GREEN  |
| 15  | llm: rerankerLlmClient missing -> throw             | GREEN  |
| 16  | enableCRAG: cragLlmClient missing -> throw          | GREEN  |

### createLite() (4 tests)

| #   | Test                                       | Status |
| --- | ------------------------------------------ | ------ |
| 17  | RuleBasedQueryClassifier (no LLM)          | GREEN  |
| 18  | NoOpReranker                               | GREEN  |
| 19  | crag = null                                | GREEN  |
| 20  | VectorSearchStrategy + GraphSearchStrategy | GREEN  |

### createForTesting() backward compatibility (2 tests)

| #   | Test                                 | Status |
| --- | ------------------------------------ | ------ |
| 21  | Full mock injection                  | GREEN  |
| 22  | Default fusion/reranker when omitted | GREEN  |

## Updated Existing Tests

- `hybrid-rag-engine.test.ts`: Updated 2 tests (FACTORY_NOT_READY -> validation/instantiation)
  - createFull: Tests cohereApiKey validation error
  - createLite: Tests successful engine creation
