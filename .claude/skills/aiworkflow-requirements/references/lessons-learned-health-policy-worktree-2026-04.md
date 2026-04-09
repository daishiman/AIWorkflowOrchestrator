# Lessons Learned: HealthPolicy 移管 / Worktree コンフリクト解消（2026-04）

> 分離元: [lessons-learned-current-2026-04.md](lessons-learned-current-2026-04.md)

---

## UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 shared policy 移管 教訓（2026-04-08）

### L-HP-001: async hook テストは renderHook 後に 1 ティック待つ

| 項目       | 内容                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `renderHook(() => useMainlineExecutionAccess())` 直後にアサートすると `act(...)` 警告が出る                                                                                   |
| 原因       | async state update が即座に反映されず、テストが非同期更新を待たない                                                                                                          |
| 解決策     | `await act(async () => { await new Promise(r => setTimeout(r, 0)); })` を renderHook 後に挟む、または flush helper を共通化する                                              |
| 再発防止   | async な hook テストは `renderAccessHook` のような flush 済み wrapper を用意し、個別テストで都度 act を書かない                                                              |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                      |

### L-HP-002: shared 側正本への純粋関数集約でフック責務が薄くなる

| 項目       | 内容                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | hook 内に独自の `apiKeyDegraded` 計算ロジックが重複し、同じ条件が別ファイルで異なる計算式になるリスクがあった                                                                  |
| 原因       | HealthPolicy の集約場所が shared になかったため、各 hook が独自に計算していた                                                                                                 |
| 解決策     | `resolveHealthPolicy()` を `packages/shared/src/types/health-policy.ts` に純粋関数として実装し、hook は呼び出すだけにする                                                    |
| 再発防止   | ドメインルールは shared 側に集約し、hook 側は UI 状態のマッピングだけを持つ。重複計算は将来的な不整合の温床になるため early に集約する                                        |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                       |

### L-HP-003: Phase 12 成果物の canonical ファイル名は task 開始時に確定する

| 項目       | 内容                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `outputs/phase-12/` に前タスクの draft と今回の canonical が混在し、どちらが正本か判断に迷った                                                                                |
| 原因       | Phase 12 着手前にファイル名の canonical set を確定していなかった                                                                                                              |
| 解決策     | Phase 12 着手時に `outputs/phase-12/` の既存ファイルを棚卸しし、今回出力する canonical 名（`implementation-guide.md` / `system-spec-update.md` / `documentation-changelog.md` / `untasked-detection-report.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md`）を先に決める |
| 再発防止   | Phase 12 着手時の初手チェックとして「`outputs/phase-12/` の canonical ファイル名の確定」を明示する。`index.md` と `artifacts.json` の status 同期も同一 wave で行う           |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                       |

---

## TASK-FIX-WORKTREE-CONFLICT-001: 並列 worktree コンフリクト解消

### L-WC-001: merge 戦略はファイルの「情報の性質」で決める

| 項目 | 内容 |
|------|------|
| 症状 | 50〜60本の並列 worktree ブランチが `.claude/skills/` 配下を更新するとマージコンフリクットが頻発 |
| 原因 | 追記型テキスト（LOGS.md）・JSON 構造体（EVALS.json）・自動生成ファイル（indexes/*.json）・静的仕様（SKILL.md）が同じ merge 戦略で扱われていた |
| 解決策 | 追記型 → `merge=union`、JSON 構造・自動生成 → `merge=ours` + post-merge 再生成、静的仕様 → 変更履歴を別ファイルに分離して `merge=union` |
| 再発防止 | 新しいファイルを `.gitattributes` に追加する際は「追記型か・構造化データか・自動生成か・静的仕様か」を最初に判断する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001 |

### L-WC-002: シェルスクリプトの外部コマンドは `command -v` で存在確認する

| 項目 | 内容 |
|------|------|
| 症状 | `set -euo pipefail` 環境で `node: command not found` → 終了コード 127 でフックが失敗 |
| 原因 | `[ -f "$SCRIPT" ]` でスクリプト存在確認はしていたが、`node` コマンド自体の存在確認がなかった |
| 解決策 | `command -v node > /dev/null 2>&1 &&` を条件に追加し、node 不在時は正常終了 |
| 再発防止 | `set -euo pipefail` 環境では外部コマンドの呼び出し前に必ず `command -v <cmd>` で存在確認する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001 |

### L-WC-003: husky を使うプロジェクトでは git フックパスが `.husky/_/` になる

| 項目 | 内容 |
|------|------|
| 症状 | `git rev-parse --git-path hooks/post-merge` が `.git/hooks/post-merge` ではなく `.husky/_/post-merge` を返す |
| 原因 | プロジェクトが husky を使用しており、`core.hooksPath=.husky/_` が設定されている |
| 解決策 | `git rev-parse --git-path hooks/post-merge` の返り値をそのままインストール先として使う（パスを決め打ちしない） |
| 再発防止 | フックのインストール先は常に `git rev-parse --git-path hooks/<hook-name>` で動的に解決する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001 |
