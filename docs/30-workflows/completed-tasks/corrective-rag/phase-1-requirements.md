# Phase 1: 要件定義

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 1              |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

Corrective RAG (CRAG) の機能要件・非機能要件を明確化し、検証可能な受け入れ基準を定義する。

## 実行タスク

- 要件抽出: タスク指示書およびシステム仕様から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名                  | パス                                                                         | 説明                  |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------- |
| タスク指示書            | `docs/30-workflows/unassigned-task/task-07-06-corrective-rag.md`             | 元タスク指示書        |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | CRAG関連型定義        |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAGパイプライン |
| 依存タスク成果物        | `docs/30-workflows/*/` (RRF Fusion)                                          | 前提となるRRF Fusion  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                               |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 検索クエリ・結果型定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | CRAGScore型、cragEnabledオプション |
| RAGアーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAGパイプライン構造          |
| コアインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`       | Result型、ILLMClient定義           |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー分類・リトライ戦略           |

## 実行手順

### 1. 要件抽出

タスク指示書から以下の要件を抽出する:

#### 機能要件（FR）

| ID     | 要件                                                                 | 優先度 |
| ------ | -------------------------------------------------------------------- | ------ |
| FR-001 | LLMを使用して検索結果の関連性を評価できる                            | 必須   |
| FR-002 | 関連性評価結果を3段階（correct/incorrect/ambiguous）で分類できる     | 必須   |
| FR-003 | "correct"判定時、検索結果をそのまま返却できる                        | 必須   |
| FR-004 | "incorrect"判定時、検索結果を破棄しWeb検索で補強できる（オプション） | 任意   |
| FR-005 | "ambiguous"判定時、低スコア結果をフィルタリングできる                | 必須   |
| FR-006 | Knowledge Refinementにより不要情報を除去できる（オプション）         | 任意   |
| FR-007 | 個別の検索結果に対して関連性スコア（0-1）を算出できる                | 必須   |
| FR-008 | 全体の関連性スコアを加重平均で計算できる                             | 必須   |
| FR-009 | 評価プロンプトをカスタマイズ可能なオプションを提供できる             | 任意   |

#### 非機能要件（NFR）

| ID      | 要件                                                    | 優先度 |
| ------- | ------------------------------------------------------- | ------ |
| NFR-001 | 評価処理のタイムアウトは10秒以内                        | 必須   |
| NFR-002 | LLM API呼び出しの失敗時にエラーを適切にハンドリングする | 必須   |
| NFR-003 | テストカバレッジ Line 80%以上                           | 必須   |
| NFR-004 | 型安全性を確保（TypeScript strict mode）                | 必須   |
| NFR-005 | Result型でエラーを明示的に扱う                          | 必須   |
| NFR-006 | Web検索オプションは依存性注入で制御可能                 | 任意   |

### 2. 受け入れ基準作成

各要件に対する受け入れ基準:

| 要件ID  | 受け入れ基準                                                             |
| ------- | ------------------------------------------------------------------------ | ----------- | ---------------------- |
| FR-001  | `RelevanceEvaluator.evaluate()`がLLMを呼び出して評価結果を返す           |
| FR-002  | 評価結果に`action: "correct"                                             | "incorrect" | "ambiguous"`が含まれる |
| FR-003  | `CorrectiveRAG.handleCorrect()`が入力結果をそのまま返す                  |
| FR-004  | `CorrectiveRAG.handleIncorrect()`がWeb検索結果を`augmentedContext`に設定 |
| FR-005  | `CorrectiveRAG.handleAmbiguous()`が閾値以下の結果を除外する              |
| FR-006  | `enableRefinement: true`時にKnowledge Refinementが実行される             |
| FR-007  | `individualScores`配列に各結果のスコア（0-1）と理由が含まれる            |
| FR-008  | `overallScore`が上位結果に重み付けした加重平均で計算される               |
| NFR-001 | 評価処理が10秒以内に完了するか、タイムアウトエラーを返す                 |
| NFR-002 | LLM API失敗時に`Result.err()`でエラーを返す（例外をthrowしない）         |
| NFR-003 | `pnpm test:coverage`でLine Coverage 80%以上を達成                        |

### 3. FR/NFR分類

機能要件と非機能要件を分類し、優先度を設定済み（上記参照）。

## 統合テスト連携【必須】

接続要件（LLM API/ISearchStrategy/IWebSearcher）を要件に明記:

| 接続要件カテゴリ | 記載内容                                                  |
| ---------------- | --------------------------------------------------------- |
| LLM API接続      | ILLMClient.complete()を使用して関連性評価プロンプトを送信 |
| 検索結果入力     | FusedSearchResult[]（RRF Fusion + Rerankingの出力）       |
| Web検索連携      | IWebSearcher.search()（オプション、DI可能）               |
| 出力形式         | CRAGResult（評価結果・補正結果・補強コンテキスト）        |

## 成果物

| 成果物       | パス                                         | 説明               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・除外範囲 |

## 完了条件

- [ ] 全機能要件（FR-001〜FR-009）が抽出されている
- [ ] 全非機能要件（NFR-001〜NFR-006）が抽出されている
- [ ] 各要件に受け入れ基準が定義されている
- [ ] FR/NFRが分類され優先度が設定されている
- [ ] 接続要件（LLM API/検索結果入力/Web検索連携）が明記されている
- [ ] システム仕様との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 機能要件の抽出
3. 非機能要件の抽出
4. 受け入れ基準の作成
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 1
```

## 次のPhase

Phase 2: 設計
