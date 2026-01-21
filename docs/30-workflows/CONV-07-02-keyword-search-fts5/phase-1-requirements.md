# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| Phase名    | 要件定義                       |
| 前提Phase  | なし                           |
| 後続Phase  | Phase 2                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | CONV-07-02-keyword-search-fts5 |

---

## 目的

キーワード検索戦略（FTS5/BM25）の機能要件・非機能要件・受け入れ基準を明確化する。

## 背景

HybridRAG検索エンジンの一部として、SQLite FTS5を使用したテキストベース全文検索を実装する。VectorSearchStrategy、GraphSearchStrategyと連携し、RRF（Reciprocal Rank Fusion）で統合される。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: キーワード検索戦略の機能要件を定義する

**実行手順**:

1. コア機能の定義
   - search(): キーワード検索実行
   - searchNear(): 近接検索（NEAR演算子）
   - buildFTS5Query(): FTS5クエリ生成
   - normalizeScore(): BM25スコア正規化
   - toSearchResultItem(): 結果変換

2. 検索モードの定義
   - keyword: 通常キーワード検索
   - phrase: フレーズ検索（完全一致）
   - near: 近接検索（単語間距離指定）

3. クエリ処理の定義
   - トークナイゼーション（unicode61）
   - ダイアクリティカルマーク除去
   - 日本語対応

4. 結果処理の定義
   - BM25スコア計算
   - スコア正規化（シグモイド関数）
   - SearchResultItem形式への変換

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`

---

### タスク2: 非機能要件の定義

**目的**: パフォーマンス・品質に関する非機能要件を定義する

**実行手順**:

1. パフォーマンス要件
   - 単一クエリ応答時間: 100ms以下
   - タイムアウト: 10秒
   - 並列検索サポート

2. スケーラビリティ要件
   - 10万チャンク規模での動作
   - インデックス更新の影響最小化

3. 信頼性要件
   - エラーハンドリング（validation/database/timeout）
   - 部分的障害時の縮退動作

4. 保守性要件
   - ISearchStrategy準拠
   - 単一責任原則
   - 依存性注入パターン

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md`

---

### タスク3: 受け入れ基準の定義

**目的**: 機能完了を判定する受け入れ基準を定義する

**実行手順**:

1. 機能テスト基準
   - キーワード検索で正しい結果が返る
   - フレーズ検索で完全一致のみ返る
   - 近接検索で指定距離内の結果が返る
   - スコアが0-1の範囲に正規化される

2. パフォーマンステスト基準
   - 1000チャンクで100ms以内
   - タイムアウト時に適切なエラー

3. 統合テスト基準
   - HybridSearchOrchestratorとの連携動作
   - VectorSearchStrategyとの並列実行

4. エラーハンドリング基準
   - 不正クエリで適切なエラー
   - DB接続エラーで適切なエラー

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料          | パス                                                                          | 内容                       |
| ----------------- | ----------------------------------------------------------------------------- | -------------------------- |
| RAG検索仕様       | `/.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | IKeywordSearchStrategy仕様 |
| RAGアーキテクチャ | `/.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | 全体アーキテクチャ         |

---

## 成果物

| 成果物       | パス                                             | 内容         |
| ------------ | ------------------------------------------------ | ------------ |
| 機能要件     | `outputs/phase-1/functional-requirements.md`     | 機能定義     |
| 非機能要件   | `outputs/phase-1/non-functional-requirements.md` | 品質要件     |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`         | 完了判定基準 |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                                          |
| ------------------ | ------------------------------------------------- |
| DB接続             | SQLite FTS5テーブル（chunks_fts）への接続要件     |
| データフロー       | SearchQuery → FTS5クエリ → BM25スコア → 正規化    |
| Orchestrator連携   | HybridSearchOrchestratorとの連携インターフェース  |
| エラーハンドリング | KeywordSearchError（validation/database/timeout） |

---

## 完了条件

- [ ] 機能要件が文書化されている
- [ ] 非機能要件が文書化されている
- [ ] 受け入れ基準が文書化されている
- [ ] 接続要件（DB/データフロー/Orchestrator連携）が明記されている
- [ ] 既存仕様（interfaces-rag-search.md）との整合性が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-07-02-keyword-search-fts5/phase-2-design.md`
