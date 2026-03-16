# システム仕様書更新サマリー

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 12 Task 12-2            |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| 作成日   | 2026-03-16              |
| 互換名   | spec-update-summary.md  |

---

## Step 0: 抽出した仕様群

| 区分             | 対象                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 仕様インデックス | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/topic-map.md`                                                                        |
| 契約/状態        | `references/interfaces-agent-sdk-skill.md`, `references/interfaces-agent-sdk-history.md`, `references/arch-state-management.md`                        |
| workflow 依存    | `references/workflow-skill-lifecycle-created-skill-usage-journey.md`, `references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                 |
| 台帳/教訓        | `references/task-workflow.md`, `references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`, `references/lessons-learned-current.md` |

---

## Step 1: 実施した更新（実ファイル）

### 1-A. Task07 workflow 成果物の是正

| ファイル                                         | 変更内容                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `phase-11-manual-test.md`                        | TC-ID 定義、画面カバレッジマトリクス、実施済みステータスを追加                         |
| `outputs/phase-11/manual-test-checklist.md`      | 新規作成（TC 3件）                                                                     |
| `outputs/phase-11/manual-test-result.md`         | 新規作成（証跡テーブル + PNG参照）                                                     |
| `outputs/phase-11/manual-test-report.md`         | 実績ベースへ再作成（fallback capture 記録）                                            |
| `outputs/phase-11/screenshot-plan.json`          | 新規作成（fallback 証跡ソース明示）                                                    |
| `outputs/phase-11/screenshots/*.png`             | `TC-11-01..03` と `TC-11-00-review-board` を配置                                       |
| `outputs/phase-12/implementation-guide.md`       | `## Part 1/2` への修正、使用例/エッジケース/設定項目等を追記、イベント名ドリフトを是正 |
| `outputs/phase-12/system-spec-update-summary.md` | 計画文を廃止し実績ログへ差し替え                                                       |

### 1-B. system spec 本体の同期

| ファイル                                                                                                              | 変更内容                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`                                   | Task07 イベント分類を現行 18イベントへ修正（`score_updated`, `version_bumped`, `feedback_applied` など） |
| `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`               | Task04→Task07 連携イベント名を `skill:score_updated` へ是正                                              |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                  | Task07 台帳導線の重複行を整理し、completed 説明へ統合                                                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` | Task07 のカテゴリ内訳（execution4/improvement3）修正、再監査検証証跡を追記                               |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                      | Task07 向け逆引き導線を追加                                                                              |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                   | Task07 の検索キーワード/読む順番を追加                                                                   |

---

## Step 2: 検証結果

| 検証            | コマンド                                                                                                 | 結果                                 |
| --------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| workflow 構造   | `verify-all-specs.js --workflow .../step-05-par-task-07-lifecycle-history-feedback --strict`             | PASS（13/13）                        |
| Phase 出力      | `validate-phase-output.js .../step-05-par-task-07-lifecycle-history-feedback`                            | PASS（28項目）                       |
| Phase 11 証跡   | `validate-phase11-screenshot-coverage.js --workflow .../step-05-par-task-07-lifecycle-history-feedback`  | PASS（expected TC=3 / covered TC=3） |
| Phase 12 ガイド | `validate-phase12-implementation-guide.js --workflow .../step-05-par-task-07-lifecycle-history-feedback` | PASS（10/10）                        |
| 未タスクリンク  | `verify-unassigned-links.js`                                                                             | PASS（ALL_LINKS_EXIST）              |

---

## 画面検証メモ

- `apps/desktop/scripts/capture-task-skill-lifecycle-04-phase11.mjs` は `esbuild` platform mismatch（darwin-arm64/x64）で起動失敗。
- fallback として `apps/desktop/scripts/capture-task-skill-lifecycle-05-review-board.mjs` を再実行し、review board を 2026-03-16 に再撮影。
- 代表画面を current workflow の `outputs/phase-11/screenshots/` へ再集約し、TC 単位で証跡化。

---

_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 12 Task 12-2_
