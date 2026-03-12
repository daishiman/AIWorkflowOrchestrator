# Reproducibility Log

## 環境

| 項目     | 値                                                                                        |
| -------- | ----------------------------------------------------------------------------------------- |
| worktree | `task-20260312-144133-wt3-4`                                                              |
| 日付     | 2026-03-12                                                                                |
| shell    | `zsh`                                                                                     |
| root     | `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-144133-wt3-4` |

## 再現手順

1. `.claude` 側の正本を修正する。
2. aiworkflow indexes を再生成する場合のみ `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する。
3. `rsync -a --checksum --delete .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/` を実行する。
4. `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` を実行する。
5. `node scripts/validate-workspace-parent-reference-sweep.mjs --json` を実行する。
6. `pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` を実行する。

## 再現判定

| 項目                           | 判定 |
| ------------------------------ | ---- |
| 同じ drift summary が得られる  | PASS |
| mirror 差分 0 を再現できる     | PASS |
| fixture 失敗ケースを再現できる | PASS |
