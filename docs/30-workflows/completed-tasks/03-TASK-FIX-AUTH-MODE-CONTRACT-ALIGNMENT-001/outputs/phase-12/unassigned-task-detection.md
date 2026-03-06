# Phase 12 未タスク検出レポート

## 実行結果サマリー

| チェック                                                                                                                                                                                         | 結果                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `detect-unassigned-tasks --scan apps/desktop/src`                                                                                                                                                | `20 findings`                                                                                                                                                                                                                                                 |
| `detect-unassigned-tasks --scan packages/shared/src`                                                                                                                                             | `7 findings`                                                                                                                                                                                                                                                  |
| スキル / システム仕様書の漏れ再監査                                                                                                                                                              | blocking 未タスク 0件、改善バックログ 1件（`UT-IMP-PHASE12-UNASSIGNED-LINK-DIAGNOSTICS-001`）、即時更新 6件（`ipc-contract-checklist.md`, `quick-reference.md`, `phase-11-12-guide.md`, `spec-update-workflow.md`, `task-workflow.md`, `lessons-learned.md`） |
| `verify-unassigned-links --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                            | `ALL_LINKS_EXIST (105/105)`                                                                                                                                                                                                                                   |
| `audit-unassigned-tasks --json --diff-from HEAD`                                                                                                                                                 | `currentViolations=0`, `baselineViolations=93`                                                                                                                                                                                                                |
| `audit-unassigned-tasks --json --target-file docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/unassigned-task/task-imp-phase12-unassigned-link-diagnostics-001.md` | `currentViolations=0`                                                                                                                                                                                                                                         |

## 判定

- 今回差分から blocking に起票すべき未タスクは **0件**
- 再利用性向上のための改善バックログを **1件** 追加した
- raw detect で見つかった `27 findings` は、既存コードベースに残っていた TODO / XXX / perf メモであり、本タスク差分で新しく持ち込んだものではない

## 精査メモ

### desktop 側

- `apps/desktop/src/main/services/auth/AuthModeService.ts` の TODO 3件は既存 stub provider の残課題
- それ以外も community / AI / chat edit / integration test 系の既存 TODO が中心
- auth-mode 契約整合作業で新規 TODO を追加したファイルはなし

### shared 側

- `packages/shared/src` の 7件は検索・グラフ・DB周辺の既存 TODO
- 今回変更した `packages/shared/src/types/auth-mode.ts` には新規 TODO を追加していない

### スキル / 仕様書側

- ユーザー懸念どおり、再監査で「コード本体ではなく導線ドキュメントの補強余地」が見つかった
- その大半は未タスク化よりも **即時反映のほうが適切** な粒度だったため、以下をこのターンで直接更新した
  - `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
  - `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
  - `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
  - `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- ただし、`verify-unassigned-links` が「参照先は `unassigned-task/` なのに実体が別配置」というケースを即時説明できず、原因特定に数手かかった点は再利用価値があるため、改善バックログとして以下を起票した
  - `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/unassigned-task/task-imp-phase12-unassigned-link-diagnostics-001.md`

## リンク監査の補足

- `verify-unassigned-links` 初回失敗要因:
  - `references/task-workflow.md` は `docs/30-workflows/unassigned-task/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` を参照
  - 実ファイルだけ `docs/30-workflows/completed-tasks/` 側へずれていた
- 対応:
  - 既存参照の正本に合わせてファイルを `unassigned-task/` へ戻した
  - これは今回差分の新規未タスク作成ではなく、既存リンク不整合の修復

## `--target-file` 監査

- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/unassigned-task/task-imp-phase12-unassigned-link-diagnostics-001.md` に対して実行し、`currentViolations=0` を確認した
- これにより、新規 backlog がフォーマット・配置・必須見出しの条件を満たすことを確認した

## 結論

- Task 12-4: 完了
- 0件でも成果物出力必須という仕様を満たしつつ、再利用価値のある改善バックログ 1 件を formalize した
