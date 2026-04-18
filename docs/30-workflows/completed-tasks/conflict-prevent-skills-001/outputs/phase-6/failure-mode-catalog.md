# Phase 6 Output: 失敗モードカタログ

## FM-01: custom driver 未登録

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| 症状     | indexes/\*.md で merge conflict が発生する                          |
| 根本原因 | `git config merge.ours.driver true` が未実行                        |
| 検出     | session-init.sh の warn / `git config --get merge.ours.driver` が空 |
| 回復     | `bash .claude/scripts/setup-merge-drivers.sh`                       |

## FM-02: regenerate 忘れ

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 症状     | merge 後に topic-map.md が stale（新ファイルが未反映）                  |
| 根本原因 | post-merge regenerate を手動で行わなかった                              |
| 検出     | `git diff indexes/` に未コミット変更が残る                              |
| 回復     | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` |

## FM-03: hook 未インストール

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 症状     | post-merge フックが走らず regenerate が自動実行されない |
| 根本原因 | `.claude/scripts/install-git-hooks.sh` が未実行         |
| 検出     | `.git/hooks/post-merge` が存在しない                    |
| 回復     | `bash .claude/scripts/install-git-hooks.sh`             |

## FM-04: mirror 乖離の蓄積

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 症状     | `.agents/skills/` が `.claude/skills/` と大きく乖離する |
| 根本原因 | canonical 更新を mirror へ手動 sync しなかった          |
| 検出     | `diff -qr .claude/skills .agents/skills` で多数の差分   |
| 回復     | 各スキルの変更差分を確認して mirror へ反映（follow-up） |

## FM-05: union merge による JSON 破損

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 症状     | `keywords.json` が invalid JSON になる                    |
| 根本原因 | JSON ファイルに `merge=union` を誤適用                    |
| 検出     | `node -e "JSON.parse(...)"` がエラー                      |
| 回復     | `merge=ours` に修正後、keep-ours で再 merge し regenerate |
| 備考     | 本 task で `indexes/*.json merge=ours` に修正済み         |
