# System Spec Update Summary

## canonical root / mirror policy

| 区分                   | 正本（canonical）                                                                   | ミラー（mirror）                 |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| workflow spec          | `docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001/` | なし（workflow 自体は単一 root） |
| phase artifacts ledger | `artifacts.json`                                                                    | `outputs/artifacts.json`         |
| skills                 | `.claude/skills/**`                                                                 | `.agents/skills/**`              |

## same-wave 対象（close-out で同期した範囲）

| 区分                  | 対象                                                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| parent workflow local | `index.md`、`phase-*.md`、`artifacts.json`、`outputs/artifacts.json`、`outputs/phase-11/*`、`outputs/phase-12/*`、`outputs/phase-13/*`                                                                                             |
| task-workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` |
| logs / history        | `.claude/skills/aiworkflow-requirements/LOGS.md`、`.claude/skills/task-specification-creator/LOGS.md`、`.claude/skills/aiworkflow-requirements/SKILL.md`、`.claude/skills/task-specification-creator/SKILL.md`                     |
| navigation            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`（`generate-index.js` 再生成）                                                                                                                                        |
| verification          | `outputs/verification-report.md`                                                                                                                                                                                                   |

## Step 判定

| Step     | 判定 | note（実測）                                                                                                                                                         |
| -------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A | PASS | `task-workflow-completed.md` に completed record を追加し、`task-workflow.md` / `task-workflow-backlog.md` / LOGS x2 / SKILL history x2 / topic-map を同波で同期した |
| Step 1-B | PASS | backlog row を completed へ移し、`task-workflow.md` の backlog summary を current facts に合わせた                                                                   |
| Step 1-C | PASS | 関連タスク表の status を current facts へ更新し、`TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` を別タスクとして維持した                                   |
| Step 2   | N/A  | 変更は main 内部実装と Phase 12 docs の整備のみ（public interface / IPC / preload / shared type の追加・変更なし）                                                   |

## current canonical facts

- 実装差分は `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `verifyAndImproveLoop()` 内のみ
  - improve が `success:false` を返した場合に `notificationService?.notify("スキル作成失敗", errorMessage)` を追加
  - `recordImproveFailureSnapshot()` により `currentPhase: "improve"` を維持する（phase を巻き戻さない）
- public interface / IPC / preload / shared type の追加・変更はないため、Step 2 は N/A
- Phase 11 は `NON_VISUAL`（成果物: `manual-test-checklist.md`, `manual-test-result.md`, `discovered-issues.md`）
- `TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001` の close-out は completed ledger / backlog / logs / history / topic-map まで current facts に同期済み

## ledger parity（artifacts.json / outputs/artifacts.json）

- `diff -u artifacts.json outputs/artifacts.json`: 差分 0

## 更新した spec と理由

| spec                         | 理由                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `phase-12-documentation.md`  | Step 1-A〜1-C / Step 2 を current facts に合わせ、task-workflow / LOGS / SKILL / topic-map 同期を明記するため |
| `task-workflow.md`           | completed ledger への追記と backlog summary の縮約を index に反映するため                                     |
| `task-workflow-backlog.md`   | current open row を completed に移管し、残件を誤読させないため                                                |
| `task-workflow-completed.md` | 本タスクの completed record を追加し、Phase 13 blocked を含めて current facts を固定するため                  |
| `LOGS.md` x2                 | same-wave sync の監査証跡を残すため                                                                           |
| `SKILL.md` x2                | change history に close-out の知見を残すため                                                                  |
| `topic-map.md`               | 追加した見出しの navigation を再生成するため                                                                  |

## 検証（workflow-local）

| コマンド                                                                                                                                                                                             | 結果                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`                                   | PASS（0エラー / 0警告）       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 --json` | PASS（10/10 checks OK）       |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`                             | PASS（Phase 1-13 整合を確認） |
