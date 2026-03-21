# Phase 3 設計レビュー結果 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| タスクID   | `UT-RAG-08-002`    |
| Phase      | `3 - 設計レビュー` |
| 作成日     | 2026-03-20         |
| ステータス | COMPLETE           |

## ゲート判定: PASS

MAJOR 指摘として挙がった ILLMClient 型不整合は、選択肢A（cragLlmClient / rerankerLlmClient 分離 + import alias）により設計上解消されていることを確認。Phase 4 へ進む。

## レビュー結果一覧

| ID    | 観点                                 | 判定 | 備考                                                                            |
| ----- | ------------------------------------ | ---- | ------------------------------------------------------------------------------- |
| RV-01 | Factory パターンの適切性             | PASS | `static` メソッド / helper 分離 / `createForTesting()` 一貫性を確認             |
| RV-02 | 型置換と config 契約の完全性         | PASS | 5 placeholder 全て削除対象で管理、import パスは実在確認済み                     |
| RV-03 | エラーハンドリング設計（P62 準拠）   | PASS | 4 条件で明示エラー、fallback なし、prefix `HybridRAGFactory.createFull():` 付き |
| RV-04 | HybridRAGEngine コンストラクタ整合性 | PASS | IQueryClassifier / ISearchStrategy / IFusionStrategy / IReranker 全て一致       |
| RV-05 | DIP と関心ごとの分離                 | PASS | keyword bridge は adapter に閉じ込め、caller は interface を渡す構造            |
| RV-06 | テスタビリティ                       | PASS | full / lite / error path を個別テスト可能、adapter 単体テスト分離可能           |
| RV-07 | ILLMClient / ILLMProvider 型互換性   | PASS | shared alias `RerankerLLMClient` / crag alias `CragLLMClient` で衝突解消        |
| RV-08 | Phase 12 sync 対象の妥当性           | PASS | 必須 5 ファイル + 任意 6 ファイルが仕様書に記載済み、API spec は N/A 判定       |

## 苦戦箇所の記録

### ILLMClient 型二重定義

- `../llm/types` と `./crag/types` に同名 `ILLMClient` が存在し、直接 import すると型衝突が発生する。
- import alias（`RerankerLLMClient` / `CragLLMClient`）で分離する設計（DT-01）により解消。
- Phase 5 実装時に alias を確実に適用することを確認した。

### KeywordSearchStrategy パーミッション制限

- `KeywordSearchStrategy` は `ISearchStrategy` を実装せず、直接 engine に渡せない。
- adapter pattern（`KeywordSearchStrategyAdapter`）で bridge することで解決（DT-03）。
- adapter は `packages/shared/src/services/search/strategies/` に新規ファイルとして追加する。

## Phase 4 引き継ぎ観点

- adapter 経由の keyword search が engine の triple search に載ることを統合テストで確認する。
- `rerankerType` 4 分岐と `enableCRAG` 条件分岐を異常系テストケースに含める。
- `createForTesting()` の回帰 guard を維持するテストを設ける。
- `communitySummarizer` を渡した場合と渡さない場合の両方をテストする。

## follow-up 事項

| ID                          | 内容                                                 | 判定      |
| --------------------------- | ---------------------------------------------------- | --------- |
| GRAPH-QUERYTYPE-PROPAGATION | `HybridRAGEngine` の graph への queryType 伝播       | follow-up |
| KEYWORD-INTERFACE-REFORM    | `KeywordSearchStrategy` 本体の public interface 改修 | follow-up |
| LLM-CLIENT-UNIFICATION      | `RelevanceEvaluator` と shared `ILLMClient` 統一     | follow-up |
