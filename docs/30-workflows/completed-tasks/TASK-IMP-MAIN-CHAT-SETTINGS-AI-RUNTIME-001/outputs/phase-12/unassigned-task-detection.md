# Phase 12: 未タスク検出報告

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | unassigned-task-detection.md               |
| 作成日   | 2026-03-17                                 |

---

## 1. 検出方針

以下を対象に未タスクを抽出し、3ステップ（指示書作成 / backlog同期 / 参照同期）を実施した。

1. Phase 10 MINOR 指摘（MINOR-01〜03）
2. Phase 11 discovered issues（DI-0001〜0004）
3. 実装実体と文書実体の契約差分

---

## 2. 検出・formalize結果

| ID            | タイトル                                                | 優先度 | 発見元                         | 指示書                                                                              |
| ------------- | ------------------------------------------------------- | ------ | ------------------------------ | ----------------------------------------------------------------------------------- |
| UT-TASK06-001 | RAG state IPC チャンネル設計と仕様書整備                | 中     | Phase 10 MINOR-01 / DI-0002    | `docs/30-workflows/unassigned-task/UT-TASK06-001-rag-ipc-spec.md`                   |
| UT-TASK06-002 | apiKey.validate() デバウンス完全実装                    | 低     | Phase 10 MINOR-02 / DI-0003    | `docs/30-workflows/unassigned-task/UT-TASK06-002-api-key-debounce.md`               |
| UT-TASK06-003 | AccountSection header 統合完全実装                      | 低     | Phase 10 MINOR-03 / DI-0004    | `docs/30-workflows/unassigned-task/UT-TASK06-003-account-section-header.md`         |
| UT-TASK06-004 | AI_CHECK_CONNECTION legacy 整理と後方互換テスト         | 中     | GAP-02/DRIFT-4 / DI-0001       | `docs/30-workflows/unassigned-task/UT-TASK06-004-ai-check-connection-cleanup.md`    |
| UT-TASK06-005 | testing-component-patterns-advanced.md デッドリンク修正 | 低     | Phase 12 validate-structure.js | `docs/30-workflows/unassigned-task/UT-TASK06-005-dead-link-atoms-specs.md`          |
| UT-TASK06-006 | Phase 3 MINOR→未タスク自動追跡フロー整備                | 中     | Phase 12 skill-feedback T-01   | `docs/30-workflows/unassigned-task/UT-TASK06-006-minor-tracking-automation.md`      |
| UT-TASK06-007 | IPC 契約ドリフト自動検出スクリプト                      | 高     | Phase 12 skill-feedback T-02   | `docs/30-workflows/unassigned-task/UT-TASK06-007-ipc-contract-drift-auto-detect.md` |

---

## 3. 3ステップ実施ログ

### Step 1: 指示書作成

- 7件すべて `docs/30-workflows/unassigned-task/` に作成完了。
- UT-TASK06-001〜004: Phase 10/11 発見（初回wave）
- UT-TASK06-005〜007: Phase 12 system spec sync wave で追加検出

### Step 2: backlog同期

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に7件登録済み。

### Step 3: 関連仕様書参照同期

- `outputs/phase-11/discovered-issues.md` へ相互参照を追加。
- `outputs/phase-12/spec-update-summary.md` / `documentation-changelog.md` に formalize 実績を記録。
- `lessons-learned-current.md` に苦戦箇所を記録（各未タスクに関連する教訓を含む）。

---

## 4. 検出件数とステータス

| 総検出件数 | 3ステップ完了件数 | 未完了件数 |
| ---------- | ----------------- | ---------- |
| 7 件       | 7 件              | 0 件       |

判定: **Task 4（未タスク検出）は完了**。
