# Phase 1: drift baseline 実測

> 観測日時: 2026-04-19
> 観測コマンド: `diff -q <dir>/artifacts.json <dir>/outputs/artifacts.json`
> 方針: **観測のみ。遡及修正は AC-7 により本タスク範囲外。**

## サマリー

| 範囲                                         | 対象ディレクトリ数 | drift 件数 |
| -------------------------------------------- | ------------------ | ---------- |
| `docs/30-workflows/` 直下（進行中 workflow） | 1 drift            | 1          |
| `docs/30-workflows/completed-tasks/` 配下    | 28 drift           | 28         |
| **合計**                                     |                    | **29**     |

## 進行中 workflow の drift（1 件）

| #   | workflow                                 | 状態                                                       |
| --- | ---------------------------------------- | ---------------------------------------------------------- |
| 1   | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` | root `artifacts.json` と `outputs/artifacts.json` が不一致 |

## 完了済み workflow の drift（28 件）

| #   | workflow                                                           |
| --- | ------------------------------------------------------------------ |
| 1   | `agent-007-environment-backend`                                    |
| 2   | `claude-code-cli-integration`                                      |
| 3   | `conflict-prevent-skills-001`                                      |
| 4   | `fix-step2-seq-auth-login-ipc-nonblocking`                         |
| 5   | `fix-step3-seq-execute-plan-nonblocking`                           |
| 6   | `fix-step5-seq-lifecycle-panel-error`                              |
| 7   | `p02-seq-CANCEL-002`                                               |
| 8   | `step-02-par-task-02-skillcenter-create-route`                     |
| 9   | `step-05-par-task-07-chatpanel-review-harness-alignment`           |
| 10  | `step-06-seq-task-08-session-persistence-and-resume-contract`      |
| 11  | `step-08-par-task-rt-04-api-key-management-ui`                     |
| 12  | `step-08-par-task-rt-06-claude-sdk-message-contract-normalization` |
| 13  | `step-09-par-task-p0-01-verify-execution-engine-layer12`           |
| 14  | `step-09-par-task-p0-06-conversational-interview-ui`               |
| 15  | `step-task-sdk-04-u1-submit-user-input-phase-transition`           |
| 16  | `task-050-ui-00-ui-design-foundation`                              |
| 17  | `task-056c-notification-history-domain`                            |
| 18  | `TASK-7A-skill-selector`                                           |
| 19  | `TASK-FIX-SAFEINVOKE-TIMEOUT-001`                                  |
| 20  | `task-refs-500line-split-maintenance-001`                          |
| 21  | `task-rt-01-llm-adapter-error-propagation`                         |
| 22  | `task-rt-02-api-key-ui-adapter-status`                             |
| 23  | `task-sc-13-verify-channel-implementation`                         |
| 24  | `UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001`                      |
| 25  | `UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001`                 |
| 26  | `UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001`                         |
| 27  | `UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001`                       |
| 28  | `ut-type-skill-identifier-branded-001`                             |
| 29  | `ut-uiux-playwright-e2e-001`                                       |

> 注: 上記 29 件はすべて **本タスクで修正しない**。parity guard 導入後に別タスクとして遡及修正方針を決定する。

## 観測ロジック再現手順

```bash
for dir in docs/30-workflows/*/ docs/30-workflows/completed-tasks/*/; do
  if [ -f "$dir/artifacts.json" ] && [ -f "$dir/outputs/artifacts.json" ]; then
    diff -q "$dir/artifacts.json" "$dir/outputs/artifacts.json" >/dev/null 2>&1 \
      || echo "DRIFT: $(basename $dir)"
  fi
done
```

## Phase 6 TC-E-12 との対比

Phase 6 TC-E-12 は本 baseline を基準に「既存 drift が観測範囲から増減していない」ことを回帰確認する。件数の増加 = 本タスクが遡及修正を起こした事実、件数の減少 = 別タスクで修正された結果であり、どちらも本タスクで許容される状態変化ではない。
