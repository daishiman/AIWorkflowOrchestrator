# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| Phase名    | 設計                                  |
| 前提Phase  | Phase 1（要件定義）                   |
| 後続Phase  | Phase 3（設計レビュー）               |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

timeoutMs導入とエラーコード体系の設計を確定し、実装可能な設計ドキュメントを作成する。

## 背景

Phase 1で整理した要件を満たすために、GraphSearchOptions拡張とエラーコードの整合設計が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: タイムアウト設計

**目的**: timeoutMsの適用範囲と実装方針を設計する

**実行手順**:

1. GraphSearchOptionsにtimeoutMsを追加する設計を定義
2. GraphStore/Embedding呼び出しへの適用方法（AbortController/Promise.race）を決定
3. デフォルト値と上限値の方針を整理
4. `outputs/phase-2/timeout-design.md` に記載

**期待される成果物**:

- `outputs/phase-2/timeout-design.md`

---

### タスク2: エラーコード設計

**目的**: 既存のRAGエラーコード体系と整合する設計を確定する

**実行手順**:

1. `packages/shared/src/types/rag/errors.ts` の既存コードを確認
2. GraphStore/Embeddingのタイムアウトを表すエラーコードの方針を決定
3. ErrorContextに含める情報（timeoutMs、対象API、原因）を定義
4. `outputs/phase-2/error-code-design.md` に記載

**期待される成果物**:

- `outputs/phase-2/error-code-design.md`

---

### タスク3: 設計ドキュメント作成

**目的**: 要件と設計を統合した設計書を作成する

**実行手順**:

1. timeout設計とエラーコード設計を統合
2. 既存GraphSearchStrategyのデータフローに反映
3. 影響範囲（API/テスト/ドキュメント）を明記
4. `outputs/phase-2/design-document.md` を作成

**期待される成果物**:

- `outputs/phase-2/design-document.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| GraphSearchStrategy仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | GraphSearchOptions/インターフェース仕様 |
| Knowledge Graph Store仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | GraphStoreインターフェースとエラー処理  |
| Embedding API仕様         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`               | 埋め込み生成のタイムアウト設定          |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系と分類                  |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | 検索パイプライン全体像                  |

**前Phase成果物**

| 参照資料     | パス                                         | 内容     |
| ------------ | -------------------------------------------- | -------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否基準 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲 |

---

## 成果物

| 成果物           | パス                                   | 内容             |
| ---------------- | -------------------------------------- | ---------------- |
| タイムアウト設計 | `outputs/phase-2/timeout-design.md`    | timeoutMs設計    |
| エラーコード設計 | `outputs/phase-2/error-code-design.md` | エラーコード設計 |
| 設計ドキュメント | `outputs/phase-2/design-document.md`   | 統合設計書       |

---

## 統合テスト連携（Phase 1〜11は必須）

- GraphSearchタイムアウト時のHybridRAG挙動を設計書に明記
- エラーコードが統合ログに伝播する設計を明記

---

## 完了条件

- [ ] timeoutMs設計が確定している
- [ ] エラーコード設計が既存仕様と整合している
- [ ] 設計ドキュメントが作成されている
- [ ] 参照仕様との整合が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 2
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 1（要件定義）の完了
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-3-design-review.md`
