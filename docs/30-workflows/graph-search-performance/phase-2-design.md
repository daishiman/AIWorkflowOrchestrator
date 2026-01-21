# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-18                    |
| 機能名     | graph-search-performance      |

---

## 目的

キャッシュ導入の構造、API仕様、メトリクス取得方法を設計し、実装に必要な判断を固定する。

## 背景

GraphSearchStrategyは埋め込み生成を毎回実行している。CachedVectorSearchStrategyにはLRUキャッシュ実装があるため、同一設計原則でグラフ検索のキャッシュ設計を整理する。

---

## 使用スキル

- `aiworkflow-requirements`: 設計内容が既存仕様と一致するか確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状構造の整理

**目的**: GraphSearchStrategyの埋め込み生成経路と依存関係を明確にする。

**実行手順**:

1. `packages/shared/src/services/search/strategies/graph-search-strategy.ts` を読み、埋め込み生成の呼び出し位置を整理する。
2. CachedVectorSearchStrategyのキャッシュ実装を参照し、再利用できる設計要素を抽出する。
3. `outputs/phase-2/architecture-design.md` に依存関係とデータフローを記載する。

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### タスク2: キャッシュ設計の定義

**目的**: LRU、TTL、キー正規化、統計取得を含むキャッシュ仕様を確定する。

**実行手順**:

1. キャッシュの保持単位（クエリ文字列 → Float32Array）を定義する。
2. キー正規化ルール（trim、toLowerCase）を設計する。
3. TTLとmaxSizeの既定値と設定方法を決める。
4. ヒット数、ミス数、ヒット率の取得方法を設計する。
5. `outputs/phase-2/cache-design.md` に記録する。

**期待される成果物**:

- `outputs/phase-2/cache-design.md`

---

### タスク3: API仕様と拡張点の設計

**目的**: GraphSearchOptionsやコンストラクタ拡張の仕様を決定する。

**実行手順**:

1. `GraphSearchOptions` にキャッシュ設定を追加する案を整理する。
2. キャッシュ無効時の動作が現行と一致する条件を明記する。
3. `getCacheStats()` の公開有無と返却型を決定する。
4. `outputs/phase-2/api-specification.md` にまとめる。

**期待される成果物**:

- `outputs/phase-2/api-specification.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                          | 内容                            |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| 検索クエリ・結果型定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`  | GraphSearchStrategyと検索型定義 |
| RAG・Knowledge Graph設計 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`       | GraphRAG構成とKnowledge Graph型 |
| Embedding Generation API | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md` | 埋め込み生成APIとキャッシュ指標 |

**前Phase成果物**

| 参照資料     | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件一覧         |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と対象外 |

---

## 成果物

| 成果物             | パス                                     | 内容                    |
| ------------------ | ---------------------------------------- | ----------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 依存関係とデータフロー  |
| キャッシュ設計     | `outputs/phase-2/cache-design.md`        | LRU/TTL/統計設計        |
| API仕様            | `outputs/phase-2/api-specification.md`   | オプション追加と公開API |

---

## 統合テスト連携（Phase 1〜11は必須）

- キャッシュ有効時の検索フローを統合テストの対象に設定する。
- EmbeddingProvider呼び出し回数の検証方法を設計に含める。
- GraphStoreとCommunitySummarizerの接続点をテスト観点に明記する。

---

## 完了条件

- [ ] GraphSearchStrategyの依存関係が整理されている
- [ ] キャッシュ仕様（キー、TTL、maxSize、統計）が文書化されている
- [ ] API拡張点が定義されている
- [ ] 要件との整合が確認されている
- [ ] 統合テスト観点が設計に含まれている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

| スキル                  | 結果    | 備考                           |
| ----------------------- | ------- | ------------------------------ |
| aiworkflow-requirements | pending | 参照資料確認後に結果を記録する |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 2
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

| タスク                | 結果   | 備考 |
| --------------------- | ------ | ---- |
| 現状構造の整理        | 未実施 |      |
| キャッシュ設計の定義  | 未実施 |      |
| API仕様と拡張点の設計 | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 3: 設計レビューゲート

`docs/30-workflows/graph-search-performance/phase-3-design-review.md`
