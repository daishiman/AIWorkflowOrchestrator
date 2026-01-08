# 実装サマリー - 関係抽出サービス

## 概要

| 項目    | 内容                    |
| ------- | ----------------------- |
| 機能ID  | CONV-06-05              |
| 機能名  | 関係抽出サービス        |
| 作成日  | 2026-01-07              |
| Phase   | 5 - 実装                |
| TDD状態 | Red → Green（実装完了） |

---

## 1. 実装ファイル一覧

### 1.1 新規作成ファイル

| ファイル                                             | 行数 | 概要                           |
| ---------------------------------------------------- | ---- | ------------------------------ |
| `services/extraction/relation-extractor.ts`          | ~330 | LLMRelationExtractor実装       |
| `services/extraction/prompts/relation-extraction.ts` | ~120 | 関係抽出プロンプトテンプレート |

### 1.2 修正ファイル

| ファイル                            | 変更内容                               |
| ----------------------------------- | -------------------------------------- |
| `services/extraction/types.ts`      | 関係抽出型定義・Zodスキーマ追加        |
| `services/extraction/interfaces.ts` | IRelationExtractorインターフェース追加 |
| `services/extraction/index.ts`      | 関係抽出エクスポート追加               |

---

## 2. 型定義（types.ts）

### 2.1 追加した型

```typescript
// 関係タイプ（15種類）
export const RelationTypes = {
  BELONGS_TO: "belongs_to",
  RELATED_TO: "related_to",
  CAUSES: "causes",
  DEPENDS_ON: "depends_on",
  CREATED_BY: "created_by",
  USES: "uses",
  PART_OF: "part_of",
  LOCATED_IN: "located_in",
  SUCCEEDS: "succeeds",
  PRECEDES: "precedes",
  COMPETES_WITH: "competes_with",
  COLLABORATES_WITH: "collaborates_with",
  IMPLEMENTS: "implements",
  EXTENDS: "extends",
  OTHER: "other",
} as const;

export type RelationType = (typeof RelationTypes)[keyof typeof RelationTypes];
```

### 2.2 追加したZodスキーマ

| スキーマ                              | 用途                       |
| ------------------------------------- | -------------------------- |
| `RelationTypeSchema`                  | 関係タイプのバリデーション |
| `RelationEvidenceSchema`              | エビデンス情報             |
| `ExtractedRelationSchema`             | 抽出された関係             |
| `RelationExtractionOptionsSchema`     | 抽出オプション             |
| `RelationExtractionResultSchema`      | 単一チャンク抽出結果       |
| `BatchRelationExtractionResultSchema` | バッチ抽出結果             |
| `LLMRelationResponseSchema`           | LLM応答パース用            |

---

## 3. インターフェース（interfaces.ts）

### 3.1 IRelationExtractor

```typescript
export interface IRelationExtractor {
  // 単一チャンクから関係を抽出
  extract(
    chunk: Chunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<RelationExtractionResult, Error>>;

  // 複数チャンクからバッチ抽出
  extractBatch(
    chunks: Chunk[],
    entitiesByChunk: Map<string, ExtractedEntity[]>,
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  // 複数結果の関係をマージ
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
```

---

## 4. 実装詳細（relation-extractor.ts）

### 4.1 LLMRelationExtractor クラス

| メソッド         | 機能                                             |
| ---------------- | ------------------------------------------------ |
| `extract`        | 単一チャンクからエンティティ間の関係を抽出       |
| `extractBatch`   | 複数チャンクを一括処理                           |
| `mergeRelations` | 重複関係をマージ（エビデンス統合、信頼度最大化） |

### 4.2 ユーティリティ関数

| 関数                    | 機能                                        |
| ----------------------- | ------------------------------------------- |
| `mergeRelationOptions`  | オプションとデフォルト値のマージ            |
| `isValidRelationType`   | 関係タイプの有効性チェック                  |
| `normalizeRelationType` | 無効タイプをotherにフォールバック           |
| `getRelationKey`        | 関係の一意キー生成                          |
| `getReverseRelationKey` | 逆方向関係キー生成                          |
| `deduplicateRelations`  | 重複関係の統合                              |
| `mergeRelation`         | 2つの関係のマージ（信頼度/説明/エビデンス） |

### 4.3 抽出フロー

```
1. エンティティ数チェック（2件未満 → 空結果）
2. 空チャンクチェック
3. プロンプト生成（buildRelationExtractionPrompt）
4. LLM呼び出し
5. JSON応答パース（Zodバリデーション）
6. フィルタリング:
   - 自己参照除外
   - 信頼度フィルタ
   - タイプフィルタ
   - エンティティ存在チェック
7. 信頼度ソート＆最大数制限
8. 結果返却
```

---

## 5. プロンプトテンプレート（relation-extraction.ts）

### 5.1 プロンプト構造

```
## Instructions
- 15種類の関係タイプに分類
- 信頼度スコア付与
- 双方向関係の識別
- エビデンス抽出

## Entities to Consider
- エンティティリスト

## Allowed Relation Types
- 各タイプの説明

## Output Format
- JSON形式の応答仕様

## Examples
- 具体例

## Text to Analyze
- 処理対象テキスト
```

### 5.2 関係タイプ説明（RELATION_TYPE_DESCRIPTIONS）

15種類の関係タイプについて、具体例を含む説明を提供。

---

## 6. 受け入れ基準対応

| AC     | 実装状況 | 対応箇所                      |
| ------ | -------- | ----------------------------- |
| AC-001 | ✅       | extract()メソッド             |
| AC-002 | ✅       | エンティティ2件未満チェック   |
| AC-003 | ✅       | extractBatch()メソッド        |
| AC-004 | ✅       | mergeRelations()メソッド      |
| AC-005 | ✅       | types オプションフィルタ      |
| AC-006 | ✅       | minConfidence フィルタ        |
| AC-007 | ✅       | evidence 配列抽出             |
| AC-008 | ✅       | RelationTypes (15種類)        |
| AC-009 | ✅       | bidirectional フラグ          |
| AC-010 | ✅       | 自己参照除外ロジック          |
| AC-011 | ✅       | Result.err エラーハンドリング |
| AC-012 | 🔄       | Phase 7で統合テスト実装       |

---

## 7. 使用スキル

| スキル                        | 適用結果 |
| ----------------------------- | -------- |
| clean-architecture-principles | success  |
| interface-segregation         | success  |
| type-safety-patterns          | success  |
| zod-validation                | success  |
| error-handling-patterns       | success  |

---

## 8. 完了条件チェック

| 条件                                | 状態 |
| ----------------------------------- | ---- |
| 型定義・Zodスキーマ実装             | ✅   |
| IRelationExtractor インターフェース | ✅   |
| LLMRelationExtractor 実装           | ✅   |
| プロンプトテンプレート              | ✅   |
| エクスポート追加                    | ✅   |
| 型チェック通過                      | ✅   |

---

## 9. 次Phaseへの引き継ぎ

### Phase 6（テスト拡充）

- 実装に合わせてテストコードを更新
- placeholder assertions を実際のテストに置換
- カバレッジ80%以上を目指す

### Phase 7（統合）

- ExtractionPipelineとの統合
- EntityExtractor → RelationExtractor 連携
- Repository保存統合

---

## 10. 実装済みファイルパス

```
packages/shared/src/services/extraction/
├── types.ts                      # 型定義（関係抽出追加）
├── interfaces.ts                 # インターフェース（IRelationExtractor追加）
├── relation-extractor.ts         # LLMRelationExtractor実装【新規】
├── index.ts                      # エクスポート（関係抽出追加）
└── prompts/
    └── relation-extraction.ts    # 関係抽出プロンプト【新規】
```
