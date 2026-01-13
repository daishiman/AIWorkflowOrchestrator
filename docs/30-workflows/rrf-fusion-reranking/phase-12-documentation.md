# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 前提Phase  | Phase 11             |
| 後続Phase  | Phase 13             |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

実装に基づいてドキュメントを更新し、利用者向けのガイドを整備する。

## 背景

実装完了後、開発者や利用者が機能を理解・活用できるようドキュメントを整備する必要がある。

---

## Phase 12の3つの必須作業

Phase 12では以下の3つの必須作業を行う:

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **未タスク検出**: 技術的負債の可視化と継続的改善

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: API/インターフェースドキュメント更新

**目的**: 実装されたAPIとインターフェースのドキュメントを更新する

**実行手順**:

1. 以下のドキュメントを更新:

| #   | ドキュメント               | 更新内容                      | 状態 |
| --- | -------------------------- | ----------------------------- | ---- |
| 1   | `interfaces-rag-search.md` | FusedSearchResult型の追加     |      |
| 2   | `interfaces-rag-search.md` | IRerankerインターフェース追加 |      |
| 3   | `architecture-rag.md`      | Fusion/Rerankingフロー追加    |      |

2. 型定義の詳細を記載:

```typescript
// FusedSearchResult
interface FusedSearchResult extends SearchChunkResult {
  fusedScore: number; // 0-1正規化スコア
  rerankedScore?: number; // Reranker適用後スコア
  sources: string[]; // 検索戦略ソース
}

// IReranker
interface IReranker {
  rerank(
    query: string,
    chunks: SearchChunkResult[],
    limit: number,
  ): Promise<SearchChunkResult[]>;
}
```

**期待される成果物**:

- 更新された `references/interfaces-rag-search.md`
- 更新された `references/architecture-rag.md`
- `outputs/phase-12/api-doc-update.md` - API/インターフェースドキュメント更新記録

---

### タスク2: 実装ガイド作成

**目的**: 開発者向けの実装ガイドを作成する（概念的説明 + 技術的詳細）

**実行手順**:

1. 以下の必須セクションを含む実装ガイドを作成:

#### ドキュメント要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

#### 記述原則

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

#### 実装ガイド構成例

```markdown
# RRF Fusion + Reranking 実装ガイド

## Part 1: 概念的な説明

### RRF Fusionとは？（中学生向け説明）

- 複数の「おすすめリスト」を1つにまとめる方法
- 例え話: 3人の友達のおすすめ映画ランキングを合体させる

### Rerankingとは？

- 「本当に関係あるか」をもう一度チェックする仕組み

## Part 2: 技術的な詳細

### アーキテクチャ図
```

[Keyword] ─┐
[Semantic]─┼→ [RRF Fusion] → [Reranker] → [Final Results]
[Graph] ─┘

```

### 用語集
| 用語 | 読み方 | 意味 |
| ---- | ------ | ---- |
| RRF | アールアールエフ | Reciprocal Rank Fusion |
| Reranking | リランキング | 再順位付け |
```

**期待される成果物**:

- `references/implementation-guide-fusion-reranking.md` - 実装ガイド
- `outputs/phase-12/implementation-guide.md` - 実装ガイド作成記録

---

### タスク3: 使用例ドキュメント作成

**目的**: 具体的な使用例を示すドキュメントを作成する

**実行手順**:

1. 以下の使用例を作成:

| #   | 使用例                     | 内容                   |
| --- | -------------------------- | ---------------------- |
| 1   | 基本的なFusion             | 3戦略の結果統合        |
| 2   | 重み調整                   | semantic重視の設定例   |
| 3   | Reranker選択               | 各Rerankerの使い分け   |
| 4   | フォールバック設定         | 障害時の動作設定       |
| 5   | パフォーマンスチューニング | 大量データ処理の最適化 |

**期待される成果物**:

- `references/usage-examples-fusion-reranking.md` - 使用例ドキュメント
- `outputs/phase-12/usage-examples.md` - 使用例ドキュメント作成記録

---

### タスク4: JSDocコメント確認

**目的**: コード内のJSDocコメントが十分であることを確認する

**実行手順**:

1. 以下のファイルのJSDocを確認:

| #   | ファイル                   | 確認項目                     | 状態 |
| --- | -------------------------- | ---------------------------- | ---- |
| 1   | `rrf-fusion.ts`            | クラス・メソッド・パラメータ |      |
| 2   | `weighted-score-fusion.ts` | クラス・メソッド・パラメータ |      |
| 3   | `llm-reranker.ts`          | クラス・メソッド・パラメータ |      |
| 4   | `cohere-reranker.ts`       | クラス・メソッド・パラメータ |      |
| 5   | `voyage-reranker.ts`       | クラス・メソッド・パラメータ |      |
| 6   | `noop-reranker.ts`         | クラス・メソッド・パラメータ |      |
| 7   | `types.ts`                 | 全型定義                     |      |

2. 不足があれば追加

**期待される成果物**:

- `outputs/phase-12/jsdoc-check.md` - JSDocコメント確認記録

---

### タスク5: READMEセクション更新

**目的**: プロジェクトREADMEに機能説明を追加する

**実行手順**:

1. READMEに以下のセクションを追加（必要に応じて）:

```markdown
## 検索機能

### RRF Fusion

複数の検索戦略（キーワード、セマンティック、グラフ）の結果を
Reciprocal Rank Fusion アルゴリズムで統合します。

### Reranking

検索結果をクロスエンコーダーまたは外部APIで再スコアリングし、
より関連性の高い結果を上位に配置します。

対応Reranker:

- LLMReranker (OpenAI GPT)
- CohereReranker (Cohere Rerank API)
- VoyageReranker (Voyage AI Rerank API)
- NoOpReranker (フォールバック用)
```

**期待される成果物**:

- `outputs/phase-12/readme-update.md` - README更新記録

---

### タスク6: 未タスク検出

**目的**: 技術的負債を可視化し、継続的改善につなげる

**実行手順**:

1. 以下のソースから未タスクを検出:

| ソース                 | 確認項目                      | Grepパターン例                                      |
| ---------------------- | ----------------------------- | --------------------------------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| Phase 9レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-9/`                                  |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                 |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |

2. 検出された未タスクをレポートにまとめる

3. 必要に応じて未タスク指示書を作成:
   - 配置先: `docs/30-workflows/unassigned-task/`

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md` - 未タスク検出レポート
- `docs/30-workflows/unassigned-task/task-XX-XX-*.md` - 未タスク指示書（該当時）

---

## 参照資料

| 参照資料                 | パス                                  | 内容                    |
| ------------------------ | ------------------------------------- | ----------------------- |
| Phase 11成果物           | `outputs/phase-11/`                   | 手動テスト結果          |
| 既存インターフェース仕様 | `references/interfaces-rag-search.md` | RAG検索インターフェース |
| 既存アーキテクチャ仕様   | `references/architecture-rag.md`      | RAGアーキテクチャ       |

---

## 成果物

| 成果物               | パス                                                  | 内容                     |
| -------------------- | ----------------------------------------------------- | ------------------------ |
| APIドキュメント更新  | `outputs/phase-12/api-doc-update.md`                  | API/インターフェース更新 |
| 実装ガイド           | `references/implementation-guide-fusion-reranking.md` | 開発者向けガイド         |
| 実装ガイド作成記録   | `outputs/phase-12/implementation-guide.md`            | 作成記録                 |
| 使用例ドキュメント   | `references/usage-examples-fusion-reranking.md`       | 使用例集                 |
| 使用例作成記録       | `outputs/phase-12/usage-examples.md`                  | 作成記録                 |
| JSDocチェック記録    | `outputs/phase-12/jsdoc-check.md`                     | JSDoc確認結果            |
| README更新記録       | `outputs/phase-12/readme-update.md`                   | README更新内容           |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md`        | システム仕様更新記録     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`          | 検出された未タスク       |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`（該当時）        | 未タスク指示書           |

---

## 完了条件

- [ ] API/インターフェースドキュメントが更新されている
- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] 使用例ドキュメントが作成されている
- [ ] JSDocコメントが十分に記載されている
- [ ] READMEが更新されている（必要な場合）
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/rrf-fusion-reranking/phase-13-pr-creation.md`
