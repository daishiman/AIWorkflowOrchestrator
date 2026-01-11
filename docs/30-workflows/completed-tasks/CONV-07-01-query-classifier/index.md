# CONV-07-01: クエリ分類器実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | CONV-07-01                            |
| タスク名   | クエリ分類器実装                      |
| 親タスク   | CONV-07 (HybridRAG検索エンジン)       |
| 依存タスク | CONV-03-05 (検索クエリ・結果スキーマ) |
| 規模       | 中                                    |
| ステータス | 未実施                                |
| 作成日     | 2026-01-10                            |
| 最終更新日 | 2026-01-10                            |

---

## 概要

検索クエリをローカル/グローバル/関係性の3タイプに分類し、最適な検索戦略を選択するためのクエリ分類器を実装する。HybridRAGの4段階パイプラインの第1段階として機能する。

### 目的

- ユーザーの検索意図を正確に分類
- クエリタイプに応じた検索重み付けの最適化
- LLMベース/ルールベースのハイブリッド分類器による高精度な分類

### 背景

HybridRAGではクエリタイプに応じて検索戦略を最適化する：

| クエリタイプ     | 例                      | 主要検索源       | 重み (K:S:G)   |
| ---------------- | ----------------------- | ---------------- | -------------- |
| **local**        | 「Reactについて教えて」 | Vector + Keyword | 0.35:0.35:0.3  |
| **global**       | 「全体のテーマは？」    | Graph            | 0.2:0.3:0.5    |
| **relationship** | 「AとBの関係は？」      | Graph            | 0.2:0.2:0.6    |
| **hybrid**       | 不明・複合クエリ        | 均等             | 0.33:0.33:0.34 |

---

## 成果物

| 成果物                       | パス                                                                     |
| ---------------------------- | ------------------------------------------------------------------------ |
| 型定義                       | `packages/shared/src/services/search/types.ts`                           |
| クエリ分類器インターフェース | `packages/shared/src/services/search/query-classifier.ts`                |
| LLMベース分類器              | `packages/shared/src/services/search/llm-query-classifier.ts`            |
| ルールベース分類器           | `packages/shared/src/services/search/rule-based-query-classifier.ts`     |
| テスト                       | `packages/shared/src/services/search/__tests__/query-classifier.test.ts` |

---

## Phase一覧

| Phase | 名称                 | ステータス | 成果物               |
| ----- | -------------------- | ---------- | -------------------- |
| 1     | 要件定義             | 未着手     | 要件定義書           |
| 2     | 設計                 | 未着手     | 設計書               |
| 3     | 設計レビューゲート   | 未着手     | レビュー結果         |
| 4     | テスト作成           | 未着手     | テストコード（Red）  |
| 5     | 実装                 | 未着手     | 実装コード（Green）  |
| 6     | テスト拡充           | 未着手     | 追加テストコード     |
| 7     | テストカバレッジ確認 | 未着手     | カバレッジレポート   |
| 8     | リファクタリング     | 未着手     | リファクタ済みコード |
| 9     | 品質保証             | 未着手     | 品質レポート         |
| 10    | 最終レビューゲート   | 未着手     | レビュー結果         |
| 11    | 手動テスト検証       | 未着手     | 手動テストレポート   |
| 12    | ドキュメント更新     | 未着手     | 実装ガイド・仕様更新 |
| 13    | PR作成               | 未着手     | PR                   |

---

## システム仕様（aiworkflow-requirements）

実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容                       |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| 検索クエリ・結果型  | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchQuery, QueryType定義 |
| RAGアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAGパイプライン設計  |
| RAGインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`        | IEntityExtractor等の参照   |

---

## 参照情報

- 元タスク指示書: `docs/30-workflows/unassigned-task/task-07-01-query-classifier.md`
- 親タスク: CONV-07 (HybridRAG検索エンジン)
- 依存タスク: CONV-03-05 (検索クエリ・結果スキーマ)
