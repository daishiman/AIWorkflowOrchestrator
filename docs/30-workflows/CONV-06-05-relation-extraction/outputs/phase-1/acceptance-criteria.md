# 受け入れ基準 - 関係抽出サービス

## 要件情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| 機能要件ID | CONV-06-05                         |
| 機能名     | 関係抽出サービス                   |
| 親タスク   | CONV-06 (埋め込み生成パイプライン) |
| バージョン | 1.0                                |
| 作成日     | 2026-01-07                         |
| 依存タスク | CONV-06-04 (エンティティ抽出)      |

---

## ユーザーストーリー

```
As a Knowledge Graph構築パイプライン,
I want エンティティ間の関係を自動抽出,
So that グラフベースの知識検索が可能になる.
```

日本語:

```
Knowledge Graph構築パイプラインとして、
エンティティ間の関係を自動抽出したい。
なぜなら、グラフベースの知識検索を実現するためだから。
```

---

## 受け入れ基準

### AC-001: 単一チャンクからの関係抽出

**カテゴリ**: 正常系

```gherkin
Scenario: 単一チャンクから関係を抽出する
  Given ContentChunkが存在する
    And チャンクに関連するExtractedEntity[]が2件以上存在する
  When IRelationExtractor.extract()を呼び出す
  Then Result<RelationExtractionResult, Error>が返される
    And relations配列にExtractedRelationが含まれる
    And 各関係にsourceEntity, targetEntity, relationTypeが設定されている
    And confidenceが0.0〜1.0の範囲である
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-002: エンティティ不足時の空結果

**カテゴリ**: エッジケース

```gherkin
Scenario: エンティティが2件未満の場合
  Given ContentChunkが存在する
    And チャンクに関連するExtractedEntity[]が1件以下である
  When IRelationExtractor.extract()を呼び出す
  Then 成功結果が返される
    And relations配列は空である
    And processingTimeMsが記録されている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-003: バッチ関係抽出

**カテゴリ**: 正常系

```gherkin
Scenario: 複数チャンクから一括で関係を抽出する
  Given ContentChunk[]が複数存在する
    And Map<ChunkId, ExtractedEntity[]>でエンティティが関連付けられている
  When IRelationExtractor.extractBatch()を呼び出す
  Then BatchRelationExtractionResultが返される
    And results配列に各チャンクの抽出結果が含まれる
    And totalRelationsに抽出された全関係数が設定されている
    And uniqueRelationsに重複除去後の関係数が設定されている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-004: 関係のマージ（重複統合）

**カテゴリ**: 正常系

```gherkin
Scenario: 複数チャンクで検出された同一関係をマージする
  Given 複数のRelationExtractionResult[]が存在する
    And 同じsource-target-typeの関係が複数含まれる
  When IRelationExtractor.mergeRelations()を呼び出す
  Then 重複する関係が1つに統合される
    And evidence配列に全てのエビデンスが集約される
    And confidenceは最大値が採用される
    And descriptionは長い方が採用される
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-005: 関係タイプによるフィルタリング

**カテゴリ**: 正常系

```gherkin
Scenario: 指定した関係タイプのみを抽出する
  Given ContentChunkとExtractedEntity[]が存在する
    And RelationExtractionOptions.typesに["uses", "depends_on"]が指定されている
  When IRelationExtractor.extract()を呼び出す
  Then 返される関係はすべてuses または depends_onタイプである
    And 他のタイプの関係は含まれない
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Should

---

### AC-006: 信頼度によるフィルタリング

**カテゴリ**: 正常系

```gherkin
Scenario: 最小信頼度以上の関係のみを抽出する
  Given ContentChunkとExtractedEntity[]が存在する
    And RelationExtractionOptions.minConfidenceに0.7が指定されている
  When IRelationExtractor.extract()を呼び出す
  Then 返される関係はすべてconfidence >= 0.7である
    And 0.7未満の関係は含まれない
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Should

---

### AC-007: エビデンス情報の抽出

**カテゴリ**: 正常系

```gherkin
Scenario: 関係を示すテキスト（エビデンス）を抽出する
  Given ContentChunkに"TypeScriptはMicrosoftが開発した"というテキストが含まれる
    And TypeScriptとMicrosoftがエンティティとして抽出されている
  When IRelationExtractor.extract()を呼び出す
  Then 抽出された関係にevidence配列が含まれる
    And evidenceにchunkId, text, startPosition, endPositionが設定されている
    And textには関係を示す原文が含まれる
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-008: 15種類の関係タイプ分類

**カテゴリ**: 正常系

```gherkin
Scenario Outline: 関係タイプを正しく分類する
  Given テキストに<relationship>が記述されている
    And 関連するエンティティが抽出されている
  When IRelationExtractor.extract()を呼び出す
  Then relationTypeが<expected_type>に分類される

  Examples:
    | relationship                          | expected_type     |
    | "AはBに所属している"                  | belongs_to        |
    | "AはBを使用している"                  | uses              |
    | "AはBに依存している"                  | depends_on        |
    | "AはBによって作成された"              | created_by        |
    | "AはBの一部である"                    | part_of           |
    | "AはBに位置している"                  | located_in        |
    | "AはBの後継である"                    | succeeds          |
    | "AはBを拡張している"                  | extends           |
    | "AはBを実装している"                  | implements        |
    | "AはBと競合している"                  | competes_with     |
    | "AはBと協力している"                  | collaborates_with |
    | "AがBを引き起こす"                    | causes            |
    | "AはBに先行する"                      | precedes          |
    | "AはBに関連している"                  | related_to        |
    | その他の関係                          | other             |
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-009: 双方向関係の識別

**カテゴリ**: 正常系

```gherkin
Scenario: 双方向関係を正しく識別する
  Given テキストに"ReactとVueは競合関係にある"が含まれる
    And ReactとVueがエンティティとして抽出されている
  When IRelationExtractor.extract()を呼び出す
  Then competes_with関係が抽出される
    And bidirectionalがtrueに設定される
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Should

---

### AC-010: 自己参照の除外

**カテゴリ**: エッジケース

```gherkin
Scenario: 同一エンティティ間の関係を除外する
  Given テキストに"TypeScriptはTypeScriptの..."が含まれる
  When IRelationExtractor.extract()を呼び出す
  Then sourceEntityとtargetEntityが同じ関係は返されない
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-011: LLMエラー時のハンドリング

**カテゴリ**: 異常系

```gherkin
Scenario: LLM APIエラー時にエラー結果を返す
  Given LLMプロバイダーがエラーを返す状態である
  When IRelationExtractor.extract()を呼び出す
  Then Result.errが返される
    And エラーメッセージにエラーの原因が含まれる
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-012: ExtractionPipelineとの統合

**カテゴリ**: 統合

```gherkin
Scenario: ExtractionPipelineで関係抽出が実行される
  Given ExtractionPipelineが構成されている
    And IEntityExtractorとIRelationExtractorが注入されている
  When ExtractionPipeline.process()を呼び出す
  Then エンティティ抽出が先に実行される
    And エンティティ結果を使って関係抽出が実行される
    And 結果がEntityRepositoryとRelationRepositoryに保存される
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

## バリデーションルール

### 入力バリデーション

| フィールド            | ルール         | エラーメッセージ                         |
| --------------------- | -------------- | ---------------------------------------- |
| chunk.content         | 必須           | チャンクコンテンツは必須です             |
| entities              | 配列           | エンティティは配列である必要があります   |
| options.minConfidence | 0.0〜1.0       | 信頼度は0.0〜1.0の範囲で指定してください |
| options.types         | RelationType[] | 無効な関係タイプが指定されています       |

### ビジネスルールバリデーション

| ルール             | 条件                   | エラーメッセージ      |
| ------------------ | ---------------------- | --------------------- |
| エンティティ最小数 | entities.length >= 2   | -（空配列を返す）     |
| 最大関係数         | relations.length <= 30 | -（超過分は切り捨て） |

---

## エッジケース

### 境界値

| ケース          | 入力                     | 期待結果             |
| --------------- | ------------------------ | -------------------- |
| エンティティ0件 | entities = []            | relations = []       |
| エンティティ1件 | entities = [entity1]     | relations = []       |
| エンティティ2件 | entities = [e1, e2]      | 関係抽出が実行される |
| 最小信頼度0.0   | minConfidence = 0.0      | 全関係が返される     |
| 最小信頼度1.0   | minConfidence = 1.0      | ほぼ空になる         |
| 最大関係数0     | maxRelationsPerChunk = 0 | relations = []       |

### 特殊ケース

| ケース           | 条件                  | 期待結果             |
| ---------------- | --------------------- | -------------------- |
| 空チャンク       | chunk.content = ""    | relations = []       |
| 日本語テキスト   | 日本語のみのテキスト  | 正常に関係抽出される |
| 混合言語テキスト | 日英混合テキスト      | 正常に関係抽出される |
| 特殊文字含む     | HTML/Markdownタグ含む | 正常に関係抽出される |

---

## 非機能要件

### パフォーマンス

```gherkin
Scenario: 単一チャンク処理の応答時間
  Given 標準的な長さのチャンク（500〜1000文字）
    And 5〜10件のエンティティ
  When IRelationExtractor.extract()を実行する
  Then 処理時間は5000ms以内である
```

```gherkin
Scenario: バッチ処理のスループット
  Given 10件のチャンク
    And 各チャンクに5〜10件のエンティティ
  When IRelationExtractor.extractBatch()を実行する
  Then 処理時間は60000ms以内である
```

### 精度

```gherkin
Scenario: 関係抽出の精度
  Given テスト用のアノテーション済みデータセット
  When 関係抽出を実行する
  Then 適合率（Precision）は70%以上である
    And 再現率（Recall）は60%以上である
```

---

## 完了の定義（DoD）

### コード完了

- [ ] IRelationExtractorインターフェースが定義されている
- [ ] LLMRelationExtractorが実装されている
- [ ] コードレビューが完了している
- [ ] 単体テストが書かれている（カバレッジ80%以上）

### テスト完了

- [ ] すべての受け入れ基準がテストされている
- [ ] 自動テストが追加されている
- [ ] エッジケーステストが完了している

### ドキュメント完了

- [ ] JSDocコメントが記述されている
- [ ] APIドキュメントが更新されている

### 統合完了

- [ ] ExtractionPipelineとの統合が動作する
- [ ] EntityExtractorとの連携が動作する

---

## テストケースへのマッピング

| 受け入れ基準 | テストケースID                           | テストタイプ | 自動化 |
| ------------ | ---------------------------------------- | ------------ | ------ |
| AC-001       | relation-extractor.test.ts#extract       | 単体テスト   | ✅     |
| AC-002       | relation-extractor.test.ts#empty         | 単体テスト   | ✅     |
| AC-003       | relation-extractor.test.ts#batch         | 単体テスト   | ✅     |
| AC-004       | relation-extractor.test.ts#merge         | 単体テスト   | ✅     |
| AC-005       | relation-extractor.test.ts#filter        | 単体テスト   | ✅     |
| AC-006       | relation-extractor.test.ts#confidence    | 単体テスト   | ✅     |
| AC-007       | relation-extractor.test.ts#evidence      | 単体テスト   | ✅     |
| AC-008       | relation-extractor.test.ts#types         | 単体テスト   | ✅     |
| AC-009       | relation-extractor.test.ts#bidirectional | 単体テスト   | ✅     |
| AC-010       | relation-extractor.test.ts#self-ref      | 単体テスト   | ✅     |
| AC-011       | relation-extractor.test.ts#error         | 単体テスト   | ✅     |
| AC-012       | extraction-pipeline.test.ts#integration  | 結合テスト   | ✅     |

---

## 承認

| 役割               | 氏名 | 日付       | 承認 |
| ------------------ | ---- | ---------- | ---- |
| プロダクトオーナー |      | 2026-01-07 | [ ]  |
| 開発リード         |      | 2026-01-07 | [ ]  |
| QAリード           |      | 2026-01-07 | [ ]  |
