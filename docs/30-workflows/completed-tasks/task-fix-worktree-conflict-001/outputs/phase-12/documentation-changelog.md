# ドキュメント変更ログ - TASK-FIX-WORKTREE-CONFLICT-001

## 変更ファイル一覧

### 設定ファイル変更

| ファイル                   | 変更内容                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| `.gitattributes`           | EVALS.json `merge=union→ours`、`SKILL-changelog.md merge=union` 追加 |
| `.github/workflows/ci.yml` | `.claude/**` / `.agents/**` paths-ignore 追加、`merge_group:` 追加   |

### 新規スクリプト

| ファイル                                       | 内容                             |
| ---------------------------------------------- | -------------------------------- |
| `.claude/hooks/post-merge-index-regenerate.sh` | indexes/\*.json 再生成フック     |
| `.claude/scripts/install-git-hooks.sh`         | git フックインストーラー（冪等） |

### 修正スクリプト

| ファイル                                                           | 変更内容                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `.claude/hooks/session-init.sh`                                    | post-merge フック自動インストールチェック追加                        |
| `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` | `--quiet` 対応、topic-map 表ヘッダ修正、keywords.json の生成時刻削除 |
| `~/.config/zsh/conf.d/73-git-worktree.zsh`                         | `_gwt_ensure_post_merge_hook()` 追加                                 |
| `~/.tmux.conf`                                                     | bind B pane 1 に `CLAUDE_SKIP_HEAVY_HOOKS=1` 追加                    |

### SKILL.md 分割（16ファイル変更 + 16ファイル新規）

| スキル                           | 変更                   | 新規                      |
| -------------------------------- | ---------------------- | ------------------------- |
| `.claude/skills/*/SKILL.md` (×8) | 変更履歴セクション削除 | `SKILL-changelog.md` (×8) |
| `.agents/skills/*/SKILL.md` (×8) | 変更履歴セクション削除 | `SKILL-changelog.md` (×8) |

### Phase 12 追加成果物

| ファイル                                                 | 変更内容                             |
| -------------------------------------------------------- | ------------------------------------ |
| `outputs/artifacts.json`                                 | root `artifacts.json` と parity 同期 |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜3 の更新結果を記録         |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果を記録               |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 の準拠確認を記録            |

### aiworkflow-requirements current-facts sync（canonical + mirror）

| ファイル群                                                                                     | 変更内容                                            |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                               | current facts の見出し追加                          |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                              | current facts に合わせて description/Trigger を更新 |
| `.claude/skills/aiworkflow-requirements/SKILL-changelog.md`                                    | 変更履歴を分離して追記                              |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                 | 2026-04 current index を更新                        |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`         | current facts を追記                                |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-recent-2026-04c.md` | current facts の completed ledger を更新            |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md`           | current facts の UI 参照を更新                      |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                  | `generate-index.js` 再生成                          |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                                 | `generate-index.js` 再生成                          |
| `.agents/skills/aiworkflow-requirements/*`                                                     | 上記 canonical を same-wave mirror sync             |
