# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成                    |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-18                    |
| 機能名     | graph-search-performance      |

---

## 目的

キャッシュ導入に対する期待動作を検証するテストを実装前に作成し、Red状態を確立する。

## 背景

GraphSearchStrategyのキャッシュ導入は性能と挙動に影響するため、先にテストを作成して要求の検証可能性を確保する。

---

## 使用スキル

- `aiworkflow-requirements`: 仕様準拠のテスト観点を整理する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト仕様とケース作成

**目的**: 受け入れ基準をテストケースに落とし込む。

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` を参照し、テスト観点を抽出する。
2. ユニットテストと統合テストの境界を定義する。
3. `outputs/phase-4/test-specification.md`、`outputs/phase-4/test-cases.md`、`outputs/phase-4/integration-test-design.md` を作成する。

**期待される成果物**:

- `outputs/phase-4/test-specification.md`
- `outputs/phase-4/test-cases.md`
- `outputs/phase-4/integration-test-design.md`

---

### タスク2: ユニットテスト作成（Red）

**目的**: LRU/TTLキャッシュとGraphSearchStrategyの挙動を検証するユニットテストを作成する。

**実行手順**:

1. キャッシュクラスのget/set/evict/ttlを検証するテストを作成する。
2. GraphSearchStrategyでキャッシュヒットとミスを検証するテストを作成する。
3. テストが失敗する状態（Red）であることを確認する。

**期待される成果物**:

- `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`
- `packages/shared/src/services/search/strategies/__tests__/graph-search-cache.test.ts`

---

### タスク3: 統合テスト作成（Red）

**目的**: EmbeddingProviderやGraphStoreと連携したキャッシュ挙動を検証する。

**実行手順**:

1. EmbeddingProviderモックで呼び出し回数を検証する統合テストを作成する。
2. キャッシュ無効時の挙動が現行と一致することを検証する。
3. テストが失敗する状態（Red）であることを確認する。

**期待される成果物**:

- `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.integration.test.ts`

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

| 参照資料         | パス                                         | 内容               |
| ---------------- | -------------------------------------------- | ------------------ |
| 要件定義         | `outputs/phase-1/requirements-definition.md` | 要件一覧           |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準       |
| スコープ定義     | `outputs/phase-1/scope-definition.md`        | 対象範囲と対象外   |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | 判定結果           |
| キャッシュ設計   | `outputs/phase-2/cache-design.md`            | LRU/TTL設計        |
| API仕様          | `outputs/phase-2/api-specification.md`       | オプション追加仕様 |

---

## 成果物

| 成果物         | パス                                                        | 内容               |
| -------------- | ----------------------------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                     | テスト設計         |
| テストケース   | `outputs/phase-4/test-cases.md`                             | ケース一覧         |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md`                | 統合テストシナリオ |
| テストコード   | `packages/shared/src/services/search/strategies/__tests__/` | テスト実装         |

---

## 統合テスト連携（Phase 1〜11は必須）

| シナリオカテゴリ   | 検証内容                                                 | テストファイル                              |
| ------------------ | -------------------------------------------------------- | ------------------------------------------- |
| API接続テスト      | EmbeddingProvider呼び出し回数の検証                      | `graph-search-strategy.integration.test.ts` |
| データフローテスト | Query→Embedding→GraphStore→Resultsの流れ                 | `graph-search-strategy.integration.test.ts` |
| エラーハンドリング | EmbeddingProvider失敗時のエラー伝播                      | `graph-search-strategy.integration.test.ts` |
| 認証連携テスト     | GraphSearchStrategyは認証情報を扱わないため対象外        | `graph-search-strategy.integration.test.ts` |
| 状態同期テスト     | キャッシュヒット時に埋め込み再生成が発生しないことを検証 | `graph-search-strategy.integration.test.ts` |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が記載されている

---

## TDD検証

```bash
# テスト実行コマンド
pnpm test
```

- [ ] テストが失敗することを確認（Red状態）

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 4
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

| タスク                    | 結果   | 備考 |
| ------------------------- | ------ | ---- |
| テスト仕様とケース作成    | 未実施 |      |
| ユニットテスト作成（Red） | 未実施 |      |
| 統合テスト作成（Red）     | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 5: 実装

`docs/30-workflows/graph-search-performance/phase-5-implementation.md`
