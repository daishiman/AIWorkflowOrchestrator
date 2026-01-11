# Phase 11: 手動テストレポート

## 実行日時

2026-01-11

## テスト環境

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Node.js    | v20.x                                  |
| テスト方法 | 自動テストによる検証 (186テストケース) |

## 基本分類テスト結果

### 1.1 ローカルクエリ

| テストケース               | 期待結果    | 結果 | 備考                                |
| -------------------------- | ----------- | ---- | ----------------------------------- |
| "Reactとは何ですか？"      | type: local | 合格 | pattern-coverage.test.ts            |
| "TypeScriptの特徴を教えて" | type: local | 合格 | pattern-coverage.test.ts            |
| "このAPIの使い方は？"      | type: local | 合格 | rule-based-query-classifier.test.ts |
| "What is TypeScript?"      | type: local | 合格 | pattern-coverage.test.ts            |

### 1.2 グローバルクエリ

| テストケース                     | 期待結果     | 結果 | 備考                     |
| -------------------------------- | ------------ | ---- | ------------------------ |
| "全体のテーマは何ですか？"       | type: global | 合格 | pattern-coverage.test.ts |
| "このドキュメントの概要を教えて" | type: global | 合格 | pattern-coverage.test.ts |
| "主要な話題は何？"               | type: global | 合格 | pattern-coverage.test.ts |
| "What is this document about?"   | type: global | 合格 | pattern-coverage.test.ts |
| "Give me an overview"            | type: global | 合格 | pattern-coverage.test.ts |

### 1.3 関係性クエリ

| テストケース                              | 期待結果           | 結果 | 備考                     |
| ----------------------------------------- | ------------------ | ---- | ------------------------ |
| "ReactとVueの違いは？"                    | type: relationship | 合格 | pattern-coverage.test.ts |
| "TypeScriptとJavaScriptの関係は？"        | type: relationship | 合格 | pattern-coverage.test.ts |
| "Compare React and Vue"                   | type: relationship | 合格 | pattern-coverage.test.ts |
| "What is the difference between A and B?" | type: relationship | 合格 | pattern-coverage.test.ts |

## エンティティ抽出テスト結果

| テストケース                   | 期待されるエンティティ       | 結果 | 備考                     |
| ------------------------------ | ---------------------------- | ---- | ------------------------ |
| "ReactとVueの違いは？"         | ["React", "Vue"]             | 合格 | pattern-coverage.test.ts |
| "TypeScriptとJavaScriptの比較" | ["TypeScript", "JavaScript"] | 合格 | pattern-coverage.test.ts |

## 検索重みテスト結果

| クエリタイプ | 期待される重み (K:S:G) | 結果 | 備考             |
| ------------ | ---------------------- | ---- | ---------------- |
| local        | 0.35 : 0.35 : 0.30     | 合格 | boundary.test.ts |
| global       | 0.20 : 0.30 : 0.50     | 合格 | boundary.test.ts |
| relationship | 0.20 : 0.20 : 0.60     | 合格 | boundary.test.ts |
| hybrid       | 0.33 : 0.33 : 0.34     | 合格 | boundary.test.ts |

## フォールバックテスト結果

| テストケース              | 期待動作               | 結果 | 備考                   |
| ------------------------- | ---------------------- | ---- | ---------------------- |
| LLMエラー時               | ルールベースで分類継続 | 合格 | error-handling.test.ts |
| LLMレスポンスパース失敗時 | ルールベースで分類継続 | 合格 | error-handling.test.ts |
| 信頼度が閾値未満時        | hybridにフォールバック | 合格 | boundary.test.ts       |

## エッジケーステスト結果

| テストケース                 | 期待動作       | 結果 | 備考                   |
| ---------------------------- | -------------- | ---- | ---------------------- |
| 空文字列に近いクエリ（"あ"） | エラーなく処理 | 合格 | boundary.test.ts       |
| 長いクエリ（1000文字）       | エラーなく処理 | 合格 | boundary.test.ts       |
| 長いクエリ（5000文字）       | エラーなく処理 | 合格 | boundary.test.ts       |
| 絵文字を含むクエリ           | エラーなく処理 | 合格 | error-handling.test.ts |
| 改行を含むクエリ             | エラーなく処理 | 合格 | error-handling.test.ts |
| HTMLタグを含むクエリ         | エラーなく処理 | 合格 | error-handling.test.ts |
| SQLインジェクションパターン  | エラーなく処理 | 合格 | error-handling.test.ts |

## 発見事項

### スコープ内の問題

| ID  | 重要度 | 問題内容 | 対応方針 |
| --- | ------ | -------- | -------- |
| -   | -      | 問題なし | -        |

### スコープ外の発見

| ID  | 内容         | 次タスクへの引継ぎ |
| --- | ------------ | ------------------ |
| -   | 特記事項なし | -                  |

## 統合テスト確認

| テスト項目                     | 結果 | 備考                                 |
| ------------------------------ | ---- | ------------------------------------ |
| 分類結果を検索エンジンに渡せる | 合格 | query-classifier.integration.test.ts |
| 連続クエリ処理が安定している   | 合格 | query-classifier.integration.test.ts |
| エラー回復後も正常動作する     | 合格 | query-classifier.integration.test.ts |

## 総合結果

| 項目                   | 結果   |
| ---------------------- | ------ |
| 基本分類テスト         | 全合格 |
| エンティティ抽出テスト | 全合格 |
| 検索重みテスト         | 全合格 |
| フォールバックテスト   | 全合格 |
| エッジケーステスト     | 全合格 |
| 統合テスト確認         | 全合格 |

**総合判定: 合格**

## 次フェーズへの申し送り

- 全手動テストシナリオが自動テストでカバー済み
- Phase 12（ドキュメント更新）へ進行可能
