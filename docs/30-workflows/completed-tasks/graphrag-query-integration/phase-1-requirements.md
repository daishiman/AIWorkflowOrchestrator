# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| 前提Phase  | -                          |
| 後続Phase  | Phase 2                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

GraphRAGクエリへのコミュニティ要約統合に必要な要件を定義し、受け入れ基準を明確化する。既存のICommunitySummarizerインターフェースとの統合ポイントを特定し、実装スコープを確定させる。

## 背景

CONV-08-03で実装されたコミュニティ要約機能（ICommunitySummarizer.searchSummaries()）を、クエリ処理フローに統合する必要がある。現状では要約は生成・保存されているが、実際のクエリ応答には活用されていない。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存システム仕様の確認

**目的**: 既存のインターフェース仕様と整合性のある要件を定義するため、関連仕様を確認する

**実行手順**:

1. ICommunitySummarizer インターフェース仕様を確認する
   - `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md`
   - `searchSummaries()` メソッドのシグネチャと戻り値を確認
   - `CommunitySummary` 型の構造を確認
   - `CommunitySummarySearchOptions` 型のオプションを確認

2. RAGアーキテクチャ設計を確認する
   - `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`
   - クエリ分類器の位置づけを確認
   - HybridRAG検索パイプラインの構成を確認

3. 検索クエリ・結果型定義を確認する
   - `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`
   - `SearchResultItem` 型のcommunity対応状況を確認
   - `SearchResultType` に `community` が含まれることを確認

4. 既存実装コードベースを調査する
   - `packages/shared/src/services/search/` 配下の構造を把握
   - 既存のQuery Handler/検索サービスの実装パターンを確認

**期待される成果物**:

- システム仕様との整合性確認結果
- 既存実装パターンの把握メモ

---

### タスク2: 機能要件の定義

**目的**: コミュニティ要約統合の機能要件を明確に定義する

**実行手順**:

1. コア機能要件を定義する

| ID     | 要件                         | 優先度 | 説明                                           |
| ------ | ---------------------------- | ------ | ---------------------------------------------- |
| FR-001 | セマンティック検索統合       | 必須   | クエリからコミュニティ要約をセマンティック検索 |
| FR-002 | コンテキスト統合             | 必須   | 取得した要約を回答生成プロンプトに統合         |
| FR-003 | 階層レベルフィルタリング     | 推奨   | 特定レベルのコミュニティのみ検索可能           |
| FR-004 | スコアベースランキング       | 必須   | 類似度スコアによる検索結果のランキング         |
| FR-005 | confidence閾値フィルタリング | 推奨   | 低confidence要約の除外オプション               |
| FR-006 | 検索結果数制限               | 必須   | 最大取得件数（limit）のサポート                |
| FR-007 | フォールバック処理           | 必須   | 要約なし時の通常回答生成へのフォールバック     |

2. データフロー要件を定義する

```
ユーザークエリ
    ↓
クエリ埋め込み生成
    ↓
ICommunitySummarizer.searchSummaries()
    ↓
CommunitySummary[] 取得
    ↓
回答生成プロンプトに統合
    ↓
LLM回答生成
    ↓
ユーザーへの回答
```

3. 入出力仕様を定義する

**入力**:

- ユーザークエリ（string）
- 検索オプション（limit, level, confidenceThreshold）

**出力**:

- 回答テキスト（コミュニティ要約を反映）
- 参照したコミュニティ要約情報（オプション）

**期待される成果物**:

- 機能要件一覧
- データフロー図
- 入出力仕様

---

### タスク3: 非機能要件の定義

**目的**: パフォーマンス、型安全性、テスタビリティ等の非機能要件を定義する

**実行手順**:

1. パフォーマンス要件を定義する

| 項目               | 要件                 | 基準                             |
| ------------------ | -------------------- | -------------------------------- |
| 検索レイテンシ     | 要約検索時間         | < 100ms（limit=10の場合）        |
| コンテキスト長制限 | プロンプトトークン数 | 既存制限内に収まること           |
| 並行リクエスト     | 同時クエリ処理       | 既存パフォーマンスを劣化させない |

2. 型安全性要件を定義する

| 項目          | 要件               | 基準                       |
| ------------- | ------------------ | -------------------------- |
| Branded Types | CommunityId使用    | 既存パターンに準拠         |
| Result型      | エラーハンドリング | success/data/errorパターン |
| 厳密な型定義  | any型禁止          | TypeScript strict mode準拠 |

3. テスタビリティ要件を定義する

| 項目             | 要件                 | 基準                         |
| ---------------- | -------------------- | ---------------------------- |
| DI対応           | インターフェース注入 | ICommunitySummarizer注入可能 |
| モック可能性     | 外部依存のモック化   | LLM/Embedding のモック可能   |
| 単体テスト可能性 | 純粋関数の分離       | 副作用を持つ処理の分離       |

**期待される成果物**:

- 非機能要件一覧

---

### タスク4: 受け入れ基準の定義

**目的**: 実装完了を判断するための具体的な受け入れ基準を定義する

**実行手順**:

1. 機能テストシナリオを定義する

| ID   | シナリオ                           | 期待結果                         |
| ---- | ---------------------------------- | -------------------------------- |
| AC01 | 関連コミュニティが存在するクエリ   | 要約がコンテキストに含まれる     |
| AC02 | 関連コミュニティがないクエリ       | 通常の回答生成（フォールバック） |
| AC03 | 階層レベル指定検索                 | 指定レベルの要約のみ返される     |
| AC04 | 複数コミュニティがマッチするクエリ | スコア順でランキング             |
| AC05 | confidence閾値によるフィルタリング | 低confidence要約が除外される     |
| AC06 | limit指定による結果数制限          | 指定件数以下の結果が返される     |

2. 品質基準を定義する

| 項目           | 基準                 |
| -------------- | -------------------- |
| ユニットテスト | Line Coverage 80%+   |
| 統合テスト     | E2Eフロー検証成功    |
| 型チェック     | TypeScriptエラーなし |
| Lint           | ESLintエラーなし     |

**期待される成果物**:

- 受け入れ基準一覧
- テストシナリオ定義

---

### タスク5: 要件定義ドキュメントの作成

**目的**: 上記で定義した要件を正式なドキュメントとして出力する

**実行手順**:

1. `outputs/phase-1/requirements.md` に要件定義書を作成
2. 機能要件、非機能要件、受け入れ基準を統合
3. スコープ（含むもの/含まないもの）を明記

**期待される成果物**:

- `outputs/phase-1/requirements.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                          | 内容                       |
| -------------------- | --------------------------------------------------------------------------------------------- | -------------------------- |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | ICommunitySummarizer定義   |
| コミュニティ検出仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | ICommunityDetector定義     |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | 全体アーキテクチャ         |
| 検索型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | SearchQuery/SearchResult型 |

---

## 成果物

| 成果物     | パス                              | 内容                     |
| ---------- | --------------------------------- | ------------------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 機能/非機能/受け入れ基準 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1での統合テスト連携アクション**:

接続要件（ICommunitySummarizer/Query Handler）を要件に明記すること。

具体的には以下を要件に含める:

- ICommunitySummarizer.searchSummaries() との接続要件
- Query Handler → CommunitySummarizer の依存注入要件
- クエリ埋め込み生成 → 要約検索 → 回答生成のデータフロー

---

## 完了条件

- [ ] ICommunitySummarizer インターフェース仕様を確認済み
- [ ] RAGアーキテクチャ設計を確認済み
- [ ] 機能要件（FR-001〜FR-007）が定義されている
- [ ] 非機能要件が定義されている
- [ ] 受け入れ基準（AC01〜AC06）が定義されている
- [ ] スコープ（含むもの/含まないもの）が明記されている
- [ ] `outputs/phase-1/requirements.md` が作成されている
- [ ] 統合テスト接続要件が要件に含まれている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初回Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-2-design.md`
