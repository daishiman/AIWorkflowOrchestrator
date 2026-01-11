# クエリ分類器 - 実装ガイド

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 機能名   | クエリ分類器（Query Classifier） |
| タスクID | CONV-07-01                       |
| 作成日   | 2026-01-11                       |
| 対象読者 | 開発者・技術者・学習者           |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. クエリ分類器って何？

### 1.1 身近な例で考えてみよう

図書館の司書さんを想像してください。

```
あなた: 「この本のどこにReactの説明がありますか？」
司書:   「それは特定の情報を探す質問ですね。索引を使いましょう」
        → キーワード検索が得意

あなた: 「この本は何について書かれていますか？」
司書:   「全体像を知りたいのですね。目次と要約を見ましょう」
        → グラフ検索（コミュニティ）が得意

あなた: 「ReactとVueの違いは何ですか？」
司書:   「比較したいのですね。両方の章を見比べましょう」
        → 関係性検索が得意
```

クエリ分類器は、この「司書さん」の役割を果たします。質問の種類を判断して、最適な検索方法を選びます。

### 1.2 なぜ必要なの？

検索の方法は1つではありません。質問の種類によって、最適な方法が異なります。

| 質問の種類           | 最適な方法           | なぜ？                           |
| -------------------- | -------------------- | -------------------------------- |
| 「Reactとは？」      | キーワード＋意味検索 | 特定の言葉を含む箇所を見つけたい |
| 「全体のテーマは？」 | グラフ検索           | 全体の構造・つながりを把握したい |
| 「AとBの違いは？」   | グラフ検索（関係性） | 2つの関係を比較したい            |

間違った方法で検索すると、良い結果が出ません。例えば「全体のテーマ」を聞いているのに、キーワードで「テーマ」を検索しても、本当に知りたい「全体像」は得られません。

### 1.3 今回作ったもの

| 日本語名           | 英語名                   | 役割                                     |
| ------------------ | ------------------------ | ---------------------------------------- |
| ルールベース分類器 | RuleBasedQueryClassifier | パターンマッチングで高速に分類（保険用） |
| LLM分類器          | LLMQueryClassifier       | AIで高精度に分類（メイン）               |
| 検索重み           | SearchWeights            | どの検索方法をどれくらい使うか決める     |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
ユーザーの質問
      ↓
┌─────────────────┐
│  クエリ分類器   │←── 「この質問は何を求めている？」
└─────────────────┘
      ↓
  質問タイプを判定
  (local / global / relationship)
      ↓
┌─────────────────┐
│  検索重み決定   │←── 「どの検索方法をどれくらい使う？」
└─────────────────┘
      ↓
  Keyword: 35%, Semantic: 35%, Graph: 30% など
      ↓
  3つの検索エンジンに渡す
```

### 2.2 3種類の質問タイプ

**local（ローカル）** - 特定の情報を探す

```
例: 「Reactとは何ですか？」「このAPIの使い方は？」
→ 辞書で言葉を調べるイメージ
```

**global（グローバル）** - 全体を把握する

```
例: 「全体のテーマは何ですか？」「概要を教えて」
→ 本の目次を見るイメージ
```

**relationship（リレーションシップ）** - 関係性を調べる

```
例: 「ReactとVueの違いは？」「AはBとどう関係している？」
→ 2冊の本を比較するイメージ
```

### 2.3 なぜ2つの分類器があるの？

```
LLM分類器（メイン）
  ├── 長所: 高精度、文脈を理解できる
  └── 短所: 遅い、エラーが起こる可能性

ルールベース分類器（バックアップ）
  ├── 長所: 高速、安定している
  └── 短所: パターンにない質問は苦手
```

**なぜこの設計？**

- LLMが失敗してもサービスを止めない
- 両方の長所を活かす
- 信頼性とパフォーマンスを両立

---

## 3. 作ったものの全体像

```
┌─────────────────────────────────────────────────┐
│                  HybridRAG検索                   │
├─────────────────────────────────────────────────┤
│                                                  │
│   ユーザーの質問                                  │
│         │                                        │
│         ▼                                        │
│   ┌─────────────────┐                            │
│   │  クエリ分類器    │←── 質問タイプを判定        │
│   └────────┬────────┘                            │
│            │                                     │
│            ▼                                     │
│   ┌─────────────────┐                            │
│   │  検索重み決定    │←── K:S:G比率を決定        │
│   └────────┬────────┘                            │
│            │                                     │
│   ┌────────┴────────┐                            │
│   ▼        ▼        ▼                            │
│ Keyword  Semantic  Graph                         │
│  検索      検索      検索                         │
└─────────────────────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
packages/shared/src/services/search/
├── types.ts                      # 型定義（QueryType, SearchWeights, スキーマ）
├── rule-based-query-classifier.ts # ルールベース実装（約400行）
├── llm-query-classifier.ts       # LLMベース実装（約130行）
├── index.ts                      # バレルエクスポート
└── __tests__/                    # テストファイル（7ファイル、186テスト）
    ├── types.test.ts             # 型・スキーマテスト（26テスト）
    ├── rule-based-query-classifier.test.ts  # ルールベーステスト（47テスト）
    ├── llm-query-classifier.test.ts         # LLMテスト（12テスト）
    ├── query-classifier.integration.test.ts # 統合テスト（11テスト）
    ├── boundary.test.ts          # 境界値テスト（12テスト）
    ├── error-handling.test.ts    # 異常系テスト（17テスト）
    └── pattern-coverage.test.ts  # パターン網羅テスト（61テスト）
```

### 1.2 設計判断の根拠

| 設計判断       | 選択肢                   | 採用理由                                                                                                            |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| ファイル分割   | 単一ファイル vs 分割     | **分割**を採用。単一責務原則に従い、各クラスの責務を明確化                                                          |
| 共通基底クラス | 作成 vs インターフェース | **インターフェース**を採用。現在2クラスのみで、getSearchWeightsは2行の単純実装。YAGNI原則に従い過剰な抽象化を避けた |
| 定数配置       | 別ファイル vs types.ts内 | **types.ts内**に配置。SEARCH_WEIGHTSは型定義と密接に関連しており、分離による複雑性増加がメリットを上回る            |
| パターン定義   | 別ファイル vs クラス内   | **クラス内**に配置。パターンはルールベース分類器の実装詳細であり、局所性の利点が大きい                              |

---

## 2. 型定義詳細（設計理由付き）

### 2.1 QueryType

```typescript
export const QUERY_TYPES = [
  "local",
  "global",
  "relationship",
  "hybrid",
] as const;
export type QueryType = (typeof QUERY_TYPES)[number];
// なぜ4種類:
// - local: 特定エンティティへの質問（最も一般的）
// - global: 全体概要への質問（コミュニティ検索が有効）
// - relationship: 比較・関係性の質問（グラフ検索が有効）
// - hybrid: 判断困難時のフォールバック（バランス良く検索）
// なぜas const: リテラル型として推論させ、型安全性を確保
```

### 2.2 SearchWeights

```typescript
export interface SearchWeights {
  keyword: number; // Keyword検索の重み（0-1）
  semantic: number; // Semantic検索の重み（0-1）
  graph: number; // Graph検索の重み（0-1）
}
// なぜ3つの重み: HybridRAGの3種類の検索エンジンに対応
// なぜnumber型: 0-1の範囲で柔軟に調整可能
// 制約: 合計が1.0になること（Zodスキーマで検証）

export const SEARCH_WEIGHTS: Record<QueryType, SearchWeights> = {
  local: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
  // なぜこの比率: 特定情報はキーワードと意味の両方で探すと精度が高い

  global: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
  // なぜグラフ重視: 全体構造はコミュニティ（グラフ）で把握するのが効果的

  relationship: { keyword: 0.2, semantic: 0.2, graph: 0.6 },
  // なぜグラフ最重視: 関係性はグラフのエッジ（つながり）で表現される

  hybrid: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
  // なぜ均等: 判断困難時はバランス良く検索して、RRFで統合
};
```

### 2.3 QueryClassification

```typescript
export interface QueryClassification {
  type: QueryType; // 分類結果
  confidence: number; // 信頼度（0.0-1.0）
  entities: string[]; // 抽出されたエンティティ
  reasoning?: string; // 分類理由（LLM分類時のみ）
}
// なぜconfidence: 信頼度が低い場合にhybridにフォールバックできる
// なぜentities: relationship分類時に比較対象を特定するため
// なぜreasoningがオプショナル: ルールベースでは不要
```

### 2.4 Zodスキーマ

```typescript
export const QueryClassificationSchema = z.object({
  type: z.enum(QUERY_TYPES),
  confidence: z.number().min(0).max(1),
  entities: z.array(z.string()),
  reasoning: z.string().optional(),
});
// なぜZod:
// - ランタイムでの型検証（LLMレスポンスの検証に必須）
// - TypeScriptの型と同期（z.inferで型生成）
// - バリデーションエラーの詳細なメッセージ
```

---

## 3. IQueryClassifierインターフェース

```typescript
export interface IQueryClassifier {
  /**
   * クエリを分類する
   * @param query 検索クエリ文字列（1-5000文字）
   * @returns 分類結果（タイプ、信頼度、抽出エンティティ）
   */
  classify(query: string): Promise<QueryClassification>;
  // なぜPromise: LLM分類器は非同期処理が必要
  // なぜ5000文字制限: 極端に長いクエリはLLMのコンテキスト制限に抵触

  /**
   * クエリタイプに応じた検索重みを取得
   * @param type クエリタイプ
   * @returns 検索重み（keyword/semantic/graph）
   */
  getSearchWeights(type: QueryType): SearchWeights;
  // なぜインターフェースに含める: 分類と重み取得は密接に関連
  // なぜSEARCH_WEIGHTS定数を使用: 一貫性を保証
}
```

---

## 4. ルールベース分類器の実装詳細

### 4.1 パターンマッチング設計

```typescript
// グローバルパターン（15種類）
private readonly globalPatterns = [
  /全体(の|について|像|構成)/,    // 日本語
  /概要|概略|まとめ/,
  /主(な|要な)?テーマ/,
  /what.*about|overview|summary/i,  // 英語
  // ...
];
// なぜこれらのパターン: 手動テストで収集した実際のクエリパターン
// なぜ日英両方: 多言語対応のため

// 関係性パターン（10種類）
private readonly relationshipPatterns = [
  /(.+)(と|versus|vs\.?|compared to)(.+)(の)?(違い|差|比較)/i,
  /compare\s+(.+)\s+(and|with|to)\s+(.+)/i,
  // ...
];
// なぜキャプチャグループ: エンティティ抽出に使用
```

### 4.2 スコアリングアルゴリズム

```typescript
private calculateTypeScore(query: string): { type: QueryType; confidence: number } {
  const scores = {
    global: this.matchPatterns(query, this.globalPatterns),
    relationship: this.matchPatterns(query, this.relationshipPatterns),
    local: 0.5,  // デフォルト（パターンなし）
  };
  // なぜlocalがデフォルト: 最も一般的なクエリタイプ
  // なぜ0.5: パターンマッチしたタイプより低く、しかし極端に低くない

  // 最高スコアのタイプを選択
  const maxScore = Math.max(...Object.values(scores));
  const maxType = Object.entries(scores).find(([_, s]) => s === maxScore)?.[0];

  // 信頼度が閾値未満ならhybridにフォールバック
  if (maxScore < this.confidenceThreshold) {
    return { type: 'hybrid', confidence: maxScore };
  }
  // なぜフォールバック: 判断に自信がない場合は安全策
}
```

### 4.3 キーワード抽出

```typescript
private extractKeywords(query: string): string[] {
  const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query);
  const stopWords = isJapanese ? JAPANESE_STOP_WORDS : ENGLISH_STOP_WORDS;
  const words = isJapanese
    ? this.tokenizeJapanese(query)
    : query.split(/\s+/);

  return words
    .map((word) => word.replace(/^[?？!！。、,.]+|[?？!！。、,.]+$/g, ""))
    .filter((word) => word.length > 1)
    .filter((word) => !stopWords.has(word.toLowerCase()));
    // なぜlowerCase比較: 大文字小文字を区別せずストップワード除去
    // なぜ元のケースを保持: エンティティ名は元の形式で返す
}
// なぜこの実装が必要だったか:
// 初期実装では.toLowerCase()を適用してからストップワード除去していたが、
// テストで「React」が「react」になる問題が発覚。修正して元のケースを保持。
```

---

## 5. LLM分類器の実装詳細

### 5.1 フォールバック設計

```typescript
export class LLMQueryClassifier implements IQueryClassifier {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackClassifier: IQueryClassifier, // ルールベース
  ) {}
  // なぜフォールバック注入: 依存性逆転原則に従い、テスト容易性を確保

  async classify(query: string): Promise<QueryClassification> {
    try {
      const llmResult = await this.callLLM(query);
      const parsed = this.parseResponse(llmResult);
      const validated = QueryClassificationSchema.parse(parsed);

      if (validated.confidence < this.confidenceThreshold) {
        return this.fallbackClassifier.classify(query);
      }
      return validated;
    } catch (error) {
      // フォールバック: LLMエラー、パースエラー、バリデーションエラー
      return this.fallbackClassifier.classify(query);
    }
  }
}
// なぜこの設計:
// - LLMは高精度だが不安定（ネットワークエラー、レート制限、異常レスポンス）
// - サービスを止めないためにフォールバックが必須
// - 信頼度が低い場合もフォールバック（LLMが自信がない場合）
```

---

## 6. 検索重みの設計理由

| タイプ       | K:S:G          | 設計根拠                                                                                                         |
| ------------ | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| local        | 0.35:0.35:0.30 | 特定エンティティの検索では、キーワード一致（K）と意味的類似性（S）の両方が重要。グラフ（G）は補助的に使用。      |
| global       | 0.20:0.30:0.50 | 全体概要の把握には、コミュニティ構造（G）が最も有効。キーワード（K）は補助的。                                   |
| relationship | 0.20:0.20:0.60 | 関係性・比較はグラフのエッジ（G）で表現される。K/Sは補助的。                                                     |
| hybrid       | 0.33:0.33:0.34 | 判断困難時は均等に検索し、RRFアルゴリズムで統合。わずかにGを重くしているのは、グラフ検索が多様な結果を返すため。 |

---

## 7. テスト構成

| テストファイル                       | テスト数 | カバー範囲                       |
| ------------------------------------ | -------- | -------------------------------- |
| types.test.ts                        | 26       | 型スキーマ、バリデーション       |
| rule-based-query-classifier.test.ts  | 47       | パターンマッチング、スコアリング |
| llm-query-classifier.test.ts         | 12       | LLM連携、フォールバック          |
| query-classifier.integration.test.ts | 11       | エンドツーエンド統合             |
| boundary.test.ts                     | 12       | 境界値（空文字、長文）           |
| error-handling.test.ts               | 17       | 異常系（絵文字、特殊文字）       |
| pattern-coverage.test.ts             | 61       | パターン網羅                     |
| **合計**                             | **186**  |                                  |

### カバレッジ

| メトリクス        | 結果   | 目標 |
| ----------------- | ------ | ---- |
| Line Coverage     | 94.13% | 80%+ |
| Branch Coverage   | 92.18% | 60%+ |
| Function Coverage | 95.23% | 80%+ |

---

## 8. 使用例

### 8.1 基本的な使い方

```typescript
import {
  RuleBasedQueryClassifier,
  LLMQueryClassifier,
  SEARCH_WEIGHTS,
} from "@repo/shared/services/search";

// ルールベース分類器（高速、フォールバック用）
const ruleBasedClassifier = new RuleBasedQueryClassifier();

// 分類実行
const result = await ruleBasedClassifier.classify("Reactとは何ですか？");
// => { type: 'local', confidence: 0.8, entities: ['React'] }

// 検索重み取得
const weights = ruleBasedClassifier.getSearchWeights(result.type);
// => { keyword: 0.35, semantic: 0.35, graph: 0.30 }
```

### 8.2 LLM分類器の使用

```typescript
// LLMベース分類器（高精度）
const llmClassifier = new LLMQueryClassifier(llmProvider, ruleBasedClassifier);

const llmResult = await llmClassifier.classify("ReactとVueの違いを教えて");
// => {
//      type: 'relationship',
//      confidence: 0.95,
//      entities: ['React', 'Vue'],
//      reasoning: 'クエリは2つのフレームワークの比較を求めている'
//    }
```

---

## 9. 使用上の注意

### 9.1 クエリ長の制限

```typescript
// ❌ 使用禁止（極端に長いクエリ）
const tooLong = "a".repeat(10000);
await classifier.classify(tooLong); // パフォーマンス低下

// ⭕ 正しい使い方（適切な長さ）
const query = "Reactとは何ですか？";
await classifier.classify(query);
```

### 9.2 信頼度の確認

```typescript
const result = await classifier.classify(query);

if (result.confidence < 0.6) {
  // 信頼度が低い場合は、結果を慎重に扱う
  console.warn(`低信頼度: ${result.confidence}`);
}
```

---

## 10. 将来の拡張（検討事項）

Phase 8のリファクタリングで検討された将来の拡張項目:

| 拡張内容           | トリガー条件                         | 対応方針                                       |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| 共通基底クラス作成 | 3つ目以降の分類器実装時              | IQueryClassifierを実装する共通基底クラスを検討 |
| utils.ts抽出       | 他モジュールでキーワード抽出が必要時 | extractKeywordsを共通ユーティリティに抽出      |
| patterns.ts分離    | パターン定義が10+になった場合        | パターン定義を別ファイルに分離                 |

**現時点では実装不要（YAGNI原則）**

---

## 11. 用語集

| 用語                     | 読み方                             | 説明                                                               |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| QueryType                | クエリタイプ                       | クエリの分類種別（local/global/relationship/hybrid）               |
| SearchWeights            | サーチウェイト                     | 3種類の検索エンジン（K/S/G）への重み配分                           |
| IQueryClassifier         | アイクエリクラシファイア           | クエリ分類器のインターフェース。classifyとgetSearchWeightsを定義   |
| RuleBasedQueryClassifier | ルールベースドクエリクラシファイア | 正規表現パターンマッチングによる高速な分類器                       |
| LLMQueryClassifier       | エルエルエムクエリクラシファイア   | LLMを使った高精度分類器。エラー時にフォールバック                  |
| Fallback                 | フォールバック                     | エラー時や低信頼度時の代替処理。LLM→ルールベースへの切り替え       |
| Confidence               | コンフィデンス                     | 分類結果の信頼度（0.0-1.0）。閾値未満でhybridにフォールバック      |
| HybridRAG                | ハイブリッドラグ                   | Keyword/Semantic/Graphの3種類の検索を統合するRAGアーキテクチャ     |
| Zod                      | ゾッド                             | TypeScript向けスキーマ検証ライブラリ。ランタイムでの型安全性を提供 |
| YAGNI                    | ヤグニ                             | "You Aren't Gonna Need It"の略。不要な機能は実装しない原則         |

---

## 12. 関連ドキュメント

- [検索クエリ・結果型定義](/.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md)
- [RAGアーキテクチャ](/.claude/skills/aiworkflow-requirements/references/architecture-rag.md)
- [設計書](../phase-2/design.md)
- [要件定義書](../phase-1/requirements.md)
- [リファクタリングログ](../phase-8/refactoring-log.md)
