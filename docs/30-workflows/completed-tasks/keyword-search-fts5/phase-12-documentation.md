# Phase 12: ドキュメント更新 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | keyword-search-fts5        |
| タスクID   | CONV-07-02                 |

---

## 目的

実装完了後のドキュメント更新、仕様反映、未完了タスクの検出を行い、プロジェクトの一貫性を維持する。

## 背景

Phase 12では以下の3つの必須作業を行う:

1. **Phase 12-1: 実装ガイド作成** - 概念的説明と技術的詳細のドキュメント化
2. **Phase 12-2: システムドキュメント更新** - 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **Phase 12-3: 未タスク検出** - 技術的負債の可視化と継続的改善

---

## Phase 12-1: 実装ガイド作成

### 目的

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

### ドキュメント要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| データベース設計   | 条件 | テーブル定義 + なぜこの設計にしたか      |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

### 記述原則

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

### 実装ガイド構成

```markdown
# キーワード検索戦略（FTS5/BM25）実装ガイド

## Part 1: 概念的な説明

### これは何をするもの？

（中学生にもわかる比喩で説明）

### なぜこの方式を選んだのか？

（他の選択肢との比較、メリット・デメリット）

## Part 2: 技術的詳細

### アーキテクチャ

（ASCII図 + 各層の役割説明）

### 実装詳細

（コード例 + 「なぜ」の設計理由説明）

### 用語集

（専門用語の読み方・意味・使用コンテキスト）
```

### 用語集テンプレート

| 用語      | 読み方                 | 意味                              | 本プロジェクトでの使用コンテキスト |
| --------- | ---------------------- | --------------------------------- | ---------------------------------- |
| FTS5      | エフティーエスファイブ | SQLite Full-Text Search version 5 | チャンク検索のインデックス         |
| BM25      | ビーエムニジュウゴ     | Best Matching 25                  | 検索スコアリングアルゴリズム       |
| Tokenizer | トークナイザー         | 文を単語に分割する処理            | FTS5の日本語対応                   |

---

## Phase 12-2: システムドキュメント更新

### 目的

既存のシステムドキュメントに今回の実装内容を反映する。

### 更新対象ドキュメント

#### 1. API仕様書の更新

**対象ファイル**: `references/specifications/api-internal-search.md`

追記内容:

- KeywordSearchStrategyのメソッド仕様
- 検索タイプ（keyword/phrase/near）の説明
- パフォーマンス特性

#### 2. アーキテクチャ仕様書の更新

**対象ファイル**: `references/specifications/architecture-rag.md`

追記内容:

- KeywordSearchStrategyの統合ポイント
- HybridRAGSearchでの利用パターン
- スコア正規化の詳細説明

#### 3. インターフェース仕様書の更新

**対象ファイル**: `references/specifications/interfaces-rag-search.md`

追記内容:

- KeywordSearchOptions型定義
- KeywordSearchMetrics型定義

### aiworkflow-requirements更新【必須】

**対象ディレクトリ**: `.claude/skills/aiworkflow-requirements/references/`

| 更新ファイル               | 更新内容                          |
| -------------------------- | --------------------------------- |
| `api-internal-search.md`   | KeywordSearchStrategy API仕様追加 |
| `interfaces-rag-search.md` | 型定義追加                        |
| `architecture-rag.md`      | 統合ポイント追記                  |

### 更新原則

- **概要のみ記載**: 詳細は実装ガイドを参照
- **Single Source of Truth遵守**: 重複記載を避ける

---

## Phase 12-3: 未タスク検出

### 目的

実装中に発見された課題、技術的負債、追加開発候補を検出・可視化する。

### 検出ソース

| ソース                 | 確認項目                      | Grepパターン例                                      |
| ---------------------- | ----------------------------- | --------------------------------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| Phase 9レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-9/`                                  |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                 |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |

### 検出コマンド

```bash
# TODO/FIXME検索
grep -rn "TODO\|FIXME" packages/shared/src/services/search/

# 未実装検索
grep -rn "Not implemented" packages/shared/src/services/search/

# スキップテスト検索
grep -rn "it.skip\|describe.skip\|test.skip" packages/shared/src/services/search/

# 型安全性妥協検索
grep -rn "as any\|@ts-ignore\|@ts-expect-error" packages/shared/src/services/search/
```

### 検出チェックリスト

| 項目                 | 確認方法                                  | 状態       |
| -------------------- | ----------------------------------------- | ---------- |
| TODO/FIXMEコメント   | `grep -r "TODO\|FIXME" src/`              | [ ] 確認済 |
| 未実装メソッド       | `throw new Error("Not implemented")` 検索 | [ ] 確認済 |
| スキップされたテスト | `it.skip\|describe.skip` 検索             | [ ] 確認済 |
| 未使用エクスポート   | ESLint unused-exports                     | [ ] 確認済 |
| 型安全性の妥協       | `as any\|@ts-ignore` 検索                 | [ ] 確認済 |

### 新規タスク抽出テンプレート

実装中に発見された追加タスク候補:

| タスクID候補 | 内容                   | 優先度 | 依存       |
| ------------ | ---------------------- | ------ | ---------- |
| CONV-07-03   | 検索結果キャッシュ戦略 | 中     | CONV-07-02 |
| CONV-07-04   | 検索クエリ履歴管理     | 低     | CONV-07-02 |
| CONV-07-05   | 検索サジェスト機能     | 低     | CONV-07-02 |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                    |
| -------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`          | RAGパイプライン全体設計 |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`     | SearchQuery/Result型    |
| チャンク検索API      | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` | FTS5検索API仕様         |

### テンプレート

| テンプレート | パス                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| 実装ガイド   | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` |
| 未完了タスク | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`      |

---

## 成果物

| 成果物               | パス                                           | 必須 |
| -------------------- | ---------------------------------------------- | ---- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | ✅   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`           | 条件 |

---

## 完了条件

### Phase 12-1 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] 用語集セクションが含まれている
- [ ] コード例に「なぜ」の設計理由説明が付いている

### Phase 12-2 完了条件

- [ ] API仕様書にKeywordSearchStrategyが記載されている
- [ ] アーキテクチャ仕様書に統合ポイントが追記されている
- [ ] aiworkflow-requirementsが更新されている（該当する場合）

### Phase 12-3 完了条件

- [ ] 未タスク検出レポートが出力されている
- [ ] TODO/FIXMEコメントが解消または課題登録されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

### 全体完了条件

- [ ] 全ての成果物が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonのPhase 12を更新

---

## 次のPhase

Phase 13: PR作成

`docs/30-workflows/keyword-search-fts5/phase-13-pr-creation.md`
