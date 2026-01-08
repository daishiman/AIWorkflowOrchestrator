# テストケース一覧 - 関係抽出サービス

## 概要

| 項目           | 内容             |
| -------------- | ---------------- |
| 機能ID         | CONV-06-05       |
| 機能名         | 関係抽出サービス |
| 作成日         | 2026-01-07       |
| 総テストケース | 19件             |

---

## 1. extract メソッド - 正常系

### TC-001: 単一チャンクから関係を抽出する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-001 |
| 対応AC   | AC-001 |
| カテゴリ | 正常系 |
| 優先度   | Must   |

**Given**:

- ContentChunkが存在する
- チャンクに関連するExtractedEntity[]が2件以上存在する
- LLMプロバイダーが正常応答を返す

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- Result.okが返される
- relations配列にExtractedRelationが含まれる
- 各関係にsourceEntity, targetEntity, relationTypeが設定されている
- confidenceが0.0〜1.0の範囲である

---

### TC-002: 指定タイプのみ抽出する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-002 |
| 対応AC   | AC-005 |
| カテゴリ | 正常系 |
| 優先度   | Should |

**Given**:

- ContentChunkとExtractedEntity[]が存在する
- RelationExtractionOptions.typesに["uses", "depends_on"]が指定されている

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- 返される関係はすべてuses または depends_onタイプである
- 他のタイプの関係は含まれない

---

### TC-003: 最小信頼度でフィルタリングする

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-003 |
| 対応AC   | AC-006 |
| カテゴリ | 正常系 |
| 優先度   | Should |

**Given**:

- ContentChunkとExtractedEntity[]が存在する
- RelationExtractionOptions.minConfidenceに0.7が指定されている

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- 返される関係はすべてconfidence >= 0.7である
- 0.7未満の関係は含まれない

---

### TC-004: エビデンス情報を抽出する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-004 |
| 対応AC   | AC-007 |
| カテゴリ | 正常系 |
| 優先度   | Must   |

**Given**:

- ContentChunkに「TypeScriptはMicrosoftが開発した」というテキストが含まれる
- TypeScriptとMicrosoftがエンティティとして抽出されている

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- 抽出された関係にevidence配列が含まれる
- evidenceにchunkId, text, startPosition, endPositionが設定されている
- textには関係を示す原文が含まれる

---

### TC-005: 15種類の関係タイプを分類する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-005 |
| 対応AC   | AC-008 |
| カテゴリ | 正常系 |
| 優先度   | Must   |

**Given**:

- 各関係タイプを示すテキストを含むチャンク

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- relationTypeが正しく分類される
- 分類できない関係は"other"になる

---

### TC-006: 双方向関係を識別する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-006 |
| 対応AC   | AC-009 |
| カテゴリ | 正常系 |
| 優先度   | Should |

**Given**:

- テキストに「ReactとVueは競合関係にある」が含まれる
- ReactとVueがエンティティとして抽出されている

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- competes_with関係が抽出される
- bidirectionalがtrueに設定される

---

## 2. extract メソッド - エッジケース

### TC-007: エンティティが2件未満の場合

| 項目     | 内容         |
| -------- | ------------ |
| ID       | TC-007       |
| 対応AC   | AC-002       |
| カテゴリ | エッジケース |
| 優先度   | Must         |

**Given**:

- ContentChunkが存在する
- チャンクに関連するExtractedEntity[]が1件以下である

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- 成功結果が返される
- relations配列は空である
- processingTimeMsが記録されている

---

### TC-008: 自己参照を除外する

| 項目     | 内容         |
| -------- | ------------ |
| ID       | TC-008       |
| 対応AC   | AC-010       |
| カテゴリ | エッジケース |
| 優先度   | Must         |

**Given**:

- テキストに「TypeScriptはTypeScriptの...」が含まれる
- 同一エンティティが複数回出現

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- sourceEntityとtargetEntityが同じ関係は返されない

---

### TC-009: 空チャンクの処理

| 項目     | 内容         |
| -------- | ------------ |
| ID       | TC-009       |
| 対応AC   | -            |
| カテゴリ | エッジケース |
| 優先度   | Should       |

**Given**:

- chunk.content = ""

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- relations = [] が返される

---

### TC-010: 最大関係数の制限

| 項目     | 内容         |
| -------- | ------------ |
| ID       | TC-010       |
| 対応AC   | -            |
| カテゴリ | エッジケース |
| 優先度   | Should       |

**Given**:

- maxRelationsPerChunk = 5
- LLMが10件の関係を返す

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- relations.length <= 5
- 信頼度の高い関係が優先される

---

## 3. extract メソッド - 異常系

### TC-011: LLMエラー時のハンドリング

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-011 |
| 対応AC   | AC-011 |
| カテゴリ | 異常系 |
| 優先度   | Must   |

**Given**:

- LLMプロバイダーがエラーを返す状態である

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- Result.errが返される
- エラーメッセージにエラーの原因が含まれる

---

### TC-012: LLM応答パースエラー

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-012 |
| 対応AC   | -      |
| カテゴリ | 異常系 |
| 優先度   | Should |

**Given**:

- LLMプロバイダーが不正なJSON形式を返す

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- Result.errが返される
- パースエラーメッセージが含まれる

---

### TC-013: 無効な関係タイプ

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-013 |
| 対応AC   | -      |
| カテゴリ | 異常系 |
| 優先度   | Should |

**Given**:

- LLMが未定義の関係タイプを返す

**When**:

- IRelationExtractor.extract()を呼び出す

**Then**:

- relationTypeは"other"にフォールバックされる

---

## 4. extractBatch メソッド

### TC-014: 複数チャンク一括処理

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-014 |
| 対応AC   | AC-003 |
| カテゴリ | 正常系 |
| 優先度   | Must   |

**Given**:

- ContentChunk[]が3件存在する
- Map<ChunkId, ExtractedEntity[]>でエンティティが関連付けられている

**When**:

- IRelationExtractor.extractBatch()を呼び出す

**Then**:

- BatchRelationExtractionResultが返される
- results配列に各チャンクの抽出結果が含まれる
- totalRelationsに抽出された全関係数が設定されている

---

### TC-015: バッチ処理で部分的な失敗

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-015 |
| 対応AC   | -      |
| カテゴリ | 異常系 |
| 優先度   | Should |

**Given**:

- 3つのチャンクのうち1つでLLMエラー

**When**:

- IRelationExtractor.extractBatch()を呼び出す

**Then**:

- 成功したチャンクの結果は返される
- エラーはログに記録される

---

## 5. mergeRelations メソッド

### TC-016: 重複関係をマージする

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-016 |
| 対応AC   | AC-004 |
| カテゴリ | 正常系 |
| 優先度   | Must   |

**Given**:

- 複数のRelationExtractionResult[]が存在する
- 同じsource-target-typeの関係が複数含まれる

**When**:

- IRelationExtractor.mergeRelations()を呼び出す

**Then**:

- 重複する関係が1つに統合される
- evidence配列に全てのエビデンスが集約される

---

### TC-017: 信頼度は最大値を採用する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-017 |
| 対応AC   | AC-004 |
| カテゴリ | 正常系 |
| 優先度   | Must   |

**Given**:

- 信頼度0.8と0.9の同じ関係

**When**:

- IRelationExtractor.mergeRelations()を呼び出す

**Then**:

- 信頼度0.9の関係が返る

---

### TC-018: 説明は長い方を採用する

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-018 |
| 対応AC   | AC-004 |
| カテゴリ | 正常系 |
| 優先度   | Should |

**Given**:

- 短い説明と長い説明を持つ同じ関係

**When**:

- IRelationExtractor.mergeRelations()を呼び出す

**Then**:

- 長い説明が採用される

---

### TC-019: 双方向関係の正規化

| 項目     | 内容   |
| -------- | ------ |
| ID       | TC-019 |
| 対応AC   | -      |
| カテゴリ | 正常系 |
| 優先度   | Should |

**Given**:

- A→Bの関係とB→Aの双方向関係

**When**:

- IRelationExtractor.mergeRelations()を呼び出す

**Then**:

- 1つの関係にマージされる
- bidirectional=true

---

## サマリー

| カテゴリ     | 件数 |
| ------------ | ---- |
| 正常系       | 10   |
| エッジケース | 4    |
| 異常系       | 5    |
| **合計**     | 19   |
