# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 前提Phase  | Phase 4（テスト作成）    |
| 後続Phase  | Phase 6（テスト拡充）    |
| ステータス | 未実施                   |
| 作成日     | 2026-01-18               |
| 機能名     | graph-search-performance |

---

## 目的

GraphSearchStrategyにLRUキャッシュを実装し、テストを通す最小限の変更で埋め込み再利用を実現する。

## 背景

GraphSearchStrategyはクエリごとにEmbeddingProviderを呼び出しており、同一クエリの反復で無駄な呼び出しが発生する。キャッシュを実装してコストと応答時間のばらつきを抑える。

---

## 使用スキル

- `aiworkflow-requirements`: 実装が既存仕様と整合するか確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: キャッシュ実装の追加

**目的**: クエリ埋め込みのLRUキャッシュを実装する。

**実行手順**:

1. `packages/shared/src/services/search/strategies/` 配下にキャッシュ実装を追加する。
2. キャッシュエントリに `embedding` と `timestamp` を持たせる。
3. maxSize超過時に古いエントリを削除する。
4. TTL超過時にキャッシュミスとして扱う。
5. `outputs/phase-5/implementation-summary.md` に実装概要を記録する。

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`
- `packages/shared/src/services/search/strategies/graph-search-embedding-cache.ts`

---

### タスク2: GraphSearchStrategyへの統合

**目的**: キャッシュをGraphSearchStrategyの埋め込み生成に統合する。

**実行手順**:

1. `GraphSearchOptions` にキャッシュ設定（enabled, maxSize, ttlMs）を追加する。
2. `generateQueryEmbedding` を `getOrGenerateEmbedding` に置き換える。
3. キャッシュ無効時は従来の挙動に一致させる。
4. `GraphSearchStrategy` に `getCacheStats()` と `clearCache()` を追加する。
5. `outputs/phase-5/implementation-summary.md` に変更点を記録する。

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`
- `packages/shared/src/services/search/strategies/graph-search-strategy.ts`

---

### タスク3: メトリクス更新

**目的**: キャッシュヒット率とメトリクス取得の経路を整備する。

**実行手順**:

1. キャッシュのヒット数・ミス数を計測する。
2. `getCacheStats()` でヒット率を取得できるようにする。
3. StrategyMetricは既存項目を維持し、追加情報はキャッシュ統計で提供する。
4. `outputs/phase-5/implementation-summary.md` に記録する。

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

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
| テスト仕様書     | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース     | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テスト設計   | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | 判定結果           |
| キャッシュ設計   | `outputs/phase-2/cache-design.md`            | LRU/TTL設計        |
| API仕様          | `outputs/phase-2/api-specification.md`       | オプション追加仕様 |

---

## 成果物

| 成果物         | パス                                                                             | 内容                   |
| -------------- | -------------------------------------------------------------------------------- | ---------------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`                                      | 変更点と設計準拠の記録 |
| 実装コード     | `packages/shared/src/services/search/strategies/graph-search-strategy.ts`        | キャッシュ統合         |
| キャッシュ実装 | `packages/shared/src/services/search/strategies/graph-search-embedding-cache.ts` | LRUキャッシュ実装      |

---

## 統合テスト連携（Phase 1〜11は必須）

- キャッシュ有効時の検索フローが統合テストで確認できるようにする。
- EmbeddingProviderの呼び出し回数を検証できるモックを維持する。
- GraphStoreとCommunitySummarizerの統合シナリオを影響なく通過させる。

---

## 完了条件

- [ ] キャッシュ実装が完了している
- [ ] GraphSearchStrategyがキャッシュを使用する
- [ ] キャッシュ統計が取得できる
- [ ] すべてのテストが成功状態（Green）になる

---

## TDD検証

```bash
# テスト実行コマンド
pnpm test
```

- [ ] テストが成功することを確認（Green状態）

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 5
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

| タスク                      | 結果   | 備考 |
| --------------------------- | ------ | ---- |
| キャッシュ実装の追加        | 未実施 |      |
| GraphSearchStrategyへの統合 | 未実施 |      |
| メトリクス更新              | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 6: テスト拡充

`docs/30-workflows/graph-search-performance/phase-6-test-expansion.md`
