# HybridRAGFactory communitySummarizer Config 拡張

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-RAG-08-008                                                                     |
| タスク名     | HybridRAGFactory communitySummarizer Config 拡張                                  |
| 分類         | 機能改善                                                                          |
| 対象機能     | HybridRAG 検索パイプライン - Factory / GraphSearchStrategy                        |
| 優先度       | 中                                                                                |
| 見積もり規模 | S（0.5〜1日）                                                                     |
| ステータス   | 未実施                                                                            |
| 発見元       | UT-RAG-08-002 Phase 3 多角的チェック観点 / Phase 10 FU-03 formalize（2026-03-20） |
| 発見日       | 2026-03-20                                                                        |
| ブロック対象 | なし                                                                              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`HybridRAGFactory.createFull()` では `GraphSearchStrategy` に `communitySummarizer` を渡すための Config フィールドが未定義である。`GraphSearchStrategy` が Global クエリ（`queryType === "global"`）に対応するには community summary を生成する `ICommunitySummarizer` が必要だが、現状の `FullHybridRAGConfig` にはこのフィールドが存在しない。

### 1.2 問題点・課題

- `FullHybridRAGConfig` に `communitySummarizer?: ICommunitySummarizer` フィールドがないため、Factory から `GraphSearchStrategy` へ community summarizer を渡す経路がない。
- UT-RAG-08-006（queryType 伝播）で Global クエリ分岐を実装しても、summarizer が null のままでは global search が機能しない。
- Phase 3 の多角的チェック観点「`communitySummarizer` を optional のまま full config に含める妥当性があるか」に対し、optional で含めることが妥当と判定済み（必須にすると既存のテスト環境構築コストが増加する）。

## 2. スコープ

### 含む

- `FullHybridRAGConfig` への `communitySummarizer?: ICommunitySummarizer` フィールド追加
- `HybridRAGFactory.createFull()` から `GraphSearchStrategy` へ `communitySummarizer` を渡す実装
- `ICommunitySummarizer` インターフェース定義（未定義の場合）
- `communitySummarizer` が未指定のときの明示的な null 扱い（暗黙 fallback 禁止 - P62 準拠）

### 含まない

- `ICommunitySummarizer` の具体的な実装クラス（Knowledge Graph 側のスコープ）
- `createLite()` への追加（Lite 版は graph を除外しているため対象外）
- UT-RAG-08-006 の queryType 伝播ロジック本体

## 3. 技術コンテキスト

### 想定インターフェース

```typescript
// ICommunitySummarizer（未定義の場合は新規定義）
export interface ICommunitySummarizer {
  summarize(communityId: string): Promise<string>;
  summarizeBatch(communityIds: string[]): Promise<Map<string, string>>;
}

// FullHybridRAGConfig 拡張
export interface FullHybridRAGConfig {
  // ...既存フィールド...
  communitySummarizer?: ICommunitySummarizer; // optional: Global クエリ対応時のみ必要
}
```

### Factory での使用箇所

```typescript
// createFull() 内
const graphStrategy = new GraphSearchStrategy(
  config.graphStore,
  config.communitySummarizer ?? null, // optional → null fallback（明示的）
);
```

### 関連ファイル

| ファイル                                                       | 役割                               |
| -------------------------------------------------------------- | ---------------------------------- |
| `packages/shared/src/services/search/hybrid-rag-factory.ts`    | Config 拡張と Factory 実装         |
| `packages/shared/src/services/search/graph-search-strategy.ts` | communitySummarizer を受け取る対象 |
| `packages/shared/src/services/search/interfaces.ts`            | ICommunitySummarizer 定義先候補    |

## 4. 依存タスク

| タスクID      | タスク名                               | 依存種別                              |
| ------------- | -------------------------------------- | ------------------------------------- |
| UT-RAG-08-002 | HybridRAGFactory 実配線                | 必須前提                              |
| UT-RAG-08-006 | GraphSearchStrategy queryType 伝播改善 | 推奨前提（Global 分岐を活用するため） |

UT-RAG-08-002 完了後に実施すること。UT-RAG-08-006 と並列実施も可能。

## 5. 受入基準

- [ ] `FullHybridRAGConfig` に `communitySummarizer?: ICommunitySummarizer` フィールドが追加されていること
- [ ] `createFull()` が `communitySummarizer` を `GraphSearchStrategy` に渡していること
- [ ] `communitySummarizer` が未指定のとき `null` として明示的に渡されること（暗黙 fallback なし）
- [ ] `ICommunitySummarizer` インターフェースが定義されていること
- [ ] 全テストが PASS すること
- [ ] `pnpm typecheck` がエラーゼロで通ること

## 6. 設計判断メモ

- `communitySummarizer` を optional にする理由: 既存のテスト環境（mock 不要）を壊さないため。Global クエリが不要なユースケースでも createFull() を使用できる。
- P62（暗黙 fallback 禁止）: `communitySummarizer` が未指定のとき `new DefaultCommunitySummarizer()` のような暗黙生成は行わず、明示的に `null` として渡す。
- `createLite()` は graph 検索を含まないため本タスクの対象外。
