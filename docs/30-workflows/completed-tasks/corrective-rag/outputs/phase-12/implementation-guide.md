# Corrective RAG (CRAG) 実装ガイド

## Part 1: 概念的説明（中学生でもわかる版）

### CRAGとは何か

**Corrective RAG（CRAG）**は、「検索結果の自己修正システム」です。

検索エンジンで何かを調べたとき、上に出てきた結果が必ずしも良い答えとは限りませんよね。CRAGは「この検索結果は本当に質問に答えているか？」をAIが自動でチェックして、ダメなら別の方法で補強してくれるシステムです。

### 3段階評価の考え方

CRAGは検索結果を3つのグループに分けます：

| 判定          | 意味                       | 対応                   |
| ------------- | -------------------------- | ---------------------- |
| **Correct**   | バッチリ！質問に合っている | そのまま使う           |
| **Incorrect** | ダメ！全然関係ない         | Web検索で補強する      |
| **Ambiguous** | 微妙...一部だけ使える      | いいものだけ選んで使う |

### なぜCRAGが必要なのか

普通の検索システムは「検索して終わり」です。でも実際には：

- キーワードが曖昧だと関係ない結果が返ってくる
- データベースに新しい情報がないことがある
- 上位の結果が必ずしも正しいとは限らない

CRAGがあると、こうした問題を自動的に検出して対処できます。

---

## Part 2: 技術的詳細（開発者向け）

### インストール

CRAGモジュールは `@repo/shared` パッケージに含まれています。

```typescript
import {
  CorrectiveRAG,
  RelevanceEvaluator,
} from "@repo/shared/services/search/crag";
```

### 基本的な使い方

#### 最小構成

```typescript
// 1. LLMクライアントを用意（ILLMClient実装）
const llmClient: ILLMClient = {
  complete: async ({ prompt, maxTokens, temperature }) => {
    // LLM APIを呼び出して結果を返す
    return ok(llmResponse);
  },
};

// 2. 評価器を作成
const evaluator = new RelevanceEvaluator(llmClient);

// 3. CRAGを作成（Web検索なし）
const crag = new CorrectiveRAG(evaluator, null);

// 4. 処理を実行
const result = await crag.process(query, fusedSearchResults);

if (result.success) {
  console.log(result.data.evaluation.action); // "correct" | "incorrect" | "ambiguous"
  console.log(result.data.results); // 補正後の検索結果
}
```

### オプション設定

#### RelevanceEvaluator オプション

```typescript
const evaluator = new RelevanceEvaluator(llmClient, {
  maxEvaluate: 5, // 評価する最大結果数（デフォルト: 5）
  correctThreshold: 0.7, // "correct"判定の閾値（デフォルト: 0.7）
  incorrectThreshold: 0.3, // "incorrect"判定の閾値（デフォルト: 0.3）
});
```

| オプション           | デフォルト | 説明                                |
| -------------------- | ---------- | ----------------------------------- |
| `maxEvaluate`        | 5          | LLMで評価する結果数（コスト制御用） |
| `correctThreshold`   | 0.7        | この値以上で"correct"判定           |
| `incorrectThreshold` | 0.3        | この値以下で"incorrect"判定         |

#### CorrectiveRAG オプション

```typescript
const crag = new CorrectiveRAG(evaluator, webSearcher, {
  enableWebSearch: true, // Web検索を有効にする
  enableRefinement: false, // Knowledge Refinementを有効にする
  ambiguousFilterThreshold: 0.4, // Ambiguous時のフィルタ閾値
  minResultsBeforeWebSearch: 3, // Web検索前の最小結果数
  webSearchLimit: 5, // Web検索結果数上限
});
```

| オプション                  | デフォルト | 説明                               |
| --------------------------- | ---------- | ---------------------------------- |
| `enableWebSearch`           | false      | incorrect時にWeb検索で補強するか   |
| `enableRefinement`          | false      | 結果をスコア順にソートするか       |
| `ambiguousFilterThreshold`  | 0.4        | この閾値未満の結果をフィルタリング |
| `minResultsBeforeWebSearch` | 3          | フィルタ後この数未満ならWeb検索    |
| `webSearchLimit`            | 5          | Web検索の結果数上限                |

### Web検索連携

IWebSearcherインターフェースを実装して注入します：

```typescript
interface IWebSearcher {
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

// 実装例
const webSearcher: IWebSearcher = {
  search: async (query, limit) => {
    const results = await mySearchAPI.search(query, { limit });
    return ok(
      results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
      })),
    );
  },
};

// Web検索を有効にしてCRAGを作成
const crag = new CorrectiveRAG(evaluator, webSearcher, {
  enableWebSearch: true,
});
```

### エラーハンドリング

CRAGは例外をthrowせず、Result型でエラーを返します：

```typescript
const result = await crag.process(query, searchResults);

if (!result.success) {
  // エラー処理
  console.error("CRAG processing failed:", result.error.message);
  // フォールバック処理を実行
  return fallbackResponse(searchResults);
}

// 成功時の処理
const { results, evaluation, augmentedContext } = result.data;
```

### 出力の型

```typescript
interface CRAGResult {
  results: FusedSearchResult[]; // 補正後の検索結果
  evaluation: {
    relevanceScore: number; // 関連性スコア（0-1）
    action: "correct" | "incorrect" | "ambiguous";
    corrections: CorrectionAction[]; // 実行された補正アクション
  };
  augmentedContext?: string; // Web検索結果（incorrect/ambiguous時）
}
```

### トラブルシューティング

| 問題                             | 原因                    | 解決方法                         |
| -------------------------------- | ----------------------- | -------------------------------- |
| すべてincorrect判定になる        | LLMの評価プロンプト問題 | LLMレスポンスをログで確認        |
| Web検索が実行されない            | enableWebSearchがfalse  | オプションを確認                 |
| パース失敗でフォールバックばかり | LLMがJSONを返していない | maxTokensを増やす/プロンプト確認 |
| Result.err()が返される           | LLM API接続エラー       | APIキー/エンドポイント確認       |

### 統合テスト情報

#### LLM連携の設定

```typescript
// ILLMClient実装が必要
// temperature=0（決定論的出力）を推奨
// maxTokens=500が設定される
```

#### Web検索連携

```typescript
// IWebSearcher実装をコンストラクタに注入
// enableWebSearch=trueで有効化
```

---

**作成日時**: 2026-01-17
**Phase**: 12 (ドキュメント更新)
**バージョン**: 1.0.0
