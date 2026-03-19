# Phase 10 MINOR 指摘一覧 — 未タスク仕様書変換リスト

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| Phase        | 10（最終レビュー）                               |
| 作成日       | 2026-03-19                                       |
| レビュー判定 | MINOR                                            |

---

## MINOR 指摘一覧

計 8件（Phase 3 継続 6件 + Phase 10 新規 2件）

### Phase 3 継続 MINOR（M-01〜M-06）

| ID     | 優先度 | 指摘内容                                                                                          | 未タスク種別       | 後続タスク候補                   |
| ------ | ------ | ------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------- |
| P3-M01 | LOW    | contract-matrix.md § 7.3 CommunitySummarizer postconditions に修正前状態（warn のみ）が残存       | spec sync タスク   | Phase 12 spec sync               |
| P3-M02 | MEDIUM | AI_INDEX 排他制御の実装層（IPC / Service / DB）が未定義                                           | 実装設計タスク     | AI_INDEX 実装タスク（U-02 後続） |
| P3-M03 | LOW    | AI_INDEX 失敗時の guidance message が汎用のみ（失敗原因別未定義）                                 | 実装設計タスク     | AI_INDEX 実装タスク（U-02 後続） |
| P3-M04 | MEDIUM | HybridRAGFactory postconditions に目標状態（HybridRAGEngine を返す）が未記載                      | spec sync タスク   | Phase 12 spec sync               |
| P3-M05 | LOW    | RelevanceEvaluator postconditions が「score=5 で継続」と記載され SF-07 修正判定と矛盾             | 設計実装乖離タスク | Phase 12 spec sync + 実装確認    |
| P3-M06 | MEDIUM | Main Process の DI 組み立て責務（EmbeddingService / HybridRAGFactory への注入タイミング）が未定義 | 実装設計タスク     | AI_INDEX 実装タスク（U-02 後続） |

### Phase 10 新規 MINOR（P10-M01〜P10-M02）

| ID      | 優先度 | 指摘内容                                                                                                                                              | 未タスク種別     | 後続タスク候補           |
| ------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------ |
| P10-M01 | MEDIUM | aiHandlers.ts のカバレッジが Stmts/Lines/Funcs で基準未達（44.72% / 33.33%）。SCF（Structural Coverage Fallback）で進行しているが、テスト拡充が未実施 | テスト拡充タスク | Task-08 補完テストタスク |
| P10-M02 | MEDIUM | SF-07（RelevanceEvaluator）の Phase 2 設計目標（Error throw）と Phase 5 実装（score=5 + warn ログ）の乖離が解消されていない                           | 実装修正タスク   | 後続 CRAG 実装タスク     |

---

## 未タスク仕様書変換計画

### グループ A: Phase 12 spec sync 対象（設計文書更新）

対象 MINOR: P3-M01, P3-M04, P3-M05

**タスク仕様書作成先**: `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/`

| ファイル名                                               | 内容                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `TASK-SPEC-UPDATE-CONTRACT-MATRIX-POSTCONDITIONS-001.md` | P3-M01/P3-M04/P3-M05 の postconditions 3件を一括修正 |

**更新対象**: `contract-matrix.md § 7.3`（CommunitySummarizer / HybridRAGFactory / RelevanceEvaluator の postconditions）

---

### グループ B: AI_INDEX 実装タスク向け設計インプット

対象 MINOR: P3-M02, P3-M03, P3-M06

**タスク仕様書作成先**: `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/`

| ファイル名                                              | 内容                                                |
| ------------------------------------------------------- | --------------------------------------------------- |
| `TASK-DESIGN-AI-INDEX-EXCLUSIVE-CONTROL-001.md`         | P3-M02: 排他制御実装層の設計                        |
| `TASK-DESIGN-AI-INDEX-GUIDANCE-MESSAGE-TEMPLATE-001.md` | P3-M03: 失敗原因別 guidance message template の設計 |
| `TASK-DESIGN-AI-INDEX-DI-ASSEMBLY-001.md`               | P3-M06: Main Process DI 組み立て責務の設計          |

---

### グループ C: テスト・実装補完タスク

対象 MINOR: P10-M01, P10-M02

**タスク仕様書作成先**: `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/`

| ファイル名                                          | 内容                                              |
| --------------------------------------------------- | ------------------------------------------------- |
| `TASK-TEST-AI-HANDLERS-COVERAGE-IMPROVEMENT-001.md` | P10-M01: aiHandlers.ts カバレッジ改善（SCF 解消） |
| `TASK-IMPL-RELEVANCE-EVALUATOR-SF07-FIX-001.md`     | P10-M02: SF-07 修正（score=5 → Error throw 実装） |

---

## 未タスク件数集計

| カテゴリ            | 件数  |
| ------------------- | ----- |
| Phase 3 継続 MINOR  | 6     |
| Phase 10 新規 MINOR | 2     |
| **合計**            | **8** |

---

## 注記

- 全 8 件は「機能影響なし」の範囲に留まる
- Phase 5 変更範囲（guidance-only スタブ化）の実装品質には影響しない
- グループ A は Phase 12 spec sync と合わせて対応可能
- グループ B / C は後続の AI_INDEX 実装タスクおよび CRAG 実装タスクで対応
