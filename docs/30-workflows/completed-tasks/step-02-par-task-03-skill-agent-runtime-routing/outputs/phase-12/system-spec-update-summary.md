# System Spec Update Summary

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                  |
| タイトル   | Skill / Agent / Skill Creator の runtime ルーティング統一 |
| Phase      | 12                                                        |
| 作成日     | 2026-03-14                                                |
| ステータス | completed                                                 |

## Step 1-A: 完了タスク記録

- Phase 11 の実画面証跡を取得し、`manual-test-result.md` を TC-ID/証跡列つきに更新。
- Phase 12 成果物を「設計専用」前提から、実装実体あり前提へ再同期。
- 新規未タスクを formalize（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）。

## Step 1-B: 実装状況テーブル

| 項目                                                   | 状態        | 根拠                                                        |
| ------------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| RuntimePolicyResolver / Builder / Facade 追加          | completed   | `apps/desktop/src/main/services/runtime/*`                  |
| SkillExecutor / AgentExecutor の RuntimeDecision受け口 | completed   | `SkillExecutor.ts`, `AgentExecutor.ts`                      |
| Main IPC で runtime resolver 配線                      | **pending** | `skillHandlers.ts`, `agentHandlers.ts` に resolver 起点なし |
| Creator runtime チャネル公開                           | **pending** | `creatorHandlers.ts` は新規作成済みだが登録/Preload未配線   |
| Handoff UI 接続                                        | **pending** | `TerminalHandoffCard` は未使用                              |

## Step 1-C: 関連タスク同期

| 区分           | タスクID                                                   | 状態    |
| -------------- | ---------------------------------------------------------- | ------- |
| 新規 formalize | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 | pending |
| 既存 follow-up | UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001                 | pending |

## Step 2: システム仕様更新要否判定（実施結果）

### 今回更新した仕様書

| 仕様書                                                   | 更新内容                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| `references/workflow-ai-runtime-authmode-unification.md` | task03 再監査結果、Phase 11 実証跡、新規未タスク導線を追記 |
| `references/task-workflow-backlog.md`                    | 新規未タスク 1件を追加                                     |
| `references/task-workflow-history.md`                    | 2026-03-14 の同期履歴を追加                                |
| `references/lessons-learned-current.md`                  | 今回の苦戦箇所と再発防止手順を追記                         |

### 今回は未更新（理由付き）

| 仕様書                                        | 理由                                                  |
| --------------------------------------------- | ----------------------------------------------------- |
| `references/api-ipc-system.md`                | まだ runtime 配線が未完了で最終契約を確定できないため |
| `references/interfaces-agent-sdk-executor.md` | 上記と同理由。実装閉包後に反映する                    |
| `references/ui-ux-agent-execution.md`         | handoff card の実接続が未完了で、UI確定記述に時期尚早 |

## Canonical / Mirror

- canonical: `.claude/skills/aiworkflow-requirements/`
- mirror: `.agents/skills/aiworkflow-requirements/`
- 同期確認: `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`（差分なしを確認）

## 追加検証（再確認）

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                         | 結果                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `verify-unassigned-links --root docs/30-workflows`                                                                                                                                                                                                                                                                                                                                                                               | PASS（223/223）                                                        |
| `audit-unassigned-tasks --json --diff-from HEAD --unassigned-dir docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task --completed-unassigned-dir docs/30-workflows/completed-tasks/unassigned-task --target-file docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task/task-imp-skill-agent-runtime-routing-integration-closure-001.md` | `scope.currentFiles=1`, `currentViolations=0`, `baselineViolations=38` |

## 今回苦戦した箇所（再利用向け）

1. `audit-unassigned-tasks --json` の出力が大きく、標準出力のままでは JSON 解析に失敗しやすい。
2. 対象未タスクの合否を全体監査で代用すると誤判定になる。
3. `validate-phase-output` は `<workflowPath> --phase 12` の引数順が必要で、`--workflow` 指定は失敗する。

### 簡潔な解決法

- `audit` は `> /tmp/*.json` へ保存してから `scope.currentFiles` / `currentViolations` を検証する。
- 合否判定は `--target-file`（対象）と `--diff-from HEAD`（全体）を分けて記録する。
- validator 実行前に `--help` で引数順を固定する。

## 付記

本タスクは「実装あり・配線未完了」の状態であるため、Phase 12 の同期は完了したが、機能完了判定は follow-up 未タスクの完了を前提とする。
