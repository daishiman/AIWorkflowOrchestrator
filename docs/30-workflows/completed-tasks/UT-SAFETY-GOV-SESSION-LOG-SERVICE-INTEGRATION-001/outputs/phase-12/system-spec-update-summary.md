# Phase 12: System Spec Update Summary

## canonical root / mirror policy

- canonical root: `docs/30-workflows/completed-tasks/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001`
- mirror/output root: `docs/30-workflows/completed-tasks/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001/outputs/phase-12`
- `artifacts.json` と `outputs/artifacts.json` は同一内容に同期済み
- この branch では `.claude/skills` 配下の skill source も更新し、mirror まで同期する

## current facts

- `index.md` の root status は `spec_created` に統一されている
- `index.md` の task breakdown は `T-01` を `未着手`、`T-13` を `blocked` としている
- `phase-1-requirements.md` / `phase-2-design.md` / `phase-3-design-review.md` の完了チェックは false-green を避けるため `unchecked` に是正済み
- `phase-4-test-creation.md` から `outputs/phase-4/test-plan.md` への導線がある
- `phase-12-documentation.md` は Task 12-1〜12-6 の分担と current contract / target delta / no-op 判定を集約している
- `artifacts.json` は `title` / `type` / `status` を `Advanced Console 実セッションログ接続` / `improvement` / `spec_created` に正規化している
- `apps/desktop/src/main/claude-cli/index.ts` は `getClaudeCliManager()` を barrel export している
- `apps/desktop/src/main/ipc/index.ts` は Advanced Console の callback を `getClaudeCliManager()` 経由で解決している
- `apps/desktop/src/main/ipc/index.ts` の Copy Command は `node + scriptPath + args` を返す
- `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` は failure path の message を `sanitizeForApiKeys()` で整えている
- `.claude/skills/aiworkflow-requirements/*` と `.claude/skills/task-specification-creator/*` は false no-op を除去して current facts に更新した

## Step 1-A: 正本台帳とログの確認

| Target                                                                         | 判定   | 理由                                                                    |
| ------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | update | 親 Safety Governance task の未タスク欄から本タスク解消を反映            |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | update | `UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001` の backlog 行を削除 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | update | 今回の spec sync 実績を追記                                             |
| `.claude/skills/task-specification-creator/LOGS.md`                            | update | Phase 12 hardening の反映実績を追記                                     |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                              | update | 変更履歴へ close-out sync を追記                                        |
| `.claude/skills/task-specification-creator/SKILL.md`                           | update | 変更履歴へ feedback 反映を追記                                          |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | update | `generate-index.js` で再生成                                            |
| `mirror parity`                                                                | PASS   | `.claude/skills/...` と `.agents/skills/...` を同期                     |

## Step 2: 正本仕様の確認

| Target                          | 判定   | 理由                                                                                  |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `api-ipc-system-core.md`        | update | manager DI / launch command fidelity / internal error mapping を current facts に追記 |
| `security-electron-ipc-core.md` | update | error path sanitize と外向き error code 境界を current facts に追記                   |
| `arch-claude-cli.md`            | update | `getClaudeCliManager()` と shared state owner の境界を current facts に追記           |
| `interfaces-agent-sdk.md`       | no-op  | `SESSION_NOT_FOUND` は既存 current facts に含まれる                                   |

## no-op / update 判定

### workflow pack

**update** - `index.md`、`phase-1-requirements.md`、`phase-2-design.md`、`phase-3-design-review.md`、`phase-7-coverage-check.md`、`phase-11-manual-test.md`、`artifacts.json`、`outputs/artifacts.json`、`phase-12-documentation.md` を current facts に合わせて整えた。

### skill source

**update** - `aiworkflow-requirements` には Advanced Console current facts と台帳同期を反映し、`task-specification-creator` には artifacts parity / spec_created false-green 防止を追記した。

### no-op target

`interfaces-agent-sdk.md` は `SESSION_NOT_FOUND` の current facts を既に保持しているため、今回は追加更新不要。
