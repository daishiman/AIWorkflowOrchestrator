# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11              |
| 後続Phase  | Phase 13              |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

コードと同期したドキュメントを維持することで、開発者体験を向上させ、保守性を高める。特にHybridRAGシステムの一部としての使用方法を明確にする。また、Phase 1-11で発見された未完了タスクを適切に記録し、技術的負債を可視化する。

---

## サブフェーズ構成

Phase 12は以下の3つのサブフェーズで構成される:

| サブフェーズ | 名称                     | 必須 | 説明                                    |
| ------------ | ------------------------ | ---- | --------------------------------------- |
| 12-1         | 実装ガイド作成           | ✅   | 概念的説明 + 技術的詳細のドキュメント化 |
| 12-2         | システムドキュメント更新 | ✅   | 既存ドキュメントへの反映                |
| 12-3         | 未タスク検出             | ✅   | 技術的負債の可視化と継続的改善          |

---

## 実行タスク

> 以下のサブフェーズを順番に実行してください。

### Phase 12-1: 実装ガイド作成【必須】

**目的**: 実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化

**2パート構成**:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**ドキュメント要件**:

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

**記述原則**:

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

**実行手順**:

1. 概念的説明（Part 1）の作成
   - GraphSearchStrategyの役割を比喩で説明
   - 3つのクエリタイプ（local/global/relationship）をわかりやすく解説
   - Knowledge Graphの概念を図解
2. 技術的詳細（Part 2）の作成
   - クラス構造とメソッドの詳細説明
   - 使用例・コードスニペット
   - 設定オプションの説明

**期待される成果物**:

- 実装ガイド（`outputs/phase-12/implementation-guide.md`）

---

### Phase 12-2: システムドキュメント更新

**目的**: 既存ドキュメントへの反映とaiworkflow-requirements更新

**更新対象**:

| 更新対象                                             | 更新内容                    |
| ---------------------------------------------------- | --------------------------- |
| `docs/api/graph-search-strategy.md`                  | APIリファレンス（新規作成） |
| `docs/guides/graph-search-usage.md`                  | 使用ガイド（新規作成）      |
| `.claude/skills/aiworkflow-requirements/references/` | 該当する場合、仕様を更新    |
| `CHANGELOG.md`                                       | 機能追加エントリ            |

**更新原則**:

- 概要のみ記載、Single Source of Truth遵守
- 詳細は実装ガイドを参照

**実行手順**:

1. APIリファレンス作成（`docs/api/graph-search-strategy.md`）
   - クラス概要・コンストラクタ・メソッド
   - パラメータ・戻り値
   - 使用例
2. 使用ガイド作成（`docs/guides/graph-search-usage.md`）
   - 基本的な使用方法
   - HybridRAGSearcherとの統合
   - クエリタイプごとの使い分け
3. aiworkflow-requirements更新（該当する場合）
   - 検索インターフェース仕様に追記
4. CHANGELOG更新
   - GraphSearchStrategy追加を記載
5. 更新記録の作成

**期待される成果物**:

- ドキュメント更新記録（`outputs/phase-12/documentation-update-log.md`）

---

### Phase 12-3: 未タスク検出【必須】

**目的**: 技術的負債の可視化と継続的改善

**検出ソース**:

| #   | ソース                 | 確認項目                      | Grepパターン例                                      |
| --- | ---------------------- | ----------------------------- | --------------------------------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                                 |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                                 |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |

**実行手順**:

1. 上記ソースから未完了タスクを検出
2. 検出結果をカテゴリ別に整理
3. 未タスク検出レポートを作成
4. 該当する場合、未完了タスク指示書を作成

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-report.md`）
- 未完了タスク指示書（`docs/30-workflows/unassigned-task/*.md`）※該当時

---

## 参照資料

| 参照資料       | パス                                                                      | 内容           |
| -------------- | ------------------------------------------------------------------------- | -------------- |
| 実装コード     | `packages/shared/src/services/search/strategies/graph-search-strategy.ts` | 実装           |
| 手動テスト結果 | `outputs/phase-11/manual-test-checklist.md`                               | Phase 11成果物 |
| Phase 3結果    | `outputs/phase-3/design-review-result.md`                                 | 設計レビュー   |
| Phase 10結果   | `outputs/phase-10/final-review-result.md`                                 | 最終レビュー   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料        | パス                                                                         | 内容             |
| --------------- | ---------------------------------------------------------------------------- | ---------------- |
| ISearchStrategy | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | インターフェース |
| アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | 全体構成         |

---

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| APIリファレンス      | `docs/api/graph-search-strategy.md`            | ✅   | API仕様書                 |
| 使用ガイド           | `docs/guides/graph-search-usage.md`            | ✅   | 使い方ガイド              |
| CHANGELOG            | `CHANGELOG.md`                                 | ✅   | 変更履歴                  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## 統合テスト連携【必須】

ドキュメント内のコード例が動作することを確認:

```bash
# ドキュメント内コード例のテスト（存在する場合）
pnpm test:docs -- --filter="GraphSearchStrategy"

# 型チェック（コード例の構文確認）
pnpm typecheck

# ビルド確認
pnpm build
```

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] APIリファレンスが作成されている
- [ ] 使用ガイドが作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] CHANGELOGが更新されている
- [ ] コード例が正しく動作する
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13: PR作成 へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（実装コード、手動テスト結果、レビュー結果）
2. Phase 12-1: 実装ガイド作成（Part 1: 概念的説明）
3. Phase 12-1: 実装ガイド作成（Part 2: 技術的詳細）
4. Phase 12-2: APIリファレンス作成
5. Phase 12-2: 使用ガイド作成
6. Phase 12-2: CHANGELOG更新
7. Phase 12-2: ドキュメント更新記録作成
8. Phase 12-3: 未タスク検出レポート作成
9. Phase 12-3: 未完了タスク指示書作成（該当時）
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 12
```

---

## Phase実行記録

| 項目            | 内容                     |
| --------------- | ------------------------ |
| 実行開始日時    | {{EXECUTION_START}}      |
| 実行完了日時    | {{EXECUTION_END}}        |
| 実行者          | {{EXECUTOR}}             |
| 成果物確認      | [ ] 全て生成済み         |
| artifacts.json  | [ ] 更新済み             |
| 次Phase移行可否 | [ ] 可 / [ ] 否（理由:） |

---

## APIリファレンス テンプレート

```markdown
# GraphSearchStrategy

Knowledge Graphを活用した検索戦略。エンティティベースのローカル検索、コミュニティサマリベースのグローバル検索、関係ベースの検索を提供する。

## クラス概要

\`\`\`typescript
class GraphSearchStrategy implements ISearchStrategy {
readonly name = "graph";

constructor(
graphStore: IKnowledgeGraphStore,
embeddingProvider: IEmbeddingProvider,
communitySummarizer?: ICommunitySummarizer
);

search(
query: string,
limit: number,
filters?: SearchFilters,
options?: GraphSearchOptions
): Promise<Result<SearchResultItem[], Error>>;

getMetrics(): StrategyMetric;
}
\`\`\`

## コンストラクタ

### パラメータ

| パラメータ          | 型                   | 必須 | 説明                     |
| ------------------- | -------------------- | ---- | ------------------------ |
| graphStore          | IKnowledgeGraphStore | ✓    | Knowledge Graph Store    |
| embeddingProvider   | IEmbeddingProvider   | ✓    | 埋め込みプロバイダー     |
| communitySummarizer | ICommunitySummarizer |      | コミュニティサマライザー |

## メソッド

### search()

クエリを実行し、関連するコンテンツを検索する。

#### パラメータ

| パラメータ | 型                 | 必須 | 説明           |
| ---------- | ------------------ | ---- | -------------- |
| query      | string             | ✓    | 検索クエリ     |
| limit      | number             | ✓    | 最大結果数     |
| filters    | SearchFilters      |      | フィルタ条件   |
| options    | GraphSearchOptions |      | 検索オプション |

#### 戻り値

`Promise<Result<SearchResultItem[], Error>>`

## 使用例

\`\`\`typescript
const strategy = new GraphSearchStrategy(
graphStore,
embeddingProvider,
communitySummarizer
);

// ローカル検索
const localResult = await strategy.search(
"TypeScriptの型定義について",
10,
undefined,
{ queryType: "local" }
);

// グローバル検索
const globalResult = await strategy.search(
"プロジェクト全体の設計思想",
10,
undefined,
{ queryType: "global" }
);

// 関係検索
const relationResult = await strategy.search(
"UserServiceとDatabaseの関連",
10,
undefined,
{ queryType: "relationship" }
);
\`\`\`
```

---

## 使用ガイド テンプレート

```markdown
# GraphSearchStrategy 使用ガイド

## 概要

GraphSearchStrategyは、HybridRAGシステムの第3の検索戦略として、Knowledge Graphを活用した検索を提供します。

## クエリタイプ

### 1. ローカル検索（local）

エンティティベースの検索。特定のトピックに関する詳細情報を取得する場合に使用。

**適したクエリ例**:

- 「TypeScriptの型定義について」
- 「Reactのコンポーネントライフサイクル」

### 2. グローバル検索（global）

コミュニティサマリベースの検索。プロジェクト全体の俯瞰的な情報を取得する場合に使用。

**適したクエリ例**:

- 「プロジェクト全体の設計思想」
- 「システムの主要コンポーネント」

### 3. 関係検索（relationship）

エンティティ間の関係を検索。複数の概念間のつながりを調べる場合に使用。

**適したクエリ例**:

- 「UserServiceとDatabaseの関連」
- 「APIエンドポイントとデータモデルの関係」

## HybridRAGSearcherとの統合

\`\`\`typescript
const searcher = new HybridRAGSearcher({
strategies: [
new KeywordSearchStrategy(fts5Engine),
new VectorSearchStrategy(vectorStore, embeddingProvider),
new GraphSearchStrategy(graphStore, embeddingProvider, communitySummarizer),
],
mergeStrategy: new RRFMergeStrategy(),
});
\`\`\`
```

---

## CHANGELOG エントリ例

```markdown
## [Unreleased]

### Added

- `GraphSearchStrategy`: Knowledge Graphを活用した検索戦略
  - ローカル検索（エンティティベース）
  - グローバル検索（コミュニティサマリベース）
  - 関係検索（パスベース）
  - HybridRAGSearcherとの統合対応
```

---

## 未タスク検出レポート テンプレート

```markdown
# 未タスク検出レポート

## 検出日時

{{DETECTION_DATE}}

## 検出サマリ

| カテゴリ           | 検出数 |
| ------------------ | ------ |
| Phase 3指摘事項    | X件    |
| Phase 10指摘事項   | X件    |
| Phase 11発見事項   | X件    |
| コード内TODO/FIXME | X件    |
| **合計**           | X件    |

## 検出詳細

### Phase 3レビュー結果からの検出

（なしの場合は「検出なし」と記載）

### Phase 10レビュー結果からの検出

（なしの場合は「検出なし」と記載）

### Phase 11手動テスト結果からの検出

（なしの場合は「検出なし」と記載）

### コードベースからの検出

（なしの場合は「検出なし」と記載）

## 未完了タスク指示書

（作成した場合はパスを記載、なしの場合は「作成なし」と記載）
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-13-pr.md`
