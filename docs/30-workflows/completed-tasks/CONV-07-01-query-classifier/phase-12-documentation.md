# Phase 12: ドキュメント更新 - クエリ分類器

## メタ情報

| 項目         | 内容                      |
| ------------ | ------------------------- |
| Phase        | 12                        |
| タスクID     | CONV-07-01                |
| Phase名      | ドキュメント更新          |
| 前提Phase    | Phase 11 (手動テスト検証) |
| 次Phase      | Phase 13 (PR作成)         |
| 推定作業時間 | 2時間                     |
| ステータス   | 未着手                    |

---

## 目的

3つの必須作業を実行する：

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **未タスク検出**: 技術的負債の可視化と継続的改善

---

## Phase 12-1: 実装ガイド作成

### Part 1: 概念的説明

#### なぜクエリ分類器が必要か

クエリ分類器は、HybridRAG検索エンジンにおける「交通整理」の役割を果たします。

**比喩**: 図書館の司書を想像してください。利用者が「この本はどこですか？」と尋ねると、司書は質問の内容から適切な書架を案内します。クエリ分類器は、この司書のように検索クエリを分析し、最適な検索方法を選択します。

#### 3種類のクエリタイプ

```
┌─────────────────────────────────────────────────────────────┐
│                     検索クエリ                               │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────────┐
       │  local   │    │  global  │    │ relationship │
       │          │    │          │    │              │
       │ 特定の   │    │ 全体の   │    │ 関係性の     │
       │ 情報     │    │ 概要     │    │ 質問         │
       └──────────┘    └──────────┘    └──────────────┘
            │               │               │
            ▼               ▼               ▼
      ┌──────────┐    ┌──────────┐    ┌──────────────┐
      │ Vector + │    │  Graph   │    │    Graph     │
      │ Keyword  │    │ 重視     │    │    重視      │
      └──────────┘    └──────────┘    └──────────────┘
```

| タイプ       | 例                       | イメージ           |
| ------------ | ------------------------ | ------------------ |
| local        | 「Reactとは？」          | 辞書で単語を調べる |
| global       | 「全体のテーマは？」     | 本の目次を見る     |
| relationship | 「ReactとVueの違いは？」 | 2冊の本を比較する  |

### Part 2: 技術的詳細

#### アーキテクチャ

```
packages/shared/src/services/search/
├── types.ts                      # 型定義（QueryType, SearchWeights等）
├── query-classifier.ts           # IQueryClassifierインターフェース
├── rule-based-query-classifier.ts # ルールベース実装（高速、フォールバック用）
├── llm-query-classifier.ts       # LLMベース実装（高精度）
├── constants.ts                  # 定数（重み、閾値）
├── patterns.ts                   # 正規表現パターン
├── utils.ts                      # ユーティリティ関数
└── __tests__/                    # テストファイル
```

#### なぜ2つの分類器を用意したのか

**設計判断**: LLMは高精度だが遅く、エラーも起こりうる。一方、ルールベースは高速で安定している。両方を組み合わせることで、精度と信頼性を両立させた。

```typescript
// LLMエラー時のフォールバック例
try {
  const llmResult = await llmClassifier.classify(query);
  return llmResult;
} catch (error) {
  // フォールバック: ルールベースで継続
  return ruleBasedClassifier.classify(query);
}
```

#### 検索重みの設計理由

| タイプ       | K:S:G          | 理由                                   |
| ------------ | -------------- | -------------------------------------- |
| local        | 0.35:0.35:0.30 | 特定情報はキーワード+意味検索が有効    |
| global       | 0.20:0.30:0.50 | 全体構造はグラフ（コミュニティ）で把握 |
| relationship | 0.20:0.20:0.60 | 関係性はグラフ検索が最適               |

---

## Phase 12-2: システムドキュメント更新

### 更新対象

| ドキュメント                                                                 | 更新内容                         |
| ---------------------------------------------------------------------------- | -------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | クエリ分類器インターフェース追加 |
| `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | 分類器パイプライン説明追加       |

### 更新内容サンプル

#### interfaces-rag-search.md への追記

```markdown
## クエリ分類器

検索クエリを分類し、最適な検索戦略を選択するコンポーネント。

### IQueryClassifier

| メソッド           | 説明                       |
| ------------------ | -------------------------- |
| classify()         | クエリを分類               |
| getSearchWeights() | タイプに応じた検索重み取得 |

**実装**:

- LLMQueryClassifier: 高精度分類（推奨）
- RuleBasedQueryClassifier: フォールバック用

**参照**: `packages/shared/src/services/search/`
```

---

## Phase 12-3: 未タスク検出

### 検出ソース

| ソース              | 確認項目                | Grepパターン                   |
| ------------------- | ----------------------- | ------------------------------ |
| Phase 3レビュー結果 | MINOR判定の指摘事項     | `outputs/phase-3/`             |
| Phase 9品質レポート | MINOR判定の指摘事項     | `outputs/phase-9/`             |
| Phase 11手動テスト  | スコープ外の発見事項    | `outputs/phase-11/`            |
| コードベース        | TODO/FIXME/HACKコメント | `grep -rn "TODO\|FIXME\|HACK"` |

### 検出結果

| ID   | ソース | 内容 | 優先度 | 次タスク候補 |
| ---- | ------ | ---- | ------ | ------------ |
| U-01 | -      | -    | -      | -            |

### 未タスク指示書作成

検出された未タスクに対して `docs/30-workflows/unassigned-task/` に指示書を作成する（該当する場合）。

---

## 用語集

| 用語                     | 読み方                             | 意味                                             |
| ------------------------ | ---------------------------------- | ------------------------------------------------ |
| QueryType                | クエリタイプ                       | クエリの分類（local/global/relationship/hybrid） |
| SearchWeights            | サーチウェイト                     | 検索戦略の重み（keyword/semantic/graph）         |
| IQueryClassifier         | アイクエリクラシファイア           | クエリ分類器のインターフェース                   |
| LLMQueryClassifier       | エルエルエムクエリクラシファイア   | LLMを使った高精度分類器                          |
| RuleBasedQueryClassifier | ルールベースドクエリクラシファイア | パターンマッチングによる分類器                   |
| フォールバック           | -                                  | エラー時の代替処理                               |

---

## 成果物

| 成果物                   | 配置先                                         |
| ------------------------ | ---------------------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`     |
| ドキュメント更新記録     | `outputs/phase-12/documentation-update-log.md` |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-report.md`   |
| 未タスク指示書（該当時） | `docs/30-workflows/unassigned-task/`           |

---

## システム仕様（aiworkflow-requirements）

> ドキュメント更新時に以下のシステム仕様を更新してください。

| 参照資料           | パス                                                                         | 更新内容                   |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------- |
| 検索クエリ・結果型 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | 分類器インターフェース追加 |
| RAGアーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | 分類器パイプライン追加     |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている
- [ ] 用語集が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 13（PR作成）へ進み、変更をコミット・PRを作成する。

**重要**: Phase 13ではユーザーの許可を得てからPR作成を行う。
