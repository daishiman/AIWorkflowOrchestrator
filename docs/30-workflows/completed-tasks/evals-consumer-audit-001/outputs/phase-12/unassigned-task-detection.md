# Phase 12 Task 4: 未タスク検出レポート

## メタ情報

| 項目                         | 内容                          |
| ---------------------------- | ----------------------------- |
| task_id                      | TASK-EVALS-CONSUMER-AUDIT-001 |
| phase                        | 12                            |
| task_number                  | Task 12-4                     |
| 生成日時                     | 2026-04-19                    |
| 対応 AC                      | AC-7 / FR-9                   |
| 新規 unassigned ファイル作成 | **7 件作成済み**              |

## 1. サマリ

| 観点             |  件数 |
| ---------------- | ----: |
| raw 候補         |    10 |
| 重複解消後       |     7 |
| 高優先度         |     2 |
| 中優先度         |     4 |
| 低優先度         |     1 |
| 実ファイル化済み | 7 / 7 |

結論:

- 7 件を `docs/30-workflows/unassigned-task/` 配下へ起票した
- AC-7 は「記録先提示」と「起票実体あり」の両方で充足
- AC-6 解除判定自体への影響はない

## 2. 確定未タスク一覧

| 優先度 | タスクID                                                 | ファイル                                                                                   |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 高     | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001          | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`           |
| 高     | UNASSIGNED-EVALS-VALIDATOR-GUARD-001                     | `docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md` |
| 中     | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001         | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`          |
| 中     | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001      | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md`       |
| 中     | UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001        | `docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`         |
| 中     | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001      | `docs/30-workflows/unassigned-task/task-skill-scanner-evals-content-validate-001.md`       |
| 低     | UNASSIGNED-EVALS-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001 | `docs/30-workflows/unassigned-task/task-mirror-resource-map-cross-root-link-001.md`        |

## 3. 根拠ソース

| ソース                                      | 内容                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `outputs/phase-5/consumer-audit-report.md`  | schema 方言分裂 / cross-root link / scanner validate / validator 不在 |
| `outputs/phase-9/spec-alignment-report.md`  | 正本未反映 3 件                                                       |
| `outputs/phase-11/discovered-issues.md`     | Phase 11 新規 blocker 0 件の確認                                      |
| `outputs/phase-12/skill-feedback-report.md` | スキル改善提案の補助根拠                                              |

## 4. 依存関係

```text
task-evals-spec-snake-case-v1-document-001
  -> task-evals-schema-dialect-unification-001
    -> task-skill-fixture-runner-evals-schema-validate-001
      -> task-skill-scanner-evals-content-validate-001

task-evals-spec-quality-insights-document-001 は独立
task-evals-spec-validator-zero-document-001 は validator guard と連携
task-mirror-resource-map-cross-root-link-001 は独立
```

## 5. 健全性確認

| 確認項目                                             | 結果 |
| ---------------------------------------------------- | ---- |
| 7 件すべて `docs/30-workflows/unassigned-task/` 配下 | PASS |
| 既存ファイルとの衝突なし                             | PASS |
| close-out 文書から参照可能                           | PASS |

## 6. 結論

- 本 workflow で検出した重大な follow-up は未タスクとして閉じた
- `追加候補` のような保留クラスタは残していない
- 以後は各 unassigned task を個別に実行すればよい

---

## 7. 後続 wave による完了化ログ（2026-04-19 追記）

phase-12 成果物自体は不変扱いだが、後続 wave で一部未タスクが完了化したため、完了化履歴を以下に追記する（§2 の 7 件リストは作成時点の記録として保持）。

### TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE（2026-04-19 完了）

`system-spec-update-summary.md` の 3 件の UPDATE-SPEC 提案が aiworkflow-requirements skill に反映され、対応する unassigned-task が完了化した。完了化ファイルは `docs/30-workflows/completed-tasks/` へ移動し、メタ情報で `status: completed` を明示した。

| 元ファイル                                         | 完了化後パス                                                                         | UPDATE-SPEC     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------- |
| `task-evals-spec-snake-case-v1-document-001.md`    | `docs/30-workflows/completed-tasks/task-evals-spec-snake-case-v1-document-001.md`    | UPDATE-SPEC-001 |
| `task-evals-spec-quality-insights-document-001.md` | `docs/30-workflows/completed-tasks/task-evals-spec-quality-insights-document-001.md` | UPDATE-SPEC-002 |
| `task-evals-spec-validator-zero-document-001.md`   | `docs/30-workflows/completed-tasks/task-evals-spec-validator-zero-document-001.md`   | UPDATE-SPEC-003 |

**保持（対象外）4 件**: `task-evals-schema-dialect-unification-001` / `task-mirror-resource-map-cross-root-link-001` / `task-skill-fixture-runner-evals-schema-validate-001` / `task-skill-scanner-evals-content-validate-001` は `docs/30-workflows/unassigned-task/` 配下に残置。

**状態管理ポリシー**: phase-12 は不変、unassigned-task/ 側（または移動先の completed-tasks/）のファイル内メタ情報と `unassigned-task/README.md` の完了化ログで状態を管理する。
