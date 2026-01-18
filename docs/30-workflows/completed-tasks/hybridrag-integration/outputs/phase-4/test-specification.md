# HybridRAG統合 - テスト仕様書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 4             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. テスト対象

### 1.1 HybridRAGEngine

4ステージパイプラインを統合する検索エンジン。

| メソッド | テスト観点                                                   |
| -------- | ------------------------------------------------------------ |
| search() | パイプライン実行、部分失敗、全失敗、CRAGステージ、オプション |

### 1.2 HybridRAGFactory

HybridRAGEngineのインスタンスを生成するファクトリ。

| メソッド           | テスト観点                             |
| ------------------ | -------------------------------------- |
| createFull()       | 全機能エンジン生成、APIキー必須検証    |
| createLite()       | 軽量エンジン生成                       |
| createForTesting() | テスト用エンジン生成、デフォルト値適用 |

---

## 2. テスト戦略

### 2.1 テストピラミッド

```
          /\
         /  \   E2E（手動テスト - Phase 11）
        /----\
       /      \  統合テスト（hybrid-rag-engine.integration.test.ts）
      /--------\
     /          \ ユニットテスト（hybrid-rag-engine.test.ts）
    --------------
```

### 2.2 テストカバレッジ目標

| 種別     | 目標    |
| -------- | ------- |
| Line     | 80%以上 |
| Branch   | 60%以上 |
| Function | 80%以上 |

---

## 3. モック戦略

### 3.1 モックヘルパー関数

| 関数                         | 説明                           |
| ---------------------------- | ------------------------------ |
| createMockQueryClassifier()  | QueryClassifierのモック生成    |
| createMockKeywordStrategy()  | KeywordSearchStrategyのモック  |
| createMockSemanticStrategy() | SemanticSearchStrategyのモック |
| createMockGraphStrategy()    | GraphSearchStrategyのモック    |
| createMockFusion()           | RRFFusionのモック              |
| createMockReranker()         | IRerankerのモック              |
| createMockCorrectiveRAG()    | CorrectiveRAGのモック          |

### 3.2 モック結果生成

| 関数                            | 説明                         |
| ------------------------------- | ---------------------------- |
| createMockResults()             | SearchResult[]の生成         |
| createMockFusedResults()        | FusedSearchResult[]の生成    |
| createResultsWithSharedChunks() | 重複チャンクを含む結果の生成 |

---

## 4. テスト環境

### 4.1 テストフレームワーク

- **Vitest**: テストランナー・アサーション
- **vi.fn()**: モック関数
- **vi.spyOn()**: スパイ

### 4.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# 特定ファイル実行
pnpm --filter @repo/shared test hybrid-rag-engine

# カバレッジ計測
pnpm --filter @repo/shared test --coverage
```

---

## 5. TDD Red状態

Phase 4では、テストは**失敗状態（Red）**で完了する。

### 5.1 失敗理由

- `HybridRAGEngine`クラスは仮実装（`return err(new Error("Not implemented"))`）
- `HybridRAGFactory`の各メソッドは`throw new Error("Not implemented")`

### 5.2 Phase 5での対応

Phase 5（実装）で実際のクラスを実装し、テストを通過（Green）させる。

---

## 6. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
