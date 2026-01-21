# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 3                        |
| Phase名    | 設計レビューゲート       |
| 前提Phase  | Phase 2（設計）          |
| 後続Phase  | Phase 4（テスト作成）    |
| ステータス | 未実施                   |
| 作成日     | 2026-01-18               |
| 機能名     | graph-search-performance |

---

## 目的

要件と設計の整合性をレビューし、実装開始前にリスクを解消する。

## 背景

キャッシュ導入は検索処理の性能と挙動に影響するため、設計レビューで仕様準拠とテスト観点を確定させる必要がある。

---

## 使用スキル

- `aiworkflow-requirements`: 仕様準拠確認に使用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件適合レビュー

**目的**: 設計がPhase 1の要件と一致しているか確認する。

**実行手順**:

1. `outputs/phase-1/requirements-definition.md` と `outputs/phase-2/architecture-design.md` を比較する。
2. 受け入れ基準と設計が一致する点を確認する。
3. 差分があれば修正案を記録する。

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

### タスク2: 仕様準拠レビュー

**目的**: システム仕様に沿った設計になっているか確認する。

**実行手順**:

1. GraphSearchStrategyの仕様（interfaces-rag-search）との整合を確認する。
2. Embedding Generation APIのエラー仕様とキャッシュエラーの扱いを確認する。
3. 設計書に不足があれば追記内容を整理する。

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

### タスク3: 統合テスト観点レビュー

**目的**: 統合テスト計画が要件を満たすか確認する。

**実行手順**:

1. キャッシュ有効/無効のシナリオが含まれているか確認する。
2. EmbeddingProvider呼び出し回数の検証方法が定義されているか確認する。
3. 不足があれば改善点を記録する。

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

---

## レビュー結果判定

| 判定     | 条件                         | 次のアクション            |
| -------- | ---------------------------- | ------------------------- |
| PASS     | 指摘なし                     | Phase 4へ進行             |
| MINOR    | 軽微な指摘のみ               | 指摘修正後にPhase 4へ進行 |
| MAJOR    | 仕様逸脱または設計欠陥がある | Phase 2へ戻る             |
| CRITICAL | 要件不一致がある             | Phase 1へ戻る             |

---

## 戻り先決定基準

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| 品質の問題       | Phase 8（リファクタリング） |

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

| 参照資料           | パス                                         | 内容                   |
| ------------------ | -------------------------------------------- | ---------------------- |
| 要件定義           | `outputs/phase-1/requirements-definition.md` | 要件一覧               |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準           |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | 対象範囲と対象外       |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | 依存関係とデータフロー |
| キャッシュ設計     | `outputs/phase-2/cache-design.md`            | LRU/TTL設計            |
| API仕様            | `outputs/phase-2/api-specification.md`       | オプション追加仕様     |

---

## 成果物

| 成果物       | パス                                      | 内容               |
| ------------ | ----------------------------------------- | ------------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果と指摘事項 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト観点（API接続、データフロー、エラーハンドリング、認証、状態同期）をレビュー対象に含める。
- キャッシュ有効化時の埋め込み再利用が確認できるテスト観点を明記する。

---

## 完了条件

- [ ] 要件と設計の一致が確認されている
- [ ] 仕様準拠レビューが完了している
- [ ] 統合テスト観点レビューが完了している
- [ ] レビュー結果が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 3
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 3 実行記録

### 実行タスク

| タスク                 | 結果   | 備考 |
| ---------------------- | ------ | ---- |
| 要件適合レビュー       | 未実施 |      |
| 仕様準拠レビュー       | 未実施 |      |
| 統合テスト観点レビュー | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 4: テスト作成

`docs/30-workflows/graph-search-performance/phase-4-test-creation.md`
