# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 7（テストカバレッジ確認） |
| ステータス | 未実施                          |
| 作成日     | 2026-01-18                      |
| 機能名     | graph-search-performance        |

---

## 目的

実装済みキャッシュに対するテストを拡充し、カバレッジ基準と統合テスト要件を満たす。

## 背景

Phase 5でキャッシュを実装したため、TTL、maxSize、キャッシュ無効時の挙動を追加テストで網羅する必要がある。

---

## 使用スキル

- `aiworkflow-requirements`: テスト設計が仕様に沿うか確認する。

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm test:coverage

# 統合テスト実行
pnpm test:integration

# E2Eテスト実行
pnpm test:e2e
```

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ測定

**目的**: 現在のカバレッジと不足領域を把握する。

**実行手順**:

1. `pnpm test:coverage` を実行してカバレッジを取得する。
2. GraphSearchStrategyとキャッシュモジュールの未到達行を整理する。
3. `outputs/phase-6/coverage-report.md` に記録する。

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

---

### タスク2: 追加テスト作成

**目的**: TTL、maxSize、キャッシュ無効化の挙動を追加テストで検証する。

**実行手順**:

1. TTL経過後の再生成を検証するテストを追加する。
2. maxSize超過時のLRU退避を検証するテストを追加する。
3. cache.enabledがfalseのときにEmbeddingProviderが毎回呼ばれることを検証する。
4. `packages/shared/src/services/search/strategies/__tests__/` にテストを追加する。

**期待される成果物**:

- `packages/shared/src/services/search/strategies/__tests__/graph-search-cache.test.ts`
- `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`

---

### タスク3: 統合テスト拡充

**目的**: 統合テストでキャッシュ挙動とエラーハンドリングを確認する。

**実行手順**:

1. EmbeddingProviderエラー時にキャッシュが汚染されないことを検証する。
2. キャッシュ有効時の検索フローを統合テストで確認する。
3. `outputs/phase-6/integration-test.md` に実行結果を記録する。

**期待される成果物**:

- `outputs/phase-6/integration-test.md`

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

| 参照資料       | パス                                         | 内容           |
| -------------- | -------------------------------------------- | -------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`  | 実装内容       |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      | テスト設計     |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | 統合テスト設計 |

---

## 成果物

| 成果物             | パス                                                        | 内容               |
| ------------------ | ----------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                        | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                       | 統合テスト実行結果 |
| 追加テストコード   | `packages/shared/src/services/search/strategies/__tests__/` | 追加テスト         |

---

## 統合テスト連携（Phase 1〜11は必須）

| テストカテゴリ     | 検証項目                            | 目標 |
| ------------------ | ----------------------------------- | ---- |
| API接続テスト      | EmbeddingProvider呼び出しの抑制     | 100% |
| データフローテスト | Query→Embedding→GraphStore→Results  | 100% |
| エラーハンドリング | EmbeddingProvider失敗時の復帰       | 80%+ |
| 認証連携テスト     | GraphSearchStrategyは認証を扱わない | 0%   |
| 状態同期テスト     | キャッシュヒット時の再利用確認      | 100% |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成している
- [ ] 結合テストカバレッジ基準を達成している
- [ ] 統合テストの追加が完了している
- [ ] フロントエンド・バックエンド接続テストが成功している
- [ ] カバレッジレポートが出力されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 6
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 実行タスク

| タスク         | 結果   | 備考 |
| -------------- | ------ | ---- |
| カバレッジ測定 | 未実施 |      |
| 追加テスト作成 | 未実施 |      |
| 統合テスト拡充 | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 7: テストカバレッジ確認

`docs/30-workflows/graph-search-performance/phase-7-coverage-check.md`
