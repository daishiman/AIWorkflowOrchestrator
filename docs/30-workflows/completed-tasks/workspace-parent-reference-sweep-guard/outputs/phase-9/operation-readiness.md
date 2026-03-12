# Operation Readiness

## 運用手順

| 手順 | コマンド / 操作                                                                                                | 完了条件               |
| ---- | -------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | `.claude` 正本を修正                                                                                           | 更新対象ファイルが確定 |
| 2    | 必要なら `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                               | indexes が最新化       |
| 3    | `rsync -a --checksum --delete .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/` | mirror 同期            |
| 4    | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                       | 差分 0                 |
| 5    | `node scripts/validate-workspace-parent-reference-sweep.mjs --json`                                            | 3 drift class が 0     |
| 6    | 必要に応じて `pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs`       | fixture test PASS      |

## 障害時の切り分け

| 症状               | 原因候補                                                 | 初動                                                         |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| `path-drift > 0`   | pointer / spec / capture の旧 path 残存                  | findings の `file` と `actual` を見て `.claude` 正本から修正 |
| `status-drift > 0` | pointer docs / legacy index に `pending` / `未着手` 残存 | docs 側の status 行を更新                                    |
| `mirror-drift > 0` | rsync 漏れ、または `.agents` 直接編集                    | `.claude` を正本にして rsync をやり直す                      |

## 運用可否

本ガードは docs-only parent workflow の再監査に投入可能。PR/commit は未実施で、Phase 13 はユーザー指示待ちとする。
