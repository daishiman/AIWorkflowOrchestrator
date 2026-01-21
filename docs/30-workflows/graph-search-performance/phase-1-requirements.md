# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 前提Phase  | なし（開始Phase）        |
| 後続Phase  | Phase 2（設計）          |
| ステータス | 未実施                   |
| 作成日     | 2026-01-18               |
| 機能名     | graph-search-performance |

---

## 目的

GraphSearchStrategyのクエリ埋め込みキャッシュ導入に必要な要件、受け入れ基準、スコープを明文化する。

## 背景

GraphSearchStrategyの品質保証レビューで、同一クエリの反復実行時に埋め込み生成APIが毎回呼び出される課題が記録された。APIコストと応答時間の変動を抑えるため、クエリ埋め込みのキャッシュ方針を確定する。

---

## 使用スキル

- `aiworkflow-requirements`: 既存仕様との整合確認に使用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件抽出

**目的**: キャッシュ導入に必要な機能要件と非機能要件を整理する。

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-graph-search-performance.md` を確認する。
2. GraphSearchStrategyの現行フロー（EmbeddingProvider呼び出し）を整理する。
3. 機能要件（キャッシュ有効化、TTL、maxSize、メトリクス公開）を定義する。
4. 非機能要件（応答時間、メモリ上限、エラー時の挙動）を整理する。
5. `outputs/phase-1/requirements-definition.md` に記載する。

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 受け入れ基準の定義

**目的**: 実装完了後に検証できる受け入れ基準を定義する。

**実行手順**:

1. キャッシュヒット時の挙動（EmbeddingProvider未呼び出し）を基準化する。
2. TTL経過後の再生成、maxSize超過時のLRU退避を基準化する。
3. キャッシュ無効時の挙動が現行仕様と一致する条件を記述する。
4. `outputs/phase-1/acceptance-criteria.md` に記載する。

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: スコープ定義

**目的**: 対象範囲と対象外範囲を明確にする。

**実行手順**:

1. GraphSearchStrategy内部の埋め込み生成を対象範囲として明記する。
2. 外部キャッシュ統合や永続化は対象外と明記する。
3. 変更対象のファイルと影響範囲を整理する。
4. `outputs/phase-1/scope-definition.md` に記載する。

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                          | 内容                            |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| 検索クエリ・結果型定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`  | GraphSearchStrategyと検索型定義 |
| RAG・Knowledge Graph設計 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`       | GraphRAG構成とKnowledge Graph型 |
| Embedding Generation API | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md` | 埋め込み生成APIとキャッシュ指標 |

**ユーザー指示**

| 参照資料       | パス                                                                 | 内容                 |
| -------------- | -------------------------------------------------------------------- | -------------------- |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-graph-search-performance.md` | 背景と改善要求の原文 |

---

## 成果物

| 成果物       | パス                                         | 内容                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な基準       |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と対象外範囲 |

---

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                                                       |
| ---------------- | ------------------------------------------------------------------------------ |
| API接続          | GraphSearchStrategy → EmbeddingProvider → GraphStoreの接続要件を要件に明記する |
| 認証フロー       | GraphSearchStrategyは認証を扱わないため対象外であることを明記する              |
| データフロー     | クエリ → 埋め込み生成 → グラフ検索 → 結果返却の流れを要件に含める              |

---

## 完了条件

- [ ] 要件が文書化されている
- [ ] 受け入れ基準が定量化されている
- [ ] スコープが明記されている
- [ ] 参照仕様との整合が確認されている
- [ ] 統合テスト連携の観点が要件に含まれている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 1
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

| タスク             | 結果   | 備考 |
| ------------------ | ------ | ---- |
| 要件抽出           | 未実施 |      |
| 受け入れ基準の定義 | 未実施 |      |
| スコープ定義       | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 2: 設計

`docs/30-workflows/graph-search-performance/phase-2-design.md`
